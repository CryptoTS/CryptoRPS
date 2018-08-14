pragma solidity ^0.4.18;

import "./SafeMath.sol";


contract RPS{
	// Using OpenZeppelin's standard SafeMath for 256, 32, and 8 bit uints 
	using SafeMath for uint256;
	using SafeMath32 for uint32;
	using SafeMath8 for uint8;


	/** DATATYPES **/
	struct RPSMatch {
		address creator;	// Person who initiates RPS match
		address opponent;	// Person who ends up playing Creator's Match
		uint256 wager;		// Amount of money wagered by the creator
		int8 outcome;		// Outcome of RPSMatch; -2 if match was killed, -1 if creator won, 0 if match is not finished, 1 if opponent won
	}


	/** CONSTANTS **/


	/** Variables **/
	address public contractOwner;	// The initial and true contract owner
	address public contractAdmin;	// A secondary contract administrator, if needed
	bool private _isContractActive;	// Determines if the contract (and hence the RPS game/website) is active
	uint32 public activeMatchCounter;	// A counter for the number of active RPS matches
	uint8 public createCap;	// The max number of matches a single player can create at the same time
	uint8 public joinCap;	// The max number of matches a single player can join at the same time

	/** STORAGE **/
	RPSMatch[] public _matches;	// An array of all RPS matches, ongoing and completed
	//*** TODO change to private upon deployment

	// @dev A mapping of player addresses to the number of matches that player has either created or been an opponent in. Note, a created match that hasn't been played out IS counted 
	mapping(address => uint32) public playerToNumMatches; // Note on uint32: A player playing over 4 billion games is highly unlikely

	// @dev A mapping of player addresses to the number of ongoing matches that a player has created
	mapping(address => uint8) public playerToNumActiveCreates;	// Note on uint8: A player will NEVER been allowed to create 256+ concurrent, ongoing matches

	// @dev A mapping of player addresses to the number of ongoing matches that a player has joined
	mapping(address => uint8) public playerToNumActiveJoins;	// Note on uint8: A player will NEVER be allowed to join 256+ concorrent, ongoing matches

	/** EVENTS **/
	event MatchCreated(uint256 matchId, address creator, address opponent, uint256 wager, uint8 outcome);

	event MatchJoined(uint256 matchId, address opponent);

    event MatchKilled(uint256 matchId, address creator, uint256 creatorRefund, address opponent, uint256 opponentRefuned);

	/** MODIFIERS **/
	// @notice Determines if contract is active. In case the website needs to be killed, this will stop any functions from firing 
	modifier activeContract(){
		require(_isContractActive == true);
		_;
	}

	// @notice Determines if the function executer has contract owner privileges
	modifier isOwner(){
		require(msg.sender == contractOwner);
		_;
	}

	// @notice Determines if the function executer has contract admin privileges
	// @dev Owners have admin-level privileges by heirarchy
	modifier isAdmin(){
		require(msg.sender == contractOwner
			||	msg.sender == contractAdmin);
		_;
	}


	/** CONSTRUCTORS **/
	function RPS() public{
		contractOwner = msg.sender;
		contractAdmin = msg.sender;
		createCap = 1;
		joinCap = 1;
		_isContractActive = true;	// Initiallize the contract to be active
									// Maybe we shouldn't do this...? But instead manually?
		_matches.push(RPSMatch({	// Pre-populate _matches first match with an empty match
			creator: address(0),
			opponent: address(0),
			wager: 0 ether,
			outcome: -2
			}));
	}


	/** PUBLIC FUNCTIONS **/
	// @notice Creates an RPS match
	function createMatch() external payable activeContract(){
		require(playerToNumActiveCreates[msg.sender] < createCap);	// In order to be able to create this match, the player's ongoing creates must be below createCap

		RPSMatch memory _match = RPSMatch({	// Create a RPSMatch in memory
			creator: msg.sender,
			opponent: msg.sender,	// Initially set like this so worse-case scenario is creator sends money to themselves
			wager: msg.value,	// In Wei (1 Eth = 1000000000000000000 Wei)
			outcome: 0			// Game is undecided on creation
			});
		uint256 _matchId = _matches.push(_match) - 1;

		activeMatchCounter = activeMatchCounter.add(1);	// Increment the number of active RPS matches
		playerToNumMatches[_match.creator] = playerToNumMatches[_match.creator].add(1);	// Increment number of matches by this player
		playerToNumActiveCreates[_match.creator] = playerToNumActiveCreates[_match.creator].add(1);	// Increment number of active creates this player has

		emit MatchCreated(_matchId, _match.creator, _match.opponent, _match.wager, 0);	// Emit the MatchCreated event
	}

	// @notice Joins an RPS match
	function joinMatch(uint256 _matchId) external payable activeContract(){
		require(msg.value == _matches[_matchId].wager);	// Require the sent in value to be equal to the match wager for specified _matchId
		require(msg.sender != _matches[_matchId].creator);	// Require the sender to NOT be the creator (ie. you can't play against yourself)
		require(_matches[_matchId].outcome == 0);	// As a sanity check, ensure the match is also ongoing
		require(_matches[_matchId].creator == _matches[_matchId].opponent);	// As a sanity check, ensure the match has not been joined
		require(playerToNumActiveJoins[msg.sender] < joinCap);	// In order to be able to join this match, the player's ongoing joins must be below joinCap

		playerToNumActiveJoins[msg.sender] = playerToNumActiveJoins[msg.sender].add(1);	// Increment number of active joins this player has
		playerToNumMatches[msg.sender] = playerToNumMatches[msg.sender].add(1);	// Increment number of matches this player has been in
		_matches[_matchId].opponent = msg.sender;	// Associate this sender as the opponent of specified match
		
		emit MatchJoined(_matchId, msg.sender);
	}

	// @notice Gets all match IDs associated to a specific player (ie. address)
	// @dev I do a safety != address(0) check just in case
	function getMatchIDsOfAddress(address _player) external view activeContract() returns(uint256[] matchIds){
		uint32 _numMatches = playerToNumMatches[_player];	// Number of matches associated to this player
		uint256[] memory _ids = new uint256[](_numMatches);
		uint32 _pos = 0;	//uint32 to match _numMatches type

		// Loops until the end of _matches OR until we have all the activeMatches; _matches[0] is null match
		for(uint256 i = 1; i < _matches.length && _pos != activeMatchCounter; i++){
		    if(_matches[i].creator == _player || _matches[i].opponent == _player){
				_ids[_pos] = i;
				_pos = _pos.add(1);
			}
		}


		return _ids;
	}

	// @notice Gets all active match IDs (with outcome code == 0)
	// @dev I do a safety != address(0) check just in case
	function getActiveMatchIDs() external view activeContract() returns(uint256[] matchIds){
		uint256[] memory _ids = new uint256[](activeMatchCounter);
		uint32 _pos = 0;	//uint32 to match activeMatchCounter type

		// Loops until the end of _matches OR until we have all the activeMatches; _matches[0] is null match
		for(uint i = 1; i < _matches.length && _pos != activeMatchCounter; i++){
			if(_matches[i].creator != address(0) && _matches[i].outcome == 0){	// Ensure valid match and is active
				_ids[_pos] = i;
				_pos = _pos.add(1);
			}
		}

		return _ids;
	}

	// @notice Gets the number of ongoing RPS Matches created by the caller
	// @dev This is mostly for laziness on js-side
	function getNumActiveCreates() external view activeContract() returns(uint8 numMatches){
		return playerToNumActiveCreates[msg.sender];
	}

	// @notice Get the number of ongoing RPS Matches by the created specified address (this includes players waiting for an opponent)
	function getNumActiveCreatesFor(address _player) external view activeContract() returns(uint8 numMatches){
		return playerToNumActiveCreates[_player];
	}

	// @notice Gets the number of ongoing RPS Matches joined by the caller
	// @dev This is mostly for laziness on js-side
	function getNumActiveJoins() external view activeContract() returns(uint8 numMatches){
		return playerToNumActiveJoins[msg.sender];
	}

	// @notice Get the number of ongoing RPS Matches by the joined specified address
	function getNumActiveJoinsFor(address _player) external view activeContract() returns(uint8 numMatches){
		return playerToNumActiveJoins[_player];
	}

	// @notice Gets a specified match's id, creator address, opponent address, wager amount, and outcome code. Outcome Code : -1 == creator won; 0 == match not finished; 1 == opponent won
	// @param _matchId The match ID to get data from
	// @dev matchId is re-returned for easier handling on js side
	function getMatch(uint256 _matchId) public view activeContract() returns(uint256 id, address creator, address opponent, uint256 wager, int8 outcome){
		RPSMatch memory _match = _matches[_matchId];
		return (_matchId, _match.creator, _match.opponent, _match.wager, _match.outcome);
	}

	/** Administrative Methods **/

	// @notice Kills an *ongoing* match and returns wagers to appropriate addresses. Callable only by the admins or higher
	function killMatch(uint256 _matchId) external isAdmin(){
		RPSMatch memory _match = _matches[_matchId];
		if(_match.creator == address(0) || _match.outcome != 0){	// Check if the match is a valid, ongoing match
			emit MatchKilled(_matchId, address(0), 0, address(0), 0);	// Invalid/complete match, so don't return any funds
		}else{
			address oppAddress = address(0);
			uint256 oppRefund = 0;

			_matches[_matchId].outcome = -2;	// To avoid re-entrancy vulnerability, set outcome of match to killed before transfer
			_match.creator.transfer(_match.wager);	// Transfer the wager funds back to creator
			
			if(_match.creator != _match.opponent){	// If an opponent has also put in money to this ongoing match
				oppAddress = _match.opponent;
				oppRefund = _match.wager;
				playerToNumActiveJoins[oppAddress] = playerToNumActiveJoins[oppAddress].sub(1);	// Killing a match removes opponent from it
				_match.opponent.transfer(_match.wager);	// Transfer their wager funds back to them as well
			}

			activeMatchCounter = activeMatchCounter.sub(1);
			playerToNumActiveCreates[_match.creator] = playerToNumActiveCreates[_match.creator].sub(1);	// Killing a match removes creator from it
			emit MatchKilled(_matchId, _match.creator, _match.wager, oppAddress, oppRefund);
		}
	}

	// @notice Sets a new cap on the number of games a single player can create at the same time
	function setCreateCap(uint8 newCap) external isAdmin(){
		createCap = newCap;
	}
	
	// @notice Sets a new cap on the number of games a single player can join at the same time
	function setJoinCap(uint8 newCap) external isAdmin(){
		joinCap = newCap;
	}

	// @notice Transfers ownership of this contract to another address. Callable only by owner.
	// @param _to Address to be given ownership to.
	function transferOwner(address _to) external isOwner(){
		contractOwner = _to;
	}

	// @notice Transfers admin privileges of this contract to another address. Callable only by the admins or higher
	// @param _to Address to be given admin privileges to.
	function transferAdmin(address _to) external isAdmin(){
		contractAdmin = _to;
	}

	// @notice Sets contracts active state. Callable only by admins or higher
	// @param _isActive Sets contract to be active or not
	function setContractActive(bool _isActive) external isAdmin(){
		_isContractActive = _isActive;
	}

	/** PRIVATE METHODS **/
	
}

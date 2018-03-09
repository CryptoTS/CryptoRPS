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


	/** STORAGE **/
	RPSMatch[] public _matches;	// An array of all RPS matches, ongoing and completed
	//*** TODO change to private upon deployment

	// @dev A mapping of player addresses to the number of matches that player has either created or been an opponent in. Note, a created match that hasn't been played out IS counted 
	mapping(address => uint32) public playerToNumMatches; // Note on uint32: A player playing over 4 billion games is highly unlikely

	/** EVENTS **/
	event MatchCreated(uint256 matchId, address creator, uint256 wager);

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
		RPSMatch memory _match = RPSMatch({	// Create a RPSMatch in memory
			creator: msg.sender,
			opponent: msg.sender,	// Initially set like this so worse-case scenario is creator sends money to themselves
			wager: msg.value,	// In Wei (1 Eth = 1000000000000000000 Wei)
			outcome: 0			// Game is undecided on creation
			});
		uint256 _matchId = _matches.push(_match) - 1;

		activeMatchCounter = activeMatchCounter.add(1);	// Increment the number of active RPS matches
		playerToNumMatches[_match.creator] = playerToNumMatches[_match.creator].add(1);	// Increment number of matches by this player

		emit MatchCreated(_matchId, _match.creator, _match.wager);	// Trigger the MatchCreated event
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

	// @notice Gets the number of ongoing RPS Matches by the caller
	// @dev Uses more general getNumActiveMatchesFor(address) function. This is mostly for laziness on js-side
	function getNumActiveMatchesFor() external view activeContract() returns(uint32 activeMatches){
		return getNumActiveMatchesFor(msg.sender);
	}

	// @notice Get the number of ongoing RPS Matches by the specified address. This means they are either waiting for an opponent, or playing one currently
	// @dev I do a safety != address(0) check just in case
	function getNumActiveMatchesFor(address _player) public view activeContract() returns(uint32 activeMatches){
		uint32 counter = 0;

		// _matches[0] is null match
		for(uint i = 1; i < _matches.length; i++){	// Go through all matches
			if(_matches[i].outcome == 0 && _matches[i].creator != address(0) &&	// If the match is ongoing and not invalid
				(_matches[i].creator == _player || _matches[i].opponent == _player)){	// And either the creator or opponent is the _player
				counter = counter.add(1);	// Then the _player is in an active match
			}
		}

		return counter;
	}

	// @notice Gets a specified match's creator address, opponent address, wager amount, and outcome code. Outcome Code : -1 == creator won; 0 == match not finished; 1 == opponent won
	// @param _matchId The match ID to get data from
	function getMatch(uint256 _matchId) public view activeContract() returns(address creator, address opponent, uint256 wager, int8 outcome){
		RPSMatch memory _match = _matches[_matchId];
		return (_match.creator, _match.opponent, _match.wager, _match.outcome);
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
				_match.opponent.transfer(_match.wager);	// Transfer their wager funds back to them as well
			}

			activeMatchCounter = activeMatchCounter.sub(1);
			emit MatchKilled(_matchId, _match.creator, _match.wager, oppAddress, oppRefund);
		}
	}
	
	/** PRIVATE METHODS **/
	
}

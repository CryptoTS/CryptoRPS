/** Setup.js
	
	Purpose: To setup variables used by RPS.js
	Mostly to organize RPS.js better
	Contains Promise skeleton implementations of variable definitions, since some calls to web3 are a-snyc
	NOTE: Non-statically loaded variables MUST be loaded via these promises
**/

/** VARIABLE GLOSSARY
address:		Ethernet address associated to contract
abi:			Application Binary Interface of that contract (a massive json defining contract func/returns/etc.)
PollTimes:		A dictionary of poll time specifications for polling
PromiseCode:	A dictionary of promise codes that may be resolved/rejected with through promises 
MoveMap:		A mapping of moves (rps) to numerical values
maxCreates:		The max number of games a player can create
maxJoines:		The max number of games a player can join

web3:			The web3.js container object for interaction with web3.js (using web3 v1.0-beta31)
contract:		An instance of the solidity contract. Interaction with that contract (on the blockchain) is done through this
curAcc:			The current MetaMask account being used
canCreateMatch:	Boolean to check if the player can create a match
canJoinMatch:	Boolean to check if the player can join a match
    ******** ******** **/

/** STATIC VARIABLES **/
const address = "0xCA68f9037fAD4964DEc41eBBD07b7B2F94AeB631"
const abi = [{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"playerToNumActiveCreates","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"activeMatchCounter","outputs":[{"name":"","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newCap","type":"uint8"}],"name":"setJoinCap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_matchId","type":"uint256"}],"name":"getMatch","outputs":[{"name":"id","type":"uint256"},{"name":"creator","type":"address"},{"name":"opponent","type":"address"},{"name":"wager","type":"uint256"},{"name":"outcome","type":"int8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_player","type":"address"}],"name":"getNumActiveCreatedMatchesFor","outputs":[{"name":"numMatches","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getActiveMatchIDs","outputs":[{"name":"matchIds","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"}],"name":"transferOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_matchId","type":"uint256"}],"name":"killMatch","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"createCap","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"contractAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"_matches","outputs":[{"name":"creator","type":"address"},{"name":"opponent","type":"address"},{"name":"wager","type":"uint256"},{"name":"outcome","type":"int8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_isActive","type":"bool"}],"name":"setContractActive","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"createMatch","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"playerToNumMatches","outputs":[{"name":"","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_player","type":"address"}],"name":"getNumActiveJoinedMatchesFor","outputs":[{"name":"numMatches","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getNumActiveJoinedMatches","outputs":[{"name":"numMatches","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"playerToNumActiveJoins","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getNumActiveCreatedMatches","outputs":[{"name":"numMatches","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"contractOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_player","type":"address"}],"name":"getMatchIDsOfAddress","outputs":[{"name":"matchIds","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newCap","type":"uint8"}],"name":"setCreateCap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"joinCap","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_matchId","type":"uint256"}],"name":"joinMatch","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"matchId","type":"uint256"},{"indexed":false,"name":"creator","type":"address"},{"indexed":false,"name":"opponent","type":"address"},{"indexed":false,"name":"wager","type":"uint256"},{"indexed":false,"name":"outcome","type":"uint8"}],"name":"MatchCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"matchId","type":"uint256"},{"indexed":false,"name":"opponent","type":"address"}],"name":"MatchJoined","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"matchId","type":"uint256"},{"indexed":false,"name":"creator","type":"address"},{"indexed":false,"name":"creatorRefund","type":"uint256"},{"indexed":false,"name":"opponent","type":"address"},{"indexed":false,"name":"opponentRefuned","type":"uint256"}],"name":"MatchKilled","type":"event"}]
const maxCreates = 1
const maxJoins = 1

const PollTimes = Object.freeze({
	AccCheck: 250,
	CreateStatus: 250,
	JoinStatus: 250
});

const PromiseCode = Object.freeze({
	Success: "Promise succeeded as intended",
	ConnectionFailed: "Connection failed to be established",
	MainNet: "In MainNet",
	RopNet: "In Ropsten",
	UnknownNet: "In unkown network",
	InvalidTxn: "Invalid transaction hash",
	InvalidAcc: "Invalid account hash",
	Failed: "Something went wrong... promise failed"
});

const MoveMap = Object.freeze({
	"rock": 0,
	"paper": 1,
	"scissor": 2
});

/** DYNAMIC VARIABLES **/
let web3
let contract
let curAcc
let canCreateMatch
let canJoinMatch


/** SETUP FUNCTIONS **/

const web3Setup = (resolve, reject) => {
	web3 = new Web3(Web3.givenProvider || "http://localhost:8501");
	if(web3 !== 'undefined'){
		console.log("web3 setup complete")
		resolve(PromiseCode.Success)
	}else{
		reject(PromiseCode.Failed)
	}
};

// Checks the MetaMask network to ensure user is on the mainnet 
const networkSetup = (resolve, reject) => {
	web3.eth.net.getId().then((netId) =>
	{
		console.log("networkSetup complete")
		switch (netId) {
			case 1:
				// In mainnet
				resolve(PromiseCode.MainNet)
			case 3:
				// In Ropset test network
				resolve(PromiseCode.RopNet)
			default:
				// In some other network (may or may not be unknown)
				reject(PromiseCode.UnknownNet)
		}
	}).catch((error) => {
		reject(error)
	});
}

const contractSetup = (resolve, reject) => {
	contract = new web3.eth.Contract(abi, address)	// Obtain contract with specified abi and address

	if(contract != null){
		console.log("contract setup complete")
		resolve(PromiseCode.Success)
	}else{
		reject(PromiseCode.ConnectionFailed)
	}
};

const curAccSetup = (resolve, reject) => {
	web3.eth.getAccounts().then((accounts) => {
		curAcc = accounts[0]
	}).then(() => {
		if(curAcc != null){
			console.log("curAcc setup complete")
			pollAccChange(PollTimes.AccCheck)
			resolve(PromiseCode.Success)
		}else{
			reject()	// Fallback to rejecting with web3's error
		}
	}).catch((error) => {
		reject(error)
	})
};

// Initialize storage items to 0 for proper error handling in
// Utils.js creationStatus and joiningStatus
const sessionStorageSetup = (resolve, reject) => {
	sessionStorage.setItem('createTxnHash', 0)
	sessionStorage.setItem('createTxnAcc', 0)
	sessionStorage.setItem('joinTxnHash', 0)
	sessionStorage.setItem('joinTxnAcc', 0)

	resolve(PromiseCode.Success)
};

// Identical to updateCanCreateMatch function, but also starts
// polling and is a promise
const canCreateSetup = (resolve, reject) => {
	let createTxn = sessionStorage.getItem('createTxnHash')
	let createAcc = sessionStorage.getItem('createTxnAcc')
	
	creationStatus(createTxn, createAcc).then(() => {
		return new Promise(canCreate)
	}).then((canCreateResult) => {
		canCreateMatch = canCreateResult;
		pollCanCreateStatus(PollTimes.CreateStatus)	// TODO: Is this really necessary?
		resolve(PromiseCode.Success)
	}).catch((error) => {
		reject(error)
	})
}

// Identical to updateCanJoinMatch function, but also starts
// polling and is a promise
const canJoinSetup = (resolve, reject) => {
	let joinTxn = sessionStorage.getItem('joinTxnHash')
	let joinAcc = sessionStorage.getItem('joinTxnAcc')
	console.log("Starting...")

	joiningStatus(joinTxn, joinAcc).then(() => {
		console.log("1...")
		return new Promise(canJoin)
	}).then((canJoinResult) => {
		console.log("done...")
		canJoinMatch = canJoinResult
		pollCanJoinStatus(PollTimes.JoinStatus)	// TODO: Is this really necessary?
		resolve(PromiseCode.Success)
	}).catch((error) => {
		console.log("err...")
		reject(error)
	})
}

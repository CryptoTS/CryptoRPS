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
zeroAcc:		The zero account. Essentially a grave

web3:			The web3.js container object for interaction with web3.js (using web3 v1.0-beta31)
contract:		An instance of the solidity contract. Interaction with that contract (on the blockchain) is done through this
curAcc:			The current MetaMask account being used
canCreateMatch:	Boolean to check if the player can create a match
canJoinMatch:	Boolean to check if the player can join a match
recentBlock:	A periodically updated block number. Transactions start being searched from this block
maxCreates:		The max number of games a player can create
maxJoins:		The max number of games a player can join
pastEvents:		An object storing events from recentBlock to most recent block
**/

/** STATIC VARIABLES **/
const address = "0x5cC3773278288DD49235b5A71C2F24dA5e081Fe9"
const abi = [
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "playerToNumActiveCreates",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "activeMatchCounter",
		"outputs": [
			{
				"name": "",
				"type": "uint32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newCap",
				"type": "uint8"
			}
		],
		"name": "setJoinCap",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getNumActiveCreates",
		"outputs": [
			{
				"name": "numMatches",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_matchId",
				"type": "uint256"
			}
		],
		"name": "getMatch",
		"outputs": [
			{
				"name": "id",
				"type": "uint256"
			},
			{
				"name": "creator",
				"type": "address"
			},
			{
				"name": "opponent",
				"type": "address"
			},
			{
				"name": "wager",
				"type": "uint256"
			},
			{
				"name": "outcome",
				"type": "int8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getActiveMatchIDs",
		"outputs": [
			{
				"name": "matchIds",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			}
		],
		"name": "transferOwner",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_matchId",
				"type": "uint256"
			}
		],
		"name": "killMatch",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "createCap",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			}
		],
		"name": "transferAdmin",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "contractAdmin",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_player",
				"type": "address"
			}
		],
		"name": "getNumActiveCreatesFor",
		"outputs": [
			{
				"name": "numMatches",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getNumActiveJoins",
		"outputs": [
			{
				"name": "numMatches",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "_matches",
		"outputs": [
			{
				"name": "creator",
				"type": "address"
			},
			{
				"name": "opponent",
				"type": "address"
			},
			{
				"name": "wager",
				"type": "uint256"
			},
			{
				"name": "outcome",
				"type": "int8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_isActive",
				"type": "bool"
			}
		],
		"name": "setContractActive",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "createMatch",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "playerToNumMatches",
		"outputs": [
			{
				"name": "",
				"type": "uint32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_player",
				"type": "address"
			}
		],
		"name": "getNumActiveJoinsFor",
		"outputs": [
			{
				"name": "numMatches",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "playerToNumActiveJoins",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "contractOwner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_player",
				"type": "address"
			}
		],
		"name": "getMatchIDsOfAddress",
		"outputs": [
			{
				"name": "matchIds",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newCap",
				"type": "uint8"
			}
		],
		"name": "setCreateCap",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "joinCap",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_matchId",
				"type": "uint256"
			}
		],
		"name": "joinMatch",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "matchId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "opponent",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "wager",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "outcome",
				"type": "uint8"
			}
		],
		"name": "MatchCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "matchId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "opponent",
				"type": "address"
			}
		],
		"name": "MatchJoined",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "matchId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "creatorRefund",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "opponent",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "opponentRefuned",
				"type": "uint256"
			}
		],
		"name": "MatchKilled",
		"type": "event"
	}
]
const zeroAcc = "0x0000000000000000000000000000000000000000"

const PollTimes = Object.freeze({
	AccCheck: 250,
	CreateStatus: 250,
	JoinStatus: 250,
	BlockCheck: 2500,
	CreationCheck: 1500
});

const PromiseCode = Object.freeze({
	Success: "Promise succeeded as intended",
	ConnectionFailed: "Connection failed to be established",
	MainNet: "In MainNet",
	RopNet: "In Ropsten",
	UnknownNet: "In unkown network",
	InvalidTxn: "Invalid transaction hash",
	InvalidAcc: "Invalid account hash",
	InvalidEth: "Invalid etherium amount!",
	CreationRejected: "Create match request rejected!",
	JoinRejected: "Join match request rejected!",
	NoAccount: "No account detected",
	MaxCreatesError: "Couldn't get max allowed creates from contract",
	MaxJoinsError: "Couldn't get max allowed joins from contract",
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
let recentBlock
let maxCreates
let maxJoins
let pastEvents = []


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
			reject(PromiseCode.NoAccount)
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

// Gets the most recent mined block number
const recentBlockSetup = (resolve, reject) => {
	web3.eth.getBlockNumber()
	.then(function (blockNum){
		recentBlock = blockNum
		// pollRecentBlock(PollTimes.BlockCheck)	// Start polling for block updates
		// Commented as Poll Recent Creations contains block number associated to creation txn 
		resolve(PromiseCode.Success)
	}).catch((error) => {
		reject(error)
	})
}

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
		return new Promise(canJoin)
	}).then((canJoinResult) => {
		canJoinMatch = canJoinResult
		pollCanJoinStatus(PollTimes.JoinStatus)	// TODO: Is this really necessary?
		resolve(PromiseCode.Success)
	}).catch((error) => {
		reject(error)
	})
}

// Gets the max allowed creates per player, according to contract
const maxCreatesSetup = (resolve, reject) => {
	contract.methods.createCap().call({from: curAcc}).then((createCap) => {
		maxCreates = createCap
		resolve(PromiseCode.Success)
	}).catch((error) => {
		maxCreates = 1	// Default to 1 creates
		reject(PromiseCode.MaxCreatesError)
	})
}

// Gets the max allowed joins per player, according to contract
const maxJoinsSetup = (resolve, reject) => {
	contract.methods.joinCap().call({from: curAcc}).then((joinCap) => {
		maxJoins = joinCap
		resolve(PromiseCode.Success)
	}).catch((error) => {
		maxJoins = 1	// Default to 1 joins
		reject(PromiseCode.MaxJoinsError)
	})
}

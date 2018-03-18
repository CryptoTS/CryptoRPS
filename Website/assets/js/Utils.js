/** Utils.js
	
	Purpose: Utility functions that are used in the main RPS.js
	Mostly to organize RPS.js better
	This includes:
		Polling information from web3, contract, and other places
		Setting front-end characterstics based on variables
**/

/** HTML MODIFICATION FUNCTION-SET **/

// Disables/enables the "join rps match" button depending on canJoinMatch state
function toggleJoining(){
  $('*[id=joinMatchBtn]').each(function(){ // For each match btn
    matchDiv = $(this).parent().parent()
    creatorId = matchDiv.attr('id')

    if(canJoinMatch == false || curAcc == creatorId){ // If I cannot join match OR this account is the creator
      $(this).prop('disabled', true)  // Disable joining this match
    }else{
      $(this).prop('disabled', false) // Enable joining this match
    }
  })
}

// Disables/enables the "create rps match" button depending on canCreateMatch state
function toggleCreation(){
  if(canCreateMatch == true){ // If can create matchs
    $('#createMatchBtn').prop('disabled', false)  // Enable create match button
  }else{
    $('#createMatchBtn').prop('disabled', true) // Disable create match button
  }
}

/******************************************/

/** PROMISE FUNCTION-SET **/

// Determines if a specified create transaction number, associated to a specific account,
// has been *succesfully* mined on the blockchain
// True if transaction has been mined succesfully; false otherwise
const creationStatus = function(createTxn, createAcc) {
	return new Promise((resolve, reject) => {
		if(createTxn == null)	reject(PromiseCode.InvalidTxn)
		if(createAcc == null || createAcc == 0)	reject(PromiseCode.InvalidAcc)

		web3.eth.getTransactionReceipt(createTxn).then((receipt) => {
			if(receipt == null && createAcc == curAcc){
			// Checking receipt == null checks if transaction is still pending
			// Check createAcc == curAcc checks if the account associated to that transaction is the current account (would be false if 1 player switched accounts)
				pollTxn(createTxn).then((creation) => {
					resolve(creation.didSucceed)
				})
			}else{
				if(createAcc != curAcc){
					resolve(false)
				}else{
					resolve(receipt.status == 1)	// true if success
				}
			}
		}).catch((error) => {
			reject(error)
		})
	});
}

// Determines if the current account cant create another match
// Resolves to true if this player can create more matches; false otherwise
const canCreate = (resolve, reject) => {
	contract.methods.getNumActiveCreatedMatches().call({from: curAcc}).then((numCreates) => {
		resolve(numCreates < maxCreates)
	}).catch((error) => {
		reject(error)
	})
}

// Determines if a specified join transaction number, associated to a specific account,
// has been *succesfully* mined on the blockchain
// True if transaction has been mined succesfully; false otherwise
const joiningStatus = function(joinTxn, joinAcc){
	return new Promise((resolve, reject) => {
		if(joinTxn == null)	reject(PromiseCode.InvalidTxn)
		if(joinAcc == null || joinAcc == 0)	reject(PromiseCode.InvalidAcc)

		web3.eth.getTransactionReceipt(joinTxn).then((receipt) => {
			if(receipt == null && joinAcc == curAcc){
				pollTxn(joinTxn).then((result) => {
					resolve(result.didSucceed)
				})
			}else{
				if(createAcc != curAcc){
					resolve(false)
				}else{
					resolve(receipt.status == 1)
				}
			}
		}).catch((error) => {
			reject(error)
		})
	});
}

const canJoin = (resolve, reject) => {
	contract.methods.getNumActiveJoinedMatches().call({from: curAcc}).then((numJoins) => {
		resolve(numJoins < maxJoins)
	}).catch((error) => {
		reject(error)
	})
}

/******************************************/

/** GENERAL FUNCTION-SET **/

// Updates this player's ability to create a match
function updateCanCreateMatch(){
	let createTxn = sessionStorage.getItem('createTxnHash')
	let createAcc = sessionStorage.getItem('createTxnAcc')
	
	creationStatus(createTxn, createAcc).then(() => {
		return new Promise(canCreate)
	}).then((canCreateResult) => {
		canCreateMatch = canCreateResult;
	}).catch((error) => {
		errorHandler(error)
	})
}

// Updates player's ability to join a match
function updateCanJoinMatch(){
	let joinTxn = sessionStorage.getItem('joinTxnHash')
	let joinAcc = sessionStorage.getItem('joinTxnAcc')

	joiningStatus(joinTxn, joinAcc).then(() => {
		return new Promise(canJoin)
	}).then((canJoinResult) => {
		canJoinMatch = canJoinResult
	}).catch((error) => {
		errorHandler(error)
	})
}

// Execute a list of Promise return functions in series
function pSeries(list) {  
	var p = Promise.resolve();
	return list.reduce(function(pacc, fn) {
		return pacc = pacc.then(fn);
	}, p);
}

// Handles errors thrown in RPS promises
function errorHandler(error){
	switch (error){
		case PromiseCode.UnknownNet:
			alert("Please move to MainNet")
			break
		case PromiseCode.InvalidTxn:
			break
		default:
			console.error(error)
	}
}

/******************************************/
/** POLLING FUNCTION-SET**/

// Check for MetaMask account change, and reload website if necessary
function pollAccChange(interval){
	setInterval(() => {
		web3.eth.getAccounts().then(function(accounts){
			if(curAcc != accounts[0]){
				curAcc = accounts[0]
				location.reload()
			}
		})
	}, interval)
	console.log("Started pollAccChange")
}

// Polls specific txnHash until it either dies or is completed
function pollTxn(txnHash, interval){
	console.log("HELLO")
	return new Promise(function(resolve){					// This should resolve itself once the transaction succeeds/fails
		const pollTxnInterval = setInterval(function(){		// Check for transcation receipt every <interal> ms
			web3.eth.getTransactionReceipt(txnHash)			// Get transaction receipt with web3
			.then(function(txnObj){
				if(txnObj != null){							// If the receipt is null, then it is still being mined (ie. pending)
					clearInterval(pollTxnInterval)			// Once it's finished being mined, stop interval-ing

					let result = ({							// Create result
						didSucceed: txnObj.status == 1,		// If txn receipt succeeded
						receipt: txnObj						// The receipt itself, for good measure
					})

					resolve(result)							// Resolve the promise with the formulated result
				}
			})
		}, interval)
	})
}


// Disable/Enable Join Match button via periodical variable checks
function pollCanJoinStatus(interval){
	setInterval(function(){
		toggleJoining()
	}, interval)
	console.log("Started pollCanJoinStatus")
}

// Disable/Enable Create Match button via periodical variable checks
function pollCanCreateStatus(interval){
	setInterval(function(){
		toggleCreation()
	}, interval)
	console.log("Started pollCanCreateStatus")
}

// Updates recent block, so polling of recent events will produce less results
function pollRecentBlock(interval){
	setInterval(function(){
		web3.eth.getBlockNumber()
		.then(function (blockNum){
			recentBlock = blockNum
		})
	}, interval)
	console.log("Started pollRecentBlock")
}

// 
// NOTE: This is only because event firing currently is not properly handled by MetaMask with web3 v1.0-beta31
function pollRecentCreations(interval){
	setInterval(function(){
		contract.getPastEvents('MatchCreated', {fromBlock: recentBlock, toBlock:'latest'}, function(error, events){
			eventString = JSON.stringify(events)
			pastEventsString = JSON.stringify(pastEvents)
			if(eventString != pastEventsString){
				console.log(events);
				pastEvents = events;
			}
		})
	}, interval)
	console.log("Started pollRecentCreations")
}

/******************************************/
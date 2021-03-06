/** Utils.js
	
	Purpose: Utility functions that are used in the main RPS.js
	Mostly to organize RPS.js better
	This includes:
		Polling information from web3, contract, and other places
		Setting front-end characterstics based on variables
**/

/** ** HTML MODIFICATION FUNCTION-SET ** **/

// Disables/enables the "join rps match" button depending on canJoinMatch state
function toggleJoining(){
	// console.log("toggle joining...")
	$('*[id=joinMatchBtn]').each(function(){ // For each match btn
		matchDiv = $(this).parent().parent()
		creatorId = matchDiv.attr('id')
		opponentId = matchDiv.find('#oppAcc').attr('val')

		if(canJoinMatch === false || curAcc === creatorId || opponentId !== creatorId){
		// If I cannot join match OR this account is the creator OR someone is playing against the creator
			// console.log(canJoinMatch === false)
			// console.log(curAcc === creatorId)
			// console.log(opponentId !== creatorId)
			$(this).prop('disabled', true)  // Disable joining this match
		}else{
			$(this).prop('disabled', false) // Enable joining this match
		}
	})
}

// Disables/enables the "create rps match" button depending on canCreateMatch state
function toggleCreation(){
	if(canCreateMatch === true){ // If can create matchs
		$('#createMatchBtn').prop('disabled', false)  // Enable create match button
	}else{
		$('#createMatchBtn').prop('disabled', true) // Disable create match button
	}
}

// Appends the html object for a specific match to end of the match list by default, but can specifiy div
function appendListing(match, divToAppendTo = $('#topMatch')){
	// Get listing data from match
	let id = match.id
	let joinDisabler = match.creator !== match.opponent || match.creator === curAcc ? "disabled" : ""
	let creator = match.creator
	let opponent = (creator === match.opponent) ? "No Opponent" : match.opponent	// If creator is the opponent, then they're looking for an opponent
	let wager = web3.utils.fromWei(web3.utils.toBN(match.wager), "ether")	// Convert Wei amount to Ether amount. Easier to understand for user

	// Create listing elements
	let newMatch = document.createElement('div');
	let txtDiv = document.createElement('div'); // Text div
	let btnDiv = document.createElement('div'); // Button div
	let spcDiv = document.createElement('div'); // Spacer div

	txtDiv.id = 'txtDiv'
	txtDiv.innerHTML =
	`
	<span>id: </span>
	<span id="matchId" val=${match.id}>${id}</span>
	<span>Creator: </span>
	<span id="creAcc" val="${match.creator}">${creator}</span>
	<span>---</span>
	<span>Opponent: </span>
	<span id="oppAcc" val="${match.opponent}">${opponent}</span>
	<span>---</span>
	<span>Amount: </span>
	<span id="wager" val=${match.wager}>${wager}</span>
	<span> Eth</span>
	`

	btnDiv.id = 'btnDiv'
	btnDiv.innerHTML =
	`
	<button id="rock" onclick="shoot(this)">Rock</button>
	<button id="paper" onclick="shoot(this)">Paper</button>
	<button id="scissor" onclick="shoot(this)">Scissor</button>
	<button style="margin-left: 60px;" id="joinMatchBtn" onclick="joinMatch(this)" ${joinDisabler}>Join</button>
	`

	spcDiv.id = 'spcDiv'
	spcDiv.innerHTML =
	`
	<br><br>
	`

	newMatch.id = creator
	newMatch.classList.add('match')

	newMatch.appendChild(txtDiv)
	newMatch.appendChild(btnDiv)
	newMatch.appendChild(spcDiv)
	$(newMatch).insertAfter(divToAppendTo)	// Insert newMatch AFTER the divToAppendTo
}

// Create it here to it can be stopped outside of this function
let timerUpdate = null
// Progress bar for playing a move
function progress(timeTotal, $element) {
	let timeLeft = timeTotal
	timerUpdate = setInterval(() => {
			var progressBarWidth = timeLeft * $element.width() / timeTotal
			$element.find("#textOverlay").html(timeLeft.toFixed(1) + " seconds")
			$element.find("#bar").animate({ width: progressBarWidth }, timeLeft == timeTotal ? 0 : 100, 'linear')
			timeLeft -= 0.1

		if(timeLeft < 0) {
			$("#matchModal").modal("hide")	// After timer ends, hide the modal (FOR NOW ~ need to implement losing the round/ending game)
			clearInterval(timerUpdate)
		}
	}, 100)
};

function stopProgress(){
	clearInterval(timerUpdate)
}


// Moves the hand up and down
const moveHand = function (handElem) {
	return new Promise((resolve, reject) => {
		let pos = 0;
		let upId = setInterval(upMove, 15)
		let downId = null
		function upMove(){
			if(pos === -30){
				clearInterval(upId)
				downId = setInterval(downMove, 15)
			}
			else{
				pos -= 2;
				handElem.style.top = pos + 'px'
			}
		}
		function downMove(){
			if(pos === 0){
				clearInterval(downId)
				resolve(PromiseCode.Success)
			}
			else{
				pos += 2;
				handElem.style.top = pos + 'px'
			}
		}
	})
}


// Sets the specified hand elemnt to the specified move from MoveMap
const setHand = function(handElem, move){
	let handImg = $(handElem).find('img')[0]
	$(handElem).find("#move").html(MoveMap[move])
	switch(MoveMap[move]){
		case 0:
			handImg.src = "assets/images/RockReady.png"
			break
		case 1:
			handImg.src = "assets/images/Paper.png"
			break
		case 2:
			handImg.src = "assets/images/Scissor.png"
			break
	}
}

/** -- HTML MODIFICATION FUNCTION-SET -- **/
/** ** PROMISE FUNCTION-SET ** **/

// Determines if a specified create transaction number, associated to a specific account,
// has been *succesfully* mined on the blockchain
// True if transaction has been mined succesfully; false otherwise
const creationStatus = function(createTxn, createAcc) {
	return new Promise((resolve, reject) => {
		if(createTxn === null)	reject(PromiseCode.InvalidTxn)
		if(createAcc === null)	reject(PromiseCode.InvalidAcc)
		if(createTxn === "0" || createAcc === "0")	resolve(true)

		web3.eth.getTransactionReceipt(createTxn).then((receipt) => {
			if(receipt === null && createAcc === curAcc){
			// Checking receipt === null checks if transaction is still pending
			// Check createAcc === curAcc checks if the account associated to that transaction is the current account (would be false if 1 player switched accounts)
				pollTxn(createTxn).then((creation) => {
					resolve(creation.didSucceed)
				})
			}else{
				if(createAcc !== curAcc){
					resolve(false)
				}else{
					resolve(receipt.status === 1)	// true if success
				}
			}
		}).catch((error) => {
			reject(error)
		})
	});
}

// Determines if the current account can create another match
// Resolves to true if this player can create more matches; false otherwise
const canCreate = (resolve, reject) => {
	contract.methods.getNumActiveCreates().call({from: curAcc}).then((numCreates) => {
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
		if(joinTxn === null)	reject(PromiseCode.InvalidTxn)
		if(joinAcc === null)	reject(PromiseCode.InvalidAcc)
		if(joinTxn === "0" || joinAcc === "0")	resolve(true)

		web3.eth.getTransactionReceipt(joinTxn).then((receipt) => {
			if(receipt === null && joinAcc === curAcc){
				pollTxn(joinTxn).then((result) => {
					resolve(result.didSucceed)
				})
			}else{
				if(createAcc !== curAcc){
					resolve(false)
				}else{
					resolve(receipt.status === 1)
				}
			}
		}).catch((error) => {
			reject(error)
		})
	});
}



// Determines if the current account can join another match
// Resolves to true if this player can join more matches; false otherwise
const canJoin = (resolve, reject) => {
	contract.methods.getNumActiveJoins().call({from: curAcc}).then((numJoins) => {
		resolve(numJoins < maxJoins)
	}).catch((error) => {
		reject(error)
	})
}

// Get all matches that are currently active (ie. ongoing) in the contract
// then sorts them
const getActiveMatches = (resolve, reject) => {
	let matchPromises = []
	let activeMatches = []

	contract.methods.getActiveMatchIDs().call().then((matchIDs) => {	// Get active (ie. ongoing) match IDs
		for(let i = 0; i < matchIDs.length; i++){						// Go through each match ID
			let curID = matchIDs[i]
			matchPromises.push(contract.methods.getMatch(curID).call().then((matchInfo) => {	// Get the curID's match info
				activeMatches.push(matchInfo)													// Store in array
			}))
		}
	}).then(() => {
		Promise.all(matchPromises).then(() => {				// Once all match infos have been obtained from contract
			resolve(activeMatches.sort(_compareByEthDesc))	// Sort them, and resolve promise
		})
	}).catch((error) => {
		reject(error)
	})
}

/** -- PROMISE FUNCTION-SET -- **/
/** ** GENERAL FUNCTION-SET ** **/

// Updates this player's ability to create a match
function updateCanCreateMatch(){
	let createTxn = sessionStorage.getItem('createTxnHash')
	let createAcc = sessionStorage.getItem('createTxnAcc')
	
	creationStatus(createTxn, createAcc).then(() => {
		return new Promise(canCreate)
	}).then((canCreateResult) => {
		canCreateMatch = canCreateResult;
	}).catch((error) => {
		console.error(errorHandler(error))
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
		console.error(errorHandler(error))
	})
}

// Remove specified element from array and return new array
function remove(array, element) {
    return array.filter(e => e !== element);
}

// Handles errors thrown in RPS promises
// TODO: Potentialy remove this in favor of direct error handling
function errorHandler(error){
	switch (error){
		case PromiseCode.UnknownNet:
			alert("Please move to MainNet")
			break
		case PromiseCode.InvalidTxn:
			console.log("No initial txn")
			break
		default:
			return error
	}
}


function createEventFactory(events){
	for(let i = 0; i < events.length; i++){
		let eventData = events[i].returnValues
		console.log("*** Factory - Creating event w/ ID: " + eventData.matchId)
		matchData = ({  // Recreate the match data given the return values
			id: eventData.matchId,
			creator: eventData.creator,
			opponent: eventData.opponent,
			wager: eventData.wager,
			outcome: eventData.outcome
		})

		insertListing(matchData)
	}
}

// Return 0 if creator won, 1 if opponent won, -1 if it was a tie
function getWinner(){
	let creatorMove = parseInt($($("#creatorHand")[0]).find("#move")[0].innerHTML)
	let opponentMove = parseInt($($("#opponentHand")[0]).find("#move")[0].innerHTML)

	if(creatorMove === opponentMove){
		return -1
	}
	if(creatorMove === 0 && opponentMove == 2){
		return 0
	}else if(creatorMove === 1 && opponentMove == 0){
		return 0
	}else if(creatorMove === 2 && opponentMove == 1){
		return 0
	}else{
		return 1 
	}
}

/** -- GENERAL FUNCTION-SET -- **/
/** ** POLLING FUNCTION-SET ** **/

// Check for MetaMask account change, and reload website if necessary
function pollAccChange(interval){
	setInterval(() => {
		web3.eth.getAccounts().then(function(accounts){
			if(curAcc !== accounts[0]){
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
				if(txnObj !== null){							// If the receipt is null, then it is still being mined (ie. pending)
					clearInterval(pollTxnInterval)			// Once it's finished being mined, stop interval-ing

					let result = ({							// Create result
						didSucceed: txnObj.status === 1,		// If txn receipt succeeded
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
			if(events.length > 0 && eventString !== pastEventsString){
				let onlyInEvents = events.filter(matchArrayFilter(pastEvents))	// From the two array, get items that only appear in events

				console.log("pre-pastEvents")
				console.log(pastEvents)
				console.log("typeof events == " + typeof events)
				console.log(events)
				console.log("onlyInEvents")
				console.log(onlyInEvents)

				recentBlock = events[events.length - 1].blockNumber + 1		// Get most recent event's blockNumber, increment by one to not double count
				createEventFactory(onlyInEvents)
				pastEvents = onlyInEvents;

				console.log("post-pastEvents")
				console.log(pastEvents)
				console.log("\n")
			}
		})
	}, interval)
	console.log("Started pollRecentCreations")
}

/** -- POLLING FUNCTION-SET -- **/
/** ** COMPARATOR FUNCTIONS ** **/

// Compares two matches by their wager amounts. Uses BN.js to safeguard 
// Defaults ordering in descending order (highest to lowest). If wagers
// Are the same, fallback to id-number
function _compareByEthAsc(matchA, matchB){
	let cmpVal = web3.utils.toBN(matchA.wager).cmp(web3.utils.toBN(matchB.wager))
	console.log(cmpVal)
	if (cmpVal === 0){
		cmpVal =  matchA.id - matchB.id
	}
	return cmpVal * -1
}

// Compares two matches by their wager amounts. Uses BN.js to safeguard 
// Defaults ordering in ascending order (lowest to highest). If wagers
// Are the same, fallback to id-number
function _compareByEthDesc(matchA, matchB){
	let cmpVal = web3.utils.toBN(matchA.wager).cmp(web3.utils.toBN(matchB.wager))
	if (cmpVal === 0){
		cmpVal = matchB.id - matchA.id		// Swap order so that most recent transactions appear first
	}
	return cmpVal
}

/** -- COMPARATOR FUNCTIONS -- **/
/** ** FILTER FUNCTIONS ** **/

function matchArrayFilter(otherArray){
	return function(current){
		return otherArray.filter(function(other){
			return other.returnValues.matchId == current.returnValues.matchId
		}).length == 0;
	}
}

/** -- FILTER FUNCTIONS -- **/
/** ** EVENT LISTENERS ** **/

// Events do not fire from js, even though they fire from solidity... Needs to be fixed eventually
function bindCreateEvent(resolve, reject){
	console.log("Binding create event...")
  
	contract.events.MatchCreated().on('data', (event) => {	// When MatchCreated event is fired; On what it returns to me
		console.log("MatchCreated event fired!")
		data = event.returnValues
		matchData = ({  // Recreate the match data given the return values
			id: data.matchId,
			creator: data.creator,
			opponent: data.opponent,
			wager: data.wager,
			outcome: data.outcome
		})
		console.log("Instering matchData: ")
		console.log(matchData)
		insertListing(matchData)
	}).on('changed', function(event){
		console.log("MatchCreated changed")
		console.log(event)
	}).on('error', function(error){
		console.error(error)
	})

	console.log("Create Event Bound")
	resolve(true)
}

// Events do not fire from js, even though they fire from solidity... Needs to be fixed eventually
function bindJoinEvent(resolve, reject){
	console.log("Binding join event...")
  
	contract.events.MatchJoined().on('data', (event) => {	// When MatchJoined event is fired; On what it returns to me
		console.log("MatchJoined event fired!")
		data = event.returnValues
		joinData = ({  // Recreate the join data given the return values
			id: data.matchId,
			opponent: data.opponent
		})
		console.log("Obtained joinData: ")
		console.log(joinData)
	}).on('changed', function(event){
		console.log("MatchJoined changed")
		console.log(event)
	}).on('error', function(error){
		console.error(error)
	})

	console.log("Join Event Bound")
	resolve(true)
}

/** -- EVENT LISTENERS -- **/
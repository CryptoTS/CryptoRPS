window.addEventListener('load', function() {
	new Promise(web3Setup).then(() => {
		return new Promise(networkSetup)
	}).then(() => {
		return Promise.all([new Promise(contractSetup), new Promise(curAccSetup),
			new Promise(sessionStorageSetup), new Promise(recentBlockSetup)])
		// Complete these setup items asyncronously, but only move on once all are complete
	}).then(() => {
		return Promise.all([new Promise(maxCreatesSetup), new Promise(maxJoinsSetup)])
	}).then(() => {		
		return Promise.all([new Promise(canCreateSetup), new Promise(canJoinSetup)])
		// Complete these setup items asyncronously, but only move on once all are complete
	}).then(() => {
		pollRecentCreations(PollTimes.CreationCheck)
		startApp()
	})
	.catch((err) => {
		console.error(errorHandler(err))
	})
})

// Starts app after web3 injection has been confirmed
function startApp(){
	new Promise(getActiveMatches).then(function(sortedMatches)
	{
		for(let i = 0; i < sortedMatches.length; i++){
			appendListing(sortedMatches[i])
		}
	}).then(() => {
		new Promise(bindCreateEvent)
	}).catch(function(err){
		console.error(errorHandler(err))
	})
}

// Fired when rock/paper/scissor is played (ie, 'Rock, Paper, Scissor... Shoot!')
function shoot(btn){
	let move = btn.id;
	let player = curAcc;
	let matchId = $("#matchModal").find("#matchId").val();

	// Then contact backend which move has been made by which player
	console.log(player + " played " + move + "(" + MoveMap[move] + ") for match " + matchId + "!")


}

// Creates a match on the contract, if the user is allowed to
function createMatch(){
	new Promise(canCreate).then((canCreateBool) => {
		let ethAmount = $("#ethAmount").val()	

		if(!canCreateBool){
			throw PromiseCode.CreationRejected
		}

		if(ethAmount === 'undefined' || ethAmount <= 0){
			throw PromiseCode.InvalidEth
		}
		
		let createMatchOps = {
			from: curAcc,
			value: web3.utils.toWei(ethAmount, 'ether')	// Solidity Contract is payable with Wei, not ether
		}

		canCreateMatch = false		// Player is in the process of creating match. Cannot create another
		sessionStorage.setItem('createTxnAcc', curAcc)	
		contract.methods.createMatch().send(createMatchOps).on('transactionHash', (hash) => {	// When blockchain revieves function request
			console.log("Stored createTxnHash")
			sessionStorage.setItem('createTxnHash', hash)
		}).on('receipt', (receipt) => {
			canCreateMatch = receipt.status !== "1"	// If the receipt failed, allow player to create another match
		}).on('error', (error) => {
			canCreateMatch = true
			console.log("createMatch rejected OR took too long. MSG: ")
			throw error
		})
	}).catch((error) => {
		console.error(errorHandler(error))
	})
}

// Joins a match on the contract, if the user is allowed to
function joinMatch(btn){
	new Promise(canJoin).then((canJoinBool) => {
		let matchDiv = $(btn).parent().parent() // Match div is this button's parents' parent 
		let creatorAdr = matchDiv.attr('id')  // Creator address is the id of the match div
		let matchWager = String(matchDiv.find('#txtDiv').find('#wager').attr('val')) // Get match wager (which is in Eth) and convert to Wei
		let matchId = matchDiv.find('#txtDiv').find('#matchId').attr('val')

		if(!canJoinBool || curAcc === creatorAdr){
			throw PromiseCode.JoinRejected
		}

		console.log("Joining match " + matchId + " which has wei wager " + matchWager)
		let joinMatchOps = ({
			from: curAcc,
			value: matchWager	// Joining a match requires you match the match's wager
		})

		canJoinMatch = false  // Player is in the process of joining match. Cannot join another
		sessionStorage.setItem('joinTxnAcc', curAcc)
		contract.methods.joinMatch(matchId).send(joinMatchOps).on('transactionHash', function(hash){	// When blockchain recieves function request
			console.log("Stored joinTxnHash")
			sessionStorage.setItem('joinTxnHash', hash)
		}).on('receipt', (receipt) => {
			canJoinMatch = receipt.status !== "1"
			$("#matchModal").find("#matchId").val(String(matchId));
			$("#matchModal").modal("show")	// Activative game-play modal
			progress(matchTimer, $("#progressBar"))
		}).on('error', function(error){
			canJoinMatch = true
			console.log("joinMatch rejected OR took too long. MSG: ")
			throw error
		})
	}).catch((error) => {
		console.error(errorHandler(error))
	})
}

// Inserts the html object for a specific match to the ordered location in the match list
// Match list is ordered by etherium amount, descending
function insertListing(match){
	let prevDiv = $('#matchList').children('div')[0]	// Default to TopMatch. Use: if the current top RPSMatch is smaller than this match, append below TopMatch
	let matchWager = web3.utils.toBN(match.wager)		// Convert insert match wager's to a BN
	let counter = 0

	if($('#matchList').children('div').length === 1){	// If there's JUST TopMatch, then insert this match and end insertion
		console.log("Kill it with fire")
		appendListing(match, prevDiv)
		return
	}

	$('#matchList').children('div').each(function(){		// Get all children divs of the matchList
		console.log("On id === " + $(this).attr('id'))
		if($(this).attr('id') === 'topMatch'){
			counter++
			return true									// TopMatch is just a place holder, so skip over it
		}
		else if($(this).attr('id') === 'botMatch'){	// If at bottom, this match must be the smallest match
			appendListing(match, prevDiv)
			return false
		}
		let curWager = String($(this).find('#txtDiv').find('#wager').attr('val'))
		let curWeiWager = web3.utils.toBN(curWager)		// Convert Wei value to a BN

		let psuedoMatch = {wager: curWager, matchId: $(this).find('#txtDiv').find('#matchId').attr('val')}

		console.log("match cmp psuedoMatch == " + _compareByEthDesc(match, psuedoMatch))

		if(matchWager.cmp(curWeiWager) > 0){
			console.log("Appending to ")
			console.log(prevDiv)
			appendListing(match, prevDiv) // Append the listing to the previous div

			return false // With insertion complete, break out of .each
		}
		else{
			counter++
			prevDiv = $(this) // Set prevDiv to this Div, and continue on with loop
		}
	})
}


function testJoin(){
	let creatorAcc = "0x0AE15B183572D..."
	let matchId = -1
	$("#matchModal").find("#matchId").html(String(matchId));
	$("#matchModal").find("#creatorAcc").html("0x" + String(creatorAcc).substring(2, 7).toUpperCase());
	$("#matchModal").find("#creatorAccHid").html(String(creatorAcc));

	$("#matchModal").find("#opponentAcc").html("0x" + String(curAcc).substring(2, 7).toUpperCase());
	$("#matchModal").find("#opponentAccHid").html(String(curAcc));

	$("#matchModal").modal("show")	// Activative game-play modal
	progress(matchTimer, $("#progressBar"))
}

function testShoot(strBtn){
	let player = curAcc;
	let matchId = $("#matchModal").find("#matchId").val();
	let psuedoMove = ["rock", "paper", "scissor"][Math.floor(Math.random() * 3)]

	let cHand = $("#matchModal").find("#creatorHand")[0]
	let oHand = $("#matchModal").find("#opponentHand")[0]

	stopProgress()	// Stops timer so players can animate their moves
	
	setHand(cHand, "rock")	// Have both hands reset to rock imgs before moving
	setHand(oHand, "rock")

	$("#opponentScore").removeClass("shakeItem")
	$("#creatorScore").removeClass("shakeItem")

	Promise.all([
		moveHand(cHand).then(() => moveHand(cHand)).then(() => moveHand(cHand))
		.then(() => setHand(cHand, psuedoMove)),
		moveHand(oHand).then(() => moveHand(oHand)).then(() => moveHand(oHand))
		.then(() => setHand(oHand, strBtn))
	]).then(() => {
		let winner = getWinner()

		let creatorScore = parseInt($("#creatorScore").html())
		let opponentScore = parseInt($("#opponentScore").html())

		if(winner === 0){
			creatorScore++
			$("#creatorScore").html(creatorScore)
			$("#creatorScore").addClass("shakeItem")
		}else if (winner === 1){
			opponentScore++
			$("#opponentScore").html(opponentScore)
			$("#opponentScore").addClass("shakeItem")
		}

		if(creatorScore === Math.floor(bestOf / 2 + 1)
			|| opponentScore === Math.floor(bestOf / 2 + 1)){	// Best of 3
			$("#progressBar").hide()
			let victor = "#creatorAccHid"	// Assume the victor was the creator

			if(opponentScore > creatorScore){	// Check otherwise
				victor = "#opponentAccHid"
			}

			if(player === $("#matchModal").find(victor).html()){	// Toggle victory/defeat text properly
				$("#victory").show()
			}else {
				$("#defeat").show()
			}
		}else{
			progress(matchTimer, $("#progressBar"))	// No one has won yet, so restart timer
		}
	})
}
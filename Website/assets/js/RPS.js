let activeMatches = []  // Array to store all active matches
let recentBlock = 0

let pastEvents = null;

window.addEventListener('load', function() {
	web3Setup
	.then(() => networkSetup)	// TODO: Needs to synchronously call web3Setup -> networkSetup -> onwards
	.then(() => {
		return Promise.all([contractSetup, curAccSetup])	// Complete these setup item asyncronously
	}).then(() => {
		const activeMatchesOps = {
			from: curAcc
		}

		updateCanCreateMatch(activeMatchesOps)  // On load (typically page refresh), updateCanCreateMatch
		updateCanJoinMatch(activeMatchesOps)  // On load (typically page refresh), updateCanJoinMatch
		pollCanJoinStatus(250)  // Start polling
		pollCanCreateStatus(250)  // Start polling

		pollRecentBlock(2500)
		pollRecentCreations(250)
	})
	.then(()=>{
		startApp()
	})
	.catch((err) => {
		console.error(err)
	})	
})

// Updates player's ability to create a match
function updateCanCreateMatch(activeMatchesOps){
  // Set canCreateMatch based on contract data
  if(sessionStorage.getItem('createTxnHash') != null){  // If a txnHash was generated via the createMatch function
    web3.eth.getTransactionReceipt(sessionStorage.getItem('createTxnHash')) // Get the transaction Receipt for that transaction
    .then(function(receipt){
      if(receipt == null && sessionStorage.getItem('createTxnAcc') == curAcc){  // If receipt is null (aka not yet completed)
                                                                          // AND the cur account matches the account that made the transaction
        canCreateMatch = false  // This means that the transaction for this account is still being created, so restrict creation
        pollTxn(sessionStorage.getItem('createTxnHash')) // Keep polling the transaction until it's resolved
          .then(function (result){
            canCreateMatch = !result.didSucceed // If the transaction succeeded (went through) then you can not create a game
          })
        }else{  // Else, the transaction already exists (/a different account is being used)
          contract.methods.getNumActiveCreatedMatches().call(activeMatchesOps)  // Since the transaction is complete, the contract has been updated
                                                                                // getNumActiveCreatedMatches() this account to see num active created matches for this account
          .then(function (numMatches){
            canCreateMatch = !(numMatches > 0)  // If this player has more than 0 active created matches, they cannot create matches
          })
        }
    })
    .catch(function(error){
      console.log("canCreateMatch Set error!")
      console.error(error)
    })
  }
}

// Updates player's ability to join a match
function updateCanJoinMatch(activeMatchesOps){
  // Set canJoinMatch based on contract data
  if(sessionStorage.getItem('joinTxnHash') != null){  // If a txnHash was generated via the joinMatch function
    web3.eth.getTransactionReceipt(sessionStorage.getItem('joinTxnHash')) // Get the transaction Receipt for that transaction
    .then(function(receipt){
      if(receipt == null && sessionStorage.getItem('joinTxnAcc') == curAcc){  // If receipt is null (aka not yet completed)
                                                                          // AND the cur account matches the account that made the transaction
        canJoinMatch = false  // This means that the transaction for this account is still joining, so restrict join ability
        pollTxn(sessionStorage.getItem('joinTxnHash')) // Keep polling the transaction until it's resolved
          .then(function (result){
            canJoinMatch = !result.didSucceed // If the transaction succeeded (went through) then you can not join a game
          })
        }else{  // Else, the transaction already exists (/a different account is being used)
          contract.methods.getNumActiveJoinedMatches().call(activeMatchesOps) // Since the transaction is complete, the contract has been updated
                                                                              // getNumActiveJoinedMatches() this account to see num active joined matches for this account
          .then(function (numMatches){
            canJoinMatch = !(numMatches > 0)  // If this player has more than 0 active joined matches, they cannot join matches
          })
        }
    })
    .catch(function(error){
      console.log("canJoinMatch Set error!")
      console.error(error)
    })
  }
}



// If web3 injection cannot be confirmed
// Implement timer to retry connecting and startApp()-ing
function notConnected(){
  console.log("Not connected")
}

// Starts app after web3 injection has been confirmed
function startApp(){
  networkSetup
  activeMatchesSortedProm = new Promise(getActiveMatchesSorted)
  bindEventsProm = new Promise(bindEvents)

  networkSetup  // First check Network
  .then(function(networkId){
    activeMatchesSortedProm // Then get active matches from contract and display them
    .then(function(activeMatchesSorted){
      for(let i = 0; i < activeMatchesSorted.length; i++){
        appendListing(activeMatchesSorted[i])
      }
      bindEventsProm  // Then bind contract events to functions
    })
  })
  .catch(function(err){
    console.error(err)
  })
}

// List the ongoing matches that are on the block chain
function getActiveMatchesSorted(resolve, reject){
  let activeMatchProms = [] // Array to store all active match requests (ie promises)
  
  contract.methods.getActiveMatchIDs().call() // Get all active match IDs from contract
  .then(function (activeMatchIDs){  // When the activeMatchIDs (which is an array) is given back to us...
    // console.log("Active Match IDs: ")
    // console.log(activeMatchIDs)
    for(let i = 0; i < activeMatchIDs.length; i++){ // Go through each activeMatchID
      activeMatchProms.push(contract.methods.getMatch(activeMatchIDs[i]).call()  // Get each match associated to that active match ID
      .then(function(matchInfo){ // Push each call (which is a promise) onto active match promises array
        activeMatches.push(matchInfo) // Upon each getMatch completion, push that matchIDs matchInfo onto the activeMatches array
      }))
    }
  })
  .then(function(){ // Once all getMatch requests (ie promises) have been pushed onto the activeMatchProms array
    Promise.all(activeMatchProms) // Once all promises in the activeMatchProms are resolved
    .then(()=>{ // Then...
      // console.log("All are complete!!")
      resolve(activeMatches.sort(_compareByEthDesc))  // Resolve this function with the sorted matches
    })
  })
  .catch(function(err){
    reject(err) // If any error occurs, reject this function with that error
  })
}

// Fired when rock/paper/scissor is played (ie, 'Rock, Paper, Scissor... Shoot!')
function shoot(btn){
  web3.accounts(function(accountsError, accounts)
  {
    // Obtain player's account from ethjs
    if(accountsError){
      return
    }

    console.log(accounts)

    player = accounts[0]
    move = btn.id
  })
  .then(function()
  {
    // Make sure the person joining this match is NOT person who owns this match
    if(player == opponent){
      throw new Error("Cannot play against yourself!")
    }

    // Then contact backend which move has been made by which player
    console.log(player + " played " + move + "(" + MoveMap[move] + ") against " + opponent + "!")
  })
  .catch(function(err)
  {
    // If error occurs, catch it
    console.error(err)
  })
}

// Creates a match on the contract, if the user is allowed to
function createMatch(){
  let checkCreation = new Promise(function (resolve, reject){
    if(!canCreateMatch){
      reject(Error("Can only have one match at a time"))
    }
    resolve($("#ethAmount").val()) // In Eth, need to be converted to Wei
  })

  checkCreation
  .then(function (ethAmount){  // Create rps match on the blockchain
    if(ethAmount !== 'undefined' && ethAmount > 0){
      let createMatchOps = {
        from: curAcc,
        value: web3.utils.toWei(ethAmount, 'ether')  // Solidity Contract is payable with Wei, not ether
      }

      contract.methods.createMatch().send(createMatchOps) // Send createMatch() w/ specified options
      .on('transactionHash', function(hash){  // When blockchain revieves function request
        canCreateMatch = false  // Player is in the process of creating match. Cannot create another
        // console.log("Starting create transaction...")

        sessionStorage.setItem('createTxnHash', hash)
        sessionStorage.setItem('createTxnAcc', curAcc)

                        // Hand over the task of determining if the transaction succeeded/failed to pollTxn 
        pollTxn(hash)  // Poll transaction hash for it's receipt until one is obtained
        .then(function(result){
          // console.log(result.receipt)

          if(!result.didSucceed){ // If the receipt failed, allow player to create another match
            canCreateMatch = true
          }
        })
      })
      .on('error', function(error){
        console.log("createMatch took too long...")
      })
    }else{
      throw new Error("Invalid Etherium Amount")
    }
  }) 
  .catch(function(err)
  {
    console.error(err)
  })
}

// Join a match
function joinMatch(btn){
  let matchDiv = $(btn).parent().parent() // Match div is this button's parents' parent 
  let creatorAdr = matchDiv.attr('id')  // Creator address is the id of the match div
  let matchWager = web3.utils.toWei(String(matchDiv.find('#txtDiv').find('#wager').html()), "ether") // Get match wager (which is in Eth) and convert to Wei
  let matchId = matchDiv.find('#txtDiv').find('#matchId').html()

  let checkJoining = new Promise(function (resolve, reject){
    if(!canJoinMatch){
      reject(Error("Can only join one match at a time"))
    }else if(curAcc == creatorAdr){
      reject(Error("Cannot join your own match"))
    }
    resolve()
  })

  checkJoining
  .then(function(){
    console.log("Joining match " + matchId + " which has wei wager " + matchWager)
    let joinMatchOps = ({
      from: curAcc,
      value: matchWager // Joining a match requires you match the match's wager
    })

    contract.methods.joinMatch(matchId).send(joinMatchOps)  // Send joinMatch(matchId) w/ specified options
    .on('transactionHash', function(hash){
      canJoinMatch = false  // Player is in the process of creating match. Cannot create another
      // console.log("Starting join transaction...")

      sessionStorage.setItem('joinTxnHash', hash)
      sessionStorage.setItem('joinTxnAcc', curAcc)

                      // Hand over the task of determining if the transaction succeeded/failed to pollTxn 
      pollTxn(hash)  // Poll transaction hash for it's receipt until one is obtained
      .then(function(result){
        // console.log(result.receipt)

        if(!result.didSucceed){ // If the receipt failed, allow player to create another match
          canJoinMatch = true
        }
      })
    })
    .on('error', function(error){
      console.log("joinMatch took too long...")
    })
  })
}

// Appends the html object for a specific match to end of the match list by default, but can specifiy div
function appendListing(match, divToAppendTo = $('#matchList')){
  // Get listing data from match
  let id = match.id
  let creator = match.creator
  let opponent = (creator == match.opponent) ? "No Opponent" : match.opponent  // If creator is the opponent, then they're looking for an opponent
  let wager = web3.utils.fromWei(web3.utils.toBN(match.wager), "ether")  // Convert Wei amount to Ether amount. Easier to understand for user

  // Create listing elements
  let newMatch = document.createElement('div');
  let txtDiv = document.createElement('div'); // Text div
  let btnDiv = document.createElement('div'); // Button div
  let spcDiv = document.createElement('div'); // Spacer div

  txtDiv.id = 'txtDiv'
  txtDiv.innerHTML =
    `
      <span>id: </span>
      <span id="matchId">${id}</span>
      <span>Creator: </span>
      <span id="creAcc">${creator}</span>
      <span>---</span>
      <span>Opponent: </span>
      <span id="oppAcc">${opponent}</span>
      <span>---</span>
      <span>Amount: </span>
      <span id="wager">${wager}</span>
      <span> Eth</span>
    `

  btnDiv.id = 'btnDiv'
  btnDiv.innerHTML =
    `
      <button id="rock" onclick="shoot(this)">Rock</button>
      <button id="paper" onclick="shoot(this)">Paper</button>
      <button id="scissor" onclick="shoot(this)">Scissor</button>
      <button style="margin-left: 60px;" id="joinMatchBtn" onclick="joinMatch(this)">Join</button>
    `

  spcDiv.id = 'spcDiv'
  spcDiv.innerHTML =
    `
    <br><br>
    `

  newMatch.id = creator
  newMatch.appendChild(txtDiv);
  newMatch.appendChild(btnDiv);
  newMatch.appendChild(spcDiv);
  divToAppendTo.append(newMatch);
}

// Inserts the html object for a specific match to the ordered location in the match list
// Match list is ordered by etherium amount, descending
function insertListing(match){
  let prevDiv = $('#matchList').children('div')[0] // Default to TopMatch. Use: if the current top RPSMatch is smaller than this match, append below TopMatch
  let matchWager = web3.utils.toBN(match.wager) // Convert insert match wager's to a BN

  if($('#matchList').children('div').length == 1){ // If there's JUST TopMatch, then insert this match and end insertion
    appendListing(match, prevDiv)
    return
  }

  $('#matchList').children('div') // Get all children divs of the matchList
  .each(function(){
    if($(this).attr('id') == 'topMatch'){
      return true // TopMatch is just a place holder, so skip over it
    }
    let curWeiWager = web3.utils.toWei(String($(this).find('#txtDiv').find('#wager').html()), "ether") // Convert displayed ether to BN Wei 
    curWeiWager = web3.utils.toBN(curWeiWager)  // Convert Wei value to a BN

    if(matchWager.cmp(curWeiWager) < 0){
      appendListing(match, prevDiv) // Append the listing to the previous div

      return false // With insertion complete, break out of .each
    }else{
      prevDiv = $(this) // Set prevDiv to this Div, and continue on with loop
    }
  })
}

/** Event listeners **/

// Events do not fire from js, even though they fire from solidity... Needs to be fixed eventually
function bindEvents(resolve, reject){
  console.log("Binding Events...")
  
  contract.events.MatchCreated()  // When MatchCreated event is fired
  .on('data', function(event){ // On what it returns to me
    console.log("MatchCreated event fired!")
    data = event.returnValues
    matchData = ({  // Recreate the match data given the return values
      id: data.id,
      creator: data.creator,
      opponent: data.opponent,
      wager: data.wager,
      outcome: data.outcome
    })
    console.log("Instering matchData: ")
    console.log(matchData)
    insertListing(matchData)
  })
  .on('changed', function(event){
    console.log("MatchCreated changed")
    console.log(event)
  })
  .on('error', function(error){
    console.error(error)
  })

  console.log("Events Bound")
  resolve(true)
}

/** HELPER FUNCTIONS **/
// Compares two matches by their wager amounts. Uses BN.js to safeguard 
// Defaults ordering in descending order (highest to lowest)
function _compareByEthDesc(matchA, matchB){
  return web3.utils.toBN(matchA.wager).cmp(web3.utils.toBN(matchB.wager)) * -1;
}

// Compares two matches by their wager amounts. Uses BN.js to safeguard 
// Defaults ordering in ascending order (lowest to highest)
function _compareByEthAsc(matchA, matchB){
  return web3.utils.toBN(matchA.wager).cmp(web3.utils.toBN(matchB.wager));
}


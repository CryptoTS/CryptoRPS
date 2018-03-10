var web3js 
var moveMap = new Map();
    moveMap.set('rock', 0);
    moveMap.set('paper', 1);
    moveMap.set('scissor', 2);

const abi = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "_player",
        "type": "address"
      }
    ],
    "name": "getNumActiveMatchesFor",
    "outputs": [
      {
        "name": "activeMatches",
        "type": "uint32"
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
    "inputs": [],
    "name": "getNumActiveMatchesFor",
    "outputs": [
      {
        "name": "activeMatches",
        "type": "uint32"
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
  } ];
const address = "0x5de42A4b681ba4dbEbCab282D80A4d9eD43FA958";
var contract;
var activeMatches = []  // Array to store all active matches
var canCreateMatch = true; // The player can only have one match up at a time
let curAcc // current account

window.addEventListener('load', function() {
  web3js = new Web3(Web3.givenProvider || "http://localhost:8501");

  if(web3js !== 'undefined'){
    contract = new web3js.eth.Contract(abi, address) // Obtain contract with specified abi and address

    web3js.eth.getAccounts()
    .then(function(accounts){
      curAcc = accounts[0]
      let activeMatchesOps = {
        from: curAcc
      }

      // Set canCreateMatch based on contract data
      contract.methods.getNumActiveMatchesFor().call(activeMatchesOps)  // Call hasActiveMatch() w/ specified options
      .then(function (numActiveMatches){
        canCreateMatch = !(numActiveMatches > 0)  // If this player has more than 0 active matches, they cannot create matches
      })
    })
    .then(function(){ // After initial account is obtained
      startApp()
      
      window.setInterval(function() {
        web3js.eth.getAccounts()
        .then(function(accounts){
          if(curAcc != accounts[0])
          {
            curAcc = accounts[0]
            location.reload() // Set a Periodical check to see if the account has changed and refresh the page if it has
          }
        })
      }, 100)
    })
    .catch(function(err){
      console.error(err)
    })
  }else{
    notConnected()
  }
})

// If web3 injection cannot be confirmed
// Implement timer to retry connecting and startApp()-ing
function notConnected(){
  console.log("Not connected")
}

// Starts app after web3 injection has been confirmed
function startApp(){
  checkNetworkProm = new Promise(checkNetwork)
  activeGamesSortedProm = new Promise(getActiveGamesSorted)
  bindEventsProm = new Promise(bindEvents)

  checkNetworkProm  // First check Network
  .then(function(networkId){
    console.log("networkId " + networkId)
    activeGamesSortedProm // Then get active games from contract and display them
    .then(function(activeMatchesSorted){
      for(let i = 0; i < activeMatchesSorted.length; i++){
        appendListing(activeMatchesSorted[i])
      }
      bindEventsProm  // Then bind contract events to functions
    })
  })
  .catch(function(err){
    console.log(err)
  })
}

// Checks the MetaMask network to ensure user is on the mainnet 
function checkNetwork(resolve, reject){
  web3js.eth.net.getId((err, netId) => {
    switch (netId) {
      case 1:
        // In mainnet
        console.log('This is mainnet')
        resolve(1)
        break
      case 3:
        // In Ropset test network
        console.log('This is the ropsten test network.')
        resolve(3)
        break
      default:
        // In some other network (may or may not be unknown)
        reject(Error("This is an unknown network"))
    }
  })
}

// List the ongoing games that are on the block chain
function getActiveGamesSorted(resolve, reject){
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
  web3js.accounts(function(accountsError, accounts)
  {
    // Obtain player's account from ethjs
    if(accountsError){
      return
    }

    console.log(accounts)

    player = accounts[0]
    move = btn.id
    opponent = $(btn).parent().parent().attr('id')
  })
  .then(function()
  {
    // Make sure the person joining this game is NOT person who owns this game
    if(player == opponent){
      throw new Error("Cannot play against yourself!")
    }

    // Then contact backend which move has been made by which player
    console.log(player + " played " + move + "(" + moveMap.get(move) + ") against " + opponent + "!")
  })
  .catch(function(err)
  {
    // If error occurs, catch it
    console.error(err)
  })
}

// Creates a match on the contract, if the user is allowed to
function createMatch(){
  let acc
  let checkCreation = new Promise(function (resolve, reject){
    if(!canCreateMatch){
      reject(Error("Can only have one match at a time"))
    }
    resolve($("#ethAmount").val()) // In Eth, need to be converted to Wei
  })

  checkCreation.then(function (ethAmount){  // Create rps match on the blockchain
    if(ethAmount !== 'undefined' && ethAmount > 0){
      let createMatchOps = {
        from: curAcc,
        value: web3js.utils.toWei(ethAmount, 'ether')  // Solidity Contract is payable with Wei, not ether
      }

      contract.methods.createMatch().send(createMatchOps) // Send createMatch() w/ specified options
      .on('transactionHash', function(hash){  // When blockchain revieves function request
        canCreateMatch = false  // Player is in the process of creating match. Cannot create another
        console.log("Starting transaction...")
      })
      .on('receipt', function(receipt){  // When blockchain has finished function execution
        console.log("receipt: ")
        console.log(receipt)
      })
      .on('error', function(receipt){
        canCreateMatch = true // If transaction errors out, player can create a match again
        console.log("Errored out")
        throw new Error(receipt)
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

// Appends the html object for a specific match to end of the game list by default, but can specifiy div
function appendListing(match, divToAppendTo = $('#gameList')){
  // Get listing data from match
  let creator = match.creator
  let opponent = (creator == match.opponent) ? "No Opponent" : match.opponent  // If creator is the opponent, then they're looking for an opponent
  let wager = web3js.utils.fromWei(web3js.utils.toBN(match.wager), "ether")  // Convert Wei amount to Ether amount. Easier to understand for user

  // Create listing elements
  let newMatch = document.createElement('div');
  let txtDiv = document.createElement('div'); // Text div
  let btnDiv = document.createElement('div'); // Button div
  let spcDiv = document.createElement('div'); // Spacer div

  txtDiv.id = 'txtDiv'
  txtDiv.innerHTML =
    `
      <span>Challenger: </span>
      <span id="chalAcc">${creator}</span>
      <span>---</span>
      <span>Amount: </span>
      <span id="chalAmount">${wager}</span>
      <span> Eth</span>
    `

  btnDiv.id = 'btnDiv'
  btnDiv.innerHTML =
    `
      <button id="rock" onclick="shoot(this)">Rock</button>
      <button id="paper" onclick="shoot(this)">Paper</button>
      <button id="scissor" onclick="shoot(this)">Scissor</button>
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

// Inserts the html object for a specific match to the ordered location in the game list
// Game list is ordered by etherium amount, descending
function insertListing(match){
  let prevDiv = $('#gameList').children('div')[0] // Default to TopMatch. Use: if the current top RPSMatch is smaller than this match, append below TopMatch
  let matchWager = web3js.utils.toBN(match.wager) // Convert insert match wager's to a BN

  if($('#gameList').children('div').length == 1){ // If there's JUST TopMatch, then insert this game and end insertion
    appendListing(match, prevDiv)
    return
  }

  $('#gameList').children('div') // Get all children divs of the gameList
  .each(function(){
    if($(this).attr('id') == 'topMatch'){
      return true // TopMatch is just a place holder, so skip over it
    }
    let curWeiWager = web3js.utils.toWei(String($(this).find('#txtDiv').find('#chalAmount').html()), "ether") // Convert displayed ether to BN Wei 
    curWeiWager = web3js.utils.toBN(curWeiWager)  // Convert Wei value to a BN

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
      'creator': data.creator,
      'opponent': data.opponent,
      'wager': data.wager,
      'outcome': data.outcome
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
  return web3js.utils.toBN(matchA.wager).cmp(web3js.utils.toBN(matchB.wager)) * -1;
}

// Compares two matches by their wager amounts. Uses BN.js to safeguard 
// Defaults ordering in ascending order (lowest to highest)
function _compareByEthAsc(matchA, matchB){
  return web3js.utils.toBN(matchA.wager).cmp(web3js.utils.toBN(matchB.wager));
}


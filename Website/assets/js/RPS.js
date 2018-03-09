var web3js 
var moveMap = new Map();
    moveMap.set('rock', 0);
    moveMap.set('paper', 1);
    moveMap.set('scissor', 2);

const abi = [
  {
    "constant": true,
    "inputs": [],
    "name": "numActiveMatches",
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
    "inputs": [],
    "name": "getNumActiveMatches",
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
    "name": "getNumActiveMatches",
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
        "name": "wager",
        "type": "uint256"
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
  }];
const address = "0x252dDC0A3309461EDad16F8b027047205fD055A1";
var contract;
var canCreateMatch = true; // The player can only have one match up at a time

window.addEventListener('load', function() {
  web3js = new Web3(Web3.givenProvider || "http://localhost:8501");

  if(web3js !== 'undefined'){
    contract = new web3js.eth.Contract(abi, address) // Obtain contract with specified abi and address

    web3js.eth.getAccounts()
    .then(function(accounts){
      var activeMatchesOps = {
        from: accounts[0]
      }

      // Set canCreateMatch based on contract data
      contract.methods.getNumActiveMatches().call(activeMatchesOps)  // Call hasActiveMatch() w/ specified options
      .then(function (result){
        canCreateMatch = !(result > 0)  // If this player has more than 0 active matches, they cannot create matches 
        console.log(result)
      })
    })

    startApp() // Then after obtaining, startApp
    // Now you can start your app & access web3 freely:
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
  checkNetwork()
}

// Checks the MetaMask network to ensure user is on the mainnet 
function checkNetwork(){
  web3js.eth.net.getId((err, netId) => {
    switch (netId) {
      case 1:
        // In mainnet
        console.log('This is mainnet')
        break
      case 3:
        // In Ropset test network
        console.log('This is the ropsten test network.')
        break
      default:
        // In some other network (may or may not be unknown)
        console.log('This is some other network.')
    }
  })
}

// List the ongoing games that are on the block chain
function populateGames(){
  contract.getMatchIDsOfAddress("0x9CD16ef861Ee022A214E54d1ef9321dDA0ecD222")
  // {
  //   var idList = []
  //   for(var i = 0; i < ret.length; i++){
  //     idList[i] = ret[i].toNumber()
  //   }
  //   console.log(idList)

  //   for(var i = 0; i < idList.length; i++){
  //     contract.getMatch(idList[i], function(err, ret){
  //       console.log("Match info = " + ret)
  //       console.log(ret[0]);  // creator
  //       console.log(ret[1]);  // opponent
  //       console.log(ret[2].toNumber());  // wager
  //       console.log(ret[3].toNumber());  // outcome
  //     })
  //   }
  // })
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

function createMatch(){
  var acc
  web3js.eth.getAccounts(function(accountsError, accounts)
  {
    // Obtain player's account from ethjs
    if(accountsError){
      throw new Error(accountsError)
    }else if(!canCreateMatch){
      throw new Error("Can only have one match at a time")
    }
    acc = accounts[0]
    ethAmount = $("#ethAmount").val() // In Eth, need to be converted to Wei
  })
  .then(function (){  // Create rps match on the blockchain
    if(ethAmount !== 'undefined' && ethAmount > 0){
      var createMatchOps = {
        from: acc,
        value: web3js.utils.toWei(ethAmount, 'ether')  // Solidity Contract is payable with Wei, not ether
      }

      contract.methods.createMatch().send(createMatchOps) // Send createMatch() w/ specified options
      .on('transactionHash', function(hash){  // When blockchain revieves function request
        canCreateMatch = false  // Player is in the process of creating match. Cannot create another
        console.log("Starting transaction...")
      })
      .on('receipt', function(receipt){  // When blockchain has finished function execution
        console.log(receipt)
        console.log(receipt.from)
        console.log(receipt.returnValues)
      })
      .on('error', function(rec){
        canCreateMatch = true // If transaction errors out, player can create a match again
        console.log("Errored out")
        if(rec){
          console.log(rec)
          // ran out of gas
        }else{
          console.log("else")
          console.log(rec)
          // some other error
        }
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


// Creates the html object for a specific match
function createListing(acc, ethAmount){
    var div = document.createElement('div');
    var txtDiv = document.createElement('div'); // Text div
    var btnDiv = document.createElement('div'); // Button div
    var spcDiv = document.createElement('div'); // Spacer div

    txtDiv.id = 'txtDiv'
    txtDiv.innerHTML =
      `
        <span>Challenger: </span>
        <span id="chalAcc">${acc}</span>
        <span>---</span>
        <span>Amount: </span>
        <span id="chalAmount">${ethAmount}</span>
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

    div.id = acc
    div.appendChild(txtDiv);
    div.appendChild(btnDiv);
    div.appendChild(spcDiv);
    $('#gameList').append(div);
}

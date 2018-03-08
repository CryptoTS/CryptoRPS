// Modified from https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#partly_sunny-web3---ethereum-browser-environment-check
var eth 
var moveMap = new Map();
    moveMap.set('rock', 0);
    moveMap.set('paper', 1);
    moveMap.set('scissor', 2);

window.addEventListener('load', function() {
  eth = new Eth(new Eth.HttpProvider('http://localhost:8501'));

  if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
    eth.setProvider(window.web3.currentProvider);
  } else {
    eth.setProvider(provider);
  }

  if(eth !== 'undefined'){
  // Now you can start your app & access web3 freely:
    startApp()
  }else{
    notConnected()
  }
})

// If web3 injection cannot be confirmed
function notConnected(){
  console.log("Not connected")
}

// Starts app after web3 injection has been confirmed
function startApp(){
  checkNetwork();
  populateGames();
  console.log("App started")
}

// Checks the MetaMask network to ensure user is on the mainnet 
function checkNetwork(){
  web3.version.getNetwork((err, netId) => {
    switch (netId) {
      case "1":
        // In mainnet
        console.log('This is mainnet')
        break
      case "3":
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

}

// Fired when rock/paper/scissor is played (ie, 'Rock, Paper, Scissor... Shoot!')
function shoot(btn){
  eth.accounts(function(accountsError, accounts)
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
  eth.accounts(function(accountsError, accounts)
  {
    // Obtain player's account from ethjs
    if(accountsError){
      return
    }
    acc = accounts[0]
    ethAmount = $("#ethAmount").val()
  })
  .then(createBlock(acc, ethAmount)) // Create rps match on the blockchain
  .then(createListing(acc, ethAmount)) // Create a listing of the rps match on the website
  .catch(function(err)
  {
    console.error(err)
  })
}

function createBlock(acc, ethAmount){
  if(ethAmount !== 'undefined' && ethAmount > 0){
  }else{
    throw new Error("Invalid Etherium Amount")
  }
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

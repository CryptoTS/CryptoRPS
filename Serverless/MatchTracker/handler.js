'use strict';

// Variables
//  ---MOVEMAP---
  // -1 =>  awaiting move
  // 0  =>  rock
  // 1  =>  paper
  // 2  =>  scissor

var web3js = require('web3')
var matchesToMoves = {} // A Map of MatchID to player's current match move
                        // Ex matchesToMoves = {1:{creator: 0, opponent: 0}, 2:{creator:0, opponent:-1}}
                            // In Match ID 1, both creator and opponent player rock, thus it's a tie
                            // In Match ID 2, creator has played rock, but opponent has yet to make a move
                            // NOTE: Since Match ID 1 has completed the match, it's value would be rest to {creator:-1, opponent:-1}
                            // NOTE: After a best-of-3 has been played out, matchesToMoves will keep the last move

var matchesToAddr = {}  // A Map of matchID to player's addresses
                        // Ex: matchesToAddr = {1:{creator: 0x49c9..., opponent: 0x02cd1...}} 

var matchesToWins = {}  // A Map of matchID to game move results
                        // Ex: matchesToWins = {1:{creator: 1, opponent: 0}, 2:{creator:0, opponent: 2}}
                            // In Match ID 1, the creator has beaten the opponent in the first 'shoot' (ie. creator played rock, opponent played scissors)
                            // For now, we're playing best-of-3s, so in Match ID 2, the opponent won the overall match

// Called when a player plays a move. Event should contain the player's address and move they made
// ex. event = {matchID, address: 0x02..., move: 0}
// Callback will contain the winner address (0x0 if tie) and the updated matchesToWins[matchID]
module.exports.shoot = (event, context, callback) => {
  console.log(event)
  let matchID = event.matchID
  let playerAdr = event.address
  let playerMv = event.move

  if(playerAdr != matchesToAddr[matchID].creator && playerAdr != matchesToAddr[matchID].opponent){
    // Player address who is neither the creator nor the opponent of the specific matchID tried to 'shoot'
    console.log("ERROR 001:")
    console.log("\tplayerAdr=>" + playerAdr)
    console.log("\tcreator=>" + matchesToAddr[matchID].creator)
    console.log("\topponent=>" + matchesToAddr[matchID].opponent)
    callback('ERROR 001')
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      awaitingOpponent: true
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

/** HELPER FUNCTIONS **/

function safeParse(maybeJSON) {

  var json;
  try {
    json = JSON.parse(maybeJSON);
  }
  catch (err) {
    json = maybeJSON;
  }

  return json;
}

"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var board = require('./board');
var tictactoe = require('./tictactoe')

var useEmulator = (process.env.NODE_ENV == 'development');
if (useEmulator) {
  console.log("Using Emulator!");
}

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
  appId: process.env['MicrosoftAppId'],
  appPassword: process.env['MicrosoftAppPassword'],
  stateEndpoint: process.env['BotStateEndpoint'],
  openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

// Default dialogue. Mostly just greets user and calls the setup dialogue
bot.dialog('/', [
  function (session) {
    builder.Prompts.confirm(session, 'Hi! Do you want to play tic tac toe?');
  },
  function (session, results) {
    if (results.response) {
      session.beginDialog('setup');
    } else {
      session.endDialog('Okay, goodbye!')
    }
  }
]);

// sets up the game and restarts it when necessary
bot.dialog('setup', [
  function(session) {
    session.conversationData.board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    session.conversationData.turn = 0;
    session.send('Great!');
    var msg = new builder.Message(session);
    msg.addAttachment(board.board_message(session.conversationData.board));
    session.send(msg);
    session.send('You go first!');
    session.beginDialog('playGame');
  }, function (session) {
    builder.Prompts.confirm(session, "Want to play again?");
  }, function(session, results) {
    if (results.response) {
      session.beginDialog('setup');
    } else {
      session.endDialog('Okay, goodbye!');
    }
  }
]);

// report the results of the game
function report_results(session, game) {
  if (game.user_wins()) {
    session.send("Great Job! You Win!");
  } else if (game.computer_wins()) {
    session.send("I Win! Muahahahaha");
  } else if (game.tie()) {
    session.send("It's a tie!");
  }
}

// gameplay dialogue - loops once per turn
bot.dialog('playGame',
  function(session, args, next) {
    if (session.message && session.message.value) {
      var x = session.message.value.x;
      var y = session.message.value.y;
      var game = new tictactoe.game(session.conversationData.board);
      session.conversationData.turn += 1;

      // Play user's move and send the resulting board
      game.userMove(x, y);
      var msg = new builder.Message(session);
      msg.addAttachment(board.board_message(session.conversationData.board));
      session.send(msg);

      if (game.game_over) {   // check if the game is over
        report_results(session, game);
        session.endDialog();
        return;
      }

      // Have the computer make its move
      var responses = ["hmm ...", "my turn!", "nice!", "I'm thinking ..."];
      session.send(responses[session.conversationData.turn % responses.length]);
      game.computerMove();
      var msg = new builder.Message(session);
      msg.addAttachment(board.board_message(game.board));
      session.send(msg);

      if (game.game_over) {
        report_results(session, game);
        session.endDialog();
        return;
      }
      session.send("your turn!");
    }
    //session.send("Sorry, I didn't understand that!");
  }
);

if (useEmulator) {
  var restify = require('restify');
  var server = restify.createServer();
  server.listen(3978, function() {
    console.log('test bot endpont at http://localhost:3978/api/messages');
  });
  server.post('/api/messages', connector.listen());
} else {
  module.exports = { default: connector.listen() };
}

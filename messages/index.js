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
    builder.Prompts.confirm(session, "Hi! Do you want to play tic tac toe?");
  },
  function (session, results) {
    if (results.response) {
      session.send('Great!');
      session.beginDialog('setup');
    } else {
      session.beginDialog('quit');
    }
  }
]);

// sets up the game and restarts it when necessary
bot.dialog('setup', [
  function(session) {
    session.conversationData.board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    session.conversationData.turn = 0;
    var msg = new builder.Message(session);
    msg.addAttachment(board.board_message(session.conversationData.board));
    session.send(msg);
    session.send('You go first!');
    session.beginDialog('playGame');
  }, function (session) {
    builder.Prompts.confirm(session, "Want to play again?");
  }, function(session, results) {
    if (results.response) {
      session.send('Me too!');
      session.replaceDialog('setup');   // restart if the user wants to play again
    } else {
      session.beginDialog('quit');
    }
  }
]).reloadAction("restartGame", "Starting over ...", {
    // restarts the game
    matches: /^restart$/i,
    confirmPrompt: "Are you sure you want to restart?"
});

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

// gameplay dialog - loops once per turn
bot.dialog('playGame',
  function(session) {
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

      // check if the game is over
      if (game.game_over) {
        report_results(session, game);
        session.endDialog();
        return;
      }

      // Have the computer make its move
      var responses = ["hmm ...", "my turn!", "nice!", "I'm thinking ..."];
      session.send(responses[session.conversationData.turn % responses.length]);
      session.sendTyping();
      game.computerMove();
      var msg = new builder.Message(session);
      msg.addAttachment(board.board_message(game.board));
      session.send(msg);

      // check if game over
      if (game.game_over) {
        report_results(session, game);
        session.endDialog();
        return;
      }
      session.send("your turn!");
    }
  }
);

// Help dialog
// Message is not sent in a separate dialog because doing so ends the 'playGame' dialog
bot.dialog('help', function (session, args, next) {}).triggerAction({
    matches: /^help$/i,
    // (override the default behavior of replacing the stack)
    onSelectAction: function(session, args, next) {
        session.send("I'm a bot that plays tic tac toe! <br/>Please type ‘quit’ or ‘restart’ if you don’t want to keep playing.");
    }
});

// alternative help dialogue
// issue - quits game
// bot.dialog('help', function (session, args, next) {
//     //session.send("This is a bot that plays tic tac toe! <br/>Please type ‘quit’ or ‘restart’ if you don’t want to keep playing.");
// }).triggerAction({
//     matches: /^help$/i,
//     onSelectAction: (session, args, next) => {
//         // Add the help dialog to the dialog stack
//         // (override the default behavior of replacing the stack)
//         session.send("I'm a bot that plays tic tac toe! <br/>Please type ‘quit’ or ‘restart’ if you don’t want to keep playing.");
//         //session.beginDialog(args.action, args);
//     }
// });

// This dialog ends the conversation.
// The user can trigger it at any time by typing 'quit'
// Issue - confirm prompt is not sent
bot.dialog("quit", function(session){
        session.endConversation('Okay, goodbye!');
}).triggerAction({
    matches: /^quit$/i,
    confirmPrompt: "Are you sure you want to quit?"
});

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

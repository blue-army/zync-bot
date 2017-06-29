"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var board = require('./board');
var tictactoe = require('./tictactoe');

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

// Send the current board as an AdaptiveCard
function send_board(session) {
   var msg = new builder.Message(session);
   var current_board = new board.BoardMessage(session.conversationData.board, session.conversationData.turn);
   msg.addAttachment(current_board.schema());
   session.send(msg);
}

// sets up the game and restarts it when necessary
bot.dialog('setup', [
   function(session) {
      session.conversationData.board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      session.conversationData.turn = 0;
      send_board(session);
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

// Play one turn of the game
function play_turn(session, x, y) {
   var game = new tictactoe.game(session.conversationData.board);
   if (!game.is_available(x, y)) {
      session.send("Sorry, that square is already full. Try again!");
      return;   // return if the selected square is not available
   }
   session.conversationData.turn += 1;

   // Play user's move and send the resulting board
   game.userMove(x, y);
   send_board(session);

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
   send_board(session);

   // check if game over
   if (game.game_over) {
      report_results(session, game);
      session.endDialog();
      return;
   }
   session.send("your turn!");
}

// gameplay dialog - loops once per turn
bot.dialog('playGame',
function(session) {
   if (session.message && session.message.value) {
      // filter out selections from older boards (inc. double-clicks)
      if (session.message.value.turn !== session.conversationData.turn) {
         // send message if the board is too old for it to have been a double-click
         if (session.message.value.turn + 1 < session.conversationData.turn) {
            session.send("oops! It looks like you clicked on an old version of the board.");
            return;
         }
      }
      var x = session.message.value.x;
      var y = session.message.value.y;
      play_turn(session, x, y);
   }
   else if (session.message && session.message.text) {
      var coords = session.message.text;
      // rule out leftover user inut from the calling dialog
      if (['yes', 'no', 'restart'].includes(coords)) {
         return;
      }
      // convert user input to board coordinates
      // Full expression: /^(?:([123])([ABC])|([ABC])([123]))$/i
      var re = /^([ABC])([123])$/i;
      var re_result = coords.match(re);
      if (re_result) {
         var col = re_result[1].toUpperCase();
         var row = re_result[2];
         var messages = ["%s%s ... got it!", "Playing %s%s ...", "%s%s ... is this a trap?"];
         session.send(messages[session.conversationData.turn % messages.length], col, row);
         var x = ['A', 'B', 'C'].indexOf(col);
         var y = ['1', '2', '3'].indexOf(row);
         if (useEmulator) session.send("(%d, %d)", x, y);
         play_turn(session, x, y);
      } else {
         session.send("I didn't understand that! Please enter the coordinates of a square (e.g. A1 or B3), or type 'help' for more info.");
      }
   }
}
);

// Help dialog
// Message is not sent in a separate dialog because doing so ends the 'playGame' dialog
bot.dialog('help', function (session, args, next) {}).triggerAction({
   matches: /^help$/i,
   // (override the default behavior of replacing the stack)
   onSelectAction: function(session, args, next) {
      session.send("I'm a bot that plays tic tac toe!");
      session.send("Please type ‘quit’ or ‘restart’ if you don’t want to keep playing.");
      session.send("To play, click on an open tile or type in its row and column (like A1 or C2).<br/>Some platforms, like Slack, will only allow text input.");
   }
});

// This dialog ends the conversation.
// The user can trigger it at any time by typing 'quit'
// Issue - confirmation prompt is not sent
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
      console.log('test bot endpoint at http://localhost:3978/api/messages');
   });
   server.post('/api/messages', connector.listen());
} else {
   module.exports = { default: connector.listen() };
}

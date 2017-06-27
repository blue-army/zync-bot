bot.dialog('/', function (session) {
    session.conversationData.board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    session.conversationData.turn = 0;
    session.beginDialog('intro');
    //session.endDialog();
});

// bot.dialog('playAgain', [
//   function(session) {
//     builder.Prompts.confirm(session, "Want to play again?");
//   }, function (session, results) {
//     console.log("Second function called!");
//     session.send("Your response: " + results.response);
//     if (results.response) {
//       session.send('You go first!\n');
//       var msg = new builder.Message(session);
//       msg.addAttachment(board.board_message(session.conversationData.board));
//       session.send(msg);
//       session.beginDialog('playGame');
//     }
//   }
// ]);
//
// bot.dialog('setup',
//   function(session) {
//     session.send("first setup function!");
//     session.conversationData.board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
//     session.conversationData.turn = 0;
//     session.send('Great!');
//     var msg = new builder.Message(session);
//     msg.addAttachment(board.board_message(session.conversationData.board));
//     session.send(msg);
//     session.send('You go first!');
//     session.beginDialog('playGame');
//   }
// );

// bot.dialog('moveReceieved', function(session) {
//   session.send("nice!");
// });

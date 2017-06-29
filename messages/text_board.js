// var sp = require('sprintf-js').vsprintf;
var vsprintf = require('sprintf-js').vsprintf;

var colNames = ['A', 'B', 'C'];
var rowNames = ['1', '2', '3'];
var chars = ['_', 'X', 'O'];
function TextBoard(board_state) {
  var board = vsprintf("~ | %s | %s | %s | <br/>", colNames);
  for (var row = 0; row < 3; row ++) {
     tokens = [rowNames[row]];
     for (var col = 0; col < 3; col ++) {
        tokens.push(chars[board_state[row][col]]);
     }
     board += vsprintf("%s | %s | %s | %s | <br/>", tokens);
 }
 return board;
}
exports.TextBoard = TextBoard;

var state = [
   [0,1,2],
   [1,0,1],
   [2,1,2]
];
console.log(TextBoard(state));

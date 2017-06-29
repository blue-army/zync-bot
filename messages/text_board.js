// var sp = require('sprintf-js').vsprintf;
var vsprintf = require('sprintf-js').vsprintf;

var style1 = {
   "header": "~ | %s | %s | %s | <br/>",
   "row"   : "%s | %s | %s | %s | <br/>"
}

var style2 = {
   "header": "~~ %s, %s, %s ~~ <br/>",
   "row"   : "%s [ %s, %s, %s ] <br/>"
}

var style = style2;
var colNames = ['A', 'B', 'C'];
var rowNames = ['1', '2', '3'];
var chars = ['_', 'X', 'O'];
function TextBoard(board_state) {
  var board = vsprintf(style.header, colNames);
  for (var row = 0; row < 3; row ++) {
     tokens = [rowNames[row]];
     for (var col = 0; col < 3; col ++) {
        tokens.push(chars[board_state[row][col]]);
     }
     board += vsprintf(style.row, tokens);
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

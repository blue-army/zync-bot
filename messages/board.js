
// Converts the board state into an adaptive card schema
exports.board_message = function board(board_state) {
  var board_cols = [];
  for (var x = 0; x < 3; x++) {
    board_cols.push(board_col(x, board_state));
  }
  var msg = {
    contentType: "application/vnd.microsoft.card.adaptive",
    content: {
      type: "AdaptiveCard",
      speak: "<s>Your Turn!</s>",
      "body": [
        {
          "type": "ColumnSet",
          "columns": board_cols
        }
      ]
    }
  };
  return msg;
}

// returns json schema for a column of board squares
function board_col(x, board_state) {
  squares = [];
  for (var y = 0; y < 3; y++) {
    squares.push(board_square(x, y, board_state[y][x]));
  }
  var col =  {
      "type": "Column",
      "items": squares
  };
  return col;
}

var images = [
  "http://adaptivecards.io/api/cat/0",
  "http://adaptivecards.io/api/cat/1",
  "http://adaptivecards.io/api/cat/2"
];
// returns json schema for a single board square
function board_square(x, y, state) {
  var square = {
    "type": "Image",
    "url": images[state],
    "horizontalAlignment": "center"
  };
  // specify action when a free square is clicked
  if (state === 0) {
    square.selectAction = {
      "type": "Action.Submit",
      "title": "Action.Submit",
      "data": {
        "x" : x,
        "y" : y
      }
    };
  }
  return square;
}

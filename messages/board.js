// Images to use in board squares
// previous images: http://adaptivecards.io/api/cat/2
var prod_images = [
  process.env.ttt_blank_square,
  process.env.ttt_x_square,
  process.env.ttt_o_square,
];
var dev_images = [
  "http://files.softicons.com/download/culture-icons/avatar-minis-icons-by-joumana-medlej/png/96x96/Penguin.png",
  "http://files.softicons.com/download/culture-icons/avatar-minis-icons-by-joumana-medlej/png/96x96/Fire%20Nation%20Aang.png",
  "http://files.softicons.com/download/culture-icons/avatar-minis-icons-by-joumana-medlej/png/96x96/Toph.png"
];

// Create and export the board object
function BoardMessage(board_state, turn) {
  this.board_state = board_state;
  this.turn = turn;
  this.images = (process.env.NODE_ENV == 'development') ? dev_images : prod_images;
}
exports.BoardMessage = BoardMessage;

BoardMessage.prototype.rowNames = ['A', 'B', 'C'];
BoardMessage.prototype.colNames = [1, 2, 3];

// Converts the board state into an adaptive card schema
BoardMessage.prototype.schema = function() {
  var board_cols = [];
  for (var x = 0; x < 3; x++) {
    board_cols.push(this.board_col(x));
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
};

// returns json schema for a column of board squares
BoardMessage.prototype.board_col = function(x) {
  squares = [this.label(this.colNames[x])];
  for (var y = 0; y < 3; y++) {
    squares.push(this.board_square(x, y));
  }
  var col =  {
      "type": "Column",
      "items": squares
  };
  return col;
};

// returns json schema for a single board square
BoardMessage.prototype.board_square = function(x, y) {
  var state = this.board_state[y][x];
  var square = {
    "type": "Image",
    "url": this.images[state],
    "horizontalAlignment": "center"
  };
  // specify action when a free square is clicked
  if (state === 0) {
    square.selectAction = {
      "type": "Action.Submit",
      "title": "Action.Submit",
      "data": {
        "x" : x,
        "y" : y,
        "turn" : this.turn
      }
    };
  }
  return square;
};

BoardMessage.prototype.label = function(text) {
  var label = {
    "type": "TextBlock",
    "text": text,
    "horizontalAlignment": "center"
  };
  return label;
};

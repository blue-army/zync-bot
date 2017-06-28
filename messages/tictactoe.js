
// Game prototype stores game state and info
function Game(board_state) {
  this.board = board_state;
  this.game_over = false;
  this.winner = 0;
  this.computer_token = 1;
  this.user_token = 2;
}
exports.game = Game;

// Check if the user has won
Game.prototype.user_wins = function() {
  return this.game_over && this.winner === this.user_token;
};

// Check if the computer has won
Game.prototype.computer_wins = function() {
  return this.game_over && this.winner === this.computer_token;
};

// Check if the players tied
Game.prototype.tie = function() {
  return this.game_over && this.winner === 0;
};

// Have user make a move at the specified location
Game.prototype.userMove = function(x, y) {
  this.move(x, y, this.user_token);
};

// Algorithm for computer to choose square
Game.prototype.basic_move = function() {
  for (var row = 0; row < 3; row ++) {
    for (var col = 0; col < 3; col ++) {
      if (this.board[row][col] === 0) {
        return [row, col];
      }
    }
  }
  return [0,0];
};

// Have the computer make a move
Game.prototype.computerMove = function() {
  [row, col] = this.basic_move();
  this.move(col, row, this.computer_token);
};

// update board and then check if someone has won
Game.prototype.move = function(x, y, token) {
  if (this.board[y][x] != 0) {
    console.error("Invalid Game Move!");
    return;
  }
  this.board[y][x] = token;
  this.update_status(x, y, token);
};

// Check if all the tokens in the given row are equal
Game.prototype.row_equal = function(row) {
  return this.board[row][0] === this.board[row][1] && this.board[row][1] === this.board[row][2];
};

// Check if all the tokens in the given col are equal
Game.prototype.col_equal = function(col) {
  return this.board[0][col] === this.board[1][col] && this.board[1][col] === this.board[2][col];
};

// Check if the tokens on the downwards diagonal are equal
Game.prototype.down_diag_equal = function() {
  return this.board[0][0] === this.board[1][1] && this.board[1][1] === this.board[2][2];
};

// Check if the tokens on the upwards diagonal are equal
Game.prototype.up_diag_equal = function() {
  return this.board[0][0] === this.board[1][1] && this.board[1][1] === this.board[2][2];
};

// Check if the board is full
Game.prototype.board_full = function() {
  for (var row = 0; row < 3; row++) {
    for (var col = 0; col < 3; col++) {
      if (this.board[row][col] === 0) {
        return false;
      }
    }
  }
  return true;
};

// Check if the game has been won, and update corresponding instance vars
// x and y are the coordinates of the most recently played token.
Game.prototype.update_status = function(x, y, token) {
  this.game_over = (this.col_equal(x) || this.row_equal(y)
                    || (x === y && this.down_diag_equal())
                    || ((x+y)===2 && this.up_diag_equal()));
  if (this.game_over) {
    this.winner = token;
  }
  else if (this.board_full()) {
    this.game_over = true;
  }
  console.log("Game status: game over = " + this.game_over);
};

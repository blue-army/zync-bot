// game-playing agent
function Agent() {
    this.row_triplets = [];
    this.col_triplets = [];
    this.diag_triplets = [];
}
exports.Agent = Agent;

// stores the score for each triplet state
Agent.prototype.scorer = {
    0: {
        0: 1,       // expanding into an empty triplet
        1: 10,      // placing a second tile in a triplet with none of the opponent's pieces
        2: 5        // block opponent (not urgent)
    },
    1: {
        1: 500,     // win game!
        2: 0        // triplet already contains both players' pieces
    },
    2: {
        2: 50       // block opponent (urgent)
    }
};

// extracts all the triplets on the board
Agent.prototype.extract_triplets = function(board) {
    this.row_triplets = [[], [], []];
    this.col_triplets = [[], [], []];
    this.diag_triplets = [[], []];

    // populate triplets
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            triplets = this.get_triplets(row, col);
            triplets.forEach(function(triplet) {
                triplet.push(board[row][col]);
            });
        }
    }
};

// returns a list of the triplets that include the given position
Agent.prototype.get_triplets = function(row, col) {
    triplets = [this.row_triplets[row], this.col_triplets[col]];
    if (row === col) {
        triplets.push(this.diag_triplets[0]);
    }
    if (row + col === 2) {
        triplets.push(this.diag_triplets[1]);
    }
    return triplets;
};

// returns an object containing the row, col, and score of the move that the agent has chosen
Agent.prototype.choose = function(board) {
    var best_move = {"score": -1};
    this.extract_triplets(board);
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            if (board[row][col] === 0) {
                var score = this.score_move(row, col);
                if (score > best_move.score) {
                    best_move.row = row;
                    best_move.col = col;
                    best_move.score = score;
                }
            }
        }
    }
    return best_move;
};

// estimates utility of placing a marker at the given position
Agent.prototype.score_move = function(row, col) {
    var triplets = this.get_triplets(row, col);
    var score = 0;
    triplets.forEach(function(triplet) {
        score += this.score_triplet(triplet);
    }, this);
    return score;
};

// scores a triplet with at least 1 empty square
Agent.prototype.score_triplet = function(triplet) {
    triplet.sort();
    return this.scorer[triplet[1]][triplet[2]];
};

// testing
// var agent = new Agent();
// var board = [
//  [1,0,1],
//  [2,2,0],
//  [0,0,0]
// ];
// console.log(agent.choose(board));

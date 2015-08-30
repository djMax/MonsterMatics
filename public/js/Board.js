import Card from './Card';

export default class Board {
    /**
     * Pick random cards for a board
     * @param rows
     * @param columns
     * @param maxCard
     * @returns {{cards: Array, board: Array}}
     */
    constructor(rows, columns, maxCard) {
        var board = [], cards = [];
        for (var x = 0; x < columns; x++) {
            board[x] = [];
            for (var y = 0; y < rows; y++) {
                var card = new Card(parseInt(Math.random() * maxCard, 10) + 1, x, y);
                board[x][y] = card;
                cards.push(card);
            }
        }
        this.maxCard = maxCard;
        this.width = columns;
        this.height = rows;
        this.cards = cards;
        this.grid = board;
    }

    getMovesForRemovedCards(cards) {
        var cardMoves = {};
        for (var card of cards) {
            console.log('Card in set', card.x, card.y);
            if (card.y > 0) {
                for (var y = 0; y < card.y; y++) {
                    var key = card.x + '#' + y;
                    if (cardMoves[key]) {
                        cardMoves[key].dy++;
                    } else {
                        cardMoves[key] = {card:this.grid[card.x][y], y: y, dy:1};
                    }
                }
            }
        }
        return Object.keys(cardMoves).map((k) => cardMoves[k]);
    }

    removeAndReplace(cards, moves) {
        moves = moves.slice().sort((a,b) => {
           return b.y - a.y;
        });
        console.log('moves', moves);
        console.log('start\n', this.toString());
        // Remove the cards
        for (var c of cards) {
            this.grid[c.x][c.y] = null;
            this.cards.splice(this.cards.indexOf(c), 1);
        }
        console.log('removed\n', this.toString());
        for (var x = 0; x < this.width; x++) {
            for (var y = this.height - 1; y > 0; y--) {
                if (this.grid[x][y] === null) {
                    // Move the items above down one
                    for (var above = y-1; above >= 0; above--) {
                        if (this.grid[x][above]) {
                            this.grid[x][above].y++;
                            if (y !== 1) {
                                // Run this iteration again
                                y++;
                            }
                        }
                        this.grid[x][above+1] = this.grid[x][above];
                    }
                    this.grid[x][0] = null;
                }
            }
        }
        console.log('moved\n', this.toString());
        var newCards = [];
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.grid[x][y] === null) {
                    var card = new Card(parseInt(Math.random() * this.maxCard, 10) + 1, x, y);
                    this.grid[x][y] = card;
                    this.cards.push(card);
                    newCards.push(card);
                }
            }
        }
        return newCards;
    }

    toString() {
        var rows = [];
        for (let r = 0, rlen = this.grid.length; r < rlen; r++) {
            var vals = [];
            for (let c = 0, clen = this.grid[r].length; c < clen; c++) {
                if (this.grid[c][r]) {
                    if (this.grid[c][r].x !== c || this.grid[c][r].y !== r) {
                        console.log('Should be', c, r, 'but is', this.grid[c][r].x, this.grid[c][r].y);
                    }
                }
                vals.push(this.grid[c][r] ? this.grid[c][r].value : '*');
            }
            rows.push(vals.join(' '));
        }
        return rows.join('\n');
    }
}
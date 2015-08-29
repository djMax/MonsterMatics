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
        for (var r = 0; r < rows; r++) {
            board[r] = [];
            for (var c = 0; c < columns; c++) {
                var card = new Card(parseInt(Math.random() * maxCard, 10) + 1, r, c);
                board[r][c] = card;
                cards.push(card);
            }
        }
        this.cards = cards;
        this.grid = board;
    }

    toString() {
        var rows = [];
        for (let r = 0, rlen = this.grid.length; r < rlen; r++) {
            var vals = [];
            for (let c = 0, clen = this.grid[r].length; c < clen; c++) {
                vals.push(this.grid[r][c].value);
            }
            rows.push(vals.join(' '));
        }
        return rows.join('\n');
    }
}
/*global describe:false, it:false, beforeEach:false, afterEach:false*/

'use strict';

require('babel/register');

var assert = require('assert'),
    Board = require('../public/js/Board'),
    Card = require('../public/js/Card'),
    algos = require('../public/js/algorithms');


describe('Algorithms', function () {

    it('should find a solution for a simple cube with multiplication', function () {
        var cards = [{value: 3}, {value: 3}, {value: 3}];
        var solutions = algos.findValidCombinations(27, cards);
        assert.equal(solutions.length, 1);
        assert.equal(Card.describe(cards, solutions[0]), '3 × 3 × 3');
    });

    it('should find a solution for a simple sum with addition', function () {
        var cards = [{value: 3}, {value: 3}, {value: 3}];
        var solutions = algos.findValidCombinations(9, cards);
        assert.equal(solutions.length, 1);
        assert.equal(Card.describe(cards, solutions[0]), '3 + 3 + 3');
    });

    it('should find a solution with multiplication and addition', function () {
        var cards = [{value: 3}, {value: 4}, {value: 5}];
        var solutions = algos.findValidCombinations(35, cards);
        assert.equal(solutions.length, 1);
        assert.equal(Card.describe(cards, solutions[0]), '3 + 4 × 5');
    });

    it('should find a solution with multiplication and addition', function () {
        var cards = [{value: 2}, {value: 4}, {value: 4}];
        var solutions = algos.findValidCombinations(12, cards);
        assert.equal(solutions.length, 1);
        assert.equal(Card.describe(cards, solutions[0]), '2 × 4 + 4');
    });

    it('should choose a board', function () {
        var board = new Board(4, 4, 10);
        console.log(board.toString());
    });

    it('should choose a board and target', function () {
        var board = new Board(4, 4, 10);
        console.log(board.toString());
        var target = algos.chooseTarget(board, 4, 1, 50, 0);
        console.log('Easiest target:', target.target, 'with', target.count, 'combinations');
        for (var s = 0; s < target.solutions.length; s++) {
            console.log(' Solution #' + s + ':', Card.describe(target.solutions[s]));
        }
	var target2 = algos.chooseTarget(board, 4, 1, 50, -1);
        console.log('Hardest target:', target2.target, 'with', target2.count, 'combinations');
        for (var s = 0; s < target2.solutions.length; s++) {
            console.log(' Solution #' + s + ':', Card.describe(target2.solutions[s]));
        }
    });
});

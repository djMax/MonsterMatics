'use strict';

var Combinatorics = require('js-combinatorics'),
    Card = require('./Card');

var mathFunctions = {
    '×': (a, b) => a * b,
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '÷': (a, b) => a / b
}
var mathOperators = ['×', '+', '-', '÷'];

export var Operators = {
    TIMES: '×',
    PLUS: '+',
    MINUS: '-',
    DIVIDE: '÷'
};

/**
 * Find all combinations of operators using the cards that result in the target number
 * @param targetNumber
 * @param cards
 * @returns {Array} An array of arrays with which operators are used
 * @example findValueCombinations(9, [Card(3), Card(3), Card(3)]) = [ [ '+', '+' ] ]
 */
export function findValidCombinations(targetNumber, cards) {
    let operators = new Array(cards.length - 1), solutions = [];

    solve(targetNumber, cards, operators, solutions, 0);

    return solutions;
}

export function chooseTarget(board, setSize, minValue, maxValue, level) {
    let state = {
        occurrences: {},
        solutions: {},
        operators: new Array(setSize - 1)
    };
    var permutations = Combinatorics.permutation(board.cards, setSize);

    permutations.forEach((permutation) => {
        // Make sure the cards are next to each other
        for (var ci = 1, len = permutation.length; ci < len; ci++) {
            if (permutation[ci] === permutation[ci - 1] ||
		Math.abs(permutation[ci].row, permutation[ci - 1].row) > 1 ||
                Math.abs(permutation[ci].column, permutation[ci - 1].column) > 1) {
                return;
            }
        }
        countResults(permutation, state, minValue, maxValue, 0);
    });
    let all = [];
    for (let result in state.occurrences) {
        all.push({
            target: parseInt(result,10),
            count: state.occurrences[result],
            solutions: state.solutions[result]
        });
    }
    all.sort((a, b) => b.count - a.count);
    if (level < 0) {
	level = all.length + level;
    }
    return all[Math.min(level, all.length)];
}

function countResults(cards, state, min, max, operatorPosition) {
    for (let opIndex = 0; opIndex < mathOperators.length; opIndex++) {
        state.operators[operatorPosition] = opIndex;
        if (operatorPosition < state.operators.length - 1) {
            // Vary the next operator
            countResults(cards, state, min, max, operatorPosition + 1);
        } else {
            // We're the last one, so run the function
            var rz = pleaseDoNotExcuseMyDearAuntSally(cards, state.operators);
            // Only counts if it's an integer, not a decimal and within target range.
            if (rz % 1 === 0 && rz <= max && rz >= min) {
                state.solutions[rz] = state.solutions[rz] || [];
                state.solutions[rz].push({cards:cards,operators:ops(state.operators)});
                state.occurrences[rz] = (state.occurrences[rz] || 0) + 1;
            }
        }
    }
}

function solve(targetNumber, cards, operators, solutions, operatorPosition) {
    for (let opIndex = 0; opIndex < mathOperators.length; opIndex++) {
        operators[operatorPosition] = opIndex;
        if (operatorPosition < operators.length - 1) {
            // Vary the next operator
            solve(targetNumber, cards, operators, solutions, operatorPosition + 1);
        } else {
            // We're the last one, so run the function
            if (targetNumber === pleaseDoNotExcuseMyDearAuntSally(cards, operators)) {
                var solution = [];
                solution = ops(operators);
                solutions.push(solution);
            }
        }
    }
}

/**
 * Compute the result of combining cards with operators, in left to right order
 * @param cards
 * @param operators
 */
function pleaseDoNotExcuseMyDearAuntSally(cards, operators) {
    var result = cards[0].value, cardIndex = 1;
    for (let opix of operators) {
        result = mathFunctions[mathOperators[opix]](result, cards[cardIndex++].value);
    }
    return result;
}

function ops(indexes) {
    return indexes.map((ix) => mathOperators[ix]);
}
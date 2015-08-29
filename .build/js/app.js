(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * $Id: combinatorics.js,v 0.25 2013/03/11 15:42:14 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  References:
 *    http://www.ruby-doc.org/core-2.0/Array.html#method-i-combination
 *    http://www.ruby-doc.org/core-2.0/Array.html#method-i-permutation
 *    http://en.wikipedia.org/wiki/Factorial_number_system
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.Combinatorics = factory();
    }
}(this, function () {
    'use strict';
    var version = "0.5.0";
    /* combinatory arithmetics */
    var P = function(m, n) {
        var t, p = 1;
        if (m < n) {
            t = m;
            m = n;
            n = t;
        }
        while (n--) p *= m--;
        return p;
    };
    var C = function(m, n) {
        return P(m, n) / P(n, n);
    };
    var factorial = function(n) {
        return P(n, n);
    };
    var factoradic = function(n, d) {
        var f = 1;
        if (!d) {
            for (d = 1; f < n; f *= ++d);
            if (f > n) f /= d--;
        } else {
            f = factorial(d);
        }
        var result = [0];
        for (; d; f /= d--) {
            result[d] = Math.floor(n / f);
            n %= f;
        }
        return result;
    };
    /* common methods */
    var addProperties = function(dst, src) {
        Object.keys(src).forEach(function(p) {
            Object.defineProperty(dst, p, {
                value: src[p]
            });
        });
    };
    var hideProperty = function(o, p) {
        Object.defineProperty(o, p, {
            writable: true
        });
    };
    var toArray = function(f) {
        var e, result = [];
        this.init();
        while (e = this.next()) result.push(f ? f(e) : e);
        this.init();
        return result;
    };
    var common = {
        toArray: toArray,
        map: toArray,
        forEach: function(f) {
            var e;
            this.init();
            while (e = this.next()) f(e);
            this.init();
        },
        filter: function(f) {
            var e, result = [];
            this.init();
            while (e = this.next()) if (f(e)) result.push(e);
            this.init();
            return result;
        }

    };
    /* power set */
    var power = function(ary, fun) {
        if (ary.length > 32) throw new RangeError;
        var size = 1 << ary.length,
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                that.index = 0;
            },
            nth: function(n) {
                if (n >= size) return;
                var i = 0,
                    result = [];
                for (; n; n >>>= 1, i++) if (n & 1) result.push(this[i]);
                return result;
            },
            next: function() {
                return this.nth(this.index++);
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* combination */
    var nextIndex = function(n) {
        var smallest = n & -n,
            ripple = n + smallest,
            new_smallest = ripple & -ripple,
            ones = ((new_smallest / smallest) >> 1) - 1;
        return ripple | ones;
    };
    var combination = function(ary, nelem, fun) {
        if (ary.length > 32) throw new RangeError;
        if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        if (nelem > ary.length) throw new RangeError;
        var first = (1 << nelem) - 1,
            size = C(ary.length, nelem),
            maxIndex = 1 << ary.length,
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                this.index = first;
            },
            next: function() {
                if (this.index >= maxIndex) return;
                var i = 0,
                    n = this.index,
                    result = [];
                for (; n; n >>>= 1, i++) if (n & 1) result.push(this[i]);
                this.index = nextIndex(this.index);
                return result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* permutation */
    var _permutation = function(ary) {
        var that = ary.slice(),
            size = factorial(that.length);
        that.index = 0;
        that.next = function() {
            if (this.index >= size) return;
            var copy = this.slice(),
                digits = factoradic(this.index, this.length),
                result = [],
                i = this.length - 1;
            for (; i >= 0; --i) result.push(copy.splice(digits[i], 1)[0]);
            this.index++;
            return result;
        };
        return that;
    };
    // which is really a permutation of combination
    var permutation = function(ary, nelem, fun) {
        if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        if (nelem > ary.length) throw new RangeError;
        var size = P(ary.length, nelem),
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'cmb');
        hideProperty(that, 'per');
        addProperties(that, {
            valueOf: function() {
                return size;
            },
            init: function() {
                this.cmb = combination(ary, nelem);
                this.per = _permutation(this.cmb.next());
            },
            next: function() {
                var result = this.per.next();
                if (!result) {
                    var cmb = this.cmb.next();
                    if (!cmb) return;
                    this.per = _permutation(cmb);
                    return this.next();
                }
                return result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };

    var PC = function(m) {
        var total = 0;
        for (var n = 1; n <= m; n++) {
            var p = P(m,n);
            total += p;
        };
        return total;
    };
    // which is really a permutation of combination
    var permutationCombination = function(ary, fun) {
        // if (!nelem) nelem = ary.length;
        // if (nelem < 1) throw new RangeError;
        // if (nelem > ary.length) throw new RangeError;
        var size = PC(ary.length),
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'cmb');
        hideProperty(that, 'per');
        hideProperty(that, 'nelem');
        addProperties(that, {
            valueOf: function() {
                return size;
            },
            init: function() {
                this.nelem = 1;
                // console.log("Starting nelem: " + this.nelem);
                this.cmb = combination(ary, this.nelem);
                this.per = _permutation(this.cmb.next());
            },
            next: function() {
                var result = this.per.next();
                if (!result) {
                    var cmb = this.cmb.next();
                    if (!cmb) {
                        this.nelem++;
                        // console.log("increment nelem: " + this.nelem + " vs " + ary.length);
                        if (this.nelem > ary.length) return;
                        this.cmb = combination(ary, this.nelem);
                        cmb = this.cmb.next();
                        if (!cmb) return;
                    }
                    this.per = _permutation(cmb);
                    return this.next();
                }
                return result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* Cartesian Product */
    var arraySlice = Array.prototype.slice;
    var cartesianProduct = function() {
        if (!arguments.length) throw new RangeError;
        var args = arraySlice.call(arguments),
            size = args.reduce(function(p, a) {
                return p * a.length;
            }, 1),
            sizeOf = function() {
                return size;
            },
            dim = args.length,
            that = Object.create(args, {
                length: {
                    get: sizeOf
                }
            });
        if (!size) throw new RangeError;
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            dim: dim,
            init: function() {
                this.index = 0;
            },
            get: function() {
                if (arguments.length !== this.length) return;
                var result = [],
                    d = 0;
                for (; d < dim; d++) {
                    var i = arguments[d];
                    if (i >= this[d].length) return;
                    result.push(this[d][i]);
                }
                return result;
            },
            nth: function(n) {
                var result = [],
                    d = 0;
                for (; d < dim; d++) {
                    var l = this[d].length;
                    var i = n % l;
                    result.push(this[d][i]);
                    n -= i;
                    n /= l;
                }
                return result;
            },
            next: function() {
                if (this.index >= size) return;
                var result = this.nth(this.index);
                this.index++;
                return result;
            }
        });
        addProperties(that, common);
        that.init();
        return that;
    };
    /* baseN */
    var baseN = function(ary, nelem, fun) {
                if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        var base = ary.length,
                size = Math.pow(base, nelem);
        if (size > Math.pow(2,32)) throw new RangeError;
        var sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                that.index = 0;
            },
            nth: function(n) {
                if (n >= size) return;
                var result = [];
                for (var i = 0; i < nelem; i++) {
                    var d = n % base;
                    result.push(ary[d])
                    n -= d; n /= base
                }
                return result;
            },
            next: function() {
                return this.nth(this.index++);
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };

    /* export */
    var Combinatorics = Object.create(null);
    addProperties(Combinatorics, {
        C: C,
        P: P,
        factorial: factorial,
        factoradic: factoradic,
        cartesianProduct: cartesianProduct,
        combination: combination,
        permutation: permutation,
        permutationCombination: permutationCombination,
        power: power,
        baseN: baseN,
        VERSION: version
    });
    return Combinatorics;
}));

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Card = require('./Card');

var _Card2 = _interopRequireDefault(_Card);

var Board = (function () {
    /**
     * Pick random cards for a board
     * @param rows
     * @param columns
     * @param maxCard
     * @returns {{cards: Array, board: Array}}
     */

    function Board(rows, columns, maxCard) {
        _classCallCheck(this, Board);

        var board = [],
            cards = [];
        for (var r = 0; r < rows; r++) {
            board[r] = [];
            for (var c = 0; c < columns; c++) {
                var card = new _Card2['default'](parseInt(Math.random() * maxCard, 10) + 1, r, c);
                board[r][c] = card;
                cards.push(card);
            }
        }
        this.cards = cards;
        this.grid = board;
    }

    _createClass(Board, [{
        key: 'toString',
        value: function toString() {
            var rows = [];
            for (var r = 0, rlen = this.grid.length; r < rlen; r++) {
                var vals = [];
                for (var c = 0, clen = this.grid[r].length; c < clen; c++) {
                    vals.push(this.grid[r][c].value);
                }
                rows.push(vals.join(' '));
            }
            return rows.join('\n');
        }
    }]);

    return Board;
})();

exports['default'] = Board;
module.exports = exports['default'];

},{"./Card":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Card = (function () {
    function Card(value, r, c) {
        _classCallCheck(this, Card);

        this.value = value;
        this.row = r;
        this.column = c;
    }

    _createClass(Card, [{
        key: 'toString',
        value: function toString() {
            return this.value;
        }

        /**
         * Return a string that describes the solution as a simple equation (e.g. 3 + 3 + 3)
         * @param cards
         * @param operators
         */
    }], [{
        key: 'describe',
        value: function describe(cards, operators) {
            if (!operators && cards.operators) {
                operators = cards.operators;
                cards = cards.cards;
            }
            var parts = [cards[0].value],
                cardIndex = 1;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = operators[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var opix = _step.value;

                    parts.push(opix);
                    parts.push(cards[cardIndex++].value);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return parts.join(' ');
        }
    }]);

    return Card;
})();

exports['default'] = Card;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.findValidCombinations = findValidCombinations;
exports.chooseTarget = chooseTarget;
var Combinatorics = require('js-combinatorics'),
    Card = require('./Card');

var mathFunctions = {
    '×': function _(a, b) {
        return a * b;
    },
    '+': function _(a, b) {
        return a + b;
    },
    '-': function _(a, b) {
        return a - b;
    },
    '÷': function _(a, b) {
        return a / b;
    }
};
var mathOperators = ['×', '+', '-', '÷'];

var Operators = {
    TIMES: '×',
    PLUS: '+',
    MINUS: '-',
    DIVIDE: '÷'
};

exports.Operators = Operators;
/**
 * Find all combinations of operators using the cards that result in the target number
 * @param targetNumber
 * @param cards
 * @returns {Array} An array of arrays with which operators are used
 * @example findValueCombinations(9, [Card(3), Card(3), Card(3)]) = [ [ '+', '+' ] ]
 */

function findValidCombinations(targetNumber, cards) {
    var operators = new Array(cards.length - 1),
        solutions = [];

    solve(targetNumber, cards, operators, solutions, 0);

    return solutions;
}

function chooseTarget(board, setSize, minValue, maxValue, level) {
    var state = {
        occurrences: {},
        solutions: {},
        operators: new Array(setSize - 1)
    };
    var permutations = Combinatorics.permutation(board.cards, setSize);

    permutations.forEach(function (permutation) {
        // Make sure the cards are next to each other
        for (var ci = 1, len = permutation.length; ci < len; ci++) {
            if (permutation[ci] === permutation[ci - 1] || Math.abs(permutation[ci].row, permutation[ci - 1].row) > 1 || Math.abs(permutation[ci].column, permutation[ci - 1].column) > 1) {
                return;
            }
        }
        countResults(permutation, state, minValue, maxValue, 0);
    });
    var all = [];
    for (var result in state.occurrences) {
        all.push({
            target: parseInt(result, 10),
            count: state.occurrences[result],
            solutions: state.solutions[result]
        });
    }
    all.sort(function (a, b) {
        return b.count - a.count;
    });
    if (level < 0) {
        level = all.length + level;
    }
    return all[Math.min(level, all.length)];
}

function countResults(cards, state, min, max, operatorPosition) {
    for (var opIndex = 0; opIndex < mathOperators.length; opIndex++) {
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
                state.solutions[rz].push({ cards: cards, operators: ops(state.operators) });
                state.occurrences[rz] = (state.occurrences[rz] || 0) + 1;
            }
        }
    }
}

function solve(targetNumber, cards, operators, solutions, operatorPosition) {
    for (var opIndex = 0; opIndex < mathOperators.length; opIndex++) {
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
    var result = cards[0].value,
        cardIndex = 1;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = operators[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var opix = _step.value;

            result = mathFunctions[mathOperators[opix]](result, cards[cardIndex++].value);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
                _iterator['return']();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return result;
}

function ops(indexes) {
    return indexes.map(function (ix) {
        return mathOperators[ix];
    });
}

},{"./Card":3,"js-combinatorics":1}],5:[function(require,module,exports){
'use strict';

var algos = require('./algorithms'),
    Board = require('./Board'),
    Card = require('./Card');

window.setupGamePage = function setupGamePage() {

    var winWidth = window.innerWidth,
        winHeight = window.innerHeight;
    var renderer = PIXI.autoDetectRenderer(winWidth, winHeight);

    renderer.view.style.position = "absolute";
    renderer.view.style.display = "block";
    renderer.backgroundColor = 0x888888;

    // create an empty container
    var gameContainer = new PIXI.Container();
    // add the renderer view element to the DOM
    document.body.appendChild(renderer.view);

    var rows = 4,
        cols = 4;
    var cardWidth = parseInt((winWidth - rows * 10) / (rows + 2), 10);
    var cardHeight = parseInt((winHeight - cols * 10) / (cols + 1), 10);
    var board = new Board(rows, cols, 10);
    var target = algos.chooseTarget(board, 3, 1, 20, 0);

    var selections = [];
    for (var x = 0; x < rows; x++) {
        var _loop = function (y) {
            var card = board.grid[x][y];
            var sprite = makeCard(card.value, x, y, cardWidth, cardHeight, 0xFFFFFF);
            sprite.mouseup = sprite.touchend = function (data) {
                selections.push([card, sprite]);
                if (selections.length === 3) {
                    var slns = algos.findValidCombinations(target.target, selections.map(function (x) {
                        return x[0];
                    }));
                    if (slns.length) {
                        alert('YES');
                    } else {
                        alert('NO');
                    }
                }
                this.alpha = .5;
                console.log(data);
            };
            gameContainer.addChild(sprite);
        };

        for (var y = 0; y < cols; y++) {
            _loop(y);
        }
    }

    var targetCard = makeCard(target.target, rows + .5, cols / 2 - .5, cardWidth, cardHeight, 0xcccccc);
    targetCard.mouseup = targetCard.touchend = function (data) {
        this.alpha = .5;
        console.log(data);
    };

    gameContainer.addChild(targetCard);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(gameContainer);
    }

    requestAnimationFrame(animate);
};

function makeCard(value, x, y, cardWidth, cardHeight, color) {
    var card = new PIXI.Graphics();
    card.beginFill(color);
    card.lineStyle(1, 0xa0a0a0, 1);
    card.drawRoundedRect(0, 0, cardWidth, cardHeight, 10);
    card.endFill();

    var texture = card.generateTexture();
    var sprite = new PIXI.Sprite(texture);
    sprite.interactive = true;
    var basicText = new PIXI.Text(value);
    basicText.x = cardWidth / 2 - 8;
    basicText.y = cardHeight / 2 - 10;
    sprite.addChild(basicText);
    sprite.x = (cardWidth + 10) * x + 10;
    sprite.y = (cardHeight + 10) * y + 10;

    return sprite;
}

},{"./Board":2,"./Card":3,"./algorithms":4}]},{},[5]);

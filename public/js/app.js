'use strict';

require('babel/polyfill');

var algos = require('./algorithms'),
    Board = require('./Board'),
    Card = require('./Card');

window.setupGamePage = function setupGamePage() {

    var winWidth = window.innerWidth, winHeight = window.innerHeight;
    var renderer = PIXI.autoDetectRenderer(winWidth,winHeight);
    var totalPoints = 0;

    renderer.view.style.position = "absolute"
    renderer.view.style.display = "block";
    renderer.backgroundColor = 0x888888;

    // create an empty container
    var gameContainer = new PIXI.Container();
    // add the renderer view element to the DOM
    document.body.appendChild(renderer.view);

    var rows = 4, cols = 4;
    var cardWidth = parseInt((winWidth-rows*10) / (rows+2), 10);
    var cardHeight = parseInt((winHeight-cols*10) / (cols+1), 10);
    var board = new Board(cols, rows, 10);
    var target = algos.chooseTarget(board, 3, 1, 20, 0);

    var selections = [];
    for (var card of board.cards) {
        addSprite(card);
    }

    var targetCard = makeCard(target.target, rows + .5, cols / 2 - .5, cardWidth, cardHeight, 0xcccccc);
    targetCard.mouseup = targetCard.touchend = function ()
    {
    };
    gameContainer.addChild(targetCard);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(gameContainer);
    }

    requestAnimationFrame(animate);

    function addSprite(card) {
        let sprite = makeCard(card.value, card.x, card.y, cardWidth, cardHeight, 0xFFFFFF);
        card.sprite = sprite;
        sprite.mouseup = sprite.touchend = function (data)
        {
            selections.push(card);
            if (selections.length === 3) {
                var slns = algos.findValidCombinations(target.target, selections);
                clearSelectedState(selections);
                if (slns.length) {
                    foundSolution(slns);
                } else {
                    foundBadSolution();
                }
                selections = [];
                return;
            }
            this.alpha = .5;
        };
        gameContainer.addChild(sprite);
    }

    function foundSolution(slns) {
        var addPoints = algos.scoreSolutions(slns);
        totalPoints += addPoints;
        $('#points>.label').text(totalPoints);

        // Shrink the solution cards
        for (let card of selections) {
            TweenLite.to(card.sprite, .5, {height:0,y:card.sprite.y+card.sprite.height})
            .eventCallback('onComplete', () => {
                    card.sprite.mouseup = card.sprite.touchend = null;
                    gameContainer.removeChild(card.sprite);
                    //card.sprite.destroy(true);
                });
        }
        var moves = board.getMovesForRemovedCards(selections);
        for (var m of moves) {
            var pos = getPosition(0, m.y+m.dy, cardWidth, cardHeight);
            TweenLite.to(m.card.sprite, .5, {y:pos[1]});
        }
        var newCards = board.removeAndReplace(selections, moves);
        for (var c of newCards) {
            addSprite(c);
            c.sprite.height = 0;
            TweenLite.to(c.sprite, .5, {height:cardHeight});
        }

        console.log(board.toString());
        target = algos.chooseTarget(board, 3, 1, 20, parseInt(totalPoints / 100));
        if (!target) {
        }
        targetCard.cardText.text = target.target;
    }

    function foundBadSolution() {
        console.log("BAD");
    }

};

function clearSelectedState(selections) {
    for (let s of selections) {
        s.sprite.alpha = 1;
    }
}

function makeCard(value, x, y, cardWidth, cardHeight, color) {
    let card = new PIXI.Graphics();
    card.beginFill(color);
    card.lineStyle(1, 0xa0a0a0, 1);
    card.drawRoundedRect(0, 0, cardWidth, cardHeight, 10);
    card.endFill();

    var texture = card.generateTexture();
    var sprite = new PIXI.Sprite(texture);
    sprite.interactive = true;
    var basicText = new PIXI.Text(value);
    sprite.cardText = basicText;
    basicText.x = cardWidth / 2 - 8;
    basicText.y = cardHeight / 2 - 10;
    sprite.addChild(basicText);
    let pos = getPosition(x,y,cardWidth,cardHeight);
    sprite.x = pos[0];
    sprite.y = pos[1];

    return sprite;
}

function getPosition(x,y,cardWidth,cardHeight) {
    return [
        (cardWidth+10) * x + 10,
        (cardHeight+10) * y + 10
    ];
}
'use strict';

require('babel/polyfill');

var algos = require('./algorithms'),
    Board = require('./Board'),
    Card = require('./Card');

window.setupGamePage = function setupGamePage() {

    var winWidth = window.innerWidth, winHeight = window.innerHeight;
    var renderer = PIXI.autoDetectRenderer(winWidth,winHeight);

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
    var board = new Board(rows, cols, 10);
    var target = algos.chooseTarget(board, 3, 1, 20, 0);

    var selections = [];
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            let card = board.grid[x][y];
            let sprite = makeCard(card.value, x, y, cardWidth, cardHeight, 0xFFFFFF);
            sprite.mouseup = sprite.touchend = function (data)
            {
                selections.push([card,sprite]);
                if (selections.length === 3) {
                    var slns = algos.findValidCombinations(target.target, selections.map((x) => x[0]));
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
        }
    }

    var targetCard = makeCard(target.target, rows + .5, cols / 2 - .5, cardWidth, cardHeight, 0xcccccc);
    targetCard.mouseup = targetCard.touchend = function (data)
    {
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
    let card = new PIXI.Graphics();
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
    sprite.x = (cardWidth+10) * x + 10;
    sprite.y = (cardHeight+10) * y + 10;

    return sprite;
}

export default class Card {
    constructor(value, x, y) {
        this.value = value;
        this.x = x;
        this.y = y;
    }

    toString() {
        return this.value;
    }

    /**
     * Return a string that describes the solution as a simple equation (e.g. 3 + 3 + 3)
     * @param cards
     * @param operators
     */
    static describe(cards, operators) {
        if (!operators && cards.operators) {
            operators = cards.operators;
            cards = cards.cards;
        }
        var parts = [cards[0].value], cardIndex = 1;
        for (let opix of operators) {
            parts.push(opix);
            parts.push(cards[cardIndex++].value);
        }
        return parts.join(' ');
    }
}
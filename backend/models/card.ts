import fs from "fs";

const cardPath = "./data/cards_processed.json";

export type Card = {
    id: string;
    name: string;
    setId: string;
    rarity: string;
    image: string;
};

function getCardSet(set: string): Card[] {
    const data = fs.readFileSync(cardPath, "utf8");
    const allCards = JSON.parse(data) as Card[];
    return allCards.filter(card => card.setId === set);
}

export function drawCardsFromSet(set: string, count: number): Card[] {
    const cards = setMap[set] ?? [];
    const drawnCards: Card[] = [];

    if (cards.length === 0) return [];

    let i = 0;
    while (i < count && drawnCards.length < cards.length) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        const randomCard = cards[randomIndex]!;

        if (!drawnCards.includes(randomCard)) {
            drawnCards.push(randomCard);
            i++;
        }
    }
    
    return drawnCards;
}

const setMap: { [key: string]: Card[] } = {
    "sv3pt5": getCardSet("sv3pt5"),
}

export const setCards = setMap;
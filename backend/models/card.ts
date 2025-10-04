import fs from "fs";

const cardPath = "./data/cards_processed.json";

export type Card = {
    id: string;
    name: string;
    setId: string;
    rarity: string;
    image: string;
};

function getCards(set: string): Card[] {
    const data = fs.readFileSync(cardPath, "utf8");
    const allCards = JSON.parse(data) as Card[];
    return allCards.filter(card => card.setId === set);
}

const setMap: { [key: string]: Card[] } = {
    "sv3pt5": getCards("sv3pt5"),
}

export const setCards = setMap;
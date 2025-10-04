import fs from "fs";

const cardPath = "../data/cards_processed.json";

export type Card = {
    id: string;
    name: string;
    set: string;
    rarity: string;
    image: string;
};

function getCards(): Card[] {
    const data = fs.readFileSync(cardPath, "utf8");
    return JSON.parse(data) as Card[];
}

export const cards = getCards();
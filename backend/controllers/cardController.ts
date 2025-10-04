import express from "express";
import { setCards } from "../models/card.ts";

const router = express.Router();

router.get("/:setId", (req, res) => {
    const { setId } = req.params;
    const cards = setCards[setId];

    if (!cards || !cards.length) {
        return res.status(404).json({ error: "No cards available" });
    }
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    res.json(randomCard);
});

export default router;


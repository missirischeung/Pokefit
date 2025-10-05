import express from "express";
import { drawCardsFromSet, setCards } from "../models/card.ts";

const router = express.Router();

router.get("/:setId", (req, res) => {
    const { setId } = req.params;

    if (!setId) {
        return res.status(400).json({ error: "Set ID is required" });
    }

    const qty = parseInt(req.query.qty as string) || 1;

    const randomCards = drawCardsFromSet(setId, qty);
    res.json(randomCards);
});

router.post("/", (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids must be an array" });
    }
    // All cards from sv3pt5 set
    const cards = setCards["sv3pt5"] ?? [];
    // Filter cards by provided IDs (assuming IDs are strings in the Card model)
    const foundCards = cards.filter(card => ids.includes(card.id));
    res.json(foundCards);
});

export default router;


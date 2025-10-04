import express from "express";
import { drawCardsFromSet } from "../models/card.ts";

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

export default router;


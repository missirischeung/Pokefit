import express from 'express';
import * as Collection from '../models/collection.ts';
import type { Request, Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  res.send('Collection endpoint');
});

// Fetch collections by trainer ID
router.get('/:trainerId', async (req: Request, res: Response) => {
  const { trainerId } = req.params;
  if (!trainerId) {
    return res.status(400).send('Missing trainer ID');
  }
  try {
    const collections = await Collection.getCollectionsByTrainerId(trainerId);
    res.json(collections);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Add a collection (trainerId and cardId in JSON body)
router.post('/', async (req: Request, res: Response) => {
  const { trainerId, cardId } = req.body;
  if (!trainerId || !cardId) {
    return res.status(400).send('Missing trainerId or cardId');
  }
  try {
    const newCollection = await Collection.addCollection(trainerId, cardId);
    if (newCollection) {
      res.status(201).json(newCollection);
    } else {
      res.status(409).send('Collection already exists or failed to add');
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Remove a collection (trainerId and cardId in JSON body)
router.delete('/', async (req: Request, res: Response) => {
  const { trainerId, cardId } = req.body;
  if (!trainerId || !cardId) {
    return res.status(400).send('Missing trainerId or cardId');
  }
  try {
    await Collection.removeCollection(trainerId, cardId);
    res.status(204).send();
  } catch (error) {
    res.status(500).send('Server error');
  }
});

export default router;

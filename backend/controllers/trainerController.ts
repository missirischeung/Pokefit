import * as Trainer from '../models/trainer.ts';
import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

// Get all trainers in the root route
router.get('/', async (req: Request, res: Response) => {
  try {
    const trainers = await Trainer.getAllTrainers();
    res.json(trainers);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
});

// Get a trainer by ID in the path route parameter
router.get('/:id', async (req: Request, res: Response) => {
  const trainerId = req.params.id;

  if (!trainerId) {
    return res.status(400).send('Missing trainer ID');
  }

  try {
    const trainer = await Trainer.getTrainerById(trainerId);
    if (trainer) {
      res.json(trainer);
    } else {
      res.status(404).send('Trainer not found');
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Create a trainer given the name, age, and country in the request body
router.post('/', async (req: Request, res: Response) => {
  const { name, age, country } = req.body;
  if (!name || !age || !country) {
    return res.status(400).send('Missing required fields');
  }
  try {
    const newTrainer = await Trainer.createTrainer(name, age, country);
    if (newTrainer) {
      res.status(201).json(newTrainer);
    } else {
      res.status(500).send('Failed to create trainer');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
});

// Delete a trainer by ID in the path route parameter
router.delete('/:id', async (req: Request, res: Response) => {
  const trainerId = req.params.id;

  if (!trainerId) {
    return res.status(400).send('Missing trainer ID');
  }

  try {
    await Trainer.deleteTrainer(trainerId);
    res.status(204).send();
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Update a trainer by ID in the path route parameter with name, age, and country in the request body
router.put('/:id', async (req: Request, res: Response) => {
  const trainerId = req.params.id;
  const { name, age, country } = req.body;
  if (!name || !age || !country || !trainerId) {
    return res.status(400).send('Missing required fields');
  }
  try {
    const updatedTrainer = await Trainer.updateTrainer(trainerId, name, age, country);
    if (updatedTrainer) {
      res.json(updatedTrainer);
    } else {
      res.status(404).send('Trainer not found');
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
});

export default router;
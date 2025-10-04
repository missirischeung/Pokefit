import * as Trainer from './trainer.ts';
import type { Trainer as TrainerType } from './types.ts';
import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

// Get all trainers in the root route
router.get('/', async (req: Request, res: Response) => {
  try {
    const trainers: TrainerType[] = await Trainer.getAllTrainers();
    res.json(trainers);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
});

// Get a trainer by ID in the path route parameter
router.get('/:id', async (req: Request, res: Response) => {
  const trainerId = req.params.id;
  try {
    const trainer: TrainerType | null = await Trainer.getTrainerById(trainerId);
    if (trainer) {
      res.json(trainer);
    } else {
      res.status(404).send('Trainer not found');
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
});

export default router;
import express from 'express';
import * as HealthData from '../models/healthData.ts';
import type { Request, Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  res.send('HealthData endpoint');
});

// Fetch HealthData by trainer ID
router.get('/:trainerId', async (req: Request, res: Response) => {
  const { trainerId } = req.params;
  if (!trainerId) {
    return res.status(400).send('Missing trainer ID');
  }
  try {
    const data = await HealthData.getHealthDataByTrainerId(trainerId);
    res.json(data);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Add HealthData (trainerId, metricType, metric in JSON body)
router.post('/', async (req: Request, res: Response) => {
  const { trainerId, metricType, metric } = req.body;
  if (!trainerId || !metricType || metric === undefined) {
    return res.status(400).send('Missing required fields');
  }
  try {
    const newData = await HealthData.addHealthData(trainerId, metricType, metric);
    if (newData) {
      res.status(201).json(newData);
    } else {
      res.status(500).send('Failed to add health data');
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Remove HealthData (trainerId, retrieved in JSON body)
router.delete('/', async (req: Request, res: Response) => {
  const { trainerId, retrieved } = req.body;
  if (!trainerId || !retrieved) {
    return res.status(400).send('Missing trainerId or retrieved timestamp');
  }
  try {
    await HealthData.removeHealthData(trainerId, retrieved);
    res.status(204).send();
  } catch (error) {
    res.status(500).send('Server error');
  }
});

export default router;

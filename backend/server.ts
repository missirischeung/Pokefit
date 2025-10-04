import express from 'express';
import trainerRouter from './trainerController.ts';
import collectionController from './collectionController.ts';
import healthDataController from './healthDataController.ts';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', async (req, res) => {
    res.send('Hello World!')
})

app.use('/trainer', trainerRouter);
app.use('/collections', collectionController);
app.use('/healthData', healthDataController);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

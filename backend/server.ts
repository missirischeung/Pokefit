import express from 'express';
import trainerRouter from './controllers/trainerController.ts';
import collectionController from './controllers/collectionController.ts';
import healthDataController from './controllers/healthDataController.ts';
import cardController from './controllers/cardController.ts';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', async (req, res) => {
    res.send('Hello World!')
})

app.use('/trainer', trainerRouter);
app.use('/collections', collectionController);
app.use('/healthData', healthDataController);
app.use('/cards', cardController);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

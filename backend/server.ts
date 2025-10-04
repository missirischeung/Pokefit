import express from 'express';
import trainerRouter from './trainerController.ts';

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
    res.send('Hello World!')
})

app.use('/trainer', trainerRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

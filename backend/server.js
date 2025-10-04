import sql from './db.js';
import express from 'express';

const app = express();
const port = 3000;


async function getTrainersOver(age) {
    const users = await sql`
        SELECT *
        FROM Trainer
        WHERE AGE > ${ age }
    `;

    console.log(users);

    return users;
}

app.get('/', async (req, res) => {
    await getTrainersOver(0);
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

import pokemon from 'pokemontcgsdk';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

pokemon.configure({apiKey: process.env.POKEMON_API_KEY});

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// pokemon.set.all().then(async result => {
//   const filePath = path.join(__dirname, 'data', 'sets.json');
//   await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');
//   console.log('Sets data saved to data/sets.json');
// });

// pokemon.set.find('sv3pt5').then(async result => {
//   console.log(result);
// });

pokemon.card.all({ q: 'set.id:sv3pt5' })
  .then(async result => {
    const filePath = path.join(__dirname, 'data', 'cards.json');
    await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');
    console.log('Sets data saved to data/cards.json');
  })
import fs from 'fs';

// Read and parse the cards.json file
const cards = JSON.parse(fs.readFileSync('../data/cards.json', 'utf8'));

// Process cards to keep only required fields, and only the large image
const processed = cards.map(card => ({
  id: card.id,
  name: card.name,
  setId: card.set && card.set.id ? card.set.id : null,
  rarity: card.rarity,
  image: card.images && card.images.large ? card.images.large : ""
}));

// Write the processed cards to cards_processed.json
fs.writeFileSync('../data/cards_processed.json', JSON.stringify(processed, null, 2), 'utf8');
console.log(`Processed ${processed.length} cards`);


import sql from './db.ts';
import type { Collection } from './types.ts';

// Fetch all collections for a specific user
export const getCollectionsByTrainerId = async (trainerId: string): Promise<Collection[]> => {
    const collections = await sql<Collection[]>`
        SELECT * FROM Collection WHERE TrainerID = ${trainerId}
    `;
    return collections;
};

// Add a collection (user ID and card ID)
export const addCollection = async (trainerId: string, cardId: string): Promise<Collection | null> => {
    try {
        const [collection] = await sql<Collection[]>`
            INSERT INTO Collection (TrainerID, CardID)
            VALUES (${trainerId}, ${cardId})
            RETURNING *
        `;
        return collection ?? null;
    } catch (error: any) {
        if (error.code === '23505') {
            return null;
        }
        console.error(error);
        return null;
    }
};

// Remove a collection (user ID and card ID)
export const removeCollection = async (trainerId: string, cardId: string): Promise<void> => {
    await sql`
        DELETE FROM Collection WHERE TrainerID = ${trainerId} AND CardID = ${cardId}
    `;
};
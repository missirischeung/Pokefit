import sql from '../db.ts';
import type { Trainer } from '../types.ts';

export const getAllTrainers = async (): Promise<Trainer[]> => {
    const trainers = await sql<Trainer[]>`
        SELECT * FROM Trainer
    `;
    return trainers;
};

export const getTrainerById = async (trainerId: string): Promise<Trainer | null> => {
    const trainers = await sql<Trainer[]>`
        SELECT * FROM Trainer WHERE TrainerID = ${trainerId}
    `;
    return trainers[0] || null;
};

export const createTrainer = async (name: string, age: number, country: string): Promise<Trainer | null> => {
    try {
        const [trainer] = await sql<Trainer[]>`
        INSERT INTO Trainer
        VALUES (${name}, ${age}, ${country})
        RETURNING *
        `;
        return trainer ?? null;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const deleteTrainer = async (trainerId: string): Promise<void> => {
    await sql`
        DELETE FROM Trainer WHERE TrainerID = ${trainerId}
    `;
};

export const updateTrainer = async (trainerId: string, name: string, age: number, country: string): Promise<Trainer | null> => {
    const trainers = await sql<Trainer[]>`
        UPDATE Trainer
        SET Name = ${name}, Age = ${age}, Country = ${country}, UpdatedAt = NOW()
        WHERE TrainerID = ${trainerId}
        RETURNING *
    `;
    return trainers[0] || null;
};
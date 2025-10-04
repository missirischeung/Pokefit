import sql from '../db.ts';

enum MetricType {
    STEPS = 'STEPS',
    DISTANCE = 'DISTANCE',
}

type HealthData = {
    TrainerID: string; // UUID
    Retrieved: string; // ISO timestamp
    MetricType: MetricType;
    Metric: number;
};

// Fetch all HealthData for a specific user
export const getHealthDataByTrainerId = async (trainerId: string): Promise<HealthData[]> => {
    const data = await sql<HealthData[]>`
        SELECT * FROM HealthData WHERE TrainerID = ${trainerId}
    `;
    return data;
};

// Add HealthData (trainerId, metricType, metric)
export const addHealthData = async (
    trainerId: string,
    metricType: MetricType,
    metric: number
): Promise<HealthData | null> => {
    try {
        const [row] = await sql<HealthData[]>`
            INSERT INTO HealthData (TrainerID, MetricType, Metric)
            VALUES (${trainerId}, ${metricType}, ${metric})
            RETURNING *
        `;
        return row ?? null;
    } catch (error) {
        console.error(error);
        return null;
    }
};

// Remove HealthData (trainerId, retrieved)
export const removeHealthData = async (trainerId: string, retrieved: string): Promise<void> => {
    await sql`
        DELETE FROM HealthData WHERE TrainerID = ${trainerId} AND Retrieved = ${retrieved}
    `;
};

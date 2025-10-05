import sql from '../db.ts';

export type MetricType = 'STEPS' | 'DISTANCE';

type HealthData = {
    trainerId: string; // UUID
    activityDate: string; // ISO timestamp
    metricType: MetricType;
    metric: number;
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
    metric: number,
    activityDate: string
): Promise<HealthData | null> => {
    try {
        const [row] = await sql<HealthData[]>`
            INSERT INTO HealthData (TrainerID, ActivityDate, MetricType, Metric)
            VALUES (${trainerId}, ${activityDate}, ${metricType}, ${metric})
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

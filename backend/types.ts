export type Trainer = {
    TrainerID: string; // UUID
    Name: string;
    Age: number;
    Country: string;
    CreatedAt: string; // ISO timestamp
    UpdatedAt: string; // ISO timestamp
};

export type Collection = {
    TrainerID: string; // UUID
    CardID: string;
    AddedAt: string; // ISO timestamp
};

export enum MetricType {
    STEPS = 'STEPS',
    DISTANCE = 'DISTANCE',
}

export type HealthData = {
    TrainerID: string; // UUID
    Retrieved: string; // ISO timestamp
    MetricType: MetricType;
    Metric: number;
};
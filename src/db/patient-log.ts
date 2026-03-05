import mongoose, { Schema, type Document } from "mongoose";

export interface IPatientLog extends Document {
    userId: string;
    symptoms: string[];
    prediction: {
        disease: string;
        confidence: number;
        severity: string;
    };
    allPredictions: {
        disease: string;
        confidence: number;
        severity: string;
    }[];
    metadata: {
        ip?: string;
        userAgent?: string;
        sessionId?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const PatientLogSchema = new Schema<IPatientLog>(
    {
        userId: { type: String, required: true, index: true },
        symptoms: [{ type: String, required: true }],
        prediction: {
            disease: { type: String, required: true },
            confidence: { type: Number, required: true },
            severity: { type: String, required: true },
        },
        allPredictions: [
            {
                disease: { type: String, required: true },
                confidence: { type: Number, required: true },
                severity: { type: String, required: true },
            },
        ],
        metadata: {
            ip: String,
            userAgent: String,
            sessionId: String,
        },
    },
    {
        timestamps: true,
        collection: "patient_logs",
    }
);

// Prevent model recompilation in dev (hot-reload)
export const PatientLog =
    mongoose.models.PatientLog ||
    mongoose.model<IPatientLog>("PatientLog", PatientLogSchema);

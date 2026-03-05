import {
    pgTable,
    uuid,
    text,
    timestamp,
    integer,
    real,
    primaryKey,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────
// Diseases
// ─────────────────────────────────────────
export const diseases = pgTable("diseases", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description").notNull(),
    severity: text("severity", {
        enum: ["low", "medium", "high", "critical"],
    }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────
// Symptoms
// ─────────────────────────────────────────
export const symptoms = pgTable("symptoms", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    category: text("category").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────
// Disease ↔ Symptom mapping (weighted)
// ─────────────────────────────────────────
export const diseaseSymptoms = pgTable(
    "disease_symptoms",
    {
        diseaseId: uuid("disease_id")
            .references(() => diseases.id)
            .notNull(),
        symptomId: uuid("symptom_id")
            .references(() => symptoms.id)
            .notNull(),
        weight: real("weight").notNull().default(1.0),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.diseaseId, table.symptomId] }),
    })
);

// ─────────────────────────────────────────
// Precautions
// ─────────────────────────────────────────
export const precautions = pgTable("precautions", {
    id: uuid("id").defaultRandom().primaryKey(),
    diseaseId: uuid("disease_id")
        .references(() => diseases.id)
        .notNull(),
    description: text("description").notNull(),
    priority: integer("priority").notNull().default(0),
});

// ─────────────────────────────────────────
// TypeScript Types
// ─────────────────────────────────────────
export type Disease = typeof diseases.$inferSelect;
export type Symptom = typeof symptoms.$inferSelect;
export type DiseaseSymptom = typeof diseaseSymptoms.$inferSelect;
export type Precaution = typeof precautions.$inferSelect;

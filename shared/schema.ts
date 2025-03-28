import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Subscription Scores table
export const subscriptionScores = pgTable("subscription_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  age: integer("age").notNull(),
  noHomePeriod: integer("no_home_period").notNull(),
  dependents: integer("dependents").notNull(),
  subscriptionPeriod: integer("subscription_period").notNull(),
  income: integer("income").notNull(),
  totalScore: integer("total_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScoreSchema = createInsertSchema(subscriptionScores).omit({
  id: true,
  totalScore: true,
  createdAt: true,
});

// Apartments table
export const apartments = pgTable("apartments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  competitionRate: integer("competition_rate").notNull(),
  minScore: integer("min_score").notNull(),
  avgScore: integer("avg_score").notNull(),
  coordinates: jsonb("coordinates").notNull(), // {lat: number, lng: number}
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApartmentSchema = createInsertSchema(apartments).omit({
  id: true,
  createdAt: true,
});

// Competition Data table
export const competitionData = pgTable("competition_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fileName: text("file_name").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompetitionDataSchema = createInsertSchema(competitionData).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertScore = z.infer<typeof insertScoreSchema>;
export type SubscriptionScore = typeof subscriptionScores.$inferSelect;

export type InsertApartment = z.infer<typeof insertApartmentSchema>;
export type Apartment = typeof apartments.$inferSelect;

export type InsertCompetitionData = z.infer<typeof insertCompetitionDataSchema>;
export type CompetitionData = typeof competitionData.$inferSelect;

import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  playerName: text("player_name").notNull(),
  email: text("email").notNull(),
  game: text("game").notNull(),
  platform: text("platform").notNull(),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
}, table => [uniqueIndex("idx_applications_email_unique").on(table.email)]);

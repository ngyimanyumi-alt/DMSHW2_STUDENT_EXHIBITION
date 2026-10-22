import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Only cards edited by a curator receive a row. The canonical 36-card copy
 * remains in shared/cards.ts, so a catalog update does not need a DB seed.
 */
export const exhibitionCardOverrides = mysqlTable("exhibition_card_overrides", {
  cardId: int("cardId").primaryKey(),
  nameZh: text("nameZh"),
  nameEn: text("nameEn"),
  keywordsZh: text("keywordsZh"),
  keywordsEn: text("keywordsEn"),
  descriptionZh: text("descriptionZh"),
  descriptionEn: text("descriptionEn"),
  artist: varchar("artist", { length: 160 }),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  driveUrl: varchar("driveUrl", { length: 2048 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Singleton (id=1) exhibition copy, created only when a curator saves it. */
export const exhibitionSettings = mysqlTable("exhibition_settings", {
  id: int("id").primaryKey(),
  titleZh: varchar("titleZh", { length: 200 }).notNull(),
  titleEn: varchar("titleEn", { length: 200 }).notNull(),
  statementZh: text("statementZh").notNull(),
  statementEn: text("statementEn").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Guestbook records are never deleted by moderation; hidden records stay auditable. */
export const guestbookEntries = mysqlTable("guestbook_entries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 60 }).notNull(),
  message: varchar("message", { length: 600 }).notNull(),
  photoUrl: varchar("photoUrl", { length: 1024 }),
  hidden: boolean("hidden").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExhibitionCardOverride = typeof exhibitionCardOverrides.$inferSelect;
export type ExhibitionSettings = typeof exhibitionSettings.$inferSelect;
export type GuestbookEntry = typeof guestbookEntries.$inferSelect;

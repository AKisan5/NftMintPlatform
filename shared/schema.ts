import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Event schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventName: text("event_name").notNull(),
  eventDetails: text("event_details").notNull(),
  mintStartDate: timestamp("mint_start_date").notNull(),
  mintEndDate: timestamp("mint_end_date").notNull(),
  mintLimit: integer("mint_limit").notNull(),
  gasSponsored: boolean("gas_sponsored").notNull().default(true),
  transferable: boolean("transferable").notNull().default(false),
  passphrase: text("passphrase").notNull(),
  nftName: text("nft_name").notNull(),
  nftDescription: text("nft_description").notNull(),
  nftImageUrl: text("nft_image_url"),
  nftAnimationUrl: text("nft_animation_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
}).extend({
  mintStartDate: z.string().or(z.date()),
  mintEndDate: z.string().or(z.date()),
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// NFT mint records
export const nftMints = pgTable("nft_mints", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  transactionId: text("transaction_id").notNull(),
  mintedAt: timestamp("minted_at").defaultNow(),
});

export const insertNftMintSchema = createInsertSchema(nftMints).omit({
  id: true, 
  mintedAt: true,
});

export type InsertNftMint = z.infer<typeof insertNftMintSchema>;
export type NftMint = typeof nftMints.$inferSelect;

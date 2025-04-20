import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertNftMintSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Events API endpoints
  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to create event" });
      }
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve event" });
    }
  });

  app.post("/api/verify-passphrase", async (req, res) => {
    try {
      const { passphrase } = req.body;
      if (!passphrase) {
        return res.status(400).json({ message: "Passphrase is required" });
      }
      
      const event = await storage.getEventByPassphrase(passphrase);
      if (!event) {
        return res.status(404).json({ message: "Invalid passphrase" });
      }
      
      res.json({ 
        valid: true, 
        event: {
          id: event.id,
          eventName: event.eventName,
          eventDetails: event.eventDetails,
          mintStartDate: event.mintStartDate,
          mintEndDate: event.mintEndDate,
          nftName: event.nftName,
          nftDescription: event.nftDescription,
          nftImageUrl: event.nftImageUrl,
          gasSponsored: event.gasSponsored
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to verify passphrase" });
    }
  });

  // NFT minting API endpoints
  app.post("/api/mint-nft", async (req, res) => {
    try {
      const mintData = insertNftMintSchema.parse(req.body);
      
      // Verify event exists
      const event = await storage.getEvent(mintData.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check mint limit
      const existingMints = await storage.getNftMintsByEvent(mintData.eventId);
      if (existingMints.length >= event.mintLimit) {
        return res.status(400).json({ message: "Mint limit reached for this event" });
      }
      
      // Check if current time is within mint period
      const now = new Date();
      if (now < event.mintStartDate || now > event.mintEndDate) {
        return res.status(400).json({ message: "Minting is not currently available for this event" });
      }
      
      const nftMint = await storage.createNftMint(mintData);
      res.status(201).json(nftMint);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to mint NFT" });
      }
    }
  });

  app.get("/api/mints/:eventId", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const mints = await storage.getNftMintsByEvent(eventId);
      res.json(mints);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve mint records" });
    }
  });

  app.get("/api/wallet-mints/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      const mints = await storage.getNftMintsByWallet(walletAddress);
      res.json(mints);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve wallet mint records" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

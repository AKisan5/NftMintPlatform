import { events, type Event, type InsertEvent, nftMints, type NftMint, type InsertNftMint, users, type User, type InsertUser } from "@shared/schema";

// Interface for event storage operations
export interface IStorage {
  // User-related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event-related methods
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventByPassphrase(passphrase: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  
  // NFT mint-related methods
  createNftMint(nftMint: InsertNftMint): Promise<NftMint>;
  getNftMintsByEvent(eventId: number): Promise<NftMint[]>;
  getNftMintsByWallet(walletAddress: string): Promise<NftMint[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private nftMints: Map<number, NftMint>;
  
  private userId: number;
  private eventId: number;
  private nftMintId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.nftMints = new Map();
    
    this.userId = 1;
    this.eventId = 1;
    this.nftMintId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Event methods
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const createdAt = new Date();
    const event: Event = { ...insertEvent, id, createdAt };
    this.events.set(id, event);
    return event;
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEventByPassphrase(passphrase: string): Promise<Event | undefined> {
    return Array.from(this.events.values()).find(
      (event) => event.passphrase === passphrase
    );
  }
  
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  // NFT mint methods
  async createNftMint(insertNftMint: InsertNftMint): Promise<NftMint> {
    const id = this.nftMintId++;
    const mintedAt = new Date();
    const nftMint: NftMint = { ...insertNftMint, id, mintedAt };
    this.nftMints.set(id, nftMint);
    return nftMint;
  }
  
  async getNftMintsByEvent(eventId: number): Promise<NftMint[]> {
    return Array.from(this.nftMints.values()).filter(
      (nftMint) => nftMint.eventId === eventId
    );
  }
  
  async getNftMintsByWallet(walletAddress: string): Promise<NftMint[]> {
    return Array.from(this.nftMints.values()).filter(
      (nftMint) => nftMint.walletAddress === walletAddress
    );
  }
}

export const storage = new MemStorage();

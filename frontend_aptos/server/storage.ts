import { 
  users, liquidityPools, transactions,
  type User, 
  type InsertUser,
  type LiquidityPool,
  type InsertLiquidityPool,
  type Transaction,
  type InsertTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";
import { testDatabaseConnection } from "./database";

// Storage interface with all CRUD methods needed for the application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Liquidity Pool methods
  getAllPools(): Promise<LiquidityPool[]>;
  getPoolsByOwner(owner: string): Promise<LiquidityPool[]>;
  getPoolByAddress(address: string): Promise<LiquidityPool | undefined>;
  createPool(pool: InsertLiquidityPool): Promise<LiquidityPool>;
  updatePoolLiquidity(address: string, newLiquidity: number): Promise<LiquidityPool | undefined>;
  
  // Transaction methods
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByAddress(address: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

// DatabaseStorage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getAllPools(): Promise<LiquidityPool[]> {
    return await db.select().from(liquidityPools);
  }
  
  async getPoolsByOwner(owner: string): Promise<LiquidityPool[]> {
    return await db.select().from(liquidityPools).where(eq(liquidityPools.owner, owner));
  }
  
  async getPoolByAddress(address: string): Promise<LiquidityPool | undefined> {
    const [pool] = await db.select().from(liquidityPools).where(eq(liquidityPools.address, address));
    return pool || undefined;
  }
  
  async createPool(pool: InsertLiquidityPool): Promise<LiquidityPool> {
    const [newPool] = await db
      .insert(liquidityPools)
      .values(pool)
      .returning();
    return newPool;
  }
  
  async updatePoolLiquidity(address: string, newLiquidity: number): Promise<LiquidityPool | undefined> {
    const [updatedPool] = await db
      .update(liquidityPools)
      .set({ totalLiquidity: newLiquidity })
      .where(eq(liquidityPools.address, address))
      .returning();
    return updatedPool || undefined;
  }
  
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }
  
  async getTransactionsByAddress(address: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(
      or(
        eq(transactions.fromAddress, address),
        eq(transactions.toAddress, address)
      )
    );
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }
}

// Initialize memory storage for fallback
class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pools: Map<string, LiquidityPool>;
  private txs: Map<number, Transaction>;
  private userId: number;
  private txId: number;
  
  constructor() {
    this.users = new Map();
    this.pools = new Map();
    this.txs = new Map();
    this.userId = 1;
    this.txId = 1;
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllPools(): Promise<LiquidityPool[]> {
    return Array.from(this.pools.values());
  }
  
  async getPoolsByOwner(owner: string): Promise<LiquidityPool[]> {
    return Array.from(this.pools.values()).filter(pool => pool.owner === owner);
  }
  
  async getPoolByAddress(address: string): Promise<LiquidityPool | undefined> {
    return this.pools.get(address);
  }
  
  async createPool(pool: InsertLiquidityPool): Promise<LiquidityPool> {
    const newPool: LiquidityPool = { 
      ...pool,
      id: Math.floor(Math.random() * 10000), // Generate random ID
      createdAt: new Date(),
      totalLiquidity: pool.totalLiquidity || 0 // Ensure totalLiquidity is defined
    };
    this.pools.set(pool.address, newPool);
    return newPool;
  }
  
  async updatePoolLiquidity(address: string, newLiquidity: number): Promise<LiquidityPool | undefined> {
    const pool = this.pools.get(address);
    if (!pool) return undefined;
    
    const updatedPool: LiquidityPool = {
      ...pool,
      totalLiquidity: newLiquidity
    };
    
    this.pools.set(address, updatedPool);
    return updatedPool;
  }
  
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.txs.values());
  }
  
  async getTransactionsByAddress(address: string): Promise<Transaction[]> {
    return Array.from(this.txs.values()).filter(tx => 
      tx.fromAddress === address || tx.toAddress === address
    );
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.txId++;
    const newTx: Transaction = { 
      ...transaction, 
      id,
      createdAt: new Date()
    };
    this.txs.set(id, newTx);
    return newTx;
  }
}

// Initialize storage based on database connection
let storage: IStorage;

// We'll initialize the storage asynchronously
export async function initializeStorage(): Promise<IStorage> {
  if (storage) {
    return storage;
  }
  
  try {
    // Test the database connection
    const isConnected = await testDatabaseConnection();
    
    if (isConnected) {
      console.log('Using PostgreSQL storage with Drizzle ORM');
      storage = new DatabaseStorage();
    } else {
      console.log('Database connection failed, using in-memory storage');
      storage = new MemStorage();
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    console.log('Falling back to in-memory storage');
    storage = new MemStorage();
  }
  
  return storage;
}

// Export a function to get the storage instance
export async function getStorage(): Promise<IStorage> {
  if (!storage) {
    return await initializeStorage();
  }
  return storage;
}

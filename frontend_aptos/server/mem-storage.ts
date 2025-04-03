import { 
  type User, 
  type InsertUser,
  type LiquidityPool,
  type InsertLiquidityPool,
  type Transaction,
  type InsertTransaction
} from "@shared/schema";
import { IStorage } from "./storage";

export class MemStorage implements IStorage {
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
  
  // Liquidity Pool methods
  async getAllPools(): Promise<LiquidityPool[]> {
    return Array.from(this.pools.values());
  }
  
  async getPoolsByOwner(owner: string): Promise<LiquidityPool[]> {
    return Array.from(this.pools.values()).filter(
      (pool) => pool.owner === owner
    );
  }
  
  async getPoolByAddress(address: string): Promise<LiquidityPool | undefined> {
    return this.pools.get(address);
  }
  
  async createPool(pool: InsertLiquidityPool): Promise<LiquidityPool> {
    // Ensure totalLiquidity has a value for the required field
    const poolWithDefaults = {
      ...pool,
      totalLiquidity: pool.totalLiquidity || 0
    };
    
    const newPool: LiquidityPool = { 
      ...poolWithDefaults,
      id: 0, // Will be set by DB in real implementation
      createdAt: new Date()
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
  
  // Transaction methods
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.txs.values());
  }
  
  async getTransactionsByAddress(address: string): Promise<Transaction[]> {
    return Array.from(this.txs.values()).filter(
      (tx) => tx.fromAddress === address || tx.toAddress === address
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
import { 
  users,
  liquidityPools, 
  transactions,
  type User, 
  type InsertUser,
  type LiquidityPool,
  type InsertLiquidityPool,
  type Transaction,
  type InsertTransaction
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./database";
import { eq, or } from "drizzle-orm";

export class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const inserted = await db.insert(users).values(user).returning();
    return inserted[0];
  }
  
  // Liquidity Pool methods
  async getAllPools(): Promise<LiquidityPool[]> {
    return await db.select().from(liquidityPools);
  }
  
  async getPoolsByOwner(owner: string): Promise<LiquidityPool[]> {
    return await db.select().from(liquidityPools).where(eq(liquidityPools.owner, owner));
  }
  
  async getPoolByAddress(address: string): Promise<LiquidityPool | undefined> {
    const results = await db.select().from(liquidityPools).where(eq(liquidityPools.address, address));
    return results[0];
  }
  
  async createPool(pool: InsertLiquidityPool): Promise<LiquidityPool> {
    // Ensure totalLiquidity has a value for the required field
    const poolWithDefaults = {
      ...pool,
      totalLiquidity: pool.totalLiquidity || 0
    };
    
    const inserted = await db.insert(liquidityPools).values(poolWithDefaults).returning();
    return inserted[0];
  }
  
  async updatePoolLiquidity(address: string, newLiquidity: number): Promise<LiquidityPool | undefined> {
    const updated = await db
      .update(liquidityPools)
      .set({ totalLiquidity: newLiquidity })
      .where(eq(liquidityPools.address, address))
      .returning();
    
    return updated[0];
  }
  
  // Transaction methods
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }
  
  async getTransactionsByAddress(address: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        or(
          eq(transactions.fromAddress, address),
          eq(transactions.toAddress, address)
        )
      );
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const inserted = await db.insert(transactions).values(transaction).returning();
    return inserted[0];
  }
}
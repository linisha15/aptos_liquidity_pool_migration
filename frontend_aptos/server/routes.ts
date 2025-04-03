import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./storage";
import { insertLiquidityPoolSchema, insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // Initialize storage once for all routes
  const storageInstance = await getStorage();

  // Get all liquidity pools
  router.get("/pools", async (req, res) => {
    try {
      const pools = await storageInstance.getAllPools();
      res.json(pools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch liquidity pools" });
    }
  });

  // Get liquidity pools by owner address
  router.get("/pools/owner/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const pools = await storageInstance.getPoolsByOwner(address);
      res.json(pools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owner's liquidity pools" });
    }
  });

  // Get pool by address
  router.get("/pools/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const pool = await storageInstance.getPoolByAddress(address);
      
      if (!pool) {
        return res.status(404).json({ error: "Liquidity pool not found" });
      }
      
      res.json(pool);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch liquidity pool" });
    }
  });

  // Create a new liquidity pool
  router.post("/pools", async (req, res) => {
    try {
      const validatedData = insertLiquidityPoolSchema.parse(req.body);
      const newPool = await storageInstance.createPool(validatedData);
      res.status(201).json(newPool);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create liquidity pool" });
      }
    }
  });

  // Get all transactions
  router.get("/transactions", async (req, res) => {
    try {
      const transactions = await storageInstance.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get transactions by address (either from or to)
  router.get("/transactions/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const transactions = await storageInstance.getTransactionsByAddress(address);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Create a new transaction
  router.post("/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const newTransaction = await storageInstance.createTransaction(validatedData);
      
      // If it's a migration transaction, update the pool liquidity amounts
      if (validatedData.type === 'migrate_liquidity') {
        const { fromAddress, toAddress, amount } = validatedData;
        
        // Get the pools
        const sourcePool = await storageInstance.getPoolByAddress(fromAddress);
        const destPool = await storageInstance.getPoolByAddress(toAddress);
        
        if (sourcePool && destPool) {
          // Update source pool
          await storageInstance.updatePoolLiquidity(
            fromAddress, 
            sourcePool.totalLiquidity - amount
          );
          
          // Update destination pool
          await storageInstance.updatePoolLiquidity(
            toAddress,
            destPool.totalLiquidity + amount
          );
        }
      }
      
      res.status(201).json(newTransaction);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create transaction" });
      }
    }
  });

  // Mount the router
  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}

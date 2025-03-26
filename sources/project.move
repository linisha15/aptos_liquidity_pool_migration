module MyModule::LiquidityMigration {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    /// Struct representing a liquidity pool.
    struct LiquidityPool has store, key {
        total_liquidity: u64,  // Total liquidity in the pool
        owner: address,        // Owner of the pool
    }

    /// Function to create a new liquidity pool.
    public fun create_pool(owner: &signer, initial_liquidity: u64) {
        let owner_address = signer::address_of(owner);

        // Withdraw the initial liquidity
        let liquidity = coin::withdraw<AptosCoin>(owner, initial_liquidity);

        // Move pool into the owner's account
        move_to(owner, LiquidityPool {
            total_liquidity: initial_liquidity,
            owner: owner_address,
        });

        // Deposit the liquidity into the owner's pool
        coin::deposit<AptosCoin>(owner_address, liquidity);
    }

    /// Function to migrate liquidity from one pool to another.
    public fun migrate_liquidity(
        migrator: &signer, 
        from_pool_owner: address, 
        to_pool_owner: address, 
        amount: u64
    ) acquires LiquidityPool {
        // Borrow the from_pool mutably first
        let from_pool = borrow_global_mut<LiquidityPool>(from_pool_owner);

        assert!(from_pool.total_liquidity >= amount, 1); // Ensure sufficient liquidity

        // Withdraw from the source pool using the migrator
        let liquidity_to_migrate = coin::withdraw<AptosCoin>(migrator, amount);

        // Update the total liquidity in the from_pool
        from_pool.total_liquidity = from_pool.total_liquidity - amount;

        // Now borrow the to_pool mutably
        let to_pool = borrow_global_mut<LiquidityPool>(to_pool_owner);

        // Update the total liquidity in the to_pool
        to_pool.total_liquidity = to_pool.total_liquidity + amount;

        // Deposit the liquidity into the target pool
        coin::deposit<AptosCoin>(to_pool_owner, liquidity_to_migrate);
    }
}

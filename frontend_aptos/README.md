# Automated Liquidity Migration Tool

A sophisticated Aptos blockchain frontend designed for seamless liquidity pool management and migration, featuring an intuitive dark-themed interface for crypto enthusiasts and developers.

## Features

- Create and manage liquidity pools on Aptos blockchain
- Migrate liquidity between pools
- Track transaction history
- Dark mode UI for better eye comfort
- Responsive design for all devices

## Technology Stack

- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Express, Node.js
- Database: PostgreSQL with Drizzle ORM
- Blockchain: Aptos with @aptos-labs/ts-sdk

## Environment Variables

The application requires the following environment variables:

```
# PostgreSQL Database
DATABASE_URL=your_postgresql_connection_string

# Aptos Configuration
APTOS_MODULE_ADDRESS=your_module_address
APTOS_MODULE_NAME=your_module_name
APTOS_NETWORK=devnet|testnet|mainnet
```

## Deployment Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Deployment Steps

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` file
4. Build the application: `npm run build`
5. Run database migrations: `npm run db:push`
6. Start the server: `npm run start`

### Deploying with Replit

This project is configured for easy deployment with Replit:

1. Set up the required environment variables in Replit Secrets
2. Click the "Deploy" button in the Replit interface
3. The application will automatically build and deploy

## Integration with Aptos Blockchain

The frontend communicates with an Aptos blockchain backend written in Move language. The contract handles:

- Creating liquidity pools
- Migrating liquidity between pools
- Managing token transactions

The contract address and module name must be configured in the environment variables.

## Usage

1. Connect your Aptos wallet
2. Create a new liquidity pool or select an existing one
3. Deposit or migrate liquidity
4. View your transaction history
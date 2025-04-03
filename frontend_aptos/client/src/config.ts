// Configuration for the client application
export const config = {
  aptos: {
    moduleAddress: import.meta.env.VITE_APTOS_MODULE_ADDRESS || '0x1',
    moduleName: import.meta.env.VITE_APTOS_MODULE_NAME || 'liquiditymigration',
    network: import.meta.env.VITE_APTOS_NETWORK || 'devnet',
  },
  api: {
    baseUrl: '/api',
  }
};
import type { PurchasesService } from '../contracts';

/** Simulates UI outcomes only. No entitlement or credit is ever granted. */
export const demoPurchases: PurchasesService = {
  async purchase() {
    return { status: 'simulated' };
  },

  async restore() {
    return { restoredCount: 0, simulated: true };
  },
};

import type { BillingInfo } from "@/lib/types";
import { mockBilling, delay } from "./mock-data";

export const billingService = {
  getBillingInfo: async (): Promise<BillingInfo> => {
    await delay(400);
    return mockBilling;
  },

  purchasePack: async (_planId: string): Promise<{ url: string }> => {
    // TODO_STRIPE_HOOKUP: Create Stripe Checkout session for one-off pack
    await delay(500);
    return { url: "#" };
  },
};

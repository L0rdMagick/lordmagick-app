import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Updated to match your installed SDK version
  apiVersion: '2025-10-29.clover', 
  typescript: true,
});

export const PACKAGES = {
  pack_small: {
    id: 'pack_small',
    name: 'Handful of Stardust',
    credits: 50,
    price: 499, // $4.99
    description: '50 Aether Credits'
  },
  pack_medium: {
    id: 'pack_medium',
    name: 'Vial of Essence',
    credits: 120,
    price: 999, // $9.99
    description: '120 Aether Credits (Includes 20 Bonus)'
  },
  pack_large: {
    id: 'pack_large',
    name: 'Philosopher\'s Stone',
    credits: 300,
    price: 1999, // $19.99
    description: '300 Aether Credits'
  },
};
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // Latest stable version
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
    credits: 150,
    price: 1299, // $12.99
    description: '150 Aether Credits'
  },
  pack_large: {
    id: 'pack_large',
    name: 'Philosopher\'s Stone',
    credits: 500,
    price: 3999, // $39.99
    description: '500 Aether Credits'
  },
};
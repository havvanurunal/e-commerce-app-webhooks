import Stripe from 'stripe'
// to use env variables
import './env'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
export const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET

import { Request, Response } from 'express'
import { STRIPE_ENDPOINT_SECRET, stripe } from '../../common/stripe'
import logger from '../../common/logger'
import { createOrderFromSession } from './orderService'
import { sendOrderConfirmationEmail } from './emailService'

const receiveUpdates = async (request: Request, response: Response) => {
  let event = request.body

  if (STRIPE_ENDPOINT_SECRET) {
    const signature = request.headers['stripe-signature']
    try {
      event = stripe.webhooks.constructEvent(request.body, signature, STRIPE_ENDPOINT_SECRET)
    } catch (err) {
      logger.error(`⚠️  Webhook signature verification failed.`, err.message)
      return response.sendStatus(400)
    }
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      logger.info(`Checkout session ${session.id} completed.`)

      const { orderId, items } = await createOrderFromSession(session)
      const totalAmount = session.amount_total / 100

      await sendOrderConfirmationEmail(session.customer_details.email, orderId, items, totalAmount)

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object
      logger.info(`Checkout session ${session.id} expired.`)
      break
    }

    case 'charge.succeeded': {
      const charge = event.data.object
      logger.info(`Charge succeeded: ${charge.id}.`)
      break
    }
    case 'charge.updated': {
      const charge = event.data.object
      logger.info(`Charge updated: ${charge.id}.`)
      break
    }

    case 'payment_intent.created': {
      const paymentIntent = event.data.object
      logger.info(`Payment intent created: ${paymentIntent.id}.`)
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object
      logger.info(`Payment intent succeeded: ${paymentIntent.id}.`)
      break
    }

    default:
      logger.info(`Unhandled event type ${event.type}.`)
  }
  response.send()
}

export default {
  receiveUpdates,
}

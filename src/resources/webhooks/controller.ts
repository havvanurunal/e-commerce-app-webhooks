import { Request, Response } from 'express'
import { STRIPE_ENDPOINT_SECRET, stripe } from '../../common/stripe'
import { prisma } from '../../../lib/prisma'
import { resend } from '../../common/resend'

const receiveUpdates = async (request: Request, response: Response) => {
  let event = request.body
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (STRIPE_ENDPOINT_SECRET) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature']
    try {
      event = stripe.webhooks.constructEvent(request.body, signature, STRIPE_ENDPOINT_SECRET)
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message)
      return response.sendStatus(400)
    }
  }

  // Handle the event
  switch (event.type) {
    // payment_intent.succeeded, charge.succeeded, payment_intent.created,
    case 'checkout.session.completed':
      const paymentIntent = event.data.object
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`)
      const lineItems = await stripe.checkout.sessions.listLineItems(event.data.object.id, {
        expand: ['data.price.product'],
      })

      const userId = event.data.object.metadata.userId
      const order = await prisma.order.create({
        data: { userId },
      })
      const orderDetails = []

      for (const lineItem of lineItems.data) {
        const product = lineItem.price?.product
        if (typeof product === 'string') continue
        if (!product) continue
        const stripeProductId = product.id

        const dbProduct = await prisma.product.update({
          where: { stripeProductId },
          data: { stock: { decrement: lineItem.quantity } },
        })

        if (!dbProduct) continue

        orderDetails.push({
          name: dbProduct.productName,
          quantity: lineItem.quantity,
          price: lineItem.amount_total / 100,
          images: dbProduct.images,
        })

        await prisma.orderItem.create({
          data: {
            order: { connect: { id: order.id } },
            product: { connect: { id: dbProduct.id } },
            price: dbProduct.price,
            quantity: lineItem.quantity,
          },
        })
      }

      const itemsHtml = orderDetails
        .map(
          (item) =>
            `<li>
          <img src="${item.images[0]}" width="100" />
          ${item.quantity}x ${item.name} - $${item.price}
          </li>`,
        )
        .join('')

      const totalAmount = event.data.object.amount_total / 100

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: event.data.object.customer_details.email,
        subject: 'Order Confirmation',
        html: `<h1 style="color: #333; font-family:Arial;">Maison</h1><p>Thank you for your order. We will inform you when your order is shipped. Please see the details of your order below:</p>
       <ul>${itemsHtml}<ul><p>Total Amount: <strong>$${totalAmount}</strong>If you have any questions, please contact us orders@example.com.</p>`,
      })

      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);

      break
    case 'checkout.session.expired':
      const paymentMethod = event.data.object
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`)
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send()
}

export default {
  receiveUpdates,
}

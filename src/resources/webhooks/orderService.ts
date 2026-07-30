import { stripe } from '../../common/stripe'
import { prisma } from '../../../lib/prisma'
import type { Checkout } from 'stripe'

export interface OrderItemDetail {
  name: string
  quantity: number
  price: number
  images: string[]
}

export interface CreateOrderResult {
  orderId: string
  items: OrderItemDetail[]
}

export const createOrderFromSession = async (session: Checkout.Session): Promise<CreateOrderResult> => {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product'],
  })

  const userId = session.metadata?.userId
  const order = await prisma.order.create({
    data: { userId },
  })

  const orderDetails: OrderItemDetail[] = []

  for (const lineItem of lineItems.data) {
    const product = lineItem.price?.product
    if (typeof product === 'string' || !product) continue

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
        price: lineItem.amount_total / 100 / lineItem.quantity,
        quantity: lineItem.quantity,
      },
    })
  }
  return { orderId: order.id, items: orderDetails }
}

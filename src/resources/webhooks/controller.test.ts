import request from 'supertest'
import app from '../../app'
import { stripe } from '../../common/stripe'
import { sendOrderConfirmationEmail } from './emailService'
import { createOrderFromSession } from './orderService'

jest.mock('./orderService', () => ({
  createOrderFromSession: jest.fn(),
}))

jest.mock('./emailService', () => ({
  sendOrderConfirmationEmail: jest.fn(),
}))

jest.mock('../../common/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
  STRIPE_ENDPOINT_SECRET: 'test-secret',
}))

describe('webhooks controller', () => {
  it('checkout.session.completed', async () => {
    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'test-session-id',
          metadata: { userId: 'test-user-id' },
          amount_total: 1000,
          customer_details: {
            email: 'test@test.com',
            address: null,
            business_name: null,
            individual_name: null,
            name: null,
            phone: null,
            tax_exempt: null,
            tax_ids: [],
          },
          orderDetails: [],
        },
      },
    })
    ;(createOrderFromSession as jest.MockedFunction<typeof createOrderFromSession>).mockResolvedValue([])
    ;(sendOrderConfirmationEmail as jest.MockedFunction<typeof sendOrderConfirmationEmail>).mockResolvedValue(undefined)
    await request(app).post('/stripe/webhooks')
    expect(createOrderFromSession).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-session-id',
        amount_total: 1000,
        customer_details: expect.objectContaining({ email: 'test@test.com' }),
      }),
    )
    expect(sendOrderConfirmationEmail).toHaveBeenCalledWith('test@test.com', [], 10)
  })
  it('webhook signature verification failure', async () => {
    ;(stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature')
    })
    const response = await request(app).post('/stripe/webhooks')
    expect(response.status).toBe(400)
  })
  it('unknown event type', async () => {
    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'unknown.event',
    })
    const response = await request(app).post('/stripe/webhooks')
    expect(response.status).toBe(200)
  })
})

import request from 'supertest'
import app from '../app'

jest.mock('../resources/webhooks/controller', () => {
  return {
    __esModule: true,
    default: {
      receiveUpdates: (_req, res) => res.status(200).send(),
    },
  }
})

jest.mock('../common/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
  STRIPE_ENDPOINT_SECRET: 'test-secret',
}))

describe('unknownEndpoint middleware', () => {
  it('returns 404 for unknown endpoints', async () => {
    const response = await request(app).get('/this-does-not-exist')
    expect(response.status).toBe(404)
  })
})

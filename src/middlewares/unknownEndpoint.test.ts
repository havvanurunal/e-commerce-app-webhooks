import request from 'supertest'
import app from '../app'

describe('unknownEndpoint middleware', () => {
  it('returns 404 for unknown endpoints', async () => {
    const response = await request(app).get('/this-does-not-exist')
    expect(response.status).toBe(404)
  })
})

import { prisma } from '../../lib/prisma'
import { IncomingUser } from '../resources/users/schemas'

export async function createUser(incomingUser: IncomingUser) {
  return await prisma.user.create({
    data: {
      email: incomingUser.email,
      firstname: incomingUser.firstname,
      lastname: incomingUser.lastname,
      address: {
        line1: incomingUser.address.line1,
        city: incomingUser.address.city,
        postalCode: incomingUser.address.postalCode,
        country: incomingUser.address.country,
      },
    },
  })
}

export async function getUsers() {
  return await prisma.user.findMany()
}

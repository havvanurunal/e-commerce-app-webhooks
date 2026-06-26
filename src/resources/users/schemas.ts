import z from 'zod'
import { User } from '../../../generated/prisma'

export const CreateUserSchema = z.object({
  email: z.email(),
  firstname: z
    .string()
    .trim()
    .min(2, { message: 'First name must be at least 2 characters!' })
    .max(50, { message: 'First name must be max 15 characters!' }),
  lastname: z
    .string()
    .trim()
    .min(2, { message: 'Last name must be at least 2 characters!' })
    .max(50, { message: 'Last name must be max 15 characters!' }),
  address: z.object({
    line1: z
      .string()
      .trim()
      .min(2, { message: 'Line1 must be at least 2 characters!' })
      .max(100, 'Line1 must be max 100 characters.'),
    city: z
      .string()
      .trim()
      .min(2, { message: 'City must be at least 2 characters!' })
      .max(30, 'City must be max 30 characters.'),
    postalCode: z
      .string()
      .trim()
      .min(5, { message: 'Postal code must be at least 5 characters!' })
      .max(16, 'Postal code must be max 16 characters.'),
    country: z
      .string()
      .trim()
      .min(2, { message: 'Country must be at least 2 characters!' })
      .max(50, 'Country must be max 50 characters.'),
  }),
})

export type IncomingUser = z.infer<typeof CreateUserSchema>

export type ApiUser = {
  firstname: String
  lastname: String
  email: String
  address: {
    line1: String
    city: String
    postalCode: String
    country: String
  }
  createdAt: String
}

// to do: add type for user param (should be the type of user in Mongo/prisma)
export function toApiUser(user: User): ApiUser {
  return {
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    address: {
      line1: user.address.line1,
      city: user.address.city,
      postalCode: user.address.postalCode,
      country: user.address.country,
    },
    createdAt: new Date().toISOString(),
  }
}

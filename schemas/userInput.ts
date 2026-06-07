import z from 'zod'

export const UserInputSchemaV1 = z.object({
  username: z
    .string()
    .trim()
    .min(2, { message: 'Username name must be at least 2 characters!' })
    .max(10, { message: 'Username name must be max 10 characters!' }),
  email: z.email(),
})

export const UserInputSchemaV2 = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name name must be at least 2 characters!' })
    .max(10, { message: 'Name name must be max 10 characters!' }),
  surname: z
    .string()
    .trim()
    .min(2, { message: 'Surname name must be at least 2 characters!' })
    .max(10, { message: 'Surname name must be max 10 characters!' }),
  email: z.email(),
})

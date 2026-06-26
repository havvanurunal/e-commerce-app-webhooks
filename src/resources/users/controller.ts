import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { CreateUserSchema, toApiUser } from './schemas'
import { createUser, getUsers } from '../../services/dbService'

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getUsers()
    const apiUsers = users.map(toApiUser)
    res.status(200).json(apiUsers)
  } catch (error) {
    next(error)
  }
}

const createOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = CreateUserSchema.safeParse(req.body)

    if (!result.success) {
      console.log(result.error.flatten())
      return res.status(400).json({ message: 'Incorrect data provided' })
    }

    const createdUser = await createUser(result.data)
    const apiUser = toApiUser(createdUser)
    res.status(200).json({ ...apiUser })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Incorrect data provided' })
    } else {
      next(error)
    }
  }
}

export default {
  getAll,
  createOne,
}

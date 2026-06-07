import { Request, Response, NextFunction } from 'express'
import { UserInputSchemaV2 } from '../../../schemas/userInput'
import { ZodError } from 'zod'

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // use dummy data for now
    const users = ['John Doe', 'Jane Doe', 'John Smith', 'Jane Smith']
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

const createTwo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    UserInputSchemaV2.parse(req.body)
    res.status(200).json({
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      createdAt: new Date().toISOString(),
    })
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
  createTwo,
}

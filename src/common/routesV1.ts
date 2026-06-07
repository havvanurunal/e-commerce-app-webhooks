import { Router } from 'express'

const router: Router = Router()

// import routes
import routesV1 from '../resources/usersV1/routes'

// Higher level routes definition
router.use('/users', routesV1)

export default router

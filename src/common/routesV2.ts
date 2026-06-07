import { Router } from 'express'

const router: Router = Router()

// import routes
import routesV2 from '../resources/usersV2/routes'

// Higher level routes definition
router.use('/users', routesV2)

export default router

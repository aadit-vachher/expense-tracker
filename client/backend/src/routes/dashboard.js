import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { getDashboardData } from '../controllers/dashboardController.js'

const router = express.Router()

router.use(authenticateToken)
router.get('/', getDashboardData)

export default router

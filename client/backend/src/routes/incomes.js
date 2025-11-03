import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome
} from '../controllers/incomeController.js'

const router = express.Router()

router.use(authenticateToken)
router.get('/', getIncomes)
router.get('/:id', getIncome)
router.post('/', createIncome)
router.put('/:id', updateIncome)
router.delete('/:id', deleteIncome)

export default router

import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expenseController.js'

const router = express.Router()

router.use(authenticateToken)
router.get('/', getExpenses)
router.get('/:id', getExpense)
router.post('/', createExpense)
router.put('/:id', updateExpense)
router.delete('/:id', deleteExpense)

export default router

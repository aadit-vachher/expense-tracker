import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js'

const router = express.Router()

router.use(authenticateToken)
router.get('/', getCategories)
router.get('/:id', getCategory)
router.post('/', createCategory)
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)

export default router

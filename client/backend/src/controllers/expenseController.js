import prisma from '../utils/prisma.js'

export const getExpenses = async (req, res) => {
  try {
    const { categoryId, startDate, endDate, search } = req.query
    const where = { userId: req.user.id }

    if (categoryId) where.categoryId = parseInt(categoryId)
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }
    if (search) {
      where.description = { contains: search }
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' }
    })

    res.json(expenses)
  } catch (error) {
    console.error('Get expenses error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      },
      include: { category: true }
    })

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' })
    }

    res.json(expense)
  } catch (error) {
    console.error('Get expense error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createExpense = async (req, res) => {
  try {
    const { amount, description, date, categoryId } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' })
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description: description || null,
        date: date ? new Date(date) : new Date(),
        userId: req.user.id,
        categoryId: categoryId ? parseInt(categoryId) : null
      },
      include: { category: true }
    })

    res.status(201).json(expense)
  } catch (error) {
    console.error('Create expense error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateExpense = async (req, res) => {
  try {
    const { amount, description, date, categoryId } = req.body
    const expenseId = parseInt(req.params.id)

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: req.user.id
      }
    })

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' })
    }

    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        amount: amount ? parseFloat(amount) : existingExpense.amount,
        description: description !== undefined ? description : existingExpense.description,
        date: date ? new Date(date) : existingExpense.date,
        categoryId: categoryId !== undefined ? (categoryId ? parseInt(categoryId) : null) : existingExpense.categoryId
      },
      include: { category: true }
    })

    res.json(expense)
  } catch (error) {
    console.error('Update expense error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteExpense = async (req, res) => {
  try {
    const expenseId = parseInt(req.params.id)

    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: req.user.id
      }
    })

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' })
    }

    await prisma.expense.delete({
      where: { id: expenseId }
    })

    res.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Delete expense error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

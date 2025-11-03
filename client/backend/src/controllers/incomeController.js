import prisma from '../utils/prisma.js'

export const getIncomes = async (req, res) => {
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

    const incomes = await prisma.income.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' }
    })

    res.json(incomes)
  } catch (error) {
    console.error('Get incomes error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getIncome = async (req, res) => {
  try {
    const income = await prisma.income.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      },
      include: { category: true }
    })

    if (!income) {
      return res.status(404).json({ error: 'Income not found' })
    }

    res.json(income)
  } catch (error) {
    console.error('Get income error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createIncome = async (req, res) => {
  try {
    const { amount, description, date, categoryId } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' })
    }

    const income = await prisma.income.create({
      data: {
        amount: parseFloat(amount),
        description: description || null,
        date: date ? new Date(date) : new Date(),
        userId: req.user.id,
        categoryId: categoryId ? parseInt(categoryId) : null
      },
      include: { category: true }
    })

    res.status(201).json(income)
  } catch (error) {
    console.error('Create income error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateIncome = async (req, res) => {
  try {
    const { amount, description, date, categoryId } = req.body
    const incomeId = parseInt(req.params.id)

    const existingIncome = await prisma.income.findFirst({
      where: {
        id: incomeId,
        userId: req.user.id
      }
    })

    if (!existingIncome) {
      return res.status(404).json({ error: 'Income not found' })
    }

    const income = await prisma.income.update({
      where: { id: incomeId },
      data: {
        amount: amount ? parseFloat(amount) : existingIncome.amount,
        description: description !== undefined ? description : existingIncome.description,
        date: date ? new Date(date) : existingIncome.date,
        categoryId: categoryId !== undefined ? (categoryId ? parseInt(categoryId) : null) : existingIncome.categoryId
      },
      include: { category: true }
    })

    res.json(income)
  } catch (error) {
    console.error('Update income error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteIncome = async (req, res) => {
  try {
    const incomeId = parseInt(req.params.id)

    const income = await prisma.income.findFirst({
      where: {
        id: incomeId,
        userId: req.user.id
      }
    })

    if (!income) {
      return res.status(404).json({ error: 'Income not found' })
    }

    await prisma.income.delete({
      where: { id: incomeId }
    })

    res.json({ message: 'Income deleted successfully' })
  } catch (error) {
    console.error('Delete income error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

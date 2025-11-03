import prisma from '../utils/prisma.js'

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id

    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: { category: true }
    })

    const incomes = await prisma.income.findMany({
      where: { userId },
      include: { category: true }
    })

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalIncomes = incomes.reduce((sum, inc) => sum + inc.amount, 0)
    const balance = totalIncomes - totalExpenses

    const expenseByCategory = {}
    expenses.forEach(exp => {
      const catName = exp.category?.name || 'Uncategorized'
      expenseByCategory[catName] = (expenseByCategory[catName] || 0) + exp.amount
    })

    const incomeByCategory = {}
    incomes.forEach(inc => {
      const catName = inc.category?.name || 'Uncategorized'
      incomeByCategory[catName] = (incomeByCategory[catName] || 0) + inc.amount
    })

    const recentExpenses = expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
    
    const recentIncomes = incomes
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)

    const recentTransactions = [...recentExpenses.map(e => ({ ...e, type: 'expense' })), ...recentIncomes.map(i => ({ ...i, type: 'income' }))]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)

    res.json({
      summary: {
        totalExpenses,
        totalIncomes,
        balance
      },
      expenseByCategory,
      incomeByCategory,
      recentTransactions
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

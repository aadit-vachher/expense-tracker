import prisma from '../utils/prisma.js'

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' }
    })

    res.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getCategory = async (req, res) => {
  try {
    const category = await prisma.category.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      }
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json(category)
  } catch (error) {
    console.error('Get category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createCategory = async (req, res) => {
  try {
    const { name, color } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' })
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#6366f1',
        userId: req.user.id
      }
    })

    res.status(201).json(category)
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateCategory = async (req, res) => {
  try {
    const { name, color } = req.body
    const categoryId = parseInt(req.params.id)

    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: req.user.id
      }
    })

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name || existingCategory.name,
        color: color || existingCategory.color
      }
    })

    res.json(category)
  } catch (error) {
    console.error('Update category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id)

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: req.user.id
      }
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    await prisma.category.delete({
      where: { id: categoryId }
    })

    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const express=require('express')
const cors=require('cors')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const{PrismaClient}=require('@prisma/client')

const app=express()
const prisma=new PrismaClient()
const PORT=3000
const JWT_SECRET=process.env.JWT_SECRET||'fallback_secret_key'

app.use(cors())
app.use(express.json())


const authMiddleware=(req,res,next)=>{
  const token=req.headers.authorization?.split(' ')[1]
  if(!token)return res.status(401).json({error:'No token provided'})
  try{
    const decoded=jwt.verify(token,JWT_SECRET)
    req.userId=decoded.userId
    next()
  }catch(err){
    res.status(401).json({error:'Invalid token'})
  }
}


app.post('/api/auth/signup',async(req,res)=>{
  try{
    const{email,password,name}=req.body
    if(!email||!password)return res.status(400).json({error:'Missing email or password'})
    const existing=await prisma.user.findUnique({where:{email}})
    if(existing)return res.status(400).json({error:'User already exists'})
    const hashed=await bcrypt.hash(password,10)
    const user=await prisma.user.create({data:{email,password:hashed,name}})
    res.json({message:'User created',userId:user.id})
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

app.post('/api/auth/login',async(req,res)=>{
  try{
    const{email,password}=req.body
    const user=await prisma.user.findUnique({where:{email}})
    if(!user)return res.status(401).json({error:'Invalid credentials'})
    const valid=await bcrypt.compare(password,user.password)
    if(!valid)return res.status(401).json({error:'Invalid credentials'})
    const token=jwt.sign({userId:user.id},JWT_SECRET,{expiresIn:'7d'})
    res.json({token,user:{id:user.id,email:user.email,name:user.name}})
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

// EXPENSE ROUTES
app.get('/api/expenses',authMiddleware,async(req,res)=>{
  try{
    const expenses=await prisma.expense.findMany({
      where:{userId:req.userId},
      include:{category:true}
    })
    res.json(expenses)
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

app.post('/api/expenses',authMiddleware,async(req,res)=>{
  try{
    const{amount,description,date,categoryId}=req.body
    const expense=await prisma.expense.create({
      data:{amount,description,date:date?new Date(date):new Date(),userId:req.userId,categoryId}
    })
    res.json(expense)
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

app.put('/api/expenses/:id',authMiddleware,async(req,res)=>{
  try{
    const{amount,description,date,categoryId}=req.body
    const expense=await prisma.expense.update({
      where:{id:parseInt(req.params.id)},
      data:{amount,description,date:date?new Date(date):undefined,categoryId}
    })
    res.json(expense)
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

app.delete('/api/expenses/:id',authMiddleware,async(req,res)=>{
  try{
    await prisma.expense.delete({where:{id:parseInt(req.params.id)}})
    res.json({message:'Expense deleted'})
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

// INCOME ROUTES
app.get('/api/incomes',authMiddleware,async(req,res)=>{
  try{
    const incomes=await prisma.income.findMany({
      where:{userId:req.userId},
      include:{category:true}
    })
    res.json(incomes)
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

app.post('/api/incomes',authMiddleware,async(req,res)=>{
  try{
    const{amount,description,date,categoryId}=req.body
    const income=await prisma.income.create({
      data:{amount,description,date:date?new Date(date):new Date(),userId:req.userId,categoryId}
    })
    res.json(income)
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

app.put('/api/incomes/:id',authMiddleware,async(req,res)=>{
  try{
    const{amount,description,date,categoryId}=req.body
    const income=await prisma.income.update({
      where:{id:parseInt(req.params.id)},
      data:{amount,description,date:date?new Date(date):undefined,categoryId}
    })
    res.json(income)
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

app.delete('/api/incomes/:id',authMiddleware,async(req,res)=>{
  try{
    await prisma.income.delete({where:{id:parseInt(req.params.id)}})
    res.json({message:'Income deleted'})
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

// CATEGORY ROUTES
app.get('/api/categories',authMiddleware,async(req,res)=>{
  try{
    const categories=await prisma.category.findMany({where:{userId:req.userId}})
    res.json(categories)
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

app.post('/api/categories',authMiddleware,async(req,res)=>{
  try{
    const{name}=req.body
    const category=await prisma.category.create({data:{name,userId:req.userId}})
    res.json(category)
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

app.put('/api/categories/:id',authMiddleware,async(req,res)=>{
  try{
    const{name}=req.body
    const category=await prisma.category.update({
      where:{id:parseInt(req.params.id)},
      data:{name}
    })
    res.json(category)
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

app.delete('/api/categories/:id',authMiddleware,async(req,res)=>{
  try{
    await prisma.category.delete({where:{id:parseInt(req.params.id)}})
    res.json({message:'Category deleted'})
  }catch(err){
    res.status(500).json({error:err.message})
  }
})

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`)
})

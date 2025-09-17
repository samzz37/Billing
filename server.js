const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

// In-memory storage (in production, use a proper database)
let bills = []
let clients = []
let products = []

// API Routes
app.get('/api/bills', (req, res) => {
  res.json(bills)
})

app.post('/api/bills', (req, res) => {
  const bill = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  }
  bills.unshift(bill)
  res.json(bill)
})

app.get('/api/bills/:shareId', (req, res) => {
  const bill = bills.find(b => b.shareId === req.params.shareId)
  if (!bill) {
    return res.status(404).json({ error: 'Bill not found' })
  }
  res.json(bill)
})

app.get('/api/clients', (req, res) => {
  res.json(clients)
})

app.post('/api/clients', (req, res) => {
  const client = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  }
  clients.push(client)
  res.json(client)
})

app.get('/api/products', (req, res) => {
  res.json(products)
})

app.post('/api/products', (req, res) => {
  const product = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  }
  products.push(product)
  res.json(product)
})

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Web app: http://localhost:${PORT}`)
  console.log(`API: http://localhost:${PORT}/api`)
})
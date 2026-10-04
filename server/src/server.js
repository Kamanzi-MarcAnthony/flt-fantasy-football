import 'dotenv/config'
import app from './app.js'
import prisma from './config/prisma.js'
import adminRoutes from './routes/adminRoutes.js'

app.use('/api/admin', adminRoutes)
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await prisma.$connect()

    console.log('Database connected successfully')

    app.listen(PORT, () => {
      console.log(`Fantasy App API running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  }
}

startServer()

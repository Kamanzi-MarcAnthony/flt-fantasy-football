import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import leagueRoutes from './routes/leagueRoutes.js'

const app = express()

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://flt-fantasy-football.vercel.app'],
  }),
)

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Fantasy App API is running',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/leagues', leagueRoutes)

export default app

import { Router } from 'express'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  })
})

export default router

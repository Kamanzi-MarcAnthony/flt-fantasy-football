import { Router } from 'express'

import { makeTransfer } from '../controllers/transferController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = Router()

router.post(
  '/',
  authenticate,
  authorize('FANTASY_USER'),
  makeTransfer,
)

export default router
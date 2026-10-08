import { Router } from 'express'

import {
  makeTransfer,
  getTransferHistory,
} from '../controllers/transferController.js'

import { authenticate } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = Router()

// Make transfer
router.post(
  '/',
  authenticate,
  authorize('FANTASY_USER'),
  makeTransfer,
)

// Transfer history
router.get(
  '/history',
  authenticate,
  authorize('FANTASY_USER'),
  getTransferHistory,
)

export default router
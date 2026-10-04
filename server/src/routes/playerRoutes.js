import { Router } from 'express'
import {
  getPlayers,
  updatePlayer,
  deletePlayer,
} from '../controllers/playerController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  getPlayers,
)

router.patch(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  updatePlayer,
)

router.patch(
  '/:id/delete',
  authenticate,
  authorize('SUPER_ADMIN'),
  deletePlayer,
)

export default router
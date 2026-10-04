import { Router } from 'express'

import {
  createLeague,
  getLeagues,
  getLeagueById,
} from '../controllers/leagueController.js'

import { createPlayer } from '../controllers/playerController.js'

import { authenticate } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  getLeagues,
)

router.get(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  getLeagueById,
)

router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  createLeague,
)

router.post(
  '/:leagueId/players',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  createPlayer,
)

export default router
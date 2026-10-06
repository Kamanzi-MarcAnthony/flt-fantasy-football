import { Router } from 'express'

import {
  createLeague,
  getLeagues,
  getLeagueById,
  getLeagueLeaderboard,
  updateLeague,
  deleteLeague,
  getLeagueStats,
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
  '/:id/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  getLeagueStats,
)

router.get(
  '/:id/leaderboard',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  getLeagueLeaderboard,
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

router.patch(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  updateLeague,
)

router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  deleteLeague,
)

export default router
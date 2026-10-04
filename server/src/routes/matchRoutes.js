import { Router } from 'express'

import {
  getMatchday,
  recordGoal,
  awardCleanSheets,
  getMatchEvents,
} from '../controllers/matchController.js'

import { authenticate } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = Router()

router.get(
  '/leagues/:leagueId/matchday',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  getMatchday,
)

router.post(
  '/matches/:matchId/goals',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  recordGoal,
)

router.post(
  '/matches/:matchId/clean-sheets',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  awardCleanSheets,
)

router.get(
  '/matches/:matchId/events',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  getMatchEvents,
)

export default router
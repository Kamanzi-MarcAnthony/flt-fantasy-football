import { Router } from 'express'
import {
  getFantasyStatus,
  getAvailableLeagues,
  joinLeague,
  getFantasyPlayers,
  createFantasyTeam,
  getMyTeam,
  updateTeamCaptains
} from '../controllers/fantasyController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = Router()

router.get(
  '/status',
  authenticate,
  authorize('FANTASY_USER'),
  getFantasyStatus,
)

router.get(
  '/leagues',
  authenticate,
  authorize('FANTASY_USER'),
  getAvailableLeagues,
  getFantasyStatus
)

router.post(
  '/leagues/:leagueId/join',
  authenticate,
  authorize('FANTASY_USER'),
  joinLeague,
)

router.get(
  '/players',
  authenticate,
  authorize('FANTASY_USER'),
  getFantasyPlayers,
)

router.post(
  '/teams',
  authenticate,
  authorize('FANTASY_USER'),
  createFantasyTeam,
)

router.get(
  '/teams/my-team',
  authenticate,
  authorize('FANTASY_USER'),
  getMyTeam,
)

router.patch(
  '/teams/:teamId/captains',
  authenticate,
  authorize('FANTASY_USER'),
  updateTeamCaptains,
)

export default router
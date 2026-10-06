import { Router } from 'express'
import {
  getFantasyStatus,
  getAvailableLeagues,
  joinLeague,
  getFantasyPlayers,
  createFantasyTeam,
  getMyTeam,
  getFantasyPoints,
  updateTeamCaptains,
  updateFantasyTeam,
  deleteFantasyAccount,
  getFantasyLeaderboard
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

router.get(
  '/points',
  authenticate,
  authorize('FANTASY_USER'),
  getFantasyPoints,
)

router.patch(
  '/teams/:teamId/captains',
  authenticate,
  authorize('FANTASY_USER'),
  updateTeamCaptains,
)

router.patch(
  '/teams/:teamId',
  authenticate,
  authorize('FANTASY_USER'),
  updateFantasyTeam,
)

router.delete(
  '/account',
  authenticate,
  authorize('FANTASY_USER'),
  deleteFantasyAccount,
)

router.get(
  '/leaderboard',
  authenticate,
  authorize('FANTASY_USER'),
  getFantasyLeaderboard,
)
export default router
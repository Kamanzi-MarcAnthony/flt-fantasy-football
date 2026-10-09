import { Router } from 'express'

import {
  getFantasyStatus,
  getAvailableLeagues,
  joinLeague,
  getFantasyPlayers,
  createFantasyTeam,
  getMyTeam,
  getFantasyTeamById,
  getFantasyPoints,
  getFantasyTransferStatus,
  updateTeamCaptains,
  updateFantasyTeam,
  deleteFantasyAccount,
  getFantasyLeaderboard,
  updatePitchSlots
} from '../controllers/fantasyController.js'

import transferRoutes from './transferRoutes.js'
import  { getTransferHistory } from '../controllers/transferController.js'

import { authenticate } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = Router()

// Fantasy status
router.get(
  '/status',
  authenticate,
  authorize('FANTASY_USER'),
  getFantasyStatus,
)

// Available leagues
router.get(
  '/leagues',
  authenticate,
  authorize('FANTASY_USER'),
  getAvailableLeagues,
)

// Join a league
router.post(
  '/leagues/:leagueId/join',
  authenticate,
  authorize('FANTASY_USER'),
  joinLeague,
)

// Fantasy players
router.get(
  '/players',
  authenticate,
  authorize('FANTASY_USER'),
  getFantasyPlayers,
)

// Create fantasy team
router.post(
  '/teams',
  authenticate,
  authorize('FANTASY_USER'),
  createFantasyTeam,
)

// Get my fantasy team
router.get(
  '/teams/my-team',
  authenticate,
  authorize('FANTASY_USER'),
  getMyTeam,
)

// Fantasy points
router.get(
  '/points',
  authenticate,
  authorize('FANTASY_USER'),
  getFantasyPoints,
)

// Transfer status
router.get(
  '/transfer-status',
  authenticate,
  authorize('FANTASY_USER'),
  getFantasyTransferStatus,
)

// Team captains
router.patch(
  '/teams/:teamId/captains',
  authenticate,
  authorize('FANTASY_USER'),
  updateTeamCaptains,
)

// Update fantasy team
router.patch(
  '/teams/:teamId',
  authenticate,
  authorize('FANTASY_USER'),
  updateFantasyTeam,
)

// Delete fantasy account
router.delete(
  '/account',
  authenticate,
  authorize('FANTASY_USER'),
  deleteFantasyAccount,
)

// Fantasy leaderboard
router.get(
  '/leaderboard',
  authenticate,
  authorize('FANTASY_USER'),
  getFantasyLeaderboard,
)

// Transfers
router.use(
  '/transfers',
  transferRoutes,
)

router.get(
  '/history',
  authenticate,
  authorize('FANTASY_USER'),
  getTransferHistory,
)

router.get(
  '/teams/:teamId',
  authenticate,
  authorize('FANTASY_USER'),
  getFantasyTeamById,
)

router.patch(
  '/teams/:teamId/slots',
  authenticate,
  authorize('FANTASY_USER'),
  updatePitchSlots,
)


export default router
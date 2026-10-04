import { Router } from 'express'
import {
  getFantasyStatus,
  getAvailableLeagues,
  joinLeague,
  getFantasyPlayers,
  createFantasyTeam,
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


export default router
import { Router } from 'express'
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  updateAdminStatus,
  resetAdminPassword,
} from '../controllers/adminController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  getAdmins,
)

router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  createAdmin,
)

router.patch(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  updateAdmin,
)

router.patch(
  '/:id/status',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  updateAdminStatus,
)

router.patch(
  '/:id/password',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  resetAdminPassword,
)

export default router
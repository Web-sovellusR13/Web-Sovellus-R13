import { Router } from 'express'
import {
  getGroups,
  getGroupById,
  createGroup,
  addMember,
  removeMemberFromGroup,
  requestToJoinGroup,
  getPendingRequests,
  respondToJoinRequest
} from '../controllers/groupController.js'

const router = Router()

router.get('/', getGroups)
router.get('/:id', getGroupById)
router.post('/', createGroup)
router.post('/:id/members', addMember)
router.delete('/:id/members/:memberId', removeMemberFromGroup)
router.post('/:id/request-join', requestToJoinGroup)
router.get('/:id/requests', getPendingRequests)
router.post('/:id/requests/:requestId', respondToJoinRequest)

export default router
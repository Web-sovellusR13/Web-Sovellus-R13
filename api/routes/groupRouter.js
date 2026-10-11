import { Router } from 'express'
import { auth } from '../helper/auth.js'

import { 
  getGroups,
  getGroupById, 
  createGroup,
  getMyGroups,
  addMember,
  removeMemberFromGroup,
  addMovieToGroup,
  requestToJoinGroup,
  getPendingRequests,
  respondToJoinRequest
} from '../controllers/groupController.js'

const router = Router()

// Ryhmien hakeminen ja luominen
router.get('/', getGroups)
router.post('/', createGroup)
router.get('/my-groups', auth, getMyGroups)

// Yksittäisen ryhmän elokuvat ja jäsenet
router.post('/:id/movies', auth, addMovieToGroup)
router.post('/:id/members', addMember)
router.delete('/:id/members/:memberId', removeMemberFromGroup)

// Ryhmään liittyminen ja liittymispyynnöt
router.post('/:id/request-join', requestToJoinGroup)
router.get('/:id/requests', getPendingRequests)
router.post('/:id/requests/:requestId', respondToJoinRequest)

// Yksittäisen ryhmän hakeminen
router.get('/:id', getGroupById)

export default router
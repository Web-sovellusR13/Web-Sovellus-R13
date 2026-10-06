import { Router } from 'express'
import { auth } from '../helper/auth.js'
import { 
  getGroups, 
  getGroupById, 
  createGroup, 
  addMember,
  removeMemberFromGroup
} from '../controllers/groupController.js'

const router = Router()

router.get('/', getGroups)
router.post('/', createGroup)
router.get('/:id', getGroupById)
router.post('/:id/members', addMember)
router.delete('/:id/members/:userID', auth, removeMemberFromGroup)

export default router
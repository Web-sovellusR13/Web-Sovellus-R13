import { Router } from 'express'
import { 
  getGroups, 
  getGroupById, 
  createGroup, 
  addMember
} from '../controllers/groupController.js'

const router = Router()

router.get('/', getGroups)
router.post('/', createGroup)
router.get('/:id', getGroupById)
router.post('/:id/members', addMember)

export default router
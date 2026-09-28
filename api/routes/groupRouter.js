import { Router } from 'express'
import { 
  getGroups, 
  getGroupById, 
  createGroup 
} from '../controllers/groupController.js'

const router = Router()

router.get('/', getGroups)
router.post('/', createGroup)
router.get('/:id', getGroupById)

export default router
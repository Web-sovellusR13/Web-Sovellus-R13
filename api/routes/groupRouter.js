import { Router } from 'express'
import { getGroups, getGroupById, createGroup } from '../controllers/groupController.js'

const router = Router()

router.get('/', getGroups)

router.get('/:id', getGroupById)

router.post('/', createGroup)

export default router
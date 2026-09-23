import { Router } from 'express'
import { signin, signup, deleteAccount } from '../controllers/UserController.js'
import { auth } from '../helper/auth.js'

const router = Router()

router.post('/signin', signin)
router.post('/signup', signup)

router.delete('/me',auth, deleteAccount)

export default router

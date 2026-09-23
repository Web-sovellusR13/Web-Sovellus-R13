import { Router } from 'express'
import { addReview } from '../controllers/ReviewController.js'
import { auth } from '../helper/auth.js'

const router = Router()

router.post('/', auth, addReview)

export default router
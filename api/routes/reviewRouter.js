import { Router } from 'express'
import { addReview, getReviews } from '../controllers/ReviewController.js'
import { auth } from '../helper/auth.js'

const router = Router()

router.get('/:movieID', getReviews)
router.post('/', auth, addReview)

export default router
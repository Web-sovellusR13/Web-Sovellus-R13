import { Router } from 'express'
import { addFavorite } from '../controllers/favoriteController.js'
import { auth } from '../helper/auth.js'

const router = Router()

router.post('/', auth, addFavorite)

export default router

import { Router } from 'express'
import { addFavorite, getFavorites } from '../controllers/favoriteController.js'
import { auth } from '../helper/auth.js'

const router = Router()

router.post('/', auth, addFavorite)
router.get("/:userID", getFavorites)

export default router

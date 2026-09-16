import { Router } from 'express'
import { getNowPlaying, getMovie } from '../controllers/MovieController.js'

const router = Router()

router.get('/now-playing', getNowPlaying)
router.get('/:id', getMovie)

export default router
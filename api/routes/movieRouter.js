import { Router } from 'express'
import { getNowPlaying, getMovie, getRandomMovie, getMovieGenres } from '../controllers/MovieController.js'

const router = Router()

router.get('/now-playing', getNowPlaying)
router.get('/random', getRandomMovie)
router.get('/genres', getMovieGenres)
router.get('/:id', getMovie)

export default router

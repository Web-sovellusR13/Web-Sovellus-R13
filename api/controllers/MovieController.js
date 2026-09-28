import { getNowPlayingMovies, getMovieById, getRandomMovieFromApi, getMovieGenreIds } from '../models/Movie.js'

const getNowPlaying = async (req, res, next) => {
    try {
        const result = await getNowPlayingMovies()
        return res.status(200).json(result)
    } catch (error) {
        return next(error)
    }
}

const getMovie = async (req, res, next) => {
    try {
        const result = await getMovieById(req.params.id)
        return res.status(200).json(result)
    } catch (error) {
        return next(error)
    }
}

const getRandomMovie = async (req, res, next) => {
    try {
        console.log(req.params)
        const result = await getRandomMovieFromApi(req.query.genre, req.query.year)
        if (!result) {
          const error = new Error('No random movie was found') 
          return next(error);
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return next(error)
    }
}

const getMovieGenres = async (req, res, next) => {
    try {
        const result = await getMovieGenreIds()
        return res.status(200).json(result)
    } catch (error) {
        return next(error)
    }
}

export { getNowPlaying, getMovie, getRandomMovie, getMovieGenres }

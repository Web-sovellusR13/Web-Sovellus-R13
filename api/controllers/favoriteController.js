import { addNewFavorite } from '../models/favorite.js'

const addFavorite = async (req, res, next) => {
    try {
        const userID = req.user.userId
        const movieID = req.body.movieID

        const result = await addNewFavorite(userID, movieID)
        
        return res.status(201).json(result.rows[0])
    } catch (error) {
        if (error.code === '23505') {
            const error =  new Error('The movie is already in your favorites')
            error.status = 409
            return next(error)
        }
        return next(error)
    }
}

export { addFavorite }
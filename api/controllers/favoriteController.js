import { addNewFavorite, selectAllFavorites } from '../models/favorite.js'

const addFavorite = async (req, res, next) => {
    try {
        const userID = req.user.userId
        const movieID = req.body.movieID

        const result = await addNewFavorite(userID, movieID)
        
        return res.status(201).json(result.rows[0])
    } catch (error) {
        if (error.code === '23505') {
            const error =  new Error('The movie is already in your favorites')
            return next(error)
        }
        return next(error)
    }
}

const getFavorites = async (req, res, next) => {
    try {
        const { userID } = req.params
        const result  = await selectAllFavorites(userID)
        return res.status(200).json(result.rows || [])
    } catch (error) {
        return  next(error)
    }
}

export { addFavorite, getFavorites }
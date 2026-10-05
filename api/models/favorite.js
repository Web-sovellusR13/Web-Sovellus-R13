import { pool } from './db.js'

const addNewFavorite = async (userID, movieID) => {
    const result = await pool.query(
        'INSERT INTO public.favorites ("userID", "movieID") VALUES ($1, $2) RETURNING "userID", "movieID"',[userID, movieID],
    )
    return result
}

const selectAllFavorites = async (userID) => {
    const result = await pool.query(
        'SELECT * FROM public.favorites WHERE "userID" = $1',[userID]
    )
    return result
}

export  { addNewFavorite, selectAllFavorites }
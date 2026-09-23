import { pool } from './db.js'
import axios from 'axios'

const createReview = async (userID, movieID, review, rating) => {
    const result = await pool.query(
        'INSERT INTO public.reviews ("userID", "movieID", review, rating) VALUES ($1, $2, $3, $4) RETURNING *', [userID, movieID, review, rating]
    )
    return result.rows[0]
}

//const getReviewsByMovieId = async (movieID)

export { createReview }
import { pool } from './db.js'
import axios from 'axios'

const createReview = async (userID, movieID, review, rating) => {
    const result = await pool.query(
        'INSERT INTO public.reviews ("userID", "movieID", review, rating) VALUES ($1, $2, $3, $4) RETURNING *', [userID, movieID, review, rating]
    )
    return result.rows[0]
}

const getReviewsByMovieId = async (movieID) => {
    const result = await pool.query(
        `SELECT
            reviews."revID",
            reviews.review,
            reviews.rating,
            reviews.time,
            app_users.username
        FROM public.reviews
        JOIN public.app_users
            ON reviews."userID" = app_users."userID"
        WHERE reviews."movieID" = $1
        ORDER BY reviews.time DESC`, [movieID]
    )
    return result.rows
}

export { createReview, getReviewsByMovieId }
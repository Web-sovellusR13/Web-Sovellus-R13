import { createReview, getReviewsByMovieId } from "../models/Review.js";
import { ApiError } from "../helper/ApiError.js";

const addReview = async (req, res, next) => {
    try{
        const userID = req.user.userId
        const movieID = req.body.movieID
        const review = req.body.review
        const rating = req.body.rating

        if (!movieID){
            throw new ApiError('Movie ID is required', 400)
        }
        if (!review || !rating){
            throw new ApiError('Review and rating are required', 400)
        }

        if (rating <1 || rating >5){
            throw new ApiError('Rating must be between 1 and 5', 400)
        }

        const result = await createReview(userID, movieID, review, rating)
        return res.status(201).json(result)
    } catch (error){
        return next(error)
    }
}

const getReviews = async (req, res, next) => {
    try{
        const movieID = req.params.movieID
        
        const result = await getReviewsByMovieId(movieID)
        return res.status(201).json(result)
    } catch (error){
        return next(error)
    }
}

export { addReview, getReviews }
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../context/useUser'
import axios from 'axios'
import './MovieDetails.css'

const apiUrl = import.meta.env.VITE_API_URL

function MovieDetails() {
    const { user } = useUser()

    const { id } = useParams()
    const navigate = useNavigate()

    const [movie, setMovie] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    const addFavorite = async () => {
        try {
            const response = await axios.post(`${apiUrl}/api/favorites`,{
                movieID: movie.id
            },
            {
                headers: {'Authorization': `Bearer ${user.token}`}
            })

            if (response.status === 201) {
                alert('Movie added to favorites successfully')
            }

        } catch (error) {
            if (error.response?.status === 401) {
                alert('Please sign in to add favorites')
            } else if (error.response?.data?.error?.message) {
                alert(error.response.data.error.message)
            } else {
                alert(error)
            }
        }
    } 

    useEffect(() => {
        axios.get(`${apiUrl}/api/movies/${id}`)
            .then(response => {
                setMovie(response.data)
                setLoading(false)
            })
            .catch(error => {
                alert(error.response ? error.response.data : error)
                setLoading(false)
            })
    }, [id])

    useEffect(() => {
        axios.get(`${apiUrl}/api/reviews/${id}`)
            .then(response => {
                setReviews(response.data)
            })
            .catch(error => {
                alert(error.response ? error.response.data : error)
                })
    }, [id])

    if (loading) {
        return <p>Loading movie...</p>
    }

    return (
        <div>
            <button onClick={() => navigate(-1)}>
                ← Back
            </button>

            <div className="movie-details">
                <h1>{movie.title}</h1>
                
                <img
                    className="details-poster"
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                />

                <div className="movie-info">
                    <h2>Overview</h2>
                    <p>{movie.overview}</p>
                    <p>Release date: {movie.release_date}</p>
                    <p>Runtime: {movie.runtime} minutes</p>
                    <p>Genres: {movie.genres.map(genre => genre.name).join(', ')}</p>
                    <button onClick={addFavorite}>
                        Add favorite
                    </button>
                </div>

                <div className="reviews-section">
                    <h2>Reviews</h2>
                
                    {reviews.length === 0 ? (
                        <p>No reviews yet.</p>
                    ) : (
                        reviews.map(review => (
                            <div
                                className="review-card"
                                key={review.revID}
                            >
                                <h3>User: {review.username}</h3>
                                <p>{review.review}</p>
                                <p>Rating: {review.rating}/5</p>
                                <p>
                                    {new Date(review.time).toLocaleString('fi-FI', {
                                        timeZone: 'Europe/Helsinki',
                                        dateStyle: 'short',
                                        timeStyle: 'short'
                                    })}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default MovieDetails
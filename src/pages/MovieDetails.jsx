import { useState, useEffect } from 'react'
import { useUser } from '../context/useUser'
import { useNavigation } from '../context/useNavigation'
import axios from 'axios'
import './MovieDetails.css'

const apiUrl = import.meta.env.VITE_API_URL

function MovieDetails() {
    const { user } = useUser()
    const { movieId, goBack } = useNavigation()

    const [movie, setMovie] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [reviewText, setReviewText] = useState('')
    const [rating, setRating] = useState('')
    const [groups, setGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState('')

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

    const addMovieToGroup = async () => {
        if (!selectedGroup) {
            alert('Please select a group')
            return
        }

        try {
            const response = await axios.post(
            `${apiUrl}/api/groups/${selectedGroup}/movies`,
            { movieID: movie.id },
            {
                headers: {
                Authorization: `Bearer ${user.token}`,
                },
            }
            )

            if (response.status === 200) {
                alert('Movie is already in this group')
            } else if (response.status === 201) {
                alert('Movie added to group successfully')
            }
        } catch (error) {
            if (error.response?.status === 401) {
                alert('Please sign in to add a movie to a group')
            } else if (error.response?.data?.error?.message) {
                alert(error.response.data.error.message)
            } else if (error.response?.data?.error) {
                alert(error.response.data.error)
            } else {
                alert('Something went wrong')
            }
        }
    }

    const addReview = async () => {
        if (!reviewText.trim() || !rating) {
            alert('Please write a review and select a rating')
            return
        }

        try{
            const response = await axios.post(`${apiUrl}/api/reviews`,{
                movieID: movie.id,
                review: reviewText,
                rating: Number(rating)
            },
            {
                headers: {'Authorization': `Bearer ${user.token}`}
            })
            
            if (response.status === 201) {
                alert('Review added successfully')

                setReviewText('')
                setRating('')

                axios.get(`${apiUrl}/api/reviews/${movieId}`)
                    .then(response => {
                    setReviews(response.data)
                })
            }

        } catch (error) {
            if (error.response?.status === 401) {
                alert('Please sign in to add a review')
            } else if (error.response?.data?.error?.message) {
                alert(error.response.data.error.message)
            } else {
                alert('Something went wrong')
            }
        }
    }

    useEffect(() => {
        axios.get(`${apiUrl}/api/movies/${movieId}`)
            .then(response => {
                setMovie(response.data)
                setLoading(false)
            })
            .catch(error => {
                alert(error.response ? error.response.data : error)
                setLoading(false)
            })
    }, [movieId])

    useEffect(() => {
        axios.get(`${apiUrl}/api/reviews/${movieId}`)
            .then(response => {
                setReviews(response.data)
            })
            .catch(error => {
                alert(error.response ? error.response.data : error)
            })
    }, [movieId])

    useEffect(() => {
        if (!user?.token) {
            return
        }

        axios.get(`${apiUrl}/api/groups/my-groups`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
            .then(response => {
                setGroups(response.data)
            })
            .catch(error => {
                alert(error.response ? error.response.data : error)
            })
    }, [user])

    if (loading) {
        return <p>Loading movie...</p>
    }

    return (
        <div>
            <button onClick={goBack}>
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
                    <hr className="section-divider" />

                    {user?.token && (
                        <button className='favButton' onClick={addFavorite}>
                            Add favorite
                        </button>
                    )}

                    {user?.token && (
                    <div className="group-form">
                        <h3>Add movie to group</h3>

                        {groups.length === 0 ? (
                        <p>You don't belong to any groups yet.</p>
                        ) : (
                        <>
                            <select
                            value={selectedGroup}
                            onChange={(event) => setSelectedGroup(event.target.value)}
                            >
                            <option value="">Select group</option>

                            {groups.map((group) => (
                                <option key={group.idGroup} value={group.idGroup}>
                                {group.groupName}
                                </option>
                            ))}
                            </select>

                            <button onClick={addMovieToGroup}>
                            Add to group
                            </button>
                        </>
                        )}
                    </div>
                    )}

                    {user?.token ? (
                        <div className="review-form">
                            <h3>Write a review</h3>

                            <textarea
                                rows="3"
                                value={reviewText}
                                onChange={event => setReviewText(event.target.value)}
                                placeholder="Write your review here..."
                            />

                            <label>
                                Rating:
                                <select
                                    value={rating}
                                    onChange={event => setRating(event.target.value)}
                                >
                                    <option value="">Select rating</option>
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                    <option value={5}>5</option>
                                </select>
                            </label>

                            <button onClick={addReview}>
                                Add review
                            </button>
                        </div>
                    ) : (
                        <p>Please sign in to write a review.</p>
                    )}
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
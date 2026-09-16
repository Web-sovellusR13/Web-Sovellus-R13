import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './MovieDetails.css'

const apiUrl = import.meta.env.VITE_API_URL

function MovieDetails() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [movie, setMovie] = useState(null)
    const [loading, setLoading] = useState(true)

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

    if (loading) {
        return <p>Loading movie...</p>
    }

    return (
        <div>
            <button onClick={() => navigate(-1)}>
                ← Back
            </button>

            <div className="movie-details">
                <img
                    className="details-poster"
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                />

                <div className="movie-info">
                    <h1>{movie.title}</h1>
                    <p>Release date: {movie.release_date}</p>
                    <p>Runtime: {movie.runtime} minutes</p>
                    <p>Genres: {movie.genres.map(genre => genre.name).join(', ')}</p>
                    <h2>Overview</h2>
                    <p>{movie.overview}</p>
                </div>
            </div>
        </div>
    )
}

export default MovieDetails
import { useState, useEffect } from 'react'
import axios from 'axios'
import MovieCard from '../components/MovieCard'
import './NowPlaying.css'

const apiUrl = import.meta.env.VITE_API_URL

function NowPlaying() {

    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${apiUrl}/api/movies/now-playing`)
            .then(response => {
                setMovies(response.data.results)
                setLoading(false)
            })
            .catch(error => {
                alert(error.response ? error.response.data : error)
                setLoading(false)
            })
    }, [])

    return (
        <div>
            <h1>Now in Cinemas</h1>

            {loading && <p>Loading movies...</p>}

            <div className="movie-grid">
                {!loading && movies.map(movie => (
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                    />
                ))}
            </div>
        </div>
    )
}

export default NowPlaying
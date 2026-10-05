import { Link } from 'react-router-dom'
import { useNavigation } from '../context/useNavigation'
import './MovieCard.css'

function MovieCard({ movie }) {
    const { openMovie } = useNavigation()

    return (
        <Link 
            to={`/movies/${movie.id}`}
            className="movie-card"
            onClick={(e) => {
                e.preventDefault()
                openMovie(movie.id, "main")
            }}
        >
            <img
                className="movie-poster"
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
            />
            <h2>{movie.title}</h2>
        </Link>
    )
}

export default MovieCard
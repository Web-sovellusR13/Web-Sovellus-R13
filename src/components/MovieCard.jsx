import { Link } from 'react-router-dom'
import './MovieCard.css'

function MovieCard({ movie }) {

    return (
        <Link to={`/movies/${movie.id}`} className="movie-card">
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
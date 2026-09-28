import { Link } from 'react-router-dom'
import './FavoriteCard.css'

function FavoriteCard({ movie }) {

    return (
        <Link to={`/movies/${movie.id}`} className="favorite-card">
            <img
                className="favorite-poster"
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
            />
            <h2>{movie.title}</h2>
        </Link>
    )
}

export default FavoriteCard
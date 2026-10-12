import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useNavigation } from '../context/useNavigation'
import { useUser } from '../context/useUser'
import './FavoriteCard.css'

function FavoriteCard({ movie }) {
    const { openMovie } = useNavigation()
    const navigate = useNavigate()
    const { user, setUser } = useUser()


    return (
        <Link to={`/movies/${movie.id}`} 
        className="favorite-card" 
        onClick={(e) => {
                e.preventDefault()
                openMovie(movie.id, "main")
                navigate('/')
            }}
        >
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
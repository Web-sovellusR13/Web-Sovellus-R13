import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../context/useUser'
import axios from 'axios'
import './Favorites.css'
import FavoriteCard from '../components/FavoriteCard.jsx'


const apiUrl = import.meta.env.VITE_API_URL

function Favorites() {
    const { user } = useUser()
    const { userID } = useParams()
    const navigate = useNavigate()

    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const getFavorites = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/favorites/${userID}`)

                const favoriteMovies = await Promise.all(
                    response.data.map(async favorite => {
                        const movieResponse = await axios.get(`${apiUrl}/api/movies/${favorite.movieID}`)

                        return movieResponse.data
                    })
                )

                setFavorites(favoriteMovies)
                setLoading(false)
            } catch (error) {
                console.error(error)
                setLoading(false)
            }
        }

        getFavorites()
    }, [userID])

    const shareFavorites = async () => {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied!')
    }

    return (
        <div>
            <div className='button-container'>
                <button onClick={() => navigate(-1)}>
                 ← Back
                </button>
                
                <button onClick={shareFavorites}>
                 Share
                </button>
            </div>

            <h1>Favorite movies</h1>
            {loading && <p>Loading the list...</p>}

            <div className='movieList'>
                {!loading && favorites.map(movie => (
                    <FavoriteCard
                        key={movie.id}
                        movie={movie}
                    />
                ))}
            </div>
        </div>
    )
}

export default Favorites
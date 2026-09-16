import axios from 'axios'

const getNowPlayingMovies = async () => {
    const response = await axios.get(
        'https://api.themoviedb.org/3/movie/now_playing',
        {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_TOKEN}`
            },
            params: {
                language: 'en-US',
                region: 'FI',
                page: 1
            }
        }
    )
    return response.data
}

const getMovieById = async (movieId) => {
    const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}`,
        {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_TOKEN}`
            },
            params: {
                language: 'en-US'
            }
        }
    )

    return response.data
}

export { getNowPlayingMovies, getMovieById }
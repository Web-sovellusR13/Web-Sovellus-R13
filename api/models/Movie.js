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

const getRandomMovieFromApi = async (genre, year) => {
    const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie`,
        {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_TOKEN}`
            },
            params: {
                language: 'en-US',
                primary_release_year: year,
                with_genres: genre
            }
        }
    )

    if (response.data.results.length == 0) {
      return null;
    }

    const randomIdx = Math.floor(Math.random() * response.data.results.length);
    return response.data.results[randomIdx]
}

const getMovieGenreIds = async () => {
    const response = await axios.get(
        `https://api.themoviedb.org/3/genre/movie/list`,
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

export { getNowPlayingMovies, getMovieById, getRandomMovieFromApi, getMovieGenreIds }

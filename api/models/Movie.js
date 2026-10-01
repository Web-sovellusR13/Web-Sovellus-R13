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

const searchMovies = async (type, query, genre, year) => {
    let endpoint
    let params = {
        language: 'en-US',
    }

    if (query) {
        if (type === 'tv') {
            endpoint = 'https://api.themoviedb.org/3/search/tv'
            params.query = query
            if (year) {
                params.first_air_date_year = year
            }

        } else {
            endpoint = 'https://api.themoviedb.org/3/search/movie'
            params.query = query
            params.region = 'FI'
            if (year) {
                params.year = year
            }
        }

    } else {
        if (type === 'tv') {
            endpoint = 'https://api.themoviedb.org/3/discover/tv'
            if (year) {
                params.first_air_date_year = year
            }

        } else {
            endpoint = 'https://api.themoviedb.org/3/discover/movie'
            if (year) {
                params.primary_release_year = year
            }
            params.region = 'FI'
        }
        if (genre) {
            params.with_genres = genre
        }
    }

    const response = await axios.get(
        endpoint,
        {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_TOKEN}`
            },
            params
        }
    )

    let results = response.data.results || []

    if (query && genre) {
        results = results.filter(item =>
            item.genre_ids?.includes(Number(genre))
        )
    }

    return results
}


export { getNowPlayingMovies, getMovieById, getRandomMovieFromApi, getMovieGenreIds, searchMovies }
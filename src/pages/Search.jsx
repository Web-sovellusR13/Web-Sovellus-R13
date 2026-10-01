import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL

const Search = () => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [genres, setGenres] = useState([])

    const [type, setType] = useState('movie')
    const [year, setYear] = useState('')
    const [genre, setGenre] = useState('')

    useEffect(() => {
        axios.get(`${apiUrl}/api/movies/genres`)
            .then(response => {
                setGenres(response.data.genres)
            })
            .catch(error => {
                alert(error.response ? error.response.data : error)
            })
    }, [])

    const fetchResults = async () => {
        if (!query.trim() && !genre && !year) {
            setResults([])
            return
        }

        try {
            const response = await axios.get(
                `${apiUrl}/api/movies/search`,
                {
                    params: {
                        type,
                        query,
                        genre,
                        year
                    },
                }
            )

            setResults(response.data)
        } catch(error){
            alert(error.response ? error.response.data : error)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        fetchResults()
    };

    return (
        <div id="searchbar">
            <form onSubmit={handleSearch}>
                <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                >
                    <option value="movie">Movies</option>
                    <option value="tv">TV Shows</option>
                </select>

                <input
                    type="text"
                    placeholder="Search by title"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />

                <select
                    value={genre}
                    onChange={e => setGenre(e.target.value)}
                >
                    <option value="">All genres</option>

                    {genres.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Year"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                />

                <button type="submit">Search</button>
            </form>

            <ul>
                {results.map((item, index) => {
                    const title = item.title || item.name
                    const date = item.release_date || item.first_air_date
                    const year = date ? date.substring(0, 4) : ''

                    return (
                        <li key={item.id || index}>
                            <Link to={`/movies/${item.id}`}>
                                {title} {year && `(${year})`}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default Search;

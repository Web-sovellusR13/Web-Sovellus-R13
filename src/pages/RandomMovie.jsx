import { useState, useEffect } from 'react'
import axios from 'axios'
import MovieCard from '../components/MovieCard'
import './RandomMovie.css'

const apiUrl = import.meta.env.VITE_API_URL

function RandomMovie() {

  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState()
  const [selectedYear, setSelectedYear] = useState()
  const [movie, setMovie] = useState()

  useEffect(() => {
    axios.get(`${apiUrl}/api/movies/genres`)
      .then(response => {
          setGenres(response.data.genres)
      })
      .catch(error => {
          alert(error.response ? error.response.data : error)
      })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault() 

    axios.get(
      `${apiUrl}/api/movies/random`,
      {
        params: {
          genre: selectedGenre,
          year: selectedYear
        }
      }
    )
    .then(response => {
      setMovie(response.data)
    })
    .catch(error => {
      alert(error.response ? error.response.data : error)
    })
  }

  return (
    <div className="random-movie-container">
      <form onSubmit={handleSubmit}>
        <label>Genre: </label>
        <select
          id="genre"
          onChange={e => setSelectedGenre(e.target.value)}
        >
          <option>Not selected</option>
          {genres.map(genre => (
            <option
              key={genre.id}
              value={genre.id}
            >
              {genre.name}
            </option>
          ))}
        </select><br></br>

        <label>Year: </label>
        <input
          type="number"
          onChange={e => setSelectedYear(e.target.value)}
          id="year"
        /><br></br>
        <button type="submit" value="Submit">Submit</button>
      </form>

      {(movie) &&
        (
          <MovieCard
            key={movie.id}
            movie={movie}
          />
        )
      }
    </div>
  )
}

export default RandomMovie

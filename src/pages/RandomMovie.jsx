import { useState, useEffect } from 'react'
import axios from 'axios'
import MovieCard from '../components/MovieCard'
import './NowPlaying.css'

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

  //useEffect(() => {
  //    axios.get(`${apiUrl}/api/movies/random`)
  //        .then(response => {
  //            setMovies(response.data.results)
  //            setLoading(false)
  //        })
  //        .catch(error => {
  //            alert(error.response ? error.response.data : error)
  //            setLoading(false)
  //        })
  //}, [])

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
    <div>
      <h1>Random Movie</h1>

      <div>
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
          <input type="submit" value="Submit"/>
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
    </div>
  )
}

export default RandomMovie

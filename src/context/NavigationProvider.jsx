import { useState } from 'react'
import { NavigationContext } from './NavigationContext'

export default function NavigationProvider({ children }) {
    const [page, setPage] = useState('main')
    const [movieId, setMovieId] = useState(null)
    const [previousPage, setPreviousPage] = useState('main')

    const openMovie = (id, from) => {
        setMovieId(id)
        setPreviousPage(from)
        setPage('movieDetails')
    }

    const goBack = () => {
        setPage(previousPage)
    }

    return (
        <NavigationContext.Provider
            value={{
                page,
                setPage,
                movieId,
                openMovie,
                goBack
            }}
        >
            {children}
        </NavigationContext.Provider>
    )
}
import { useState } from 'react'
import { NavigationContext } from './NavigationContext'

export default function NavigationProvider({ children }) {
    const [page, setPage] = useState('main')
    const [contentId, setContentId] = useState(null)
    const [previousPage, setPreviousPage] = useState('main')
    const [contentType, setContentType] = useState('movie')

    const openMovie = (id, from, type) => {
        setContentId(id)
        setContentType(type)
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
                contentId,
                contentType,
                openMovie,
                goBack
            }}
        >
            {children}
        </NavigationContext.Provider>
    )
}
import { useState, useEffect } from "react";
import axios from "axios";

const Searchbar = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const fetchResults = async () => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        try {
            const response = await axios.get(
                "https://api.themoviedb.org/3/search/movie",
                {
                    params: {
                        query,
                        language: "en-US",
                        region: "FI",
                        api_key: "5214198df0ea28d6b63f1ad66940e38a"
                    },
                }
            );
            setResults(response.data.results || []);
        } catch (error) {
            console.error("Error getting search results:", error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchResults();
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchResults();
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    return (
        <div id="searchbar">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>
            <ul>
                {results.map((item, index) => (
                    <li key={item.id || index}>{item.title || item.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default Searchbar;

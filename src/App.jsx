import { useState, useEffect } from 'react'
import { useUser } from "./context/useUser" 
import axios from 'axios'
import './App.css'
import NowPlaying from './pages/NowPlaying'
import Searchbar from './searchBar/searchBar'
import { useNavigate } from "react-router-dom" 

// NOTE: This should probably be moved to its own file, if we decide to add more content into the main page.
function Main() {
  return <NowPlaying/>;
}

// Placeholder Groups component.
function Groups() {
  return <div>Groups content</div>;
}

// Placeholder Profile component.
function Profile() {
  return <div>Profile content.</div>;
}

function App() {
  const [page, setPage] = useState("main");
  const navigate = useNavigate() 
  const { user } = useUser() 

  const pages = {
    main: <Main/>,
    search: <Searchbar/>,
    groups: <Groups/>, // Replace this with the Groups component, when it is ready.
    profile: <Profile/> // Replace this with the Profile component, when it is ready.
  }

  const signin = () => { 
    navigate('/signin') 
  } 

  return (
    <div className="menu-container">
      <nav className="menu">
        <button onClick={() => setPage("main")}>
          Main
        </button>
        <button onClick={() => setPage("search")}>
          Search
        </button>
        <button onClick={() => setPage("groups")}>
          Groups
        </button>
        <button onClick={() => setPage("profile")}>
          Profile
        </button>
        {(!user || !user.token) &&
          (
            <button onClick={signin}>
              Signin
            </button>
          )}
      </nav>
      <main>
        {pages[page]}
      </main>
    </div>
  )
}

export default App
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Authentication, { AuthenticationMode } from './screens/Authentication' 
import ProtectedRoute from './components/ProtectedRoute' 
import UserProvider from './context/UserProvider.jsx' 
import NavigationProvider from './context/NavigationProvider.jsx'
import { RouterProvider } from 'react-router-dom' 
import { createBrowserRouter } from "react-router-dom"; 
import NotFound from "./screens/NotFound"; 
import MovieDetails from './pages/MovieDetails'
import CreateGroup from './pages/createGroup';
import GroupPage from './pages/groupPage';

const router = createBrowserRouter([ 
  { 
    errorElement: <NotFound /> 
  }, 
  { 
    path: "/signin", 
    element: <Authentication authenticationMode={AuthenticationMode.SignIn} /> 
  }, 
  {
    path: "/signup",
    element: <Authentication authenticationMode={AuthenticationMode.SignUp} />
  },
  {  
    children: [ 
      { 
        path: "/", 
        element: <App />, 
      },
      {
        path: "/movies/:id",
        element: <MovieDetails />,
      },
      {
        path: "/createGroup",
        element: <CreateGroup />,
      }, 
      {
        path: "/group/:id",
        element: <GroupPage />,
      } 
    ] 
  } 
]) 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <NavigationProvider>
        <RouterProvider router={router} /> 
      </NavigationProvider> 
    </UserProvider> 
  </StrictMode>,
)

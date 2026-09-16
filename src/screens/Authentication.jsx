import { Link,useNavigate } from "react-router-dom" 
import { useUser } from "../context/useUser" 
import './Authentication.css'
 
export const AuthenticationMode = Object.freeze({ 
  SignIn: 'Login', 
  SignUp: 'SignUp' 
}) 
 
export default function Authentication({authenticationMode}) { 
  const { user, setUser,signUp, signIn } = useUser() 

  if (user && user.token) {
    return (
      <h3>You are already signed in.</h3> 
    ) 
  }

  const navigate = useNavigate() 
 
  const handleSubmit = (e) => { 
    e.preventDefault() 
 
    const signFunction = authenticationMode === AuthenticationMode.SignUp ?  
      signUp : signIn 
    
    signFunction().then(response =>{ 
      navigate(authenticationMode === AuthenticationMode.SignUp ? '/signin' : '/') 
    }) 
    .catch(error => { 
      if (error.response?.data?.error?.message) {
        alert(error.response?.data?.error?.message);
      } else {
        alert(error);
      }
    }) 
  } 
 
  return ( 
    <div> 
      <h3>{authenticationMode === AuthenticationMode.SignIn ? 'Sign in' : 'Sign up'}</h3> 
      <form onSubmit={handleSubmit} className='login-form'> 
        {authenticationMode === AuthenticationMode.SignUp && (
          <>
            <label>Username</label>
            <input
              placeholder="Username"
              value={user.username || ""}
              onChange={e => setUser({...user,username: e.target.value})}  
            />
          </>
        )}
        <label>Email</label> 
        <input  
          placeholder='Email'  
          value={user.email}  
          onChange={e => setUser({...user,email: e.target.value}) 
        }/> 
        <label>Password</label> 
        <input  
          placeholder='Password'  
          type='password' value={user.password}  
          onChange={e => setUser({...user,password: e.target.value})} 
        /> 
        <Link to={authenticationMode === AuthenticationMode.SignIn ? '/signup' : '/signin'} onClick={() => setUser({username: '', email: '', password: ''})}> 
          {authenticationMode === AuthenticationMode.SignIn ? 'Sign up' : 'Already signed up? Sign in'} 
        </Link> 
        <button type='submit'>{authenticationMode === AuthenticationMode.SignIn ? 'Login' : 'Submit'}</button> 
      </form> 
    </div> 
  )
}

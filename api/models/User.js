import { pool } from './db.js'
import { compare, hash, } from 'bcrypt'

const getUserByEmail = async (email) => {
  const result = await pool.query( 
    'SELECT "userID", username, email, password FROM public.app_users WHERE email = $1', 
    [email], 
  ) 
  return result
}


const addNewUser = async (username, email, password) => {
  const hashedPassword = await hash(password, 10)
  const result = await pool.query(
    'INSERT INTO public.app_users (username, email, password) VALUES ($1, $2, $3)  RETURNING "userID", email',[username, email, hashedPassword],
  )
  return result
}

export { getUserByEmail, addNewUser }

import { pool } from './db.js'
import { compare, hash, } from 'bcrypt'

const getUserByEmail = async (email) => {
  const result = await pool.query( 
    'SELECT "userID", username, email, password FROM public.app_users WHERE email = $1', 
    [email], 
  ) 
  return result
}

const getUserById = async (userId) => {
  const result = await pool.query(
    'SELECT "userID", username, email FROM public.app_users WHERE "userID" = $1',
    [userId]
  )
  return result
}

const deleteUser = async (userId) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Delete user's favorites
    await client.query(
      'DELETE FROM favorites WHERE "userID" = $1',
      [userId]
    )

    // Delete user's reviews
    await client.query(
      'DELETE FROM reviews WHERE "userID" = $1',
      [userId]
    )

    // Delete user
    const result = await client.query(
      'DELETE FROM app_users WHERE "userID" = $1 RETURNING *',
      [userId]
    )

    await client.query('COMMIT')

    return result.rows[0]

  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}


const addNewUser = async (username, email, password) => {
  const hashedPassword = await hash(password, 10)
  const result = await pool.query(
    'INSERT INTO public.app_users (username, email, password) VALUES ($1, $2, $3)  RETURNING "userID", email',[username, email, hashedPassword],
  )
  return result
}

export { getUserByEmail, addNewUser, deleteUser, getUserById }

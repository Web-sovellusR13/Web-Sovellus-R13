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

    // Get groups owned by the user
    const ownedGroupsResult = await client.query(
      `SELECT "groupID"
       FROM public.groups
       WHERE "ownerID" = $1`,
      [userId]
    )

    const ownedGroupIds = ownedGroupsResult.rows.map(
      group => group.groupID
    )

    // Delete data belonging to groups owned by the user
    for (const groupId of ownedGroupIds) {

      // Delete join requests for the group
      await client.query(
        `DELETE FROM public.group_requests
         WHERE "groups_groupID" = $1`,
        [groupId]
      )

      // Delete members of the group
      await client.query(
        `DELETE FROM public.members
         WHERE "groups_groupID" = $1`,
        [groupId]
      )

      // Delete movies from the group
      await client.query(
        `DELETE FROM public.group_movies
         WHERE "groupID" = $1`,
        [groupId]
      )

      // Delete the group itself
      await client.query(
        `DELETE FROM public.groups
         WHERE "groupID" = $1`,
        [groupId]
      )
    }

    // Remove user from groups owned by other users
    await client.query(
      `DELETE FROM public.members
       WHERE "user_userID" = $1`,
      [userId]
    )

    // Delete user's join requests
    await client.query(
      `DELETE FROM public.group_requests
       WHERE "user_userID" = $1`,
      [userId]
    )

    // Delete user's favorites
    await client.query(
      `DELETE FROM public.favorites
       WHERE "userID" = $1`,
      [userId]
    )

    // Delete user's reviews
    await client.query(
      `DELETE FROM public.reviews
       WHERE "userID" = $1`,
      [userId]
    )

    // Finally delete the user
    const result = await client.query(
      `DELETE FROM public.app_users
       WHERE "userID" = $1
       RETURNING *`,
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

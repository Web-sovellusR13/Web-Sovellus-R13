import { pool } from '../models/db.js'

export const addMember = async (req, res, next) => {
  const { id: groupID } = req.params
  const { username, requesterID } = req.body

  if (!username || !requesterID) {
    return res.status(400).json({ error: 'Username and requesterID are required' })
  }

  try {
    const groupCheck = await pool.query(
      `SELECT "ownerID" FROM public.groups WHERE "groupID" = $1`,
      [groupID]
    )

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }

    if (groupCheck.rows[0].ownerID !== parseInt(requesterID)) {
      return res.status(403).json({ error: 'Only group owner can add members directly' })
    }

    const userCheck = await pool.query(
      `SELECT "userID" FROM public.app_users WHERE username = $1`,
      [username]
    )

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const targetUserID = userCheck.rows[0].userID

    await pool.query(
      `
      INSERT INTO public.members ("user_userID", "groups_groupID")
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [targetUserID, groupID]
    )

    res.status(200).json({ message: `User ${username} added to the group` })
  } catch (error) {
    next(error)
  }
}
import { pool } from '../models/db.js'

export const getGroups = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        "groupID" AS "idGroup", 
        groupname AS "groupName", 
        "ownerID"
      FROM public.groups
    `)
    res.status(200).json(result.rows)
  } catch (error) {
    next(error)
  }
}
export const getGroupById = async (req, res, next) => {
  const { id } = req.params

  try {
    const groupResult = await pool.query(
      `
      SELECT 
        g."groupID" AS "idGroup", 
        g.groupname AS "groupName", 
        g."ownerID",
        u.username AS "ownerName"
      FROM public.groups g
      JOIN public.app_users u ON g."ownerID" = u."userID"
      WHERE g."groupID" = $1
      `,
      [id]
    )

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }

    const groupData = groupResult.rows[0]

    const membersResult = await pool.query(
      `
      SELECT 
        u."userID", 
        u.username 
      FROM public.members m
      JOIN public.app_users u ON m."user_userID" = u."userID"
      WHERE m."groups_groupID" = $1
      `,
      [id]
    )

    const moviesResult = await pool.query(
      `
      SELECT "movieID" 
      FROM public.group_movies 
      WHERE "groupID" = $1
      `,
      [id]
    )

    res.status(200).json({
      ...groupData,
      members: membersResult.rows,
      movies: moviesResult.rows.map(m => m.movieID)
    })
  } catch (error) {
    next(error)
  }
}
export const createGroup = async (req, res, next) => {
  const { groupName, ownerID } = req.body

  if (!groupName || !ownerID) {
    return res.status(400).json({ error: 'groupName and ownerID are required' })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO public.groups (groupname, "ownerID")
      VALUES ($1, $2)
      RETURNING "groupID" AS "idGroup", groupname AS "groupName", "ownerID"
      `,
      [groupName, ownerID]
    )

    const newGroupId = result.rows[0].idGroup

    await pool.query(
      `
      INSERT INTO public.members ("user_userID", "groups_groupID")
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [ownerID, newGroupId]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Group name already taken' })
    }
    next(error)
  }
}
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
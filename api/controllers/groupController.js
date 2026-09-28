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
    const result = await pool.query(
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

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }

    res.status(200).json(result.rows[0])
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

    await pool.query(
      `
      INSERT INTO public.members ("user_userID", "groups_groupID")
      VALUES ($1, $2)
      `,
      [ownerID, result.rows[0].idGroup]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Group name already taken' })
    }
    next(error)
  }
}
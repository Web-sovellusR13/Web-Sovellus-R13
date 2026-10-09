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

export const removeMemberFromGroup = async (req, res, next) => {
  const { id: groupID, memberId } = req.params
  const { requesterID } = req.body

  if (!requesterID) {
    return res.status(400).json({ error: 'requesterID is required' })
  }

  try {
    const groupCheck = await pool.query(
      `SELECT "ownerID" FROM public.groups WHERE "groupID" = $1`,
      [groupID]
    )

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }

    const ownerID = groupCheck.rows[0].ownerID

    if (ownerID !== parseInt(requesterID) && parseInt(memberId) !== parseInt(requesterID)) {
      return res.status(403).json({ error: 'Unauthorized to remove this member' })
    }

    if (parseInt(memberId) === ownerID) {
      return res.status(400).json({ error: 'Group owner cannot be removed from the group' })
    }

    const deleteResult = await pool.query(
      `
      DELETE FROM public.members 
      WHERE "groups_groupID" = $1 AND "user_userID" = $2
      RETURNING *
      `,
      [groupID, memberId]
    )

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found in this group' })
    }

    res.status(200).json({ message: 'Member removed successfully' })
  } catch (error) {
    next(error)
  }
}

export const requestToJoinGroup = async (req, res, next) => {
  const { id: groupID } = req.params
  const { userID } = req.body

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    await pool.query(
      `
      INSERT INTO public.group_requests ("user_userID", "groups_groupID", status)
      VALUES ($1, $2, 'pending')
      ON CONFLICT DO NOTHING
      `,
      [userID, groupID]
    )

    res.status(200).json({ message: 'Join request sent successfully' })
  } catch (error) {
    next(error)
  }
}

export const getPendingRequests = async (req, res, next) => {
  const { id: groupID } = req.params

  try {
    const result = await pool.query(
      `
      SELECT 
        r.id AS "requestId",
        u."userID",
        u.username
      FROM public.group_requests r
      JOIN public.app_users u ON r."user_userID" = u."userID"
      WHERE r."groups_groupID" = $1 AND r.status = 'pending'
      `,
      [groupID]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    next(error)
  }
}

export const respondToJoinRequest = async (req, res, next) => {
  const { id: groupID, requestId } = req.params
  const { action, requesterID } = req.body

  if (!action || !requesterID) {
    return res.status(400).json({ error: 'Action and requesterID are required' })
  }

  try {
    const groupCheck = await pool.query(
      `SELECT "ownerID" FROM public.groups WHERE "groupID" = $1`,
      [groupID]
    )

    if (groupCheck.rows.length === 0 || groupCheck.rows[0].ownerID !== parseInt(requesterID)) {
      return res.status(403).json({ error: 'Only group owner can respond to requests' })
    }

    const requestQuery = await pool.query(
      `SELECT "user_userID" FROM public.group_requests WHERE id = $1`,
      [requestId]
    )

    if (requestQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' })
    }

    const targetUserID = requestQuery.rows[0].user_userID

    if (action === 'approve') {
      await pool.query(
        `
        INSERT INTO public.members ("user_userID", "groups_groupID")
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        `,
        [targetUserID, groupID]
      )

      await pool.query(
        `UPDATE public.group_requests SET status = 'approved' WHERE id = $1`,
        [requestId]
      )
    } else {
      await pool.query(
        `UPDATE public.group_requests SET status = 'rejected' WHERE id = $1`,
        [requestId]
      )
    }

    res.status(200).json({ message: `Request ${action}d successfully` })
  } catch (error) {
    next(error)
  }
}
import { pool } from './db.js'

const selectAllGroups = async () => {
    const result = await pool.query(
        `SELECT 
            "groupID" AS "idGroup",
            groupname AS "groupName",
            "ownerID"
        FROM public.groups`
    )
    return result.rows
}

const selectGroupById = async (groupID) => {
    const result = await pool.query(
        `SELECT
            g."groupID" AS "idGroup",
            g.groupname AS "groupName",
            g."ownerID",
            u.username AS "ownerName"
        FROM public.groups g
        JOIN public.app_users u
            ON g."ownerID" = u."userID"
        WHERE g."groupID" = $1`,
        [groupID]
    )
    return result.rows[0]
}

const selectGroupMembers = async (groupID) => {
    const result = await pool.query(
        `SELECT
            u."userID",
            u.username
        FROM public.members m
        JOIN public.app_users u
            ON m."user_userID" = u."userID"
        WHERE m."groups_groupID" = $1`,
        [groupID]
    )
    return result.rows
}

const selectGroupMovies = async (groupID) => {
    const result = await pool.query(
        `SELECT "movieID"
        FROM public.group_movies
        WHERE "groupID" = $1`,
        [groupID]
    )
    return result.rows
}

const insertGroup = async (groupName, ownerID) => {
    const result = await pool.query(
        `INSERT INTO public.groups (groupname, "ownerID")
        VALUES ($1, $2)
        RETURNING
            "groupID" AS "idGroup",
            groupname AS "groupName",
            "ownerID"`,
        [groupName, ownerID]
    )
    return result.rows[0]
}

const insertMember = async (userID, groupID) => {
    const result = await pool.query(
        `INSERT INTO public.members ("user_userID", "groups_groupID")
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *`,
        [userID, groupID]
    )
    return result.rows[0]
}

const selectGroupOwner = async (groupID) => {
    const result = await pool.query(
        `SELECT "ownerID"
        FROM public.groups
        WHERE "groupID" = $1`,
        [groupID]
    )
    return result.rows[0]
}

const selectUserByUsername = async (username) => {
    const result = await pool.query(
        `SELECT "userID", username
        FROM public.app_users
        WHERE username = $1`,
        [username]
    )
    return result.rows[0]
}

const removeMember = async (groupID, userID) => {
    const result = await pool.query(
        `DELETE FROM public.members
        WHERE "groups_groupID" = $1
        AND "user_userID" = $2
        RETURNING *`,
        [groupID, userID]
    )
    return result.rows[0]
}

const selectGroupsByUser = async (userID) => {
    const result = await pool.query(
        `SELECT
            groups."groupID" AS "idGroup",
            groups.groupname AS "groupName"
        FROM public.groups
        JOIN public.members
            ON groups."groupID" = members."groups_groupID"
        WHERE members."user_userID" = $1`,
        [userID]
    )
    return result.rows
}

const selectGroupMember = async (groupID, userID) => {
    const result = await pool.query(
        `SELECT *
        FROM public.members
        WHERE "groups_groupID" = $1
        AND "user_userID" = $2`,
        [groupID, userID]
    )
    return result.rows[0]
}

const insertMovieToGroup = async (groupID, movieID) => {
    const result = await pool.query(
        `INSERT INTO public.group_movies ("groupID", "movieID")
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *`,
        [groupID, movieID]
    )
    return result.rows[0]
}

const insertGroupRequest = async (userID, groupID) => {
    const result = await pool.query(
        `INSERT INTO public.group_requests ("user_userID", "groups_groupID", status)
        VALUES ($1, $2, 'pending')
        ON CONFLICT DO NOTHING
        RETURNING *`,
        [userID, groupID]
    )
    return result.rows[0]
}

const selectPendingRequests = async (groupID) => {
    const result = await pool.query(
        `SELECT
            r.id AS "requestId",
            u."userID",
            u.username
        FROM public.group_requests r
        JOIN public.app_users u ON r."user_userID" = u."userID"
        WHERE r."groups_groupID" = $1
          AND r.status = 'pending'`,
        [groupID]
    )
    return result.rows
}

const selectUserByRequest = async (requestId) => {
    const result = await pool.query(
        `SELECT "user_userID"
        FROM public.group_requests 
        WHERE id = $1`, 
        [requestId] 
    ) 
    return result.rows[0] 
} 

const updateRequestStatus = async (requestId, status) => {
     const result = await pool.query(
        `UPDATE public.group_requests 
        SET status = $1 
        WHERE id = $2 
        RETURNING *`,
        [status, requestId]
    ) 
    return result.rows[0] 
}

export {
    selectAllGroups,
    selectGroupById,
    selectGroupMembers,
    selectGroupMovies,
    insertGroup,
    insertMember,
    selectGroupOwner,
    selectUserByUsername,
    removeMember,
    selectGroupsByUser,
    selectGroupMember,
    insertMovieToGroup,
    insertGroupRequest,
    selectPendingRequests,
    selectUserByRequest,
    updateRequestStatus
}
import { pool } from './db.js'

const selectAllGroups = async () => {
    const result = await pool.query(`
        SELECT 
            "groupID" AS "idGroup",
            groupname AS "groupName",
            "ownerID"
        FROM public.groups
    `)

    return result.rows
}

const selectGroupById = async (groupID) => {
    const result = await pool.query(
        `
        SELECT
            g."groupID" AS "idGroup",
            g.groupname AS "groupName",
            g."ownerID",
            u.username AS "ownerName"
        FROM public.groups g
        JOIN public.app_users u
            ON g."ownerID" = u."userID"
        WHERE g."groupID" = $1
        `,
        [groupID]
    )

    return result.rows[0]
}

const selectGroupMembers = async (groupID) => {
    const result = await pool.query(
        `
        SELECT
            u."userID",
            u.username
        FROM public.members m
        JOIN public.app_users u
            ON m."user_userID" = u."userID"
        WHERE m."groups_groupID" = $1
        `,
        [groupID]
    )

    return result.rows
}

const selectGroupMovies = async (groupID) => {
    const result = await pool.query(
        `
        SELECT "movieID"
        FROM public.group_movies
        WHERE "groupID" = $1
        `,
        [groupID]
    )

    return result.rows
}

const insertGroup = async (groupName, ownerID) => {
    const result = await pool.query(
        `
        INSERT INTO public.groups (groupname, "ownerID")
        VALUES ($1, $2)
        RETURNING
            "groupID" AS "idGroup",
            groupname AS "groupName",
            "ownerID"
        `,
        [groupName, ownerID]
    )

    return result.rows[0]
}

const insertMember = async (userID, groupID) => {
    const result = await pool.query(
        `
        INSERT INTO public.members ("user_userID", "groups_groupID")
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *
        `,
        [userID, groupID]
    )

    return result.rows[0]
}

const selectGroupOwner = async (groupID) => {
    const result = await pool.query(
        `
        SELECT "ownerID"
        FROM public.groups
        WHERE "groupID" = $1
        `,
        [groupID]
    )

    return result.rows[0]
}

const selectUserByUsername = async (username) => {
    const result = await pool.query(
        `
        SELECT "userID", username
        FROM public.app_users
        WHERE username = $1
        `,
        [username]
    )

    return result.rows[0]
}

const removeMember = async (groupID, userID) => {
    const result = await pool.query(
        `
        DELETE FROM public.members
        WHERE "groups_groupID" = $1
        AND "user_userID" = $2
        RETURNING *
        `,
        [groupID, userID]
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
    removeMember
}
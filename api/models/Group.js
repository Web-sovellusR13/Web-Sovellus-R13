import { pool } from './db.js'

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

export {removeMember}
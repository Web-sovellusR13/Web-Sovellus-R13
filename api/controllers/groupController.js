import {
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
    insertMovieToGroup
} from '../models/Group.js'
import { ApiError } from '../helper/ApiError.js'

export const getGroups = async (req, res, next) => {
    try {
        const groups = await selectAllGroups()

        return res.status(200).json(groups)
    } catch (error) {
        next(error)
    }
}

export const getGroupById = async (req, res, next) => {
    const { id } = req.params

    try {
        const group = await selectGroupById(id)

        if (!group) {
            return res.status(404).json({
                error: 'Group not found'
            })
        }

        const members = await selectGroupMembers(id)
        const movies = await selectGroupMovies(id)

        return res.status(200).json({
            ...group,
            members,
            movies: movies.map(movie => movie.movieID)
        })

    } catch (error) {
        next(error)
    }
}

export const createGroup = async (req, res, next) => {
    const { groupName, ownerID } = req.body

    if (!groupName || !ownerID) {
        return res.status(400).json({
            error: 'groupName and ownerID are required'
        })
    }

    try {
        const newGroup = await insertGroup(groupName, ownerID)

        await insertMember(ownerID, newGroup.idGroup)

        return res.status(201).json(newGroup)

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({
                error: 'Group name already taken'
            })
        }

        next(error)
    }
}

export const addMember = async (req, res, next) => {
    const { id: groupID } = req.params
    const { username, requesterID } = req.body

    if (!username || !requesterID) {
        return res.status(400).json({
            error: 'Username and requesterID are required'
        })
    }

    try {
        const group = await selectGroupOwner(groupID)

        if (!group) {
            return res.status(404).json({
                error: 'Group not found'
            })
        }

        if (group.ownerID !== Number(requesterID)) {
            return res.status(403).json({
                error: 'Only group owner can add members directly'
            })
        }

        const user = await selectUserByUsername(username)

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            })
        }

        await insertMember(user.userID, groupID)

        return res.status(200).json({
            message: `User ${username} added to the group`
        })

    } catch (error) {
        next(error)
    }
}

export const removeMemberFromGroup = async (req, res, next) => {
    const { id: groupID } = req.params
    const { userID } = req.params

    try {
        const result = await removeMember(groupID, userID)

        if (!result) {
            return res.status(404).json({
                error: 'Member not found in this group'
            })
        }

        return res.status(200).json({
            message: 'Member removed from group'
        })
    } catch (error) {
        next(error)
    }
}

export const getMyGroups = async (req, res, next) => {
    try {
        console.log('User from token:', req.user)
        const userID = req.user.userId

        const groups = await selectGroupsByUser(userID)
        return res.status(200).json(groups)
    } catch (error) {
        next(error)
    }
}

export const addMovieToGroup = async (req, res, next) => {
    const { id: groupID } = req.params
    const { movieID } = req.body
    const userID = req.user.userId

    if (!movieID) {
        throw new ApiError('Movie ID is required', 400)
    }

    try{
        const member = await selectGroupMember(groupID, userID)

        if (!member) {
            throw new ApiError('You are not a member of this group', 403)
        }

        const result = await insertMovieToGroup(groupID, movieID)
        if (!result) {
            return res.status(200).json({
                message: 'Movie is already in this group'
            })
        }
        return res.status(201).json({
            message: 'Movie added to group successfully'
        })
    } catch (error) {
        next(error)
    }
}
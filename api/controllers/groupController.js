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
    insertMovieToGroup,
    insertGroupRequest,
    selectPendingRequests,
    selectUserByRequest,
    updateRequestStatus
} from '../models/Group.js'
import { ApiError } from '../helper/ApiError.js'

export const getGroups = async (req, res, next) => {
  try {
    const result = await selectAllGroups()
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const getGroupById = async (req, res, next) => {
  const groupID = req.params.id

  try {
    const groupResult = await selectGroupById(groupID)

    if (!groupResult) {
      return res.status(404).json({ error: 'Group not found' })
    }

    const membersResult = await selectGroupMembers(groupID)
    const moviesResult = await selectGroupMovies(groupID)

    res.status(200).json({
      ...groupResult,
      members: membersResult,
      movies: moviesResult.map(m => m.movieID)
    })
  } catch (error) {
    next(error)
  }
}

export const createGroup = async (req, res, next) => {
  const { groupName } = req.body
  const ownerID = req.user?.userId

  if (!groupName || !ownerID) {
    return res.status(400).json({ error: 'groupName and ownerID are required' })
  }

  try {
    const result = await insertGroup(groupName, ownerID)
    await insertMember(ownerID, result.idGroup )
    res.status(201).json(result)
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Group name already taken' })
    }
    next(error)
  }
}

export const addMember = async (req, res, next) => {
  const groupID = req.params.id
  const { username, requesterID } = req.body

  if (!username || !requesterID) {
    return res.status(400).json({ error: 'Username and requesterID are required' })
  }

  try {
    const groupResult = await selectGroupOwner(groupID)

    if (!groupResult) {
      return res.status(404).json({ error: 'Group not found' })
    }

    if (Number(groupResult.ownerID !== Number(requesterID))) {
      return res.status(403).json({ error: 'Only group owner can add members directly' })
    }

    const userResult = await selectUserByUsername(username)

    if (!userResult) {
      return res.status(404).json({ error: 'User not found' })
    }

    await insertMember(userResult.userID, groupID)
    res.status(200).json({ message: `User ${username} added to the group` })
  } catch (error) {
    next(error)
  }
}

export const removeMemberFromGroup = async (req, res, next) => {
    const groupID = req.params.id
    const memberId = req.params.memberId
    const { requesterID } = req.body

  if (!requesterID) {
    return res.status(400).json({ error: 'requesterID is required' })
  }

  try {
    const groupResult = await selectGroupOwner(groupID)

    if (!groupResult) {
      return res.status(404).json({ error: 'Group not found' })
    }

    const ownerID = Number(groupResult.ownerID)
    const requester = Number(requesterID)
    const member = Number(memberId)

    if (ownerID !== requester && member !== requester) {
      return res.status(403).json({ error: 'Unauthorized to remove this member' })
    }

    if (member === ownerID) {
      return res.status(400).json({ error: 'Group owner cannot be removed from the group' })
    }

    const deleteResult = await removeMember(groupID, memberId)

    if (!deleteResult) {
      return res.status(404).json({ error: 'Member not found in this group' })
    }

    res.status(200).json({ message: 'Member removed successfully' })
  } catch (error) {
    next(error)
  }
}

export const leaveGroup = async (req, res, next) => {
    const groupID = req.params.id
    const userID = req.user.userId

    try {
        const groupResult = await selectGroupOwner(groupID)

        if (!groupResult) {
            return res.status(404).json({
                error: 'Group not found'
            })
        }

        if (Number(groupResult.ownerID) === Number(userID)) {
            return res.status(400).json({
                error: 'Group owner cannot leave the group'
            })
        }

        const deleteResult = await removeMember(groupID, userID)

        if (!deleteResult) {
            return res.status(404).json({
                error: 'You are not a member of this group'
            })
        }

        return res.status(200).json({
            message: 'You have left the group'
        })

    } catch (error) {
        next(error)
    }
}

export const requestToJoinGroup = async (req, res, next) => {
  const groupID = req.params.id
  const { userID } = req.body

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    await insertGroupRequest(userID, groupID)
    res.status(200).json({ message: 'Join request sent successfully' })
  } catch (error) {
    next(error)
  }
}

export const getPendingRequests = async (req, res, next) => {
  const groupID = req.params.id

  try {
    const result = await selectPendingRequests(groupID)
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
    const groupResult = await selectGroupOwner(groupID)

    if (Number(groupResult.ownerID) !== Number(requesterID)) {
      return res.status(403).json({ error: 'Only group owner can respond to requests' })
    }

    const requestResult = await selectUserByRequest(requestId)

    if (!requestResult) {
      return res.status(404).json({ error: 'Request not found' })
    }

    if (action === 'approve') {
      await insertMember(requestResult.user_userID, groupID)
      await updateRequestStatus(requestId, 'approved')
    } else {
      await updateRequestStatus(requestId, 'rejected')
    }

    res.status(200).json({ message: `Request ${action}d successfully` })
  } catch (error) {
    next(error)
  }
}

export const getMyGroups = async (req, res, next) => {
    try {
        const userID = req.user.userId

        const result = await selectGroupsByUser(userID)
        return res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

export const addMovieToGroup = async (req, res, next) => {
    const groupID = req.params.id
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
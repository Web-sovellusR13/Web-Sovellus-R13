import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useUser } from '../context/useUser'

const apiUrl = import.meta.env.VITE_API_URL

function CreateGroup() {
    const [groupName, setGroupName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { user } = useUser()

    const handleNameChange = (e) => {
        setGroupName(e.target.value)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        const currentOwnerID = user?.userID || user?.id || 1

        if (!groupName.trim()) {
            setError('Group name cannot be empty')
            return
        }

        setLoading(true)

        axios.post(`${apiUrl}/api/groups`, { 
            groupName: groupName.trim(),
            ownerID: currentOwnerID
        })
        .then(response => {
            const groupId = response.data.idGroup
            console.log('Group created successfully:', response.data)
            navigate(`/group/${groupId}`)
        })
        .catch(error => {
            console.error('Error creating group:', error)
            const msg = error.response?.data?.error 
                     || error.response?.data?.message 
                     || error.message 
                     || 'Failed to create group'
            setError(msg)
        })
        .finally(() => {
            setLoading(false)
        })
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Create a Group</h2>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <p>Please enter your group name:</p>
                <input
                    type='text'
                    placeholder='Type here...'
                    value={groupName}
                    onChange={handleNameChange}
                    disabled={loading}
                    required
                />
                <br /><br />
                <button type='submit' disabled={loading}>
                    {loading ? 'Creating...' : 'Create Group'}
                </button>
            </form>
        </div>
    )
}

export default CreateGroup
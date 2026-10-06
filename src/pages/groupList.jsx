import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './groupList.css'

const apiUrl = import.meta.env.VITE_API_URL

function GroupList() {
    const [groups, setGroups] = useState([])

    useEffect(() => {
        axios.get(`${apiUrl}/api/groups`)
            .then(response => {
                setGroups(response.data)
            })
            .catch(error => {
                console.error('Error fetching groups:', error)
                const msg = error.response?.data?.error 
                         || error.response?.data?.message 
                         || error.message 
                         || 'Failed to load groups'
                alert(typeof msg === 'object' ? JSON.stringify(msg) : msg)
            })
    }, [])

    return (
        <div className='groupList'>
            <div className='myHeader'>
                <Link to='/createGroup'>Create a group</Link>
                <h1>Your groups</h1>
                <div className='groupContainer'>
                    {groups.map(group => (
                        <div key={group.idGroup} className='groupItem'>
                            <h2>{group.groupName}</h2>
                            <Link to={`/group/${group.idGroup}`}>Open Group</Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GroupList
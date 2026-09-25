import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './GroupList.css'
import Header from "../components/Header.js"

const apiUrl = import.meta.env.VITE_API_URL

function GroupList() {
    const [groups, setGroups] = useState([])

    useEffect(() => {
        axios.get(`${apiUrl}/getGroups`)
            .then(response => {
                setGroups(response.data)
            })
            .catch(error => {
                console.error('Error fetching groups:', error)
                alert(error.response?.data?.error || error.message || 'Failed to load groups')
            })
    }, [])

    return (
        <div className='groupList'>
            <Header />

            <div className='myHeader'>
                <Link to='/createGroup'>Create a group</Link>
                <h1>Your groups</h1>
                <div className='groupContainer'>
                    {groups.map(group => (
                        <div key={group.idGroup} className='groupItem'>
                            <img src={group.groupImage} alt={`${group.groupName} icon`} />
                            <h2>{group.groupName}</h2>
                            <p>{group.groupDescription}</p>
                            <Link to={`/group/${group.idGroup}`}>Join group chat</Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GroupList
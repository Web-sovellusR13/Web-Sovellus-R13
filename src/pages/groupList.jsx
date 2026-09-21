import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './GroupList.css'
import Header from "../components/Header.js"


function GroupList() {
    const [groups, setGroups] = useState([])

    useEffect(() => {
        //const currentGroups = getGroups()
        //setGroups(currentGroups)

        axios.get(url + '/getGroups')
        .then(response => {
            setGroups(response.data)
        }).catch(error => {
            alert(error.response.data.error ? error.response.data.error : error)
        })
    }, []);

    return (
        <div className='groupList'>
            <Header />

            <div className='myHeader'>
                <a href='/createGroup'>Create a group</a>
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
    );
}

export default GroupList;
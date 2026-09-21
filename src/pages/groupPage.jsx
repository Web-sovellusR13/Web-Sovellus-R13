import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from "../components/Header.js";
import axios from 'axios';
import '../styles/Group.css';

function Group() {


    const { groupId } = useParams()
    const [group, setGroup] = useState({})

    const [messages, setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState('')
    const [username, setUsername] = useState('testUser')
    const [image, setImage] = useState(templateImage)
    const [groupName, setGroupName] = useState('My group')

    useEffect(() => {
        axios.get(url + `/${groupId}`)
        .then(response => {
            console.log('Group data:', response.data)
            const groupData = response.data
            setGroup(groupData)
            setImage(groupData.groupImage)
            setGroupName(groupData.groupName)
        })
        .catch(error => {
            console.error('Error fetching group data:', error)
        })
    }, [groupId])

    useEffect(() => {
        axios.get(url + `/${groupId}/messages`)
        .then(response => {
            setMessages(response.data)
        })
        .catch(error => {
            console.error('Error fetching messages:', error)
        })
    }, [groupId])


    const handleInputChange = (e) => {
        setCurrentMessage(e.target.value)
    }

    // Create a new message object on submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentMessage.trim() !== '') {
            const newMessage = {
                username: username,
                text: currentMessage
            }

        axios.post(url + `/${groupId}/message`, newMessage)
            .then(response => {
                setMessages([...messages, response.data])
                setCurrentMessage('')
            })
            .catch(error => {
                console.error('Error saving message:', error)
            })
        }
    }

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(URL.createObjectURL(e.target.files[0]))
        }
    }

    const handleNameChange = (e) => {
        setGroupName(e.target.value)
    }

    const handleNameSubmit = (e) => {
        e.preventDefault();
        // Change the name on the database later on
    }

    return (
        <div className='groupPage'>
            <Header />
            <h1>{groupName}</h1>
            <div className='mainContainer'>
                <figure>
                    <img src={image} />
                </figure>
                <div className='chatBoxContainer'>


                    <div className='messageContainer'>
                        {messages.map((msg, index) => (
                            <div key={index} className='message'>
                                {msg.username}: {msg.text}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <input type='text'
                            placeholder='Type a message...'
                            className='chatBoxInput'
                            value={currentMessage}
                            onChange={handleInputChange} />
                        <button type='submit' className='sendButton'>Send</button>
                    </form>
                </div>

                <div className='userList'>
                <p>Users:</p>
                <ul>
                <p>User1</p>
                <p>User2</p>
                </ul>
            </div>

            </div>
            
            <div className='uploadContainer'>
                <p>Change group icon:</p>
                <input type="file" onChange={handleImageChange} />
                <p>Change group name:</p>
                <form onSubmit={handleNameSubmit}>
                    <input type='text' value={groupName} onChange={handleNameChange} />
                    <button type='submit' className='sendButton'>Change name</button>
                    </form>
            </div>

        </div>
    );
};

export default Group;
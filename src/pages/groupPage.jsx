import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import './group.css';

const apiUrl = import.meta.env.VITE_API_URL;

function Group() {
    const { groupId } = useParams();
    const [group, setGroup] = useState({});

    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [username, setUsername] = useState('testUser');
    const [image, setImage] = useState('');
    const [groupName, setGroupName] = useState('My group');

    useEffect(() => {
        axios.get(`${apiUrl}/group/${groupId}`)
            .then(response => {
                console.log('Group data:', response.data);
                const groupData = response.data;
                setGroup(groupData);
                setImage(groupData.groupImage || '');
                setGroupName(groupData.groupName || 'My group');
            })
            .catch(error => {
                console.error('Error fetching group data:', error);
            });
    }, [groupId]);

    useEffect(() => {
        axios.get(`${apiUrl}/group/${groupId}/messages`)
            .then(response => {
                setMessages(response.data);
            })
            .catch(error => {
                console.error('Error fetching messages:', error);
            });
    }, [groupId]);

    const handleInputChange = (e) => {
        setCurrentMessage(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentMessage.trim() !== '') {
            const newMessage = {
                username: username,
                text: currentMessage
            };

            axios.post(`${apiUrl}/group/${groupId}/message`, newMessage)
                .then(response => {
                    setMessages(prevMessages => [...prevMessages, response.data]);
                    setCurrentMessage('');
                })
                .catch(error => {
                    console.error('Error saving message:', error);
                });
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleNameChange = (e) => {
        setGroupName(e.target.value);
    };

    const handleNameSubmit = (e) => {
        e.preventDefault();
        // TODO: Päivitä ryhmän nimi tietokantaan
    };

    return (
        <div className='groupPage'>
            <Header />
            <h1>{groupName}</h1>
            <div className='mainContainer'>
                <figure>
                    <img src={image} alt={`${groupName} logo`} />
                </figure>
                <div className='chatBoxContainer'>
                    <div className='messageContainer'>
                        {messages.map((msg, index) => (
                            <div key={msg.id || index} className='message'>
                                <strong>{msg.username}:</strong> {msg.text}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <input
                            type='text'
                            placeholder='Type a message...'
                            className='chatBoxInput'
                            value={currentMessage}
                            onChange={handleInputChange}
                        />
                        <button type='submit' className='sendButton'>Send</button>
                    </form>
                </div>

                <div className='userList'>
                    <p>Users:</p>
                    <ul>
                        <li>User1</li>
                        <li>User2</li>
                    </ul>
                </div>
            </div>

            <div className='uploadContainer'>
                <p>Change group icon:</p>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                <p>Change group name:</p>
                <form onSubmit={handleNameSubmit}>
                    <input type='text' value={groupName} onChange={handleNameChange} />
                    <button type='submit' className='sendButton'>Change name</button>
                </form>
            </div>
        </div>
    );
}

export default Group;
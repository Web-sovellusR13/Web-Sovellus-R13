import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/useUser';
import './createGroup.css'

const apiUrl = import.meta.env.VITE_API_URL;

const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error decoding token:', e);
        return null;
    }
};

function CreateGroup() {
    const [groupName, setGroupName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { user } = useUser();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const token = user?.token || sessionStorage.getItem('token') || localStorage.getItem('token');

        let currentUserId = user?.userID || user?.id || user?.userId;

        if (!currentUserId && token) {
            const decoded = decodeToken(token);
            currentUserId = decoded?.userId || decoded?.userID || decoded?.id;
        }

        console.log('Resolved currentUserId from Token:', currentUserId);

        if (!currentUserId) {
            setError('Login to create a group.');
            return;
        }

        if (!groupName.trim()) {
            setError('Groupname musnt be empty.');
            return;
        }

        setLoading(true);

        axios.post(
            `${apiUrl}/api/groups`, 
            { 
                groupName: groupName.trim(),
                ownerID: Number(currentUserId)
            },
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            }
        )
        .then(response => {
            const groupId = response.data?.idGroup || response.data?.groupID || response.data?.id;
            if (groupId) {
                navigate(`/group/${groupId}`);
            } else {
                setError('Group created but cant be found.');
            }
        })
        .catch(error => {
            console.error('Error creating group:', error);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Ryhmän luonti epäonnistui';
            setError(msg);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    return (
        <div className="createGroupContainer" style={{ padding: '20px' }}>
            <h2>Create a Group</h2>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <p>Group Name:</p>
                <input
                    type="text"
                    placeholder="Type group name..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    disabled={loading}
                    required
                />
                <br /><br />
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Group'}
                </button>
            </form>
        </div>
    );
}

export default CreateGroup;
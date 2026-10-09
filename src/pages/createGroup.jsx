import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/useUser';
import './createGroup.css'

const apiUrl = import.meta.env.VITE_API_URL;

function CreateGroup() {
    const [groupName, setGroupName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { user, token } = useUser();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const activeToken = token || user?.token;

        if (!activeToken) {
            setError('Please login to create a group.');
            return;
        }

        if (!groupName.trim()) {
            setError('Group name cannot be empty.');
            return;
        }

        setLoading(true);

        axios.post(
            `${apiUrl}/api/groups`, 
            { 
                groupName: groupName.trim()
            },
            {
                headers: { Authorization: `Bearer ${activeToken}` }
            }
        )
        .then(response => {
            const groupId = response.data?.idGroup || response.data?.groupID || response.data?.id;
            if (groupId) {
                navigate(`/group/${groupId}`);
            } else {
                setError('Group created, but could not retrieve group ID.');
            }
        })
        .catch(error => {
            console.error('Error creating group:', error);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to create group.';
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
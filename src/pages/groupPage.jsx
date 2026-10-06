import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/useUser';

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

function GroupDetail() {
    const { id } = useParams();
    const { user, token } = useUser();

    const [group, setGroup] = useState(null);
    const [newMemberName, setNewMemberName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const authToken = token || user?.token || sessionStorage.getItem('token');
    let currentUserId = user?.userID || user?.id || user?.userId;
    if (!currentUserId && authToken) {
        const decoded = decodeToken(authToken);
        currentUserId = decoded?.userId || decoded?.userID || decoded?.id;
    }
    const fetchGroupData = async () => {
        try {
            const config = {
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
            };

            const response = await axios.get(`${apiUrl}/api/groups/${id}`, config);
            setGroup(response.data);
        } catch (err) {
            console.error('Error fetching group details:', err);
            setError('Failed to fetch group details.');
        }
    };

    useEffect(() => {
        if (id) {
            fetchGroupData();
        }
    }, [id]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberName.trim()) return;

        if (!currentUserId) {
            setError('You must be logged in to add members.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const config = {
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
            };

            await axios.post(
                `${apiUrl}/api/groups/${id}/members`,
                {
                    username: newMemberName.trim(),
                    requesterID: Number(currentUserId)
                },
                config
            );

            await fetchGroupData();
            setNewMemberName('');
        } catch (err) {
            console.error('Error adding member:', err);
            const msg = err.response?.data?.error || 'Failed to add member.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberID) => {
    const confirmed = window.confirm(
        'Are you sure you want to remove this member from the group?'
    )

    if (!confirmed) {
        return
    }

    try {
        await axios.delete(
            `${apiUrl}/api/groups/${id}/members/${memberID}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
        )

        await fetchGroupData()
    } catch (error) {
        console.error('Error removing member:', error)

        setError(
            error.response?.data?.error?.message ||
            'Failed to remove member.'
        )
    }
}

    return (
        <div style={{ padding: '20px' }}>
            <h2>{group?.groupName || `Group #${id}`}</h2>
            {group?.ownerName && <p><strong>Owner:</strong> {group.ownerName}</p>}

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h3>Members</h3>
            {!group?.members || group.members.length === 0 ? (
                <p>No members in this group yet.</p>
            ) : (
                <ul>
                    {group.members.map((member) => (
                        <li key={member.userID}>
                            {member.username} 
                            {group.ownerID === member.userID ? '(Owner)' : ''}
                            {group.ownerID === currentUserId && 
                            member.userID !== group.ownerID && (
                                <button onClick={() => handleRemoveMember(member.userID)}>
                                    Remove
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <hr />

            <h3>Add Member to Group</h3>
            <form onSubmit={handleAddMember}>
                <input
                    type="text"
                    placeholder="Enter username..."
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Member'}
                </button>
            </form>
        </div>
    );
}

export default GroupDetail;
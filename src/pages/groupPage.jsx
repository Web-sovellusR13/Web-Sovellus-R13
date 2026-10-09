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
    const [pendingRequests, setPendingRequests] = useState([]);
    const [newMemberName, setNewMemberName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const jwtToken = token || user?.token;

    let currentUserId = user?.userID || user?.id || user?.userId;
    if (!currentUserId && jwtToken) {
        const decoded = decodeToken(jwtToken);
        currentUserId = decoded?.userId || decoded?.userID || decoded?.id;
    }

    const isOwner = group && Number(group.ownerID) === Number(currentUserId);
    const isMember = group?.members?.some((m) => Number(m.userID) === Number(currentUserId));

    const fetchGroupData = async () => {
        try {
            const config = {
                headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}
            };

            const response = await axios.get(`${apiUrl}/api/groups/${id}`, config);
            setGroup(response.data);

            if (response.data?.ownerID && Number(response.data.ownerID) === Number(currentUserId)) {
                const requestsRes = await axios.get(`${apiUrl}/api/groups/${id}/requests`, config);
                setPendingRequests(requestsRes.data);
            }
        } catch (err) {
            console.error('Error fetching group details:', err);
            setError('Failed to fetch group details.');
        }
    };

    useEffect(() => {
        if (id) {
            fetchGroupData();
        }
    }, [id, currentUserId, jwtToken]);

    const handleRequestJoin = async () => {
        if (!currentUserId) {
            setError('You must be logged in to request join access.');
            return;
        }

        setError('');
        setMessage('');

        try {
            const config = {
                headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}
            };

            await axios.post(
                `${apiUrl}/api/groups/${id}/request-join`,
                { userID: Number(currentUserId) },
                config
            );

            setMessage('Join request sent to group owner!');
        } catch (err) {
            console.error('Error sending join request:', err);
            setError(err.response?.data?.error || 'Failed to send join request.');
        }
    };

    const handleRespondRequest = async (requestId, action) => {
        setError('');
        setMessage('');

        try {
            const config = {
                headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}
            };

            await axios.post(
                `${apiUrl}/api/groups/${id}/requests/${requestId}`,
                {
                    action,
                    requesterID: Number(currentUserId)
                },
                config
            );

            setMessage(`Request ${action}d successfully.`);
            await fetchGroupData();
        } catch (err) {
            console.error('Error responding to request:', err);
            setError(err.response?.data?.error || 'Failed to update request status.');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberName.trim()) return;

        if (!currentUserId) {
            setError('You must be logged in to add members.');
            return;
        }

        setError('');
        setMessage('');
        setLoading(true);

        try {
            const config = {
                headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}
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
            setMessage('Member added successfully!');
        } catch (err) {
            console.error('Error adding member:', err);
            setError(err.response?.data?.error || 'Failed to add member.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>{group?.groupName || `Group #${id}`}</h2>
            {group?.ownerName && <p><strong>Owner:</strong> {group.ownerName}</p>}

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            {!isMember && !isOwner && currentUserId && (
                <div style={{ marginBottom: '20px' }}>
                    <button onClick={handleRequestJoin}>
                        Request to Join Group
                    </button>
                </div>
            )}

            <h3>Members</h3>
            {!group?.members || group.members.length === 0 ? (
                <p>No members in this group yet.</p>
            ) : (
                <ul>
                    {group.members.map((member) => (
                        <li key={member.userID}>
                            {member.username} {group.ownerID === member.userID ? '(Owner)' : ''}
                        </li>
                    ))}
                </ul>
            )}

            {isOwner && (
                <>
                    <hr />
                    <h3>Pending Join Requests</h3>
                    {pendingRequests.length === 0 ? (
                        <p>No pending join requests.</p>
                    ) : (
                        <ul>
                            {pendingRequests.map((req) => (
                                <li key={req.requestId} style={{ marginBottom: '8px' }}>
                                    {req.username}{' '}
                                    <button 
                                        onClick={() => handleRespondRequest(req.requestId, 'approve')}
                                        style={{ marginLeft: '10px', color: 'green' }}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handleRespondRequest(req.requestId, 'reject')}
                                        style={{ marginLeft: '5px', color: 'red' }}
                                    >
                                        Reject
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <hr />
                    <h3>Add Member Directly</h3>
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
                </>
            )}
        </div>
    );
}

export default GroupDetail;
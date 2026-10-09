import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/useUser';

const apiUrl = import.meta.env.VITE_API_URL;

function GroupDetail() {
    const { id } = useParams();
    const { user, token } = useUser();

    const [group, setGroup] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [newMemberName, setNewMemberName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const activeToken = token || user?.token;
    const currentUserId = user?.userID || user?.id || user?.userId;

    const isOwner = group && Number(group.ownerID) === Number(currentUserId);
    const isMember = group?.members?.some((m) => Number(m.userID) === Number(currentUserId));

    const fetchGroupData = async () => {
        try {
            const config = {
                headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {}
            };

            const response = await axios.get(`${apiUrl}/api/groups/${id}`, config);
            setGroup(response.data);

            if (response.data?.ownerID && Number(response.data.ownerID) === Number(currentUserId)) {
                const requestsRes = await axios.get(`${apiUrl}/api/groups/${id}/requests`, config);
                setPendingRequests(requestsRes.data);
            }
        } catch (err) {
            console.error('Error fetching group details:', err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to fetch group details.';
            setError(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg);
        }
    };

    useEffect(() => {
        if (id) {
            fetchGroupData();
        }
    }, [id, currentUserId, activeToken]);

    const handleRequestJoin = async () => {
        if (!activeToken) {
            setError('Please login to request join access.');
            return;
        }

        setError('');
        setMessage('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${activeToken}` }
            };

            await axios.post(
                `${apiUrl}/api/groups/${id}/request-join`,
                { userID: Number(currentUserId) },
                config
            );

            setMessage('Join request sent to group owner!');
        } catch (err) {
            console.error('Error sending join request:', err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to send join request.';
            setError(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg);
        }
    };

    const handleRespondRequest = async (requestId, action) => {
        setError('');
        setMessage('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${activeToken}` }
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
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to update request status.';
            setError(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg);
        }
    };

    const handleRemoveMember = async (memberId) => {
        setError('');
        setMessage('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${activeToken}` },
                data: { requesterID: Number(currentUserId) }
            };

            await axios.delete(`${apiUrl}/api/groups/${id}/members/${memberId}`, config);

            setMessage('Member removed successfully.');
            await fetchGroupData();
        } catch (err) {
            console.error('Error removing member:', err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to remove member.';
            setError(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberName.trim()) return;

        if (!activeToken) {
            setError('Please login to add members.');
            return;
        }

        setError('');
        setMessage('');
        setLoading(true);

        try {
            const config = {
                headers: { Authorization: `Bearer ${activeToken}` }
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
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to add member.';
            setError(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>{group?.groupName || `Group #${id}`}</h2>
            {group?.ownerName && <p><strong>Owner:</strong> {group.ownerName}</p>}

            {error && (
                <p style={{ color: 'red' }}>
                    {typeof error === 'object' ? JSON.stringify(error) : error}
                </p>
            )}
            {message && (
                <p style={{ color: 'green' }}>
                    {typeof message === 'object' ? JSON.stringify(message) : message}
                </p>
            )}

            {!isMember && !isOwner && activeToken && (
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
                        <li key={member.userID} style={{ marginBottom: '6px' }}>
                            {member.username} {group.ownerID === member.userID ? '(Owner)' : ''}
                            
                            {isOwner && member.userID !== group.ownerID && (
                                <button
                                    onClick={() => handleRemoveMember(member.userID)}
                                    style={{ marginLeft: '10px', color: 'red' }}
                                >
                                    Remove
                                </button>
                            )}
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
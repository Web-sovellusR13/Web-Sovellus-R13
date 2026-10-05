import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/useUser";
import "./group.css";

const apiUrl = import.meta.env.VITE_API_URL;

function GroupPage() {
    const { id } = useParams();
    const { user } = useUser();
    
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newMemberUsername, setNewMemberUsername] = useState("");
    const [addMemberMsg, setAddMemberMsg] = useState("");

    const fetchGroupData = () => {
        axios.get(`${apiUrl}/api/groups/${id}`)
            .then(response => {
                setGroup(response.data);
            })
            .catch(err => {
                const apiError = err.response?.data;
                setError(typeof apiError === 'object' ? apiError.message : (err.message || "Failed to fetch group"));
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        setAddMemberMsg("");

        const currentUserId = user?.userID || user?.id;

        try {
            const res = await axios.post(`${apiUrl}/api/groups/${id}/members`, {
                username: newMemberUsername.trim(),
                requesterID: currentUserId
            });
            setAddMemberMsg(res.data.message);
            setNewMemberUsername("");
            fetchGroupData();
        } catch (err) {
            setAddMemberMsg(err.response?.data?.error || "Failed to add member");
        }
    };

    if (loading) return <div className="groupPageContainer">Loading...</div>;
    if (error) return <div className="groupPageContainer" style={{ color: "red" }}>{String(error)}</div>;
    if (!group) return <div className="groupPageContainer">No group found.</div>;

    const currentUserId = user?.userID || user?.id;
    const isOwner = currentUserId && Number(currentUserId) === Number(group.ownerID);

    return (
        <div className="groupPageContainer">
            <h1>{group.groupName}</h1>
            <p><strong>Owner:</strong> {group.ownerName}</p>

            <div className="groupSection">
                <h3>Members</h3>
                <ul>
                    {group.members?.map((member, index) => (
                        <li key={member.userID || index}>
                            {member.username || member}
                        </li>
                    ))}
                </ul>
            </div>

            {isOwner && (
                <div className="groupSection ownerPanel" style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                    <h3>Add Member to Group</h3>
                    {addMemberMsg && <p>{addMemberMsg}</p>}
                    <form onSubmit={handleAddMember}>
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={newMemberUsername}
                            onChange={(e) => setNewMemberUsername(e.target.value)}
                            required
                        />
                        <button type="submit">Add User</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default GroupPage;
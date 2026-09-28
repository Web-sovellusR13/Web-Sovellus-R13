import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./group.css";

const apiUrl = import.meta.env.VITE_API_URL;

function GroupPage() {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get(`${apiUrl}/api/groups/${id}`)
            .then(response => {
                setGroup(response.data);
            })
            .catch(err => {
                console.error("Error fetching group page:", err);
                const apiError = err.response?.data;
                if (typeof apiError === 'object' && apiError !== null) {
                    setError(apiError.message || apiError.error || JSON.stringify(apiError));
                } else if (typeof apiError === 'string') {
                    setError(apiError);
                } else {
                    setError(err.message || "Failed to fetch group details");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="groupPageContainer">Loading group...</div>;

    if (error) {
        return (
            <div className="groupPageContainer" style={{ color: "red" }}>
                {typeof error === 'object' ? JSON.stringify(error) : String(error)}
            </div>
        );
    }
    
    if (!group) return <div className="groupPageContainer">No group found.</div>;

    return (
        <div className="groupPageContainer">
            <h1>{typeof group.groupName === 'object' ? JSON.stringify(group.groupName) : group.groupName}</h1>
            <p>
                <strong>Owner:</strong> {typeof group.ownerName === 'object' ? JSON.stringify(group.ownerName) : group.ownerName}
            </p>

            <div className="groupSection">
                <h3>Members</h3>
                <ul>
                    {group.members?.map((member, index) => {
                        const memberId = typeof member === 'object' ? member.userID : member;
                        const memberName = typeof member === 'object' ? member.username : member;
                        return (
                            <li key={memberId || index}>
                                {typeof memberName === 'object' ? JSON.stringify(memberName) : memberName}
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="groupSection">
                <h3>Group Movies</h3>
                {!group.movies || group.movies.length === 0 ? (
                    <p>No movies added yet.</p>
                ) : (
                    <ul>
                        {group.movies.map((item, index) => {
                            const idVal = typeof item === 'object' && item !== null ? (item.movieID || JSON.stringify(item)) : item;
                            return (
                                <li key={idVal || index}>
                                    Movie ID: {idVal}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default GroupPage;
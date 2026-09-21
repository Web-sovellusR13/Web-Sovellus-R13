import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error);
})

export const setImageBase64 = async (file) => {
    const base64 = await toBase64(file)
    return base64;
}

function CreateGroup() {
    const [groupName, setGroupName] = useState('')
    const [groupDescription, setGroupDescription] = useState('')
    const [groupImage, setGroupImage] = useState(templateImage)
    const navigate = useNavigate()

    const handleNameChange = (e) => {
        setGroupName(e.target.value)
    };

    const handleDescriptionChange = (e) => {
        setGroupDescription(e.target.value)
    };

    const handleImageChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const base64Image = await setImageBase64(e.target.files[0])
            console.log('Base54: Image length:', groupImage.length)
            setGroupImage(base64Image)
        }
    }

    const handleSubmit = (e) => {
        const headers = {headers: {'Content-Type':'application/json'}};
        
        e.preventDefault();
        axios.post(url + '/group/createGroups', { 
            groupName,
            groupDescription,
            groupImage,
            owner: 'testUser'
        }, headers)
        .then(response => {
            const groupId = response.data.id
            console.log('Group created:', response.data)
            navigate(`/group/${groupId}`)
        }) .catch(error => {
            console.error('Error creating a group:',error)
            alert(error.response && error.response.data && error.response.data.error ? error.response.data.error : error.message)
        })

    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <p>Please enter your group name:</p>
                <input
                    type='text'
                    placeholder='Type here...'
                    value={groupName}
                    onChange={handleNameChange}
                />
                <p>Please add a description for your group:</p>
                <input
                    type='text'
                    placeholder='Type here...'
                    value={groupDescription}
                    onChange={handleDescriptionChange}
                />
                <p>Change group icon (Must be under 100kb):</p>
                <input type="file" onChange={handleImageChange} />
                <button type='submit'>Create Group</button>
            </form>
        </div>
    );
}

export default CreateGroup;
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL

const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
})

export const setImageBase64 = async (file) => {
    const base64 = await toBase64(file)
    return base64
}

function CreateGroup() {
    const [groupName, setGroupName] = useState('')
    const [groupDescription, setGroupDescription] = useState('')
    const [groupImage, setGroupImage] = useState('')
    const navigate = useNavigate()

    const handleNameChange = (e) => {
        setGroupName(e.target.value)
    }

    const handleDescriptionChange = (e) => {
        setGroupDescription(e.target.value)
    }

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0]
        if (file) {
            // Tarkistetaan tiedostokoko (100 KB limit)
            if (file.size > 100 * 1024) {
                alert('Tiedosto on liian suuri. Valitse alle 100 KB kokoinen kuva.')
                e.target.value = ''
                return
            }

            const base64Image = await setImageBase64(file)
            console.log('Base64 Image length:', base64Image.length) // Korjattu lokitus
            setGroupImage(base64Image)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const headers = { headers: { 'Content-Type': 'application/json' } }

        axios.post(`${apiUrl}/group/createGroups`, { 
            groupName,
            groupDescription,
            groupImage,
            owner: 'testUser'
        }, headers)
        .then(response => {
            const groupId = response.data.id
            console.log('Group created:', response.data)
            navigate(`/group/${groupId}`)
        })
        .catch(error => {
            console.error('Error creating a group:', error)
            alert(error.response?.data?.error || error.message)
        })
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <p>Please enter your group name:</p>
                <input
                    type='text'
                    placeholder='Type here...'
                    value={groupName}
                    onChange={handleNameChange}
                    required
                />
                <p>Please add a description for your group:</p>
                <input
                    type='text'
                    placeholder='Type here...'
                    value={groupDescription}
                    onChange={handleDescriptionChange}
                />
                <p>Change group icon (Must be under 100kb):</p>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                <button type='submit'>Create Group</button>
            </form>
        </div>
    )
}

export default CreateGroup
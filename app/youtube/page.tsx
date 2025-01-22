"use client"
import { useState } from 'react';

export default function VideoUploadForm() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '22',
        keywords: '',
        privacyStatus: 'public'
    });
    const [audioFile, setAudioFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'audioFile' && files) {
            setAudioFile(files[0]);
        } else if (name === 'imageFile' && files) {
            setImageFile(files[0]);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('audioFile', audioFile);
        formDataToSend.append('imageFile', imageFile);
        Object.keys(formData).forEach(key => {
            formDataToSend.append(key, formData[key]);
        });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formDataToSend
            } as RequestInit);
            if (response.ok) {
                const result = await response.json();
                alert(`Video uploaded successfully. Video ID: ${result.videoId}`);
            } else {
                const errorData = await response.json();
                alert(`Error uploading video: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while uploading the video');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="file" name="audioFile" accept="audio/*" onChange={handleChange} required />
            <input type="file" name="imageFile" accept="image/*" onChange={handleChange} required />
            <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
            <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} />
            <input type="text" name="keywords" placeholder="Keywords (comma separated)" value={formData.keywords} onChange={handleChange} />
            <select name="privacyStatus" value={formData.privacyStatus} onChange={handleChange}>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
            </select>
            <button type="submit">Upload Video</button>
        </form>
    );
}

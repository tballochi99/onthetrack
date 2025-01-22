"use client"
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    const [isLoading, setIsLoading] = useState(false);

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
        if (isLoading) return;

        setIsLoading(true);
        const formDataToSend = new FormData();
        formDataToSend.append('audioFile', audioFile);
        formDataToSend.append('imageFile', imageFile);

        const enhancedDescription = `${formData.description}\n\nVidéo postée grâce à OnTheTrack :)`;

        Object.keys(formData).forEach(key => {
            if (key === 'description') {
                formDataToSend.append(key, enhancedDescription);
            } else {
                formDataToSend.append(key, formData[key]);
            }
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="audioFile" className="block text-[#D1D5DB] text-sm font-medium mb-2">Audio File:</label>
                <input
                    type="file"
                    id="audioFile"
                    name="audioFile"
                    accept="audio/*"
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                />
            </div>
            <div>
                <label htmlFor="imageFile" className="block text-[#D1D5DB] text-sm font-medium mb-2">Image File:</label>
                <input
                    type="file"
                    id="imageFile"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                />
            </div>
            <div>
                <label htmlFor="title" className="block text-[#D1D5DB] text-sm font-medium mb-2">Title:</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-[#FFFFFF] border border-[#374151] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-[#D1D5DB] text-sm font-medium mb-2">Description:</label>
                <textarea
                    id="description"
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-[#FFFFFF] border border-[#374151] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] h-24"
                />
            </div>
            <div>
                <label htmlFor="keywords" className="block text-[#D1D5DB] text-sm font-medium mb-2">Keywords:</label>
                <input
                    type="text"
                    id="keywords"
                    name="keywords"
                    placeholder="Keywords (comma separated)"
                    value={formData.keywords}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-[#FFFFFF] border border-[#374151] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
            </div>
            <div>
                <label htmlFor="privacyStatus" className="block text-[#D1D5DB] text-sm font-medium mb-2">Privacy Status:</label>
                <select
                    id="privacyStatus"
                    name="privacyStatus"
                    value={formData.privacyStatus}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-[#FFFFFF] border border-[#374151] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                </select>
            </div>
            <button
                type="submit"
                className={`w-full bg-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-300 ${
                    isLoading ? 'bg-gray-500 cursor-not-allowed' : 'hover:bg-emerald-700'
                }`}
                disabled={isLoading}
            >
                {isLoading ? 'Uploading...' : 'Upload on YouTube'}
            </button>
        </form>
    );}

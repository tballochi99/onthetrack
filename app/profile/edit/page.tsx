"use client";
import React, { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Edit, LogOut, User, Mail, Lock, ArrowLeft, Crown, XCircle, Clock } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UserData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'free' | 'pro';
    subscriptionStatus: 'none' | 'active' | 'cancelled';
    subscriptionId: string;
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email?: string | null;
            username?: string | null;
            role?: 'free' | 'pro';
        }
    }
}

const EditProfile: React.FC = () => {
    const { data: session, status, update } = useSession();
    const [userData, setUserData] = useState<UserData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'free',
        subscriptionStatus: 'none',
        subscriptionId: ''
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/user/profile');
            const data = await response.json();
            if (data.success) {
                setUserData(prevState => ({
                    ...prevState,
                    username: data.user.username || '',
                    email: data.user.email || '',
                    role: data.user.role || 'free',
                    subscriptionStatus: data.user.subscriptionStatus || 'none',
                    subscriptionId: data.user.subscriptionId || ''
                }));
            } else {
                throw new Error(data.message || 'Failed to fetch user profile');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            toast.error('Failed to fetch user profile. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user) {
            fetchUserProfile();
        }
    }, [session]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCancelSubscription = async () => {
        if (confirm('Are you sure you want to cancel your PRO subscription?')) {
            try {
                const response = await fetch('/api/subscription/cancel', {
                    method: 'POST',
                });
                const data = await response.json();
                if (data.success) {
                    toast.success('Subscription cancelled successfully');
                    if (session) {
                        await update({
                            ...session,
                            user: {
                                ...session.user,
                                role: 'free'
                            }
                        });
                    }
                    fetchUserProfile();
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Error cancelling subscription:', error);
                toast.error('Failed to cancel subscription. Please try again.');
            }
        }
    };

    const handleEditProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (userData.password !== userData.confirmPassword) {
            toast.error("Passwords don't match");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userData.username,
                    email: userData.email,
                    password: userData.password || undefined,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setIsEditing(false);
                if (session) {
                    await update({
                        ...session,
                        user: {
                            ...session.user,
                            username: data.user.username,
                            email: data.user.email,
                        }
                    });
                }
                setUserData(prevState => ({
                    ...prevState,
                    password: '',
                    confirmPassword: ''
                }));
                toast.success('Profile updated successfully!');
            } else {
                throw new Error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#111827]">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#111827] text-white">
                <p className="text-2xl font-semibold">You must be logged in to view this page.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <ToastContainer 
                position="top-right" 
                autoClose={5000} 
                hideProgressBar={false} 
                newestOnTop={false} 
                closeOnClick 
                rtl={false} 
                pauseOnFocusLoss 
                draggable 
                pauseOnHover 
            />
            <div className="container mx-auto p-8">
                <div className="bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
                    {/* Section abonnement */}
                    <div className="border-b border-gray-700 pb-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Crown className="mr-2 text-emerald-400" />
                            Subscription Status
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-300">Current Plan: 
                                        <span className={`ml-2 font-semibold ${userData.role === 'pro' ? 'text-blue-400' : 'text-gray-400'}`}>
                                            {userData.role === 'pro' ? 'PRO' : 'Free'}
                                        </span>
                                    </p>
                                    {userData.role === 'pro' && (
                                        <p className="text-sm text-gray-400 mt-1">
                                            Status: {userData.subscriptionStatus}
                                        </p>
                                    )}
                                </div>
                                {userData.role === 'pro' && userData.subscriptionStatus === 'active' && (
                                    <button
                                        onClick={handleCancelSubscription}
                                        className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <XCircle className="mr-2" size={20} />
                                        Cancel Subscription
                                    </button>
                                )}
                                {userData.role === 'free' && (
                                    <Link 
                                        href="/home" 
                                        className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <Crown className="mr-2" size={20} />
                                        Upgrade to PRO
                                    </Link>
                                )}
                                
                            </div>
                        </div>
                    </div>

                    {/* Section profil */}
                    {isEditing ? (
                        <form onSubmit={handleEditProfile} className="space-y-6">
                            <div className="relative">
                                <User className="absolute top-3 left-3 text-emerald-400" size={20} />
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={userData.username}
                                    onChange={handleInputChange}
                                    className="w-full p-2 pl-10 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                    placeholder="Enter new username"
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute top-3 left-3 text-emerald-400" size={20} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={userData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-2 pl-10 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                    placeholder="Enter new email"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute top-3 left-3 text-emerald-400" size={20} />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={userData.password}
                                    onChange={handleInputChange}
                                    className="w-full p-2 pl-10 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                    placeholder="Enter new password (leave blank to keep current)"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute top-3 left-3 text-emerald-400" size={20} />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={userData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full p-2 pl-10 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button 
                                    type="submit" 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                            
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <User className="text-emerald-400" size={24} />
                                <p className="text-gray-300">Username: <span className="font-semibold text-white">{userData.username}</span></p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Mail className="text-emerald-400" size={24} />
                                <p className="text-gray-300">Email: <span className="font-semibold text-white">{userData.email}</span></p>
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                <Edit className="mr-2" size={20} />
                                Edit Profile
                            </button>
 
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-4">
                    <Link href="/purchase" 
                        className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg" 
                        > 
                    <Clock className="mr-2" size={24} /> 
                            Purchase History 
                    </Link>
                     <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                            >
                        <LogOut className="mr-2" size={24} />
                            Log out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
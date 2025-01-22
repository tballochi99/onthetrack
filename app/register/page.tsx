"use client"

import React, { FormEvent, useState } from "react";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AlertCircle, Loader2 } from "lucide-react";

interface FormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface Errors {
    username?: string;
    email?: string;
    password?: string;
    general?: string;
}

const Register: React.FC = () => {
    const router = useRouter();
    const baseURL = `${process.env.NEXT_PUBLIC_HOSTNAME}/api/register`;
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [formData, setFormData] = useState<FormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<Errors>({});

    const validatePassword = (password: string): boolean => {
        return password.length >= 8 && 
               /[A-Z]/.test(password) && 
               /[!@#$%^&*(),.?":{}|<>]/.test(password);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        setErrors(prev => ({
            ...prev,
            [name]: undefined
        }));
    };

    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        const { username, email, password, confirmPassword } = formData;

        if (!validatePassword(password)) {
            setErrors(prev => ({
                ...prev,
                password: 'The password must contain at least 8 characters, one capital letter and one special character.'
            }));
            setIsSubmitting(false);
            return;
        }

        if (password !== confirmPassword) {
            setErrors(prev => ({
                ...prev,
                password: 'Les mots de passe ne correspondent pas'
            }));
            setIsSubmitting(false);
            return;
        }

        try {
            const requestBody = { username, email, password, confirmPassword };
            const res = await axios.post(baseURL, requestBody);
            router.push('/login');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage = error.response.data.message;

                if (errorMessage.includes('Email is already taken')) {
                    setErrors(prev => ({
                        ...prev,
                        email: 'Cet email est déjà utilisé'
                    }));
                } else if (errorMessage.includes('Username is already taken')) {
                    setErrors(prev => ({
                        ...prev,
                        username: 'Ce nom d\'utilisateur est déjà pris'
                    }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        general: errorMessage || 'Une erreur est survenue lors de l\'inscription'
                    }));
                }
            } else {
                setErrors(prev => ({
                    ...prev,
                    general: 'Une erreur inattendue est survenue'
                }));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInputClassName = (hasError: boolean): string => `
        w-full px-4 py-3 rounded-lg bg-gray-700 border 
        ${hasError ? 'border-red-500' : 'border-gray-600'}
        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
        ${hasError ? 'focus:ring-red-500' : 'focus:ring-emerald-500'}
        focus:border-transparent transition duration-300
    `;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 p-4">
            <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-md border border-gray-700 hover:border-emerald-500 transition-all duration-300">
                <h2 className="text-3xl font-bold mb-6">Register</h2>

                {errors.general && (
                    <div className="flex items-center space-x-2 mb-4 p-3 bg-red-900/20 border border-red-800 rounded text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        <span>{errors.general}</span>
                    </div>
                )}

                <form onSubmit={submitHandler} className="space-y-5">
                    <div>
                        <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-300">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className={getInputClassName(!!errors.username)}
                            onChange={handleChange}
                            value={formData.username}
                            required
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-400 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.username}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={getInputClassName(!!errors.email)}
                            onChange={handleChange}
                            value={formData.email}
                            required
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-400 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={getInputClassName(!!errors.password)}
                            onChange={handleChange}
                            value={formData.password}
                            required
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-400 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-300">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className={getInputClassName(!!errors.password)}
                            onChange={handleChange}
                            value={formData.confirmPassword}
                            required
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold transition duration-300 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 disabled:opacity-75 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Sign up'
                            )}
                        </button>
                        <a 
                            href="/login" 
                            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition duration-300"
                        >
                            Already have an account?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
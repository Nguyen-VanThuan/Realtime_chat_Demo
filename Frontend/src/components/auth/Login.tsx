import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import ChatApp from '../chat/ChatApp';
import { Eye, EyeOff, Mail, User, Lock, MessageCircle, Users, Zap } from 'lucide-react';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Login form
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register form
    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        firstname: '',
        lastname: '',
        password: '',
        confirmPassword: ''
    });

    const { login, register, user, isLoading, error, checkAuth } = useAuthStore();
    const { connectSocket, setCurrentUser } = useChatStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (user) {
            setCurrentUser(user);
            const token = localStorage.getItem('token');
            if (token) {
                connectSocket(token);
            }
        }
    }, [user, setCurrentUser, connectSocket]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(loginUsername, loginPassword);
        } catch {
            // Error is handled in store
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (registerData.password !== registerData.confirmPassword) {
            return;
        }

        if (!registerData.username || !registerData.email || !registerData.firstname || !registerData.lastname || !registerData.password) {
            return;
        }

        try {
            await register(registerData);
        } catch {
            // Error is handled in store
        }
    };

    const handleRegisterChange = (field: string, value: string) => {
        setRegisterData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (user) {
        return <ChatApp />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                        <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to ChatApp
                    </h1>
                    <p className="text-gray-600">
                        Connect, communicate, and collaborate in real-time
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                    {/* Tab Switcher */}
                    <div className="flex">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 ${
                                isLogin
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 ${
                                !isLogin
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Forms */}
                    <div className="p-8">
                        {isLogin ? (
                            /* Login Form */
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="login-username"
                                            type="text"
                                            required
                                            value={loginUsername}
                                            onChange={(e) => setLoginUsername(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="Enter your username"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="login-password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-red-600 text-sm text-center">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Signing in...
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </form>
                        ) : (
                            /* Register Form */
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            id="firstname"
                                            type="text"
                                            required
                                            value={registerData.firstname}
                                            onChange={(e) => handleRegisterChange('firstname', e.target.value)}
                                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            id="lastname"
                                            type="text"
                                            required
                                            value={registerData.lastname}
                                            onChange={(e) => handleRegisterChange('lastname', e.target.value)}
                                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="register-username"
                                            type="text"
                                            required
                                            value={registerData.username}
                                            onChange={(e) => handleRegisterChange('username', e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="johndoe123"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={registerData.email}
                                            onChange={(e) => handleRegisterChange('email', e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="register-password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={registerData.password}
                                            onChange={(e) => handleRegisterChange('password', e.target.value)}
                                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="Create a strong password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="confirm-password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={registerData.confirmPassword}
                                            onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                                            className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                                                registerData.confirmPassword && registerData.password !== registerData.confirmPassword
                                                    ? 'border-red-300 focus:ring-red-500'
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                    {registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                                        <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
                                    )}
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-red-600 text-sm text-center">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || registerData.password !== registerData.confirmPassword}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating account...
                                        </div>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-xs text-gray-600">Real-time</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-xs text-gray-600">Group Chat</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                            <MessageCircle className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-xs text-gray-600">Video Call</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) return setError("Please enter your email");

        try {
            setLoading(true);
            const { error: resetError } = await resetPassword(email);
            if (resetError) throw resetError;
            setMessage("Check your inbox for password reset instructions.");
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d1117] relative overflow-hidden text-gray-200">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl relative z-10"
            >
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                    <p className="text-gray-400 text-sm">Enter your email address to receive a secure password reset link.</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-3 rounded-lg bg-red-950/50 border border-red-900/50 flex gap-3 text-sm text-red-200">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" /> {error}
                    </motion.div>
                )}

                {message && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-3 rounded-lg bg-emerald-950/50 border border-emerald-900/50 flex gap-3 text-sm text-emerald-200">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {message}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-100 transition-all"
                            placeholder="eco@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed border border-gray-700"
                    >
                        {loading ? 'Sending...' : (
                            <>
                                <Mail className="w-4 h-4" />
                                Send Reset Link
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

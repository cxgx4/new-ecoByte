import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { updatePassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        if (password.length < 6) {
            return setError("Password must be at least 6 characters");
        }

        try {
            setLoading(true);
            const { error: updateError } = await updatePassword(password);
            if (updateError) throw updateError;
            
            setMessage("Password successfully updated. Redirecting to dashboard...");
            setTimeout(() => navigate('/dashboard'), 2000);
            
        } catch (err) {
            setError(err.message || 'Failed to update password');
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
                    <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
                    <p className="text-gray-400 text-sm">Please enter a new password for your account.</p>
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">New Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-100 transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Confirm New Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-100 transition-all"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : (
                            <>
                                <KeyRound className="w-4 h-4" />
                                Update Password
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

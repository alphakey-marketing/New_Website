import { useState } from 'react';
import classNames from 'classnames';
import { loginUser, logoutUser, isLoggedIn, getProgress } from '@/utils/progressTracking';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (status: boolean) => void;
    language?: 'en' | 'zh';
}

const labels = {
    en: {
        title: 'Login to Track Progress',
        username: 'Username',
        password: 'Password',
        login: 'Login',
        logout: 'Logout',
        cancel: 'Cancel',
        error: 'Invalid username or password',
        loggedInAs: 'Logged in as',
        loginPrompt: 'Login to save your learning progress and enable spaced repetition.',
    },
    zh: {
        title: '登入以追蹤進度',
        username: '用戶名',
        password: '密碼',
        login: '登入',
        logout: '登出',
        cancel: '取消',
        error: '用戶名或密碼錯誤',
        loggedInAs: '已登入為',
        loginPrompt: '登入以保存您的學習進度並啟用間隔重複學習。',
    },
};

export default function LoginModal({ isOpen, onClose, onLoginSuccess, language = 'en' }: LoginModalProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const t = labels[language];
    const loggedIn = isLoggedIn();
    const progress = getProgress();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                loginUser(data.username, data.token);
                setUsername('');
                setPassword('');
                onLoginSuccess(true);
                onClose();
            } else {
                setError(t.error);
            }
        } catch {
            setError(t.error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logoutUser();
        onLoginSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl border border-purple-500/30 p-6 max-w-md w-full shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">{t.title}</h2>
                
                {loggedIn ? (
                    <div className="space-y-4">
                        <p className="text-slate-300">
                            {t.loggedInAs}: <span className="text-pink-400 font-semibold">{progress.username}</span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-3 rounded-lg font-semibold bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition-all"
                            >
                                {t.logout}
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-lg font-semibold bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <p className="text-sm text-slate-400 mb-4">{t.loginPrompt}</p>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                {t.username}
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-3 bg-slate-700 text-white rounded-lg border border-purple-500/50 focus:border-pink-500 focus:outline-none"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                {t.password}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-slate-700 text-white rounded-lg border border-purple-500/50 focus:border-pink-500 focus:outline-none"
                                required
                            />
                        </div>
                        
                        {error && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}
                        
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={classNames(
                                    'flex-1 py-3 rounded-lg font-semibold transition-all',
                                    loading
                                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                                )}
                            >
                                {loading ? '...' : t.login}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-lg font-semibold bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

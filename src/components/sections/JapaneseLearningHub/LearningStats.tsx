import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { getProgress, getOverallStats, getVocabForReview, isLoggedIn } from '@/utils/progressTracking';

interface LearningStatsProps {
    language?: 'en' | 'zh';
    onLoginClick: () => void;
}

const labels = {
    en: {
        title: 'Learning Stats',
        notLoggedIn: 'Login to track your progress',
        loginButton: 'Login',
        vocabStudied: 'Vocabulary Studied',
        avgMastery: 'Average Mastery',
        quizzesTaken: 'Quizzes Taken',
        avgScore: 'Average Score',
        streak: 'Day Streak',
        dueReview: 'Due for Review',
        recentScores: 'Recent Quiz Scores',
        dueVocab: 'Vocabulary Due for Review',
        noData: 'No data yet. Start practicing!',
        noVocabDue: 'No vocabulary due for review.',
        mastery: 'Mastery',
        lastSeen: 'Last seen',
        viewAll: 'Start Review',
    },
    zh: {
        title: '學習統計',
        notLoggedIn: '登入以追蹤您的進度',
        loginButton: '登入',
        vocabStudied: '已學詞彙',
        avgMastery: '平均掌握度',
        quizzesTaken: '測驗次數',
        avgScore: '平均分數',
        streak: '連續天數',
        dueReview: '待復習',
        recentScores: '最近測驗分數',
        dueVocab: '待復習詞彙',
        noData: '尚無資料。開始練習吧！',
        noVocabDue: '沒有待復習的詞彙。',
        mastery: '掌握度',
        lastSeen: '上次學習',
        viewAll: '開始復習',
    },
};

export default function LearningStats({ language = 'en', onLoginClick }: LearningStatsProps) {
    const [stats, setStats] = useState(getOverallStats());
    const [dueVocab, setDueVocab] = useState(getVocabForReview());
    const [progress, setProgress] = useState(getProgress());
    const [loggedIn, setLoggedIn] = useState(false);

    const t = labels[language];

    useEffect(() => {
        const refreshData = () => {
            setLoggedIn(isLoggedIn());
            setStats(getOverallStats());
            setDueVocab(getVocabForReview());
            setProgress(getProgress());
        };
        
        refreshData();
        
        window.addEventListener('storage', refreshData);
        
        const interval = setInterval(refreshData, 1000);
        
        return () => {
            window.removeEventListener('storage', refreshData);
            clearInterval(interval);
        };
    }, []);

    if (!loggedIn) {
        return (
            <div className="w-full">
                <h3 className="text-2xl font-bold mb-6 text-pink-400">{t.title}</h3>
                <div className="p-8 bg-slate-800/50 rounded-lg border border-purple-500/30 text-center">
                    <p className="text-slate-400 mb-4">{t.notLoggedIn}</p>
                    <button
                        onClick={onLoginClick}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                        {t.loginButton}
                    </button>
                </div>
            </div>
        );
    }

    const recentScores = progress.quizScores.slice(-5).reverse();

    return (
        <div className="w-full space-y-6">
            <h3 className="text-2xl font-bold text-pink-400">{t.title}</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                    label={t.vocabStudied}
                    value={stats.totalVocabStudied.toString()}
                    icon="📚"
                    color="indigo"
                />
                <StatCard
                    label={t.avgMastery}
                    value={`${stats.averageMastery}%`}
                    icon="🎯"
                    color="purple"
                />
                <StatCard
                    label={t.quizzesTaken}
                    value={stats.totalQuizzes.toString()}
                    icon="📝"
                    color="pink"
                />
                <StatCard
                    label={t.avgScore}
                    value={`${stats.averageQuizScore}%`}
                    icon="⭐"
                    color="amber"
                />
                <StatCard
                    label={t.streak}
                    value={stats.streak.toString()}
                    icon="🔥"
                    color="orange"
                />
                <StatCard
                    label={t.dueReview}
                    value={stats.dueForReview.toString()}
                    icon="⏰"
                    color={stats.dueForReview > 0 ? 'red' : 'green'}
                />
            </div>

            {dueVocab.length > 0 && (
                <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/30">
                    <h4 className="text-lg font-bold text-indigo-300 mb-3">{t.dueVocab}</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {dueVocab.slice(0, 10).map((vocab, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2 bg-slate-900/50 rounded"
                            >
                                <span className="text-white font-medium">{vocab.kanji}</span>
                                <div className="flex items-center gap-3">
                                    <span className={classNames(
                                        'text-sm px-2 py-0.5 rounded',
                                        vocab.mastery < 50 ? 'bg-red-500/20 text-red-400' :
                                        vocab.mastery < 80 ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-green-500/20 text-green-400'
                                    )}>
                                        {t.mastery}: {vocab.mastery}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {recentScores.length > 0 && (
                <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/30">
                    <h4 className="text-lg font-bold text-indigo-300 mb-3">{t.recentScores}</h4>
                    <div className="space-y-2">
                        {recentScores.map((score, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2 bg-slate-900/50 rounded"
                            >
                                <span className="text-slate-300">{score.type}</span>
                                <div className="flex items-center gap-2">
                                    <span className={classNames(
                                        'font-semibold',
                                        (score.score / score.total) >= 0.8 ? 'text-green-400' :
                                        (score.score / score.total) >= 0.6 ? 'text-amber-400' :
                                        'text-red-400'
                                    )}>
                                        {score.score}/{score.total}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {new Date(score.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {stats.totalVocabStudied === 0 && (
                <div className="p-6 bg-slate-800/50 rounded-lg border border-purple-500/30 text-center">
                    <p className="text-slate-400">{t.noData}</p>
                </div>
            )}
        </div>
    );
}

function StatCard({ 
    label, 
    value, 
    icon, 
    color 
}: { 
    label: string; 
    value: string; 
    icon: string; 
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
        purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
        pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
        amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
        orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
        red: 'from-red-500/20 to-red-600/10 border-red-500/30',
        green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    };

    return (
        <div className={classNames(
            'p-4 rounded-lg bg-gradient-to-br border',
            colorClasses[color] || colorClasses.indigo
        )}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm text-slate-400">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );
}

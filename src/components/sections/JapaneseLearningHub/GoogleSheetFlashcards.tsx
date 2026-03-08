import { useState, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import { 
    updateVocabProgress, 
    getPrioritizedVocab, 
    addQuizScore, 
    updateStudyStreak, 
    isLoggedIn
} from '@/utils/progressTracking';

interface FlashcardItem {
    kanji: string;
    hiragana: string;
    meaning: string;
}

function Flashcard({ item, isFlipped, onFlip }: { item: FlashcardItem; isFlipped: boolean; onFlip: () => void }) {
    return (
        <div
            onClick={onFlip}
            className="h-64 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl cursor-pointer shadow-xl transform transition-all duration-300 flex items-center justify-center p-8 text-center"
        >
            <div>
                {!isFlipped ? (
                    <div>
                        <div className="text-sm text-indigo-200 mb-2">Kanji</div>
                        <div className="text-5xl font-bold text-white">{item.kanji}</div>
                    </div>
                ) : (
                    <div>
                        <div className="text-sm text-indigo-200 mb-4">Hiragana</div>
                        <div className="text-2xl text-indigo-100 mb-6">{item.hiragana}</div>
                        <div className="text-sm text-indigo-200 mb-2">Meaning</div>
                        <div className="text-lg text-white">{item.meaning}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function GoogleSheetFlashcards() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
    const [showStats, setShowStats] = useState(false);
    const [useSRS, setUseSRS] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [googleSheetVocab, setGoogleSheetVocab] = useState<FlashcardItem[]>([]);
    const [loadingVocab, setLoadingVocab] = useState(true);
    const [vocabError, setVocabError] = useState<string | null>(null);

    // Fetch vocabulary from Google Sheets
    useEffect(() => {
        const fetchVocabulary = async () => {
            try {
                setLoadingVocab(true);
                setVocabError(null);
                const response = await fetch('/api/flashcards/google-sheet');
                if (!response.ok) {
                    throw new Error('Failed to fetch vocabulary from Google Sheets');
                }
                const data = await response.json();
                if (data.length === 0) {
                    throw new Error('No vocabulary found in Google Sheet');
                }
                setGoogleSheetVocab(data);
            } catch (error) {
                console.error('Error fetching vocabulary:', error);
                setVocabError(error instanceof Error ? error.message : 'Failed to fetch vocabulary');
            } finally {
                setLoadingVocab(false);
            }
        };

        fetchVocabulary();
    }, []);

    useEffect(() => {
        const checkLoginStatus = () => {
            const status = isLoggedIn();
            setLoggedIn(status);
            if (status) {
                updateStudyStreak();
            }
        };
        
        checkLoginStatus();
        
        const handleStorageChange = () => {
            checkLoginStatus();
        };
        
        window.addEventListener('storage', handleStorageChange);
        const interval = setInterval(checkLoginStatus, 1000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const shuffledVocab = useMemo(() => {
        if (googleSheetVocab.length === 0) return [];
        if (useSRS && loggedIn) {
            return getPrioritizedVocab(googleSheetVocab) as typeof googleSheetVocab;
        }
        return [...googleSheetVocab].sort(() => Math.random() - 0.5);
    }, [useSRS, loggedIn, googleSheetVocab]);

    const currentCard = shuffledVocab[currentIndex];
    const progress = shuffledVocab.length > 0 ? Math.round(((currentIndex + 1) / shuffledVocab.length) * 100) : 0;

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleMastered = () => {
        const newCorrect = score.correct + 1;
        const newTotal = score.total + 1;
        
        setMasteredCards(new Set([...masteredCards, currentIndex]));
        setScore({ correct: newCorrect, total: newTotal });
        
        if (loggedIn && currentCard) {
            updateVocabProgress(currentCard.kanji, true);
        }
        
        if (currentIndex < shuffledVocab.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            if (loggedIn) {
                addQuizScore('Google Sheet Flashcards', newCorrect, newTotal);
            }
            setShowStats(true);
        }
    };

    const handleSkip = () => {
        const newTotal = score.total + 1;
        
        setScore({ ...score, total: newTotal });
        
        if (loggedIn && currentCard) {
            updateVocabProgress(currentCard.kanji, false);
        }
        
        if (currentIndex < shuffledVocab.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            if (loggedIn) {
                addQuizScore('Google Sheet Flashcards', score.correct, newTotal);
            }
            setShowStats(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setScore({ correct: 0, total: 0 });
        setMasteredCards(new Set());
        setShowStats(false);
    };

    if (loadingVocab) {
        return (
            <div className="w-full flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="text-lg text-slate-300 mb-2">Loading vocabulary from Google Sheet...</div>
                    <div className="text-sm text-slate-400">Please wait</div>
                </div>
            </div>
        );
    }

    if (vocabError) {
        return (
            <div className="w-full">
                <div className="p-6 bg-red-900/30 border border-red-500/50 rounded-lg">
                    <h3 className="text-lg font-bold text-red-400 mb-2">Error Loading Vocabulary</h3>
                    <p className="text-slate-300 mb-4">{vocabError}</p>
                    <p className="text-sm text-slate-400">Please make sure:</p>
                    <ul className="text-sm text-slate-400 list-disc list-inside mt-2">
                        <li>Your Google Sheet is properly shared</li>
                        <li>Column A: Kanji, Column B: Hiragana, Column C: Meaning</li>
                        <li>Data starts from Row 2 (Row 1 is header)</li>
                    </ul>
                </div>
            </div>
        );
    }

    if (googleSheetVocab.length === 0) {
        return (
            <div className="w-full">
                <div className="p-6 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
                    <h3 className="text-lg font-bold text-yellow-400 mb-2">No Vocabulary Found</h3>
                    <p className="text-slate-300">Your Google Sheet is empty or does not have the correct format.</p>
                </div>
            </div>
        );
    }

    if (showStats) {
        return (
            <div className="w-full flex justify-center">
                <div className="text-center max-w-md">
                    <h3 className="text-3xl font-bold mb-6 text-pink-400">Quiz Complete! 🎉</h3>
                    <div className="p-8 bg-slate-800/50 border border-purple-500/30 rounded-lg space-y-4">
                        <div className="text-6xl font-bold text-indigo-400">{score.correct}/{score.total}</div>
                        <div className="text-slate-300 mb-4">Cards Mastered</div>
                        <div className="text-3xl font-bold text-pink-400 mb-6">
                            {Math.round((score.correct / score.total) * 100)}%
                        </div>
                        <p className="text-sm text-slate-400 mb-6">
                            {score.correct === score.total
                                ? 'Perfect score! You are a master! 🌟'
                                : score.correct >= score.total * 0.8
                                ? 'Great job! Keep practicing! 💪'
                                : 'Good effort! Review and try again! 📚'}
                        </p>
                        <button
                            onClick={handleRestart}
                            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors w-full"
                        >
                            Start Over
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-pink-400 mb-2">Google Sheet Flashcard Quiz</h3>
                <p className="text-sm text-slate-400">Study vocabulary from your Google Sheet! Click cards to reveal answers.{/* Using single quote in comment */}</p>
            </div>

            <div className="flex gap-2 items-center justify-between">
                <div className="space-y-2 flex-1">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <span className="text-sm text-slate-300">Progress: {currentIndex + 1}/{shuffledVocab.length}</span>
                            {loggedIn && useSRS && <span className="ml-3 text-xs bg-indigo-500/30 text-indigo-300 px-2 py-1 rounded border border-indigo-500/50">🔄 SRS Active</span>}
                        </div>
                        <span className="text-sm text-pink-400 font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {currentCard && (
                    <>
                        <Flashcard item={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />
                        
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={handleMastered}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                ✓ Got it!
                            </button>
                            <button
                                onClick={handleSkip}
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition-colors"
                            >
                                Skip
                            </button>
                        </div>

                        <div className="text-center space-y-2">
                            <div className="text-sm text-slate-400">
                                Score: <span className="text-green-400 font-semibold">{score.correct}</span> / {score.total}
                            </div>
                            <div className="text-xs text-center text-slate-500">
                                💡 Click the card to reveal hiragana and meaning
                            </div>
                        </div>
                    </>
                )}

                <div className="flex items-center gap-2 justify-center pt-4 border-t border-slate-700 mt-4">
                    {loggedIn ? (
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="srs-toggle"
                                checked={useSRS}
                                onChange={(e) => setUseSRS(e.target.checked)}
                                className="rounded cursor-pointer w-4 h-4"
                            />
                            <label htmlFor="srs-toggle" className="text-sm text-slate-300 cursor-pointer">
                                🔄 Use Spaced Repetition System
                            </label>
                            {useSRS && (
                                <span className="text-xs text-indigo-400 ml-2">
                                    • Cards prioritized by difficulty
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-slate-400">
                            🔐 Login with admin/admin to enable Spaced Repetition
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
import classNames from 'classnames';
import { useState, useMemo } from 'react';

interface FlashcardItem {
    kanji: string;
    hiragana: string;
    meaning: string;
}

interface VerbConjugation {
    base: string;
    furigana: string;
    meaning: string;
    conjugations: Array<{
        form: string;
        result: string;
    }>;
}

const vocabularyData: FlashcardItem[] = [
    { kanji: '朝', hiragana: 'あさ', meaning: '早晨' },
    { kanji: '昼', hiragana: 'ひる', meaning: '中午' },
    { kanji: '晩', hiragana: 'ばん', meaning: '傍晚' },
    { kanji: '夜', hiragana: 'よる', meaning: '夜晚' },
    { kanji: '朝日', hiragana: 'あさひ', meaning: '晨曦' },
    { kanji: '夜明け', hiragana: 'よあけ', meaning: '黎明' },
    { kanji: '日', hiragana: 'ひ', meaning: '日期' },
    { kanji: '週', hiragana: 'しゅう', meaning: '週' },
    { kanji: '月', hiragana: 'つき', meaning: '月' },
    { kanji: '年', hiragana: 'ねん', meaning: '年' },
    { kanji: '時間', hiragana: 'じかん', meaning: '時間' },
    { kanji: '分', hiragana: 'ふん', meaning: '分鐘' },
    { kanji: '秒', hiragana: 'びょう', meaning: '秒' },
    { kanji: '今', hiragana: 'いま', meaning: '現在' },
    { kanji: '昨日', hiragana: 'きのう', meaning: '昨天' },
    { kanji: '今日', hiragana: 'きょう', meaning: '今天' },
    { kanji: '明日', hiragana: 'あした', meaning: '明天' },
    { kanji: '月曜日', hiragana: 'げつようび', meaning: '週一' },
    { kanji: '火曜日', hiragana: 'かようび', meaning: '週二' },
    { kanji: '水曜日', hiragana: 'すいようび', meaning: '週三' },
    { kanji: '木曜日', hiragana: 'もくようび', meaning: '週四' },
    { kanji: '金曜日', hiragana: 'きんようび', meaning: '週五' },
    { kanji: '土曜日', hiragana: 'どようび', meaning: '週六' },
    { kanji: '日曜日', hiragana: 'にちようび', meaning: '週日' },
];

const verbConjugationData: VerbConjugation[] = [
    {
        base: '待つ',
        furigana: 'まつ',
        meaning: 'to wait',
        conjugations: [
            { form: 'Present/Polite', result: '待ちます' },
            { form: 'Negative', result: '待たない' },
            { form: 'Negative Polite', result: '待ちません' },
        ],
    },
];

function Flashcard({ item, isFlipped, onFlip }: { item: FlashcardItem; isFlipped: boolean; onFlip: () => void }) {
    return (
        <div
            onClick={onFlip}
            className={`cursor-pointer p-8 rounded-lg text-center transition-all transform ${
                isFlipped
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                    : 'bg-gradient-to-br from-pink-500 to-indigo-500 text-white'
            }`}
        >
            <div className="text-sm text-slate-200 mb-4">{isFlipped ? '答案' : '問題'}</div>
            {!isFlipped ? (
                <div className="text-5xl font-bold">{item.kanji}</div>
            ) : (
                <>
                    <div className="text-3xl mb-4">{item.hiragana}</div>
                    <div className="text-xl">{item.meaning}</div>
                </>
            )}
        </div>
    );
}

function VerbConjugationQuiz() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentVerb = verbConjugationData[currentIndex];
    const progress = Math.round(((currentIndex + 1) / verbConjugationData.length) * 100);

    const moveToNext = () => {
        if (currentIndex < verbConjugationData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
    };

    return (
        <div className="w-full space-y-6">
            <div>
                <h3 className="text-2xl font-bold mb-2 text-indigo-400">動詞轉換</h3>
                <p className="text-sm text-slate-400">學習日文動詞的各種轉換形式。</p>
            </div>

            <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">進度</span>
                    <span className="text-sm text-indigo-400 font-semibold">
                        {currentIndex + 1}/{verbConjugationData.length}
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="p-6 bg-slate-800/50 border border-indigo-500/30 rounded-lg space-y-4">
                <div className="p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
                    <div className="text-xs text-slate-400 mb-2">基本形式</div>
                    <div className="text-3xl font-bold text-indigo-400">{currentVerb?.base}</div>
                    <div className="text-sm text-indigo-300 mt-2">{currentVerb?.furigana}</div>
                    <div className="text-xs text-slate-400 mt-2">{currentVerb?.meaning}</div>
                </div>

                <div className="space-y-3">
                    {currentVerb?.conjugations.map((conj, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/50 rounded border border-slate-600">
                            <div className="text-xs text-slate-400 mb-1">{conj.form}</div>
                            <div className="text-lg font-semibold text-slate-100">{conj.result}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 justify-center">
                <button
                    onClick={moveToNext}
                    disabled={currentIndex === verbConjugationData.length - 1}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded font-semibold transition-colors"
                >
                    下一個 →
                </button>
                <button
                    onClick={handleRestart}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-semibold transition-colors"
                >
                    重新開始
                </button>
            </div>
        </div>
    );
}

function GrammarExerciseComponent() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const grammarQuestions = [
        {
            question: '_____ 私は学校に行きます。',
            options: ['毎日', '昨日', '明日'],
            correct: '毎日',
            explanation: '「毎日」（まいにち）= every day。這裡應該填入表示每天都要去學校的時間詞。',
        },
    ];

    const currentQuestion = grammarQuestions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion?.correct;

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        setShowAnswer(true);
        if (answer === currentQuestion?.correct) {
            setScore({ ...score, correct: score.correct + 1, total: score.total + 1 });
        } else {
            setScore({ ...score, total: score.total + 1 });
        }
    };

    const moveToNext = () => {
        if (currentIndex < grammarQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowAnswer(false);
            setSelectedAnswer(null);
        }
    };

    return (
        <div className="w-full space-y-6">
            <div>
                <h3 className="text-2xl font-bold mb-2 text-pink-400">文法練習</h3>
                <p className="text-sm text-slate-400">測試您的日文文法知識。</p>
            </div>

            <div className="p-6 bg-slate-800/50 border border-pink-500/30 rounded-lg space-y-6">
                <div>
                    <div className="text-lg font-semibold text-slate-100 mb-4">{currentQuestion?.question}</div>
                    <div className="space-y-2">
                        {currentQuestion?.options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                disabled={showAnswer}
                                className={classNames(
                                    'w-full p-3 text-left rounded font-semibold transition-colors',
                                    showAnswer
                                        ? selectedAnswer === option
                                            ? option === currentQuestion?.correct
                                                ? 'bg-green-600 text-white'
                                                : 'bg-red-600 text-white'
                                            : option === currentQuestion?.correct
                                            ? 'bg-green-600 text-white'
                                            : 'bg-slate-700 text-slate-400'
                                        : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
                                )}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {showAnswer && (
                    <div className="space-y-3 border-t border-slate-600 pt-4">
                        <div className={classNames('text-sm font-semibold', isCorrect ? 'text-green-400' : 'text-red-400')}>
                            {isCorrect ? '✓ 正確！' : '✗ 錯誤'}
                        </div>
                        <div className="text-sm text-slate-300">{currentQuestion?.explanation}</div>
                        <div className="text-sm text-slate-400">
                            得分: <span className="text-green-400 font-semibold">{score.correct}</span> / {score.total}
                        </div>
                        <button
                            onClick={moveToNext}
                            className="w-full px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                        >
                            {currentIndex === grammarQuestions.length - 1 ? '查看結果' : '下一題'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ExercisesSectionZh() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
    const [showStats, setShowStats] = useState(false);
    const [activeTab, setActiveTab] = useState<'flashcard' | 'conjugation' | 'grammar'>('flashcard');

    const shuffledVocab = useMemo(() => {
        return [...vocabularyData].sort(() => Math.random() - 0.5);
    }, []);

    const currentCard = shuffledVocab[currentIndex];
    const progress = Math.round(((currentIndex + 1) / shuffledVocab.length) * 100);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleMastered = () => {
        setMasteredCards(new Set([...masteredCards, currentIndex]));
        setScore({ ...score, correct: score.correct + 1, total: score.total + 1 });
        moveToNext();
    };

    const handleSkip = () => {
        setScore({ ...score, total: score.total + 1 });
        moveToNext();
    };

    const moveToNext = () => {
        if (currentIndex < shuffledVocab.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
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

    if (activeTab === 'grammar') {
        return <GrammarExerciseComponent />;
    }

    if (activeTab === 'conjugation') {
        return (
            <div className="w-full">
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setActiveTab('flashcard')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📚 閃卡
                    </button>
                    <button
                        onClick={() => setActiveTab('conjugation')}
                        className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                    >
                        🔄 動詞轉換
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✏️ 文法
                    </button>
                </div>
                <VerbConjugationQuiz />
            </div>
        );
    }

    if (showStats) {
        return (
            <div className="w-full">
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setActiveTab('flashcard')}
                        className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                    >
                        📚 閃卡
                    </button>
                    <button
                        onClick={() => setActiveTab('conjugation')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔄 動詞轉換
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✏️ 文法
                    </button>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-pink-400">測驗完成！🎉</h3>
                <div className="space-y-6 max-w-md">
                    <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-indigo-400 mb-2">{score.correct}/{score.total}</div>
                            <div className="text-slate-300 mb-4">掌握的卡片</div>
                            <div className="text-2xl font-bold text-pink-400 mb-6">
                                {Math.round((score.correct / score.total) * 100)}%
                            </div>
                            <p className="text-sm text-slate-400 mb-6">
                                {score.correct === score.total
                                    ? '滿分！表現非常出色！🌟'
                                    : score.correct >= score.total * 0.8
                                    ? '很好！繼續練習！💪'
                                    : '好努力！再複習一下！📚'}
                            </p>
                            <button
                                onClick={handleRestart}
                                className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                            >
                                重新開始
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex gap-2 mb-6 flex-wrap">
                <button
                    onClick={() => setActiveTab('flashcard')}
                    className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                >
                    📚 閃卡
                </button>
                <button
                    onClick={() => setActiveTab('conjugation')}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                >
                    🔄 動詞轉換
                </button>
                <button
                    onClick={() => setActiveTab('grammar')}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                >
                    ✏️ 文法
                </button>
            </div>

            <h3 className="text-2xl font-bold mb-2 text-pink-400">詞彙閃卡測驗</h3>
            <p className="text-sm text-slate-400 mb-6">考驗自己的N5詞彙。點擊卡片以翻轉並揭示答案。</p>

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">進度</span>
                        <span className="text-sm text-pink-400 font-semibold">
                            {currentIndex + 1}/{shuffledVocab.length}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <Flashcard item={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />

                <div className="text-center">
                    <div className="text-sm text-slate-400">
                        掌握: <span className="text-green-400 font-semibold">{score.correct}</span> / {score.total}
                    </div>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={handleSkip}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-semibold transition-colors"
                    >
                        略過
                    </button>
                    <button
                        onClick={handleMastered}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors"
                    >
                        已掌握 ✓
                    </button>
                </div>

                <div className="text-xs text-center text-slate-500">
                    💡 點擊卡片以顯示平假名和中文意思
                </div>
            </div>
        </div>
    );
}

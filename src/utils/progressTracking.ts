export interface VocabProgress {
    kanji: string;
    correct: number;
    incorrect: number;
    lastSeen: string;
    nextReview: string;
    mastery: number;
}

export interface CategoryProgress {
    name: string;
    totalItems: number;
    studiedItems: number;
    correctAnswers: number;
    incorrectAnswers: number;
    masteryLevel: number;
}

export interface QuizScore {
    type: string;
    score: number;
    total: number;
    date: string;
}

export interface UserProgress {
    isLoggedIn: boolean;
    username: string;
    vocabulary: Record<string, VocabProgress>;
    categories: Record<string, CategoryProgress>;
    quizScores: QuizScore[];
    totalStudyTime: number;
    lastStudyDate: string;
    streak: number;
}

const STORAGE_KEY = 'japanese_learning_progress';

const defaultProgress: UserProgress = {
    isLoggedIn: false,
    username: '',
    vocabulary: {},
    categories: {},
    quizScores: [],
    totalStudyTime: 0,
    lastStudyDate: '',
    streak: 0,
};

export function getProgress(): UserProgress {
    if (typeof window === 'undefined') return defaultProgress;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress;
    
    try {
        return JSON.parse(stored);
    } catch {
        return defaultProgress;
    }
}

export function saveProgress(progress: UserProgress): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateVocabProgress(
    kanji: string, 
    isCorrect: boolean
): VocabProgress {
    const progress = getProgress();
    const now = new Date().toISOString();
    
    const existing = progress.vocabulary[kanji] || {
        kanji,
        correct: 0,
        incorrect: 0,
        lastSeen: now,
        nextReview: now,
        mastery: 0,
    };
    
    if (isCorrect) {
        existing.correct += 1;
    } else {
        existing.incorrect += 1;
    }
    
    existing.lastSeen = now;
    
    const total = existing.correct + existing.incorrect;
    existing.mastery = total > 0 ? Math.round((existing.correct / total) * 100) : 0;
    
    existing.nextReview = calculateNextReview(existing.mastery, isCorrect);
    
    progress.vocabulary[kanji] = existing;
    saveProgress(progress);
    
    return existing;
}

function calculateNextReview(mastery: number, wasCorrect: boolean): string {
    const now = new Date();
    let hoursToAdd: number;
    
    if (!wasCorrect) {
        hoursToAdd = 0.5;
    } else if (mastery < 30) {
        hoursToAdd = 1;
    } else if (mastery < 50) {
        hoursToAdd = 4;
    } else if (mastery < 70) {
        hoursToAdd = 24;
    } else if (mastery < 90) {
        hoursToAdd = 72;
    } else {
        hoursToAdd = 168;
    }
    
    now.setTime(now.getTime() + hoursToAdd * 60 * 60 * 1000);
    return now.toISOString();
}

export function getVocabForReview(): VocabProgress[] {
    const progress = getProgress();
    const now = new Date().toISOString();
    
    return Object.values(progress.vocabulary)
        .filter(v => v.nextReview <= now)
        .sort((a, b) => {
            if (a.mastery !== b.mastery) return a.mastery - b.mastery;
            return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
        });
}

export function getPrioritizedVocab(allVocab: { kanji: string }[]): { kanji: string }[] {
    const progress = getProgress();
    const now = new Date().toISOString();
    
    const dueForReview: { kanji: string; priority: number }[] = [];
    const notStudied: { kanji: string }[] = [];
    const notDue: { kanji: string; priority: number }[] = [];
    
    for (const item of allVocab) {
        const vocabProgress = progress.vocabulary[item.kanji];
        
        if (!vocabProgress) {
            notStudied.push(item);
        } else if (vocabProgress.nextReview <= now) {
            const priority = 100 - vocabProgress.mastery + 
                (vocabProgress.incorrect * 10);
            dueForReview.push({ ...item, priority });
        } else {
            notDue.push({ ...item, priority: vocabProgress.mastery });
        }
    }
    
    dueForReview.sort((a, b) => b.priority - a.priority);
    notDue.sort((a, b) => a.priority - b.priority);
    
    return [
        ...dueForReview,
        ...notStudied,
        ...notDue,
    ];
}

export function updateCategoryProgress(
    categoryName: string,
    totalItems: number,
    isCorrect: boolean
): CategoryProgress {
    const progress = getProgress();
    
    const existing = progress.categories[categoryName] || {
        name: categoryName,
        totalItems,
        studiedItems: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        masteryLevel: 0,
    };
    
    existing.studiedItems += 1;
    if (isCorrect) {
        existing.correctAnswers += 1;
    } else {
        existing.incorrectAnswers += 1;
    }
    
    const totalAnswers = existing.correctAnswers + existing.incorrectAnswers;
    existing.masteryLevel = totalAnswers > 0 
        ? Math.round((existing.correctAnswers / totalAnswers) * 100) 
        : 0;
    
    progress.categories[categoryName] = existing;
    saveProgress(progress);
    
    return existing;
}

export function addQuizScore(type: string, score: number, total: number): void {
    const progress = getProgress();
    
    progress.quizScores.push({
        type,
        score,
        total,
        date: new Date().toISOString(),
    });
    
    if (progress.quizScores.length > 100) {
        progress.quizScores = progress.quizScores.slice(-100);
    }
    
    saveProgress(progress);
}

export function updateStudyStreak(): void {
    const progress = getProgress();
    const today = new Date().toDateString();
    const lastStudy = progress.lastStudyDate ? new Date(progress.lastStudyDate).toDateString() : '';
    
    if (lastStudy !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastStudy === yesterday.toDateString()) {
            progress.streak += 1;
        } else if (lastStudy !== today) {
            progress.streak = 1;
        }
        
        progress.lastStudyDate = new Date().toISOString();
        saveProgress(progress);
    }
}

export function loginUser(username: string, token: string): void {
    const progress = getProgress();
    progress.isLoggedIn = true;
    progress.username = username;
    saveProgress(progress);
    
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
    }
}

export function logoutUser(): void {
    const progress = getProgress();
    progress.isLoggedIn = false;
    progress.username = '';
    saveProgress(progress);
    
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
    }
}

export function isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    const progress = getProgress();
    const token = localStorage.getItem('auth_token');
    return progress.isLoggedIn && !!token;
}

export function getOverallStats(): {
    totalVocabStudied: number;
    averageMastery: number;
    totalQuizzes: number;
    averageQuizScore: number;
    streak: number;
    dueForReview: number;
} {
    const progress = getProgress();
    const vocabList = Object.values(progress.vocabulary);
    const now = new Date().toISOString();
    
    const totalVocabStudied = vocabList.length;
    const averageMastery = totalVocabStudied > 0
        ? Math.round(vocabList.reduce((sum, v) => sum + v.mastery, 0) / totalVocabStudied)
        : 0;
    
    const totalQuizzes = progress.quizScores.length;
    const averageQuizScore = totalQuizzes > 0
        ? Math.round(
            progress.quizScores.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) / totalQuizzes
          )
        : 0;
    
    const dueForReview = vocabList.filter(v => v.nextReview <= now).length;
    
    return {
        totalVocabStudied,
        averageMastery,
        totalQuizzes,
        averageQuizScore,
        streak: progress.streak,
        dueForReview,
    };
}

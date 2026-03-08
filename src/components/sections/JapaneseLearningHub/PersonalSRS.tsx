import { useState, useEffect } from 'react';
import classNames from 'classnames';

interface SRSWord {
  id: string;
  kanji: string;
  hiragana: string;
  meaning: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  lastReviewed?: number;
  interval: number;
  easeFactor: number;
}

interface ExerciseQuestion {
  id: string;
  type: 'meaning' | 'reading' | 'writing';
  word: SRSWord;
  options?: SRSWord[];
}

const STORAGE_KEY = 'personal_srs_words';

export default function PersonalSRS() {
  const [words, setWords] = useState<SRSWord[]>([]);
  const [newKanji, setNewKanji] = useState('');
  const [newHiragana, setNewHiragana] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercises, setExercises] = useState<ExerciseQuestion[]>([]);
  const [showExercise, setShowExercise] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // Load words from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWords(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading SRS words:', e);
      }
    }
  }, []);

  // Save words to localStorage whenever they change
  useEffect(() => {
    if (words.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    }
  }, [words]);

  const addWord = () => {
    if (!newKanji.trim() || !newMeaning.trim()) return;

    const newWord: SRSWord = {
      id: Date.now().toString(),
      kanji: newKanji,
      hiragana: newHiragana,
      meaning: newMeaning,
      difficulty,
      interval: 1,
      easeFactor: 2.5,
    };

    setWords([...words, newWord]);
    setNewKanji('');
    setNewHiragana('');
    setNewMeaning('');
    setDifficulty(3);
  };

  const deleteWord = (id: string) => {
    setWords(words.filter(w => w.id !== id));
  };

  const generateExercises = () => {
    if (words.length === 0) return;

    const questionTypes: ('meaning' | 'reading' | 'writing')[] = ['meaning', 'reading', 'writing'];
    const generated: ExerciseQuestion[] = [];

    for (let i = 0; i < Math.min(5, words.length); i++) {
      const word = words[i];
      const type = questionTypes[i % 3];
      
      // Generate multiple choice options
      const otherWords = words.filter(w => w.id !== word.id);
      if (otherWords.length === 0) continue; // Skip if no other words for options
      const options = [word, ...otherWords.sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5).filter((opt) => opt && opt.id);

      generated.push({
        id: `${word.id}-${i}`,
        type,
        word,
        options,
      });
    }

    setExercises(generated);
    setCurrentExerciseIndex(0);
    setShowExercise(true);
    setScore(0);
    setTotalAnswered(0);
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScore(score + 1);
    }
    setTotalAnswered(totalAnswered + 1);
    setShowAnswer(false);
    setUserAnswer('');

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      setTimeout(() => {
        alert(`Exercise Complete! Score: ${score + (correct ? 1 : 0)}/${exercises.length}`);
        setShowExercise(false);
      }, 500);
    }
  };

  const currentQuestion = exercises[currentExerciseIndex];

  if (showExercise && currentQuestion) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-slate-800/50 rounded-lg border border-purple-500/30 p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-indigo-300">
              Question {currentExerciseIndex + 1}/{exercises.length}
            </h4>
            <div className="text-sm text-slate-400">Score: {score}/{totalAnswered}</div>
          </div>

          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-indigo-500/30">
            {currentQuestion.type === 'meaning' && (
              <div>
                <p className="text-sm text-slate-400 mb-2">What does this mean?</p>
                <p className="text-2xl font-bold text-pink-400">{currentQuestion.word.kanji}</p>
              </div>
            )}
            {currentQuestion.type === 'reading' && (
              <div>
                <p className="text-sm text-slate-400 mb-2">What is the reading?</p>
                <p className="text-2xl font-bold text-cyan-400">{currentQuestion.word.meaning}</p>
              </div>
            )}
            {currentQuestion.type === 'writing' && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Write the kanji for:</p>
                <p className="text-xl font-bold text-purple-400">{currentQuestion.word.meaning}</p>
              </div>
            )}
          </div>

          {!showAnswer ? (
            <div className="space-y-3">
              {currentQuestion.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShowAnswer(true);
                    handleAnswer(opt.id === currentQuestion.word.id);
                  }}
                  className="w-full p-3 bg-slate-700/50 border border-purple-500/30 text-slate-200 rounded hover:bg-slate-700 transition-colors text-left"
                >
                  {currentQuestion.type === 'meaning' ? opt.meaning : opt.hiragana || opt.kanji}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className={classNames(
                'p-3 rounded border',
                score + (totalAnswered - currentExerciseIndex === 0 ? 1 : 0) <= score
                  ? 'bg-green-900/20 border-green-500/30 text-green-300'
                  : 'bg-red-900/20 border-red-500/30 text-red-300'
              )}>
                {score + (totalAnswered - currentExerciseIndex === 0 ? 1 : 0) <= score ? '✓ Correct!' : '✗ Incorrect'}
              </div>
              <p className="text-sm text-slate-400">
                {currentQuestion.type === 'meaning' && `${currentQuestion.word.kanji} means "${currentQuestion.word.meaning}"`}
                {currentQuestion.type === 'reading' && `The reading is "${currentQuestion.word.hiragana}"`}
                {currentQuestion.type === 'writing' && `The kanji is "${currentQuestion.word.kanji}"`}
              </p>
              <button
                onClick={() => {
                  setShowAnswer(false);
                  if (currentExerciseIndex < exercises.length - 1) {
                    setCurrentExerciseIndex(currentExerciseIndex + 1);
                  } else {
                    alert(`Exercise Complete! Final Score: ${score}/${exercises.length}`);
                    setShowExercise(false);
                  }
                }}
                className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded hover:shadow-lg transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <h3 className="text-2xl font-bold text-pink-400">Personal SRS (Spaced Repetition)</h3>

      {/* Add Word Section */}
      <div className="max-w-2xl mx-auto bg-slate-800/50 rounded-lg border border-purple-500/30 p-6">
        <h4 className="text-lg font-bold text-indigo-300 mb-4">Add Difficult Word</h4>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Kanji/Word (e.g., 難しい)"
            value={newKanji}
            onChange={(e) => setNewKanji(e.target.value)}
            className="w-full p-3 bg-slate-700 text-white rounded border border-purple-500/30 focus:border-pink-500 outline-none"
          />
          <input
            type="text"
            placeholder="Hiragana reading (e.g., むずかしい)"
            value={newHiragana}
            onChange={(e) => setNewHiragana(e.target.value)}
            className="w-full p-3 bg-slate-700 text-white rounded border border-purple-500/30 focus:border-pink-500 outline-none"
          />
          <input
            type="text"
            placeholder="English meaning (e.g., Difficult)"
            value={newMeaning}
            onChange={(e) => setNewMeaning(e.target.value)}
            className="w-full p-3 bg-slate-700 text-white rounded border border-purple-500/30 focus:border-pink-500 outline-none"
          />
          <div className="flex gap-3 items-center">
            <label className="text-sm text-slate-400">Difficulty:</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d as 1 | 2 | 3 | 4 | 5)}
                  className={classNames(
                    'w-8 h-8 rounded text-sm font-bold transition-all',
                    difficulty === d
                      ? 'bg-pink-500 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={addWord}
            disabled={!newKanji.trim() || !newMeaning.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            Add Word
          </button>
        </div>
      </div>

      {/* Words List */}
      {words.length > 0 && (
        <div className="max-w-2xl mx-auto bg-slate-800/50 rounded-lg border border-purple-500/30 p-6">
          <h4 className="text-lg font-bold text-indigo-300 mb-4">Your Words ({words.length})</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {words.map(word => (
              <div key={word.id} className="flex justify-between items-center p-3 bg-slate-700/50 rounded border border-slate-600/50">
                <div>
                  <p className="font-bold text-purple-300">{word.kanji}</p>
                  <p className="text-sm text-slate-400">{word.hiragana} - {word.meaning}</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex gap-1">
                    {Array(word.difficulty).fill(0).map((_, i) => (
                      <span key={i} className="text-orange-400">★</span>
                    ))}
                  </div>
                  <button
                    onClick={() => deleteWord(word.id)}
                    className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Exercise Button */}
      {words.length > 0 && (
        <div className="text-center">
          <button
            onClick={generateExercises}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            📚 Generate Exercise ({words.length} words)
          </button>
        </div>
      )}

      {words.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p>No words yet. Add some difficult words to get started!</p>
        </div>
      )}
    </div>
  );
}

import { useState, ChangeEvent, FormEvent } from 'react';
import classNames from 'classnames';

interface ExampleSentence {
    japanese: string;
    english: string;
}

interface DictionaryResult {
    word: string;
    reading: string;
    meaning: string;
    partOfSpeech?: string;
    examples: ExampleSentence[];
    intonation?: string;
}

// Helper function to generate pitch accent pattern visualization
function generatePitchPattern(reading: string): string {
    // Returns a note about pitch accent - can be enhanced with actual pitch data
    // For now, returns a basic pattern indicator
    if (!reading) return '';
    
    const syllabeCount = reading.split('').filter(c => 
        'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.includes(c)
    ).length;
    
    // Common pitch patterns: 0-down (平板), N-down (尾高), 1-down (頭高), etc
    if (syllabeCount <= 2) {
        return '[Pitch accent varies - typically pattern 0 or N-down]';
    } else {
        return '[Pitch accent varies - consult native speakers for exact pattern]';
    }
}

export default function DictionarySearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<DictionaryResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            // Call our backend API route that proxies to Jisho.org
            const response = await fetch(
                `/api/dictionary?keyword=${encodeURIComponent(searchTerm)}`
            );
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to fetch from dictionary');
            }

            // Jisho API returns { meta: {...}, data: [...] }
            const results = responseData.data;
            
            if (results && results.length > 0) {
                const formattedResults: DictionaryResult[] = results.slice(0, 5).map((item: any) => {
                    // Extract pitch accent information if available
                    const reading = item.japanese?.[0]?.reading || '';
                    const intonationNote = item.pitchAccent || generatePitchPattern(reading);
                    
                    // Extract example sentences from API response (fetched from Tatoeba)
                    const exampleSentences: ExampleSentence[] = item.exampleSentences || [];
                    
                    return {
                        word: item.japanese?.[0]?.word || searchTerm,
                        reading: reading,
                        meaning: item.senses?.[0]?.english_definitions?.join(', ') || 'No definition found',
                        partOfSpeech: item.senses?.[0]?.parts_of_speech?.join(', ') || '',
                        examples: exampleSentences,
                        intonation: intonationNote
                    };
                });
                setResults(formattedResults);
            } else {
                setError('No results found. Try searching in Japanese or English.');
            }
        } catch (err) {
            console.error('Dictionary search error:', err);
            setError('Error searching dictionary. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        placeholder="Search Japanese words or romanji..."
                        className="flex-1 px-4 py-3 rounded-lg bg-slate-800 text-white placeholder-slate-400 border border-purple-500 focus:outline-none focus:border-pink-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={classNames(
                            'px-6 py-3 rounded-lg font-semibold transition-all duration-300',
                            'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
                            'hover:shadow-lg hover:shadow-purple-500/50',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'text-white'
                        )}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="text-red-400 text-center mb-4 p-3 bg-red-900/20 rounded-lg">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {results.map((result, idx) => (
                    <div
                        key={idx}
                        className="p-4 bg-slate-800/50 border border-purple-500/30 rounded-lg hover:border-pink-500/50 transition-colors"
                    >
                        <div className="flex items-baseline gap-3 mb-2">
                            <h3 className="text-xl font-bold text-pink-400">{result.word}</h3>
                            {result.reading && (
                                <p className="text-sm text-purple-300">{result.reading}</p>
                            )}
                        </div>
                        {result.intonation && (
                            <div className="mb-2 p-2 bg-indigo-900/30 rounded border border-indigo-500/30">
                                <p className="text-xs text-indigo-300 font-semibold">Intonation: {result.intonation}</p>
                            </div>
                        )}
                        <p className="text-slate-300 mb-3">{result.meaning}</p>
                        {result.partOfSpeech && (
                            <p className="text-xs text-slate-400 mb-3">Part of speech: {result.partOfSpeech}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

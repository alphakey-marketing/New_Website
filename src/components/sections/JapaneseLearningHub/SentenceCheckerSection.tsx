import classNames from 'classnames';
import { useState } from 'react';

interface GrammarCheck {
  rule: string;
  issue: string | null;
  suggestion: string;
}

const commonParticles = ['を', 'に', 'で', 'は', 'が', 'も', 'から', 'まで', 'より', 'と', 'の', 'や', 'など'];
const commonEndings = ['ます', 'ました', 'ません', 'ないです', 'ました', 'る', 'った', 'て', 'ている'];

const SentenceCheckerSection = () => {
  const [sentence, setSentence] = useState('');
  const [checks, setChecks] = useState<GrammarCheck[]>([]);
  const [translation, setTranslation] = useState('');
  const [showResults, setShowResults] = useState(false);

  const performChecks = (text: string) => {
    const results: GrammarCheck[] = [];

    // Check 1: Hiragana/Katakana/Kanji presence
    const hasHiragana = /[\u3040-\u309F]/.test(text);
    const hasKatakana = /[\u30A0-\u30FF]/.test(text);
    const hasKanji = /[\u4E00-\u9FFF]/.test(text);

    results.push({
      rule: 'Character Types',
      issue: !hasHiragana ? 'Missing hiragana (grammatical particles/verbs)' : null,
      suggestion: 'Ensure proper use of hiragana for particles and verb conjugations'
    });

    // Check 2: Sentence ending
    const endsWithEnding = commonEndings.some(ending => text.endsWith(ending));
    const endsWithPunctuation = text.endsWith('。') || text.endsWith('？');

    results.push({
      rule: 'Sentence Ending',
      issue: !endsWithEnding && !endsWithPunctuation ? 'Sentence may need a verb ending or punctuation' : null,
      suggestion: 'End with verb conjugation (ます, ました, ない, など) or punctuation (。 or ？)'
    });

    // Check 3: Particle usage - basic check
    const particleCount = commonParticles.filter(p => text.includes(p)).length;
    results.push({
      rule: 'Particles',
      issue: particleCount === 0 && text.length > 3 ? 'Consider adding particles (を, に, で, etc.)' : null,
      suggestion: 'Common particles: を (object), に (target/location), で (means/location), は (topic), が (subject)'
    });

    // Check 4: Subject-Verb structure
    const hasSubjectMarker = text.includes('は') || text.includes('が');
    results.push({
      rule: 'Subject Marking',
      issue: !hasSubjectMarker && text.length > 5 ? 'Consider marking the subject with は or が' : null,
      suggestion: 'Use は for topic or が for subject'
    });

    // Check 5: Verb conjugation pattern
    const verbPatterns = /[る|ない|ます|った|て]/;
    results.push({
      rule: 'Verb Pattern',
      issue: !verbPatterns.test(text) && text.length > 3 ? 'Sentence may lack proper verb conjugation' : null,
      suggestion: 'Ensure verbs are properly conjugated (dictionary form, -ます, -ない, etc.)'
    });

    return results;
  };

  const generateTranslation = (text: string): string => {
    if (!text) return '';

    // Simple word segmentation and basic translation hints
    const words: { [key: string]: string } = {
      'こんにちは': 'Hello',
      'ありがとう': 'Thank you',
      'さようなら': 'Goodbye',
      'すみません': 'Excuse me/Sorry',
      'はい': 'Yes',
      'いいえ': 'No',
      'わかりません': "Don't understand",
      'わかりました': 'Understood',
      'です': 'is/am/are',
      'ます': '(polite ending)',
      'ました': '(past tense)',
      'ない': 'not',
      'ません': 'not (polite)',
      'る': '(verb)',
      'た': '(past)',
      'て': '(te-form)',
      'ている': 'is doing',
    };

    let result = text;
    Object.entries(words).forEach(([jp, en]) => {
      if (text.includes(jp)) {
        result += ` [${jp}=${en}]`;
      }
    });

    // Add particle explanations
    if (text.includes('を')) result += ' [を=object marker]';
    if (text.includes('に')) result += ' [に=target/location]';
    if (text.includes('で')) result += ' [で=means/location]';
    if (text.includes('は')) result += ' [は=topic marker]';
    if (text.includes('が')) result += ' [が=subject marker]';
    if (text.includes('も')) result += ' [も=also]';
    if (text.includes('から')) result += ' [から=from/because]';
    if (text.includes('まで')) result += ' [まで=until/to]';

    return result || 'Type a Japanese sentence to analyze';
  };

  const handleCheck = () => {
    const results = performChecks(sentence);
    setChecks(results);
    setTranslation(generateTranslation(sentence));
    setShowResults(true);
  };

  const handleClear = () => {
    setSentence('');
    setChecks([]);
    setTranslation('');
    setShowResults(false);
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20 rounded-2xl border border-purple-500/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2">Sentence Checker</h2>
        <p className="text-purple-200 mb-6">Check your Japanese sentences for grammar, particles, and get translations</p>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-6">
            <label className="block text-sm font-semibold text-purple-200 mb-3">Enter your Japanese sentence</label>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="例: 私は学生です。(Example: I am a student.)"
              className="w-full h-24 bg-slate-800 border border-purple-400/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 font-medium text-lg"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCheck}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Check Sentence
              </button>
              <button
                onClick={handleClear}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Results Section */}
          {showResults && (
            <div className="space-y-4 animate-fadeIn">
              {/* Grammar Checks */}
              <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-200 mb-4">Grammar Analysis</h3>
                <div className="space-y-3">
                  {checks.map((check, idx) => (
                    <div
                      key={idx}
                      className={classNames(
                        'border-l-4 rounded p-4',
                        check.issue
                          ? 'border-yellow-500 bg-yellow-900/20'
                          : 'border-green-500 bg-green-900/20'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={classNames(
                          'text-sm font-bold',
                          check.issue ? 'text-yellow-300' : 'text-green-300'
                        )}>
                          {check.issue ? '⚠️' : '✓'} {check.rule}
                        </span>
                      </div>
                      {check.issue && (
                        <p className="text-yellow-200 text-sm mb-2">{check.issue}</p>
                      )}
                      <p className="text-purple-200 text-sm">{check.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Translation Help */}
              <div className="bg-slate-900/50 border border-indigo-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-indigo-200 mb-3">Translation & Breakdown</h3>
                <div className="bg-slate-800/50 border border-indigo-400/30 rounded p-4">
                  <p className="text-white break-words text-sm leading-relaxed font-mono">
                    {translation || 'Your sentence analysis will appear here'}
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  <strong>💡 Tip:</strong> Check the particles (を, に, で, は, が) to ensure proper sentence structure.
                  Particles are crucial in Japanese grammar!
                </p>
              </div>
            </div>
          )}

          {/* Helper Info */}
          {!showResults && sentence && (
            <div className="bg-slate-900/50 border border-slate-500/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm">Click &quot;Check Sentence&quot; to analyze your input →</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SentenceCheckerSection;

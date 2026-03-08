import classNames from 'classnames';
import { useState } from 'react';

interface GrammarCheck {
  rule: string;
  issue: string | null;
  suggestion: string;
}

const commonParticles = ['を', 'に', 'で', 'は', 'が', 'も', 'から', 'まで', 'より', 'と', 'の', 'や', 'など'];
const commonEndings = ['ます', 'ました', 'ません', 'ないです', 'ました', 'る', 'った', 'て', 'ている'];

const SentenceCheckerSectionZh = () => {
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
      rule: '字符類型',
      issue: !hasHiragana ? '缺少平假名（語法助詞/動詞）' : null,
      suggestion: '確保正確使用平假名作為助詞和動詞變化'
    });

    // Check 2: Sentence ending
    const endsWithEnding = commonEndings.some(ending => text.endsWith(ending));
    const endsWithPunctuation = text.endsWith('。') || text.endsWith('？');

    results.push({
      rule: '句子結尾',
      issue: !endsWithEnding && !endsWithPunctuation ? '句子可能需要動詞結尾或標點符號' : null,
      suggestion: '以動詞變化結尾（ます、ました、ない等）或標點符號（。或？）'
    });

    // Check 3: Particle usage - basic check
    const particleCount = commonParticles.filter(p => text.includes(p)).length;
    results.push({
      rule: '助詞',
      issue: particleCount === 0 && text.length > 3 ? '考慮添加助詞（を、に、で等）' : null,
      suggestion: '常見助詞：を（賓語）、に（目標/位置）、で（手段/位置）、は（主題）、が（主語）'
    });

    // Check 4: Subject-Verb structure
    const hasSubjectMarker = text.includes('は') || text.includes('が');
    results.push({
      rule: '主語標記',
      issue: !hasSubjectMarker && text.length > 5 ? '考慮用は或が標記主語' : null,
      suggestion: '用は標記主題或用が標記主語'
    });

    // Check 5: Verb conjugation pattern
    const verbPatterns = /[る|ない|ます|った|て]/;
    results.push({
      rule: '動詞變化',
      issue: !verbPatterns.test(text) && text.length > 3 ? '句子可能缺少適當的動詞變化' : null,
      suggestion: '確保動詞正確變化（字典形式、-ます、-ない等）'
    });

    return results;
  };

  const generateTranslation = (text: string): string => {
    if (!text) return '';

    // Simple word segmentation and basic translation hints
    const words: { [key: string]: string } = {
      'こんにちは': '你好',
      'ありがとう': '謝謝',
      'さようなら': '再見',
      'すみません': '對不起/麻煩您',
      'はい': '是',
      'いいえ': '否',
      'わかりません': '我不明白',
      'わかりました': '明白了',
      'です': '是/存在',
      'ます': '（敬禮形式結尾）',
      'ました': '（過去式）',
      'ない': '不',
      'ません': '不（敬禮形式）',
      'る': '（動詞）',
      'た': '（過去式）',
      'て': '（て形）',
      'ている': '正在做',
    };

    let result = text;
    Object.entries(words).forEach(([jp, zh]) => {
      if (text.includes(jp)) {
        result += ` [${jp}=${zh}]`;
      }
    });

    // Add particle explanations
    if (text.includes('を')) result += ' [を=賓語標記]';
    if (text.includes('に')) result += ' [に=目標/位置]';
    if (text.includes('で')) result += ' [で=手段/位置]';
    if (text.includes('は')) result += ' [は=主題標記]';
    if (text.includes('が')) result += ' [が=主語標記]';
    if (text.includes('も')) result += ' [も=也]';
    if (text.includes('から')) result += ' [から=從/因為]';
    if (text.includes('まで')) result += ' [まで=到/直到]';

    return result || '輸入日語句子進行分析';
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
        <h2 className="text-3xl font-bold text-white mb-2">句子檢查器</h2>
        <p className="text-purple-200 mb-6">檢查您的日語句子是否有語法錯誤、助詞使用和翻譯</p>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-6">
            <label className="block text-sm font-semibold text-purple-200 mb-3">輸入您的日語句子</label>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="例: 私は学生です。(例：我是學生。)"
              className="w-full h-24 bg-slate-800 border border-purple-400/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 font-medium text-lg"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCheck}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                檢查句子
              </button>
              <button
                onClick={handleClear}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                清除
              </button>
            </div>
          </div>

          {/* Results Section */}
          {showResults && (
            <div className="space-y-4 animate-fadeIn">
              {/* Grammar Checks */}
              <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-200 mb-4">語法分析</h3>
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
                <h3 className="text-xl font-bold text-indigo-200 mb-3">翻譯與分解</h3>
                <div className="bg-slate-800/50 border border-indigo-400/30 rounded p-4">
                  <p className="text-white break-words text-sm leading-relaxed font-mono">
                    {translation || '您的句子分析將顯示在此處'}
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  <strong>💡 提示：</strong>檢查助詞（を、に、で、は、が）確保句子結構正確。助詞在日語語法中很重要！
                </p>
              </div>
            </div>
          )}

          {/* Helper Info */}
          {!showResults && sentence && (
            <div className="bg-slate-900/50 border border-slate-500/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm">點擊「檢查句子」分析您的輸入 →</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SentenceCheckerSectionZh;

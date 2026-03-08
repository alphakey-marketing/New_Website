import { useState } from 'react';
import classNames from 'classnames';

interface RomanizationMap {
    [key: string]: string;
}

const hiraganaMap: RomanizationMap = {
    'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
    'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
    'sa': 'さ', 'si': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
    'ta': 'た', 'ti': 'ち', 'tu': 'つ', 'te': 'て', 'to': 'と',
    'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
    'ha': 'は', 'hi': 'ひ', 'hu': 'ふ', 'he': 'へ', 'ho': 'ほ',
    'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
    'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
    'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
    'wa': 'わ', 'wi': 'ゐ', 'we': 'ゑ', 'wo': 'を', 'n': 'ん',
    'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
    'za': 'ざ', 'zi': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
    'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
    'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
    'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
    'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ',
    'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ',
    'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
};

const katakanaMap: RomanizationMap = {
    'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ',
    'ka': 'カ', 'ki': 'キ', 'ku': 'ク', 'ke': 'ケ', 'ko': 'コ',
    'sa': 'サ', 'si': 'シ', 'su': 'ス', 'se': 'セ', 'so': 'ソ',
    'ta': 'タ', 'ti': 'チ', 'tu': 'ツ', 'te': 'テ', 'to': 'ト',
    'na': 'ナ', 'ni': 'ニ', 'nu': 'ヌ', 'ne': 'ネ', 'no': 'ノ',
    'ha': 'ハ', 'hi': 'ヒ', 'hu': 'フ', 'he': 'ヘ', 'ho': 'ホ',
    'ma': 'マ', 'mi': 'ミ', 'mu': 'ム', 'me': 'メ', 'mo': 'モ',
    'ya': 'ヤ', 'yu': 'ユ', 'yo': 'ヨ',
    'ra': 'ラ', 'ri': 'リ', 'ru': 'ル', 're': 'レ', 'ro': 'ロ',
    'wa': 'ワ', 'wi': 'ヰ', 'we': 'ヱ', 'wo': 'ヲ', 'n': 'ン',
};

export default function TypeJapaneseInputSectionZh() {
    const [romanInput, setRomanInput] = useState('');
    const [outputType, setOutputType] = useState<'hiragana' | 'katakana'>('hiragana');

    const romanizeToJapanese = (text: string, map: RomanizationMap): string => {
        let result = '';
        let i = 0;
        while (i < text.length) {
            let matched = false;
            for (let length = 3; length > 0; length--) {
                const substring = text.substring(i, i + length);
                if (map[substring]) {
                    result += map[substring];
                    i += length;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                result += text[i];
                i++;
            }
        }
        return result;
    };

    const handleConvert = () => {
        const map = outputType === 'hiragana' ? hiraganaMap : katakanaMap;
        return romanizeToJapanese(romanInput.toLowerCase(), map);
    };

    const converted = handleConvert();

    return (
        <div className="w-full space-y-8">
            <h3 className="text-2xl font-bold mb-6 text-pink-400">打字日文輸入 (ローマ字入力)</h3>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Input Section */}
                <div className="p-6 bg-slate-800/50 rounded-lg border border-purple-500/30">
                    <h4 className="text-lg font-bold text-indigo-300 mb-4">羅馬字輸入</h4>
                    
                    <div className="space-y-4">
                        <textarea
                            value={romanInput}
                            onChange={(e) => setRomanInput(e.target.value)}
                            placeholder="輸入羅馬字日文 (例如：'konnichiha')"
                            className="w-full p-4 bg-slate-700 text-white rounded-lg border border-purple-500/50 focus:border-pink-500 focus:outline-none resize-none"
                            rows={3}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setOutputType('hiragana')}
                                className={classNames(
                                    'flex-1 py-2 rounded-lg font-semibold transition-all',
                                    outputType === 'hiragana'
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                )}
                            >
                                ひらがな (平假名)
                            </button>
                            <button
                                onClick={() => setOutputType('katakana')}
                                className={classNames(
                                    'flex-1 py-2 rounded-lg font-semibold transition-all',
                                    outputType === 'katakana'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                )}
                            >
                                カタカナ (片假名)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Section */}
                {romanInput && (
                    <div className="p-6 bg-slate-800/50 rounded-lg border border-green-500/30">
                        <h4 className="text-lg font-bold text-green-400 mb-4">轉換結果</h4>
                        <div className="p-4 bg-slate-700/50 rounded border border-green-500/50">
                            <p className="text-4xl font-bold text-green-300 text-center">{converted}</p>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(converted);
                                alert('已複製到剪貼板！');
                            }}
                            className="w-full mt-4 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-all border border-green-500/50"
                        >
                            📋 複製
                        </button>
                    </div>
                )}

                <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
                    <p className="text-sm text-indigo-300">
                        <span className="font-semibold">💡 提示：</span>輸入羅馬字日文，立即看到它轉換為平假名或片假名。這幫助您練習識別日文字符模式。
                    </p>
                </div>
            </div>
        </div>
    );
}

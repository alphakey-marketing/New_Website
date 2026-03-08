import { useState, ReactElement } from 'react';
import classNames from 'classnames';
import { synthesizeJapaneseSpeech } from '@/utils/ttsClient';

interface ListeningParagraph {
    id: number;
    title: string;
    titleZh: string;
    japanese: string;
    japaneseKanji: string;
    romaji: string;
    english: string;
    chinese: string;
    difficulty: 'N5' | 'N4' | 'N3';
    tips: string;
    tipsZh: string;
}

const RubyText = ({ text }: { text: string }) => {
    const parts: (ReactElement | string)[] = [];
    let i = 0;
    while (i < text.length) {
        if (text[i] === '{' && text.indexOf('}', i) > i) {
            const end = text.indexOf('}', i);
            const content = text.slice(i + 1, end);
            const [kanji, furigana] = content.split('|');
            parts.push(
                <ruby key={`ruby-${i}`} className="group relative">
                    {kanji}
                    <rt className="text-xs">{furigana}</rt>
                </ruby>
            );
            i = end + 1;
        } else {
            let j = i;
            while (j < text.length && text[j] !== '{') j++;
            if (j > i) parts.push(text.slice(i, j));
            i = j;
        }
    }
    return <>{parts}</>;
};

const listeningParagraphs: ListeningParagraph[] = [
    {
        id: 1,
        title: 'My Daily Routine',
        titleZh: '我的日常生活',
        japanese: 'わたしは まいにち あさ ろくじに おきます。あさごはんを たべて、しちじに いえを でます。でんしゃで かいしゃに いきます。しごとは くじから ごじまでです。よる、うちに かえって、ばんごはんを たべます。じゅういちじに ねます。',
        japaneseKanji: '{私|わたし}は {毎日|まいにち} {朝|あさ} {六時|ろくじ}に {起きます|おきます}。{朝御飯|あさごはん}を {食べて|たべて}、{七時|しちじ}に {家|いえ}を {出ます|でます}。{電車|でんしゃ}で {会社|かいしゃ}に {行きます|いきます}。{仕事|しごと}は {九時|くじ}から {五時|ごじ}までです。{夜|よる}、{家|うち}に {帰って|かえって}、{晩御飯|ばんごはん}を {食べます|たべます}。{十一時|じゅういちじ}に {寝ます|ねます}。',
        romaji: 'Watashi wa mainichi asa rokuji ni okimasu. Asagohan wo tabete, shichiji ni ie wo demasu. Densha de kaisha ni ikimasu. Shigoto wa kuji kara goji made desu. Yoru, uchi ni kaette, bangohan wo tabemasu. Juuichiji ni nemasu.',
        english: 'I wake up at 6 AM every day. After eating breakfast, I leave home at 7. I go to work by train. Work is from 9 to 5. In the evening, I return home and eat dinner. I go to sleep at 11.',
        chinese: '我每天早上六點起床。吃完早餐後，七點離開家。我搭電車去公司。工作時間是九點到五點。晚上回家吃晚餐。十一點睡覺。',
        difficulty: 'N5',
        tips: 'Focus on time expressions (ろくじ, しちじ, くじ) and daily verbs (おきます, たべます, ねます).',
        tipsZh: '注意時間表達（ろくじ、しちじ、くじ）和日常動詞（おきます、たべます、ねます）。',
    },
    {
        id: 2,
        title: 'At the Restaurant',
        titleZh: '在餐廳',
        japanese: 'きょう、ともだちと レストランに いきました。わたしは ラーメンを ちゅうもんしました。ともだちは すしを たべました。りょうりは とても おいしかったです。みせの ひとは しんせつでした。また いきたいです。',
        japaneseKanji: '{今日|きょう}、{友達|ともだち}と レストランに {行きました|いきました}。{私|わたし}は ラーメンを {注文|ちゅうもん}しました。{友達|ともだち}は すしを {食べました|たべました}。{料理|りょうり}は とても {美味しかった|おいしかった}です。{店|みせ}の {人|ひと}は {親切|しんせつ}でした。また {行きたい|いきたい}です。',
        romaji: 'Kyou, tomodachi to resutoran ni ikimashita. Watashi wa raamen wo chuumon shimashita. Tomodachi wa sushi wo tabemashita. Ryouri wa totemo oishikatta desu. Mise no hito wa shinsetsu deshita. Mata ikitai desu.',
        english: 'Today, I went to a restaurant with a friend. I ordered ramen. My friend ate sushi. The food was very delicious. The staff were kind. I want to go again.',
        chinese: '今天我和朋友去了餐廳。我點了拉麵。朋友吃了壽司。料理非常好吃。店員很親切。我想再去。',
        difficulty: 'N5',
        tips: 'Notice past tense verbs (いきました, たべました) and adjectives (おいしかったです, しんせつでした).',
        tipsZh: '注意過去式動詞（いきました、たべました）和形容詞（おいしかったです、しんせつでした）。',
    },
    {
        id: 3,
        title: 'Weekend Plans',
        titleZh: '週末計劃',
        japanese: 'こんしゅうまつ、かぞくと こうえんに いく つもりです。てんきが いいから、ピクニックを します。おべんとうを つくって、いっしょに たべます。こどもたちは ボールで あそびます。たのしみです。',
        japaneseKanji: '{今週末|こんしゅうまつ}、{家族|かぞく}と {公園|こうえん}に {行く|いく} {つもり|つもり}です。{天気|てんき}が いいから、ピクニックを します。{弁当|おべんとう}を {作って|つくって}、{一緒|いっしょ}に {食べます|たべます}。{子供|こども}たちは ボールで {遊びます|あそびます}。{楽しみ|たのしみ}です。',
        romaji: 'Konshuumatsu, kazoku to kouen ni iku tsumori desu. Tenki ga ii kara, pikunikku wo shimasu. Obentou wo tsukutte, issho ni tabemasu. Kodomotachi wa booru de asobimasu. Tanoshimi desu.',
        english: 'This weekend, I plan to go to the park with my family. Since the weather is good, we will have a picnic. We will make bento and eat together. The children will play with a ball. I am looking forward to it.',
        chinese: '這個週末，我打算和家人去公園。因為天氣好，我們會去野餐。我們會做便當一起吃。孩子們會玩球。我很期待。',
        difficulty: 'N5',
        tips: 'Practice ～つもりです (intention), ～から (reason), and て-form connections (つくって → たべます).',
        tipsZh: '練習～つもりです（打算）、～から（原因）和て形連接（つくって → たべます）。',
    },
];

interface ListeningSectionProps {
    language?: 'en' | 'zh';
}

const labels = {
    en: {
        title: 'Listening Practice (リスニング)',
        subtitle: 'Practice listening and shadow speaking with N5 paragraphs',
        playAll: 'Play All',
        stop: 'Stop',
        showText: 'Show Japanese',
        hideText: 'Hide Japanese',
        showRomaji: 'Show Romaji',
        hideRomaji: 'Hide Romaji',
        translation: 'Translation',
        tips: 'Practice Tips',
        shadowTip: 'Shadow Speaking: Listen first, then repeat along with the audio. Try to match the rhythm and intonation.',
        speed: 'Speed',
        slow: 'Slow',
        normal: 'Normal',
    },
    zh: {
        title: '聽力練習 (リスニング)',
        subtitle: '用N5段落練習聽力和跟讀',
        playAll: '播放全部',
        stop: '停止',
        showText: '顯示日文',
        hideText: '隱藏日文',
        showRomaji: '顯示羅馬字',
        hideRomaji: '隱藏羅馬字',
        translation: '翻譯',
        tips: '練習提示',
        shadowTip: '跟讀練習：先聽一遍，然後跟著音頻重複。盡量配合節奏和語調。',
        speed: '速度',
        slow: '慢速',
        normal: '正常',
    },
};

export default function ListeningSection({ language = 'en' }: ListeningSectionProps) {
    const [currentPlaying, setCurrentPlaying] = useState<number | null>(null);
    const [showText, setShowText] = useState<Record<number, boolean>>({});
    const [showRomaji, setShowRomaji] = useState<Record<number, boolean>>({});
    
    const t = labels[language];

    const speak = (text: string, id: number) => {
        setCurrentPlaying(id);
        synthesizeJapaneseSpeech(
            text,
            undefined,
            () => setCurrentPlaying(null)
        );
    };

    const stopSpeaking = () => {
        setCurrentPlaying(null);
    };

    const toggleText = (id: number) => {
        setShowText(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleRomaji = (id: number) => {
        setShowRomaji(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="w-full space-y-6">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-pink-400 mb-2">{t.title}</h3>
                <p className="text-slate-400">{t.subtitle}</p>
            </div>

            <div className="p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/30 mb-6">
                <p className="text-sm text-indigo-300">
                    <span className="font-semibold">🎧 {t.shadowTip}</span>
                </p>
            </div>

            <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30 mb-6">
                <p className="text-sm text-green-300">
                    ✓ {language === 'zh' ? '雲端文本轉語音已啟用' : 'Cloud-based text-to-speech enabled'}
                </p>
            </div>

            <div className="space-y-6">
                {listeningParagraphs.map((paragraph) => (
                    <div
                        key={paragraph.id}
                        className="p-6 bg-slate-800/50 rounded-lg border border-purple-500/30"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-lg font-bold text-white">
                                    {language === 'zh' ? paragraph.titleZh : paragraph.title}
                                </h4>
                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                                    {paragraph.difficulty}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {currentPlaying === paragraph.id ? (
                                    <button
                                        onClick={stopSpeaking}
                                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/50 hover:bg-red-500/30 transition-all flex items-center gap-2"
                                    >
                                        ⏹ {t.stop}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => speak(paragraph.japanese, paragraph.id)}
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                                    >
                                        🔊 {t.playAll}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex gap-2 mb-3">
                                <button
                                    onClick={() => toggleText(paragraph.id)}
                                    className="px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-all"
                                >
                                    {showText[paragraph.id] ? t.hideText : t.showText}
                                </button>
                                <button
                                    onClick={() => toggleRomaji(paragraph.id)}
                                    className="px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-all"
                                >
                                    {showRomaji[paragraph.id] ? t.hideRomaji : t.showRomaji}
                                </button>
                            </div>

                            {showText[paragraph.id] && (
                                <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
                                    <p className="text-lg text-white leading-relaxed font-japanese">
                                        <RubyText text={paragraph.japaneseKanji} />
                                    </p>
                                </div>
                            )}

                            {showRomaji[paragraph.id] && (
                                <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700">
                                    <p className="text-sm text-slate-400 italic">
                                        {paragraph.romaji}
                                    </p>
                                </div>
                            )}

                            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                                <p className="text-xs text-blue-400 mb-1 font-semibold">{t.translation}:</p>
                                <p className="text-sm text-slate-300">
                                    {language === 'zh' ? paragraph.chinese : paragraph.english}
                                </p>
                            </div>

                            <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-500/20">
                                <p className="text-xs text-amber-400 mb-1 font-semibold">💡 {t.tips}:</p>
                                <p className="text-sm text-slate-300">
                                    {language === 'zh' ? paragraph.tipsZh : paragraph.tips}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

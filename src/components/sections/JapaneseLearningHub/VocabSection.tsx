import classNames from 'classnames';
import { useState } from 'react';

const vocabCategories = [
    {
        name: 'I-Adjectives (い形容詞)',
        icon: '✨',
        description: 'N5 adjectives describing qualities',
        items: [
            { kanji: '新しい', hiragana: 'あたらしい', meaning: 'New', example: '新しい本です。' },
            { kanji: '古い', hiragana: 'ふるい', meaning: 'Old', example: 'これは古い本です。' },
            { kanji: '大きい', hiragana: 'おおきい', meaning: 'Big', example: '大きい家です。' },
            { kanji: '小さい', hiragana: 'ちいさい', meaning: 'Small', example: '小さい犬ですね。' },
            { kanji: '高い', hiragana: 'たかい', meaning: 'Tall/Expensive', example: 'この山は高いです。' },
            { kanji: '低い', hiragana: 'ひくい', meaning: 'Low/Short', example: 'その木は低いです。' },
            { kanji: '長い', hiragana: 'ながい', meaning: 'Long', example: 'この川は長いです。' },
            { kanji: '短い', hiragana: 'みじかい', meaning: 'Short', example: '髪が短いです。' },
            { kanji: '美しい', hiragana: 'うつくしい', meaning: 'Beautiful', example: 'その花は美しいです。' },
            { kanji: '寒い', hiragana: 'さむい', meaning: 'Cold', example: '今日は寒いですね。' },
            { kanji: '暖かい', hiragana: 'あたたかい', meaning: 'Warm', example: '春は暖かいです。' },
            { kanji: '涼しい', hiragana: 'すずしい', meaning: 'Cool', example: '秋は涼しいです。' },
            { kanji: '広い', hiragana: 'ひろい', meaning: 'Wide/spacious', example: 'この部屋は広いです。' },
            { kanji: '狭い', hiragana: 'せまい', meaning: 'Narrow', example: 'その部屋は狭いです。' },
            { kanji: '深い', hiragana: 'ふかい', meaning: 'Deep', example: 'この池は深いです。' },
            { kanji: '浅い', hiragana: 'あさい', meaning: 'Shallow', example: 'その川は浅いです。' },
            { kanji: '重い', hiragana: 'おもい', meaning: 'Heavy', example: 'この荷物は重いです。' },
            { kanji: '軽い', hiragana: 'かるい', meaning: 'Light', example: 'このかばんは軽いです。' },
            { kanji: '速い', hiragana: 'はやい', meaning: 'Fast', example: 'この電車は速いです。' },
            { kanji: '遅い', hiragana: 'おそい', meaning: 'Slow', example: 'そのバスは遅いです。' },
            { kanji: '近い', hiragana: 'ちかい', meaning: 'Near', example: '駅は近いです。' },
            { kanji: '遠い', hiragana: 'とおい', meaning: 'Far', example: 'その場所は遠いです。' },
            { kanji: '安い', hiragana: 'やすい', meaning: 'Cheap', example: 'この服は安いです。' },
            { kanji: '美味しい', hiragana: 'おいしい', meaning: 'Delicious', example: 'この料理は美味しいです。' },
            { kanji: '難しい', hiragana: 'むずかしい', meaning: 'Difficult', example: 'この漢字は難しいです。' },
            { kanji: '危ない', hiragana: 'あぶない', meaning: 'Dangerous', example: '交差点は危ないです。' },
            { kanji: '赤い', hiragana: 'あかい', meaning: 'Red', example: 'その花は赤いです。' },
            { kanji: '明るい', hiragana: 'あかるい', meaning: 'Bright', example: '部屋が明るいですね。' },
            { kanji: '甘い', hiragana: 'あまい', meaning: 'Sweet', example: 'このお菓子は甘いです。' },
            { kanji: '青い', hiragana: 'あおい', meaning: 'Blue', example: '空は青いです。' },
            { kanji: '熱い', hiragana: 'あつい', meaning: 'Hot (temperature)', example: 'お風呂が熱いです。' },
            { kanji: '厚い', hiragana: 'あつい', meaning: 'Thick', example: 'この本は厚いです。' },
            { kanji: '暑い', hiragana: 'あつい', meaning: 'Hot (weather)', example: '夏は暑いですね。' },
            { kanji: '太い', hiragana: 'ふとい', meaning: 'Fat/Thick', example: 'その木は太いです。' },
            { kanji: '早い', hiragana: 'はやい', meaning: 'Early', example: '朝早いです。' },
            { kanji: '忙しい', hiragana: 'いそがしい', meaning: 'Busy', example: '今週は忙しいです。' },
            { kanji: '痛い', hiragana: 'いたい', meaning: 'Painful', example: '頭が痛いです。' },
            { kanji: '欲しい', hiragana: 'ほしい', meaning: 'Want', example: 'その本が欲しいです。' },
            { kanji: '細い', hiragana: 'ほそい', meaning: 'Thin/Slender', example: 'その人は細いです。' },
            { kanji: '可愛い', hiragana: 'かわいい', meaning: 'Cute', example: 'その子は可愛いですね。' },
            { kanji: '辛い', hiragana: 'からい', meaning: 'Spicy', example: 'このカレーは辛いです。' },
        ],
    },
    {
        name: 'Na-Adjectives (な形容詞)',
        icon: '🎨',
        description: 'N5 adjectives that use な when modifying nouns',
        items: [
            { kanji: '綺麗', hiragana: 'きれい', meaning: 'Beautiful/Clean', example: '綺麗な花です。' },
            { kanji: '有名', hiragana: 'ゆうめい', meaning: 'Famous', example: 'あの人は有名です。' },
            { kanji: '簡単', hiragana: 'かんたん', meaning: 'Easy', example: 'これは簡単な問題です。' },
            { kanji: '複雑', hiragana: 'ふくざつ', meaning: 'Complicated', example: 'この問題は複雑です。' },
            { kanji: '便利', hiragana: 'べんり', meaning: 'Convenient', example: 'この場所は便利です。' },
            { kanji: '得意', hiragana: 'とくい', meaning: 'Good at', example: '私は日本語が得意です。' },
            { kanji: '不得意', hiragana: 'ふとくい', meaning: 'Bad at', example: '計算が不得意です。' },
            { kanji: '真面目', hiragana: 'まじめ', meaning: 'Serious/Diligent', example: '真面目な学生です。' },
            { kanji: 'いい加減', hiragana: 'いいかげん', meaning: 'Careless', example: 'いい加減な態度です。' },
            { kanji: '親切', hiragana: 'しんせつ', meaning: 'Kind', example: 'あの先生は親切です。' },
            { kanji: '丁寧', hiragana: 'ていねい', meaning: 'Polite', example: '丁寧な説明です。' },
            { kanji: '静か', hiragana: 'しずか', meaning: 'Quiet', example: 'この図書館は静かです。' },
            { kanji: 'にぎやか', hiragana: 'にぎやか', meaning: 'Lively', example: 'にぎやかな街です。' },
            { kanji: '穏やか', hiragana: 'おだやか', meaning: 'Calm', example: '穏やかな天気ですね。' },
            { kanji: '元気', hiragana: 'げんき', meaning: 'Energetic/Healthy', example: '元気な子どもです。' },
            { kanji: '素敵', hiragana: 'すてき', meaning: 'Wonderful', example: '素敵なドレスですね。' },
            { kanji: '自由', hiragana: 'じゆう', meaning: 'Free', example: '自由な時間があります。' },
            { kanji: '同じ', hiragana: 'おなじ', meaning: 'Same', example: '同じ本を買いました。' },
            { kanji: '異なる', hiragana: 'ことなる', meaning: 'Different', example: '異なる意見です。' },
            { kanji: '独特', hiragana: 'どくとく', meaning: 'Unique', example: '独特なスタイルです。' },
            { kanji: '大丈夫', hiragana: 'だいじょうぶ', meaning: 'OK/Alright', example: '大丈夫ですか。' },
            { kanji: '大好き', hiragana: 'だいすき', meaning: 'Love/Like very much', example: '私はコーヒーが大好きです。' },
            { kanji: '下手', hiragana: 'へた', meaning: 'Unskillful/Bad at', example: '私は絵が下手です。' },
            { kanji: '暇', hiragana: 'ひま', meaning: 'Free time', example: '今日は暇ですよ。' },
            { kanji: '本当', hiragana: 'ほんとう', meaning: 'Truth/Real', example: 'それは本当ですか。' },
            { kanji: '色々', hiragana: 'いろいろ', meaning: 'Various', example: 'いろいろな意見があります。' },
            { kanji: '丈夫', hiragana: 'じょうぶ', meaning: 'Strong/Durable', example: 'この机は丈夫です。' },
            { kanji: '上手', hiragana: 'じょうず', meaning: 'Skillful/Good at', example: '彼は日本語が上手です。' },
            { kanji: '嫌', hiragana: 'いや', meaning: 'Unpleasant/Dislike', example: 'その味は嫌です。' },
        ],
    },
    {
        name: 'Adverbs (副詞)',
        icon: '→',
        description: 'Words that modify verbs or adjectives',
        isParent: true,
        subcategories: [
            {
                name: 'Frequency (頻度)',
                icon: '🔄',
                description: 'How often something occurs',
                items: [
                    { kanji: 'いつも', hiragana: 'いつも', meaning: 'Always', example: 'いつも朝6時に起きます。' },
                    { kanji: '大体', hiragana: 'たいてい', meaning: 'Usually', example: 'たいてい家にいます。' },
                    { kanji: '時々', hiragana: 'ときどき', meaning: 'Sometimes', example: 'ときどき映画を見ます。' },
                    { kanji: '良く', hiragana: 'よく', meaning: 'Often/Well', example: 'よく勉強します。' },
                    { kanji: '滅多に', hiragana: 'めったに', meaning: 'Rarely', example: 'めったに遊びません。' },
                    { kanji: '全く', hiragana: 'まったく', meaning: 'Not at all', example: 'まったく分かりません。' },
                ],
            },
            {
                name: 'Time (時間)',
                icon: '⏱️',
                description: 'When something happens',
                items: [
                    { kanji: 'もう', hiragana: 'もう', meaning: 'Already', example: 'もう食べました。' },
                    { kanji: 'まだ', hiragana: 'まだ', meaning: 'Not yet', example: 'まだ宿題をしていません。' },
                    { kanji: '直ぐ', hiragana: 'すぐ', meaning: 'Soon/Right away', example: 'すぐに行きます。' },
                    { kanji: '丁度', hiragana: 'ちょうど', meaning: 'Just/Exactly', example: 'ちょうど今来ました。' },
                    { kanji: '既に', hiragana: 'すでに', meaning: 'Already (formal)', example: 'すでに始まりました。' },
                    { kanji: 'やがて', hiragana: 'やがて', meaning: 'Soon/Eventually', example: 'やがて夜になります。' },
                ],
            },
            {
                name: 'Manner (様態)',
                icon: '🎯',
                description: 'How something is done',
                items: [
                    { kanji: 'ゆっくり', hiragana: 'ゆっくり', meaning: 'Slowly', example: 'ゆっくり歩きます。' },
                    { kanji: '早く', hiragana: 'はやく', meaning: 'Quickly', example: '早く走ります。' },
                    { kanji: '急いで', hiragana: 'いそいで', meaning: 'In a hurry', example: '急いで行きます。' },
                    { kanji: 'そっと', hiragana: 'そっと', meaning: 'Gently/Quietly', example: 'そっと開けます。' },
                    { kanji: 'ぐるぐる', hiragana: 'ぐるぐる', meaning: 'Around and around', example: 'ぐるぐる回ります。' },
                    { kanji: 'ばったり', hiragana: 'ばったり', meaning: 'Suddenly/Abruptly', example: 'ばったり会いました。' },
                ],
            },
            {
                name: 'Degree (程度)',
                icon: '📊',
                description: 'Level or intensity',
                items: [
                    { kanji: 'とても', hiragana: 'とても', meaning: 'Very', example: 'とても好きです。' },
                    { kanji: 'かなり', hiragana: 'かなり', meaning: 'Quite/Fairly', example: 'かなり暑いですね。' },
                    { kanji: 'ちょっと', hiragana: 'ちょっと', meaning: 'A little', example: 'ちょっと待ってください。' },
                    { kanji: '殆ど', hiragana: 'ほぼ', meaning: 'Almost', example: 'ほぼ完成しました。' },
                    { kanji: 'そこそこ', hiragana: 'そこそこ', meaning: 'Moderately', example: 'そこそこ上手です。' },
                    { kanji: 'ほんの', hiragana: 'ほんの', meaning: 'Just/Only', example: 'ほんの少しです。' },
                ],
            },
            {
                name: 'Certainty (確信)',
                icon: '💭',
                description: 'Level of certainty or probability',
                items: [
                    { kanji: 'きっと', hiragana: 'きっと', meaning: 'Surely/Definitely', example: 'きっと来ると思います。' },
                    { kanji: '多分', hiragana: 'たぶん', meaning: 'Probably', example: 'たぶん明日雨でしょう。' },
                    { kanji: 'ひょっと', hiragana: 'ひょっと', meaning: 'Perhaps/Maybe', example: 'ひょっと来るかもしれません。' },
                    { kanji: 'もしかして', hiragana: 'もしかして', meaning: 'Perhaps/Possibly', example: 'もしかして知っていますか。' },
                    { kanji: 'まさか', hiragana: 'まさか', meaning: 'Surely not', example: 'まさか本当ですか。' },
                    { kanji: 'おそらく', hiragana: 'おそらく', meaning: 'Probably', example: 'おそらく大丈夫でしょう。' },
                ],
            },
            {
                name: 'Manner/Quality (性状)',
                icon: '✨',
                description: 'State or condition of being',
                items: [
                    { kanji: 'きちんと', hiragana: 'きちんと', meaning: 'Properly/Neatly', example: 'きちんと並びます。' },
                    { kanji: 'しっかり', hiragana: 'しっかり', meaning: 'Firmly/Securely', example: 'しっかり握ります。' },
                    { kanji: 'ぼんやり', hiragana: 'ぼんやり', meaning: 'Vaguely/Dimly', example: 'ぼんやり見えます。' },
                    { kanji: 'はっきり', hiragana: 'はっきり', meaning: 'Clearly', example: 'はっきり見えます。' },
                    { kanji: 'ふんわり', hiragana: 'ふんわり', meaning: 'Softly/Fluffy', example: 'ふんわり包みます。' },
                    { kanji: 'ぴたり', hiragana: 'ぴたり', meaning: 'Exactly/Precisely', example: 'ぴたり止まります。' },
                ],
            },
            {
                name: 'Correlative (対応)',
                icon: '🔗',
                description: 'Paired adverbs expressing contrast or correspondence',
                items: [
                    { kanji: '前に', hiragana: 'まえに', meaning: 'Before/Previously', example: '前に来ました。' },
                    { kanji: '後に', hiragana: 'あとに', meaning: 'After/Later', example: '後に行きます。' },
                    { kanji: '上に', hiragana: 'うえに', meaning: 'On top/Moreover', example: 'その上に失礼です。' },
                    { kanji: '下に', hiragana: 'したに', meaning: 'Below/Under', example: 'テーブルの下にあります。' },
                    { kanji: '片方は', hiragana: 'かたほうは', meaning: 'On one hand', example: '片方は好きです。' },
                    { kanji: 'もう片方は', hiragana: 'もうかたほうは', meaning: 'On the other hand', example: 'もう片方は嫌です。' },
                    { kanji: '中に', hiragana: 'なかに', meaning: 'Inside/Within', example: '部屋の中にいます。' },
                    { kanji: '外に', hiragana: 'そとに', meaning: 'Outside/Out', example: '外に出ます。' },
                    { kanji: '左に', hiragana: 'ひだりに', meaning: 'To the left/Left side', example: '左に曲がります。' },
                    { kanji: '右に', hiragana: 'みぎに', meaning: 'To the right/Right side', example: '右に進みます。' },
                    { kanji: '隣に', hiragana: 'となりに', meaning: 'Next to/Adjacent/Beside', example: '友達が隣にいます。' },
                    { kanji: '向こうに', hiragana: 'むこうに', meaning: 'Over there/Across', example: '向こうに山があります。' },
                    { kanji: 'こちらに', hiragana: 'こちらに', meaning: 'This way/Over here', example: 'こちらに来てください。' },
                    { kanji: '奥に', hiragana: 'おくに', meaning: 'Deep inside/Back/Interior', example: '奥に隠しています。' },
                    { kanji: '手前に', hiragana: 'てまえに', meaning: 'In front/Near', example: '手前に止めてください。' },
                    { kanji: '側に', hiragana: 'がわに', meaning: 'Beside/At the side', example: '川の側に歩きます。' },
                    { kanji: '近くに', hiragana: 'ちかくに', meaning: 'Near/Close by', example: '駅の近くに住んでいます。' },
                    { kanji: '遠く', hiragana: 'とおく', meaning: 'Far away/Distant', example: '遠くに見えます。' },
                ],
            },
        ],
    },
    {
        name: 'Common Expressions (常用表現)',
        icon: '💬',
        description: 'Essential yes/no responses in polite and casual forms',
        isParent: true,
        subcategories: [
            {
                name: 'Polite (丁寧)',
                icon: '🤝',
                description: 'Formal and polite yes/no expressions',
                items: [
                    { kanji: 'はい', hiragana: 'はい', meaning: 'Yes (polite)', example: 'はい、分かりました。' },
                    { kanji: 'いいえ', hiragana: 'いいえ', meaning: 'No (polite)', example: 'いいえ、知りません。' },
                    { kanji: 'かしこまりました', hiragana: 'かしこまりました', meaning: 'Understood/Certainly (very polite)', example: 'かしこまりました、すぐにお持ちします。' },
                    { kanji: '承知しました', hiragana: 'しょうちしました', meaning: 'Understood (formal)', example: '承知しました、確認いたします。' },
                    { kanji: 'そうですね', hiragana: 'そうですね', meaning: 'That\'s right/Yes (polite agreement)', example: 'そうですね、その通りです。' },
                    { kanji: 'そうではありません', hiragana: 'そうではありません', meaning: 'That\'s not right (polite disagreement)', example: 'そうではありません、別の理由です。' },
                    { kanji: 'ありがとうございます', hiragana: 'ありがとうございます', meaning: 'Thank you very much', example: 'ありがとうございます、助かります。' },
                    { kanji: 'どういたしまして', hiragana: 'どういたしまして', meaning: 'You\'re welcome (polite)', example: 'どういたしまして、お役に立てて光栄です。' },
                ],
            },
            {
                name: 'Casual (カジュアル)',
                icon: '😊',
                description: 'Informal and casual yes/no expressions',
                items: [
                    { kanji: 'うん', hiragana: 'うん', meaning: 'Yes (casual)', example: 'うん、いいよ。' },
                    { kanji: 'ううん', hiragana: 'ううん', meaning: 'No (casual)', example: 'ううん、行かない。' },
                    { kanji: 'まじで', hiragana: 'まじで', meaning: 'Really? (casual/slang)', example: 'まじで？本当？' },
                    { kanji: 'やっぱり', hiragana: 'やっぱり', meaning: 'As I thought/After all (casual)', example: 'やっぱり、そうだった。' },
                    { kanji: 'だよね', hiragana: 'だよね', meaning: 'Right? (casual agreement)', example: 'そうだよね、楽しかった。' },
                    { kanji: 'ちゃう', hiragana: 'ちゃう', meaning: 'No/Wrong (casual)', example: 'ちゃう、違うよ。' },
                    { kanji: 'ありがとね', hiragana: 'ありがとね', meaning: 'Thanks (casual)', example: 'ありがとね、助かったよ。' },
                    { kanji: 'いいや', hiragana: 'いいや', meaning: 'Nope (casual)', example: 'いいや、今日は疲れた。' },
                ],
            },
        ],
    },
    {
        name: 'Particles (助詞)',
        icon: '◆',
        description: 'Function words that show grammatical relationships',
        items: [
            { kanji: 'は', hiragana: 'は', meaning: 'Topic particle', example: '私は学生です。' },
            { kanji: 'を', hiragana: 'を', meaning: 'Object particle', example: '本を読みます。' },
            { kanji: 'に', hiragana: 'に', meaning: 'Goal/destination particle', example: '学校に行きます。' },
            { kanji: 'へ', hiragana: 'へ', meaning: 'Direction particle', example: '公園へ行きます。' },
            { kanji: 'で', hiragana: 'で', meaning: 'Location/means particle', example: '図書館で勉強します。' },
            { kanji: 'が', hiragana: 'が', meaning: 'Subject particle', example: '誰が来ましたか。' },
            { kanji: 'の', hiragana: 'の', meaning: 'Possession particle', example: '私の本です。' },
            { kanji: 'も', hiragana: 'も', meaning: 'Also particle', example: '私も好きです。' },
            { kanji: 'か', hiragana: 'か', meaning: 'Question particle', example: '来ますか。' },
            { kanji: 'から', hiragana: 'から', meaning: 'From/because', example: '月曜日から始まります。' },
            { kanji: 'まで', hiragana: 'まで', meaning: 'Until/to', example: '5時まで待ちます。' },
            { kanji: 'や', hiragana: 'や', meaning: 'And (listing)', example: 'りんごやみかんが好きです。' },
            { kanji: 'と', hiragana: 'と', meaning: 'And/with', example: '友達と遊びます。' },
            { kanji: 'より', hiragana: 'より', meaning: 'Than/from', example: '兄より背が高いです。' },
            { kanji: '等', hiragana: 'など', meaning: 'And so on', example: '本や雑誌などが好きです。' },
            { kanji: 'ぐらい', hiragana: 'ぐらい', meaning: 'About/approximately', example: '1時間ぐらい待ちました。' },
            { kanji: 'くらい', hiragana: 'くらい', meaning: 'About/approximately', example: '2日くらい休みました。' },
            { kanji: '程', hiragana: 'ほど', meaning: 'To the extent', example: 'そんなに好きではありません。' },
            { kanji: 'だけ', hiragana: 'だけ', meaning: 'Only', example: '水だけ飲みます。' },
            { kanji: 'ぐらい', hiragana: 'ぐらい', meaning: 'About', example: '毎日3時間ぐらい勉強します。' },
        ],
    },
    {
        name: 'Katakana (カタカナ)',
        icon: 'カ',
        description: 'N5 foreign loanwords written in katakana',
        items: [
            { kanji: 'アパート', hiragana: 'あぱーと', meaning: 'Apartment', example: 'アパートに住んでいます。' },
            { kanji: 'バス', hiragana: 'ばす', meaning: 'Bus', example: 'バスに乗ります。' },
            { kanji: 'バター', hiragana: 'ばたー', meaning: 'Butter', example: 'バターを塗ります。' },
            { kanji: 'ベッド', hiragana: 'べっど', meaning: 'Bed', example: 'ベッドで寝ます。' },
            { kanji: 'ボールペン', hiragana: 'ぼーるぺん', meaning: 'Ball-point pen', example: 'ボールペンで書きます。' },
            { kanji: 'ボタン', hiragana: 'ぼたん', meaning: 'Button', example: 'ボタンをクリックします。' },
            { kanji: 'デパート', hiragana: 'でぱーと', meaning: 'Department store', example: 'デパートで買い物します。' },
            { kanji: 'ドア', hiragana: 'どあ', meaning: 'Door', example: 'ドアを開けてください。' },
            { kanji: 'エレベーター', hiragana: 'えれべーたー', meaning: 'Elevator', example: 'エレベーターで上がります。' },
            { kanji: 'フィルム', hiragana: 'ふぃるむ', meaning: 'Film', example: 'フィルムをカメラに入れます。' },
            { kanji: 'フォーク', hiragana: 'ふぉーく', meaning: 'Fork', example: 'フォークで食べます。' },
            { kanji: 'ギター', hiragana: 'ぎたー', meaning: 'Guitar', example: 'ギターを弾きます。' },
            { kanji: 'グラム', hiragana: 'ぐらむ', meaning: 'Gram', example: '100グラムです。' },
            { kanji: 'ハンカチ', hiragana: 'はんかち', meaning: 'Handkerchief', example: 'ハンカチを持っています。' },
            { kanji: 'ホテル', hiragana: 'ほてる', meaning: 'Hotel', example: 'ホテルに泊まります。' },
            { kanji: 'カメラ', hiragana: 'かめら', meaning: 'Camera', example: 'カメラで写真を撮ります。' },
            { kanji: 'カップ', hiragana: 'かっぷ', meaning: 'Cup', example: 'カップでコーヒーを飲みます。' },
            { kanji: 'カレー', hiragana: 'かれー', meaning: 'Curry', example: 'カレーを食べます。' },
            { kanji: 'カレンダー', hiragana: 'かれんだー', meaning: 'Calendar', example: 'カレンダーを見ます。' },
            { kanji: 'キログラム', hiragana: 'きろぐらむ', meaning: 'Kilogram', example: '5キログラムです。' },
            { kanji: 'キロメートル', hiragana: 'きろめーとる', meaning: 'Kilometer', example: '10キロメートル走ります。' },
            { kanji: 'コーヒー', hiragana: 'こーひー', meaning: 'Coffee', example: 'コーヒーが好きです。' },
            { kanji: 'コート', hiragana: 'こーと', meaning: 'Coat', example: 'コートを着ます。' },
            { kanji: 'コピー', hiragana: 'こぴー', meaning: 'Copy/Photocopy', example: 'コピーをします。' },
            { kanji: 'コップ', hiragana: 'こっぷ', meaning: 'Glass (drinking)', example: 'コップで水を飲みます。' },
            { kanji: 'クラス', hiragana: 'くらす', meaning: 'Class', example: 'クラスに行きます。' },
            { kanji: 'マッチ', hiragana: 'まっち', meaning: 'Match', example: 'マッチで火をつけます。' },
            { kanji: 'メートル', hiragana: 'めーとる', meaning: 'Meter', example: '2メートルです。' },
            { kanji: 'ナイフ', hiragana: 'ないふ', meaning: 'Knife', example: 'ナイフで切ります。' },
            { kanji: 'ネクタイ', hiragana: 'ねくたい', meaning: 'Necktie', example: 'ネクタイをつけます。' },
            { kanji: 'ノート', hiragana: 'のーと', meaning: 'Notebook', example: 'ノートに書きます。' },
            { kanji: 'オムレツ', hiragana: 'おむれつ', meaning: 'Omelet', example: 'オムレツを食べます。' },
            { kanji: 'オレンジ', hiragana: 'おれんじ', meaning: 'Orange', example: 'オレンジジュースを飲みます。' },
            { kanji: 'パン', hiragana: 'ぱん', meaning: 'Bread', example: 'パンを食べます。' },
            { kanji: 'パイロット', hiragana: 'ぱいろっと', meaning: 'Pilot', example: 'パイロットになりたいです。' },
            { kanji: 'ペン', hiragana: 'ぺん', meaning: 'Pen', example: 'ペンで書きます。' },
            { kanji: 'ピアノ', hiragana: 'ぴあの', meaning: 'Piano', example: 'ピアノを弾きます。' },
            { kanji: 'ピクニック', hiragana: 'ぴくにっく', meaning: 'Picnic', example: 'ピクニックに行きます。' },
            { kanji: 'プール', hiragana: 'ぷーる', meaning: 'Swimming pool', example: 'プールで泳ぎます。' },
            { kanji: 'プリンター', hiragana: 'ぷりんたー', meaning: 'Printer', example: 'プリンターで印刷します。' },
            { kanji: 'ラッパ', hiragana: 'らっぱ', meaning: 'Trumpet', example: 'ラッパを吹きます。' },
            { kanji: 'ラジオ', hiragana: 'らじお', meaning: 'Radio', example: 'ラジオを聞きます。' },
            { kanji: 'レコード', hiragana: 'れこーど', meaning: 'Record', example: 'レコードを聞きます。' },
            { kanji: 'レストラン', hiragana: 'れすとらん', meaning: 'Restaurant', example: 'レストランで食べます。' },
            { kanji: 'リング', hiragana: 'りんぐ', meaning: 'Ring', example: 'リングを売ります。' },
            { kanji: 'ルーペ', hiragana: 'るーぺ', meaning: 'Magnifying glass', example: 'ルーペで見ます。' },
            { kanji: 'ロボット', hiragana: 'ろぼっと', meaning: 'Robot', example: 'ロボットです。' },
            { kanji: 'サッカー', hiragana: 'さっかー', meaning: 'Soccer', example: 'サッカーをします。' },
            { kanji: 'サンドイッチ', hiragana: 'さんどいっち', meaning: 'Sandwich', example: 'サンドイッチを食べます。' },
            { kanji: 'シャツ', hiragana: 'しゃつ', meaning: 'Shirt', example: 'シャツを着ます。' },
            { kanji: 'スキー', hiragana: 'すきー', meaning: 'Ski', example: 'スキーをします。' },
            { kanji: 'スプーン', hiragana: 'すぷーん', meaning: 'Spoon', example: 'スプーンで食べます。' },
            { kanji: 'スーパー', hiragana: 'すーぱー', meaning: 'Supermarket', example: 'スーパーに行きます。' },
            { kanji: 'ステッキ', hiragana: 'すてっき', meaning: 'Stick/Cane', example: 'ステッキを持ちます。' },
            { kanji: 'ストップ', hiragana: 'すとっぷ', meaning: 'Stop', example: 'ストップです。' },
            { kanji: 'テーブル', hiragana: 'てーぶる', meaning: 'Table', example: 'テーブルに座ります。' },
            { kanji: 'テレビ', hiragana: 'てれび', meaning: 'Television', example: 'テレビを見ます。' },
            { kanji: 'テニス', hiragana: 'てにす', meaning: 'Tennis', example: 'テニスをします。' },
            { kanji: 'トマト', hiragana: 'とまと', meaning: 'Tomato', example: 'トマトを食べます。' },
            { kanji: 'トレーニング', hiragana: 'とれーにんぐ', meaning: 'Training', example: 'トレーニングをします。' },
        ],
    },
];

export default function VocabSection() {
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    const currentCategory = vocabCategories[selectedCategory];
    const isNounCategory = currentCategory.isParent;
    const currentItems = isNounCategory && selectedSubcategory !== null 
        ? currentCategory.subcategories![selectedSubcategory].items 
        : currentCategory.items || [];
    const currentDescription = isNounCategory && selectedSubcategory !== null
        ? currentCategory.subcategories![selectedSubcategory].description
        : currentCategory.description;

    return (
        <div className="w-full">
            <h3 className="text-2xl font-bold mb-4 text-pink-400">N5 Vocabulary (語彙)</h3>

            <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                    {vocabCategories.map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setSelectedCategory(idx);
                                setSelectedSubcategory(null);
                                setExpandedIdx(null);
                            }}
                            className={classNames(
                                'px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap',
                                selectedCategory === idx
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            )}
                        >
                            {cat.icon} {cat.name.split('(')[0].trim()}
                        </button>
                    ))}
                </div>
            </div>

            {isNounCategory && (
                <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                    <p className="text-xs font-semibold text-indigo-300 mb-3 uppercase tracking-wider">Noun Themes</p>
                    <div className="flex flex-wrap gap-2">
                        {currentCategory.subcategories?.map((subcat, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setSelectedSubcategory(idx);
                                    setExpandedIdx(null);
                                }}
                                className={classNames(
                                    'px-3 py-2 rounded text-sm font-semibold transition-all',
                                    selectedSubcategory === idx
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                                )}
                            >
                                {subcat.icon} {subcat.name.split('(')[0].trim()}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selectedSubcategory !== null || !isNounCategory ? (
                <>
                    <p className="text-sm text-slate-400 mb-6">{currentDescription}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentItems.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                                className={classNames(
                                    'p-4 rounded-lg cursor-pointer transition-all border-2',
                                    expandedIdx === idx
                                        ? 'border-pink-500 bg-slate-800/80'
                                        : 'border-purple-500/30 bg-slate-900/50 hover:border-pink-500/50'
                                )}
                            >
                                <div className="text-center mb-2">
                                    <div className="text-4xl font-bold text-pink-400">{item.kanji}</div>
                                    <div className="text-sm text-indigo-300">{item.hiragana}</div>
                                    <div className="text-lg font-semibold text-slate-100 mt-1">{item.meaning}</div>
                                </div>

                                {expandedIdx === idx && (
                                    <div className="mt-4 pt-4 border-t border-purple-500/20">
                                        <p className="text-xs text-slate-400 mb-1">Example:</p>
                                        <p className="text-sm text-slate-300">{item.example}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <p className="text-slate-400 text-center py-8">Select a noun subcategory above to view words</p>
            )}
        </div>
    );
}

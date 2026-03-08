import classNames from 'classnames';
import { useState } from 'react';

const n5GrammarTopics = [
    {
        title: 'Parts of Speech Basics',
        explanation: 'Understanding the fundamental building blocks of Japanese sentences',
        pattern: 'Nouns, Verbs, Adjectives, Particles',
        examples: [
            '猫 (noun) - cat',
            '食べます (verb) - to eat',
            '美しい (adjective) - beautiful',
            'は (particle) - topic marker',
        ],
    },
    {
        title: 'Topic & Subject with は',
        explanation: 'Use は to mark what you\'re talking about in a sentence',
        pattern: 'Topic は Description',
        examples: [
            '私は学生です。(As for me, I am a student.)',
            '猫は動物です。(As for a cat, it is an animal.)',
        ],
    },
    {
        title: 'Subject Particle が vs Topic は',
        explanation: 'が marks the grammatical subject, は marks the topic',
        pattern: 'Subject が Verb / Topic は Predicate',
        examples: [
            '誰が来ましたか？田中さんが来ました。(Who came? Tanaka came.)',
            'これが好きです。(I like this.)',
        ],
    },
    {
        title: 'Location & Context with で',
        explanation: 'Indicates where an action occurs or the material/means of doing something',
        pattern: 'Location で Verb / Material で Action',
        examples: [
            '図書館で本を読みます。(I read books at the library.)',
            'ペンで字を書きます。(I write letters with a pen.)',
        ],
    },
    {
        title: 'Possession & Description with の',
        explanation: 'Shows relationships between nouns, like possession or description',
        pattern: 'Noun A の Noun B',
        examples: [
            '私の本 (my book)',
            '日本の首都 (the capital of Japan)',
        ],
    },
    {
        title: 'Modifying Nouns with Descriptive Phrases',
        explanation: 'Adjectives and verbs can be placed before nouns to describe them',
        pattern: 'Descriptor + Noun',
        examples: [
            '新しい家 (a new house)',
            '食べている人 (a person who is eating)',
        ],
    },
    {
        title: 'Subject & Object Distinction',
        explanation: 'Understand the difference between what performs an action and what receives it',
        pattern: 'Subject は / Object を',
        examples: [
            '私は学生です。(I am a student.)',
            '私はアイスクリームを食べます。(I eat ice cream.)',
        ],
    },
    {
        title: 'Personal Pronouns & Demonstratives',
        explanation: 'Words referring to people and things, including "this," "that," "he," "she"',
        pattern: 'Person/Thing Pronoun',
        examples: [
            '私 (I), 我々 (we), 彼 (he), 彼女 (she)',
            'これ (this), それ (that), あれ (that over there)',
        ],
    },
    {
        title: 'Adjective Tenses: Present & Past',
        explanation: 'Adjectives change form to show past tense',
        pattern: 'い-adjective / Past form ending in かった',
        examples: [
            '新しい (new) / 新しかった (was new)',
            '美しい (beautiful) / 美しかった (was beautiful)',
        ],
    },
    {
        title: 'Connecting Adjectives with て-form',
        explanation: 'Link multiple adjectives or clauses using the て-form',
        pattern: 'Adjective て-form + Adjective',
        examples: [
            '大きくて白い犬 (a big and white dog)',
            '古くて小さい家 (an old and small house)',
        ],
    },
    {
        title: 'Adjectives Modifying Nouns',
        explanation: 'い-adjectives sit directly before nouns to describe them',
        pattern: 'い-adjective + Noun',
        examples: [
            '美しい花 (beautiful flower)',
            '古い本 (old book)',
            '大きい山 (big mountain)',
        ],
    },
    {
        title: 'Na-Adjectives',
        explanation: 'Adjectives that use な when modifying nouns',
        pattern: 'な-adjective + な + Noun / な-adjective + です',
        examples: [
            '綺麗な花 (beautiful flower)',
            'この車は便利です。(This car is convenient.)',
        ],
    },
    {
        title: 'Existence: ある & いる',
        explanation: 'Express existence - ある for inanimate objects, いる for living beings',
        pattern: 'Location に Object が ある/いる',
        examples: [
            'テーブルの上に本がある。(There is a book on the table.)',
            '公園に子どもがいる。(There are children in the park.)',
        ],
    },
    {
        title: 'Negative Forms: ない',
        explanation: 'Express the absence or negation of an action or quality',
        pattern: 'Verb-stem + ない / Adjective-stem + ない',
        examples: [
            '食べない (do not eat)',
            '面白くない (not interesting)',
        ],
    },
    {
        title: 'Direct Object Marker を',
        explanation: 'Marks what a verb directly acts upon in a sentence',
        pattern: 'Object を Verb',
        examples: [
            '水を飲みます。(I drink water.)',
            '本を読みます。(I read a book.)',
        ],
    },
    {
        title: 'Destination Marker へ / に',
        explanation: 'Indicate where someone or something is going or being sent',
        pattern: 'Destination へ/に Verb (go, send, etc.)',
        examples: [
            '学校へ行きます。(I go to school.)',
            '日本に旅行します。(I travel to Japan.)',
        ],
    },
    {
        title: 'Polite Forms: ます & です',
        explanation: 'Use formal, respectful language in conversations and writing',
        pattern: 'Verb-ます / Noun です',
        examples: [
            '勉強します。(I study.) [polite]',
            '私は学生です。(I am a student.) [polite]',
        ],
    },
    {
        title: 'Past Tense: た',
        explanation: 'Express past actions and completed states',
        pattern: 'Verb-た / Adjective-かった',
        examples: [
            '食べた (ate)',
            '学校に行きました。(I went to school.)',
        ],
    },
    {
        title: 'Te-Form (Middle Form)',
        explanation: 'Connect clauses, express sequential actions, or make requests',
        pattern: 'Verb-て / Adjective-くて',
        examples: [
            '学校に行って、勉強しました。(I went to school and studied.)',
            'ここに座って、待ってください。(Please sit here and wait.)',
        ],
    },
    {
        title: 'Continuous Action: ている',
        explanation: 'Express ongoing actions or states (is doing/am doing)',
        pattern: 'Verb-ている',
        examples: [
            '猫が寝ています。(The cat is sleeping.)',
            '雨が降っています。(It is raining.)',
        ],
    },
    {
        title: 'Particle と (with/and)',
        explanation: 'Indicates companionship or lists exhaustive items',
        pattern: 'Person/Thing と Verb',
        examples: [
            '友達と一緒に遊びます。(I play with my friend.)',
            'コーヒーと紅茶があります。(There is coffee and tea.)',
        ],
    },
    {
        title: 'Particle や (and/or)',
        explanation: 'Lists items as examples (not exhaustive like と)',
        pattern: 'Item や Item や...',
        examples: [
            'リンゴやみかんが好きです。(I like apples, oranges, and things like that.)',
        ],
    },
    {
        title: 'Particle も (also/too)',
        explanation: 'Indicates addition or "also" in sentences',
        pattern: 'Noun も Predicate',
        examples: [
            '私も学生です。(I am also a student.)',
            '彼も来ました。(He came too.)',
        ],
    },
    {
        title: 'Particle から (from)',
        explanation: 'Indicates source, starting point, or reason',
        pattern: 'Source から / Reason から',
        examples: [
            '東京から来ました。(I came from Tokyo.)',
            '忙しいから、行けません。(I cannot go because I am busy.)',
        ],
    },
    {
        title: 'Particle まで (until/up to)',
        explanation: 'Indicates endpoint or limit',
        pattern: 'End-point まで / Time まで',
        examples: [
            '5時まで仕事です。(I work until 5 o\'clock.)',
            'ここまで来てください。(Please come up to here.)',
        ],
    },
    {
        title: 'Particle より (than)',
        explanation: 'Used in comparisons to show the comparison point',
        pattern: 'A より B の方が...',
        examples: [
            '猫より犬が好きです。(I like dogs better than cats.)',
            'これはあれより安いです。(This is cheaper than that.)',
        ],
    },
    {
        title: 'Request Form: てください',
        explanation: 'Politely ask someone to do something',
        pattern: 'Verb-て + ください',
        examples: [
            'ここに座ってください。(Please sit here.)',
            'これを読んでください。(Please read this.)',
        ],
    },
    {
        title: 'Question Words: 誰/何/どこ/いつ/どう',
        explanation: 'Use question words to ask for information',
        pattern: 'Question-word + Question marker か',
        examples: [
            '誰が来ましたか？(Who came?)',
            'これは何ですか？(What is this?)',
            'どこに住んでいますか？(Where do you live?)',
        ],
    },
    {
        title: 'Polite Questions: ませんか',
        explanation: 'Make polite suggestions or requests using question form',
        pattern: 'Verb-ます-ん + か',
        examples: [
            '一緒に行きませんか？(Will you go with me?)',
            '水を飲みませんか？(Won\'t you have some water?)',
        ],
    },
    {
        title: 'Causative: せる/させる',
        explanation: 'Express the idea of "making someone do something"',
        pattern: 'Verb-stem + せる/させる',
        examples: [
            '子どもに勉強させます。(I make my child study.)',
        ],
    },
    {
        title: 'Passive: れる/られる',
        explanation: 'Express passive voice (being acted upon)',
        pattern: 'Verb-stem + れる/られる',
        examples: [
            '私は先生に褒められました。(I was praised by the teacher.)',
        ],
    },
    {
        title: 'Desire: たい',
        explanation: 'Express want or desire to do something',
        pattern: 'Verb-stem + たい',
        examples: [
            '日本に行きたいです。(I want to go to Japan.)',
            'コーヒーが飲みたいです。(I want to drink coffee.)',
        ],
    },
    {
        title: 'Permission & Prohibition: いい/いけない',
        explanation: 'Ask or give permission, or express prohibition',
        pattern: 'Verb-ていい / Verb-てはいけない',
        examples: [
            'ここに座ってもいいですか？(May I sit here?)',
            'ここに入ってはいけません。(You must not enter here.)',
        ],
    },
    {
        title: 'Obligation: なければならない',
        explanation: 'Express necessity or obligation to do something',
        pattern: 'Verb-なければならない',
        examples: [
            '毎日勉強しなければなりません。(I must study every day.)',
        ],
    },
    {
        title: 'Conditional: たら/ば',
        explanation: 'Express "if" or conditional situations',
        pattern: 'Condition-たら/ば Result',
        examples: [
            '雨だったら、行きません。(If it rains, I won\'t go.)',
            'もし時間があれば、来てください。(If you have time, please come.)',
        ],
    },
    {
        title: 'Concession: ても',
        explanation: 'Express "even though" or "even if"',
        pattern: 'Condition-ても Result',
        examples: [
            '忙しくても来ました。(Even though I was busy, I came.)',
            '雨でも行きます。(I will go even if it rains.)',
        ],
    },
    {
        title: 'Sequential Actions: てから',
        explanation: 'Express "after doing X, then do Y"',
        pattern: 'Verb-てから Next-action',
        examples: [
            '食べてから、出かけます。(After eating, I will go out.)',
            '宿題をしてから、遊びます。(After doing homework, I play.)',
        ],
    },
    {
        title: 'Simultaneous Actions: ながら',
        explanation: 'Express doing two things at the same time',
        pattern: 'Verb-ながら Another-verb',
        examples: [
            '音楽を聞きながら、勉強します。(I study while listening to music.)',
            '歩きながら、食べます。(I eat while walking.)',
        ],
    },
    {
        title: 'Time Expression: 前に/後で',
        explanation: 'Indicate before or after an action or time',
        pattern: 'Action 前に / Action 後で',
        examples: [
            '食べる前に、手を洗います。(Before eating, I wash my hands.)',
            'その後で、映画を見ます。(After that, I watch a movie.)',
        ],
    },
    {
        title: 'Alternatives: たり～たり',
        explanation: 'List actions as examples (not exhaustive)',
        pattern: 'Action-たり Action-たり します',
        examples: [
            '勉強したり、運動したりします。(I study, exercise, and do other things.)',
        ],
    },
    {
        title: 'Only/Exclusive: だけ',
        explanation: 'Express "only" or limitation',
        pattern: 'Noun だけ / Verb-だけ',
        examples: [
            '水だけ飲みます。(I drink only water.)',
            'これだけ好きです。(I like only this.)',
        ],
    },
    {
        title: 'Only/Negative: しか～ない',
        explanation: 'Express "only/none but" in negative contexts',
        pattern: 'Noun しか Verb-ない',
        examples: [
            'これしかありません。(There is nothing but this.)',
            '一人しか来ませんでした。(Only one person came.)',
        ],
    },
    {
        title: 'Quotation: と/って',
        explanation: 'Report what someone said or thought',
        pattern: 'Quoted-sentence + と/って Verb (言う、思う等)',
        examples: [
            '「来ます」と言いました。(He said "I will come.")',
            'これは難しいって思います。(I think this is difficult.)',
        ],
    },
    {
        title: 'Connectors: しかし/でも/そして',
        explanation: 'Connect sentences with logical relationships',
        pattern: 'Sentence + Connector + Sentence',
        examples: [
            '忙しいですが、来ます。(Although I am busy, I will come.)',
            '勉強して、試験に合格しました。(I studied and passed the exam.)',
        ],
    },
    {
        title: 'Aspect: ていた (was doing)',
        explanation: 'Express past continuous action or completed states',
        pattern: 'Verb-ていた',
        examples: [
            '私が来たとき、雨が降っていました。(When I came, it was raining.)',
            '彼は寝ていました。(He was sleeping.)',
        ],
    },
    {
        title: 'Auxiliary Verb: だ/です',
        explanation: 'Copula that connects subjects to descriptions',
        pattern: 'Noun だ/です / Predicate だ/です',
        examples: [
            '私は学生だ。(I am a student.) [plain]',
            '私は学生です。(I am a student.) [polite]',
        ],
    },
    {
        title: 'Approximation: ぐらい/くらい',
        explanation: 'Express "approximately" or "about"',
        pattern: 'Quantity/Time ぐらい/くらい',
        examples: [
            '1時間ぐらい待ちました。(I waited about one hour.)',
            '10個くらい欲しいです。(I want about 10.)',
        ],
    },
    {
        title: 'Godan Verbs (五段動詞)',
        explanation: 'Regular verbs ending in -u with consonant stem changes',
        pattern: 'Root + consonant changes (k, g, s, t, n, b, m, r)',
        examples: [
            '読む(yomu) → 読んだ(yonda) - to read (plain past)',
            '飲む(nomu) → 飲まない(nomanal) - to drink (negative)',
            '書く(kaku) → 書きます(kakimasu) - to write (polite)',
        ],
    },
    {
        title: 'Ichidan Verbs (一段動詞)',
        explanation: 'Verbs ending in -iru or -eru with simple stem removal',
        pattern: 'Root-iru/eru → Root + suffix',
        examples: [
            '食べる(taberu) → 食べた(tabeta) - to eat (past)',
            '見る(miru) → 見ない(minai) - to see (negative)',
            '寝る(neru) → 寝ます(nemasu) - to sleep (polite)',
        ],
    },
    {
        title: 'Irregular Verbs: する & 来る',
        explanation: 'Suru (to do) and kuru (to come) have unique conjugations',
        pattern: 'する/来る → Special conjugated forms',
        examples: [
            '勉強した(benkyou shita) - studied (past)',
            '来た(kita) - came (past)',
            'しています(shite imasu) - am doing (continuous)',
        ],
    },
    {
        title: 'Sound Changes: 音便 (Onjin)',
        explanation: 'Phonetic changes when connecting verb stems with suffixes',
        pattern: 'Stem + suffix → Sound modification',
        examples: [
            '書く(kaku) + た = 書いた(kaita) - Sound change from -ku to -i',
            '待つ(matsu) + た = 待った(matta) - Double consonant',
            '飲む(nomu) + て = 飲んで(nonde) - Nasal sound change',
        ],
    },
    {
        title: 'Transitive vs Intransitive Verbs',
        explanation: 'Transitive takes object (を), intransitive does not',
        pattern: 'Transitive: Object を Verb / Intransitive: Subject が Verb',
        examples: [
            'ドアを開けます(I open the door) - transitive',
            'ドアが開きます(The door opens) - intransitive',
            '花を咲かせます vs 花が咲きます(to bloom transitively vs intransitively)',
        ],
    },
    {
        title: 'Interjections & Exclamations (感嘆詞)',
        explanation: 'Expressions used to convey emotions or get attention',
        pattern: 'Interjection + Sentence / Interjection alone',
        examples: [
            'ああ(Ah!) - expression of realization',
            'えっ(Eh?) - surprise',
            'わあ(Wow!) - amazement',
            'あ、そう(Oh, I see.)',
        ],
    },
    {
        title: 'State Adverbs (状態副詞)',
        explanation: 'Adverbs describing the state or manner of action',
        pattern: 'Adverb + Verb / Adverb + Adjective',
        examples: [
            'ゆっくり歩きます(I walk slowly.)',
            'きれいに掃除します(I clean neatly.)',
            'はっきり言う(to say clearly)',
        ],
    },
    {
        title: 'Degree Adverbs (程度副詞)',
        explanation: 'Adverbs expressing degree or extent',
        pattern: 'Degree adverb + Adjective/Verb',
        examples: [
            'とても美しい(very beautiful)',
            'すごく忙しい(extremely busy)',
            'かなり良い(considerably good)',
        ],
    },
    {
        title: 'Correlative Adverbs (呼応副詞)',
        explanation: 'Adverbs that correlate with specific endings',
        pattern: 'Correlative adverb + Specific ending',
        examples: [
            'もし～ば(If... then)',
            'たとえ～ても(Even if...)',
            'いくら～ても(No matter how much...)',
        ],
    },
    {
        title: 'Continuous Negative: ていない',
        explanation: 'Express that an action is not being done',
        pattern: 'Verb-ていない',
        examples: [
            '彼は今、勉強していません。(He is not studying now.)',
            '雨が降っていない。(It is not raining.)',
        ],
    },
    {
        title: 'Potential Form: られる/える',
        explanation: 'Express ability or possibility to do something',
        pattern: 'Verb-stem + られる/える',
        examples: [
            '私は日本語が話せます。(I can speak Japanese.)',
            'これはできますか？(Can you do this?)',
        ],
    },
    {
        title: 'Necessity & Non-necessity: ねばならない vs ても良い',
        explanation: 'Express obligations vs optional actions',
        pattern: 'Verb-ねばならない / Verb-てもいい',
        examples: [
            '毎日、宿題をしなければなりません。(I must do homework daily.)',
            '休んでもいいですよ。(It\'s okay to take a rest.)',
        ],
    },
    {
        title: 'Resultative: てある',
        explanation: 'Express a state resulting from a completed action',
        pattern: 'Verb-てある',
        examples: [
            'ドアが開いてあります。(The door is open [as a result].)',
            '荷物が置いてあります。(Luggage is placed [and remains].)',
        ],
    },
    {
        title: 'Discovery & Realization: たところ/ところで',
        explanation: 'Express discovering something or being in middle of action',
        pattern: 'Verb-たところ / Verb-ているところで',
        examples: [
            '家に帰ったところ、電話がありました。(When I arrived home, there was a call.)',
            'これを食べているところです。(I am in the middle of eating this.)',
        ],
    },
    {
        title: 'Similar Action: ようにする',
        explanation: 'Express trying to act a certain way or developing a habit',
        pattern: 'Verb-ように + する',
        examples: [
            '毎日、運動するようにしています。(I try to exercise daily.)',
            '正直に話すようにしました。(I made it a habit to speak honestly.)',
        ],
    },
    {
        title: 'Comparative: 方が vs より',
        explanation: 'Compare two things using "more ~ than"',
        pattern: 'A の方が B より Adjective / A より B の方が',
        examples: [
            'これはあれより安いです。(This is cheaper than that.)',
            'りんごの方がみかんより好きです。(I like apples more than oranges.)',
        ],
    },
    {
        title: 'Superlative: 一番 & 最も',
        explanation: 'Express the highest degree (most/most)',
        pattern: '一番/最も + Adjective / 一番 + Verb + Object',
        examples: [
            'これが一番好きです。(This is my favorite.)',
            '最も重要なことです。(It is the most important thing.)',
        ],
    },
    {
        title: 'Intention & Plans with つもり',
        explanation: 'Express the speaker\'s intention, plan, or decision regarding a future action',
        pattern: 'Verb dictionary form + つもりです / Verb negative form + つもりです',
        examples: [
            '来年、日本に行くつもりです。(I intend to go to Japan next year.)',
            '明日、学校に行かないつもりです。(I plan not to go to school tomorrow.)',
        ],
    },
    {
        title: 'Copula: だ/です (Present) & だった/でした (Past)',
        explanation: 'The present tense copula is だ, expressing affirmation of a current state. The past tense copula is だった.',
        pattern: 'Noun + だ / Noun + です (polite) / Noun + だった / Noun + でした (polite past)',
        examples: [
            '今は学生だ。(I am a student now.)',
            '昨日は学生だった。(I was a student yesterday.)',
        ],
    },
];

const n4GrammarTopics = [
    {
        title: '「にする」Decision',
        explanation: 'Express making a decision or choice',
        pattern: 'Noun に + する',
        examples: [
            'コーヒーにします。(I\'ll have coffee.)',
            '仕事は営業にした。(I decided on sales for work.)',
        ],
    },
    {
        title: '「がする」Feel/Sense',
        explanation: 'Express subjective sensations or perceptions',
        pattern: 'Noun/Sentence が + する',
        examples: [
            'いやな感じがします。(I have a bad feeling.)',
            '何かおかしいがします。(Something seems strange.)',
        ],
    },
    {
        title: '「について」About/Regarding',
        explanation: 'Indicate the topic or subject of discussion',
        pattern: 'Noun + について',
        examples: [
            'その映画について話しましょう。(Let\'s talk about that movie.)',
            '天気について心配しています。(I\'m worried about the weather.)',
        ],
    },
    {
        title: '「によると」According to',
        explanation: 'Express information source or basis',
        pattern: 'Noun + によると',
        examples: [
            '新聞によると、明日は雨です。(According to the newspaper, it\'ll rain tomorrow.)',
            '先生によると、テストは難しいです。(According to the teacher, the test is difficult.)',
        ],
    },
    {
        title: '「になる」Become/Change',
        explanation: 'Express transformation or change of state',
        pattern: 'Noun/い-adjective + になる',
        examples: [
            'エンジニアになりました。(I became an engineer.)',
            '天気が良くなりました。(The weather became nice.)',
        ],
    },
    {
        title: '「形容詞さ」Degree/Extent',
        explanation: 'Express the degree of an adjective quality by adding さ',
        pattern: 'い-adjective (remove い) + さ',
        examples: [
            '新しさ(newness)',
            '美しさ(beauty)',
            '大きさ(size)',
        ],
    },
    {
        title: '「形容詞ＰＶ変化」Adjective Changes',
        explanation: 'Understanding い-adjective transformation patterns',
        pattern: 'い-adjective → Base form variations',
        examples: [
            '新しい → 新しかった (was new)',
            '安い → 安くない (not cheap)',
            '高い → 高く (in the manner of being high)',
        ],
    },
    {
        title: '「形容詞＋がる」Others\' Feelings',
        explanation: 'Express emotions or feelings of others, not the speaker',
        pattern: 'い-adjective (remove い) + がる',
        examples: [
            '彼はこの車が欲しがっています。(He wants this car.)',
            '子どもは退屈そうにしている。(The child seems bored.)',
        ],
    },
    {
        title: '「形容動詞変化」Na-Adjective Changes',
        explanation: 'Understanding な-adjective transformation patterns',
        pattern: 'な-adjective → Base form variations',
        examples: [
            '綺麗 → 綺麗だった (was beautiful)',
            '便利 → 便利ではない (not convenient)',
            '有名な → 有名である (is famous)',
        ],
    },
    {
        title: '「と」Conditional (If)',
        explanation: 'Express conditional statements with natural consequence',
        pattern: 'Condition + と + Result',
        examples: [
            '雨が降ると、試合は中止になります。(If it rains, the game will be cancelled.)',
            '火を消さないと、火事になります。(If you don\'t extinguish the fire, it will catch fire.)',
        ],
    },
    {
        title: '「ば」Conditional (If)',
        explanation: 'Express conditional with ば, similar to たら but more formal',
        pattern: 'Condition-ば + Result',
        examples: [
            '時間があれば、来ます。(If I have time, I\'ll come.)',
            '難しければ、手伝います。(If it\'s difficult, I\'ll help.)',
        ],
    },
    {
        title: '「たら」Conditional (If)',
        explanation: 'Express conditional situations with たら form',
        pattern: 'Condition-たら + Result',
        examples: [
            'もし雨だったら、中止になります。(If it were to rain, it would be cancelled.)',
            '時間があったら、映画を見ます。(If I had time, I\'d watch a movie.)',
        ],
    },
    {
        title: '「なら」Conditional (If)',
        explanation: 'Express conditional based on given situation or assumption',
        pattern: 'Condition + なら + Opinion/Suggestion',
        examples: [
            '田中さんなら、できるでしょう。(If it\'s Tanaka, he probably can do it.)',
            '今からなら、間に合います。(If it\'s from now, we\'ll make it.)',
        ],
    },
    {
        title: '「させる」Causative',
        explanation: 'Express making or forcing someone to do something',
        pattern: 'Verb-stem + させる',
        examples: [
            '子どもに宿題をさせます。(I make the child do homework.)',
            '部下を働かせます。(I make my subordinate work.)',
        ],
    },
    {
        title: '「られる」Passive/Potential/Spontaneous',
        explanation: 'Express passive voice, possibility, or spontaneous action',
        pattern: 'Verb-stem + られる',
        examples: [
            '先生に怒られました。(I was scolded by the teacher.)',
            '日本語が話せます。(I can speak Japanese.)',
            '気がつかれた。(It was noticed spontaneously.)',
        ],
    },
    {
        title: '「ていく」Auxiliary Verb',
        explanation: 'Express action progressing forward over time',
        pattern: 'Verb-て + いく',
        examples: [
            '天気が悪くなっていきます。(The weather is getting worse.)',
            'どんどん上達していきました。(I kept improving gradually.)',
        ],
    },
    {
        title: '「てくる」Auxiliary Verb',
        explanation: 'Express action coming toward the speaker or becoming',
        pattern: 'Verb-て + くる',
        examples: [
            '友達が来てくれました。(My friend came to me.)',
            'だんだん分かってきました。(I\'ve come to understand gradually.)',
        ],
    },
    {
        title: '「てみる」Auxiliary Verb',
        explanation: 'Express trying or attempting to do something',
        pattern: 'Verb-て + みる',
        examples: [
            'この料理を作ってみます。(I\'ll try making this dish.)',
            'その本を読んでみてください。(Please try reading that book.)',
        ],
    },
    {
        title: '「てしまう」Auxiliary Verb',
        explanation: 'Express completing an action or something bad happening',
        pattern: 'Verb-て + しまう',
        examples: [
            'ケーキを全部食べてしまいました。(I ended up eating all the cake.)',
            'ゴールを決めてしまった。(He went and scored.)',
        ],
    },
    {
        title: '「ておく」Auxiliary Verb',
        explanation: 'Express preparing in advance or leaving in a state',
        pattern: 'Verb-て + おく',
        examples: [
            '明日のために準備しておきます。(I\'ll prepare in advance for tomorrow.)',
            'ドアを開けておいてください。(Please leave the door open.)',
        ],
    },
    {
        title: '「ず、ずに」Negative Without',
        explanation: 'Express doing something without doing another action',
        pattern: 'Verb-ず / Verb-ずに',
        examples: [
            'ご飯を食べずに寝てしまいました。(I went to bed without eating.)',
            '何も言わずに去った。(He left without saying anything.)',
        ],
    },
    {
        title: '「そうだ」Appearance/Aspect',
        explanation: 'Express that something looks like it will happen',
        pattern: 'Verb-そうだ / Adjective-そうだ',
        examples: [
            '今にも雨が降りそうです。(It looks like it\'s about to rain.)',
            'この料理は美味しそうです。(This dish looks delicious.)',
        ],
    },
    {
        title: '「そうだ」Hearsay',
        explanation: 'Express information heard from others',
        pattern: 'Verb-dictionary + そうだ / Noun + だそうだ',
        examples: [
            'その人は有名だそうです。(I heard that person is famous.)',
            '明日、雨が降るそうです。(I heard it\'ll rain tomorrow.)',
        ],
    },
    {
        title: '「らしい」Conjecture',
        explanation: 'Express guess or inference based on evidence',
        pattern: 'Noun + らしい / Sentence + らしい',
        examples: [
            'その人は医者らしいです。(That person seems to be a doctor.)',
            '天気が悪いらしいです。(It seems the weather is bad.)',
        ],
    },
    {
        title: '「ようだ」Appearance/Analogy',
        explanation: 'Express that something appears to be or seems like',
        pattern: 'Noun + ようだ / Verb + ようだ',
        examples: [
            'この映画は面白いようです。(This movie seems interesting.)',
            '明日は晴れるようです。(It seems it will be sunny tomorrow.)',
        ],
    },
    {
        title: '「みたいだ」Appearance/Like',
        explanation: 'Express that something looks like or appears to be',
        pattern: 'Noun + みたいだ / Sentence + みたいだ',
        examples: [
            'その人は学生みたいです。(That person looks like a student.)',
            '雨が降るみたいです。(It looks like it will rain.)',
        ],
    },
    {
        title: 'Differences: そうだ/ようだ/らしい/みたいだ',
        explanation: 'Understanding nuances between these four expressions',
        pattern: 'Compare usage contexts and subtle differences',
        examples: [
            'そうだ: Based on appearance or hearsay',
            'ようだ: Formal appearance or analogy',
            'らしい: Inference from evidence',
            'みたいだ: Casual appearance or likeness',
        ],
    },
    {
        title: '「授受動詞」Give/Receive',
        explanation: 'Express giving and receiving with directional nuance',
        pattern: 'あげる、くれる、もらう',
        examples: [
            '田中さんに本をあげました。(I gave a book to Tanaka.)',
            'この人がくれた贈り物です。(It\'s a gift this person gave me.)',
            '先生からプレゼントをもらいました。(I received a present from the teacher.)',
        ],
    },
    {
        title: '「て形＋授受動詞」Te-form + Give/Receive',
        explanation: 'Express favor of doing something for someone',
        pattern: 'Verb-て + あげる、くれる、もらう',
        examples: [
            '私が手伝ってあげます。(I\'ll help you.)',
            'お母さんが作ってくれました。(Mother made it for me.)',
            'お兄さんに教えてもらいました。(I had my brother teach me.)',
        ],
    },
    {
        title: '「あげます」Give (Sender Perspective)',
        explanation: 'Express giving something to someone - perspective of the giver',
        pattern: 'A は B に C を あげます (A gives C to B)',
        examples: [
            '私は田中さんに本をあげました。(I gave a book to Tanaka.)',
            '私は先生にプレゼントをあげます。(I give a present to the teacher.)',
            '田中さんは佐藤さんに花をあげました。(Tanaka gave flowers to Satoh.)',
        ],
    },
    {
        title: '「もらいます」Receive (Receiver Perspective)',
        explanation: 'Express receiving something from someone - perspective of the receiver',
        pattern: 'A は B に C を もらいます (A receives C from B)',
        examples: [
            '田中さんは田辺さんに本をもらいました。(Tanaka received a book from Tanabe.)',
            '田中さんは私に手伝いをもらいました。(Tanaka received help from me.)',
            '太郎さんは次郎さんに贈り物をもらいました。(Taro received a gift from Jiro.)',
        ],
    },
    {
        title: '「～けば」Conditional Form',
        explanation: 'Express conditional assumptions meaning "if/when... then...". This fundamental grammar changes based on word type: For Verbs - take the conditional form ending in えば (e.g., 行く→行けば "if go"). For い-adjectives - remove い and add ければ (e.g., 寒い→寒ければ "if cold"). For な-adjectives and nouns - add ならば or simply なら (e.g., 静か→静かなら "if quiet"). The conditional states a condition that, when met, will result in a specific consequence.',
        pattern: 'Verb-conditional (えば) / い-Adj + ければ / な-Adj/Noun + ならば + Consequence',
        examples: [
            '【Verb】 行けば: お金があれば、旅行できます。(If I have money, I can travel.)',
            '【い-Adj】 寒ければ: 寒ければ、コートを着てください。(If it\'s cold, please wear a coat.)',
            '【な-Adj】 静かなら: 静かなら、勉強できます。(If it\'s quiet, I can study.)',
            '【Noun】 学生なら: 学生なら、図書館で無料で本が借りられます。(If you\'re a student, you can borrow books for free at the library.)',
            '時間があれば、手伝います。(If I have time, I will help you.)',
            '美しければ、多くの人に好かれます。(If beautiful, many people will like it.)',
        ],
    },
    {
        title: '「でございます」Polite Form',
        explanation: 'Express highest level of politeness and formality',
        pattern: 'Noun + でございます / Verb-ます + でございます',
        examples: [
            '私は学生でございます。(I am a student. [very formal])',
            'こちらが新商品でございます。(This is the new product. [formal])',
        ],
    },
    {
        title: '「（よ）う」Volitional/Will',
        explanation: 'Express intention, invitation, or conjecture',
        pattern: 'Verb-う / Verb-ようとする / Verb-ようと思う',
        examples: [
            '一緒に行こう。(Let\'s go together.)',
            'あの人は合格しようとしています。(That person is trying to pass.)',
            '来年、日本に行こうと思っています。(I\'m thinking of going to Japan next year.)',
        ],
    },
    {
        title: '「ので」Because (Explanation)',
        explanation: 'Express reason or cause in objective manner',
        pattern: 'Reason + ので + Result',
        examples: [
            'よく眠ったので、元気です。(Because I slept well, I\'m energetic.)',
            '雨が降っているので、行けません。(Since it\'s raining, I can\'t go.)',
        ],
    },
    {
        title: '「のに」Even Though/Contrast',
        explanation: 'Express contradiction between expectation and reality',
        pattern: 'Reason + のに + Unexpected result',
        examples: [
            'お金をたくさん持っているのに、幸せではありません。(Even though he has a lot of money, he\'s not happy.)',
            '勉強したのに、テストに失敗しました。(Even though I studied, I failed the test.)',
        ],
    },
    {
        title: '「複合動詞」Compound Verbs',
        explanation: 'Understanding verbs formed by combining two verb roots',
        pattern: 'Verb1 + Verb2 (stem)',
        examples: [
            '飛び込む(tobikkomu) - to jump in',
            '読み間違える(yomichigaeru) - to misread',
            '書き足す(kakitasu) - to add by writing',
        ],
    },
    {
        title: '「お + Verb + になる」Honorific',
        explanation: 'Express respect for someone else\'s action',
        pattern: 'お + Verb-stem + になる',
        examples: [
            '先生がお来になりました。(The teacher came. [honorific])',
            'お母さんがお読みになっています。(Mother is reading. [honorific])',
        ],
    },
    {
        title: '「お + Verb + する」Humble',
        explanation: 'Express humility about one\'s own action',
        pattern: 'お + Verb-stem + する',
        examples: [
            'お忙しいところ、お邪魔します。(I apologize for intruding when you\'re busy.)',
            '私からお願いします。(I humbly request from my side.)',
        ],
    },
    {
        title: '「～方（かた）」Way of Doing',
        explanation: 'Express the method or way of doing something',
        pattern: 'Verb-stem + 方',
        examples: [
            'パソコンの使い方を教えてください。(Please teach me how to use a computer.)',
            '正しい読み方は何ですか。(What is the correct way to read this?)',
        ],
    },
    {
        title: '「ために」Purpose/Cause',
        explanation: 'Express purpose (in order to) or cause (because of)',
        pattern: 'Action/Noun + ために',
        examples: [
            '合格するために、勉強しています。(I\'m studying in order to pass.)',
            '台風のために、試合は中止になりました。(Because of the typhoon, the game was cancelled.)',
        ],
    },
    {
        title: '「つもり」Intention',
        explanation: 'Express one\'s plan, intention, or what one thinks',
        pattern: 'Verb-dictionary + つもり / Verb-negative + つもり',
        examples: [
            '明日、図書館に行くつもりです。(I plan to go to the library tomorrow.)',
            'これ以上、待たないつもりです。(I don\'t intend to wait any longer.)',
        ],
    },
    {
        title: '「～なさい」Command/Instruction',
        explanation: 'Express command or strong instruction',
        pattern: 'Verb-stem + なさい',
        examples: [
            '宿題をしなさい。(Do your homework!)',
            'ここに座りなさい。(Sit here!)',
        ],
    },
    {
        title: '「ことがある」Experience',
        explanation: 'Express that something has happened at least once',
        pattern: 'Verb-た + ことがあります',
        examples: [
            '日本に行ったことがあります。(I\'ve been to Japan.)',
            '富士山を見たことはありません。(I\'ve never seen Mount Fuji.)',
        ],
    },
    {
        title: '「ことになる」Happen/Become',
        explanation: 'Express that something has been decided or will inevitably happen',
        pattern: 'Verb-dictionary + ことになりました',
        examples: [
            'その仕事をすることになりました。(It has been decided that I\'ll do that job.)',
            'エンジニアになることにしました。(I decided to become an engineer.)',
        ],
    },
    {
        title: '「ことができる」Can/Able',
        explanation: 'Express ability or possibility to do something',
        pattern: 'Verb-dictionary + ことができます',
        examples: [
            '日本語が話すことができます。(I can speak Japanese.)',
            'これを修理することができますか。(Can you repair this?)',
        ],
    },
    {
        title: '「ところ」/「ばかり」Moment/Just',
        explanation: 'Express being in the middle of action or just completed',
        pattern: 'Verb-ている + ところです / Verb-た + ばかりです',
        examples: [
            '今、ご飯を食べているところです。(I\'m eating now.)',
            'さっき帰ったばかりです。(I just got home.)',
        ],
    },
    {
        title: '「ようにする」Strive To/Try To',
        explanation: 'Express effort to achieve something or developing a habit',
        pattern: 'Verb-dictionary + ようにしています',
        examples: [
            '毎日、運動するようにしています。(I\'m trying to exercise every day.)',
            '早く寝るようにしましょう。(Let\'s try to sleep early.)',
        ],
    },
    {
        title: '「ようになる」Come To/Start To',
        explanation: 'Express gradual change or becoming able to do',
        pattern: 'Verb-dictionary + ようになりました',
        examples: [
            '日本語が話せるようになりました。(I\'ve come to be able to speak Japanese.)',
            '毎日走るようになった。(I\'ve started running every day.)',
        ],
    },
    {
        title: '「ように言う」Tell/Instruct',
        explanation: 'Express telling someone to do or not do something',
        pattern: 'Verb-dictionary/negative + ように言う',
        examples: [
            '気をつけるように言いました。(I told him to be careful.)',
            '誰にも言わないようにと言われました。(I was told not to tell anyone.)',
        ],
    },
    {
        title: '「てはいけない」Must Not',
        explanation: 'Express prohibition or prohibition-like prohibition',
        pattern: 'Verb-て + はいけません / てはならない',
        examples: [
            'ここに入ってはいけません。(You must not enter here.)',
            'この約束を破ってはならない。(You must not break this promise.)',
        ],
    },
    {
        title: '「ても」/「てもいい」Even If/May',
        explanation: 'Express concession (even if) or permission (may)',
        pattern: 'Verb-て + も / Verb-て + もいい',
        examples: [
            '雨でも行きます。(I\'ll go even if it rains.)',
            'ここで食べてもいいですか。(May I eat here?)',
        ],
    },
    {
        title: '「それで」/「そこで」Therefore/So',
        explanation: 'Express logical consequence or conclusion',
        pattern: 'Sentence + それで/そこで + Result',
        examples: [
            '時間がなかったので、それで行きませんでした。(Since I had no time, so I didn\'t go.)',
            '大学を卒業して、そこで働くことにしました。(I graduated from university, and so I decided to work there.)',
        ],
    },
    {
        title: '「まで」Extent/Until',
        explanation: 'Express range, period, or extent of action',
        pattern: 'Endpoint + まで',
        examples: [
            '5時まで仕事をします。(I work until 5 o\'clock.)',
            '来年まで待つつもりです。(I intend to wait until next year.)',
        ],
    },
    {
        title: '「も」Adverbial Particle',
        explanation: 'Express "even," "as much as," or "to the extent of"',
        pattern: 'Quantity + も',
        examples: [
            '10個も買いました。(I bought as many as 10.)',
            'このくらいも難しいですか。(Is even this much difficult?)',
        ],
    },
    {
        title: '「し」Connective Particle',
        explanation: 'List multiple reasons or conditions',
        pattern: 'Reason1 + し、Reason2 + し',
        examples: [
            '忙しいし、疲れているし、行きません。(I\'m busy and tired, so I won\'t go.)',
            'おいしいし、安いし、このレストランが好きです。(It\'s delicious and cheap, so I like this restaurant.)',
        ],
    },
    {
        title: '「でも」Adverbial Particle',
        explanation: 'Express "even," "any," or slight concession',
        pattern: 'Noun/Pronoun + でも',
        examples: [
            '誰でも分かります。(Anyone can understand.)',
            'どこでも行けます。(I can go anywhere.)',
        ],
    },
    {
        title: '「かい・だい・の・な」Final Particles',
        explanation: 'Express emphasis, emotion, or modality at sentence end',
        pattern: 'Sentence + かい / だい / の / な',
        examples: [
            '行くかい。(Are you going?)',
            'これだい!(This one!)',
            'どうするの。(What are you going to do?)',
            'そうなあ。(I guess so.)',
        ],
    },
    {
        title: '「副詞」Adverbs (System)',
        explanation: 'Comprehensive understanding of Japanese adverb system and usage',
        pattern: 'Adverb + Verb/Adjective/Sentence',
        examples: [
            'もっと早く来てください。(Please come much earlier.)',
            'ひょっと来るかもしれません。(He might come by chance.)',
            'どうしても行きたいです。(I really want to go, no matter what.)',
        ],
    },
];

export default function GrammarSection() {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<'n5' | 'n4'>('n5');
    
    const grammarTopics = selectedLevel === 'n5' ? n5GrammarTopics : n4GrammarTopics;

    return (
        <div className="w-full">
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setSelectedLevel('n5')}
                    className={classNames(
                        'px-4 py-2 rounded-lg font-bold transition-colors',
                        selectedLevel === 'n5'
                            ? 'bg-pink-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    )}
                >
                    N5 Grammar (65)
                </button>
                <button
                    onClick={() => setSelectedLevel('n4')}
                    className={classNames(
                        'px-4 py-2 rounded-lg font-bold transition-colors',
                        selectedLevel === 'n4'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    )}
                >
                    N4 Grammar (53)
                </button>
            </div>

            <h3 className="text-2xl font-bold mb-2 text-pink-400">
                {selectedLevel === 'n5' ? 'N5 Grammar (65 Topics)' : 'N4 Grammar (53 Topics)'}
            </h3>
            <p className="text-sm text-slate-300 mb-6">
                {selectedLevel === 'n5'
                    ? 'Comprehensive grammar patterns for JLPT N5 preparation'
                    : 'Intermediate grammar patterns for JLPT N4 preparation'}
            </p>
            <div className="space-y-4">
                {grammarTopics.map((topic, idx) => (
                    <div
                        key={idx}
                        className="border border-purple-500/30 rounded-lg overflow-hidden hover:border-pink-500/50 transition-colors"
                    >
                        <button
                            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                            className="w-full p-4 bg-slate-800/50 hover:bg-slate-800/70 transition-colors text-left flex items-center justify-between"
                        >
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-indigo-400">{topic.title}</h4>
                                <p className="text-sm text-slate-400">{topic.explanation}</p>
                            </div>
                            <span className={classNames('text-pink-400 text-xl transition-transform flex-shrink-0 ml-4', {
                                'rotate-180': expandedIdx === idx,
                            })}>
                                ▼
                            </span>
                        </button>
                        {expandedIdx === idx && (
                            <div className="p-4 bg-slate-900/30 border-t border-purple-500/20">
                                <div className="mb-3">
                                    <p className="text-sm text-slate-400 mb-1">Pattern:</p>
                                    <code className="block bg-slate-900 p-2 rounded text-purple-300 text-sm">
                                        {topic.pattern}
                                    </code>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-2">Examples:</p>
                                    <ul className="space-y-1">
                                        {topic.examples.map((example, eIdx) => (
                                            <li key={eIdx} className="text-slate-300 text-sm">
                                                • {example}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

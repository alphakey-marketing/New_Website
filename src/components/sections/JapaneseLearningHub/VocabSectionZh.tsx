import classNames from 'classnames';
import { useState } from 'react';

const vocabCategories = [
    {
        name: 'い形容詞 (い-形容詞)',
        icon: '✨',
        description: 'N5級品質形容詞',
        items: [
            { kanji: '新しい', hiragana: 'あたらしい', meaning: '新的', example: '新しい本です。' },
            { kanji: '古い', hiragana: 'ふるい', meaning: '舊的', example: 'これは古い本です。' },
            { kanji: '大きい', hiragana: 'おおきい', meaning: '大的', example: '大きい家です。' },
            { kanji: '小さい', hiragana: 'ちいさい', meaning: '小的', example: '小さい犬ですね。' },
            { kanji: '高い', hiragana: 'たかい', meaning: '高的/貴的', example: 'この山は高いです。' },
            { kanji: '低い', hiragana: 'ひくい', meaning: '低的', example: 'その木は低いです。' },
            { kanji: '長い', hiragana: 'ながい', meaning: '長的', example: 'この川は長いです。' },
            { kanji: '短い', hiragana: 'みじかい', meaning: '短的', example: '髪が短いです。' },
            { kanji: '美しい', hiragana: 'うつくしい', meaning: '美麗的', example: 'その花は美しいです。' },
            { kanji: '寒い', hiragana: 'さむい', meaning: '寒冷', example: '今日は寒いですね。' },
            { kanji: '暖かい', hiragana: 'あたたかい', meaning: '溫暖', example: '春は暖かいです。' },
            { kanji: '涼しい', hiragana: 'すずしい', meaning: '涼爽', example: '秋は涼しいです。' },
            { kanji: '広い', hiragana: 'ひろい', meaning: '寬敞', example: 'この部屋は広いです。' },
            { kanji: '狭い', hiragana: 'せまい', meaning: '狹窄', example: 'その部屋は狭いです。' },
            { kanji: '深い', hiragana: 'ふかい', meaning: '深', example: 'この池は深いです。' },
            { kanji: '浅い', hiragana: 'あさい', meaning: '淺', example: 'その川は浅いです。' },
            { kanji: '重い', hiragana: 'おもい', meaning: '重', example: 'この荷物は重いです。' },
            { kanji: '軽い', hiragana: 'かるい', meaning: '輕', example: 'このかばんは軽いです。' },
            { kanji: '速い', hiragana: 'はやい', meaning: '快', example: 'この電車は速いです。' },
            { kanji: '遅い', hiragana: 'おそい', meaning: '慢', example: 'そのバスは遅いです。' },
            { kanji: '近い', hiragana: 'ちかい', meaning: '近', example: '駅は近いです。' },
            { kanji: '遠い', hiragana: 'とおい', meaning: '遠', example: 'その場所は遠いです。' },
            { kanji: '安い', hiragana: 'やすい', meaning: '便宜', example: 'この服は安いです。' },
            { kanji: '美味しい', hiragana: 'おいしい', meaning: '好吃', example: 'この料理は美味しいです。' },
            { kanji: '難しい', hiragana: 'むずかしい', meaning: '困難', example: 'この漢字は難しいです。' },
            { kanji: '危ない', hiragana: 'あぶない', meaning: '危險', example: '交差点は危ないです。' },
            { kanji: '赤い', hiragana: 'あかい', meaning: '紅色', example: 'その花は赤いです。' },
            { kanji: '明るい', hiragana: 'あかるい', meaning: '明亮', example: '部屋が明るいですね。' },
            { kanji: '甘い', hiragana: 'あまい', meaning: '甜蜜', example: 'このお菓子は甘いです。' },
            { kanji: '青い', hiragana: 'あおい', meaning: '藍色', example: '空は青いです。' },
            { kanji: '熱い', hiragana: 'あつい', meaning: '熱的', example: 'お風呂が熱いです。' },
            { kanji: '厚い', hiragana: 'あつい', meaning: '厚的', example: 'この本は厚いです。' },
            { kanji: '暑い', hiragana: 'あつい', meaning: '炎熱', example: '夏は暑いですね。' },
            { kanji: '太い', hiragana: 'ふとい', meaning: '胖/厚', example: 'その木は太いです。' },
            { kanji: '早い', hiragana: 'はやい', meaning: '早', example: '朝早いです。' },
            { kanji: '忙しい', hiragana: 'いそがしい', meaning: '忙', example: '今週は忙しいです。' },
            { kanji: '痛い', hiragana: 'いたい', meaning: '疼痛', example: '頭が痛いです。' },
            { kanji: '欲しい', hiragana: 'ほしい', meaning: '想要', example: 'その本が欲しいです。' },
            { kanji: '細い', hiragana: 'ほそい', meaning: '細長', example: 'その人は細いです。' },
            { kanji: '可愛い', hiragana: 'かわいい', meaning: '可愛', example: 'その子は可愛いですね。' },
            { kanji: '辛い', hiragana: 'からい', meaning: '辛辣', example: 'このカレーは辛いです。' },
        ],
    },
    {
        name: 'な形容詞 (な-形容詞)',
        icon: '🎨',
        description: 'N5級な形式形容詞',
        items: [
            { kanji: '綺麗', hiragana: 'きれい', meaning: '美麗的/乾淨的', example: '綺麗な花です。' },
            { kanji: '有名', hiragana: 'ゆうめい', meaning: '有名的', example: 'あの人は有名です。' },
            { kanji: '簡単', hiragana: 'かんたん', meaning: '簡單的', example: 'これは簡単な問題です。' },
            { kanji: '複雑', hiragana: 'ふくざつ', meaning: '複雜的', example: 'この問題は複雑です。' },
            { kanji: '便利', hiragana: 'べんり', meaning: '方便的', example: 'この場所は便利です。' },
            { kanji: '得意', hiragana: 'とくい', meaning: '擅長的', example: '私は日本語が得意です。' },
            { kanji: '不得意', hiragana: 'ふとくい', meaning: '不擅長的', example: '計算が不得意です。' },
            { kanji: '真面目', hiragana: 'まじめ', meaning: '認真的/勤奮的', example: '真面目な学生です。' },
            { kanji: 'いい加減', hiragana: 'いいかげん', meaning: '馬虎的', example: 'いい加減な態度です。' },
            { kanji: '親切', hiragana: 'しんせつ', meaning: '親切的', example: 'あの先生は親切です。' },
            { kanji: '丁寧', hiragana: 'ていねい', meaning: '禮貌的', example: '丁寧な説明です。' },
            { kanji: '静か', hiragana: 'しずか', meaning: '安靜的', example: 'この図書館は静かです。' },
            { kanji: 'にぎやか', hiragana: 'にぎやか', meaning: '熱鬧的', example: 'にぎやかな街です。' },
            { kanji: '穏やか', hiragana: 'おだやか', meaning: '平靜的', example: '穏やかな天気ですね。' },
            { kanji: '元気', hiragana: 'げんき', meaning: '精力充沛的/健康的', example: '元気な子どもです。' },
            { kanji: '素敵', hiragana: 'すてき', meaning: '漂亮的', example: '素敵なドレスですね。' },
            { kanji: '自由', hiragana: 'じゆう', meaning: '自由的', example: '自由な時間があります。' },
            { kanji: '同じ', hiragana: 'おなじ', meaning: '相同的', example: '同じ本を買いました。' },
            { kanji: '異なる', hiragana: 'ことなる', meaning: '不同的', example: '異なる意見です。' },
            { kanji: '独特', hiragana: 'どくとく', meaning: '獨特的', example: '独特なスタイルです。' },
            { kanji: '大丈夫', hiragana: 'だいじょうぶ', meaning: '好的/沒事', example: '大丈夫ですか。' },
            { kanji: '大好き', hiragana: 'だいすき', meaning: '非常喜歡', example: '私はコーヒーが大好きです。' },
            { kanji: '下手', hiragana: 'へた', meaning: '不拿手/差', example: '私は絵が下手です。' },
            { kanji: '暇', hiragana: 'ひま', meaning: '空閒', example: '今日は暇ですよ。' },
            { kanji: '本当', hiragana: 'ほんとう', meaning: '真實的/真的', example: 'それは本当ですか。' },
            { kanji: '色々', hiragana: 'いろいろ', meaning: '各種各樣的', example: 'いろいろな意見があります。' },
            { kanji: '丈夫', hiragana: 'じょうぶ', meaning: '堅固的/耐用的', example: 'この机は丈夫です。' },
            { kanji: '上手', hiragana: 'じょうず', meaning: '拿手的/善於', example: '彼は日本語が上手です。' },
            { kanji: '嫌', hiragana: 'いや', meaning: '討厭的/不愉快', example: 'その味は嫌です。' },
        ],
    },
    {
        name: '副詞 (副詞)',
        icon: '→',
        description: '修飾動詞或形容詞的詞語',
        isParent: true,
        subcategories: [
            {
                name: '頻度 (頻度)',
                icon: '🔄',
                description: '發生的頻率',
                items: [
                    { kanji: 'いつも', hiragana: 'いつも', meaning: '總是', example: 'いつも朝6時に起きます。' },
                    { kanji: '大体', hiragana: 'たいてい', meaning: '通常', example: 'たいてい家にいます。' },
                    { kanji: '時々', hiragana: 'ときどき', meaning: '有時', example: 'ときどき映画を見ます。' },
                    { kanji: '良く', hiragana: 'よく', meaning: '經常/好', example: 'よく勉強します。' },
                    { kanji: '滅多に', hiragana: 'めったに', meaning: '很少', example: 'めったに遊びません。' },
                    { kanji: '全く', hiragana: 'まったく', meaning: '根本不', example: 'まったく分かりません。' },
                ],
            },
            {
                name: '時間 (時間)',
                icon: '⏱️',
                description: '事情何時發生',
                items: [
                    { kanji: 'もう', hiragana: 'もう', meaning: '已經', example: 'もう食べました。' },
                    { kanji: 'まだ', hiragana: 'まだ', meaning: '還沒有', example: 'まだ宿題をしていません。' },
                    { kanji: '直ぐ', hiragana: 'すぐ', meaning: '馬上/立即', example: 'すぐに行きます。' },
                    { kanji: '丁度', hiragana: 'ちょうど', meaning: '剛好/恰好', example: 'ちょうど今来ました。' },
                    { kanji: '既に', hiragana: 'すでに', meaning: '已經(正式)', example: 'すでに始まりました。' },
                    { kanji: 'やがて', hiragana: 'やがて', meaning: '不久/最終', example: 'やがて夜になります。' },
                ],
            },
            {
                name: '様態 (様態)',
                icon: '🎯',
                description: '做某事的方式',
                items: [
                    { kanji: 'ゆっくり', hiragana: 'ゆっくり', meaning: '緩慢地', example: 'ゆっくり歩きます。' },
                    { kanji: '早く', hiragana: 'はやく', meaning: '快速地', example: '早く走ります。' },
                    { kanji: '急いで', hiragana: 'いそいで', meaning: '匆忙地', example: '急いで行きます。' },
                    { kanji: 'そっと', hiragana: 'そっと', meaning: '輕輕地/安靜地', example: 'そっと開けます。' },
                    { kanji: 'ぐるぐる', hiragana: 'ぐるぐる', meaning: '繞來繞去', example: 'ぐるぐる回ります。' },
                    { kanji: 'ばったり', hiragana: 'ばったり', meaning: '突然/驟然', example: 'ばったり会いました。' },
                ],
            },
            {
                name: '程度 (程度)',
                icon: '📊',
                description: '等級或強度',
                items: [
                    { kanji: 'とても', hiragana: 'とても', meaning: '非常', example: 'とても好きです。' },
                    { kanji: 'かなり', hiragana: 'かなり', meaning: '相當/頗', example: 'かなり暑いですね。' },
                    { kanji: 'ちょっと', hiragana: 'ちょっと', meaning: '一點', example: 'ちょっと待ってください。' },
                    { kanji: '殆ど', hiragana: 'ほぼ', meaning: '幾乎', example: 'ほぼ完成しました。' },
                    { kanji: 'そこそこ', hiragana: 'そこそこ', meaning: '還可以', example: 'そこそこ上手です。' },
                    { kanji: 'ほんの', hiragana: 'ほんの', meaning: '只是/僅', example: 'ほんの少しです。' },
                ],
            },
            {
                name: '確信 (確信)',
                icon: '💭',
                description: '確定性或概率',
                items: [
                    { kanji: 'きっと', hiragana: 'きっと', meaning: '一定/肯定', example: 'きっと来ると思います。' },
                    { kanji: '多分', hiragana: 'たぶん', meaning: '大概', example: 'たぶん明日雨でしょう。' },
                    { kanji: 'ひょっと', hiragana: 'ひょっと', meaning: '也許/可能', example: 'ひょっと来るかもしれません。' },
                    { kanji: 'もしかして', hiragana: 'もしかして', meaning: '也許/可能', example: 'もしかして知っていますか。' },
                    { kanji: 'まさか', hiragana: 'まさか', meaning: '豈能/怎麼可能', example: 'まさか本当ですか。' },
                    { kanji: 'おそらく', hiragana: 'おそらく', meaning: '大概/恐怕', example: 'おそらく大丈夫でしょう。' },
                ],
            },
            {
                name: '性狀 (性狀)',
                icon: '✨',
                description: '存在或狀態',
                items: [
                    { kanji: 'きちんと', hiragana: 'きちんと', meaning: '恰當地/整齊地', example: 'きちんと並びます。' },
                    { kanji: 'しっかり', hiragana: 'しっかり', meaning: '牢固地/穩健地', example: 'しっかり握ります。' },
                    { kanji: 'ぼんやり', hiragana: 'ぼんやり', meaning: '模糊地/昏暗地', example: 'ぼんやり見えます。' },
                    { kanji: 'はっきり', hiragana: 'はっきり', meaning: '清楚地/明確地', example: 'はっきり見えます。' },
                    { kanji: 'ふんわり', hiragana: 'ふんわり', meaning: '柔和地/蓬鬆地', example: 'ふんわり包みます。' },
                    { kanji: 'ぴたり', hiragana: 'ぴたり', meaning: '恰好地/完全地', example: 'ぴたり止まります。' },
                ],
            },
            {
                name: '對應 (對應)',
                icon: '🔗',
                description: '表達對比或對應的成對副詞',
                items: [
                    { kanji: '前に', hiragana: 'まえに', meaning: '之前/先前', example: '前に来ました。' },
                    { kanji: '後に', hiragana: 'あとに', meaning: '之後/稍後', example: '後に行きます。' },
                    { kanji: '上に', hiragana: 'うえに', meaning: '上面/況且', example: 'その上に失礼です。' },
                    { kanji: '下に', hiragana: 'したに', meaning: '下面/底下', example: 'テーブルの下にあります。' },
                    { kanji: '片方は', hiragana: 'かたほうは', meaning: '一方面', example: '片方は好きです。' },
                    { kanji: 'もう片方は', hiragana: 'もうかたほうは', meaning: '另一方面', example: 'もう片方は嫌です。' },
                    { kanji: '中に', hiragana: 'なかに', meaning: '裡面/內部', example: '部屋の中にいます。' },
                    { kanji: '外に', hiragana: 'そとに', meaning: '外面/外側', example: '外に出ます。' },
                    { kanji: '左に', hiragana: 'ひだりに', meaning: '向左/左邊', example: '左に曲がります。' },
                    { kanji: '右に', hiragana: 'みぎに', meaning: '向右/右邊', example: '右に進みます。' },
                    { kanji: '隣に', hiragana: 'となりに', meaning: '在旁邊/相鄰/旁邊', example: '友達が隣にいます。' },
                    { kanji: '向こうに', hiragana: 'むこうに', meaning: '在那邊/對面', example: '向こうに山があります。' },
                    { kanji: 'こちらに', hiragana: 'こちらに', meaning: '這邊/過來', example: 'こちらに来てください。' },
                    { kanji: '奥に', hiragana: 'おくに', meaning: '裡深處/後面/內部', example: '奥に隠しています。' },
                    { kanji: '手前に', hiragana: 'てまえに', meaning: '前面/靠近', example: '手前に止めてください。' },
                    { kanji: '側に', hiragana: 'がわに', meaning: '旁邊/側面', example: '川の側に歩きます。' },
                    { kanji: '近くに', hiragana: 'ちかくに', meaning: '靠近/附近', example: '駅の近くに住んでいます。' },
                    { kanji: '遠く', hiragana: 'とおく', meaning: '遠方/遙遠', example: '遠くに見えます。' },
                ],
            },
        ],
    },
    {
        name: '常用表現 (常用表現)',
        icon: '💬',
        description: '必要的是/否回應的禮貌和隨意形式',
        isParent: true,
        subcategories: [
            {
                name: '禮貌的 (丁寧)',
                icon: '🤝',
                description: '正式和禮貌的是/否表達',
                items: [
                    { kanji: 'はい', hiragana: 'はい', meaning: '是(禮貌)', example: 'はい、分かりました。' },
                    { kanji: 'いいえ', hiragana: 'いいえ', meaning: '否(禮貌)', example: 'いいえ、知りません。' },
                    { kanji: 'かしこまりました', hiragana: 'かしこまりました', meaning: '明白/當然(非常禮貌)', example: 'かしこまりました、すぐにお持ちします。' },
                    { kanji: '承知しました', hiragana: 'しょうちしました', meaning: '明白(正式)', example: '承知しました、確認いたします。' },
                    { kanji: 'そうですね', hiragana: 'そうですね', meaning: '對的/是(禮貌同意)', example: 'そうですね、その通りです。' },
                    { kanji: 'そうではありません', hiragana: 'そうではありません', meaning: '不對(禮貌異議)', example: 'そうではありません、別の理由です。' },
                    { kanji: 'ありがとうございます', hiragana: 'ありがとうございます', meaning: '非常感謝', example: 'ありがとうございます、助かります。' },
                    { kanji: 'どういたしまして', hiragana: 'どういたしまして', meaning: '不用謝(禮貌)', example: 'どういたしまして、お役に立てて光栄です。' },
                ],
            },
            {
                name: '隨便的 (カジュアル)',
                icon: '😊',
                description: '非正式和隨便的是/否表達',
                items: [
                    { kanji: 'うん', hiragana: 'うん', meaning: '是(隨便)', example: 'うん、いいよ。' },
                    { kanji: 'ううん', hiragana: 'ううん', meaning: '否(隨便)', example: 'ううん、行かない。' },
                    { kanji: 'まじで', hiragana: 'まじで', meaning: '真的?(隨便/俚語)', example: 'まじで？本当？' },
                    { kanji: 'やっぱり', hiragana: 'やっぱり', meaning: '我想/終究(隨便)', example: 'やっぱり、そうだった。' },
                    { kanji: 'だよね', hiragana: 'だよね', meaning: '對吧?(隨便同意)', example: 'そうだよね、楽しかった。' },
                    { kanji: 'ちゃう', hiragana: 'ちゃう', meaning: '否/錯(隨便)', example: 'ちゃう、違うよ。' },
                    { kanji: 'ありがとね', hiragana: 'ありがとね', meaning: '感謝(隨便)', example: 'ありがとね、助かったよ。' },
                    { kanji: 'いいや', hiragana: 'いいや', meaning: '拒絕(隨便)', example: 'いいや、今日は疲れた。' },
                ],
            },
        ],
    },
    {
        name: '助詞 (助詞)',
        icon: '◆',
        description: '表示文法關係的功能詞',
        items: [
            { kanji: 'は', hiragana: 'は', meaning: '主題助詞', example: '私は学生です。' },
            { kanji: 'を', hiragana: 'を', meaning: '受詞助詞', example: '本を読みます。' },
            { kanji: 'に', hiragana: 'に', meaning: '目標/方向助詞', example: '学校に行きます。' },
            { kanji: 'へ', hiragana: 'へ', meaning: '方向助詞', example: '公園へ行きます。' },
            { kanji: 'で', hiragana: 'で', meaning: '場所/方式助詞', example: '図書館で勉強します。' },
            { kanji: 'が', hiragana: 'が', meaning: '主語助詞', example: '誰が来ましたか。' },
            { kanji: 'の', hiragana: 'の', meaning: '所有助詞', example: '私の本です。' },
            { kanji: 'も', hiragana: 'も', meaning: '也助詞', example: '私も好きです。' },
            { kanji: 'か', hiragana: 'か', meaning: '疑問助詞', example: '来ますか。' },
            { kanji: 'から', hiragana: 'から', meaning: '從/因為', example: '月曜日から始まります。' },
            { kanji: 'まで', hiragana: 'まで', meaning: '直到/到', example: '5時まで待ちます。' },
            { kanji: 'や', hiragana: 'や', meaning: '和(列舉)', example: 'りんごやみかんが好きです。' },
            { kanji: 'と', hiragana: 'と', meaning: '和/與', example: '友達と遊びます。' },
            { kanji: 'より', hiragana: 'より', meaning: '比/從', example: '兄より背が高いです。' },
            { kanji: '等', hiragana: 'など', meaning: '等等', example: '本や雑誌などが好きです。' },
            { kanji: 'ぐらい', hiragana: 'ぐらい', meaning: '左右/約', example: '1時間ぐらい待ちました。' },
            { kanji: 'くらい', hiragana: 'くらい', meaning: '約/左右', example: '2日くらい休みました。' },
            { kanji: '程', hiragana: 'ほど', meaning: '至於/程度', example: 'そんなに好きではありません。' },
            { kanji: 'だけ', hiragana: 'だけ', meaning: '只', example: '水だけ飲みます。' },
            { kanji: 'ぐらい', hiragana: 'ぐらい', meaning: '大約', example: '毎日3時間ぐらい勉強します。' },
        ],
    },
    {
        name: '片假名 (カタカナ)',
        icon: 'カ',
        description: 'N5級外來詞用片假名書寫',
        items: [
            { kanji: 'アパート', hiragana: 'あぱーと', meaning: '公寓', example: 'アパートに住んでいます。' },
            { kanji: 'バス', hiragana: 'ばす', meaning: '巴士', example: 'バスに乗ります。' },
            { kanji: 'バター', hiragana: 'ばたー', meaning: '黃油', example: 'バターを塗ります。' },
            { kanji: 'ベッド', hiragana: 'べっど', meaning: '床', example: 'ベッドで寝ます。' },
            { kanji: 'ボールペン', hiragana: 'ぼーるぺん', meaning: '圓珠筆', example: 'ボールペンで書きます。' },
            { kanji: 'ボタン', hiragana: 'ぼたん', meaning: '按鈕', example: 'ボタンをクリックします。' },
            { kanji: 'デパート', hiragana: 'でぱーと', meaning: '百貨公司', example: 'デパートで買い物します。' },
            { kanji: 'ドア', hiragana: 'どあ', meaning: '門', example: 'ドアを開けてください。' },
            { kanji: 'エレベーター', hiragana: 'えれべーたー', meaning: '電梯', example: 'エレベーターで上がります。' },
            { kanji: 'フィルム', hiragana: 'ふぃるむ', meaning: '膠卷', example: 'フィルムをカメラに入れます。' },
            { kanji: 'フォーク', hiragana: 'ふぉーく', meaning: '叉子', example: 'フォークで食べます。' },
            { kanji: 'ギター', hiragana: 'ぎたー', meaning: '吉他', example: 'ギターを弾きます。' },
            { kanji: 'グラム', hiragana: 'ぐらむ', meaning: '克', example: '100グラムです。' },
            { kanji: 'ハンカチ', hiragana: 'はんかち', meaning: '手帕', example: 'ハンカチを持っています。' },
            { kanji: 'ホテル', hiragana: 'ほてる', meaning: '旅館', example: 'ホテルに泊まります。' },
            { kanji: 'カメラ', hiragana: 'かめら', meaning: '相機', example: 'カメラで写真を撮ります。' },
            { kanji: 'カップ', hiragana: 'かっぷ', meaning: '杯子', example: 'カップでコーヒーを飲みます。' },
            { kanji: 'カレー', hiragana: 'かれー', meaning: '咖哩', example: 'カレーを食べます。' },
            { kanji: 'カレンダー', hiragana: 'かれんだー', meaning: '日曆', example: 'カレンダーを見ます。' },
            { kanji: 'キログラム', hiragana: 'きろぐらむ', meaning: '千克', example: '5キログラムです。' },
            { kanji: 'キロメートル', hiragana: 'きろめーとる', meaning: '公里', example: '10キロメートル走ります。' },
            { kanji: 'コーヒー', hiragana: 'こーひー', meaning: '咖啡', example: 'コーヒーが好きです。' },
            { kanji: 'コート', hiragana: 'こーと', meaning: '外套', example: 'コートを着ます。' },
            { kanji: 'コピー', hiragana: 'こぴー', meaning: '複印/副本', example: 'コピーをします。' },
            { kanji: 'コップ', hiragana: 'こっぷ', meaning: '玻璃杯', example: 'コップで水を飲みます。' },
            { kanji: 'クラス', hiragana: 'くらす', meaning: '班級', example: 'クラスに行きます。' },
            { kanji: 'マッチ', hiragana: 'まっち', meaning: '火柴', example: 'マッチで火をつけます。' },
            { kanji: 'メートル', hiragana: 'めーとる', meaning: '米', example: '2メートルです。' },
            { kanji: 'ナイフ', hiragana: 'ないふ', meaning: '刀子', example: 'ナイフで切ります。' },
            { kanji: 'ネクタイ', hiragana: 'ねくたい', meaning: '領帶', example: 'ネクタイをつけます。' },
            { kanji: 'ノート', hiragana: 'のーと', meaning: '筆記本', example: 'ノートに書きます。' },
            { kanji: 'オムレツ', hiragana: 'おむれつ', meaning: '蛋捲', example: 'オムレツを食べます。' },
            { kanji: 'オレンジ', hiragana: 'おれんじ', meaning: '橙子', example: 'オレンジジュースを飲みます。' },
            { kanji: 'パン', hiragana: 'ぱん', meaning: '麵包', example: 'パンを食べます。' },
            { kanji: 'パイロット', hiragana: 'ぱいろっと', meaning: '飛行員', example: 'パイロットになりたいです。' },
            { kanji: 'ペン', hiragana: 'ぺん', meaning: '筆', example: 'ペンで書きます。' },
            { kanji: 'ピアノ', hiragana: 'ぴあの', meaning: '鋼琴', example: 'ピアノを弾きます。' },
            { kanji: 'ピクニック', hiragana: 'ぴくにっく', meaning: '野餐', example: 'ピクニックに行きます。' },
            { kanji: 'プール', hiragana: 'ぷーる', meaning: '游泳池', example: 'プールで泳ぎます。' },
            { kanji: 'プリンター', hiragana: 'ぷりんたー', meaning: '打印機', example: 'プリンターで印刷します。' },
            { kanji: 'ラッパ', hiragana: 'らっぱ', meaning: '喇叭', example: 'ラッパを吹きます。' },
            { kanji: 'ラジオ', hiragana: 'らじお', meaning: '收音機', example: 'ラジオを聞きます。' },
            { kanji: 'レコード', hiragana: 'れこーど', meaning: '黑膠唱片', example: 'レコードを聞きます。' },
            { kanji: 'レストラン', hiragana: 'れすとらん', meaning: '餐廳', example: 'レストランで食べます。' },
            { kanji: 'リング', hiragana: 'りんぐ', meaning: '戒指', example: 'リングを売ります。' },
            { kanji: 'ルーペ', hiragana: 'るーぺ', meaning: '放大鏡', example: 'ルーペで見ます。' },
            { kanji: 'ロボット', hiragana: 'ろぼっと', meaning: '機器人', example: 'ロボットです。' },
            { kanji: 'サッカー', hiragana: 'さっかー', meaning: '足球', example: 'サッカーをします。' },
            { kanji: 'サンドイッチ', hiragana: 'さんどいっち', meaning: '三明治', example: 'サンドイッチを食べます。' },
            { kanji: 'シャツ', hiragana: 'しゃつ', meaning: '襯衫', example: 'シャツを着ます。' },
            { kanji: 'スキー', hiragana: 'すきー', meaning: '滑雪', example: 'スキーをします。' },
            { kanji: 'スプーン', hiragana: 'すぷーん', meaning: '湯匙', example: 'スプーンで食べます。' },
            { kanji: 'スーパー', hiragana: 'すーぱー', meaning: '超市', example: 'スーパーに行きます。' },
            { kanji: 'ステッキ', hiragana: 'すてっき', meaning: '手杖', example: 'ステッキを持ちます。' },
            { kanji: 'ストップ', hiragana: 'すとっぷ', meaning: '停止', example: 'ストップです。' },
            { kanji: 'テーブル', hiragana: 'てーぶる', meaning: '桌子', example: 'テーブルに座ります。' },
            { kanji: 'テレビ', hiragana: 'てれび', meaning: '電視', example: 'テレビを見ます。' },
            { kanji: 'テニス', hiragana: 'てにす', meaning: '網球', example: 'テニスをします。' },
            { kanji: 'トマト', hiragana: 'とまと', meaning: '番茄', example: 'トマトを食べます。' },
            { kanji: 'トレーニング', hiragana: 'とれーにんぐ', meaning: '訓練', example: 'トレーニングをします。' },
        ],
    },
];

export default function VocabSectionZh() {
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
            <h3 className="text-2xl font-bold mb-4 text-pink-400">N5 詞彙 (語彙)</h3>

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
                    <p className="text-xs font-semibold text-indigo-300 mb-3 uppercase tracking-wider">名詞主題</p>
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
                                        <p className="text-xs text-slate-400 mb-1">例句:</p>
                                        <p className="text-sm text-slate-300">{item.example}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <p className="text-slate-400 text-center py-8">選擇上面的名詞子類別以查看詞語</p>
            )}
        </div>
    );
}

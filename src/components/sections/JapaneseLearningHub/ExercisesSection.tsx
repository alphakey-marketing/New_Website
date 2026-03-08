import classNames from 'classnames';
import { useState, useMemo, useEffect } from 'react';
import PersonalSRS from './PersonalSRS';
import { 
    updateVocabProgress, 
    getPrioritizedVocab, 
    addQuizScore, 
    updateStudyStreak, 
    isLoggedIn,
    getProgress
} from '@/utils/progressTracking';

interface FlashcardItem {
    kanji: string;
    hiragana: string;
    meaning: string;
}

interface VerbConjugation {
    base: string;
    furigana: string;
    meaning: string;
    conjugations: Array<{
        form: string;
        result: string;
    }>;
}

interface NounConjugation {
    base: string;
    furigana: string;
    meaning: string;
    conjugations: Array<{
        category: string;
        form: string;
        result: string;
        explanation: string;
    }>;
}

interface AdjectiveConjugation {
    base: string;
    furigana: string;
    meaning: string;
    type: 'i' | 'na';
    conjugations: Array<{
        category: string;
        form: string;
        result: string;
        explanation: string;
    }>;
}

const vocabularyData: FlashcardItem[] = [
    { kanji: '朝', hiragana: 'あさ', meaning: 'Morning' },
    { kanji: '昼', hiragana: 'ひる', meaning: 'Noon' },
    { kanji: '晩', hiragana: 'ばん', meaning: 'Evening' },
    { kanji: '夜', hiragana: 'よる', meaning: 'Night' },
    { kanji: '朝日', hiragana: 'あさひ', meaning: 'Morning sun' },
    { kanji: '夜明け', hiragana: 'よあけ', meaning: 'Dawn' },
    { kanji: '日', hiragana: 'ひ', meaning: 'Day' },
    { kanji: '週', hiragana: 'しゅう', meaning: 'Week' },
    { kanji: '月', hiragana: 'つき', meaning: 'Month' },
    { kanji: '年', hiragana: 'ねん', meaning: 'Year' },
    { kanji: '時間', hiragana: 'じかん', meaning: 'Time/Hour' },
    { kanji: '分', hiragana: 'ふん', meaning: 'Minute' },
    { kanji: '秒', hiragana: 'びょう', meaning: 'Second' },
    { kanji: '今', hiragana: 'いま', meaning: 'Now' },
    { kanji: '昨日', hiragana: 'きのう', meaning: 'Yesterday' },
    { kanji: '今日', hiragana: 'きょう', meaning: 'Today' },
    { kanji: '明日', hiragana: 'あした', meaning: 'Tomorrow' },
    { kanji: '月曜日', hiragana: 'げつようび', meaning: 'Monday' },
    { kanji: '火曜日', hiragana: 'かようび', meaning: 'Tuesday' },
    { kanji: '水曜日', hiragana: 'すいようび', meaning: 'Wednesday' },
    { kanji: '木曜日', hiragana: 'もくようび', meaning: 'Thursday' },
    { kanji: '金曜日', hiragana: 'きんようび', meaning: 'Friday' },
    { kanji: '土曜日', hiragana: 'どようび', meaning: 'Saturday' },
    { kanji: '日曜日', hiragana: 'にちようび', meaning: 'Sunday' },
    { kanji: '一月', hiragana: 'いちがつ', meaning: 'January' },
    { kanji: '二月', hiragana: 'にがつ', meaning: 'February' },
    { kanji: '三月', hiragana: 'さんがつ', meaning: 'March' },
    { kanji: '春', hiragana: 'はる', meaning: 'Spring' },
    { kanji: '夏', hiragana: 'なつ', meaning: 'Summer' },
    { kanji: '秋', hiragana: 'あき', meaning: 'Autumn' },
    { kanji: '冬', hiragana: 'ふゆ', meaning: 'Winter' },
    { kanji: '私', hiragana: 'わたし', meaning: 'I/Me' },
    { kanji: 'あなた', hiragana: 'あなた', meaning: 'You' },
    { kanji: '彼', hiragana: 'かれ', meaning: 'He' },
    { kanji: '彼女', hiragana: 'かのじょ', meaning: 'She/Girlfriend' },
    { kanji: '誰', hiragana: 'だれ', meaning: 'Who' },
    { kanji: '人', hiragana: 'ひと', meaning: 'Person' },
    { kanji: '赤ちゃん', hiragana: 'あかちゃん', meaning: 'Baby' },
    { kanji: '子ども', hiragana: 'こども', meaning: 'Child' },
    { kanji: '男の子', hiragana: 'おとこのこ', meaning: 'Boy' },
    { kanji: '女の子', hiragana: 'おんなのこ', meaning: 'Girl' },
    { kanji: '大人', hiragana: 'おとな', meaning: 'Adult' },
    { kanji: '老人', hiragana: 'ろうじん', meaning: 'Elderly person' },
    { kanji: '父', hiragana: 'ちち', meaning: 'Father' },
    { kanji: '母', hiragana: 'はは', meaning: 'Mother' },
    { kanji: '兄', hiragana: 'あに', meaning: 'Older brother' },
    { kanji: '姉', hiragana: 'あね', meaning: 'Older sister' },
    { kanji: '弟', hiragana: 'おとうと', meaning: 'Younger brother' },
    { kanji: '妹', hiragana: 'いもうと', meaning: 'Younger sister' },
    { kanji: '親', hiragana: 'おや', meaning: 'Parent' },
    { kanji: '祖父', hiragana: 'そふ', meaning: 'Grandfather' },
    { kanji: '祖母', hiragana: 'そぼ', meaning: 'Grandmother' },
    { kanji: '叔父', hiragana: 'おじ', meaning: 'Uncle' },
    { kanji: '叔母', hiragana: 'おば', meaning: 'Aunt' },
    { kanji: 'いとこ', hiragana: 'いとこ', meaning: 'Cousin' },
    { kanji: '夫', hiragana: 'おっと', meaning: 'Husband' },
    { kanji: '妻', hiragana: 'つま', meaning: 'Wife' },
    { kanji: '家族', hiragana: 'かぞく', meaning: 'Family' },
    { kanji: '友達', hiragana: 'ともだち', meaning: 'Friend' },
    { kanji: '友人', hiragana: 'ゆうじん', meaning: 'Friend (formal)' },
    { kanji: '同級生', hiragana: 'どうきゅうせい', meaning: 'Classmate' },
    { kanji: '本', hiragana: 'ほん', meaning: 'Book' },
    { kanji: 'ノート', hiragana: 'のーと', meaning: 'Notebook' },
    { kanji: 'ペン', hiragana: 'ぺん', meaning: 'Pen' },
    { kanji: '鉛筆', hiragana: 'えんぴつ', meaning: 'Pencil' },
    { kanji: '消しゴム', hiragana: 'けしゴム', meaning: 'Eraser' },
    { kanji: 'バッグ', hiragana: 'ばっぐ', meaning: 'Bag' },
    { kanji: '机', hiragana: 'つくえ', meaning: 'Desk/Table' },
    { kanji: '椅子', hiragana: 'いす', meaning: 'Chair' },
    { kanji: '床', hiragana: 'ゆか', meaning: 'Floor' },
    { kanji: 'ドア', hiragana: 'どあ', meaning: 'Door' },
    { kanji: '窓', hiragana: 'まど', meaning: 'Window' },
    { kanji: 'ライト', hiragana: 'らいと', meaning: 'Light' },
    { kanji: 'ベッド', hiragana: 'べっど', meaning: 'Bed' },
    { kanji: 'テレビ', hiragana: 'てれび', meaning: 'Television' },
    { kanji: '時計', hiragana: 'とけい', meaning: 'Clock/Watch' },
    { kanji: '携帯電話', hiragana: 'けいたいでんわ', meaning: 'Mobile phone' },
    { kanji: 'コンピューター', hiragana: 'こんぴゅーたー', meaning: 'Computer' },
    { kanji: 'ご飯', hiragana: 'ごはん', meaning: 'Rice/Meal' },
    { kanji: 'パン', hiragana: 'ぱん', meaning: 'Bread' },
    { kanji: 'メロン', hiragana: 'めろん', meaning: 'Melon' },
    { kanji: 'リンゴ', hiragana: 'りんご', meaning: 'Apple' },
    { kanji: 'ミカン', hiragana: 'みかん', meaning: 'Mandarin orange' },
    { kanji: 'バナナ', hiragana: 'ばなな', meaning: 'Banana' },
    { kanji: '卵', hiragana: 'たまご', meaning: 'Egg' },
    { kanji: 'チーズ', hiragana: 'ちーず', meaning: 'Cheese' },
    { kanji: 'バター', hiragana: 'ばたー', meaning: 'Butter' },
    { kanji: '水', hiragana: 'みず', meaning: 'Water' },
    { kanji: 'お茶', hiragana: 'おちゃ', meaning: 'Tea' },
    { kanji: 'コーヒー', hiragana: 'こーひー', meaning: 'Coffee' },
    { kanji: 'ジュース', hiragana: 'じゅーす', meaning: 'Juice' },
    { kanji: '家', hiragana: 'いえ', meaning: 'House' },
    { kanji: '部屋', hiragana: 'へや', meaning: 'Room' },
    { kanji: 'アパート', hiragana: 'あぱーと', meaning: 'Apartment' },
    { kanji: '学校', hiragana: 'がっこう', meaning: 'School' },
    { kanji: '教室', hiragana: 'きょうしつ', meaning: 'Classroom' },
    { kanji: '図書館', hiragana: 'としょかん', meaning: 'Library' },
    { kanji: '会社', hiragana: 'かいしゃ', meaning: 'Company' },
    { kanji: 'オフィス', hiragana: 'おふぃす', meaning: 'Office' },
    { kanji: '工場', hiragana: 'こうじょう', meaning: 'Factory' },
    { kanji: '店', hiragana: 'みせ', meaning: 'Store/Shop' },
    { kanji: 'スーパー', hiragana: 'すーぱー', meaning: 'Supermarket' },
    { kanji: 'レストラン', hiragana: 'れすとらん', meaning: 'Restaurant' },
    { kanji: 'カフェ', hiragana: 'かふぇ', meaning: 'Cafe' },
    { kanji: '銀行', hiragana: 'ぎんこう', meaning: 'Bank' },
    { kanji: '病院', hiragana: 'びょういん', meaning: 'Hospital' },
    { kanji: '駅', hiragana: 'えき', meaning: 'Station' },
    { kanji: '空港', hiragana: 'くうこう', meaning: 'Airport' },
    { kanji: '街', hiragana: 'まち', meaning: 'Town/City' },
    { kanji: '公園', hiragana: 'こうえん', meaning: 'Park' },
    { kanji: 'ビーチ', hiragana: 'びーち', meaning: 'Beach' },
    { kanji: '山', hiragana: 'やま', meaning: 'Mountain' },
    { kanji: '森', hiragana: 'もり', meaning: 'Forest' },
    { kanji: '川', hiragana: 'かわ', meaning: 'River' },
    { kanji: '池', hiragana: 'いけ', meaning: 'Pond' },
    { kanji: '海', hiragana: 'うみ', meaning: 'Sea/Ocean' },
    { kanji: 'ジム', hiragana: 'じむ', meaning: 'Gym' },
    { kanji: 'プール', hiragana: 'ぷーる', meaning: 'Swimming pool' },
    { kanji: 'シアター', hiragana: 'しあたー', meaning: 'Theater' },
    { kanji: '音楽ホール', hiragana: 'おんがくほーる', meaning: 'Concert hall' },
    { kanji: '寺', hiragana: 'てら', meaning: 'Temple' },
    { kanji: '学生', hiragana: 'がくせい', meaning: 'Student' },
    { kanji: '先生', hiragana: 'せんせい', meaning: 'Teacher' },
    { kanji: '医者', hiragana: 'いしゃ', meaning: 'Doctor' },
    { kanji: '看護師', hiragana: 'かんごし', meaning: 'Nurse' },
    { kanji: 'エンジニア', hiragana: 'えんじにあ', meaning: 'Engineer' },
    { kanji: 'プログラマー', hiragana: 'ぷろぐらまー', meaning: 'Programmer' },
    { kanji: '会社員', hiragana: 'かいしゃいん', meaning: 'Company employee' },
    { kanji: 'マネージャー', hiragana: 'まねーじゃー', meaning: 'Manager' },
    { kanji: '営業', hiragana: 'えいぎょう', meaning: 'Sales representative' },
    { kanji: '事務員', hiragana: 'じむいん', meaning: 'Office worker' },
    { kanji: 'シェフ', hiragana: 'しぇふ', meaning: 'Chef' },
    { kanji: 'コック', hiragana: 'こっく', meaning: 'Cook' },
    { kanji: 'ウェイター', hiragana: 'うぇいたー', meaning: 'Waiter' },
    { kanji: 'ウェイトレス', hiragana: 'うぇいとれす', meaning: 'Waitress' },
    { kanji: '警察官', hiragana: 'けいさつかん', meaning: 'Police officer' },
    { kanji: '消防士', hiragana: 'しょうぼうし', meaning: 'Firefighter' },
    { kanji: 'ドライバー', hiragana: 'どらいばー', meaning: 'Driver' },
    { kanji: 'パイロット', hiragana: 'ぱいろっと', meaning: 'Pilot' },
    { kanji: 'ガイド', hiragana: 'がいど', meaning: 'Guide' },
    { kanji: '翻訳者', hiragana: 'ほんやくしゃ', meaning: 'Translator' },
    { kanji: '作家', hiragana: 'さっか', meaning: 'Writer' },
    { kanji: '画家', hiragana: 'がか', meaning: 'Painter' },
    { kanji: 'デザイナー', hiragana: 'でざいなー', meaning: 'Designer' },
    { kanji: 'アーティスト', hiragana: 'あーてぃすと', meaning: 'Artist' },
    { kanji: '音楽家', hiragana: 'おんがくか', meaning: 'Musician' },
    { kanji: '俳優', hiragana: 'はいゆう', meaning: 'Actor' },
    { kanji: 'モデル', hiragana: 'もでる', meaning: 'Model' },
    { kanji: 'スポーツ選手', hiragana: 'すぽーつせんしゅ', meaning: 'Athlete' },
    { kanji: 'コーチ', hiragana: 'こーち', meaning: 'Coach' },
    { kanji: '農家', hiragana: 'のうか', meaning: 'Farmer' },
    { kanji: '一', hiragana: 'いち', meaning: 'One' },
    { kanji: '二', hiragana: 'に', meaning: 'Two' },
    { kanji: '三', hiragana: 'さん', meaning: 'Three' },
    { kanji: '四', hiragana: 'し', meaning: 'Four' },
    { kanji: '五', hiragana: 'ご', meaning: 'Five' },
    { kanji: '六', hiragana: 'ろく', meaning: 'Six' },
    { kanji: '七', hiragana: 'しち', meaning: 'Seven' },
    { kanji: '八', hiragana: 'はち', meaning: 'Eight' },
    { kanji: '九', hiragana: 'きゅう', meaning: 'Nine' },
    { kanji: '十', hiragana: 'じゅう', meaning: 'Ten' },
    { kanji: '百', hiragana: 'ひゃく', meaning: 'Hundred' },
    { kanji: '千', hiragana: 'せん', meaning: 'Thousand' },
    { kanji: '万', hiragana: 'まん', meaning: 'Ten thousand' },
    { kanji: '個', hiragana: 'こ', meaning: 'Counter for general objects' },
    { kanji: '冊', hiragana: 'さつ', meaning: 'Counter for books' },
    { kanji: '枚', hiragana: 'まい', meaning: 'Counter for thin objects' },
    { kanji: '杯', hiragana: 'はい', meaning: 'Counter for cups/drinks' },
    { kanji: '皿', hiragana: 'さら', meaning: 'Counter for dishes/plates' },
    { kanji: '台', hiragana: 'だい', meaning: 'Counter for machines/vehicles' },
    { kanji: '本', hiragana: 'ほん', meaning: 'Counter for long objects' },
    { kanji: '組', hiragana: 'くみ', meaning: 'Counter for pairs/groups' },
    { kanji: '匹', hiragana: 'ひき', meaning: 'Counter for small animals' },
    { kanji: '羽', hiragana: 'わ', meaning: 'Counter for birds/small animals' },
    { kanji: '層', hiragana: 'そう', meaning: 'Counter for layers/floors' },
    { kanji: '回', hiragana: 'かい', meaning: 'Counter for times/occurrences' },
    { kanji: '度', hiragana: 'ど', meaning: 'Counter for times/degrees' },
    { kanji: '対', hiragana: 'つい', meaning: 'Counter for pairs' },
    { kanji: 'ダース', hiragana: 'だーす', meaning: 'Dozen' },
    { kanji: 'グラム', hiragana: 'ぐらむ', meaning: 'Gram' },
    { kanji: 'リットル', hiragana: 'りっとる', meaning: 'Liter' },
    { kanji: '晴れ', hiragana: 'はれ', meaning: 'Clear/Sunny' },
    { kanji: '曇り', hiragana: 'くもり', meaning: 'Cloudy' },
    { kanji: '雨', hiragana: 'あめ', meaning: 'Rain' },
    { kanji: '雪', hiragana: 'ゆき', meaning: 'Snow' },
    { kanji: '雷', hiragana: 'かみなり', meaning: 'Lightning/Thunder' },
    { kanji: '風', hiragana: 'かぜ', meaning: 'Wind' },
    { kanji: '霧', hiragana: 'きり', meaning: 'Fog' },
    { kanji: '虹', hiragana: 'にじ', meaning: 'Rainbow' },
    { kanji: '暑さ', hiragana: 'あつさ', meaning: 'Heat' },
    { kanji: '寒さ', hiragana: 'さむさ', meaning: 'Cold' },
    { kanji: '湿度', hiragana: 'しつど', meaning: 'Humidity' },
    { kanji: '気温', hiragana: 'きおん', meaning: 'Temperature' },
    { kanji: 'せんるい', hiragana: 'とつぜん', meaning: 'Sudden squall' },
    { kanji: 'つむじ風', hiragana: 'つむじかぜ', meaning: 'Whirlwind' },
    { kanji: '夕焼け', hiragana: 'ゆうやけ', meaning: 'Sunset' },
    { kanji: '朝焼け', hiragana: 'あさやけ', meaning: 'Sunrise' },
    { kanji: '星', hiragana: 'ほし', meaning: 'Star' },
    { kanji: '月', hiragana: 'つき', meaning: 'Moon' },
    { kanji: '太陽', hiragana: 'たいよう', meaning: 'Sun' },
    { kanji: '季節', hiragana: 'きせつ', meaning: 'Season' },
    { kanji: '春', hiragana: 'はる', meaning: 'Spring' },
    { kanji: '夏', hiragana: 'なつ', meaning: 'Summer' },
    { kanji: '秋', hiragana: 'あき', meaning: 'Autumn' },
    { kanji: '冬', hiragana: 'ふゆ', meaning: 'Winter' },
    { kanji: 'つゆ', hiragana: 'つゆ', meaning: 'Rainy season' },
    { kanji: '台風', hiragana: 'たいふう', meaning: 'Typhoon' },
    { kanji: 'オーロラ', hiragana: 'おーろら', meaning: 'Aurora' },
    { kanji: 'つらら', hiragana: 'つらら', meaning: 'Icicle' },
    { kanji: '露', hiragana: 'つゆ', meaning: 'Dew' },
    { kanji: 'イナビカリ', hiragana: 'いなびかり', meaning: 'Heat lightning' },
    { kanji: '有る', hiragana: 'ある', meaning: 'To exist (inanimate)' },
    { kanji: '言う', hiragana: 'いう', meaning: 'To say' },
    { kanji: '待つ', hiragana: 'まつ', meaning: 'To wait' },
    { kanji: '聞く', hiragana: 'きく', meaning: 'To listen/ask' },
    { kanji: '買う', hiragana: 'かう', meaning: 'To buy' },
    { kanji: '持つ', hiragana: 'もつ', meaning: 'To hold/have' },
    { kanji: '貰う', hiragana: 'もらう', meaning: 'To receive' },
    { kanji: '作る', hiragana: 'つくる', meaning: 'To make' },
    { kanji: '置く', hiragana: 'おく', meaning: 'To put/place' },
    { kanji: '返す', hiragana: 'かえす', meaning: 'To return' },
    { kanji: '立つ', hiragana: 'たつ', meaning: 'To stand' },
    { kanji: '座る', hiragana: 'すわる', meaning: 'To sit' },
    { kanji: '飲む', hiragana: 'のむ', meaning: 'To drink' },
    { kanji: '行く', hiragana: 'いく', meaning: 'To go' },
    { kanji: '読む', hiragana: 'よむ', meaning: 'To read' },
    { kanji: '書く', hiragana: 'かく', meaning: 'To write' },
    { kanji: '話す', hiragana: 'はなす', meaning: 'To speak' },
    { kanji: '歩く', hiragana: 'あるく', meaning: 'To walk' },
    { kanji: '走る', hiragana: 'はしる', meaning: 'To run' },
    { kanji: '遊ぶ', hiragana: 'あそぶ', meaning: 'To play' },
    { kanji: '居る', hiragana: 'いる', meaning: 'To exist (animate)' },
    { kanji: '上げる', hiragana: 'あげる', meaning: 'To give/raise' },
    { kanji: '開ける', hiragana: 'あける', meaning: 'To open' },
    { kanji: '閉める', hiragana: 'しめる', meaning: 'To close' },
    { kanji: '忘れる', hiragana: 'わすれる', meaning: 'To forget' },
    { kanji: '寝る', hiragana: 'ねる', meaning: 'To sleep' },
    { kanji: '降りる', hiragana: 'おりる', meaning: 'To get down' },
    { kanji: '乗せる', hiragana: 'のせる', meaning: 'To place on' },
    { kanji: '食べる', hiragana: 'たべる', meaning: 'To eat' },
    { kanji: '見る', hiragana: 'みる', meaning: 'To see/watch' },
    { kanji: '起きる', hiragana: 'おきる', meaning: 'To wake up' },
    { kanji: '考える', hiragana: 'かんがえる', meaning: 'To think' },
    { kanji: '教える', hiragana: 'おしえる', meaning: 'To teach' },
    { kanji: '下りる', hiragana: 'さがる', meaning: 'To descend' },
    { kanji: '掛ける', hiragana: 'かける', meaning: 'To hang' },
    { kanji: '決める', hiragana: 'きめる', meaning: 'To decide' },
    { kanji: '続ける', hiragana: 'つづける', meaning: 'To continue' },
    { kanji: '調べる', hiragana: 'しらべる', meaning: 'To check/investigate' },
    { kanji: '変える', hiragana: 'かえる', meaning: 'To change' },
    { kanji: '壊れる', hiragana: 'こわれる', meaning: 'To break' },
    { kanji: '来る', hiragana: 'くる', meaning: 'To come' },
    { kanji: 'する', hiragana: 'する', meaning: 'To do' },
    { kanji: '新しい', hiragana: 'あたらしい', meaning: 'New' },
    { kanji: '古い', hiragana: 'ふるい', meaning: 'Old' },
    { kanji: '大きい', hiragana: 'おおきい', meaning: 'Big' },
    { kanji: '小さい', hiragana: 'ちいさい', meaning: 'Small' },
    { kanji: '高い', hiragana: 'たかい', meaning: 'Tall/Expensive' },
    { kanji: '低い', hiragana: 'ひくい', meaning: 'Low/Short' },
    { kanji: '長い', hiragana: 'ながい', meaning: 'Long' },
    { kanji: '短い', hiragana: 'みじかい', meaning: 'Short' },
    { kanji: '美しい', hiragana: 'うつくしい', meaning: 'Beautiful' },
    { kanji: '寒い', hiragana: 'さむい', meaning: 'Cold' },
    { kanji: '暖かい', hiragana: 'あたたかい', meaning: 'Warm' },
    { kanji: '涼しい', hiragana: 'すずしい', meaning: 'Cool' },
    { kanji: '広い', hiragana: 'ひろい', meaning: 'Wide/spacious' },
    { kanji: '狭い', hiragana: 'せまい', meaning: 'Narrow' },
    { kanji: '深い', hiragana: 'ふかい', meaning: 'Deep' },
    { kanji: '浅い', hiragana: 'あさい', meaning: 'Shallow' },
    { kanji: '重い', hiragana: 'おもい', meaning: 'Heavy' },
    { kanji: '軽い', hiragana: 'かるい', meaning: 'Light' },
    { kanji: '速い', hiragana: 'はやい', meaning: 'Fast' },
    { kanji: '遅い', hiragana: 'おそい', meaning: 'Slow' },
    { kanji: '近い', hiragana: 'ちかい', meaning: 'Near' },
    { kanji: '遠い', hiragana: 'とおい', meaning: 'Far' },
    { kanji: '安い', hiragana: 'やすい', meaning: 'Cheap' },
    { kanji: '美味しい', hiragana: 'おいしい', meaning: 'Delicious' },
    { kanji: '難しい', hiragana: 'むずかしい', meaning: 'Difficult' },
    { kanji: '綺麗', hiragana: 'きれい', meaning: 'Beautiful/Clean' },
    { kanji: '有名', hiragana: 'ゆうめい', meaning: 'Famous' },
    { kanji: '簡単', hiragana: 'かんたん', meaning: 'Easy' },
    { kanji: '複雑', hiragana: 'ふくざつ', meaning: 'Complicated' },
    { kanji: '便利', hiragana: 'べんり', meaning: 'Convenient' },
    { kanji: '得意', hiragana: 'とくい', meaning: 'Good at' },
    { kanji: '不得意', hiragana: 'ふとくい', meaning: 'Bad at' },
    { kanji: '真面目', hiragana: 'まじめ', meaning: 'Serious/Diligent' },
    { kanji: 'いい加減', hiragana: 'いいかげん', meaning: 'Careless' },
    { kanji: '親切', hiragana: 'しんせつ', meaning: 'Kind' },
    { kanji: '丁寧', hiragana: 'ていねい', meaning: 'Polite' },
    { kanji: '静か', hiragana: 'しずか', meaning: 'Quiet' },
    { kanji: 'にぎやか', hiragana: 'にぎやか', meaning: 'Lively' },
    { kanji: '穏やか', hiragana: 'おだやか', meaning: 'Calm' },
    { kanji: '元気', hiragana: 'げんき', meaning: 'Energetic/Healthy' },
    { kanji: '素敵', hiragana: 'すてき', meaning: 'Wonderful' },
    { kanji: '自由', hiragana: 'じゆう', meaning: 'Free' },
    { kanji: '同じ', hiragana: 'おなじ', meaning: 'Same' },
    { kanji: '異なる', hiragana: 'ことなる', meaning: 'Different' },
    { kanji: '独特', hiragana: 'どくとく', meaning: 'Unique' },
    { kanji: 'いつも', hiragana: 'いつも', meaning: 'Always' },
    { kanji: '大体', hiragana: 'たいてい', meaning: 'Usually' },
    { kanji: '時々', hiragana: 'ときどき', meaning: 'Sometimes' },
    { kanji: '良く', hiragana: 'よく', meaning: 'Often/Well' },
    { kanji: '滅多に', hiragana: 'めったに', meaning: 'Rarely' },
    { kanji: '全く', hiragana: 'まったく', meaning: 'Not at all' },
    { kanji: 'もう', hiragana: 'もう', meaning: 'Already' },
    { kanji: 'まだ', hiragana: 'まだ', meaning: 'Not yet' },
    { kanji: '直ぐ', hiragana: 'すぐ', meaning: 'Soon/Right away' },
    { kanji: '丁度', hiragana: 'ちょうど', meaning: 'Just/Exactly' },
    { kanji: '既に', hiragana: 'すでに', meaning: 'Already (formal)' },
    { kanji: 'やがて', hiragana: 'やがて', meaning: 'Soon/Eventually' },
    { kanji: 'ゆっくり', hiragana: 'ゆっくり', meaning: 'Slowly' },
    { kanji: '早く', hiragana: 'はやく', meaning: 'Quickly' },
    { kanji: '急いで', hiragana: 'いそいで', meaning: 'In a hurry' },
    { kanji: 'そっと', hiragana: 'そっと', meaning: 'Gently/Quietly' },
    { kanji: 'ぐるぐる', hiragana: 'ぐるぐる', meaning: 'Around and around' },
    { kanji: 'ばったり', hiragana: 'ばったり', meaning: 'Suddenly/Abruptly' },
    { kanji: 'とても', hiragana: 'とても', meaning: 'Very' },
    { kanji: 'かなり', hiragana: 'かなり', meaning: 'Quite/Fairly' },
    { kanji: 'ちょっと', hiragana: 'ちょっと', meaning: 'A little' },
    { kanji: '殆ど', hiragana: 'ほぼ', meaning: 'Almost' },
    { kanji: 'そこそこ', hiragana: 'そこそこ', meaning: 'Moderately' },
    { kanji: 'ほんの', hiragana: 'ほんの', meaning: 'Just/Only' },
    { kanji: 'きっと', hiragana: 'きっと', meaning: 'Surely/Definitely' },
    { kanji: '多分', hiragana: 'たぶん', meaning: 'Probably' },
    { kanji: 'ひょっと', hiragana: 'ひょっと', meaning: 'Perhaps/Maybe' },
    { kanji: 'もしかして', hiragana: 'もしかして', meaning: 'Perhaps/Possibly' },
    { kanji: 'まさか', hiragana: 'まさか', meaning: 'Surely not' },
    { kanji: 'おそらく', hiragana: 'おそらく', meaning: 'Probably' },
    { kanji: 'きちんと', hiragana: 'きちんと', meaning: 'Properly/Neatly' },
    { kanji: 'しっかり', hiragana: 'しっかり', meaning: 'Firmly/Securely' },
    { kanji: 'ぼんやり', hiragana: 'ぼんやり', meaning: 'Vaguely/Dimly' },
    { kanji: 'はっきり', hiragana: 'はっきり', meaning: 'Clearly' },
    { kanji: 'ふんわり', hiragana: 'ふんわり', meaning: 'Softly/Fluffy' },
    { kanji: 'ぴたり', hiragana: 'ぴたり', meaning: 'Exactly/Precisely' },
    { kanji: '前に', hiragana: 'まえに', meaning: 'Before/Previously' },
    { kanji: '後に', hiragana: 'あとに', meaning: 'After/Later' },
    { kanji: '上に', hiragana: 'うえに', meaning: 'On top/Moreover' },
    { kanji: '下に', hiragana: 'したに', meaning: 'Below/Under' },
    { kanji: '片方は', hiragana: 'かたほうは', meaning: 'On one hand' },
    { kanji: 'もう片方は', hiragana: 'もうかたほうは', meaning: 'On the other hand' },
    { kanji: '中に', hiragana: 'なかに', meaning: 'Inside/Within' },
    { kanji: '外に', hiragana: 'そとに', meaning: 'Outside/Out' },
    { kanji: '左に', hiragana: 'ひだりに', meaning: 'To the left/Left side' },
    { kanji: '右に', hiragana: 'みぎに', meaning: 'To the right/Right side' },
    { kanji: '隣に', hiragana: 'となりに', meaning: 'Next to/Adjacent/Beside' },
    { kanji: '向こうに', hiragana: 'むこうに', meaning: 'Over there/Across' },
    { kanji: 'こちらに', hiragana: 'こちらに', meaning: 'This way/Over here' },
    { kanji: '奥に', hiragana: 'おくに', meaning: 'Deep inside/Back/Interior' },
    { kanji: '手前に', hiragana: 'てまえに', meaning: 'In front/Near' },
    { kanji: '側に', hiragana: 'がわに', meaning: 'Beside/At the side' },
    { kanji: '近くに', hiragana: 'ちかくに', meaning: 'Near/Close by' },
    { kanji: '遠く', hiragana: 'とおく', meaning: 'Far away/Distant' },
    { kanji: 'はい', hiragana: 'はい', meaning: 'Yes (polite)' },
    { kanji: 'いいえ', hiragana: 'いいえ', meaning: 'No (polite)' },
    { kanji: 'かしこまりました', hiragana: 'かしこまりました', meaning: 'Understood/Certainly (very polite)' },
    { kanji: '承知しました', hiragana: 'しょうちしました', meaning: 'Understood (formal)' },
    { kanji: 'ありがとうございます', hiragana: 'ありがとうございます', meaning: 'Thank you very much' },
    { kanji: 'どういたしまして', hiragana: 'どういたしまして', meaning: 'You are welcome' },
    { kanji: 'うん', hiragana: 'うん', meaning: 'Yes (casual)' },
    { kanji: 'ううん', hiragana: 'ううん', meaning: 'No (casual)' },
    { kanji: 'まじで', hiragana: 'まじで', meaning: 'Really? (casual/slang)' },
    { kanji: 'やっぱり', hiragana: 'やっぱり', meaning: 'As I thought/After all (casual)' },
    { kanji: 'だよね', hiragana: 'だよね', meaning: 'Right? (casual agreement)' },
    { kanji: 'ちゃう', hiragana: 'ちゃう', meaning: 'No/Wrong (casual)' },
    { kanji: 'ありがとね', hiragana: 'ありがとね', meaning: 'Thanks (casual)' },
    { kanji: 'いいや', hiragana: 'いいや', meaning: 'Nope (casual)' },
    { kanji: 'は', hiragana: 'は', meaning: 'Topic particle' },
    { kanji: 'を', hiragana: 'を', meaning: 'Object particle' },
    { kanji: 'に', hiragana: 'に', meaning: 'Goal/destination particle' },
    { kanji: 'へ', hiragana: 'へ', meaning: 'Direction particle' },
    { kanji: 'で', hiragana: 'で', meaning: 'Location/means particle' },
    { kanji: 'が', hiragana: 'が', meaning: 'Subject particle' },
    { kanji: 'の', hiragana: 'の', meaning: 'Possession particle' },
    { kanji: 'も', hiragana: 'も', meaning: 'Also particle' },
    { kanji: 'か', hiragana: 'か', meaning: 'Question particle' },
    { kanji: 'から', hiragana: 'から', meaning: 'From/because' },
    { kanji: 'まで', hiragana: 'まで', meaning: 'Until/to' },
    { kanji: 'や', hiragana: 'や', meaning: 'And (listing)' },
    { kanji: 'と', hiragana: 'と', meaning: 'And/with' },
    { kanji: 'より', hiragana: 'より', meaning: 'Than/from' },
    { kanji: '等', hiragana: 'など', meaning: 'And so on' },
    { kanji: 'ぐらい', hiragana: 'ぐらい', meaning: 'About/approximately' },
    { kanji: 'くらい', hiragana: 'くらい', meaning: 'About/approximately' },
    { kanji: '程', hiragana: 'ほど', meaning: 'To the extent' },
    { kanji: 'だけ', hiragana: 'だけ', meaning: 'Only' },
    { kanji: 'ぐらい', hiragana: 'ぐらい', meaning: 'About' },
];

const verbConjugationData: VerbConjugation[] = [
    {
        base: '食べる',
        furigana: 'たべる',
        meaning: 'to eat',
        conjugations: [
            { form: 'Present/Polite', result: '食べます' },
            { form: 'Negative', result: '食べない' },
            { form: 'Negative Polite', result: '食べません' },
            { form: 'Past', result: '食べた' },
            { form: 'Past Polite', result: '食べました' },
            { form: 'Past Continuous', result: '食べていた' },
            { form: 'Te-form', result: '食べて' },
            { form: 'Continuous', result: '食べている' },
            { form: 'Conditional (If)', result: '食べれば' },
        ],
    },
    {
        base: '飲む',
        furigana: 'のむ',
        meaning: 'to drink',
        conjugations: [
            { form: 'Present/Polite', result: '飲みます' },
            { form: 'Negative', result: '飲まない' },
            { form: 'Negative Polite', result: '飲みません' },
            { form: 'Past', result: '飲んだ' },
            { form: 'Past Polite', result: '飲みました' },
            { form: 'Past Continuous', result: '飲んでいた' },
            { form: 'Te-form', result: '飲んで' },
            { form: 'Continuous', result: '飲んでいる' },
            { form: 'Conditional (If)', result: '飲めば' },
        ],
    },
    {
        base: '書く',
        furigana: 'かく',
        meaning: 'to write',
        conjugations: [
            { form: 'Present/Polite', result: '書きます' },
            { form: 'Negative', result: '書かない' },
            { form: 'Negative Polite', result: '書きません' },
            { form: 'Past', result: '書いた' },
            { form: 'Past Polite', result: '書きました' },
            { form: 'Past Continuous', result: '書いていた' },
            { form: 'Te-form', result: '書いて' },
            { form: 'Continuous', result: '書いている' },
            { form: 'Conditional (If)', result: '書けば' },
        ],
    },
    {
        base: '来る',
        furigana: 'くる',
        meaning: 'to come',
        conjugations: [
            { form: 'Present/Polite', result: '来ます' },
            { form: 'Negative', result: '来ない' },
            { form: 'Negative Polite', result: '来ません' },
            { form: 'Past', result: '来た' },
            { form: 'Past Polite', result: '来ました' },
            { form: 'Past Continuous', result: '来ていた' },
            { form: 'Te-form', result: '来て' },
            { form: 'Continuous', result: '来ている' },
            { form: 'Conditional (If)', result: '来れば' },
        ],
    },
    {
        base: 'する',
        furigana: 'する',
        meaning: 'to do',
        conjugations: [
            { form: 'Present/Polite', result: 'します' },
            { form: 'Negative', result: 'しない' },
            { form: 'Negative Polite', result: 'しません' },
            { form: 'Past', result: 'した' },
            { form: 'Past Polite', result: 'しました' },
            { form: 'Past Continuous', result: 'していた' },
            { form: 'Te-form', result: 'して' },
            { form: 'Continuous', result: 'している' },
            { form: 'Conditional (If)', result: 'すれば' },
        ],
    },
    {
        base: '読む',
        furigana: 'よむ',
        meaning: 'to read',
        conjugations: [
            { form: 'Present/Polite', result: '読みます' },
            { form: 'Negative', result: '読まない' },
            { form: 'Negative Polite', result: '読みません' },
            { form: 'Past', result: '読んだ' },
            { form: 'Past Polite', result: '読みました' },
            { form: 'Past Continuous', result: '読んでいた' },
            { form: 'Te-form', result: '読んで' },
            { form: 'Continuous', result: '読んでいる' },
            { form: 'Conditional (If)', result: '読めば' },
        ],
    },
    {
        base: '見る',
        furigana: 'みる',
        meaning: 'to see/watch',
        conjugations: [
            { form: 'Present/Polite', result: '見ます' },
            { form: 'Negative', result: '見ない' },
            { form: 'Negative Polite', result: '見ません' },
            { form: 'Past', result: '見た' },
            { form: 'Past Polite', result: '見ました' },
            { form: 'Past Continuous', result: '見ていた' },
            { form: 'Te-form', result: '見て' },
            { form: 'Continuous', result: '見ている' },
            { form: 'Conditional (If)', result: '見れば' },
        ],
    },
    {
        base: '行く',
        furigana: 'いく',
        meaning: 'to go',
        conjugations: [
            { form: 'Present/Polite', result: '行きます' },
            { form: 'Negative', result: '行かない' },
            { form: 'Negative Polite', result: '行きません' },
            { form: 'Past', result: '行った' },
            { form: 'Past Polite', result: '行きました' },
            { form: 'Past Continuous', result: '行っていた' },
            { form: 'Te-form', result: '行って' },
            { form: 'Continuous', result: '行っている' },
            { form: 'Conditional (If)', result: '行けば' },
        ],
    },
    {
        base: 'いる',
        furigana: 'いる',
        meaning: 'to exist (animate)',
        conjugations: [
            { form: 'Present/Polite', result: 'います' },
            { form: 'Negative', result: 'いない' },
            { form: 'Negative Polite', result: 'いません' },
            { form: 'Past', result: 'いた' },
            { form: 'Past Polite', result: 'いました' },
            { form: 'Past Continuous', result: 'いていた' },
            { form: 'Te-form', result: 'いて' },
            { form: 'Continuous', result: 'いている' },
            { form: 'Conditional (If)', result: 'いれば' },
        ],
    },
    {
        base: 'ある',
        furigana: 'ある',
        meaning: 'to exist (inanimate)',
        conjugations: [
            { form: 'Present/Polite', result: 'あります' },
            { form: 'Negative', result: 'ない' },
            { form: 'Negative Polite', result: 'ありません' },
            { form: 'Past', result: 'あった' },
            { form: 'Past Polite', result: 'ありました' },
            { form: 'Past Continuous', result: 'あっていた' },
            { form: 'Te-form', result: 'あって' },
            { form: 'Continuous', result: 'あっている' },
            { form: 'Conditional (If)', result: 'あれば' },
        ],
    },
    {
        base: '言う',
        furigana: 'いう',
        meaning: 'to say',
        conjugations: [
            { form: 'Present/Polite', result: '言います' },
            { form: 'Negative', result: '言わない' },
            { form: 'Negative Polite', result: '言いません' },
            { form: 'Past', result: '言った' },
            { form: 'Past Polite', result: '言いました' },
            { form: 'Past Continuous', result: '言っていた' },
            { form: 'Te-form', result: '言って' },
            { form: 'Continuous', result: '言っている' },
            { form: 'Conditional (If)', result: '言えば' },
        ],
    },
    {
        base: '待つ',
        furigana: 'まつ',
        meaning: 'to wait',
        conjugations: [
            { form: 'Present/Polite', result: '待ちます' },
            { form: 'Negative', result: '待たない' },
            { form: 'Negative Polite', result: '待ちません' },
            { form: 'Past', result: '待った' },
            { form: 'Past Polite', result: '待ちました' },
            { form: 'Past Continuous', result: '待っていた' },
            { form: 'Te-form', result: '待って' },
            { form: 'Continuous', result: '待っている' },
            { form: 'Conditional (If)', result: '待てば' },
        ],
    },
    {
        base: '聞く',
        furigana: 'きく',
        meaning: 'to listen/ask',
        conjugations: [
            { form: 'Present/Polite', result: '聞きます' },
            { form: 'Negative', result: '聞かない' },
            { form: 'Negative Polite', result: '聞きません' },
            { form: 'Past', result: '聞いた' },
            { form: 'Past Polite', result: '聞きました' },
            { form: 'Past Continuous', result: '聞いていた' },
            { form: 'Te-form', result: '聞いて' },
            { form: 'Continuous', result: '聞いている' },
            { form: 'Conditional (If)', result: '聞けば' },
        ],
    },
    {
        base: '買う',
        furigana: 'かう',
        meaning: 'to buy',
        conjugations: [
            { form: 'Present/Polite', result: '買います' },
            { form: 'Negative', result: '買わない' },
            { form: 'Negative Polite', result: '買いません' },
            { form: 'Past', result: '買った' },
            { form: 'Past Polite', result: '買いました' },
            { form: 'Past Continuous', result: '買っていた' },
            { form: 'Te-form', result: '買って' },
            { form: 'Continuous', result: '買っている' },
            { form: 'Conditional (If)', result: '買えば' },
        ],
    },
    {
        base: '持つ',
        furigana: 'もつ',
        meaning: 'to hold/have',
        conjugations: [
            { form: 'Present/Polite', result: '持ちます' },
            { form: 'Negative', result: '持たない' },
            { form: 'Negative Polite', result: '持ちません' },
            { form: 'Past', result: '持った' },
            { form: 'Past Polite', result: '持ちました' },
            { form: 'Past Continuous', result: '持っていた' },
            { form: 'Te-form', result: '持って' },
            { form: 'Continuous', result: '持っている' },
            { form: 'Conditional (If)', result: '持てば' },
        ],
    },
    {
        base: '上げる',
        furigana: 'あげる',
        meaning: 'to give/raise',
        conjugations: [
            { form: 'Present/Polite', result: '上げます' },
            { form: 'Negative', result: '上げない' },
            { form: 'Negative Polite', result: '上げません' },
            { form: 'Past', result: '上げた' },
            { form: 'Past Polite', result: '上げました' },
            { form: 'Past Continuous', result: '上げていた' },
            { form: 'Te-form', result: '上げて' },
            { form: 'Continuous', result: '上げている' },
            { form: 'Conditional (If)', result: '上げれば' },
        ],
    },
    {
        base: '貰う',
        furigana: 'もらう',
        meaning: 'to receive',
        conjugations: [
            { form: 'Present/Polite', result: '貰います' },
            { form: 'Negative', result: '貰わない' },
            { form: 'Negative Polite', result: '貰いません' },
            { form: 'Past', result: '貰った' },
            { form: 'Past Polite', result: '貰いました' },
            { form: 'Past Continuous', result: '貰っていた' },
            { form: 'Te-form', result: '貰って' },
            { form: 'Continuous', result: '貰っている' },
            { form: 'Conditional (If)', result: '貰えば' },
        ],
    },
    {
        base: '作る',
        furigana: 'つくる',
        meaning: 'to make',
        conjugations: [
            { form: 'Present/Polite', result: '作ります' },
            { form: 'Negative', result: '作らない' },
            { form: 'Negative Polite', result: '作りません' },
            { form: 'Past', result: '作った' },
            { form: 'Past Polite', result: '作りました' },
            { form: 'Past Continuous', result: '作っていた' },
            { form: 'Te-form', result: '作って' },
            { form: 'Continuous', result: '作っている' },
            { form: 'Conditional (If)', result: '作れば' },
        ],
    },
    {
        base: '開ける',
        furigana: 'あける',
        meaning: 'to open',
        conjugations: [
            { form: 'Present/Polite', result: '開けます' },
            { form: 'Negative', result: '開けない' },
            { form: 'Negative Polite', result: '開けません' },
            { form: 'Past', result: '開けた' },
            { form: 'Past Polite', result: '開けました' },
            { form: 'Past Continuous', result: '開けていた' },
            { form: 'Te-form', result: '開けて' },
            { form: 'Continuous', result: '開けている' },
            { form: 'Conditional (If)', result: '開ければ' },
        ],
    },
    {
        base: '閉める',
        furigana: 'しめる',
        meaning: 'to close',
        conjugations: [
            { form: 'Present/Polite', result: '閉めます' },
            { form: 'Negative', result: '閉めない' },
            { form: 'Negative Polite', result: '閉めません' },
            { form: 'Past', result: '閉めた' },
            { form: 'Past Polite', result: '閉めました' },
            { form: 'Past Continuous', result: '閉めていた' },
            { form: 'Te-form', result: '閉めて' },
            { form: 'Continuous', result: '閉めている' },
            { form: 'Conditional (If)', result: '閉めれば' },
        ],
    },
    {
        base: '忘れる',
        furigana: 'わすれる',
        meaning: 'to forget',
        conjugations: [
            { form: 'Present/Polite', result: '忘れます' },
            { form: 'Negative', result: '忘れない' },
            { form: 'Negative Polite', result: '忘れません' },
            { form: 'Past', result: '忘れた' },
            { form: 'Past Polite', result: '忘れました' },
            { form: 'Past Continuous', result: '忘れていた' },
            { form: 'Te-form', result: '忘れて' },
            { form: 'Continuous', result: '忘れている' },
            { form: 'Conditional (If)', result: '忘れれば' },
        ],
    },
    {
        base: '寝る',
        furigana: 'ねる',
        meaning: 'to sleep',
        conjugations: [
            { form: 'Present/Polite', result: '寝ます' },
            { form: 'Negative', result: '寝ない' },
            { form: 'Negative Polite', result: '寝ません' },
            { form: 'Past', result: '寝た' },
            { form: 'Past Polite', result: '寝ました' },
            { form: 'Past Continuous', result: '寝ていた' },
            { form: 'Te-form', result: '寝て' },
            { form: 'Continuous', result: '寝ている' },
            { form: 'Conditional (If)', result: '寝れば' },
        ],
    },
    {
        base: '置く',
        furigana: 'おく',
        meaning: 'to put/place',
        conjugations: [
            { form: 'Present/Polite', result: '置きます' },
            { form: 'Negative', result: '置かない' },
            { form: 'Negative Polite', result: '置きません' },
            { form: 'Past', result: '置いた' },
            { form: 'Past Polite', result: '置きました' },
            { form: 'Past Continuous', result: '置いていた' },
            { form: 'Te-form', result: '置いて' },
            { form: 'Continuous', result: '置いている' },
            { form: 'Conditional (If)', result: '置けば' },
        ],
    },
    {
        base: '返す',
        furigana: 'かえす',
        meaning: 'to return',
        conjugations: [
            { form: 'Present/Polite', result: '返します' },
            { form: 'Negative', result: '返さない' },
            { form: 'Negative Polite', result: '返しません' },
            { form: 'Past', result: '返した' },
            { form: 'Past Polite', result: '返しました' },
            { form: 'Past Continuous', result: '返していた' },
            { form: 'Te-form', result: '返して' },
            { form: 'Continuous', result: '返している' },
            { form: 'Conditional (If)', result: '返せば' },
        ],
    },
    {
        base: '降りる',
        furigana: 'おりる',
        meaning: 'to get down',
        conjugations: [
            { form: 'Present/Polite', result: '降ります' },
            { form: 'Negative', result: '降りない' },
            { form: 'Negative Polite', result: '降りません' },
            { form: 'Past', result: '降りた' },
            { form: 'Past Polite', result: '降りました' },
            { form: 'Past Continuous', result: '降りていた' },
            { form: 'Te-form', result: '降りて' },
            { form: 'Continuous', result: '降りている' },
            { form: 'Conditional (If)', result: '降りれば' },
        ],
    },
    {
        base: '立つ',
        furigana: 'たつ',
        meaning: 'to stand',
        conjugations: [
            { form: 'Present/Polite', result: '立ちます' },
            { form: 'Negative', result: '立たない' },
            { form: 'Negative Polite', result: '立ちません' },
            { form: 'Past', result: '立った' },
            { form: 'Past Polite', result: '立ちました' },
            { form: 'Past Continuous', result: '立っていた' },
            { form: 'Te-form', result: '立って' },
            { form: 'Continuous', result: '立っている' },
            { form: 'Conditional (If)', result: '立てば' },
        ],
    },
    {
        base: '座る',
        furigana: 'すわる',
        meaning: 'to sit',
        conjugations: [
            { form: 'Present/Polite', result: '座ります' },
            { form: 'Negative', result: '座らない' },
            { form: 'Negative Polite', result: '座りません' },
            { form: 'Past', result: '座った' },
            { form: 'Past Polite', result: '座りました' },
            { form: 'Past Continuous', result: '座っていた' },
            { form: 'Te-form', result: '座って' },
            { form: 'Continuous', result: '座っている' },
            { form: 'Conditional (If)', result: '座れば' },
        ],
    },
    {
        base: '乗せる',
        furigana: 'のせる',
        meaning: 'to place on',
        conjugations: [
            { form: 'Present/Polite', result: '乗せます' },
            { form: 'Negative', result: '乗せない' },
            { form: 'Negative Polite', result: '乗せません' },
            { form: 'Past', result: '乗せた' },
            { form: 'Past Polite', result: '乗せました' },
            { form: 'Past Continuous', result: '乗せていた' },
            { form: 'Te-form', result: '乗せて' },
            { form: 'Continuous', result: '乗せている' },
            { form: 'Conditional (If)', result: '乗せれば' },
        ],
    },
    {
        base: '勉強する',
        furigana: 'べんきょうする',
        meaning: 'to study',
        conjugations: [
            { form: 'Present/Polite', result: '勉強します' },
            { form: 'Negative', result: '勉強しない' },
            { form: 'Negative Polite', result: '勉強しません' },
            { form: 'Past', result: '勉強した' },
            { form: 'Past Polite', result: '勉強しました' },
            { form: 'Past Continuous', result: '勉強していた' },
            { form: 'Te-form', result: '勉強して' },
            { form: 'Continuous', result: '勉強している' },
            { form: 'Conditional (If)', result: '勉強すれば' },
        ],
    },
    {
        base: '走る',
        furigana: 'はしる',
        meaning: 'to run',
        conjugations: [
            { form: 'Present/Polite', result: '走ります' },
            { form: 'Negative', result: '走らない' },
            { form: 'Negative Polite', result: '走りません' },
            { form: 'Past', result: '走った' },
            { form: 'Past Polite', result: '走りました' },
            { form: 'Past Continuous', result: '走っていた' },
            { form: 'Te-form', result: '走って' },
            { form: 'Continuous', result: '走っている' },
            { form: 'Conditional (If)', result: '走れば' },
        ],
    },
    {
        base: '歩く',
        furigana: 'あるく',
        meaning: 'to walk',
        conjugations: [
            { form: 'Present/Polite', result: '歩きます' },
            { form: 'Negative', result: '歩かない' },
            { form: 'Negative Polite', result: '歩きません' },
            { form: 'Past', result: '歩いた' },
            { form: 'Past Polite', result: '歩きました' },
            { form: 'Past Continuous', result: '歩いていた' },
            { form: 'Te-form', result: '歩いて' },
            { form: 'Continuous', result: '歩いている' },
            { form: 'Conditional (If)', result: '歩けば' },
        ],
    },
    {
        base: '働く',
        furigana: 'はたらく',
        meaning: 'to work',
        conjugations: [
            { form: 'Present/Polite', result: '働きます' },
            { form: 'Negative', result: '働かない' },
            { form: 'Negative Polite', result: '働きません' },
            { form: 'Past', result: '働いた' },
            { form: 'Past Polite', result: '働きました' },
            { form: 'Past Continuous', result: '働いていた' },
            { form: 'Te-form', result: '働いて' },
            { form: 'Continuous', result: '働いている' },
            { form: 'Conditional (If)', result: '働けば' },
        ],
    },
    {
        base: '助ける',
        furigana: 'たすける',
        meaning: 'to help',
        conjugations: [
            { form: 'Present/Polite', result: '助けます' },
            { form: 'Negative', result: '助けない' },
            { form: 'Negative Polite', result: '助けません' },
            { form: 'Past', result: '助けた' },
            { form: 'Past Polite', result: '助けました' },
            { form: 'Past Continuous', result: '助けていた' },
            { form: 'Te-form', result: '助けて' },
            { form: 'Continuous', result: '助けている' },
            { form: 'Conditional (If)', result: '助ければ' },
        ],
    },
    {
        base: '始める',
        furigana: 'はじめる',
        meaning: 'to start',
        conjugations: [
            { form: 'Present/Polite', result: '始めます' },
            { form: 'Negative', result: '始めない' },
            { form: 'Negative Polite', result: '始めません' },
            { form: 'Past', result: '始めた' },
            { form: 'Past Polite', result: '始めました' },
            { form: 'Past Continuous', result: '始めていた' },
            { form: 'Te-form', result: '始めて' },
            { form: 'Continuous', result: '始めている' },
            { form: 'Conditional (If)', result: '始めれば' },
        ],
    },
    {
        base: '終わる',
        furigana: 'おわる',
        meaning: 'to end/finish',
        conjugations: [
            { form: 'Present/Polite', result: '終わります' },
            { form: 'Negative', result: '終わらない' },
            { form: 'Negative Polite', result: '終わりません' },
            { form: 'Past', result: '終わった' },
            { form: 'Past Polite', result: '終わりました' },
            { form: 'Past Continuous', result: '終わっていた' },
            { form: 'Te-form', result: '終わって' },
            { form: 'Continuous', result: '終わっている' },
            { form: 'Conditional (If)', result: '終われば' },
        ],
    },
];

const nounConjugationData: NounConjugation[] = [
    {
        base: '学生',
        furigana: 'がくせい',
        meaning: 'student',
        conjugations: [
            { category: 'Negation', form: 'Casual (じゃない)', result: '学生じゃない', explanation: 'Casual conversation: "Not a student"' },
            { category: 'Negation', form: 'Polite (じゃありません)', result: '学生じゃありません', explanation: 'Polite/friends: "Not a student"' },
            { category: 'Negation', form: 'Formal (ではない)', result: '学生ではない', explanation: 'Written/formal: "Not a student"' },
            { category: 'Negation', form: 'Formal Polite (ではありません)', result: '学生ではありません', explanation: 'Formal polite: "Not a student"' },
            { category: 'Conditional', form: '自然 (なら)', result: '学生なら、無料です', explanation: 'Natural: "If (you are) a student, it\'s free"' },
            { category: 'Conditional', form: '正式 (であれば)', result: '学生であれば、入場できます', explanation: 'Formal: "If one is a student, one can enter"' },
            { category: 'Conditional', form: '強調 (であったら)', result: '学生であったら、割引があります', explanation: 'Emphatic: "If (one had been) a student, there would be a discount"' },
        ],
    },
    {
        base: '医者',
        furigana: 'いしゃ',
        meaning: 'doctor',
        conjugations: [
            { category: 'Negation', form: 'Casual (じゃない)', result: '医者じゃない', explanation: 'Casual conversation: "Not a doctor"' },
            { category: 'Negation', form: 'Polite (じゃありません)', result: '医者じゃありません', explanation: 'Polite/friends: "Not a doctor"' },
            { category: 'Negation', form: 'Formal (ではない)', result: '医者ではない', explanation: 'Written/formal: "Not a doctor"' },
            { category: 'Negation', form: 'Formal Polite (ではありません)', result: '医者ではありません', explanation: 'Formal polite: "Not a doctor"' },
            { category: 'Conditional', form: '自然 (なら)', result: '医者なら、相談できます', explanation: 'Natural: "If (you are) a doctor, you can consult"' },
            { category: 'Conditional', form: '正式 (であれば)', result: '医者であれば、診察できます', explanation: 'Formal: "If one is a doctor, one can examine"' },
            { category: 'Conditional', form: '強調 (であったら)', result: '医者であったら、患者を治せます', explanation: 'Emphatic: "If (one had been) a doctor, one could treat patients"' },
        ],
    },
    {
        base: '日本人',
        furigana: 'にほんじん',
        meaning: 'Japanese person',
        conjugations: [
            { category: 'Negation', form: 'Casual (じゃない)', result: '日本人じゃない', explanation: 'Casual conversation: "Not Japanese"' },
            { category: 'Negation', form: 'Polite (じゃありません)', result: '日本人じゃありません', explanation: 'Polite/friends: "Not Japanese"' },
            { category: 'Negation', form: 'Formal (ではない)', result: '日本人ではない', explanation: 'Written/formal: "Not Japanese"' },
            { category: 'Negation', form: 'Formal Polite (ではありません)', result: '日本人ではありません', explanation: 'Formal polite: "Not Japanese"' },
            { category: 'Conditional', form: '自然 (なら)', result: '日本人なら、日本語が話せます', explanation: 'Natural: "If (you are) Japanese, you can speak Japanese"' },
            { category: 'Conditional', form: '正式 (であれば)', result: '日本人であれば、文化を理解できます', explanation: 'Formal: "If one is Japanese, one can understand culture"' },
            { category: 'Conditional', form: '強調 (であったら)', result: '日本人であったら、帰国できます', explanation: 'Emphatic: "If (one had been) Japanese, one could return home"' },
        ],
    },
    {
        base: 'エンジニア',
        furigana: 'えんじにあ',
        meaning: 'engineer',
        conjugations: [
            { category: 'Negation', form: 'Casual (じゃない)', result: 'エンジニアじゃない', explanation: 'Casual conversation: "Not an engineer"' },
            { category: 'Negation', form: 'Polite (じゃありません)', result: 'エンジニアじゃありません', explanation: 'Polite/friends: "Not an engineer"' },
            { category: 'Negation', form: 'Formal (ではない)', result: 'エンジニアではない', explanation: 'Written/formal: "Not an engineer"' },
            { category: 'Negation', form: 'Formal Polite (ではありません)', result: 'エンジニアではありません', explanation: 'Formal polite: "Not an engineer"' },
            { category: 'Conditional', form: '自然 (なら)', result: 'エンジニアなら、プログラムが書けます', explanation: 'Natural: "If (you are) an engineer, you can write programs"' },
            { category: 'Conditional', form: '正式 (であれば)', result: 'エンジニアであれば、技術を応用できます', explanation: 'Formal: "If one is an engineer, one can apply technology"' },
            { category: 'Conditional', form: '強調 (であったら)', result: 'エンジニアであったら、プロジェクトに参加できます', explanation: 'Emphatic: "If (one had been) an engineer, one could participate in projects"' },
        ],
    },
    {
        base: '先生',
        furigana: 'せんせい',
        meaning: 'teacher',
        conjugations: [
            { category: 'Negation', form: 'Casual (じゃない)', result: '先生じゃない', explanation: 'Casual conversation: "Not a teacher"' },
            { category: 'Negation', form: 'Polite (じゃありません)', result: '先生じゃありません', explanation: 'Polite/friends: "Not a teacher"' },
            { category: 'Negation', form: 'Formal (ではない)', result: '先生ではない', explanation: 'Written/formal: "Not a teacher"' },
            { category: 'Negation', form: 'Formal Polite (ではありません)', result: '先生ではありません', explanation: 'Formal polite: "Not a teacher"' },
            { category: 'Conditional', form: '自然 (なら)', result: '先生なら、教えることができます', explanation: 'Natural: "If (you are) a teacher, you can teach"' },
            { category: 'Conditional', form: '正式 (であれば)', result: '先生であれば、学生を指導できます', explanation: 'Formal: "If one is a teacher, one can guide students"' },
            { category: 'Conditional', form: '強調 (であったら)', result: '先生であったら、授業ができます', explanation: 'Emphatic: "If (one had been) a teacher, one could give lessons"' },
        ],
    },
];

const adjectiveConjugationData: AdjectiveConjugation[] = [
    {
        base: '新しい',
        furigana: 'あたらしい',
        meaning: 'new',
        type: 'i',
        conjugations: [
            { category: 'Basic Forms', form: 'Original (い-adjective)', result: '新しい', explanation: 'Base form: "new"' },
            { category: 'Basic Forms', form: 'Polite Present', result: '新しいです', explanation: 'Polite present: "It is new"' },
            { category: 'Negation', form: 'Negative Casual', result: '新しくない', explanation: 'Casual negative: "Not new"' },
            { category: 'Negation', form: 'Negative Polite', result: '新しくありません', explanation: 'Polite negative: "Not new"' },
            { category: 'Past Tense', form: 'Past Casual', result: '新しかった', explanation: 'Casual past: "Was new"' },
            { category: 'Past Tense', form: 'Past Polite', result: '新しかったです', explanation: 'Polite past: "Was new"' },
            { category: 'Past Negation', form: 'Past Negative', result: '新しくなかった', explanation: 'Past negative: "Was not new"' },
            { category: 'Conditional', form: 'Conditional (ば)', result: '新しければ', explanation: 'If new (ば-form)' },
            { category: 'Te-form', form: 'Te-form', result: '新しくて', explanation: 'Te-form for connecting: "new and..."' },
            { category: 'Noun Modification', form: 'Modifies Noun', result: '新しい本', explanation: 'Modifying noun: "new book"' },
        ],
    },
    {
        base: '古い',
        furigana: 'ふるい',
        meaning: 'old',
        type: 'i',
        conjugations: [
            { category: 'Basic Forms', form: 'Original (い-adjective)', result: '古い', explanation: 'Base form: "old"' },
            { category: 'Basic Forms', form: 'Polite Present', result: '古いです', explanation: 'Polite present: "It is old"' },
            { category: 'Negation', form: 'Negative Casual', result: '古くない', explanation: 'Casual negative: "Not old"' },
            { category: 'Negation', form: 'Negative Polite', result: '古くありません', explanation: 'Polite negative: "Not old"' },
            { category: 'Past Tense', form: 'Past Casual', result: '古かった', explanation: 'Casual past: "Was old"' },
            { category: 'Past Tense', form: 'Past Polite', result: '古かったです', explanation: 'Polite past: "Was old"' },
            { category: 'Past Negation', form: 'Past Negative', result: '古くなかった', explanation: 'Past negative: "Was not old"' },
            { category: 'Conditional', form: 'Conditional (ば)', result: '古ければ', explanation: 'If old (ば-form)' },
            { category: 'Te-form', form: 'Te-form', result: '古くて', explanation: 'Te-form for connecting: "old and..."' },
            { category: 'Noun Modification', form: 'Modifies Noun', result: '古い家', explanation: 'Modifying noun: "old house"' },
        ],
    },
    {
        base: '綺麗な',
        furigana: 'きれいな',
        meaning: 'beautiful',
        type: 'na',
        conjugations: [
            { category: 'Basic Forms', form: 'Original (な-adjective)', result: '綺麗な', explanation: 'Base form with な: "beautiful"' },
            { category: 'Basic Forms', form: 'Polite Present', result: '綺麗です', explanation: 'Polite present (without な): "It is beautiful"' },
            { category: 'Negation', form: 'Negative Casual', result: '綺麗じゃない', explanation: 'Casual negative: "Not beautiful"' },
            { category: 'Negation', form: 'Negative Polite', result: '綺麗ではありません', explanation: 'Polite negative: "Not beautiful"' },
            { category: 'Past Tense', form: 'Past Casual', result: '綺麗だった', explanation: 'Casual past: "Was beautiful"' },
            { category: 'Past Tense', form: 'Past Polite', result: '綺麗でした', explanation: 'Polite past: "Was beautiful"' },
            { category: 'Past Negation', form: 'Past Negative', result: '綺麗じゃなかった', explanation: 'Past negative: "Was not beautiful"' },
            { category: 'Conditional', form: 'Conditional (なら)', result: '綺麗なら', explanation: 'If beautiful (なら-form)' },
            { category: 'Te-form', form: 'Te-form', result: '綺麗で', explanation: 'Te-form for connecting: "beautiful and..."' },
            { category: 'Noun Modification', form: 'Modifies Noun', result: '綺麗な花', explanation: 'Modifying noun: "beautiful flower"' },
        ],
    },
    {
        base: '静かな',
        furigana: 'しずかな',
        meaning: 'quiet',
        type: 'na',
        conjugations: [
            { category: 'Basic Forms', form: 'Original (な-adjective)', result: '静かな', explanation: 'Base form with な: "quiet"' },
            { category: 'Basic Forms', form: 'Polite Present', result: '静かです', explanation: 'Polite present (without な): "It is quiet"' },
            { category: 'Negation', form: 'Negative Casual', result: '静かじゃない', explanation: 'Casual negative: "Not quiet"' },
            { category: 'Negation', form: 'Negative Polite', result: '静かではありません', explanation: 'Polite negative: "Not quiet"' },
            { category: 'Past Tense', form: 'Past Casual', result: '静かだった', explanation: 'Casual past: "Was quiet"' },
            { category: 'Past Tense', form: 'Past Polite', result: '静かでした', explanation: 'Polite past: "Was quiet"' },
            { category: 'Past Negation', form: 'Past Negative', result: '静かじゃなかった', explanation: 'Past negative: "Was not quiet"' },
            { category: 'Conditional', form: 'Conditional (なら)', result: '静かなら', explanation: 'If quiet (なら-form)' },
            { category: 'Te-form', form: 'Te-form', result: '静かで', explanation: 'Te-form for connecting: "quiet and..."' },
            { category: 'Noun Modification', form: 'Modifies Noun', result: '静かな場所', explanation: 'Modifying noun: "quiet place"' },
        ],
    },
];

interface GrammarExercise {
    question: string;
    blank: string;
    options: string[];
    correct: string;
    explanation: string;
    grammarPoint: string;
}

interface TeFormExercise {
    question: string;
    options: string[];
    correct: string;
    explanation: string;
    grammarPoint: string;
    category: 'verb' | 'adjective' | 'noun';
}

interface PotentialFormVerb {
    base: string;
    furigana: string;
    type: '5-dan' | '1-dan' | 'irregular';
    potentialForm: string;
    potentialFurigana: string;
    meaning: string;
    explanation: string;
    example: string;
    exampleMeaning: string;
}

interface CommonPattern {
    number: number;
    pattern: string;
    meaning: string;
    example: string;
    exampleMeaning: string;
    formality: 'formal' | 'casual' | 'both';
}

const formalityLabels = {
    formal: { en: 'Formal', zh: '正式', color: 'bg-blue-500' },
    casual: { en: 'Casual', zh: '口語', color: 'bg-green-500' },
    both: { en: 'Both', zh: '通用', color: 'bg-gray-500' },
};

const commonPatternsData: { [category: string]: CommonPattern[] } = {
    'Intention/Plan (意圖/計劃句型)': [
        { number: 21, pattern: '～つもりです', meaning: 'Plan/Intend to ~', example: '明日は公園に行くつもりです。', exampleMeaning: 'I plan to go to the park tomorrow.', formality: 'formal' },
        { number: 22, pattern: '～予定です', meaning: 'Schedule/Plan to ~', example: '来月、日本に行く予定です。', exampleMeaning: 'I plan to go to Japan next month.', formality: 'formal' },
        { number: 23, pattern: '～つもりではありません', meaning: 'Do not plan/intend to ~', example: '仕事をするつもりではありません。', exampleMeaning: 'I do not plan to work.', formality: 'formal' },
        { number: 24, pattern: '～ましょう', meaning: 'Let\'s ~ together', example: '一緒に行きましょう。', exampleMeaning: 'Let\'s go together.', formality: 'formal' },
        { number: 25, pattern: '～ましょうか', meaning: 'Shall we ~?', example: '映画を見ましょうか。', exampleMeaning: 'Shall we watch a movie?', formality: 'formal' },
    ],
    'Possibility/Ability (可能/能力句型)': [
        { number: 26, pattern: '～ことができます', meaning: 'Can/Able to ~', example: '私は日本語が話すことができます。', exampleMeaning: 'I can speak Japanese.', formality: 'formal' },
        { number: 27, pattern: '～られます/～えます', meaning: 'Can ~ (Potential form)', example: '泳げます。', exampleMeaning: 'I can swim.', formality: 'formal' },
        { number: 28, pattern: '～ことができません', meaning: 'Cannot ~', example: '運転することができません。', exampleMeaning: 'I cannot drive.', formality: 'formal' },
        { number: 29, pattern: '～が上手です', meaning: '~ well/good at ~', example: '私は日本語が上手です。', exampleMeaning: 'I am good at Japanese.', formality: 'formal' },
        { number: 30, pattern: '～が下手です', meaning: '~ poorly/bad at ~', example: '私は数学が下手です。', exampleMeaning: 'I am bad at math.', formality: 'formal' },
    ],
    'Like/Dislike (喜好/不喜好句型)': [
        { number: 31, pattern: '～が好きです', meaning: 'Like ~', example: '私は音楽が好きです。', exampleMeaning: 'I like music.', formality: 'formal' },
        { number: 32, pattern: '～が嫌いです', meaning: 'Dislike ~', example: '彼は野菜が嫌いです。', exampleMeaning: 'He dislikes vegetables.', formality: 'formal' },
        { number: 33, pattern: '～が得意です', meaning: 'Good at/Excel in ~', example: '私は絵を描くことが得意です。', exampleMeaning: 'I am good at drawing.', formality: 'formal' },
        { number: 34, pattern: '～が苦手です', meaning: 'Bad at/Struggle with ~', example: '私は泳ぐことが苦手です。', exampleMeaning: 'I struggle with swimming.', formality: 'formal' },
    ],
    'Condition (條件/假定句型)': [
        { number: 35, pattern: '～ば、～', meaning: 'If ~, then ~', example: '雨が降れば、行きません。', exampleMeaning: 'If it rains, I won\'t go.', formality: 'both' },
        { number: 36, pattern: '～たら、～', meaning: 'If ~, then ~', example: '明日が晴れたら、公園に行きます。', exampleMeaning: 'If tomorrow is sunny, I will go to the park.', formality: 'both' },
        { number: 37, pattern: '～なら、～', meaning: 'If ~, then ~', example: '時間があるなら、来てください。', exampleMeaning: 'If you have time, please come.', formality: 'both' },
        { number: 38, pattern: '～と、～', meaning: 'When ~, ~ happens', example: 'ドアが開くと、猫が出ました。', exampleMeaning: 'When the door opened, the cat came out.', formality: 'both' },
    ],
    'Cause/Reason (原因/理由句型)': [
        { number: 39, pattern: '～から、～', meaning: 'Because ~, so ~', example: '疲れているから、休みます。', exampleMeaning: 'Because I\'m tired, I\'ll rest.', formality: 'casual' },
        { number: 40, pattern: '～ので、～', meaning: 'Because ~, so ~', example: '雨が降っているので、行きません。', exampleMeaning: 'Because it\'s raining, I won\'t go.', formality: 'formal' },
        { number: 41, pattern: '～ために、～', meaning: 'In order to ~, so ~', example: '試験のために、勉強します。', exampleMeaning: 'In order for the exam, I will study.', formality: 'both' },
        { number: 42, pattern: '～けど、～', meaning: '~ but ~', example: '忙しいけど、頑張ります。', exampleMeaning: 'I\'m busy but I\'ll do my best.', formality: 'casual' },
    ],
    'Contrast/Opposition (對比/對立句型)': [
        { number: 43, pattern: '～でも、～', meaning: 'Even though ~, but ~', example: '高いですでも、買います。', exampleMeaning: 'Even though it\'s expensive, I\'ll buy it.', formality: 'both' },
        { number: 44, pattern: '～のに、～', meaning: 'Although ~, but ~', example: '勉強したのに、テストに落ちました。', exampleMeaning: 'Although I studied, I failed the test.', formality: 'both' },
        { number: 45, pattern: '～ながら、～', meaning: 'While ~ and ~', example: 'テレビを見ながら、ご飯を食べます。', exampleMeaning: 'I eat while watching TV.', formality: 'both' },
        { number: 46, pattern: '～や～', meaning: '~ or ~, ~ and ~ (listing)', example: '本や雑誌を読みます。', exampleMeaning: 'I read books and magazines.', formality: 'both' },
    ],
    'Direction/Movement (方向/移動句型)': [
        { number: 47, pattern: '～へ行きます', meaning: 'Go to ~', example: '学校へ行きます。', exampleMeaning: 'I go to school.', formality: 'formal' },
        { number: 48, pattern: '～から来ました', meaning: 'Come from ~', example: '日本から来ました。', exampleMeaning: 'I came from Japan.', formality: 'formal' },
        { number: 49, pattern: '～までいます', meaning: 'Stay/Be from ~ to ~', example: '朝から晩までいます。', exampleMeaning: 'I stay from morning to evening.', formality: 'formal' },
        { number: 50, pattern: '～に住んでいます', meaning: 'Live in ~', example: '東京に住んでいます。', exampleMeaning: 'I live in Tokyo.', formality: 'formal' },
    ],
    'Existence/Location (存在/位置句型)': [
        { number: 51, pattern: '～にいます/あります', meaning: '~ is at/exists at ~', example: '猫が庭にいます。', exampleMeaning: 'The cat is in the garden.', formality: 'formal' },
        { number: 52, pattern: '～にあります', meaning: '~ is at/exists at ~ (for objects)', example: '本は机の上にあります。', exampleMeaning: 'The book is on the desk.', formality: 'formal' },
        { number: 53, pattern: '～の近くにあります', meaning: '~ is near ~', example: '駅の近くに住んでいます。', exampleMeaning: 'I live near the station.', formality: 'formal' },
    ],
    'Comparison (比較句型)': [
        { number: 54, pattern: 'AよりBの方が～', meaning: 'B is more ~ than A', example: 'りんごより、みかんの方が好きです。', exampleMeaning: 'I like oranges more than apples.', formality: 'both' },
        { number: 55, pattern: '～と同じです', meaning: '~ is the same as ~', example: '私の意見と同じです。', exampleMeaning: 'It\'s the same as my opinion.', formality: 'formal' },
        { number: 56, pattern: '～より～', meaning: '~ more than ~', example: '兄より弟が背が高いです。', exampleMeaning: 'The younger brother is taller than the older one.', formality: 'both' },
    ],
    'Suggestion/Command (建議/命令句型)': [
        { number: 57, pattern: '～ほうがいいです', meaning: 'Should/Better to ~', example: '早く寝た方がいいです。', exampleMeaning: 'You should sleep early.', formality: 'formal' },
        { number: 58, pattern: '～なさい', meaning: 'Do ~! (command)', example: '静かにしなさい。', exampleMeaning: 'Be quiet!', formality: 'casual' },
        { number: 59, pattern: '～てはいけません', meaning: 'Must not ~', example: 'ここで走ってはいけません。', exampleMeaning: 'You must not run here.', formality: 'formal' },
        { number: 60, pattern: '～ないでください', meaning: 'Please do not ~', example: '煙草を吸わないでください。', exampleMeaning: 'Please do not smoke.', formality: 'formal' },
    ],
    'Other Common (其他常用句型)': [
        { number: 61, pattern: '～だから、～', meaning: '~ so/therefore ~', example: '疲れているだから、休みます。', exampleMeaning: 'I\'m tired so I\'ll rest.', formality: 'casual' },
        { number: 62, pattern: '～ましょう', meaning: 'Let\'s ~ together', example: '一緒に映画を見ましょう。', exampleMeaning: 'Let\'s watch a movie together.', formality: 'formal' },
        { number: 63, pattern: '～があります', meaning: 'Have/There is ~', example: '兄弟があります。', exampleMeaning: 'I have siblings.', formality: 'formal' },
        { number: 64, pattern: '～たことがあります', meaning: 'Have done ~ before', example: '日本に行ったことがあります。', exampleMeaning: 'I have been to Japan before.', formality: 'formal' },
        { number: 65, pattern: '～くなります', meaning: 'Become/Get ~', example: 'だんだん暖かくなります。', exampleMeaning: 'It gradually becomes warmer.', formality: 'formal' },
        { number: 66, pattern: '～になります', meaning: 'Become ~ (noun)', example: '将来、先生になりたいです。', exampleMeaning: 'I want to become a teacher in the future.', formality: 'formal' },
        { number: 67, pattern: '～ています', meaning: 'Currently ~ing (continuous)', example: '今、読書しています。', exampleMeaning: 'I am reading now.', formality: 'formal' },
        { number: 68, pattern: '～まえに', meaning: 'Before ~', example: '寝る前に、シャワーを浴びます。', exampleMeaning: 'I take a shower before sleeping.', formality: 'both' },
        { number: 69, pattern: '～あとで', meaning: 'After ~', example: 'ご飯を食べた後で、休みます。', exampleMeaning: 'I rest after eating.', formality: 'both' },
        { number: 70, pattern: '～もう一度', meaning: 'Do ~ once more/again', example: 'もう一度してください。', exampleMeaning: 'Please do it once more.', formality: 'formal' },
    ],
};

const potentialFormData: PotentialFormVerb[] = [
    { base: '書く', furigana: 'かく', type: '5-dan', potentialForm: '書ける', potentialFurigana: 'かける', meaning: 'write', explanation: 'Rule: a-segment → e-segment + る (ka → ke)', example: 'ペンで書けますか。', exampleMeaning: 'Can you write with a pen?' },
    { base: '飲む', furigana: 'のむ', type: '5-dan', potentialForm: '飲める', potentialFurigana: 'のめる', meaning: 'drink', explanation: 'Rule: a-segment → e-segment + る (mu → me)', example: '水を飲めます。', exampleMeaning: 'I can drink water.' },
    { base: '話す', furigana: 'はなす', type: '5-dan', potentialForm: '話せる', potentialFurigana: 'はなせる', meaning: 'speak', explanation: 'Rule: a-segment → e-segment + る (su → se)', example: '日本語を話せますか。', exampleMeaning: 'Can you speak Japanese?' },
    { base: '行く', furigana: 'いく', type: '5-dan', potentialForm: '行ける', potentialFurigana: 'いける', meaning: 'go', explanation: 'Rule: a-segment → e-segment + る (ku → ke)', example: '明日、行けますか。', exampleMeaning: 'Can you go tomorrow?' },
    { base: '読む', furigana: 'よむ', type: '5-dan', potentialForm: '読める', potentialFurigana: 'よめる', meaning: 'read', explanation: 'Rule: a-segment → e-segment + る (mu → me)', example: '新聞が読めます。', exampleMeaning: 'I can read newspapers.' },
    { base: '買う', furigana: 'かう', type: '5-dan', potentialForm: '買える', potentialFurigana: 'かえる', meaning: 'buy', explanation: 'Rule: a-segment → e-segment + る (u → e)', example: '何でも買えます。', exampleMeaning: 'I can buy anything.' },
    { base: '食べる', furigana: 'たべる', type: '1-dan', potentialForm: '食べられる', potentialFurigana: 'たべられる', meaning: 'eat', explanation: 'Rule: remove る + られる (remove -ru, add -rareru)', example: '何でも食べられます。', exampleMeaning: 'I can eat anything.' },
    { base: '見る', furigana: 'みる', type: '1-dan', potentialForm: '見られる', potentialFurigana: 'みられる', meaning: 'see/watch', explanation: 'Rule: remove る + られる', example: '映画が見られますか。', exampleMeaning: 'Can you watch movies?' },
    { base: '寝る', furigana: 'ねる', type: '1-dan', potentialForm: '寝られる', potentialFurigana: 'ねられる', meaning: 'sleep', explanation: 'Rule: remove る + られる', example: 'ここで寝られますか。', exampleMeaning: 'Can I sleep here?' },
    { base: '起きる', furigana: 'おきる', type: '1-dan', potentialForm: '起きられる', potentialFurigana: 'おきられる', meaning: 'wake up', explanation: 'Rule: remove る + られる', example: '朝早く起きられます。', exampleMeaning: 'I can wake up early.' },
    { base: '着る', furigana: 'きる', type: '1-dan', potentialForm: '着られる', potentialFurigana: 'きられる', meaning: 'wear', explanation: 'Rule: remove る + られる', example: 'このセーター、着られますか。', exampleMeaning: 'Can you wear this sweater?' },
    { base: 'する', furigana: 'する', type: 'irregular', potentialForm: 'できる', potentialFurigana: 'できる', meaning: 'do', explanation: 'Irregular: completely different form (must memorize)', example: '何でもできます。', exampleMeaning: 'I can do anything.' },
    { base: '来る', furigana: 'くる', type: 'irregular', potentialForm: '来られる', potentialFurigana: 'こられる', meaning: 'come', explanation: 'Irregular: special form (must memorize)', example: '明日、来られますか。', exampleMeaning: 'Can you come tomorrow?' },
];

const teFormExerciseData: TeFormExercise[] = [
    { question: '朝、シャワーを _____ 、朝食を食べました。', options: ['浴びる', '浴びて', '浴びた', '浴びない'], correct: '浴びて', explanation: 'Te-form で sequential actions: "took a shower and (then) ate breakfast." Verb: 浴びる→浴びて', grammarPoint: 'Verb (Sequential Action)', category: 'verb' },
    { question: '本を読んで、_____ しました。', options: ['寝る', '寝ます', '寝て', 'ねた'], correct: '寝て', explanation: 'Te-form て connecting two actions: "read a book and (then) slept."', grammarPoint: 'Verb (Sequential Action)', category: 'verb' },
    { question: 'ドアを _____ 、部屋を出ました。', options: ['閉じる', '閉じる', '閉じて', '閉じた'], correct: '閉じて', explanation: 'Te-form for sequential actions: "closed the door and left the room."', grammarPoint: 'Verb (Sequential Action)', category: 'verb' },
    { question: 'コーヒーを飲んで、_____ を始めました。', options: ['仕事', '仕事を', '仕事して', '仕事した'], correct: '仕事を', explanation: 'Two te-form actions connected: "drank coffee and began work." Need を particle for the object.', grammarPoint: 'Verb (Sequence)', category: 'verb' },
    { question: '薬を _____ 、気分が良くなりました。', options: ['飲む', '飲みます', '飲んで', '飲んだ'], correct: '飲んで', explanation: 'Te-form で showing cause-effect: "took medicine and (as a result) felt better."', grammarPoint: 'Verb (Cause-Effect)', category: 'verb' },
    { question: '雨が _____ 、野球ゲームが中止になりました。', options: ['降る', '降ります', '降って', '降った'], correct: '降って', explanation: 'Te-form で for cause-effect: "it rained and the baseball game was cancelled."', grammarPoint: 'Verb (Cause-Effect)', category: 'verb' },
    { question: 'この本は _____ で面白いです。', options: ['新しい', '新しくて', '新しかった', '新しくない'], correct: '新しくて', explanation: 'Te-form for い-adjectives to connect multiple descriptions: "is new and interesting."', grammarPoint: 'い-adjective (Multiple descriptions)', category: 'adjective' },
    { question: 'その映画は _____ で、つまらなかったです。', options: ['長い', '長くて', '長かった', '長くない'], correct: '長くて', explanation: 'Te-form で for い-adjectives: "was long and boring."', grammarPoint: 'い-adjective (Conjunction)', category: 'adjective' },
    { question: 'この公園は _____ で、子どもたちが好きです。', options: ['静かな', '静かで', '静かだ', '静かじゃない'], correct: '静かで', explanation: 'Te-form で for な-adjectives to connect clauses: "is quiet and the children like it."', grammarPoint: 'な-adjective (Conjunction)', category: 'adjective' },
    { question: 'その人は _____ で、親切です。', options: ['美しい', '美しくて', '美しかった', '美しくない'], correct: '美しくて', explanation: 'Te-form で connecting two い-adjective descriptions: "is beautiful and kind."', grammarPoint: 'い-adjective (Multiple Adjectives)', category: 'adjective' },
    { question: 'このカフェは _____ で、コーヒーが美味しいです。', options: ['清潔な', '清潔で', '清潔だ', '清潔ではない'], correct: '清潔で', explanation: 'Te-form で for な-adjectives connecting descriptions: "is clean and the coffee is delicious."', grammarPoint: 'な-adjective (Conjunction)', category: 'adjective' },
    { question: 'この仕事は _____ で、給料も良いです。', options: ['簡単な', '簡単で', '簡単だ', '簡単ではない'], correct: '簡単で', explanation: 'Te-form で for な-adjectives: "is simple and the salary is good."', grammarPoint: 'な-adjective (Conjunction)', category: 'adjective' },
    { question: '田中さんは _____ で、責任感があります。', options: ['社員', '社員で', '社員だ', '社員ではない'], correct: '社員で', explanation: 'Te-form で for nouns: "is an employee and has a sense of responsibility."', grammarPoint: 'Noun (Conjunction)', category: 'noun' },
    { question: '彼は _____ で、スポーツが得意です。', options: ['学生', '学生で', '学生だ', '学生ではない'], correct: '学生で', explanation: 'Te-form で for nouns connecting two facts: "is a student and good at sports."', grammarPoint: 'Noun (Conjunction)', category: 'noun' },
    { question: '私の友達は _____ で、とても面白い人です。', options: ['医者', '医者で', '医者だ', '医者ではない'], correct: '医者で', explanation: 'Te-form で for nouns: "is a doctor and is a very interesting person."', grammarPoint: 'Noun (Conjunction)', category: 'noun' },
    { question: 'その店は _____ で、美しい女性店員がいます。', options: ['レストラン', 'レストランで', 'レストランだ', 'レストランではない'], correct: 'レストランで', explanation: 'Te-form で for nouns showing location and characteristic: "is a restaurant and has a beautiful female staff member."', grammarPoint: 'Noun (Location/Characteristic)', category: 'noun' },
    { question: '朝 _____ で、起きるのが大変です。', options: ['暗い', '暗くて', '暗かった', '暗くない'], correct: '暗くて', explanation: 'Te-form で for い-adjectives: "it is dark in the morning and it\'s hard to wake up."', grammarPoint: 'い-adjective (Cause-Effect)', category: 'adjective' },
    { question: 'その車は _____ で、修理に出しました。', options: ['古い', '古くて', '古かった', '古くない'], correct: '古くて', explanation: 'Te-form で for い-adjectives showing cause: "the car is old and I sent it for repair."', grammarPoint: 'い-adjective (Cause)', category: 'adjective' },
    { question: 'この場所は _____ で、誰もいません。', options: ['寂しい', '寂しくて', '寂しかった', '寂しくない'], correct: '寂しくて', explanation: 'Te-form で for い-adjectives: "this place is lonely and there is nobody."', grammarPoint: 'い-adjective (Description)', category: 'adjective' },
    { question: '彼女は _____ で、すぐに仲間ができました。', options: ['親切な', '親切で', '親切だ', '親切ではない'], correct: '親切で', explanation: 'Te-form で for な-adjectives showing result: "she is kind and quickly made friends."', grammarPoint: 'な-adjective (Result)', category: 'adjective' },
];

const grammarExerciseData: GrammarExercise[] = [
    { question: '私は毎日 _____ 学校に行きます。', blank: '朝6時に', options: ['朝6時に', '朝で6時', '朝から6時', '朝の6時で'], correct: '朝6時に', explanation: 'Time particle に marks specific time. "朝6時に" = "at 6 AM".', grammarPoint: 'Time + に' },
    { question: '私は友達 _____ 公園で遊びます。', blank: 'と', options: ['で', 'と', 'に', 'は'], correct: 'と', explanation: 'Particle と means "with" when with people. "友達と遊ぶ" = "play with friend".', grammarPoint: 'Particle と' },
    { question: '昨日、映画 _____ 見ました。', blank: 'を', options: ['は', 'を', 'に', 'で'], correct: 'を', explanation: 'Object particle を marks direct object. "映画を見る" = "watch a movie".', grammarPoint: 'Object Particle を' },
    { question: 'これ _____ 私のペンです。', blank: 'は', options: ['は', 'を', 'に', 'で'], correct: 'は', explanation: 'Topic particle は identifies topic. "これは..." = "This is...".', grammarPoint: 'Topic Particle は' },
    { question: '図書館 _____ 勉強します。', blank: 'で', options: ['に', 'で', 'と', 'は'], correct: 'で', explanation: 'Location particle で marks action location. "図書館で勉強" = "study at library".', grammarPoint: 'Location で' },
    { question: '兄 _____ 背が高いです。', blank: 'より', options: ['は', 'を', 'より', 'の'], correct: 'より', explanation: 'Particle より means "than". "兄より背が高い" = "taller than brother".', grammarPoint: 'Comparison より' },
    { question: '去年、東京 _____ 行きました。', blank: 'に', options: ['に', 'で', 'は', 'を'], correct: 'に', explanation: 'Destination particle に shows direction. "東京に行く" = "go to Tokyo".', grammarPoint: 'Destination に' },
    { question: '私 _____ 学生です。', blank: 'は', options: ['は', 'を', 'に', 'で'], correct: 'は', explanation: 'Topic は marks main topic. "I am student" = "私は学生です".', grammarPoint: 'Subject は' },
    { question: '毎日、コーヒー _____ 飲みます。', blank: 'を', options: ['で', 'を', 'に', 'は'], correct: 'を', explanation: 'Direct object を marks what verb acts on. "コーヒーを飲む" = "drink coffee".', grammarPoint: 'Direct Object を' },
    { question: '机 _____ 本があります。', blank: 'の', options: ['の', 'に', 'を', 'で'], correct: 'の', explanation: 'Possessive の shows ownership. "机の上" = "on top of desk".', grammarPoint: 'Possession の' },
    { question: '誰 _____ 来ましたか？', blank: 'が', options: ['は', 'が', 'を', 'で'], correct: 'が', explanation: 'Subject particle が marks who/what. "誰が来た？" = "Who came?"', grammarPoint: 'Subject が' },
    { question: 'これ _____ 好きです。', blank: 'が', options: ['は', 'が', 'を', 'で'], correct: 'が', explanation: 'Particle が marks what is liked. "これが好きです" = "I like this".', grammarPoint: 'Preference が' },
    { question: '私 _____ 猫を持っています。', blank: 'は', options: ['は', 'が', 'を', 'で'], correct: 'は', explanation: 'Topic は introduces general statement. "I have a cat" = "私は猫を持っています".', grammarPoint: 'Topic は (possession)' },
    { question: '水 _____ 飲んでもいいですか？', blank: 'を', options: ['を', 'で', 'に', 'は'], correct: 'を', explanation: 'Object を marks what being asked about. "May I drink water?" = "水を飲んでもいい？"', grammarPoint: 'Object を (permission)' },
    { question: 'ペン _____ 字を書きます。', blank: 'で', options: ['を', 'で', 'に', 'は'], correct: 'で', explanation: 'Particle で marks tool/means. "ペンで書く" = "write with pen".', grammarPoint: 'Means で' },
    { question: '家族 _____ 行きました。', blank: 'と', options: ['と', 'に', 'を', 'は'], correct: 'と', explanation: 'Particle と means "with" (people). "家族と行った" = "went with family".', grammarPoint: 'Companion と' },
    { question: '私 _____ 日本語を勉強しています。', blank: 'は', options: ['は', 'が', 'を', 'で'], correct: 'は', explanation: 'Topic は for general activity. "I study Japanese" = "私は日本語を勉強します".', grammarPoint: 'Topic (activity)' },
    { question: '彼 _____ 高い。', blank: 'は', options: ['は', 'が', 'を', 'で'], correct: 'は', explanation: 'Topic は introduces description. "He is tall" = "彼は背が高い".', grammarPoint: 'Topic (description)' },
    { question: 'この花 _____ 綺麗です。', blank: 'は', options: ['は', 'が', 'を', 'で'], correct: 'は', explanation: 'Topic は identifies subject. "This flower is beautiful" = "この花は綺麗です".', grammarPoint: 'Topic (adjective)' },
    { question: 'テーブル _____ 椅子があります。', blank: 'の', options: ['の', 'に', 'を', 'で'], correct: 'の', explanation: 'Possession の shows relationship. "table\'s chair" = "テーブルの椅子".', grammarPoint: 'Possession (relationship)' },
    { question: '新しい _____ が欲しいです。', blank: 'パソコン', options: ['ベッド', 'パソコン', 'ネコ', 'ビール'], correct: 'パソコン', explanation: 'い-adjective 新しい modifies nouns. "I want a new computer".', grammarPoint: 'い-adjective (noun)' },
    { question: '古い _____ を売りました。', blank: '本', options: ['本', '石', 'テレビ', '花'], correct: '本', explanation: 'い-adjective 古い modifies noun. "I sold old books" = "古い本を売った".', grammarPoint: 'い-adjective (object)' },
    { question: 'これは _____ です。', blank: '新しい', options: ['新しい', '新しくて', '新しかった', '新しくない'], correct: '新しい', explanation: 'い-adjective directly before です. "This is new" = "これは新しいです".', grammarPoint: 'い-adjective + です' },
    { question: '昨日は _____ 天気でした。', blank: '悪い', options: ['悪い', '悪くて', '悪かった', '悪な'], correct: '悪い', explanation: 'い-adjective before です in past. "Yesterday was bad weather" = "昨日は悪い天気でした".', grammarPoint: 'い-adjective (past)' },
    { question: 'この車は _____ です。', blank: '便利な', options: ['便利', '便利い', '便利な', '便利で'], correct: '便利な', explanation: 'な-adjective needs な before noun/です. "This car is convenient".', grammarPoint: 'な-adjective + です' },
    { question: '綺麗 _____ 花をもらいました。', blank: 'な', options: ['な', 'い', 'で', 'を'], correct: 'な', explanation: 'な-adjective uses な before noun. "beautiful flower" = "綺麗な花".', grammarPoint: 'な-adjective (noun)' },
    { question: 'これは _____ です。', blank: '静かな', options: ['静かな', '静か', '静かい', '静かで'], correct: '静かな', explanation: 'な-adjective 静か becomes 静かな before です. "It is quiet" = "これは静かです".', grammarPoint: 'な-adjective' },
    { question: 'テーブル _____ 上に本があります。', blank: 'の', options: ['の', 'に', 'で', 'と'], correct: 'の', explanation: 'Possession の shows location. "on the table" = "テーブルの上".', grammarPoint: 'Possession (location)' },
    { question: '公園 _____ 子どもがいます。', blank: 'に', options: ['に', 'で', 'の', 'は'], correct: 'に', explanation: 'Particle に marks existence location. "There are children in the park".', grammarPoint: 'Existence (location)' },
    { question: '冷蔵庫 _____ 牛乳があります。', blank: 'に', options: ['で', 'に', 'は', 'を'], correct: 'に', explanation: 'Particle に marks where object exists. "There is milk in the fridge".', grammarPoint: 'Existence に' },
    { question: '昨日は _____ しました。', blank: '雨が降り', options: ['雨が降り', '雨で降り', '雨の降り', '雨を降り'], correct: '雨が降り', explanation: 'Subject が with action verb. "It rained yesterday" = "昨日は雨が降りました".', grammarPoint: 'Subject (weather)' },
    { question: 'これ _____ 飲み物です。', blank: 'は', options: ['は', 'が', 'を', 'で'], correct: 'は', explanation: 'Topic は for categorical statement. "This is a beverage".', grammarPoint: 'Category' },
    { question: '学校 _____ 行きますか？', blank: 'に', options: ['に', 'で', 'は', 'を'], correct: 'に', explanation: 'Destination に for going to. "Do you go to school?" = "学校に行きますか？"', grammarPoint: 'Destination' },
    { question: '兄 _____ 弟 _____ 背が高いです。', blank: 'より / は', options: ['より / は', 'から / で', 'を / に', 'で / を'], correct: 'より / は', explanation: 'Comparison: "The older brother is taller than the younger one" = "兄は弟より背が高い".', grammarPoint: 'Comparison' },
    { question: 'りんご _____ バナナ _____ どちらが好きですか？', blank: 'と', options: ['と', 'より', 'で', 'に'], correct: 'と', explanation: 'Particle と for comparison questions. "Apple or banana, which do you prefer?"', grammarPoint: 'Choice と' },
    { question: '新しい家 _____ 古い家、どちらが欲しいですか？', blank: 'と', options: ['と', 'より', 'で', 'の'], correct: 'と', explanation: 'Particle と in comparison questions. "new or old house?"', grammarPoint: 'Comparison question' },
    { question: '私は毎日、学校に _____ 前に朝食を食べます。', blank: '行く', options: ['行く', '行った', '行く前に', '行った後で'], correct: '行く', explanation: 'Before action pattern. "Before going to school, I eat breakfast".', grammarPoint: 'Time sequence' },
    { question: '家に _____ 時、猫を見ました。', blank: '帰った', options: ['帰った', '帰る', '帰り', '帰ります'], correct: '帰った', explanation: 'When-clause with past form. "When I came home, I saw a cat".', grammarPoint: 'When-clause' },
    { question: '子どもが _____ ので、早く帰りました。', blank: 'いた', options: ['いた', 'いる', 'いない', 'いました'], correct: 'いた', explanation: 'Reason clause with ので. "Because the child was there, I left early".', grammarPoint: 'Reason (ので)' },
    { question: 'インターネット _____ 調べます。', blank: 'で', options: ['を', 'で', 'に', 'は'], correct: 'で', explanation: 'Means/tool particle で. "I research using the internet".', grammarPoint: 'Tool で' },
    { question: 'リンゴ _____ ジュースを作ります。', blank: 'で', options: ['の', 'で', 'を', 'に'], correct: 'で', explanation: 'Made from で. "Make juice from apples".', grammarPoint: 'Material で' },
    { question: 'これは日本 _____ 物です。', blank: 'の', options: ['の', 'で', 'に', 'を'], correct: 'の', explanation: 'Origin の. "This is a thing from Japan" = "日本の物".', grammarPoint: 'Origin の' },
    { question: '肉 _____ 野菜も食べます。', blank: 'も', options: ['と', 'も', 'を', 'で'], correct: 'も', explanation: 'Inclusive particle も. "I eat meat and vegetables too".', grammarPoint: 'Also も' },
    { question: '日本語 _____ 中国語 _____ 勉強しています。', blank: 'も / も', options: ['も / も', 'と / と', 'を / を', 'で / で'], correct: 'も / も', explanation: 'Both...and with も. "I study both Japanese and Chinese".', grammarPoint: 'Both も' },
    { question: '水 _____ 飲みません。', blank: 'は', options: ['は', 'を', 'に', 'で'], correct: 'は', explanation: 'Negative with は. "I do not drink water" = "水は飲みません".', grammarPoint: 'Negative' },
    { question: 'パン _____ 食べません。', blank: 'を', options: ['を', 'に', 'で', 'は'], correct: 'を', explanation: 'Object in negative. "I do not eat bread".', grammarPoint: 'Negative object' },
    { question: 'これ _____ 食べませんでした。', blank: 'を', options: ['を', 'に', 'で', 'は'], correct: 'を', explanation: 'Past negative. "I did not eat this".', grammarPoint: 'Past negative' },
    { question: '美しい _____ かった。', blank: '花だ', options: ['花だ', '花', '花で', '花に'], correct: '花だ', explanation: 'Adjective modifying noun. "The flower was beautiful" = "美しい花だった".', grammarPoint: 'Adjective (past)' },
    { question: '大きくて白 _____ 犬が好きです。', blank: 'い', options: ['い', 'な', 'で', 'を'], correct: 'い', explanation: 'Multiple い-adjectives connected. "big, white dog".', grammarPoint: 'Multiple adjectives' },
    { question: 'これは便利 _____ 道具です。', blank: 'な', options: ['な', 'い', 'で', 'を'], correct: 'な', explanation: 'な-adjective modifying noun. "convenient tool" = "便利な道具".', grammarPoint: 'な-adjective (noun)' },
    { question: 'うどん _____ 食べたいです。', blank: 'が', options: ['を', 'が', 'に', 'で'], correct: 'が', explanation: 'Particle が with ~たい. "I want to eat udon".', grammarPoint: 'Want to (たい)' },
    { question: '私は寿司 _____ 食べたいです。', blank: 'を', options: ['を', 'が', 'に', 'で'], correct: 'を', explanation: 'Object を with たい. Alternative to が in desire.', grammarPoint: 'Want to (object)' },
    { question: '先生 _____ 日本語を勉強しています。', blank: 'に', options: ['に', 'で', 'を', 'は'], correct: 'に', explanation: 'Teacher as target of learning. "Learning Japanese from teacher" = "先生に日本語を習う".', grammarPoint: 'Learn from' },
    { question: 'このテスト _____ 合格しました。', blank: 'に', options: ['に', 'で', 'を', 'は'], correct: 'に', explanation: 'Pass test with に. "Passed this test".', grammarPoint: 'Achievement に' },
    { question: '彼 _____ 教えてもらいました。', blank: 'に', options: ['に', 'で', 'を', 'は'], correct: 'に', explanation: 'Request from someone に. "I had him teach me".', grammarPoint: 'Request に' },
    { question: 'これ _____ なりたいです。', blank: 'に', options: ['に', 'を', 'で', 'は'], correct: 'に', explanation: 'Become something に. "I want to become this" = "これになりたい".', grammarPoint: 'Become に' },
    { question: '学校 _____ 着きました。', blank: 'に', options: ['に', 'で', 'を', 'は'], correct: 'に', explanation: 'Arrive at に. "Arrived at school" = "学校に着いた".', grammarPoint: 'Arrive に' },
    { question: 'お母さん _____ 電話をしました。', blank: 'に', options: ['に', 'で', 'を', 'は'], correct: 'に', explanation: 'Call someone に. "Called mother" = "お母さんに電話をした".', grammarPoint: 'Call に' },
    { question: 'まず、塩 _____ 入れます。', blank: 'を', options: ['を', 'に', 'で', 'は'], correct: 'を', explanation: 'Object を. "First, I add salt" = "まず、塩を入れます".', grammarPoint: 'Add を' },
    { question: 'スポーツ _____ 好きです。', blank: 'が', options: ['が', 'を', 'に', 'は'], correct: 'が', explanation: 'Preference が. "I like sports".', grammarPoint: 'Like (preference)' },
    { question: '毎晩、テレビ _____ 見ます。', blank: 'を', options: ['を', 'に', 'で', 'は'], correct: 'を', explanation: 'Watch something を. "Every night I watch TV" = "毎晩、テレビを見ます".', grammarPoint: 'Watch を' },
    { question: '朝、新聞 _____ 読みます。', blank: 'を', options: ['を', 'に', 'で', 'は'], correct: 'を', explanation: 'Read something を. "In the morning, I read the newspaper".', grammarPoint: 'Read を' },
    { question: '私 _____ 兄が好きです。', blank: 'は', options: ['は', 'が', 'を', 'で'], correct: 'は', explanation: 'Topic は with subject が. "As for me, I like my older brother" = "私は兄が好きです".', grammarPoint: 'Topic + subject' },
    { question: '去年 _____ 2回、日本に行きました。', blank: 'は', options: ['は', 'を', 'に', 'で'], correct: 'は', explanation: 'Topic は for frequency. "Last year, (I) went to Japan twice".', grammarPoint: 'Frequency は' },
    { question: 'この本 _____ 難しいです。', blank: 'は', options: ['は', 'が', 'を', 'で'], correct: 'は', explanation: 'Topic は with adjective. "This book is difficult".', grammarPoint: 'Topic (difficulty)' },
    { question: 'どうして _____ 来ませんでしたか？', blank: '彼は', options: ['彼は', '彼が', '彼を', '彼に'], correct: '彼は', explanation: 'Topic は in question. "Why didn\'t he come?"', grammarPoint: 'Question topic' },
    { question: 'いつ _____ 東京に行きますか？', blank: '彼は', options: ['彼は', '彼が', '彼を', '彼に'], correct: '彼は', explanation: 'Topic は in when-question. "When will he go to Tokyo?"', grammarPoint: 'When-question' },
    { question: 'どこ _____ 住んでいますか？', blank: 'に', options: ['に', 'で', 'を', 'は'], correct: 'に', explanation: 'Where location に. "Where do you live?" = "どこに住んでいますか？"', grammarPoint: 'Where に' },
    { question: '私は日本語を話す _____ ができます。', blank: 'こと', options: ['こと', 'もの', 'ほう', 'ため'], correct: 'こと', explanation: '~ことができます expresses ability: "I can speak Japanese" = "日本語を話すことができます". This is a more formal way to express ability than just using the potential form.', grammarPoint: '~ことができます (ability)' },
    { question: '明日、手伝う _____ ができますか？', blank: 'こと', options: ['こと', 'もの', 'ほう', 'ため'], correct: 'こと', explanation: 'Can help tomorrow using ~ことができます. "Can you help tomorrow?" = "明日、手伝うことができますか？" Same meaning as potential form 手伝えますか but more formal.', grammarPoint: '~ことができます (offer help)' },
    { question: 'この機械は自動で動く _____ ができます。', blank: 'こと', options: ['こと', 'もの', 'ほう', 'ため'], correct: 'こと', explanation: '~ことができます with ability: "This machine can move automatically" = "この機械は自動で動くことができます".', grammarPoint: '~ことができます (machine ability)' },
    { question: 'あなたは何 _____ ことができますか？', blank: 'を', options: ['が', 'を', 'に', 'で'], correct: 'を', explanation: 'What can you do question: "What can you do?" = "あなたは何ができますか？" Use を for direct object after verbs.', grammarPoint: '~ことができます (what question)' },
    { question: 'ピアノを弾く _____ ができません。', blank: 'こと', options: ['こと', 'もの', 'ほう', 'ため'], correct: 'こと', explanation: 'Cannot do: "I cannot play piano" = "ピアノを弾くことができません". Use ~ことができません for negative ability.', grammarPoint: '~ことができません (cannot)' },
    { question: 'この文を理解する _____ ができますか？', blank: 'こと', options: ['こと', 'もの', 'ほう', 'ため'], correct: 'こと', explanation: 'Can understand: "Can you understand this sentence?" = "この文を理解することができますか？" Shows ability with ~ことができます.', grammarPoint: '~ことができます (understanding)' },
];


function Flashcard({ item, isFlipped, onFlip }: { item: FlashcardItem; isFlipped: boolean; onFlip: () => void }) {
    return (
        <div
            onClick={onFlip}
            className={classNames(
                'relative w-full h-64 cursor-pointer rounded-lg border-2 transition-all duration-300',
                isFlipped ? 'border-pink-500' : 'border-purple-500',
                'flex items-center justify-center p-6 text-center overflow-hidden'
            )}
            style={{
                backgroundImage: 'url(data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" fill="%23001a4d" filter="url(%23noise)" opacity="0.5"/%3E%3C/svg%3E)',
                backgroundSize: 'cover',
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 to-slate-900/85 via-slate-900/90" />
            
            <div className="relative z-10">
                {!isFlipped ? (
                    <div className="space-y-4">
                        <div className="text-sm text-slate-300">Click to reveal answer</div>
                        <div className="text-5xl font-bold text-pink-400">{item.kanji}</div>
                        <div className="text-xs text-slate-400">↻ Flip</div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-3xl font-bold text-pink-400">{item.kanji}</div>
                        <div className="text-sm text-indigo-300">{item.hiragana}</div>
                        <div className="text-xl font-semibold text-slate-100">{item.meaning}</div>
                        <div className="text-xs text-slate-400">↻ Next card</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function AdjectiveConjugationQuiz() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [adjectiveType, setAdjectiveType] = useState<'i' | 'na' | null>(null);

    const filteredAdjectives = useMemo(() => {
        return adjectiveType
            ? adjectiveConjugationData.filter(adj => adj.type === adjectiveType).sort(() => Math.random() - 0.5)
            : adjectiveConjugationData.sort(() => Math.random() - 0.5);
    }, [adjectiveType]);

    const currentAdjective = filteredAdjectives[currentIndex];
    const progress = Math.round(((currentIndex + 1) / filteredAdjectives.length) * 100);

    const moveToNext = () => {
        if (currentIndex < filteredAdjectives.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setExpandedCategory(null);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setExpandedCategory(null);
    };

    const groupedConjugations = useMemo(() => {
        const groups: { [key: string]: typeof currentAdjective['conjugations'] } = {};
        currentAdjective?.conjugations.forEach(conj => {
            if (!groups[conj.category]) groups[conj.category] = [];
            groups[conj.category].push(conj);
        });
        return groups;
    }, [currentAdjective]);

    if (!adjectiveType) {
        return (
            <div className="w-full space-y-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2 text-pink-400">Adjective Conjugation Practice</h3>
                    <p className="text-sm text-slate-400 mb-6">Master い-adjectives and な-adjectives with all conjugation forms (negative, past, conditional, te-form).</p>
                </div>
                <div className="space-y-4 max-w-md">
                    <button
                        onClick={() => setAdjectiveType('i')}
                        className="w-full p-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-purple-500/50 text-white rounded-lg font-semibold transition-all"
                    >
                        <div className="text-2xl mb-2">い-Adjectives</div>
                        <div className="text-sm text-indigo-100">新しい (new), 古い (old), 美しい (beautiful)</div>
                    </button>
                    <button
                        onClick={() => setAdjectiveType('na')}
                        className="w-full p-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-lg hover:shadow-rose-500/50 text-white rounded-lg font-semibold transition-all"
                    >
                        <div className="text-2xl mb-2">な-Adjectives</div>
                        <div className="text-sm text-pink-100">綺麗な (beautiful), 静かな (quiet), 便利な (convenient)</div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => { setAdjectiveType(null); setCurrentIndex(0); }}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                >
                    ← Back
                </button>
            </div>

            <h3 className="text-2xl font-bold mb-2 text-pink-400">
                {adjectiveType === 'i' ? 'い-Adjectives' : 'な-Adjectives'} Conjugation
            </h3>
            <p className="text-sm text-slate-400 mb-6">Learn all forms of adjectives including negation, past, conditional, and noun modification.</p>

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">Progress</span>
                        <span className="text-sm text-pink-400 font-semibold">
                            {currentIndex + 1}/{filteredAdjectives.length}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg">
                    <div className="text-center mb-4">
                        <div className="text-sm text-slate-400 mb-2">Adjective</div>
                        <div className="text-4xl font-bold text-pink-400 mb-2">{currentAdjective?.base}</div>
                        <div className="text-sm text-indigo-300 mb-2">{currentAdjective?.furigana}</div>
                        <div className="text-slate-300">{currentAdjective?.meaning}</div>
                    </div>
                </div>

                <div className="space-y-3">
                    {Object.entries(groupedConjugations).map(([category, forms]) => (
                        <div key={category} className="bg-slate-800/50 border border-indigo-500/30 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                            >
                                <span className="font-semibold text-indigo-300">{category}</span>
                                <span className="text-slate-400">{expandedCategory === category ? '▼' : '▶'}</span>
                            </button>
                            {expandedCategory === category && (
                                <div className="p-4 border-t border-indigo-500/20 space-y-3">
                                    {forms.map((conj, idx) => (
                                        <div key={idx} className="p-3 bg-indigo-900/20 rounded">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm text-indigo-300 font-semibold">{conj.form}</span>
                                                <span className="text-xs text-slate-400">{conj.category}</span>
                                            </div>
                                            <div className="text-lg font-bold text-pink-400 mb-2">{conj.result}</div>
                                            <div className="text-sm text-slate-300">{conj.explanation}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 justify-center">
                    {currentIndex < filteredAdjectives.length - 1 ? (
                        <button
                            onClick={moveToNext}
                            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                        >
                            Next Adjective
                        </button>
                    ) : (
                        <button
                            onClick={handleRestart}
                            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                        >
                            Start Over
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function NounConjugationQuiz() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const shuffledNouns = useMemo(() => {
        return [...nounConjugationData].sort(() => Math.random() - 0.5);
    }, []);

    const currentNoun = shuffledNouns[currentIndex];
    const progress = Math.round(((currentIndex + 1) / shuffledNouns.length) * 100);

    const moveToNext = () => {
        if (currentIndex < shuffledNouns.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setExpandedCategory(null);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setExpandedCategory(null);
    };

    const groupedConjugations = useMemo(() => {
        const groups: { [key: string]: typeof currentNoun['conjugations'] } = {};
        currentNoun?.conjugations.forEach(conj => {
            if (!groups[conj.category]) groups[conj.category] = [];
            groups[conj.category].push(conj);
        });
        return groups;
    }, [currentNoun]);

    return (
        <div className="w-full">
            <h3 className="text-2xl font-bold mb-2 text-pink-400">Noun Conjugation Practice</h3>
            <p className="text-sm text-slate-400 mb-6">Learn noun negations and conditional forms with different politeness levels.</p>

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">Progress</span>
                        <span className="text-sm text-pink-400 font-semibold">
                            {currentIndex + 1}/{shuffledNouns.length}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg">
                    <div className="text-center mb-4">
                        <div className="text-sm text-slate-400 mb-2">Noun</div>
                        <div className="text-4xl font-bold text-pink-400 mb-2">{currentNoun?.base}</div>
                        <div className="text-sm text-indigo-300 mb-2">{currentNoun?.furigana}</div>
                        <div className="text-slate-300">{currentNoun?.meaning}</div>
                    </div>
                </div>

                <div className="space-y-3">
                    {Object.entries(groupedConjugations).map(([category, forms]) => (
                        <div key={category} className="bg-slate-800/50 border border-indigo-500/30 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                            >
                                <span className="font-semibold text-indigo-300">{category}</span>
                                <span className="text-slate-400">{expandedCategory === category ? '▼' : '▶'}</span>
                            </button>
                            {expandedCategory === category && (
                                <div className="p-4 border-t border-indigo-500/20 space-y-3">
                                    {forms.map((conj, idx) => (
                                        <div key={idx} className="p-3 bg-indigo-900/20 rounded">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm text-indigo-300 font-semibold">{conj.form}</span>
                                                <span className="text-xs text-slate-400">{conj.category}</span>
                                            </div>
                                            <div className="text-lg font-bold text-pink-400 mb-2">{conj.result}</div>
                                            <div className="text-sm text-slate-300">{conj.explanation}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 justify-center">
                    {currentIndex < shuffledNouns.length - 1 ? (
                        <button
                            onClick={moveToNext}
                            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                        >
                            Next Noun
                        </button>
                    ) : (
                        <button
                            onClick={handleRestart}
                            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                        >
                            Start Over
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function VerbConjugationQuiz() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showStats, setShowStats] = useState(false);
    const [selectedForm, setSelectedForm] = useState<string | null>(null);

    const allForms = useMemo(() => {
        const forms = new Set<string>();
        verbConjugationData.forEach(verb => {
            verb.conjugations.forEach(conj => forms.add(conj.form));
        });
        return ['Random', ...Array.from(forms)];
    }, []);

    const shuffledVerbs = useMemo(() => {
        return [...verbConjugationData].sort(() => Math.random() - 0.5);
    }, []);

    const currentVerb = shuffledVerbs[currentIndex];
    
    const correctIndex = useMemo(() => {
        if (!currentVerb) return 0;
        if (selectedForm && selectedForm !== 'Random') {
            const formIndex = currentVerb.conjugations.findIndex(c => c.form === selectedForm);
            return formIndex >= 0 ? formIndex : 0;
        }
        return Math.floor(Math.random() * currentVerb.conjugations.length);
    }, [currentVerb, selectedForm]);
    
    const correctConjugation = currentVerb?.conjugations[correctIndex];
    
    const options = useMemo(() => {
        if (!correctConjugation || !currentVerb) return [];
        const wrongOptions = currentVerb.conjugations.filter((_, idx) => idx !== correctIndex).slice(0, 3);
        const allOptions = [correctConjugation, ...wrongOptions];
        return allOptions.sort(() => Math.random() - 0.5);
    }, [correctConjugation, currentVerb, correctIndex]);

    const progress = Math.round(((currentIndex + 1) / shuffledVerbs.length) * 100);

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        setShowAnswer(true);
        if (answer === correctConjugation?.result) {
            setScore({ ...score, correct: score.correct + 1, total: score.total + 1 });
        } else {
            setScore({ ...score, total: score.total + 1 });
        }
    };

    const moveToNext = () => {
        if (currentIndex < shuffledVerbs.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowAnswer(false);
            setSelectedAnswer(null);
        } else {
            setShowStats(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setShowAnswer(false);
        setScore({ correct: 0, total: 0 });
        setSelectedAnswer(null);
        setShowStats(false);
    };

    if (showStats) {
        return (
            <div className="w-full">
                <h3 className="text-2xl font-bold mb-6 text-pink-400">Quiz Complete! 🎉</h3>
                <div className="space-y-6 max-w-md">
                    <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-indigo-400 mb-2">{score.correct}/{score.total}</div>
                            <div className="text-slate-300 mb-4">Conjugations Correct</div>
                            <div className="text-2xl font-bold text-pink-400 mb-6">
                                {Math.round((score.correct / score.total) * 100)}%
                            </div>
                            <p className="text-sm text-slate-400 mb-6">
                                {score.correct === score.total
                                    ? 'Perfect score! Master of conjugations! 🌟'
                                    : score.correct >= score.total * 0.8
                                    ? 'Great job! Keep practicing! 💪'
                                    : 'Good effort! Review and try again! 📚'}
                            </p>
                            <button
                                onClick={handleRestart}
                                className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                            >
                                Start Over
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h3 className="text-2xl font-bold mb-2 text-pink-400">Verb Conjugation Practice</h3>
            <p className="text-sm text-slate-400 mb-4">Choose the correct conjugation form for the verb shown.</p>

            <div className="mb-6 pb-4 border-b border-purple-500/30">
                <p className="text-xs text-slate-400 mb-3">Select tense to practice:</p>
                <div className="flex flex-wrap gap-2">
                    {allForms.map((form) => (
                        <button
                            key={form}
                            onClick={() => setSelectedForm(form === 'Random' ? null : form)}
                            className={classNames(
                                'px-3 py-2 rounded text-sm font-semibold transition-colors',
                                selectedForm === (form === 'Random' ? null : form)
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            )}
                        >
                            {form}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">Progress</span>
                        <span className="text-sm text-pink-400 font-semibold">
                            {currentIndex + 1}/{shuffledVerbs.length}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg">
                    <div className="text-center mb-4">
                        <div className="text-sm text-slate-400 mb-2">Verb (Base Form)</div>
                        <div className="text-4xl font-bold text-pink-400 mb-2">{currentVerb?.base}</div>
                        <div className="text-sm text-indigo-300 mb-2">{currentVerb?.furigana}</div>
                        <div className="text-slate-300">{currentVerb?.meaning}</div>
                    </div>
                    
                    <div className="text-center mb-6 p-3 bg-indigo-900/30 rounded">
                        <div className="text-sm text-slate-400">Convert to:</div>
                        <div className="text-xl font-semibold text-indigo-300">{correctConjugation?.form}</div>
                    </div>
                </div>

                <div className="space-y-3">
                    {options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => !showAnswer && handleAnswer(option.result)}
                            disabled={showAnswer}
                            className={classNames(
                                'w-full p-4 rounded-lg font-semibold transition-all',
                                showAnswer
                                    ? option.result === correctConjugation?.result
                                        ? 'bg-green-600 text-white border-2 border-green-400'
                                        : selectedAnswer === option.result
                                        ? 'bg-red-600 text-white border-2 border-red-400'
                                        : 'bg-slate-700 text-slate-400'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-2 border-slate-600 hover:border-indigo-500'
                            )}
                        >
                            {option.result}
                        </button>
                    ))}
                </div>

                {showAnswer && (
                    <div className="text-center space-y-3">
                        <div className="text-sm text-slate-400">
                            Score: <span className="text-green-400 font-semibold">{score.correct}</span> / {score.total}
                        </div>
                        <button
                            onClick={moveToNext}
                            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                        >
                            Next Question
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function CommonPatternsExercise() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const categories = Object.keys(commonPatternsData);

    const currentPatterns = selectedCategory ? commonPatternsData[selectedCategory] : [];

    if (!selectedCategory) {
        return (
            <div className="w-full space-y-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2 text-blue-400">Common Sentence Patterns (常用句型)</h3>
                    <p className="text-sm text-slate-400 mb-6">Browse 50 essential Japanese sentence patterns organized by usage category. Perfect for organized review!</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className="p-4 bg-slate-800 hover:bg-slate-700 border border-blue-500/50 hover:border-blue-400 rounded-lg transition-all text-left"
                        >
                            <div className="font-semibold text-blue-400 text-sm">{category}</div>
                            <div className="text-xs text-slate-400 mt-1">{commonPatternsData[category].length} patterns</div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
            >
                ← Back to Categories
            </button>

            <h3 className="text-2xl font-bold text-blue-400">{selectedCategory}</h3>

            <div className="space-y-4">
                {currentPatterns.map((pattern) => {
                    const formality = formalityLabels[pattern.formality];
                    return (
                        <div key={pattern.number} className="p-4 bg-slate-800/50 border border-blue-500/30 rounded-lg">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full text-sm font-bold">
                                    {pattern.number}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-xl font-bold text-blue-400">{pattern.pattern}</div>
                                        <span className={`${formality.color} text-white text-xs px-2 py-0.5 rounded-full font-medium`}>
                                            {formality.en} / {formality.zh}
                                        </span>
                                    </div>
                                    <div className="text-slate-300 mb-3">{pattern.meaning}</div>
                                    <div className="bg-slate-900/50 p-3 rounded border border-slate-600 space-y-2">
                                        <div className="text-slate-100 font-semibold">{pattern.example}</div>
                                        <div className="text-sm text-slate-400">{pattern.exampleMeaning}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function PotentialFormExercise() {
    const [selectedType, setSelectedType] = useState<'5-dan' | '1-dan' | 'irregular' | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const filteredVerbs = useMemo(() => {
        return selectedType
            ? potentialFormData.filter(v => v.type === selectedType)
            : potentialFormData;
    }, [selectedType]);

    const currentVerb = filteredVerbs[currentIndex];
    const progress = Math.round(((currentIndex + 1) / filteredVerbs.length) * 100);

    const moveToNext = () => {
        if (currentIndex < filteredVerbs.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const moveToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedType(null);
    };

    if (!selectedType) {
        return (
            <div className="w-full space-y-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2 text-cyan-400">Potential Form Conjugation (可能形變化)</h3>
                    <p className="text-sm text-slate-400 mb-6">Master how different verb types change to express ability or possibility. Learn the rules for 5-dan, 1-dan, and irregular verbs.</p>
                </div>
                <div className="space-y-4 max-w-2xl">
                    <button
                        onClick={() => setSelectedType('5-dan')}
                        className="w-full p-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/50 text-white rounded-lg font-semibold transition-all text-left"
                    >
                        <div className="text-2xl mb-2">📘 5-Dan Verbs (五段動詞)</div>
                        <div className="text-sm text-blue-100">Rule: a-segment → e-segment + る (e.g., 書く→書ける、飲む→飲める)</div>
                    </button>
                    <button
                        onClick={() => setSelectedType('1-dan')}
                        className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 text-white rounded-lg font-semibold transition-all text-left"
                    >
                        <div className="text-2xl mb-2">📗 1-Dan Verbs (一段動詞)</div>
                        <div className="text-sm text-purple-100">Rule: remove る + られる (e.g., 食べる→食べられる、見る→見られる)</div>
                    </button>
                    <button
                        onClick={() => setSelectedType('irregular')}
                        className="w-full p-6 bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg hover:shadow-orange-500/50 text-white rounded-lg font-semibold transition-all text-left"
                    >
                        <div className="text-2xl mb-2">📙 Irregular Verbs (不規則動詞)</div>
                        <div className="text-sm text-orange-100">Special forms that must be memorized (e.g., する→できる、来る→来られる)</div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex gap-2 mb-4">
                <button
                    onClick={handleRestart}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                >
                    ← Back to Categories
                </button>
            </div>

            <h3 className="text-2xl font-bold mb-2 text-cyan-400">
                {selectedType === '5-dan' ? '5-Dan Verbs (五段動詞)' : selectedType === '1-dan' ? '1-Dan Verbs (一段動詞)' : 'Irregular Verbs (不規則動詞)'}
            </h3>
            <p className="text-sm text-slate-400">
                {selectedType === '5-dan' && 'Rule: Replace a-segment with e-segment and add る (e.g., ka→ke, mu→me, su→se)'}
                {selectedType === '1-dan' && 'Rule: Remove る and add られる to the stem'}
                {selectedType === 'irregular' && 'These verbs have unique forms that must be memorized'}
            </p>

            <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Progress</span>
                    <span className="text-sm text-cyan-400 font-semibold">
                        {currentIndex + 1}/{filteredVerbs.length}
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
                        <div className="text-xs text-slate-400 mb-2">Original Form</div>
                        <div className="text-3xl font-bold text-cyan-400">{currentVerb?.base}</div>
                        <div className="text-sm text-indigo-300 mt-2">{currentVerb?.furigana}</div>
                        <div className="text-xs text-slate-400 mt-2">{currentVerb?.meaning}</div>
                    </div>
                    <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                        <div className="text-xs text-slate-400 mb-2">Potential Form</div>
                        <div className="text-3xl font-bold text-green-400">{currentVerb?.potentialForm}</div>
                        <div className="text-sm text-green-300 mt-2">{currentVerb?.potentialFurigana}</div>
                        <div className="text-xs text-slate-400 mt-2">&quot;Can {currentVerb?.meaning}&quot;</div>
                    </div>
                </div>

                <div className="border-t border-slate-600 pt-4">
                    <div className="space-y-3">
                        <div className="p-3 bg-yellow-900/20 rounded border border-yellow-500/30">
                            <div className="text-sm font-semibold text-yellow-400 mb-2">📖 Conjugation Rule:</div>
                            <div className="text-slate-300">{currentVerb?.explanation}</div>
                        </div>

                        <div className="p-3 bg-blue-900/20 rounded border border-blue-500/30">
                            <div className="text-sm font-semibold text-blue-400 mb-2">💬 Example Sentence:</div>
                            <div className="text-lg font-semibold text-slate-100 mb-2">{currentVerb?.example}</div>
                            <div className="text-sm text-slate-400">{currentVerb?.exampleMeaning}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 justify-center">
                <button
                    onClick={moveToPrev}
                    disabled={currentIndex === 0}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-200 disabled:text-slate-500 rounded font-semibold transition-colors"
                >
                    ← Previous
                </button>
                <button
                    onClick={moveToNext}
                    disabled={currentIndex === filteredVerbs.length - 1}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded font-semibold transition-colors"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

function TeFormExerciseComponent() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showStats, setShowStats] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<'verb' | 'adjective' | 'noun' | null>(null);

    const filteredQuestions = useMemo(() => {
        return selectedCategory
            ? teFormExerciseData.filter(q => q.category === selectedCategory).sort(() => Math.random() - 0.5)
            : teFormExerciseData.sort(() => Math.random() - 0.5);
    }, [selectedCategory]);

    const currentQuestion = filteredQuestions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion?.correct;

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        setShowAnswer(true);
        if (answer === currentQuestion?.correct) {
            setScore({ ...score, correct: score.correct + 1, total: score.total + 1 });
        } else {
            setScore({ ...score, total: score.total + 1 });
        }
    };

    const moveToNext = () => {
        if (currentIndex < filteredQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowAnswer(false);
            setSelectedAnswer(null);
        } else {
            setShowStats(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setShowAnswer(false);
        setScore({ correct: 0, total: 0 });
        setSelectedAnswer(null);
        setShowStats(false);
        setSelectedCategory(null);
    };

    if (!selectedCategory) {
        return (
            <div className="w-full space-y-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2 text-pink-400">Te-Form Connecting (て形連接)</h3>
                    <p className="text-sm text-slate-400 mb-6">Master te-form for connecting clauses with verbs, adjectives, and nouns. Test your understanding of meaning and formation.</p>
                </div>
                <div className="space-y-4 max-w-2xl">
                    <button
                        onClick={() => setSelectedCategory('verb')}
                        className="w-full p-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/50 text-white rounded-lg font-semibold transition-all text-left"
                    >
                        <div className="text-2xl mb-2">🔄 Verbs (連結・因果)</div>
                        <div className="text-sm text-blue-100">Sequential actions & cause-effect (e.g., 食べて、書いて、降って)</div>
                    </button>
                    <button
                        onClick={() => setSelectedCategory('adjective')}
                        className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-pink-500/50 text-white rounded-lg font-semibold transition-all text-left"
                    >
                        <div className="text-2xl mb-2">✨ Adjectives (い・な-形容詞)</div>
                        <div className="text-sm text-pink-100">Connecting multiple descriptions (e.g., 新しくて、静かで、簡単で)</div>
                    </button>
                    <button
                        onClick={() => setSelectedCategory('noun')}
                        className="w-full p-6 bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg hover:shadow-orange-500/50 text-white rounded-lg font-semibold transition-all text-left"
                    >
                        <div className="text-2xl mb-2">📝 Nouns (名詞・で)</div>
                        <div className="text-sm text-orange-100">Noun predicate + te-form (e.g., 学生で、医者で、社員で)</div>
                    </button>
                </div>
            </div>
        );
    }

    if (showStats) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-6 text-pink-400">Quiz Complete! 🎉</h3>
                    <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg max-w-md mx-auto">
                        <div className="text-5xl font-bold text-indigo-400 mb-2">{score.correct}/{score.total}</div>
                        <div className="text-slate-300 mb-4">Te-Form Questions Correct</div>
                        <div className="text-2xl font-bold text-pink-400 mb-6">
                            {Math.round((score.correct / score.total) * 100)}%
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={handleRestart}
                                className="w-full px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <button
                    onClick={handleRestart}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold hover:bg-slate-600 transition-colors mb-4"
                >
                    ← Back to Categories
                </button>
                <div className="text-sm text-slate-400 mb-2">
                    Category: <span className="text-pink-400 font-semibold">
                        {selectedCategory === 'verb' ? 'Verbs' : selectedCategory === 'adjective' ? 'Adjectives' : 'Nouns'}
                    </span>
                </div>
                <div className="text-sm text-slate-400">Question {currentIndex + 1} of {filteredQuestions.length}</div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                        className="bg-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg space-y-6">
                <div className="space-y-2">
                    <div className="text-sm text-slate-400">Fill in the blank with the correct form:</div>
                    <div className="text-lg font-semibold text-slate-100 p-4 bg-slate-700/50 rounded border-l-4 border-pink-500">
                        {currentQuestion?.question}
                    </div>
                </div>

                <div className="space-y-3">
                    {currentQuestion?.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => !showAnswer && handleAnswer(option)}
                            disabled={showAnswer}
                            className={classNames(
                                'w-full p-4 rounded-lg font-semibold transition-all text-left',
                                showAnswer
                                    ? option === currentQuestion?.correct
                                        ? 'bg-green-600 text-white border-2 border-green-400'
                                        : selectedAnswer === option
                                        ? 'bg-red-600 text-white border-2 border-red-400'
                                        : 'bg-slate-700 text-slate-400'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-2 border-slate-600 hover:border-indigo-500'
                            )}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                {showAnswer && (
                    <div className="text-center space-y-3 border-t border-slate-600 pt-4">
                        <div className={classNames('text-sm font-semibold', isCorrect ? 'text-green-400' : 'text-red-400')}>
                            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                        </div>
                        <div className="text-sm text-slate-300 text-left bg-indigo-900/20 p-4 rounded border border-indigo-500/30">
                            <div className="font-semibold text-indigo-300 mb-2">Grammar Point: {currentQuestion?.grammarPoint}</div>
                            <div>{currentQuestion?.explanation}</div>
                        </div>
                        <div className="text-sm text-slate-400">
                            Score: <span className="text-green-400 font-semibold">{score.correct}</span> / {score.total}
                        </div>
                        <button
                            onClick={moveToNext}
                            className="w-full px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                        >
                            {currentIndex === filteredQuestions.length - 1 ? 'View Results' : 'Next Question'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function GrammarExerciseComponent() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showStats, setShowStats] = useState(false);

    const shuffledQuestions = useMemo(() => {
        return [...grammarExerciseData].sort(() => Math.random() - 0.5);
    }, []);

    const currentQuestion = shuffledQuestions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion?.correct;

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        setShowAnswer(true);
        if (answer === currentQuestion?.correct) {
            setScore({ ...score, correct: score.correct + 1, total: score.total + 1 });
        } else {
            setScore({ ...score, total: score.total + 1 });
        }
    };

    const moveToNext = () => {
        if (currentIndex < shuffledQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowAnswer(false);
            setSelectedAnswer(null);
        } else {
            setShowStats(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setShowAnswer(false);
        setScore({ correct: 0, total: 0 });
        setSelectedAnswer(null);
        setShowStats(false);
    };

    if (showStats) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-6 text-pink-400">Quiz Complete! 🎉</h3>
                    <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg max-w-md mx-auto">
                        <div className="text-5xl font-bold text-indigo-400 mb-2">{score.correct}/{score.total}</div>
                        <div className="text-slate-300 mb-4">Grammar Questions Correct</div>
                        <div className="text-2xl font-bold text-pink-400 mb-6">
                            {Math.round((score.correct / score.total) * 100)}%
                        </div>
                        <button
                            onClick={handleRestart}
                            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                        >
                            Start Over
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <div className="text-sm text-slate-400">Question {currentIndex + 1} of {shuffledQuestions.length}</div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                        className="bg-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${((currentIndex + 1) / shuffledQuestions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg space-y-6">
                <div className="space-y-2">
                    <div className="text-sm text-slate-400">Grammar Point</div>
                    <div className="text-lg font-semibold text-indigo-300">{currentQuestion?.grammarPoint}</div>
                </div>

                <div className="space-y-3">
                    <div className="text-lg text-slate-100">{currentQuestion?.question}</div>
                    <div className="text-sm text-indigo-300">Fill: {currentQuestion?.blank}</div>
                </div>

                <div className="space-y-3">
                    {currentQuestion?.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => !showAnswer && handleAnswer(option)}
                            disabled={showAnswer}
                            className={classNames(
                                'w-full p-4 rounded-lg font-semibold transition-all text-left',
                                showAnswer
                                    ? option === currentQuestion?.correct
                                        ? 'bg-green-600 text-white border-2 border-green-400'
                                        : selectedAnswer === option
                                        ? 'bg-red-600 text-white border-2 border-red-400'
                                        : 'bg-slate-700 text-slate-400'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-2 border-slate-600 hover:border-indigo-500'
                            )}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                {showAnswer && (
                    <div className="space-y-3 border-t border-slate-600 pt-4">
                        <div className={classNames('text-sm font-semibold', isCorrect ? 'text-green-400' : 'text-red-400')}>
                            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                        </div>
                        <div className="text-sm text-slate-300">{currentQuestion?.explanation}</div>
                        <div className="text-sm text-slate-400">
                            Score: <span className="text-green-400 font-semibold">{score.correct}</span> / {score.total}
                        </div>
                        <button
                            onClick={moveToNext}
                            className="w-full px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                        >
                            {currentIndex === shuffledQuestions.length - 1 ? 'View Results' : 'Next Question'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ExercisesSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
    const [showStats, setShowStats] = useState(false);
    const [activeTab, setActiveTab] = useState<'srs' | 'conjugation' | 'noun' | 'adjective' | 'grammar' | 'teform' | 'potential' | 'patterns'>('srs');
    const [useSRS, setUseSRS] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [googleSheetVocab, setGoogleSheetVocab] = useState<FlashcardItem[]>([]);
    const [loadingVocab, setLoadingVocab] = useState(true);
    const [vocabError, setVocabError] = useState<string | null>(null);

    // Fetch vocabulary from Google Sheets
    useEffect(() => {
        const fetchVocabulary = async () => {
            try {
                setLoadingVocab(true);
                setVocabError(null);
                const response = await fetch('/api/flashcards/google-sheet');
                if (!response.ok) {
                    throw new Error('Failed to fetch vocabulary from Google Sheets');
                }
                const data = await response.json();
                setGoogleSheetVocab(data);
            } catch (error) {
                console.error('Error fetching vocabulary:', error);
                // Fallback to hardcoded data if fetch fails
                setGoogleSheetVocab(vocabularyData);
                setVocabError(error instanceof Error ? error.message : 'Failed to fetch vocabulary');
            } finally {
                setLoadingVocab(false);
            }
        };

        fetchVocabulary();
    }, []);

    useEffect(() => {
        const checkLoginStatus = () => {
            const status = isLoggedIn();
            setLoggedIn(status);
            if (status) {
                updateStudyStreak();
            }
        };
        
        checkLoginStatus();
        
        const handleStorageChange = () => {
            checkLoginStatus();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        const interval = setInterval(checkLoginStatus, 1000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const shuffledVocab = useMemo(() => {
        const vocabToUse = googleSheetVocab.length > 0 ? googleSheetVocab : vocabularyData;
        if (useSRS && loggedIn) {
            return getPrioritizedVocab(vocabToUse) as typeof vocabToUse;
        }
        return [...vocabToUse].sort(() => Math.random() - 0.5);
    }, [useSRS, loggedIn, googleSheetVocab]);

    const currentCard = shuffledVocab[currentIndex];
    const progress = Math.round(((currentIndex + 1) / shuffledVocab.length) * 100);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleMastered = () => {
        const newCorrect = score.correct + 1;
        const newTotal = score.total + 1;
        
        setMasteredCards(new Set([...masteredCards, currentIndex]));
        setScore({ correct: newCorrect, total: newTotal });
        
        if (loggedIn && currentCard) {
            updateVocabProgress(currentCard.kanji, true);
        }
        
        if (currentIndex < shuffledVocab.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            if (loggedIn) {
                addQuizScore('Vocabulary Flashcards', newCorrect, newTotal);
            }
            setShowStats(true);
        }
    };

    const handleSkip = () => {
        const newTotal = score.total + 1;
        
        setScore({ ...score, total: newTotal });
        
        if (loggedIn && currentCard) {
            updateVocabProgress(currentCard.kanji, false);
        }
        
        if (currentIndex < shuffledVocab.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            if (loggedIn) {
                addQuizScore('Vocabulary Flashcards', score.correct, newTotal);
            }
            setShowStats(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setScore({ correct: 0, total: 0 });
        setMasteredCards(new Set());
        setShowStats(false);
    };

    if (activeTab === 'srs') {
        return (
            <div className="w-full">
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setActiveTab('srs')}
                        className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                    >
                        💭 Personal SRS
                    </button>
                    <button
                        onClick={() => setActiveTab('conjugation')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔄 Verb Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('noun')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📝 Noun Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('adjective')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✨ Adjective Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('teform')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔗 Te-Form
                    </button>
                    <button
                        onClick={() => setActiveTab("potential")}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💪 Potential Form
                    </button>
                    <button
                        onClick={() => setActiveTab('patterns')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📋 Common Patterns
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✏️ Grammar
                    </button>
                </div>
                <PersonalSRS />
            </div>
        );
    }

    if (activeTab === 'patterns') {
        return (
            <div className="w-full">
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setActiveTab('srs')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💭 Personal SRS
                    </button>
                    <button
                        onClick={() => setActiveTab('conjugation')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔄 Verb Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('noun')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📝 Noun Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('adjective')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✨ Adjective Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('teform')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔗 Te-Form
                    </button>
                    <button
                        onClick={() => setActiveTab("potential")}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💪 Potential Form
                    </button>
                    <button
                        onClick={() => setActiveTab('patterns')}
                        className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                    >
                        📋 Common Patterns
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✏️ Grammar
                    </button>
                </div>
                <CommonPatternsExercise />
            </div>
        );
    }

    if (activeTab === 'potential') {
        return (
            <div className="w-full">
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setActiveTab('srs')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💭 Personal SRS
                    </button>
                    <button
                        onClick={() => setActiveTab('conjugation')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔄 Verb Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('noun')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📝 Noun Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('adjective')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✨ Adjective Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('teform')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔗 Te-Form
                    </button>
                    <button
                        onClick={() => setActiveTab("potential")}
                        className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                    >
                        💪 Potential Form
                    </button>
                    <button
                        onClick={() => setActiveTab('patterns')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📋 Common Patterns
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✏️ Grammar
                    </button>
                </div>
                <PotentialFormExercise />
            </div>
        );
    }

    if (activeTab === 'teform') {
        return (
            <div className="w-full">
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setActiveTab('srs')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💭 Personal SRS
                    </button>
                    <button
                        onClick={() => setActiveTab('conjugation')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔄 Verb Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('noun')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📝 Noun Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('adjective')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✨ Adjective Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('teform')}
                        className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                    >
                        🔗 Te-Form
                    </button>
                    <button
                        onClick={() => setActiveTab("potential")}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💪 Potential Form
                    </button>
                    <button
                        onClick={() => setActiveTab('patterns')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📋 Common Patterns
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✏️ Grammar
                    </button>
                </div>
                <TeFormExerciseComponent />
            </div>
        );
    }

    if (activeTab === 'grammar') {
        return (
            <div className="w-full">
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setActiveTab('srs')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💭 Personal SRS
                    </button>
                    <button
                        onClick={() => setActiveTab('conjugation')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔄 Verb Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('noun')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📝 Noun Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('adjective')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✨ Adjective Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('teform')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔗 Te-Form
                    </button>
                    <button
                        onClick={() => setActiveTab("potential")}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💪 Potential Form
                    </button>
                    <button
                        onClick={() => setActiveTab('patterns')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📋 Common Patterns
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                    >
                        ✏️ Grammar
                    </button>
                </div>
                <GrammarExerciseComponent />
            </div>
        );
    }

    if (activeTab === 'adjective') {
        return (
            <div className="w-full">
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setActiveTab('srs')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💭 Personal SRS
                    </button>
                    <button
                        onClick={() => setActiveTab('conjugation')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔄 Verb Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('noun')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📝 Noun Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('adjective')}
                        className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                    >
                        ✨ Adjective Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('teform')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔗 Te-Form
                    </button>
                    <button
                        onClick={() => setActiveTab("potential")}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💪 Potential Form
                    </button>
                    <button
                        onClick={() => setActiveTab('patterns')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📋 Common Patterns
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✏️ Grammar
                    </button>
                </div>
                <AdjectiveConjugationQuiz />
            </div>
        );
    }

    if (activeTab === 'noun') {
        return (
            <div className="w-full">
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setActiveTab('srs')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💭 Personal SRS
                    </button>
                    <button
                        onClick={() => setActiveTab('conjugation')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔄 Verb Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('noun')}
                        className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                    >
                        📝 Noun Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('adjective')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✨ Adjective Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('teform')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔗 Te-Form
                    </button>
                    <button
                        onClick={() => setActiveTab("potential")}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💪 Potential Form
                    </button>
                    <button
                        onClick={() => setActiveTab('patterns')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📋 Common Patterns
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✏️ Grammar
                    </button>
                </div>
                <NounConjugationQuiz />
            </div>
        );
    }

    if (activeTab === 'conjugation') {
        return (
            <div className="w-full">
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setActiveTab('srs')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💭 Personal SRS
                    </button>
                    <button
                        onClick={() => setActiveTab('conjugation')}
                        className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                    >
                        🔄 Verb Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('noun')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📝 Noun Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('adjective')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✨ Adjective Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('teform')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔗 Te-Form
                    </button>
                    <button
                        onClick={() => setActiveTab("potential")}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💪 Potential Form
                    </button>
                    <button
                        onClick={() => setActiveTab('patterns')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📋 Common Patterns
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✏️ Grammar
                    </button>
                </div>
                <VerbConjugationQuiz />
            </div>
        );
    }

    if (showStats) {
        return (
            <div className="w-full">
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setActiveTab('srs')}
                        className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                    >
                        💭 Personal SRS
                    </button>
                    <button
                        onClick={() => setActiveTab('conjugation')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔄 Verb Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('noun')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📝 Noun Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('adjective')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✨ Adjective Conjugation
                    </button>
                    <button
                        onClick={() => setActiveTab('teform')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        🔗 Te-Form
                    </button>
                    <button
                        onClick={() => setActiveTab("potential")}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💪 Potential Form
                    </button>
                    <button
                        onClick={() => setActiveTab('patterns')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        📋 Common Patterns
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        ✏️ Grammar
                    </button>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-pink-400">Quiz Complete! 🎉</h3>
                <div className="space-y-6 max-w-md">
                    <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-indigo-400 mb-2">{score.correct}/{score.total}</div>
                            <div className="text-slate-300 mb-4">Cards Mastered</div>
                            <div className="text-2xl font-bold text-pink-400 mb-6">
                                {Math.round((score.correct / score.total) * 100)}%
                            </div>
                            <p className="text-sm text-slate-400 mb-6">
                                {score.correct === score.total
                                    ? 'Perfect score! Excellent work! 🌟'
                                    : score.correct >= score.total * 0.8
                                    ? 'Great job! Keep practicing! 💪'
                                    : 'Good effort! Review and try again! 📚'}
                            </p>
                            <button
                                onClick={handleRestart}
                                className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-semibold transition-colors"
                            >
                                Start Over
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex gap-2 mb-6 flex-wrap">
                <button
                    onClick={() => setActiveTab('srs')}
                    className="px-4 py-2 bg-pink-500 text-white rounded font-semibold transition-colors"
                >
                    💭 Personal SRS
                </button>
                <button
                    onClick={() => setActiveTab('conjugation')}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                >
                    🔄 Verb Conjugation
                </button>
                <button
                    onClick={() => setActiveTab('noun')}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                >
                    📝 Noun Conjugation
                </button>
                <button
                    onClick={() => setActiveTab('adjective')}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                >
                    ✨ Adjective Conjugation
                </button>
                <button
                    onClick={() => setActiveTab('teform')}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                >
                    🔗 Te-Form
                    </button>
                    <button
                        onClick={() => setActiveTab("potential")}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                    >
                        💪 Potential Form
                </button>
                <button
                    onClick={() => setActiveTab('patterns')}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                >
                    📋 Common Patterns
                </button>
                <button
                    onClick={() => setActiveTab('grammar')}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded font-semibold transition-colors hover:bg-slate-600"
                >
                    ✏️ Grammar
                </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-pink-400">Vocabulary Flashcard Quiz</h3>
                    <p className="text-sm text-slate-400">Test yourself on N5 vocabulary. Click cards to flip and reveal answers.</p>
                </div>
                {loggedIn && (
                    <button
                        onClick={() => {
                            setUseSRS(!useSRS);
                            handleRestart();
                        }}
                        className={classNames(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                            useSRS
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                : 'bg-slate-700 text-slate-400 border border-slate-600'
                        )}
                    >
                        <span>{useSRS ? '🧠' : '🔀'}</span>
                        {useSRS ? 'SRS Mode' : 'Random'}
                    </button>
                )}
            </div>

            {loggedIn && useSRS && (
                <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30 mb-4">
                    <p className="text-xs text-purple-300">
                        🧠 <span className="font-semibold">Spaced Repetition Active:</span> Words you struggle with appear first. Your progress is being tracked.
                    </p>
                </div>
            )}

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">Progress</span>
                        <span className="text-sm text-pink-400 font-semibold">
                            {currentIndex + 1}/{shuffledVocab.length}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <Flashcard item={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />

                <div className="text-center">
                    <div className="text-sm text-slate-400">
                        Mastered: <span className="text-green-400 font-semibold">{score.correct}</span> / {score.total}
                    </div>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={handleSkip}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-semibold transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleMastered}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors"
                    >
                        Mastered ✓
                    </button>
                </div>

                <div className="text-xs text-center text-slate-500">
                    💡 Click the card to reveal hiragana and meaning
                </div>
            </div>
        </div>
    );
}

import classNames from 'classnames';
import { useState } from 'react';

const youtubeChannels = [
    {
        title: 'selfcare_maeda',
        description: 'Physical therapy and self-care techniques explained for relaxation and health improvement.',
        category: 'Health & Wellness',
        url: 'https://www.youtube.com/@selfcare_maeda',
        icon: '🧘'
    },
    {
        title: 'JSI55',
        description: 'Educational content focusing on practical skills and specialized knowledge.',
        category: 'Education',
        url: 'https://www.youtube.com/@JSI55',
        icon: '🎓'
    },
    {
        title: 'tagoken2956',
        description: 'Insightful videos on specific interests and detailed explanations.',
        category: 'General Interest',
        url: 'https://www.youtube.com/@tagoken2956',
        icon: '📺'
    },
    {
        title: 'japanese_tanakasan',
        description: 'Casual and fun Japanese language learning with Tanaka-san.',
        category: 'Language',
        url: 'https://www.youtube.com/@japanese_tanakasan',
        icon: '👨‍🏫'
    },
    {
        title: 'uta-cha-oh',
        description: 'Creative content and entertaining videos for viewers.',
        category: 'Entertainment',
        url: 'https://www.youtube.com/@uta-cha-oh',
        icon: '🎵'
    },
    {
        title: 'Nihongomari-ym6is',
        description: 'Focused Japanese language lessons and cultural insights.',
        category: 'Language',
        url: 'https://www.youtube.com/@Nihongomari-ym6is',
        icon: '📚'
    },
    {
        title: 'YosukeTeachesJapanese',
        description: 'Structured Japanese lessons with a focus on natural speaking and grammar.',
        category: 'Language',
        url: 'https://www.youtube.com/@YosukeTeachesJapanese',
        icon: '✏️'
    }
];

export default function ReferencesSection() {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    return (
        <div className="w-full">
            <h3 className="text-2xl font-bold mb-6 text-pink-400">YouTube Learning Resources</h3>
            <div className="space-y-4">
                {youtubeChannels.map((channel, idx) => (
                    <div
                        key={idx}
                        className="border border-purple-500/30 rounded-lg overflow-hidden hover:border-pink-500/50 transition-colors"
                    >
                        <button
                            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                            className="w-full p-4 bg-slate-800/50 hover:bg-slate-800/70 transition-colors text-left"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-2xl">{channel.icon}</span>
                                        <h4 className="text-lg font-bold text-indigo-400">{channel.title}</h4>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-2">{channel.description}</p>
                                    <span className="inline-block text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                                        {channel.category}
                                    </span>
                                </div>
                                <span className={classNames('text-pink-400 text-xl transition-transform ml-4 flex-shrink-0', {
                                    'rotate-180': expandedIdx === idx,
                                })}>
                                    ▼
                                </span>
                            </div>
                        </button>
                        {expandedIdx === idx && (
                            <div className="p-4 bg-slate-900/30 border-t border-purple-500/20">
                                <a
                                    href={channel.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                                >
                                    Visit Channel
                                    <span>→</span>
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

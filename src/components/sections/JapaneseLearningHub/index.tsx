import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';
import Section from '../Section';
import VocabSection from './VocabSection';
import GrammarSection from './GrammarSection';
import GoogleSheetFlashcards from './GoogleSheetFlashcards';
import ExercisesSection from './ExercisesSection';
import DictionarySearch from './DictionarySearch';
import ReferencesSection from './ReferencesSection';
import TypeJapaneseInputSection from './TypeJapaneseInputSection';
import LoginModal from './LoginModal';
import { isLoggedIn, getProgress } from '@/utils/progressTracking';

type TabType = 'grammar' | 'flashcards' | 'exercises' | 'dictionary' | 'references' | 'vocab';

export default function JapaneseLearningHub(props) {
    const { elementId, colors, styles = {}, title, subtitle } = props;
    const [activeTab, setActiveTab] = useState<TabType>('grammar');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        setLoggedIn(isLoggedIn());
    }, []);

    const handleLoginSuccess = (status?: boolean) => {
        if (status !== undefined) {
            setLoggedIn(status);
        } else {
            setLoggedIn(isLoggedIn());
        }
    };

    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: 'grammar', label: 'Grammar', icon: '✏️' },
        { id: 'flashcards', label: 'Flashcards', icon: '🎴' },
        { id: 'exercises', label: 'Exercises', icon: '📝' },
        { id: 'dictionary', label: 'Dictionary', icon: '🔍' },
        { id: 'references', label: 'Resources', icon: '🎬' },
    ];

    return (
        <Section elementId={elementId} colors={colors} styles={styles.self}>
            <div className="w-full max-w-4xl mx-auto">
                {/* Header with Login Button */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                        {title && <h2 className="text-4xl sm:text-5xl mb-2">{title}</h2>}
                        {subtitle && <p className="text-xl sm:text-2xl text-slate-300">{subtitle}</p>}
                    </div>
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className={classNames(
                            'px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2',
                            loggedIn
                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-purple-500/20'
                        )}
                    >
                        <span>{loggedIn ? '✓' : '👤'}</span>
                        {loggedIn ? getProgress().username : 'Login'}
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-purple-500/30 pb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={classNames(
                                'px-4 py-2 rounded-lg font-semibold transition-all duration-300',
                                'flex items-center gap-2',
                                activeTab === tab.id
                                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-purple-500/20'
                            )}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'grammar' && <GrammarSection />}
                    {activeTab === 'flashcards' && <GoogleSheetFlashcards />}
                    {activeTab === 'exercises' && <ExercisesSection key={loggedIn ? 'logged-in' : 'logged-out'} />}
                    {activeTab === 'dictionary' && <DictionarySearch />}
                    {activeTab === 'references' && <ReferencesSection />}
                </div>

                {/* Login Modal */}
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={handleLoginSuccess}
                    language="en"
                />
            </div>
        </Section>
    );
}

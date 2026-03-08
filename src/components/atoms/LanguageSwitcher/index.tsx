import { useRouter } from 'next/router';
import classNames from 'classnames';
import Link from '../Link';

export default function LanguageSwitcher({ className = '' }) {
    const router = useRouter();
    const currentPath = router.asPath;
    
    // Detect current language from URL path
    const isZh = currentPath.startsWith('/zh');
    const currentLang = isZh ? 'zh' : 'en';
    
    // Generate the opposite language URL
    const getLanguageUrl = () => {
        if (isZh) {
            // Remove /zh prefix to get English version
            return currentPath.replace('/zh', '') || '/';
        } else {
            // Add /zh prefix to get Chinese version
            return `/zh${currentPath}`;
        }
    };
    
    const languageUrl = getLanguageUrl();
    const targetLang = isZh ? 'EN' : '中';
    
    return (
        <Link 
            href={languageUrl}
            className={classNames(
                'inline-flex items-center justify-center gap-1.5',
                'text-center text-sm font-medium uppercase tracking-wider',
                'px-3 py-2 rounded-md',
                'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600',
                'text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700',
                'shadow-md shadow-purple-500/40 hover:shadow-lg hover:shadow-purple-600/50',
                'transition-all duration-300',
                'border border-white/20',
                className
            )}
            aria-label={`Switch to ${isZh ? 'English' : 'Chinese'}`}
        >
            <span className="text-sm">🌐</span>
            <span>{targetLang}</span>
        </Link>
    );
}

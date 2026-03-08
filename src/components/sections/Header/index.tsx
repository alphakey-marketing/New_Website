import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Link, Social } from '@/components/atoms';
import LanguageSwitcher from '@/components/atoms/LanguageSwitcher';
import ImageBlock from '@/components/molecules/ImageBlock';
import CloseIcon from '@/components/svgs/close';
import MenuIcon from '@/components/svgs/menu';
import HeaderLink from './HeaderLink';

export default function Header(props) {
    const { isSticky, styles = {}, primaryLinks = [], title, ...rest } = props;
    const headerWidth = styles.self?.width ?? 'narrow';
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    const isZh = router.asPath?.startsWith('/zh') ?? false;
    
    const translations = {
        'About': { en: 'About', zh: '簡介' },
        'Projects': { en: 'Projects', zh: '過往項目' },
        'Blog': { en: 'Blog', zh: '網誌' },
        'Contact': { en: 'Contact', zh: '聯絡我們' },
        'Personal': { en: 'Personal', zh: '個人專區' },
        'Japanese Learning': { en: 'Japanese Learning', zh: '日語學習' }
    };
    
    const translateLabel = (label) => {
        const translation = translations[label];
        return translation ? (isZh ? translation.zh : translation.en) : label;
    };
    
    const translateUrl = (url) => {
        if (isZh && !url.startsWith('/zh') && url.startsWith('/')) {
            return `/zh${url}`;
        }
        return url;
    };
    
    const translatedLinks = isMounted ? primaryLinks.map(link => ({
        ...link,
        label: translateLabel(link.label),
        url: translateUrl(link.url)
    })) : primaryLinks;
    
    const translatedTitle = isMounted ? translateLabel(title) : title;
    
    return (
        <header className={classNames(isSticky ? 'sticky top-0 z-10' : 'relative', 'border-b border-current')}>
            <div
                className={classNames({
                    'max-w-7xl mx-auto xl:border-x xl:border-current': headerWidth === 'narrow',
                    'max-w-8xl mx-auto 2xl:border-x 2xl:border-current': headerWidth === 'wide',
                    'w-full': headerWidth === 'full'
                })}
            >
                <Link href="#main" className="sr-only">
                    Skip to main content
                </Link>
                <HeaderVariants {...rest} title={translatedTitle} primaryLinks={translatedLinks} isZh={isZh} />
            </div>
        </header>
    );
}

function HeaderVariants(props) {
    const { headerVariant = 'variant-a', isZh, ...rest } = props;
    switch (headerVariant) {
        case 'variant-b':
            return <HeaderVariantB {...rest} isZh={isZh} />;
        case 'variant-c':
            return <HeaderVariantC {...rest} isZh={isZh} />;
        default:
            return <HeaderVariantA {...rest} isZh={isZh} />;
    }
}

function HeaderVariantA(props) {
    const { primaryLinks = [], socialLinks = [], isZh, ...logoProps } = props;
    return (
        <div className="relative flex items-stretch">
            <SiteLogoLink {...logoProps} isZh={isZh} />
            {primaryLinks.length > 0 && (
                <ul className="hidden border-r border-current divide-x divide-current lg:flex">
                    <ListOfLinks links={primaryLinks} inMobileMenu={false} />
                </ul>
            )}
            {socialLinks.length > 0 && (
                <ul className="hidden ml-auto border-l border-current lg:flex">
                    <ListOfSocialLinks links={socialLinks} inMobileMenu={false} />
                </ul>
            )}
            {(primaryLinks.length > 0 || socialLinks.length > 0) && <MobileMenu {...props} />}
        </div>
    );
}

function HeaderVariantB(props) {
    const { primaryLinks = [], socialLinks = [], isZh, ...logoProps } = props;
    return (
        <div className="relative flex items-stretch">
            <SiteLogoLink {...logoProps} isZh={isZh} />
            {primaryLinks.length > 0 && (
                <ul className="hidden ml-auto border-l border-current divide-x divide-current lg:flex">
                    <ListOfLinks links={primaryLinks} inMobileMenu={false} />
                </ul>
            )}
            {socialLinks.length > 0 && (
                <ul
                    className={classNames('hidden border-l border-current lg:flex', {
                        'ml-auto': primaryLinks.length === 0
                    })}
                >
                    <ListOfSocialLinks links={socialLinks} inMobileMenu={false} />
                </ul>
            )}
            {(primaryLinks.length > 0 || socialLinks.length > 0) && <MobileMenu {...props} />}
        </div>
    );
}

function HeaderVariantC(props) {
    const { primaryLinks = [], socialLinks = [], isZh, ...logoProps } = props;
    return (
        <div className="relative flex items-stretch">
            <SiteLogoLink {...logoProps} isZh={isZh} />
            {socialLinks.length > 0 && (
                <ul className="hidden ml-auto border-l border-current lg:flex">
                    <ListOfSocialLinks links={socialLinks} inMobileMenu={false} />
                </ul>
            )}
            {primaryLinks.length > 0 && (
                <ul
                    className={classNames('hidden border-l border-current divide-x divide-current lg:flex', {
                        'ml-auto': socialLinks.length === 0
                    })}
                >
                    <ListOfLinks links={primaryLinks} inMobileMenu={false} />
                </ul>
            )}
            <div className="hidden lg:flex items-center border-l border-current px-4">
                <LanguageSwitcher />
            </div>
            {(primaryLinks.length > 0 || socialLinks.length > 0) && <MobileMenu {...props} />}
        </div>
    );
}

function MobileMenu(props) {
    const { primaryLinks = [], socialLinks = [], isZh, ...logoProps } = props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = () => {
            setIsMenuOpen(false);
        };
        router.events.on('routeChangeStart', handleRouteChange);

        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
        };
    }, [router.events]);

    return (
        <div className="ml-auto lg:hidden">
            <button
                aria-label="Open Menu"
                className="h-10 min-h-full p-4 text-lg border-l border-current focus:outline-hidden"
                onClick={() => setIsMenuOpen(true)}
            >
                <MenuIcon className="fill-current w-icon h-icon" />
            </button>
            <div className={classNames('fixed inset-0 z-20 overflow-y-auto bg-main', isMenuOpen ? 'block' : 'hidden')}>
                <div className="flex flex-col min-h-full">
                    <div className="flex items-stretch justify-between border-b border-current">
                        <SiteLogoLink {...logoProps} isZh={isZh} />
                        <div className="border-l border-current">
                            <button
                                aria-label="Close Menu"
                                className="h-10 min-h-full p-4 text-lg focus:outline-hidden"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <CloseIcon className="fill-current w-icon h-icon" />
                            </button>
                        </div>
                    </div>
                    {(primaryLinks.length > 0 || socialLinks.length > 0) && (
                        <div className="flex flex-col items-center justify-center px-4 py-20 space-y-12 grow">
                            {primaryLinks.length > 0 && (
                                <ul className="space-y-6">
                                    <ListOfLinks links={primaryLinks} inMobileMenu={true} />
                                </ul>
                            )}
                            {socialLinks.length > 0 && (
                                <ul className="flex flex-wrap justify-center border border-current divide-x divide-current">
                                    <ListOfSocialLinks links={socialLinks} inMobileMenu={true} />
                                </ul>
                            )}
                            <div className="pt-4">
                                <LanguageSwitcher className="text-lg px-6 py-3" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SiteLogoLink({ title, isTitleVisible, logo, isZh }) {
    const homeUrl = isZh ? '/zh' : '/';
    
    if (!(logo || (title && isTitleVisible))) {
        return null;
    }
    return (
        <div className="flex items-center border-r border-current">
            <Link href={homeUrl} className="flex items-center h-full gap-2 p-4 link-fill">
                {logo && <ImageBlock {...logo} className="max-h-12" />}
                {title && isTitleVisible && <span className="text-base tracking-widest uppercase">{title}</span>}
            </Link>
        </div>
    );
}

function ListOfLinks({ links, inMobileMenu }) {
    return links.map((link, index) => (
        <li key={index} className={classNames(inMobileMenu ? 'text-center w-full' : 'inline-flex items-stretch')}>
            <HeaderLink
                {...link}
                className={classNames(inMobileMenu ? 'text-xl bottom-shadow-1 hover:bottom-shadow-5' : 'p-4 link-fill')}
            />
        </li>
    ));
}

function ListOfSocialLinks({ links, inMobileMenu = false }) {
    return links.map((link, index) => (
        <li key={index} className="inline-flex items-stretch">
            <Social {...link} className={classNames('text-lg link-fill', inMobileMenu ? 'p-5' : 'p-4')} />
        </li>
    ));
}

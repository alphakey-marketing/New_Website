import { generateGlobalCssVariables } from '@/utils/theme-style-utils';
import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import TaipoPoppup from '@/components/sections/TaipoPoppup';
import '../css/main.css';

import type { ThemeStyle } from '@/types';

interface GlobalPageProps {
  global?: {
    theme?: ThemeStyle;
  };
  colors?: string;
}

export default function MyApp({ Component, pageProps }: AppProps<GlobalPageProps>) {
    const { global, ...page } = pageProps;
    const { theme } = global || {};
    const [isMounted, setIsMounted] = useState(false);

    const cssVars = theme ? generateGlobalCssVariables(theme) : '';

    useEffect(() => {
        setIsMounted(true);
        document.body.setAttribute('data-theme', page.colors || 'colors-a');
    }, [page.colors]);

    return (
        <>
            <style jsx global>{`
                :root {
                    ${cssVars}
                }
            `}</style>
            {isMounted ? <Component {...pageProps} /> : null}
            {isMounted ? <TaipoPoppup /> : null}
        </>
    );
}

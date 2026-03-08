import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import { useEffect, useState, useRef } from 'react';

import { AnnotatedField } from '@/components/Annotated';
import { Action } from '@/components/atoms';
import { DynamicComponent } from '@/components/components-registry';
import { HeroSection } from '@/types';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';
import Section from '../Section';

/*
 This is the only component in this codebase which has a few Stackbit annotations for specific primitive
 field. These are added by the <AnnotatedField> helper.
 The motivation for these annotations: allowing the content editor to edit styles at the field level.
 */
export default function Component(props: HeroSection) {
    const { elementId, colors, backgroundSize, title, subtitle, text, media, actions = [], styles = {} } = props;
    const sectionFlexDirection = styles.self?.flexDirection ?? 'row';
    const sectionAlign = styles.self?.textAlign ?? 'left';
    
    const [typedText, setTypedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true);
    
    // Convert subtitle to lines for typing effect
    const textLines = subtitle ? subtitle.split('\n').filter(line => line.trim()) : [];
    
    useEffect(() => {
        mountedRef.current = true;
        
        // Check for reduced motion preference on client side
        if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            setPrefersReducedMotion(mediaQuery.matches);
        }
        
        return () => {
            mountedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    
    useEffect(() => {
        if (!subtitle || prefersReducedMotion) {
            setTypedText(subtitle || '');
            return;
        }
        
        const lines = subtitle ? subtitle.split('\n').filter(line => line.trim()) : [];
        
        // Reset state
        setTypedText('');
        setIsTyping(true);
        
        let lineIndex = 0;
        let charIndex = 0;
        let currentText = '';
        
        function typeLine() {
            if (!mountedRef.current || lineIndex >= lines.length) {
                if (mountedRef.current) setIsTyping(false);
                return;
            }
            
            if (charIndex < lines[lineIndex].length) {
                currentText += lines[lineIndex].charAt(charIndex);
                if (mountedRef.current) setTypedText(currentText);
                charIndex++;
                timeoutRef.current = setTimeout(typeLine, 50);
            } else {
                currentText += '\n\n';
                if (mountedRef.current) setTypedText(currentText);
                lineIndex++;
                charIndex = 0;
                timeoutRef.current = setTimeout(typeLine, 700);
            }
        }
        
        // Start typing effect
        typeLine();
        
        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [subtitle, prefersReducedMotion]);
    return (
        <Section elementId={elementId} colors={colors} backgroundSize={backgroundSize} styles={styles.self}>
            <div className={classNames('flex gap-8', mapFlexDirectionStyles(sectionFlexDirection))}>
                <div className={classNames('flex-1 w-full', mapStyles({ textAlign: sectionAlign }))}>
                    {title && (
                        <AnnotatedField path=".title">
                            <h1 className="text-5xl sm:text-6xl">{title}</h1>
                        </AnnotatedField>
                    )}
                    {subtitle && (
                        <AnnotatedField path=".subtitle">
                            <div 
                                id="typingEffect"
                                className={classNames('text-xl sm:text-2xl whitespace-pre-line', { 'mt-4': title })}
                                aria-live={isTyping ? "polite" : undefined}
                                aria-label={prefersReducedMotion ? undefined : "Text being typed"}
                            >
                                {typedText || subtitle}
                            </div>
                        </AnnotatedField>
                    )}
                    {text && (
                        <AnnotatedField path=".text">
                            <Markdown
                                options={{ forceBlock: true, forceWrapper: true }}
                                className={classNames('max-w-none prose sm:prose-lg', {
                                    'mt-6': title || subtitle
                                })}
                            >
                                {text}
                            </Markdown>
                        </AnnotatedField>
                    )}
                    {actions?.length > 0 && (
                        <div
                            className={classNames('flex flex-wrap items-center gap-4', {
                                'mt-8': title || subtitle || text,
                                'justify-center': sectionAlign === 'center',
                                'justify-end': sectionAlign === 'right'
                            })}
                        >
                            {actions.map((action, index) => (
                                <Action key={index} {...action} />
                            ))}
                        </div>
                    )}
                </div>
                {media && (
                    <div
                        className={classNames('flex flex-1 w-full', {
                            'justify-center': sectionAlign === 'center',
                            'justify-end': sectionAlign === 'right'
                        })}
                    >
                        <HeroMedia media={media} />
                    </div>
                )}
            </div>
        </Section>
    );
}

function HeroMedia({ media }) {
    return <DynamicComponent {...media} />;
}

function mapFlexDirectionStyles(flexDirection?: 'row' | 'row-reverse' | 'col' | 'col-reverse') {
    switch (flexDirection) {
        case 'row-reverse':
            return 'flex-col-reverse lg:flex-row-reverse lg:items-center';
        case 'col':
            return 'flex-col';
        case 'col-reverse':
            return 'flex-col-reverse';
        default:
            return 'flex-col lg:flex-row lg:items-center';
    }
}

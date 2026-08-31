import classNames from 'classnames';

import { Annotated } from '@/components/Annotated';
import { iconMap } from '@/components/svgs';
import Link from '../Link';

export default function Action(props) {
    const {
        type,
        elementId,
        className,
        label,
        altText,
        url,
        showIcon,
        icon,
        iconPosition = 'right',
        style = 'primary'
    } = props;
    const IconComponent = icon ? iconMap[icon] : null;

    const baseClasses = [
        'relative inline-flex items-center justify-center gap-1.5 text-center text-lg leading-tight no-underline transition-all duration-300 lg:whitespace-nowrap'
    ];
    if (type === 'Button') {
        label ? baseClasses.push('py-4 px-5') : baseClasses.push('p-4');
        if (style === 'secondary') {
            baseClasses.push('rounded-full');
        }
        baseClasses.push('text-white border-2 border-transparent shadow-lg hover:-translate-y-1 hover:shadow-xl');
    } else {
        baseClasses.push('uppercase text-white hover:text-purple-300 border-b-2 border-transparent hover:border-purple-400');
    }

    return (
        <Annotated content={props}>
            <Link
                href={url}
                aria-label={altText}
                id={elementId || null}
                className={classNames(baseClasses, className)}
                style={
                    type === 'Button'
                        ? {
                              backgroundColor: 'var(--theme-secondary)',
                              color: 'var(--theme-on-secondary)'
                          }
                        : undefined
                }
                onMouseEnter={(e) => {
                    if (type === 'Button') e.currentTarget.style.backgroundColor = 'var(--theme-primary)';
                }}
                onMouseLeave={(e) => {
                    if (type === 'Button') e.currentTarget.style.backgroundColor = 'var(--theme-secondary)';
                }}
            >
                {showIcon && IconComponent && iconPosition === 'left' && (
                    <IconComponent className="fill-current h-icon w-icon" />
                )}
                {label}
                {showIcon && IconComponent && iconPosition === 'right' && (
                    <IconComponent className="fill-current h-icon w-icon" />
                )}
            </Link>
        </Annotated>
    );
}

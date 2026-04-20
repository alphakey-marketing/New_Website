import classNames from 'classnames';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';
import Section from '../Section';

interface LinkItem {
    title: string;
    description?: string;
    url: string;
    icon?: string;
    tag?: string;
}

interface UsefulLinksSectionProps {
    elementId?: string;
    colors?: 'colors-a' | 'colors-b' | 'colors-c' | 'colors-d' | 'colors-e' | 'colors-f';
    backgroundSize?: 'full' | 'inset';
    title?: string;
    subtitle?: string;
    links?: LinkItem[];
    styles?: { self?: Record<string, unknown> };
}

const PLACEHOLDER_COUNT = 3;

export default function UsefulLinksSection(props: UsefulLinksSectionProps) {
    const { elementId, colors, backgroundSize, title, subtitle, links = [], styles = {} } = props;
    const sectionAlign = styles.self?.textAlign ?? 'center';

    const hasLinks = links.length > 0;

    return (
        <Section elementId={elementId} colors={colors} backgroundSize={backgroundSize} styles={styles.self}>
            <div className="w-full">
                {(title || subtitle) && (
                    <div className={classNames('mb-12 space-y-2', mapStyles({ textAlign: sectionAlign }))}>
                        {title && <h2 className="text-4xl sm:text-5xl font-bold">{title}</h2>}
                        {subtitle && <p className="text-xl">{subtitle}</p>}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hasLinks
                        ? links.map((link: LinkItem, index: number) => (
                              <a
                                  key={index}
                                  href={link.url}
                                  target={link.url.startsWith('http') ? '_blank' : undefined}
                                  rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                                  className={classNames(
                                      'group flex flex-col p-6 rounded-lg border-2 transition-all',
                                      'border-gray-200 hover:border-gray-400 hover:shadow-lg'
                                  )}
                              >
                                  {link.icon && <span className="text-3xl mb-3">{link.icon}</span>}
                                  <h3 className="text-lg font-bold mb-1 group-hover:underline">{link.title}</h3>
                                  {link.description && (
                                      <p className="text-sm opacity-80 flex-1 leading-relaxed">{link.description}</p>
                                  )}
                                  {link.tag && (
                                      <span className="mt-3 self-start text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded border border-current opacity-60">
                                          {link.tag}
                                      </span>
                                  )}
                              </a>
                          ))
                        : Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
                              <div
                                  key={i}
                                  className="flex flex-col p-6 rounded-lg border-2 border-dashed border-gray-300 opacity-40"
                              >
                                  <span className="text-3xl mb-3">🔗</span>
                                  <h3 className="text-lg font-bold mb-1">Coming Soon</h3>
                                  <p className="text-sm leading-relaxed">
                                      A new tool or project will be linked here.
                                  </p>
                              </div>
                          ))}
                </div>
            </div>
        </Section>
    );
}

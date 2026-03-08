import classNames from 'classnames';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';
import Section from '../Section';

export default function ServicesSection(props) {
    const { elementId, colors, backgroundSize, title, subtitle, styles = {}, services = [] } = props;
    const sectionAlign = styles.self?.textAlign ?? 'center';

    const whatsappLink = (phone: string, text: string) => {
        const message = encodeURIComponent(text);
        return `https://wa.me/${phone}?text=${message}`;
    };

    return (
        <Section elementId={elementId} colors={colors} backgroundSize={backgroundSize} styles={styles.self}>
            <div className="w-full">
                {(title || subtitle) && (
                    <div className={classNames('mb-12 space-y-2', mapStyles({ textAlign: sectionAlign }))}>
                        {title && <h2 className="text-4xl sm:text-5xl font-bold text-white">{title}</h2>}
                        {subtitle && <p className="text-xl text-white">{subtitle}</p>}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className={classNames(
                                'p-8 rounded-lg border-2 transition-all hover:shadow-lg',
                                'border-gray-200 hover:border-gray-400'
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-2xl font-bold max-w-xs text-white">{service.title}</h3>
                                <span className="text-3xl ml-2">{service.icon}</span>
                            </div>

                            <p className="text-white mb-6 leading-relaxed">{service.description}</p>

                            <ul className="space-y-2 mb-8">
                                {service.features?.map((feature, idx) => (
                                    <li key={idx} className="flex items-center text-white">
                                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-3"></span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href={whatsappLink(service.phone, `Hi! I'm interested in ${service.title}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={classNames(
                                    'inline-block px-6 py-3 rounded-lg font-semibold transition-all',
                                    'bg-green-500 text-white hover:bg-green-600'
                                )}
                            >
                                Learn More
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
}

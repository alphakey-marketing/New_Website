import classNames from 'classnames';
import * as React from 'react';

import { Annotated } from '@/components/Annotated';
import { DynamicComponent } from '@/components/components-registry';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';

export default function FormBlock(props) {
    const formRef = React.useRef<HTMLFormElement>(null);
    const { elementId, className, fields = [], submitLabel, styles = {}, whatsappPhone } = props;

    if (fields.length === 0) {
        return null;
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!formRef.current) return;
        const data = new FormData(formRef.current);
        const values = Object.fromEntries(data.entries());

        if (whatsappPhone) {
            // Build a human-readable prefilled WhatsApp message from form data
            const greeting = props.whatsappGreeting ?? "Hi! I'd like to get in touch.";
            const lines: string[] = [greeting, ''];
            if (values.firstName) lines.push(`Name: ${values.firstName}`);
            if (values.company)   lines.push(`Company: ${values.company}`);
            if (values.email)     lines.push(`Email: ${values.email}`);
            if (values.message)   lines.push(`\nMessage:\n${values.message}`);

            const encoded = encodeURIComponent(lines.join('\n'));
            window.open(`https://wa.me/${whatsappPhone}?text=${encoded}`, '_blank', 'noopener,noreferrer');
        } else {
            alert(`Form data: ${JSON.stringify(values)}`);
        }
    }

    return (
        <Annotated content={props}>
            <form className={className} name={elementId} id={elementId} onSubmit={handleSubmit} ref={formRef}>
                <div className="grid gap-6 sm:grid-cols-2">
                    <input type="hidden" name="form-name" value={elementId} />
                    {fields.map((field, index) => {
                        return <DynamicComponent key={index} {...field} />;
                    })}
                </div>
                <div className={classNames('mt-8', mapStyles({ textAlign: styles.self?.textAlign ?? 'left' }))}>
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center px-5 py-4 text-lg transition border-2 border-current hover:bottom-shadow-6 hover:-translate-y-1.5"
                    >
                        {submitLabel}
                    </button>
                </div>
            </form>
        </Annotated>
    );
}

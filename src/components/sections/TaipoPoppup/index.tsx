import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';

export default function TaipoPoppup() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const isZh = router.asPath?.startsWith('/zh') ?? false;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Show popup when on homepage (both EN and TC)
        if (router.isReady) {
            // Remove query strings and normalize path
            const path = router.asPath.split('?')[0] || '/';
            const isHomepage = path === '/' || path === '/zh' || path === '/zh/';
            // Disable popup for now as per user request
            setIsOpen(false);
        }
    }, [router.asPath, router.isReady]);

    const handleClose = () => {
        setIsOpen(false);
    };

    if (!isMounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className={classNames(
                        'absolute top-4 right-4 w-8 h-8 flex items-center justify-center',
                        'rounded-full bg-gray-200 hover:bg-gray-300 transition-colors',
                        'text-gray-700 font-bold text-lg leading-none'
                    )}
                    aria-label="Close popup"
                >
                    ✕
                </button>

                {/* Content */}
                <div className="p-8 text-gray-800">
                    {isZh ? (
                        <>
                            <h2 className="text-2xl font-bold mb-6 text-center text-red-600">
                                致 大埔 大火的受影響者及所有關心人士
                            </h2>
                            <div className="space-y-4 text-base leading-relaxed">
                                <p>
                                    我們為 大埔 火災中的每一位罹難者與受傷者祝禱。如果你正經歷身心靈上的創傷與困難，請知道你不必獨自承受。
                                </p>
                                <p>
                                    我們提供身心靈療癒支援，協助受災者渡過難關。無論你是直接受影響的住戶、失親者、救援人員，或任何感到精神創傷的人，我們都願意提供協助。
                                </p>
                                <div className="bg-blue-50 p-4 rounded-lg my-4">
                                    <p className="font-semibold">📞 WhatsApp 我們：96783395</p>
                                </div>
                                <p>
                                    我們可以根據你的需要安排一對一的療癒療程。
                                </p>
                                <p className="text-center text-lg font-semibold text-purple-600 mt-6">
                                    在這個艱難的時刻，願我們的支援能為你帶來一絲安慰與力量。
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold mb-6 text-center text-red-600">
                                To all those affected by the Tai Po fire and everyone who cares
                            </h2>
                            <div className="space-y-4 text-base leading-relaxed">
                                <p>
                                    We hold in our hearts all those who have lost their lives and those who have been injured in this tragedy. If you are experiencing physical, emotional, or spiritual trauma from this disaster, please know that you do not have to face this alone.
                                </p>
                                <p>
                                    We offer healing and wellness support to help survivors navigate this difficult time. Whether you are a displaced resident, someone who has lost loved ones, a rescue worker, or anyone experiencing emotional distress, we are here to help.
                                </p>
                                <div className="bg-blue-50 p-4 rounded-lg my-4">
                                    <p className="font-semibold">📞 WhatsApp us: 96783395</p>
                                </div>
                                <p>
                                    We can arrange personalized healing sessions tailored to your needs.
                                </p>
                                <p className="text-center text-lg font-semibold text-purple-600 mt-6">
                                    In this difficult moment, may our support bring you comfort and strength.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

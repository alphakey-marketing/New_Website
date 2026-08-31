import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// Blackie — AI marketing 助手黑貓，長駐右下角，撳一下轉pose
// idle太耐會自動訓覺，撳CTA掣會跳一跳慶祝（見 window 'blackie:celebrate' event）

const POSES = [
    'cat_kitten_sit_front',
    'cat_kitten_gaze',
    'cat_kitten_stretch',
    'cat_kitten_groom',
    'cat_kitten_play',
    'cat_kitten_stand_3q',
    'cat_kitten_scratch',
    'cat_kitten_walk_side'
];

const CELEBRATE_POSES = ['cat_kitten_jump', 'cat_kitten_tumble', 'cat_kitten_chase'];
const IDLE_POSES = ['cat_kitten_sleep', 'cat_kitten_yarn_sleep'];
const IDLE_TIMEOUT_MS = 25000;

export default function Blackie() {
    const [poseIndex, setPoseIndex] = useState(0);
    const [idlePose, setIdlePose] = useState<string | null>(null);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetIdleTimer = () => {
        setIdlePose(null);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            const pick = IDLE_POSES[Math.floor(Math.random() * IDLE_POSES.length)];
            setIdlePose(pick);
        }, IDLE_TIMEOUT_MS);
    };

    useEffect(() => {
        resetIdleTimer();

        const onCelebrate = () => {
            const pick = CELEBRATE_POSES[Math.floor(Math.random() * CELEBRATE_POSES.length)];
            setIdlePose(pick);
            resetIdleTimer();
        };
        window.addEventListener('blackie:celebrate', onCelebrate);

        return () => {
            window.removeEventListener('blackie:celebrate', onCelebrate);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClick = () => {
        setPoseIndex((prev) => (prev + 1) % POSES.length);
        resetIdleTimer();
    };

    const currentPose = idlePose ?? POSES[poseIndex];

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label="Blackie the AI marketing cat — click to change pose"
            title="撳一下換個姿勢！"
            style={{
                position: 'fixed',
                bottom: '1.5rem',
                right: '1.5rem',
                zIndex: 9999,
                width: '140px',
                height: '140px',
                background: 'radial-gradient(circle, rgba(255,209,102,0.55) 0%, rgba(255,209,102,0.0) 70%)',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                padding: '8px',
                filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.35))',
                transition: 'transform 0.15s ease'
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
            <Image
                src={`/images/blackie/${currentPose}.svg`}
                alt="Blackie the cat"
                width={124}
                height={124}
                priority={false}
            />
        </button>
    );
}

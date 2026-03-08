'use client';

import { useEffect, useRef } from 'react';

export default function StarfieldBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Array<{
            x: number;
            y: number;
            radius: number;
            opacity: number;
            twinkleSpeed: number;
            twinklePhase: number;
        }> = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createStars = () => {
            stars = [];
            const numStars = Math.floor((canvas.width * canvas.height) / 3000);
            
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5 + 0.5,
                    opacity: Math.random(),
                    twinkleSpeed: Math.random() * 0.02 + 0.01,
                    twinklePhase: Math.random() * Math.PI * 2
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                star.twinklePhase += star.twinkleSpeed;
                const twinkle = (Math.sin(star.twinklePhase) + 1) / 2;
                const opacity = star.opacity * twinkle * 0.8;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.fill();

                // Add glow effect for brighter stars
                if (star.radius > 1.2) {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(200, 220, 255, ${opacity * 0.3})`;
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        createStars();
        animate();

        const handleResize = () => {
            resizeCanvas();
            createStars();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    );
}

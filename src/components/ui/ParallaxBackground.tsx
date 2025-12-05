import React, { useEffect, useRef } from 'react';

interface ParallaxBackgroundProps {
    children: React.ReactNode;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const moveX = (clientX - centerX) / 50;
            const moveY = (clientY - centerY) / 50;

            container.style.setProperty('--move-x', `${moveX}px`);
            container.style.setProperty('--move-y', `${moveY}px`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-background selection:bg-primary/20">
            {/* Animated Background Elements */}
            <div
                ref={containerRef}
                className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
                style={{ perspective: '1000px' } as React.CSSProperties}
            >
                {/* Large Gradient Orbs */}
                <div
                    className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px] transition-transform duration-1000 ease-out"
                    style={{ transform: 'translate(var(--move-x), var(--move-y))' }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/10 blur-[100px] transition-transform duration-1000 ease-out"
                    style={{ transform: 'translate(calc(var(--move-x) * -1), calc(var(--move-y) * -1))' }}
                />

                {/* Floating Shapes */}
                <div
                    className="absolute top-[20%] right-[20%] w-32 h-32 rounded-full border border-primary/20 opacity-20 animate-float"
                    style={{ animationDelay: '0s' }}
                />
                <div
                    className="absolute bottom-[30%] left-[10%] w-24 h-24 rounded-lg border border-accent/20 opacity-20 animate-float"
                    style={{ animationDelay: '2s', transform: 'rotate(45deg)' }}
                />
                <div
                    className="absolute top-[40%] left-[40%] w-16 h-16 rounded-full bg-gradient-to-tr from-primary/20 to-transparent opacity-30 animate-pulse"
                />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

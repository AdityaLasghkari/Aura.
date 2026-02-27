import { useState, useEffect, useRef } from 'react';

export const useMobileInView = (threshold = 0.5) => {
    const [isInView, setIsInView] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(max-width: 768px)').matches);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            window.removeEventListener('resize', checkMobile);
            observer.disconnect();
        };
    }, [threshold]);

    return { ref, isInView, isMobile };
};

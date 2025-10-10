import React, { useEffect, useRef, useState } from 'react';

/**
 * AutoFitScale: Scales its child horizontally to fit container width (no horizontal scroll).
 * - Uses ResizeObserver to compute scale = min(1, containerWidth / contentWidth)
 * - Keeps height proportion via CSS transform
 */
export default function AutoFitScale({ children, minScale = 0.6 }) {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const ro = new ResizeObserver(() => {
            const cw = containerRef.current?.clientWidth || 0;
            const iw = contentRef.current?.scrollWidth || 0;
            if (iw > 0 && cw > 0) {
                const s = Math.min(1, cw / iw);
                setScale(Math.max(minScale, s));
            }
        });
        if (containerRef.current) ro.observe(containerRef.current);
        if (contentRef.current) ro.observe(contentRef.current);
        return () => ro.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full overflow-hidden">
            <div
                ref={contentRef}
                style={{ transform: `scale(${scale})`, transformOrigin: 'left top' }}
                className="inline-block"
            >
                {children}
            </div>
        </div>
    );
}

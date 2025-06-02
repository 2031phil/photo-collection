'use client';
import { useState, useRef } from 'react';

export default function Pressable({ children, className = '', style = {}, onClick }) {
    const [isPressed, setIsPressed] = useState(false);
    const pressTimeout = useRef(null);
    const pressStartTime = useRef(null);
    const MIN_PRESS_TIME = 100;

    const handleMouseDown = () => {
        clearTimeout(pressTimeout.current);
        pressStartTime.current = Date.now();
        setIsPressed(true);
    };

    const handleMouseUp = () => {
        const pressDuration = Date.now() - pressStartTime.current;
        const remainingTime = MIN_PRESS_TIME - pressDuration;

        if (remainingTime > 0) {
            pressTimeout.current = setTimeout(() => setIsPressed(false), remainingTime);
        } else {
            setIsPressed(false);
        }
    };

    const handleMouseLeave = () => {
        clearTimeout(pressTimeout.current);
        setIsPressed(false);
    };

    return (
        <div
            className={className}
            style={{ transform: isPressed ? 'scale(0.9)' : 'scale(1)', ...style }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
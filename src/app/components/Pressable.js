'use client';
import { useState, useRef } from 'react';
import Label from './Label';

export default function Pressable({ icon, text, clicked, onClick, iconPosition, larger }) {
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

    function handleClick() {
        if (typeof onClick === 'function') { //prevents errors in case onClick wasn’t passed or is not a function
            onClick();
        }
    }

    return (
        <Label
            icon={icon}
            text={text}
            onClick={handleClick}
            className={`label border-hover pointer standard-blur standard-border ${clicked ? ' gradient-border-20' : ''} ${larger ? 'larger' : ''}`}
            style={{ transform: isPressed ? 'scale(0.9)' : 'scale(1)', flexDirection: iconPosition === "right" ? 'row-reverse' : 'row' }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
        </Label>
    );
}
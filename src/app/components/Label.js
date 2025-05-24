import { useState, useRef } from 'react';

export default function Label({ icon, text }) {
    const [clicked, setClicked] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const pressTimeout = useRef(null);
    const pressStartTime = useRef(null);
    let MIN_PRESS_TIME = 100;

    const handleMouseDown = () => {
        clearTimeout(pressTimeout.current);
        pressStartTime.current = Date.now();
        setIsPressed(true);
    };

    const handleMouseUp = () => {
        const pressDuration = Date.now() - pressStartTime.current;
        const remainingTime = MIN_PRESS_TIME - pressDuration;

        if (remainingTime > 0) {
            pressTimeout.current = setTimeout(() => {
                setIsPressed(false);
            }, remainingTime);
        } else {
            setIsPressed(false);
        }
    };

    const handleMouseLeave = () => {
        // Cancel if they leave before timeout ends
        clearTimeout(pressTimeout.current);
        setIsPressed(false);
    };

    function handleClick() {
        setClicked((prev) => !prev);
    }

    return (
        <div
            className={`label standard-blur standard-border${clicked ? ' gradient-border' : ''}`}
            style={{ transform: isPressed ? 'scale(0.9)' : 'scale(1)' }}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <div className="icon-container">
                {icon && icon}
            </div>
            {text && <span className="label-text">{text}</span>}
        </div>
    );
}
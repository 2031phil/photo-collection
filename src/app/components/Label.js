import Pressable from './Pressable';

export default function Label({ icon, text, clicked, onClick }) {
    function handleClick() {
        if (typeof onClick === 'function') { //prevents errors in case onClick wasn’t passed or is not a function
            onClick();
        }
    }

    return (
        <Pressable
            className={`label standard-blur standard-border${clicked ? ' gradient-border' : ''}`}
            onClick={handleClick}
        >
            <div className="icon-container">
                {icon && icon}
            </div>
            {text && <span className="label-text">{text}</span>}
        </Pressable>
    );
}
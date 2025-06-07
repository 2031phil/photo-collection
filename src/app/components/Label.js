export default function Label({ icon, text, ...rest }) {

    return (
        <div className="label standard-blur standard-border" {...rest}>
            <div className="icon-container">
                {icon && icon}
            </div>
            {text && <span className="label-text">{text}</span>}
        </div>
    );
}
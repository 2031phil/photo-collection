export default function Label({ icon, text, ...rest }) {

    return (
        <div className="label standard-blur standard-border" {...rest}>
            {icon && (
                <div className="icon-container">
                    {icon}
                </div>
            )}
            {text && <span className="label-text">{text}</span>}
        </div>
    );
}
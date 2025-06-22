export default function OptionsList({ options, selectedOption, isOpen, position, handleOptionClick }) {
    return (
        <ul className="standard-blur standard-border" style={{
            position: position,
            top: 0,
            right: 0,
            backgroundColor: 'white',
            padding: 0,
            margin: 0,
            listStyle: 'none',
            zIndex: 10,
            borderRadius: 'inherit',
            minWidth: '100%',
            overflow: 'hidden',
            animation: isOpen === true ? 'jumpOpen .3s' : 'jumpClose .3s',
            transformOrigin: 'top'
        }}>
            {options.map((option, index) => (
                <div key={index}>
                    <li
                        onClick={() => handleOptionClick(option)}
                        className='dropdown-li'
                        style={{
                            padding: '.5rem .75rem',
                            cursor: 'pointer',
                            backgroundColor: selectedOption === option ? 'rgba(201, 201, 201, .3)' : 'transparent',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <span className='label-text'>{option}</span>
                        {selectedOption === option && (
                            <div style={{ width: '1rem', height: '.75rem', marginLeft: '.75rem', display: 'flex', alignItems: 'center' }}>
                                <svg className='icons' xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
                                    <path d="M4.59502 12.5C4.26923 12.5 3.99095 12.3524 3.76018 12.0573L0.244344 7.5755C0.158371 7.46945 0.0950226 7.36571 0.0542986 7.26427C0.0180995 7.16282 0 7.05908 0 6.95303C0 6.71326 0.0769231 6.51499 0.230769 6.35821C0.38914 6.20144 0.588235 6.12305 0.828054 6.12305C1.10407 6.12305 1.3371 6.24986 1.52715 6.50346L4.56787 10.4804L10.4593 0.942651C10.5633 0.781268 10.6697 0.6683 10.7783 0.603746C10.8869 0.534582 11.0271 0.5 11.1991 0.5C11.4344 0.5 11.6267 0.576081 11.776 0.728242C11.9253 0.875793 12 1.06945 12 1.30922C12 1.40605 11.9842 1.50519 11.9525 1.60663C11.9208 1.70346 11.871 1.8072 11.8032 1.91787L5.42308 12.0504C5.22398 12.3501 4.94796 12.5 4.59502 12.5Z" fill="black" />
                                </svg>
                            </div>
                        )}
                    </li>
                    {index < options.length - 1 && (
                        <hr style={{
                            margin: 0,
                            border: 'none',
                            borderTop: '1px solid rgba(201, 201, 201, .4)',
                            height: 0,
                            lineHeight: 0
                        }} />
                    )}
                </div>
            ))}
        </ul>
    );
}
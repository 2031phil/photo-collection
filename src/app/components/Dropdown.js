'use client';
import { useState, useRef, useEffect } from 'react';

export default function Dropdown({ onSelect, text, options = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const dropdownRef = useRef(null); //persistent reference to the dom element with "ref={dropdownRef}" 
    const [shouldRenderDropdown, setShouldRenderDropdown] = useState(false);

    useEffect(() => { //When isOpen becomes true, this function is triggered. It adds a mousedown event listener to the whole document and then checks, when the listener is triggered, if the click was outside of the dropdown.
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            setShouldRenderDropdown(true);
        } else {
            const timeout = setTimeout(() => setShouldRenderDropdown(false), 280); // almost match jumpClose duration to ensure that no accidental flickering occurs
            return () => clearTimeout(timeout);
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        onSelect(option);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="dropdown-container" style={{ position: 'relative', borderRadius: '1.25rem' }}>

            <div //The Button
                role="button" //For accessibility 
                tabIndex={0} //For accessibility 
                className={`label border-hover pointer standard-blur standard-border${selectedOption ? ' gradient-border-20' : ''}`}
                onClick={() => setIsOpen((prev) => !prev)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(prev => !prev); }} //For accessibility 
            >
                <span className="label-text">{selectedOption || text}</span>

                <div className="icon-container">
                    {selectedOption ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOption(null);
                                onSelect(null);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                margin: 0,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            aria-label="Clear selection"
                        >
                            <svg className='x-icon' xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                <path d="M7.04552 14.582C6.08259 14.582 5.17708 14.3986 4.329 14.0318C3.48533 13.6695 2.74326 13.1679 2.10278 12.5271C1.4623 11.8863 0.958751 11.1439 0.592131 10.2998C0.229929 9.45135 0.0488281 8.54541 0.0488281 7.58203C0.0488281 6.61423 0.229929 5.70829 0.592131 4.86423C0.958751 4.01574 1.4623 3.27111 2.10278 2.63033C2.74326 1.98954 3.48533 1.48797 4.329 1.12559C5.17708 0.763218 6.08259 0.582031 7.04552 0.582031C8.01286 0.582031 8.91837 0.763218 9.76203 1.12559C10.6101 1.48797 11.3544 1.98954 11.9949 2.63033C12.6354 3.27111 13.1367 4.01574 13.4989 4.86423C13.8655 5.70829 14.0488 6.61423 14.0488 7.58203C14.0488 8.54541 13.8655 9.45135 13.4989 10.2998C13.1367 11.1439 12.6354 11.8863 11.9949 12.5271C11.3544 13.1679 10.6101 13.6695 9.76203 14.0318C8.91837 14.3986 8.01286 14.582 7.04552 14.582ZM5.09757 10.7837C5.26984 10.7837 5.41119 10.7462 5.52162 10.671C5.63204 10.5959 5.7513 10.4589 5.8794 10.2601L7.01901 8.58298H7.06539L8.1785 10.2601C8.30218 10.4545 8.41923 10.5915 8.52966 10.671C8.64451 10.7462 8.78585 10.7837 8.9537 10.7837C9.18781 10.7837 9.37554 10.7152 9.51688 10.5782C9.66265 10.4412 9.73553 10.2645 9.73553 10.0479C9.73553 9.8535 9.66044 9.65905 9.51026 9.46461L8.08574 7.55552L9.51688 5.63317C9.67148 5.4343 9.74878 5.23986 9.74878 5.04983C9.74878 4.83771 9.6759 4.66536 9.53013 4.53279C9.38879 4.39579 9.20548 4.3273 8.98021 4.3273C8.80794 4.3273 8.66438 4.36486 8.54954 4.43999C8.43469 4.51511 8.31985 4.6499 8.205 4.84434L7.1184 6.52142H7.06539L5.94566 4.83771C5.81756 4.64327 5.69609 4.51069 5.58125 4.43999C5.47082 4.36486 5.32947 4.3273 5.1572 4.3273C4.93193 4.3273 4.74421 4.398 4.59402 4.53942C4.44826 4.67641 4.37538 4.85097 4.37538 5.06309C4.37538 5.25754 4.45489 5.45861 4.6139 5.66631L5.99866 7.53563L4.5609 9.47786C4.41071 9.67673 4.33562 9.87117 4.33562 10.0612C4.33562 10.2689 4.4063 10.4412 4.54764 10.5782C4.69341 10.7152 4.87672 10.7837 5.09757 10.7837Z" fill="black" />
                            </svg>
                        </button>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none">
                            <path d="M7.00391 7.82031C6.80599 7.82031 6.62891 7.74479 6.47266 7.59375L0.425781 1.40625C0.358073 1.33854 0.30599 1.26302 0.269531 1.17969C0.233073 1.09115 0.214844 0.997396 0.214844 0.898438C0.214844 0.763021 0.246094 0.640625 0.308594 0.53125C0.371094 0.421875 0.454427 0.335938 0.558594 0.273438C0.667969 0.210938 0.790365 0.179688 0.925781 0.179688C1.1237 0.179688 1.29297 0.247396 1.43359 0.382812L7.41797 6.5H6.58203L12.5664 0.382812C12.7122 0.247396 12.8815 0.179688 13.0742 0.179688C13.2096 0.179688 13.3294 0.210938 13.4336 0.273438C13.543 0.335938 13.6289 0.421875 13.6914 0.53125C13.7539 0.640625 13.7852 0.763021 13.7852 0.898438C13.7852 1.09115 13.7148 1.25781 13.5742 1.39844L7.52734 7.59375C7.45964 7.66667 7.37891 7.72396 7.28516 7.76562C7.19661 7.80208 7.10286 7.82031 7.00391 7.82031Z" fill="black" />
                        </svg>
                    )}
                </div>

            </div>

            {shouldRenderDropdown && ( //The Dropdown
                <ul className="standard-blur standard-border" style={{
                    position: 'absolute',
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
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
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
            )}

        </div>
    );
}

// For later: persist the selected option across page loads
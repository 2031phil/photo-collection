'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Selector({ onSelect, text, options = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(options[0] || null);
    const dropdownRef = useRef(null); //persistent reference to the dom element with "ref={dropdownRef}" 
    const [shouldRenderDropdown, setShouldRenderDropdown] = useState(false);

    useEffect(() => {
        if (options.length > 0) {
            setSelectedOption(options[0]);
            onSelect(0); // Notify parent that the first option is selected (by default)
        }
    }, []);

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

    const handleOptionClick = (option, index) => {
        setSelectedOption(option);
        onSelect(index);
        setIsOpen(false);
    };

    return (
        <motion.div
            ref={dropdownRef}
            className="dropdown-container"
            style={{ position: 'relative', borderRadius: '1.25rem', transformOrigin: 'right', display: 'flex', justifyContent: 'flex-end' }}
            layout
            transition={{ duration: 0.1 }}
        >

            <motion.div //The Button
                role="button" //For accessibility 
                tabIndex={0} //For accessibility 
                className={'label border-hover pointer standard-blur standard-border'}
                onClick={() => setIsOpen((prev) => !prev)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(prev => !prev); }} //For accessibility 
                layout
                transition={{ duration: 0.1 }}
                style={{
                    transformOrigin: 'right',
                    alignSelf: 'flex-end',
                }}
            >
                <span className="label-text">{selectedOption || text}</span>

                <div className="icon-container">
                    <svg className='icons' xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none">
                        <path d="M7.00391 7.82031C6.80599 7.82031 6.62891 7.74479 6.47266 7.59375L0.425781 1.40625C0.358073 1.33854 0.30599 1.26302 0.269531 1.17969C0.233073 1.09115 0.214844 0.997396 0.214844 0.898438C0.214844 0.763021 0.246094 0.640625 0.308594 0.53125C0.371094 0.421875 0.454427 0.335938 0.558594 0.273438C0.667969 0.210938 0.790365 0.179688 0.925781 0.179688C1.1237 0.179688 1.29297 0.247396 1.43359 0.382812L7.41797 6.5H6.58203L12.5664 0.382812C12.7122 0.247396 12.8815 0.179688 13.0742 0.179688C13.2096 0.179688 13.3294 0.210938 13.4336 0.273438C13.543 0.335938 13.6289 0.421875 13.6914 0.53125C13.7539 0.640625 13.7852 0.763021 13.7852 0.898438C13.7852 1.09115 13.7148 1.25781 13.5742 1.39844L7.52734 7.59375C7.45964 7.66667 7.37891 7.72396 7.28516 7.76562C7.19661 7.80208 7.10286 7.82031 7.00391 7.82031Z" fill="black" />
                    </svg>
                </div>

            </motion.div>

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
                                onClick={() => handleOptionClick(option, index)}
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
            )}

        </motion.div>
    );
}
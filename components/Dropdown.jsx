"use client"

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

function Dropdown(props) {
    const { value = null, onChange = null, options = [], isDisabled = false } = props;
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [position, setPosition] = useState('bottom');
    const [_, setScrolling] = useState(false);
    const [scrollTop, setScrollTop] = useState(0);
    const dropdownRef = useRef(null);
    const selectedOptionRef = useRef(null);


    function toggleDropdown() {
        if (!isDisabled) {
            setIsDropdownVisible(prev => !prev);
        }
    }

    function changeSelectedValue(option) {
        onChange(option);
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !selectedOptionRef.current.contains(event.target)
            ) {
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownVisible]);

    useEffect(() => {
        const dropdownElement = dropdownRef.current;
        const selectedOptionElement = selectedOptionRef.current;

        if (dropdownElement && selectedOptionElement) {
            const dropdownRect = dropdownElement.getBoundingClientRect();
            const dotRect = selectedOptionElement.getBoundingClientRect();

            const spaceBelow = window.innerHeight - dotRect.bottom - 200;
            const spaceAbove = dotRect.top;
            if (spaceBelow >= dropdownRect.height || spaceBelow > spaceAbove) {
                setPosition('bottom');
            } else {
                setPosition('top');
            }
        }
        const onScroll = e => {
            setScrollTop(e.target.documentElement.scrollTop);
            setScrolling(e.target.documentElement.scrollTop > scrollTop);
        };
        window.addEventListener("scroll", onScroll);

        return () => window.removeEventListener("scroll", onScroll);
    }, [isDropdownVisible, scrollTop]);


    return (
        <div className="flex w-full rounded-md bg-white dropdown_container" onClick={toggleDropdown}>
            <div className={`dropdown ${position} w-full`} ref={dropdownRef}>
                <div
                    ref={selectedOptionRef}
                    className="rounded-md h-auto flex justify-between items-center bg-white w-full p-2"
                >
                    <span className="mx-1">
                        {value}
                    </span>
                    <Image
                        src="/assets/icons/down-arrow.svg"
                        width={10}
                        height={10}
                        alt="down arrow"
                    />
                </div>
                {isDropdownVisible && (
                    <div className={`dropdown-content shadow-md shadow-black rounded-md w-full items-start p-1 bg-white`}>
                        {options.map((option) => (
                            <button
                                onClick={() => changeSelectedValue(option)}
                                key={option.label}
                                className={`
                                rounded-md
                                w-full
                                text-left
                                hover:bg-gray-300
                                p-2
                                ${value === option.value && 'bg-blue-200'}
                                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div >
    )
}

export default Dropdown;
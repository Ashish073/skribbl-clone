"use client"

import React, { useState, useRef, useEffect } from 'react'
import { brushs, colors } from '@/constants/config';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSize } from '@/redux/slices/brushSlice';
import Dot from './Dot';

function BrushTool(props) {
    const { onSelectPaintBucket } = props;
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [position, setPosition] = useState('top');
    const [_, setScrolling] = useState(false);
    const [scrollTop, setScrollTop] = useState(0);
    const dropdownRef = useRef(null);
    const dotRef = useRef(null);
    const selectedTool = useSelector(state => state.toolSlice.value.type);
    const selectedBrushSize = useSelector(state => state.brushSlice.value.size);
    const selectedColor = useSelector(state => state.colorSlice.value.color);
    const dispatch = useDispatch();

    function handleDotClick() {
        setIsDropdownVisible(!isDropdownVisible);
        onSelectPaintBucket(1);
    }

    function handlePencilClick() {
        onSelectPaintBucket(2);
    }

    function onChangeBrushSize(size) {
        dispatch(setSelectedSize(size));
        setIsDropdownVisible(false);
    }

    function handleColorCodeLogic(brush) {
        if (selectedBrushSize === brush && selectedColor !== colors[0]) {
            return selectedColor;
        }

        if (selectedBrushSize === brush && selectedColor === colors[0]) {
            return '#396ca3';
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !dotRef.current.contains(event.target)
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
        const dotElement = dotRef.current;

        if (dropdownElement && dotElement) {
            const dropdownRect = dropdownElement.getBoundingClientRect();
            const dotRect = dotElement.getBoundingClientRect();

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
        <div className="sm:ml-5 md:ml-5 flex mt-1 justify-center items-center">
            <div className={`dropdown ${position} flex  justify-center items-center mr-1`} ref={dropdownRef}>
                <button
                    onClick={handleDotClick}
                    ref={dotRef}
                    className={`rounded-md h-auto flex items-center
                    ${selectedColor === colors[0] ? 'bg-blue-400' : 'bg-white'}
                    ${selectedTool === 'BRUSH' ? 'border-4 border-yellow-300' : 'p-1'}
                    `}
                >
                    <Dot radius={selectedBrushSize} fill={selectedColor} />
                </button>
                {isDropdownVisible && (
                    <div className={`dropdown-content shadow-md mx-1  shadow-black rounded-md my-1 ${selectedColor === colors[0] ? 'bg-blue-400' : 'bg-white'}`}>
                        {brushs.map((brush, index) => (
                            <button onClick={() => onChangeBrushSize(brush)} key={brush} className="rounded-md" style={{ background: `${handleColorCodeLogic(brush)}` }}>
                                <Dot key={index} sizeX={35} sizeY={35} radius={brush} fill={Number(selectedBrushSize) === brush ? '#ffffff' : selectedColor} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <button
                onClick={handlePencilClick}
                className={`bg-white -mr-1 p-1 flex justify-center items-center rounded-md ${selectedTool === 'PENCIL' ? 'border-4 border-yellow-300' : 'p-2'}`}>
                <Image
                    src='/assets/images/pencil.png'
                    width={25}
                    height={25}
                    alt="fill"
                />
            </button>
        </div >
    );
}

export default BrushTool;
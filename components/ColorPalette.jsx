"use client"

import { useState } from "react";
import { colors } from "@/constants/config";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedColor } from "@/redux/slices/colorSlice";



function ColorPalette() {
    const selectedColor = useSelector(state => state.colorSlice.value.color);
    const dispatch = useDispatch();

    const onChangeColor = (color) => {
        dispatch(setSelectedColor(color));
    }


    return (
        <div className="box_shadow rounded-md flex flex-wrap justify-between overflow-hidden mt-2 color_palette_holder">
            {
                colors?.map(color => (
                    <button key={color} onClick={() => onChangeColor(color)} className={`color_sect ${selectedColor === color ? 'border-2 border-white rounded-sm' : ''}`} style={{ background: `${color}` }} />
                ))
            }
        </div>
    )
}

export default ColorPalette;
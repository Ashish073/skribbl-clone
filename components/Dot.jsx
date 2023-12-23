"use client"

const Dot = ({ radius, fill }) => {
    return (
        <svg width="38" height="38" xmlns="http://www.w3.org/2000/svg">
            <circle cx="19" cy="19" r={radius} fill={fill} />
        </svg>
    );
};

export default Dot;
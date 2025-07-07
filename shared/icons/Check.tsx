import React from "react";

export const Check = ({ ...props }) => {
    return (
        <svg
            viewBox="0 0 45 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g filter="url(#filter0_i_44_5367)">
                <path
                    d="M22.3834 44.878C34.5306 44.878 44.3779 35.0308 44.3779 22.8835C44.3779 10.7363 34.5306 0.889038 22.3834 0.889038C10.2362 0.889038 0.388916 10.7363 0.388916 22.8835C0.388916 35.0308 10.2362 44.878 22.3834 44.878Z"
                    fill="url(#paint0_linear_44_5367)"
                    fillOpacity="0.1"
                />
            </g>
            <path
                d="M22.3831 1.38904C34.254 1.38904 43.878 11.0123 43.8782 22.8832C43.8782 34.7543 34.2541 44.3783 22.3831 44.3783C10.5121 44.3781 0.888916 34.7541 0.888916 22.8832C0.88911 11.0124 10.5123 1.38923 22.3831 1.38904Z"
                stroke="white"
                strokeOpacity="0.5"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M13.6088 21.3361C12.7988 20.7951 11.7168 20.9181 11.0468 21.6261C10.3778 22.3331 10.3148 23.4211 10.8998 24.2001L16.8998 32.2001C17.2618 32.6821 17.8218 32.9761 18.4248 32.9991C19.0268 33.0211 19.6078 32.7711 20.0048 32.3171L34.0048 16.3171C34.6958 15.5281 34.6588 14.3391 33.9208 13.5931C33.1828 12.8471 31.9948 12.7991 31.1978 13.4811L18.3488 24.4951L13.6088 21.3361Z"
                fill="#222222"
            />
            <defs>
                <filter
                    id="filter0_i_44_5367"
                    x="0.388916"
                    y="-14.311"
                    width="43.989"
                    height="59.189"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feMorphology
                        radius="23"
                        operator="dilate"
                        in="SourceAlpha"
                        result="effect1_innerShadow_44_5367"
                    />
                    <feOffset dy="-36" />
                    <feGaussianBlur stdDeviation="19.1" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_44_5367"
                    />
                </filter>
                <linearGradient
                    id="paint0_linear_44_5367"
                    x1="22.3834"
                    y1="0.889038"
                    x2="22.3834"
                    y2="44.878"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#71647A" />
                    <stop offset="1" stopColor="#ACA5B1" />
                </linearGradient>
            </defs>
        </svg>
    );
};

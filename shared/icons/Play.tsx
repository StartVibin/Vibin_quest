import React from "react";

export const Play = ({ ...props }) => {
    return (
        <svg
            width="14"
            height="16"
            viewBox="0 0 14 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g filter="url(#filter0_i_130_411)">
                <path
                    d="M12.4706 5.83313L2.8125 0.253125C2.53642 0.0897865 2.22202 0.00245262 1.90125 0C1.39701 0 0.913417 0.20031 0.556863 0.556863C0.20031 0.913417 0 1.39701 0 1.90125V13.8769C6.41289e-05 14.2115 0.0897646 14.54 0.259775 14.8282C0.429785 15.1164 0.673898 15.3538 0.966732 15.5157C1.25957 15.6777 1.59043 15.7582 1.92492 15.7489C2.25941 15.7397 2.58532 15.641 2.86875 15.4631L12.5381 9.35437C12.8388 9.16621 13.0856 8.90338 13.2544 8.59148C13.4233 8.27957 13.5085 7.92925 13.5017 7.57463C13.4949 7.22002 13.3963 6.87321 13.2156 6.56801C13.0349 6.26281 12.7783 6.00962 12.4706 5.83313Z"
                    fill="url(#paint0_linear_130_411)"
                />
            </g>
            <path
                d="M1.89941 0.225586C2.18043 0.227735 2.45638 0.304168 2.69824 0.447266L2.7002 0.448242L12.3584 6.02832C12.6322 6.18542 12.8606 6.411 13.0215 6.68262C13.1824 6.95435 13.2703 7.26338 13.2764 7.5791C13.2824 7.89477 13.207 8.20673 13.0566 8.48438C12.9064 8.76194 12.6865 8.99558 12.4189 9.16309L12.418 9.16406L2.74805 15.2725C2.49893 15.4286 2.21284 15.5153 1.91895 15.5234C1.62466 15.5316 1.33283 15.4608 1.0752 15.3184C0.817866 15.176 0.603571 14.9672 0.454102 14.7139C0.304547 14.4603 0.225664 14.1713 0.225586 13.877V1.90137C0.225586 1.45684 0.401491 1.03015 0.71582 0.71582C1.02972 0.401924 1.45555 0.226072 1.89941 0.225586Z"
                stroke="black"
                strokeOpacity="0.32"
                strokeWidth="0.450304"
            />
            <defs>
                <filter
                    id="filter0_i_130_411"
                    x="0"
                    y="0"
                    width="13.502"
                    height="15.7496"
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
                        radius="10.357"
                        operator="dilate"
                        in="SourceAlpha"
                        result="effect1_innerShadow_130_411"
                    />
                    <feOffset dy="1" />
                    <feGaussianBlur stdDeviation="1.3" />
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
                        result="effect1_innerShadow_130_411"
                    />
                </filter>
                <linearGradient
                    id="paint0_linear_130_411"
                    x1="10.3077"
                    y1="-2.34304"
                    x2="-0.227885"
                    y2="24.1143"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#71647A" />
                    <stop offset="1" />
                </linearGradient>
            </defs>
        </svg>
    );
};

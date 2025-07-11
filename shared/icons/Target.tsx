import React from "react";

export const Target = ({ ...props }) => {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g clipPath="url(#clip0_5_69)">
                <mask
                    id="mask0_5_69"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                >
                    <path d="M0 0H20V20H0V0Z" fill="white" />
                </mask>
                <g mask="url(#mask0_5_69)">
                    <path
                        d="M15.9597 4.03232C18.4669 6.53448 18.4669 10.5913 15.9597 13.0934C14.9851 14.0661 13.7781 14.6594 12.5175 14.8764C12.3185 14.9106 12.1181 14.9355 11.9171 14.951C11.3223 14.9967 10.8774 15.515 10.9233 16.1085C10.9691 16.702 11.4884 17.146 12.0831 17.1003C12.3513 17.0796 12.6188 17.0464 12.8846 17.0007C14.5703 16.7106 16.1869 15.9153 17.487 14.6178C20.8377 11.2737 20.8377 5.852 17.487 2.50801C14.1363 -0.836003 8.70378 -0.836003 5.3531 2.50801C4.0529 3.80558 3.25604 5.41892 2.96535 7.10124C2.92342 7.34388 2.89202 7.58796 2.87114 7.83272C2.82055 8.42584 3.26132 8.9476 3.85564 8.99812C4.44994 9.0486 4.97278 8.60872 5.02334 8.0156C5.03902 7.83216 5.06254 7.64928 5.09394 7.4676C5.3113 6.2096 5.90586 5.00496 6.88042 4.03232C9.38762 1.53015 13.4525 1.53015 15.9597 4.03232Z"
                        fill="currentColor"
                    />
                    <path
                        d="M8.71676 18.9562L12.4179 9.97999C13.034 8.48591 11.5371 6.99207 10.04 7.60687L1.04589 11.3006C-0.504133 11.9372 -0.277153 14.1955 1.36867 14.5122L4.83128 15.1783L5.4988 18.6341C5.81608 20.2766 8.07892 20.5031 8.71676 18.9562Z"
                        fill="currentColor"
                    />
                    <path
                        d="M8.20963 5.35903C7.78787 5.77995 7.78787 6.46243 8.20963 6.88335C8.63143 7.30427 9.31523 7.30427 9.73699 6.88335C10.6664 5.95575 12.1734 5.95575 13.1028 6.88335C14.0323 7.81091 14.0323 9.31487 13.1028 10.2424C12.6811 10.6634 12.6811 11.3458 13.1028 11.7667C13.5246 12.1877 14.2084 12.1877 14.6302 11.7667C16.4032 9.99731 16.4032 7.12847 14.6302 5.35903C12.8572 3.58959 9.98263 3.58959 8.20963 5.35903Z"
                        fill="currentColor"
                    />
                </g>
            </g>
            <defs>
                <clipPath id="clip0_5_69">
                    <rect width="20" height="20" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
};

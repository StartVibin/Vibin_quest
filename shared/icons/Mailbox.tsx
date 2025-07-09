import React from "react";

export const Mailbox = ({ ...props }) => {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {/* Envelope body */}
            <rect x="2" y="4" width="28" height="22" rx="5" fill="currentColor" />
            {/* Envelope flap - classic V shape */}
            <path d="M4 7L16 16L28 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}; 
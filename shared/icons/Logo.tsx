import React from "react";

export const Logo = ({ className = "", ...props }) => {
    return (
        <img
            src="/img/icon.svg"
            alt="Logo"
            className={className}
            {...props}
        />
    );
};
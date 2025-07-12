"use client";

import React from "react";

import styles from "./index.module.css";

type Props = {
    value: boolean;
    children: React.ReactNode;
};

const Modal: React.FC<Props> = ({ value, children }) => {
    if (!value) return;

    return (
        <div className={styles.modal}>
            <div className={styles.modalInner}>{children}</div>
        </div>
    );
};

export default Modal;

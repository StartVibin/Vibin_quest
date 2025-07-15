"use client";

import React from "react";

import styles from "./index.module.css";

import { Check, Logo } from "@/shared/icons";

type Props = {
    points: number;
    button: React.ReactNode;
    logo: React.ReactNode;
    description: string;
    done?: boolean;
};

const TaskItem: React.FC<Props> = ({ points, button, logo, description, done = false }) => {
    return (
        <div className={styles.mainTask}>
            {done && <div className={styles.mainTaskDone}>
                <Check />

                <p className={styles.mainTaskDoneText}>Done</p>
            </div>}

            <div className={styles.mainTaskWrap}>
                <div className={styles.mainTaskPoints}>
                    <Logo />
                    {points} Points
                </div>

                <div className={styles.mainTaskType}>{logo}</div>
            </div>

            {button}

            <p className={styles.mainTaskText}>{description}</p>
        </div>
    );
};

export default TaskItem;

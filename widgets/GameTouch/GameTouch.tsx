"use client";

import React from "react";
import cn from "classnames";

import styles from "./index.module.css";

import { Reload, Target } from "@/shared/icons";

const GameTouch = () => {
    const [readyToGame, setReadyToGame] = React.useState(true);
    const [started, setStarted] = React.useState(false);
    const [tries, setTries] = React.useState(5);
    const [timeLeft, setTimeLeft] = React.useState(0);
    const [clicks, setClicks] = React.useState(0);

    const circleClick = () => {
        if (tries < 1) return;

        if (!started) {
            setStarted(true);
            setTimeLeft(10);
            setClicks(0);
        }

        setClicks((prev) => prev + 1);
    };

    const restartHandler = () => {
        if (tries < 1) return;

        setClicks(0);
        setTries((prev) => prev - 1);
        setStarted(false);
        setReadyToGame(true);
    };

    React.useEffect(() => {
        if (started && timeLeft > 0) {
            const timerId = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);

            return () => clearTimeout(timerId);
        } else if (timeLeft === 0 && started) {
            setStarted(false);
            setTries((prev) => prev - 1);
            setReadyToGame(false);
        }
    }, [timeLeft, started]);

    return (
        <div className={styles.game}>
            <div className={styles.gameTopBar}>
                <p className={styles.gameName}>
                    <span>VN</span>Game
                </p>

                <p className={styles.gameTries}>
                    <span>{tries}</span> tries left
                </p>
            </div>

            <div className={styles.gameCircleInner}>
                <div className={styles.gameClicks}>
                    {!!clicks && <p>{clicks}</p>}
                    {clicks > 1 && <p>{clicks - 1}</p>}
                    {clicks > 2 && <p>{clicks - 2}</p>}
                    {clicks > 3 && <p>{clicks - 3}</p>}
                </div>

                {started && (
                    <div className={styles.gameTimer}>
                        0:{timeLeft >= 10 ? timeLeft : `0${timeLeft}`}
                    </div>
                )}

                <div
                    className={cn(styles.gameCircle, {
                        [styles.disabled]: !readyToGame || tries < 1,
                    })}
                >
                    <div
                        className={cn(styles.gameCircleSmall, {
                            [styles.active]: started,
                        })}
                        onClick={circleClick}
                    >
                        <Target />

                        <p>Tap Me</p>
                    </div>
                </div>
            </div>

            <button
                className={cn(styles.gameRestart, {
                    [styles.disabled]: tries < 1,
                })}
                onClick={restartHandler}
            >
                <Reload />
                Restart
            </button>
        </div>
    );
};

export default GameTouch;

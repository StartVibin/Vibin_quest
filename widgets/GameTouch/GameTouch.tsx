"use client";

import React from "react";
import cn from "classnames";
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import { checkCanPlayGame, recordGamePlay, sendGamePoints } from "@/lib/api";

import styles from "./index.module.css";

import { Reload, Target } from "@/shared/icons";

const GameTouch = () => {
    const { address, isConnected } = useAccount();
    const [readyToGame, setReadyToGame] = React.useState(true);
    const [started, setStarted] = React.useState(false);
    const [tries, setTries] = React.useState(5);
    const [timeLeft, setTimeLeft] = React.useState(0);
    const [clicks, setClicks] = React.useState(0);
    const [canPlayToday, setCanPlayToday] = React.useState(true);
    const [dailyGamesPlayed, setDailyGamesPlayed] = React.useState(0);
    const [gamesRemaining, setGamesRemaining] = React.useState(5);

    // Check if user can play when component mounts or wallet connects
    React.useEffect(() => {
        if (isConnected && address) {
            checkUserCanPlay();
        }
    }, [isConnected, address]);

    const checkUserCanPlay = async () => {
        if (!address) return;
        
        try {
            const response = await checkCanPlayGame(address);
            if (response.success) {
                setCanPlayToday(response.data.canPlay);
                setDailyGamesPlayed(response.data.dailyGamesPlayed);
                setGamesRemaining(response.data.gamesRemaining);
            }
        } catch (error) {
            console.error('Error checking if user can play:', error);
        }
    };

    const recordGameStart = async () => {
        if (!address) return;
        
        try {
            const response = await recordGamePlay(address);
            if (response.success) {
                setDailyGamesPlayed(response.data.dailyGamesPlayed);
                setGamesRemaining(response.data.gamesRemaining);
                return true;
            }
        } catch (error) {
            console.error('Error recording game play:', error);
            if (error instanceof Error && error.message.includes('Daily game limit reached')) {
                toast.error('Daily game limit reached. You can play 5 games per day.');
                setCanPlayToday(false);
            }
            return false;
        }
        return false;
    };

    const circleClick = async () => {
        if (tries < 1) return;

        if (!started) {
            // Check if user can play today
            if (!canPlayToday) {
                toast.error('Daily game limit reached. You can play 5 games per day.');
                return;
            }

            // Record the game play
            const recorded = await recordGameStart();
            if (!recorded) {
                return;
            }

            setStarted(true);
            setTimeLeft(10);
            setClicks(0);
        }

        setClicks((prev) => prev + 1);
    };

    const restartHandler = () => {
        if (tries < 1) return;

        setClicks(0);
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
            
            // Send game points to backend when game finishes
            if (address && clicks > 0) {
                sendGamePointsToBackend(clicks);
            }
        }
    }, [timeLeft, started, address]);

    const sendGamePointsToBackend = async (finalClicks: number) => {
        if (!address) return;
        
        try {
            const response = await sendGamePoints(address, finalClicks);
            if (response.success) {
                toast.success(`Game finished! You earned ${finalClicks} points!`);
            } else {
                toast.error('Failed to save game points');
            }
        } catch (error) {
            console.error('Error sending game points:', error);
            toast.error('Failed to save game points');
        }
    };

    // Show daily limit info
    const renderDailyLimitInfo = () => {
        if (!isConnected) return null;
        
        return (
            <div style={{ 
                textAlign: 'center', 
                marginBottom: '10px',
                fontSize: '12px',
                color: canPlayToday ? '#10B981' : '#EF4444'
            }}>
                {canPlayToday 
                    ? `${gamesRemaining} games remaining today`
                    : 'Daily limit reached - come back tomorrow!'
                }
            </div>
        );
    };

    return (
        <div className={styles.game}>
            <div className={styles.gameTopBar}>
                <p className={styles.gameName}>
                    <span>VN</span>Game
                </p>

                <p className={styles.gameTries}>
                    <span>{gamesRemaining}</span> tries left
                </p>
            </div>

            {/* {renderDailyLimitInfo()} */}

            <div className={styles.gameCircleInner}>
                <div className={styles.gameClicks}>
                    {!!clicks && <span>{clicks}</span>}
                    {clicks > 1 && <span>{clicks - 1}</span>}
                    {clicks > 2 && <span>{clicks - 2}</span>}
                    {clicks > 3 && <span>{clicks - 3}</span>}
                </div>

                {started && (
                    <div className={styles.gameTimer}>
                        0:{timeLeft >= 10 ? timeLeft : `0${timeLeft}`}
                    </div>
                )}

                <div
                    className={cn(styles.gameCircle, {
                        [styles.disabled]: !readyToGame || tries < 1 || !canPlayToday,
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
                    [styles.disabled]: tries < 1 || started || !canPlayToday,
                })}
                onClick={restartHandler}
                disabled={tries < 1 || started || !canPlayToday}
            >
                <Reload />
                Restart
            </button>
        </div>
    );
};

export default GameTouch;

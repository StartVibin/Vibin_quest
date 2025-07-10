"use client";

import Image from "next/image";
import cn from "classnames";
import { useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';

import styles from "./page.module.css";
import base from "@/shared/styles/base.module.css";

import {
    ArrowRightTop,
    Link as LinkIcon,
    Logo,
    Target,
    Telegram,
    Twitter,
} from "@/shared/icons";
import { TaskItem } from "@/shared/ui/TaskItem";
import { GameTouch } from "@/widgets/GameTouch";
import { handleXConnect, handleXFollow, handleXRepost, handleXReply, handleXPost, checkXActionStatus, showWalletWarning } from "@/lib/utils";
import { Mailbox } from "@/shared/icons/Mailbox";
import TelegramLoginButton from "@/components/TelegramLoginButton";

export default function Home() {
    const { address, isConnected } = useAccount();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // setIsXConnected(localStorage.getItem('x_verified') === 'true'); // REMOVE THIS LINE
        }
    }, []);

    const handleTelegramSuccess = useCallback(() => {
        // Handle successful Telegram connection
        console.log("Telegram connected successfully");
        console.log("You can now check the browser console and server logs for the full authentication data");
        toast.success("Telegram connected successfully!");
    }, []);

    // Wallet connection check for X tasks
    const handleXConnectWithWallet = () => {
        if (!isConnected) {
            showWalletWarning(toast);
            return;
        }
        handleXConnect(toast);
    };

    const handleXFollowWithWallet = (username: string) => {
        if (!isConnected) {
            showWalletWarning(toast);
            return;
        }
        handleXFollow(username, toast, address);
    };

    const handleXReplyWithWallet = (tweetId: string) => {
        if (!isConnected) {
            showWalletWarning(toast);
            return;
        }
        handleXReply(tweetId, toast, address);
    };

    const handleXRepostWithWallet = (tweetId: string) => {
        if (!isConnected) {
            showWalletWarning(toast);
            return;
        }
        handleXRepost(tweetId, toast, address);
    };

    return (
        <div className={styles.main}>
            <div className={base.container}>
                <div className={styles.mainInner}>
                    <div className={styles.mainContent}>
                        <div className={styles.mainBanner}>
                            <Image
                                src="/img/wave.png"
                                alt="bg"
                                fill
                                className={styles.mainBannerImg}
                            />

                            <div className={styles.mainBannerTextInner}>
                                <p className={styles.mainBannerTitle}>
                                    Participate in Vibin' Quests
                                </p>

                                <p className={styles.mainBannerText}>
                                    Engage, Share & Earn Points
                                </p>
                            </div>
                        </div>

                        <GameTouch />

                        <TaskItem
                            points={100}
                            logo={<Twitter />}
                            button={
                                <button
                                    className={styles.mainTaskButton}
                                    onClick={handleXConnectWithWallet}
                                >
                                    Connect
                                </button>
                            }
                            description="Connect your X to Vibin app to get points."
                            done={checkXActionStatus('connect')}
                        />

                        <TaskItem
                            points={100}
                            logo={<Telegram />}
                            button={
                                <TelegramLoginButton
                                    className={styles.mainTaskButton}
                                    onSuccess={handleTelegramSuccess}
                                />
                            }
                            description="Connect your Telegram to Vibin app to get points."
                        />

                        <TaskItem
                            points={100}
                            logo={<Mailbox />}
                            button={
                                <button className={styles.mainTaskButton}>
                                    Connect
                                </button>
                            }
                            description="Connect your email to the Vibin app to get points."
                        />

                        <TaskItem
                            points={200}
                            logo={<Twitter />}
                            button={
                                <button
                                    className={styles.mainTaskButton}
                                    onClick={() => handleXFollowWithWallet('StartVibin')}
                                >
                                    {checkXActionStatus('follow') ? 'Followed' : 'Follow'}
                                </button>
                            }
                            description="Follow us on X to get points"
                            done={checkXActionStatus('follow')}
                        />

                        <TaskItem
                            points={200}
                            logo={<Telegram />}
                            button={
                                <button className={styles.mainTaskButton}>
                                    Join Us
                                </button>
                            }
                            description="Connect your Telegram to Vibin app to get points."
                        />

                        <TaskItem
                            points={300}
                            logo={<Twitter />}
                            button={
                                <button
                                    className={styles.mainTaskButton}
                                    onClick={() => handleXReplyWithWallet('1940467598610911339')}
                                >
                                    {checkXActionStatus('reply') ? 'Replied' : 'Reply'}
                                </button>
                            }
                            description="Reply to our tweets to get points"
                            done={checkXActionStatus('reply')}
                        />

                        <TaskItem
                            points={300}
                            logo={<Twitter />}
                            button={
                                <button
                                    className={styles.mainTaskButton}
                                    onClick={() => handleXRepostWithWallet('1940467598610911339')}
                                >
                                    {checkXActionStatus('repost') ? 'Reposted' : 'Repost'}
                                </button>
                            }
                            description="Repost our content to get points"
                            done={checkXActionStatus('repost')}
                        />

                        {/* <TaskItem
                            points={100}
                            logo={<Twitter />}
                            button={
                                <button
                                    className={styles.mainTaskButton}
                                    onClick={() => handleXPost()}
                                >
                                    {checkXActionStatus('post') ? 'Posted' : 'Post'}
                                </button>
                            }
                            description="Make a post on X about Vibin (daily)"
                            done={checkXActionStatus('post')}
                        /> */}
                    </div>

                    <div className={styles.mainStatsInner}>
                        <div className={styles.inviteBlock}>
                            <Image
                                src="/img/invite-bg.png"
                                alt="bg"
                                className={styles.inviteBlockBg}
                                fill
                            />

                            <div className={styles.inviteTextInner}>
                                <p className={styles.inviteTitle}>
                                    Invite & Earn 500 Points!
                                </p>

                                <p className={styles.inviteText}>
                                    Invite your friends to join Vibin' and get 500 extra bonus points.
                                </p>

                                <button className={styles.inviteButton}>
                                    <LinkIcon />
                                    Invite a Friend
                                    <span>
                                        <ArrowRightTop />
                                    </span>
                                </button>
                            </div>

                            <div className={styles.inviteCircle}>
                                <Image src="/img/link.svg" alt="link" fill />
                            </div>
                        </div>

                        <div className={styles.statsBlock}>
                            <p className={styles.statsBlockTitle}>My Stats</p>

                            <div className={styles.statsBlockContent}>
                                <div className={styles.statsBlockItem}>
                                    <p className={styles.statsBlockItemTitle}>
                                        <Telegram />
                                        Social Points
                                    </p>

                                    <div
                                        className={styles.statsBlockItemPoints}
                                    >
                                        <Logo />
                                        100
                                    </div>
                                </div>

                                <div className={styles.statsBlockItem}>
                                    <p className={styles.statsBlockItemTitle}>
                                        <LinkIcon />
                                        Referal Points
                                    </p>

                                    <div
                                        className={styles.statsBlockItemPoints}
                                    >
                                        <Logo />
                                        100
                                    </div>
                                </div>

                                <div className={styles.statsBlockItem}>
                                    <p className={styles.statsBlockItemTitle}>
                                        <Target />
                                        Game Points
                                    </p>

                                    <div
                                        className={styles.statsBlockItemPoints}
                                    >
                                        <Logo />
                                        100
                                    </div>
                                </div>

                                <div
                                    className={cn(
                                        styles.statsBlockItem,
                                        styles.dark
                                    )}
                                >
                                    <p className={styles.statsBlockItemTitle}>
                                        Total Points
                                    </p>

                                    <div
                                        className={styles.statsBlockItemPoints}
                                    >
                                        <Logo />
                                        12K
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.ratingTable}>
                        <div className={styles.ratingTableHeader}>
                            <p
                                className={cn(
                                    styles.ratingTableTitle,
                                    styles.ratingTableRank
                                )}
                            >
                                Rank
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableTitle,
                                    styles.ratingTableWallet
                                )}
                            >
                                Wallet Adress
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableTitle,
                                    styles.ratingTablePoints
                                )}
                            >
                                Total points
                            </p>
                        </div>

                        <div className={styles.ratingTableItem}>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTableRank
                                )}
                            >
                                1
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTableWallet
                                )}
                            >
                                0xx125..13123
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTablePoints
                                )}
                            >
                                <Logo />
                                100 Points
                            </p>
                        </div>

                        <div className={styles.ratingTableItem}>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTableRank
                                )}
                            >
                                1
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTableWallet
                                )}
                            >
                                0xx125..13123
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTablePoints
                                )}
                            >
                                <Logo />
                                100 Points
                            </p>
                        </div>

                        <div className={styles.ratingTableItem}>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTableRank
                                )}
                            >
                                1
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTableWallet
                                )}
                            >
                                0xx125..13123
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTablePoints
                                )}
                            >
                                <Logo />
                                100 Points
                            </p>
                        </div>

                        <div className={styles.ratingTableItem}>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTableRank
                                )}
                            >
                                1
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTableWallet
                                )}
                            >
                                0xx125..13123
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTablePoints
                                )}
                            >
                                <Logo />
                                100 Points
                            </p>
                        </div>

                        <div className={styles.ratingTableItem}>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTableRank
                                )}
                            >
                                1
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTableWallet
                                )}
                            >
                                0xx125..13123
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTablePoints
                                )}
                            >
                                <Logo />
                                100 Points
                            </p>
                        </div>

                        <div className={styles.ratingTableItem}>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTableRank
                                )}
                            >
                                1
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTableWallet
                                )}
                            >
                                0xx125..13123
                            </p>
                            <p
                                className={cn(
                                    styles.ratingTableText,
                                    styles.ratingTablePoints
                                )}
                            >
                                <Logo />
                                100 Points
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

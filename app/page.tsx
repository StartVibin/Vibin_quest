"use client";

import Image from "next/image";
import cn from "classnames";
import { useEffect, useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

import styles from "./page.module.css";
import base from "@/shared/styles/base.module.css";

import {
  ArrowRightTop,
  Close,
  Blank,
  Link as LinkIcon,
  Logo,
  Peoples,
  Ticket,
  Target,
  Telegram,
  Twitter,
} from "@/shared/icons";
import { TaskItem } from "@/shared/ui/TaskItem";
import { GameTouch } from "@/widgets/GameTouch";
import {
  handleXConnect,
  handleXFollow,
  handleXRepost,
  handleXReply,
  checkXActionStatus,
  showWalletWarning,
} from "@/lib/utils";
import { Mailbox } from "@/shared/icons/Mailbox";
import CustomTelegramButton from "@/components/CustomTelegramButton";
import TelegramGroupJoinButton from "@/components/TelegramGroupJoinButton";
import GoogleOAuthButton from "@/components/GoogleOAuthButton";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useMemo } from "react";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { Modal } from "@/shared/ui/Modal";
import { getXPostId } from "@/lib/api";
import { ToastInstance } from "@/lib/types";
import ErrorLogger from "@/components/ErrorLogger";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { profile } = useUserProfile();
  const {
    leaderboardData,
    loading: leaderboardLoading,
    error: leaderboardError,
    refetch: refetchLeaderboard,
  } = useLeaderboard();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [accessModal, setAccessModal] = useState(true);
  const [xPostId, setXPostId] = useState<string>("");

  useEffect(() => {
    if (window && !window.localStorage.getItem("accessModal")) {
      setAccessModal(true);
    }
  }, []);

  // Handle referral code from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');
      
      if (referralCode && isConnected && address) {
        // Store the referral code for later use during registration
        sessionStorage.setItem('pendingReferralCode', referralCode);
        console.log('Referral code detected:', referralCode);
        
        // Clean up the URL without the ref parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('ref');
        window.history.replaceState({}, document.title, newUrl.toString());
        
        toast.info(`Referral code ${referralCode} detected! You'll get bonus points when you complete registration.`);
      }
    }
  }, [isConnected, address]);

  // Fetch X post ID from API
  useEffect(() => {
    const fetchXPostId = async () => {
      try {
        const response = await getXPostId();
        if (response.success && response.data) {
          setXPostId(response.data.xPostId);
          console.log("X Post ID fetched:", response.data.xPostId);
        }
      } catch (error) {
        console.error("Error fetching X post ID:", error);
      }
    };

    fetchXPostId();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // setIsXConnected(localStorage.getItem('x_verified') === 'true'); // REMOVE THIS LINE
    }
  }, []);

  const handleTelegramSuccess = useCallback(() => {
    // Handle successful Telegram connection
    console.log("Telegram connected successfully");
    console.log(
      "You can now check the browser console and server logs for the full authentication data"
    );
    toast.success("Telegram connected successfully!");
  }, []);

  const handleEmailSuccess = useCallback(() => {
    // Handle successful email connection
    console.log("Email connected successfully");
    console.log(
      "You can now check the browser console and server logs for the full authentication data"
    );
    toast.success("Email connected successfully!");
  }, []);

  // Memoize buttons to prevent flashing on profile updates
  const memoizedTelegramButton = useMemo(
    () => (
      <CustomTelegramButton
        className={styles.mainTaskButton}
        onSuccess={handleTelegramSuccess}
      />
    ),
    [handleTelegramSuccess]
  );

  const memoizedGoogleButton = useMemo(
    () => (
      <GoogleOAuthButton
        className={styles.mainTaskButton}
        onSuccess={handleEmailSuccess}
      />
    ),
    [handleEmailSuccess]
  );

  const memoizedTelegramGroupButton = useMemo(
    () => (
      <TelegramGroupJoinButton
        className={styles.mainTaskButton}
        onSuccess={handleTelegramSuccess}
        groupUsername="StartVibin"
        groupInviteLink="https://t.me/StartVibin"
      />
    ),
    [handleTelegramSuccess]
  );

  // Wallet connection check for X tasks
  const handleXConnectWithWallet = () => {
    if (!isConnected) {
      showWalletWarning(toast as ToastInstance);
      return;
    }
    handleXConnect(toast as ToastInstance);
  };

  const handleXFollowWithWallet = (username: string) => {
    if (!isConnected) {
      showWalletWarning(toast as ToastInstance);
      return;
    }
    handleXFollow(username, toast as ToastInstance, address);
  };

  const handleXReplyWithWallet = (tweetId: string) => {
    if (!isConnected) {
      showWalletWarning(toast as ToastInstance);
      return;
    }
    handleXReply(tweetId, toast as ToastInstance, address);
  };

  const handleXRepostWithWallet = (tweetId: string) => {
    if (!isConnected) {
      showWalletWarning(toast as ToastInstance);
      return;
    }
    handleXRepost(tweetId, toast as ToastInstance, address);
  };

  // const handleXPostWithWallet = () => {
  //     if (!isConnected) {
  //         showWalletWarning(toast);
  //         return;
  //     }
  //     handleXPost(toast, address);
  // };

  const generateInviteLink = () => {
    const originUrl = window.location.origin;
    const inviteCode = profile?.inviteCode || "DEFAULT";
    return `${originUrl}?ref=${inviteCode}`;
  };

  const copyInviteLink = async () => {
    try {
      const inviteLink = generateInviteLink();
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy invite link:", error);
      toast.error("Failed to copy invite link");
    }
  };

  // const handleInviteClick = () => {
  //     console.log('Invite button clicked');
  //     console.log('isConnected:', isConnected);
  //     if (!isConnected) {
  //         showWalletWarning(toast);
  //         return;
  //     }
  //     console.log('Setting modal to true');
  //     setShowInviteModal(true);
  // };

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
                  Participate in Vibin&apos; Quests
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
              done={profile?.xConnected || false}
            />

            <TaskItem
              points={100}
              logo={<Telegram />}
              button={memoizedTelegramButton}
              description="Connect your Telegram to Vibin app to get points."
              done={profile?.telegramConnected || false}
            />

            <TaskItem
              points={100}
              logo={<Mailbox />}
              button={memoizedGoogleButton}
              description="Connect your email to the Vibin app to get points."
              done={profile?.emailConnected || false}
            />

            <TaskItem
              points={200}
              logo={<Twitter />}
              button={
                <button
                  className={styles.mainTaskButton}
                  onClick={() => handleXFollowWithWallet("StartVibin")}
                >
                  {checkXActionStatus("follow") ? "Followed" : "Follow"}
                </button>
              }
              description="Follow us on X to get points"
              done={profile?.xFollowed || false}
            />

            <TaskItem
              points={200}
              logo={<Telegram />}
              button={memoizedTelegramGroupButton}
              description="Join our Telegram group to get points"
              done={profile?.telegramJoinedGroup || false}
            />

            <TaskItem
              points={300}
              logo={<Twitter />}
              button={
                                  <button
                    className={styles.mainTaskButton}
                    onClick={() => handleXReplyWithWallet(xPostId)}
                    disabled={!xPostId}
                  >
                    {checkXActionStatus("reply") ? "Replied" : "Reply"}
                  </button>
              }
              description="Reply to our tweets to get points"
              done={profile?.xReplied || false}
            />

            <TaskItem
              points={300}
              logo={<Twitter />}
              button={
                                  <button
                    className={styles.mainTaskButton}
                    onClick={() => handleXRepostWithWallet(xPostId)}
                    disabled={!xPostId}
                  >
                    {checkXActionStatus("repost") ? "Reposted" : "Repost"}
                  </button>
              }
              description="Repost our content to get points"
              done={profile?.xReposted || false}
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
                <p className={styles.inviteTitle}>Invite & Earn 500 Points!</p>

                <p className={styles.inviteText}>
                  Invite your friends to join Vibin&apos; and get 500 extra
                  bonus points.
                </p>

                <button
                  className={styles.inviteButton}
                  onClick={() => {
                    console.log("Invite button clicked");
                    console.log("isConnected:", isConnected);
                    setShowInviteModal(true);
                  }}
                >
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
                  <div className={styles.statsBlockItemTitle}>
                    <Telegram />
                    Social Points
                  </div>

                  <div className={styles.statsBlockItemPoints}>
                    <Logo />
                    {profile?.socialPoints}
                  </div>
                </div>

                <div className={styles.statsBlockItem}>
                  <div className={styles.statsBlockItemTitle}>
                    <LinkIcon />
                    Referal Points
                  </div>

                  <div className={styles.statsBlockItemPoints}>
                    <Logo />
                    {profile?.referralPoints}
                  </div>
                </div>

                <div className={styles.statsBlockItem}>
                  <div className={styles.statsBlockItemTitle}>
                    <Target />
                    Game Points
                  </div>

                  <div className={styles.statsBlockItemPoints}>
                    <Logo />
                    {profile?.gamePoints}
                  </div>
                </div>

                <div className={cn(styles.statsBlockItem, styles.dark)}>
                  <p className={styles.statsBlockItemTitle}>Total Points</p>

                  <div className={styles.statsBlockItemPoints}>
                    <Logo />
                    {profile?.totalPoints}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.ratingTable}>
            <div className={styles.ratingTableHeader}>
              <p
                className={cn(styles.ratingTableTitle, styles.ratingTableRank)}
              >
                Rank
              </p>
              <p
                className={cn(
                  styles.ratingTableTitle,
                  styles.ratingTableWallet
                )}
              >
                Wallet Address
              </p>
              <p
                className={cn(
                  styles.ratingTableTitle,
                  styles.ratingTablePoints
                )}
              >
                Total points
              </p>
              <p
                className={cn(
                  styles.ratingTableTitle,
                  styles.ratingTableAirdropped
                )}
              >
                Rewards
              </p>
            </div>

            {leaderboardLoading && !leaderboardData ? (
              // Loading state
              [...Array(6)].map((_, index) => (
                <div key={index} className={styles.ratingTableItem}>
                  <div
                    className={cn(
                      styles.ratingTableText,
                      styles.ratingTableRank
                    )}
                  >
                    <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                  </div>
                  <div
                    className={cn(
                      styles.ratingTableText,
                      styles.ratingTableWallet
                    )}
                  >
                    <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                  </div>
                  <div
                    className={cn(
                      styles.ratingTableText,
                      styles.ratingTablePoints
                    )}
                  >
                    <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                  </div>
                  <div
                    className={cn(
                      styles.ratingTableText,
                      styles.ratingTableAirdropped
                    )}
                  >
                    <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                  </div>
                </div>
              ))
            ) : leaderboardError ? (
              // Error state
              <div className="p-4 text-center">
                <p className="text-red-600 mb-2">Error loading leaderboard</p>
                <button
                  onClick={refetchLeaderboard}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Retry
                </button>
              </div>
            ) : leaderboardData && leaderboardData.users.length > 0 ? (
              // Real data
              leaderboardData.users.map((user, index) => (
                <div
                  key={user.walletAddress}
                  className={styles.ratingTableItem}
                >
                  <p
                    className={cn(
                      styles.ratingTableText,
                      styles.ratingTableRank
                    )}
                  >
                    {index + 1}
                  </p>
                  <p
                    className={cn(
                      styles.ratingTableText,
                      styles.ratingTableWallet
                    )}
                  >
                    {user.walletAddress.slice(0, 6)}...
                    {user.walletAddress.slice(-4)}
                  </p>
                  <div
                    className={cn(
                      styles.ratingTableText,
                      styles.ratingTablePoints
                    )}
                  >
                    <Logo />
                    {user.totalPoints.toLocaleString()} Points
                  </div>
                  <div
                    className={cn(
                      styles.ratingTableText,
                      styles.ratingTableAirdropped
                    )}
                  >
                    <>
                      <Logo />
                      {(user.airdroped || 0).toLocaleString()} Tokens
                    </>
                  </div>
                </div>
              ))
            ) : (
              // Empty state
              <div className="p-4 text-center">
                <p className="text-gray-500">No leaderboard data available</p>
              </div>
            )}

            {/* Auto-refresh indicator */}
            {leaderboardData && (
              <div className="mt-4 pt-2 border-t border-gray-200 text-center">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "100%",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Invite Friends
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "color 0.2s",
                }}
                onMouseOver={(e) =>
                  ((e.target as HTMLElement).style.color = "#4B5563")
                }
                onMouseOut={(e) =>
                  ((e.target as HTMLElement).style.color = "#9CA3AF")
                }
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6B7280",
                  marginBottom: "8px",
                  margin: "0 0 8px 0",
                }}
              >
                Share this link with your friends to earn 500 bonus points!
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px",
                  backgroundColor: "#F9FAFB",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <input
                  type="text"
                  value={generateInviteLink()}
                  readOnly
                  style={{
                    flex: 1,
                    background: "transparent",
                    fontSize: "14px",
                    color: "#374151",
                    outline: "none",
                    border: "none",
                    padding: 0,
                  }}
                />
                <button
                  onClick={copyInviteLink}
                  style={{
                    padding: "4px 12px",
                    backgroundColor: "#2563EB",
                    color: "white",
                    borderRadius: "6px",
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    ((e.target as HTMLElement).style.backgroundColor =
                      "#1D4ED8")
                  }
                  onMouseOut={(e) =>
                    ((e.target as HTMLElement).style.backgroundColor =
                      "#2563EB")
                  }
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setShowInviteModal(false)}
                style={{
                  padding: "8px 16px",
                  color: "#6B7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "6px",
                  fontSize: "14px",
                  transition: "color 0.2s",
                }}
                onMouseOver={(e) =>
                  ((e.target as HTMLElement).style.color = "#374151")
                }
                onMouseOut={(e) =>
                  ((e.target as HTMLElement).style.color = "#6B7280")
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {accessModal && (
        <Modal value={accessModal}>
          <div className={styles.accessModalContent}>
            <button
              className={styles.accessModalClose}
              onClick={() => {
                setAccessModal(false);
                window.localStorage.setItem("accessModal", "true");
              }}
            >
              <Close />
            </button>

            <div className={styles.accessModalWrap}>
              <div className={styles.accessModalLinkIcon}>
                <Image src="/img/link.svg" alt="link" fill />
              </div>

              <p className={styles.accessModalTitle}>Exclusive Access Only</p>

              <p className={styles.accessModalText}>
                To join the Vibin&rsquo; Network, you&rsquo;ll need an
                invitation code; no code, no entry.
              </p>
            </div>

            <div className={styles.accessModalPoints}>
              <div className={styles.accessModalPoint}>
                <div className={styles.accessModalPointIcon}>
                  <Ticket />
                </div>

                <p className={styles.accessModalPointText}>
                  Only 100 invite codes will be released at launch.
                </p>
              </div>

              <div className={styles.accessModalPoint}>
                <div className={styles.accessModalPointIcon}>
                  <Peoples />
                </div>

                <p className={styles.accessModalPointText}>
                  After that, new members can join only through referrals from
                  the initial 100 users.
                </p>
              </div>

              <div className={styles.accessModalPoint}>
                <div className={styles.accessModalPointIcon}>
                  <Blank />
                </div>

                <p className={styles.accessModalPointText}>
                  Think of it as a whitelist.
                </p>
              </div>
            </div>

            <p className={styles.accessModalSubtext}>
              Once they&rsquo;re gone, the only way in is through someone who
              already got one.
            </p>

            <button className={styles.accessModalLink}>
              Be one of the first. Start the ripple.
            </button>
          </div>
        </Modal>
      )}
      
      <ErrorLogger />
    </div>
  );
}

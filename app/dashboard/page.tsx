"use client";

import React from "react";
import cn from "classnames";

import styles from "./page.module.css";
import base from "@/shared/styles/base.module.css";

import {
  Close,
  Group,
  Headphone,
  History,
  Info,
  Link2,
  Logo2,
  Mask,
  Note,
  Play,
  Share,
  Share2,
  Star,
 
  Trophy,
  User,
  Volume,
} from "@/shared/icons";
import Image from "next/image";
import { Modal } from "@/shared/ui/Modal";
import { useToast } from "@/lib/hooks/useToast";
import { useSpotifyData } from "@/lib/hooks/useSpotifyData";
import { handleXConnect, postXStats } from "@/lib/utils";
import { claimWithContract } from "@/lib/api/claimWithContract";
import { useAccount, useWalletClient } from "wagmi";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { ToastInstance } from "@/lib/types";
import { usePointsWithInterval } from "@/lib/hooks/usePoints";

// Custom hook to convert wagmi wallet client to ethers signer
function useEthersSigner() {
  const { data: walletClient } = useWalletClient();

  return React.useMemo(() => {
    if (!walletClient) return null;

    const provider = new BrowserProvider(walletClient.transport);
    return provider.getSigner();
  }, [walletClient]);
}

function formatMsToHrMin(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) {
    return `${hours}hr ${minutes}min`;
  }
  return `${minutes}min`;
}

export default  function Home() {
  const [email, setEmail] = React.useState<string>('example@gmail.com');
  const [inviteCode, setInviteCode] = React.useState<string>('');
  
  // Move localStorage access to useEffect to avoid SSR issues
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('spotify_email') || 'example@gmail.com';
      const storedInviteCode = localStorage.getItem('spotify_id') || '';
      setEmail(storedEmail);
      setInviteCode(storedInviteCode);
    }
  }, []);

  const { data: pointsData, } = usePointsWithInterval(
    email !== 'example@gmail.com' ? email : '', 
    email !== 'example@gmail.com'
  );
 // console.log("Points data:::::::::::::::::::::::::::::::::::::::::::::::::", pointsData);
  const [shareModal, setShareModal] = React.useState(false);
  const [claimModal, setClaimModal] = React.useState(false);
  const [isClaiming, setIsClaiming] = React.useState(false);
  const toast = useToast();
  
  const { data, isLoading, error } = useSpotifyData(inviteCode);
  console.log("Spotify artists data:::::::::::::::::::::::::::::::::::::::::::::::::", data?.topArtists);
  console.log("Spotify tracks data:::::::::::::::::::::::::::::::::::::::::::::::::", data?.topTracks);
  const { address } = useAccount();
  const signer = useEthersSigner();
  const [ethersSigner, setEthersSigner] = React.useState<JsonRpcSigner | null>(
    null
  );
  React.useEffect(() => {
    if (signer) {
      signer.then(setEthersSigner).catch(console.error);
    } else {
      setEthersSigner(null);
    }
  }, [signer]);

  console.log("Spotify data:", data);
  console.log("Invite code:", inviteCode);
  console.log("Loading:", isLoading);
  console.log("Error:", error);
  
  // const handleManualRefetch = () => {
  //   console.log(`[${new Date().toISOString()}] Manual refetch triggered`);
  //   refetch();
  // };

  const handleXConnectWithWallet = () => {
    handleXConnect(toast as ToastInstance);
    // Add your X connection logic here
  };
  const handleNavigateToDoc = () => {
    if (typeof window !== 'undefined') {
      window.open("https://docs.startvibin.io/claiming", "_blank");
    }
  };
  // const handleClaimReward = () => {
  //   toast.success("Reward claimed successfully!");
  //   // Add your claim logic here
  // };


  return (
    <>
      <div className={styles.dashboard}>
        <div className={base.container}>
          <div className={styles.dashboardInner}>
            <div className={styles.dashboardOverlay}>
              <div className={styles.dashboardTitleInner}>
                <p className={styles.dashboardTitle}>You Vibed. You Earned.</p>

                <p className={styles.dashboardText}>Own Your Music Data.</p>
              </div>

              <div className={styles.dashboardScreens}>
                <Image
                  src="/img/claim-bg.png"
                  alt="bg"
                  fill
                  className={styles.dashboardScreenBg}
                />

                <div className={styles.dashboardScreenTop}>
                  <div className={styles.dashboardScreenClaim}>
                    

                    <div className={styles.dashboardScreenClaimTextBlock}>
                      
                    </div>
                  </div>
                  <div className={styles.shareBlock}>
                    <button
                      className={styles.dashboardScreenTopShare}
                      onClick={handleXConnectWithWallet}
                    >
                      Connect X
                    </button>
                    <button
                      className={styles.dashboardScreenTopShare}
                      onClick={() => setShareModal(true)}
                    >
                      <Share />
                      Share Insights
                    </button>
                    
                    {/* Test button for Spotify data refetch */}
                    {/* <button
                      className={styles.dashboardScreenTopShare}
                      onClick={handleManualRefetch}
                      style={{ backgroundColor: '#1DB954', color: 'white' }}
                    >
                      🔄 Test Refetch
                    </button> */}
                  </div>
                </div>

                <div className={styles.dashboardScreenReward}>
                  <div className={styles.dashboardScreenRewardWrap}>
                    <p className={styles.dashboardScreenRewardText}>
                      Contribution Reward:
                    </p>

                    <div className={styles.dashboardScreenRewardValue}>
                      123.02
                      <Logo2 />
                    </div>
                  </div>

                  <div className={styles.dashboardScreenRewardClaim}>
                    <button
                      className={styles.dashboardScreenRewardClaimButton}
                      disabled={!ethersSigner || !address || isClaiming}
                      onClick={async () => {
                        try {
                          if (!ethersSigner || !address) {
                            toast.error("Please connect your wallet first");
                            return;
                          }
                          
                          setIsClaiming(true);
                          
                          const result = await claimWithContract(
                            address,
                            process.env.NEXT_PUBLIC_CLAIM_CONTRACT!,
                            ethersSigner,
                            email
                          );
                          
                          // The toast messages are already handled in claimWithContract
                          // but we can add additional UI feedback here if needed
                          if (result?.success) {
                            console.log("Claim successful:", result.txHash);
                            // You could update UI state here, like disabling the button
                          } else {
                            console.log("Claim failed:", result?.error);
                            // You could show additional error UI here
                          }
                        } catch (error) {
                          console.error("Claim error:", error);
                          // Error toast is already shown in claimWithContract
                        } finally {
                          setIsClaiming(false);
                        }
                      }}
                    >
                      {!ethersSigner || !address 
                        ? "Connect Wallet" 
                        : isClaiming 
                          ? "Claiming..." 
                          : "Claim reward"
                      }
                    </button>

                    <button
                      className={styles.dashboardScreenRewardClaimInfo}
                      onClick={() => handleNavigateToDoc()}
                    >
                      Eligibility to Claim
                      <Info />
                    </button>
                  </div>

                  <div className={styles.dashboardScreenLvlInner}>
                    <div className={styles.dashboardScreenLvl}>
                      <p className={styles.dashboardScreenLvlText}>your LVL:</p>

                      <p className={styles.dashboardScreenLvlValue}>23</p>

                      <div className={styles.dashboardScreenLvlChart}>
                        <div
                          className={styles.dashboardScreenLvlChartProgress}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.dashboardTables}>
              <div
                className={cn(
                  styles.dashboardTable,
                  styles.dashboardTableBlock
                )}
              >
                <Image
                  src="/img/track-bg.png"
                  alt="bg"
                  fill
                  className={styles.dashboardTableBlockBg}
                />

                <div className={styles.statsBlockTitle}>
                  <span>
                    <Note />
                  </span>
                  Top Tracks
                </div>

                <div className={styles.dashboardTableItems}>
                  {/* <div className={styles.dashboardTableItem}>
                    <div className={styles.dashboardTableItemWrap}>
                      <p className={styles.dashboardTableItemPlace}>#1</p>

                      <div className={styles.dashboardTableItemImg}></div>

                      <div className={styles.dashboardTableItemTextBlock}>
                        <p className={styles.dashboardTableItemTitle}>
                          Name of Song
                        </p>

                        <p className={styles.dashboardTableItemText}>
                          Artist name
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://google.com"
                      target="_blank"
                      className={styles.dashboardTableItemLink}
                    >
                      <Link2 />
                    </a>
                  </div>

                  <div className={styles.dashboardTableItem}>
                    <div className={styles.dashboardTableItemWrap}>
                      <p className={styles.dashboardTableItemPlace}>#2</p>

                      <div className={styles.dashboardTableItemImg}></div>

                      <div className={styles.dashboardTableItemTextBlock}>
                        <p className={styles.dashboardTableItemTitle}>
                          Name of Song
                        </p>

                        <p className={styles.dashboardTableItemText}>
                          Artist name
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://google.com"
                      target="_blank"
                      className={styles.dashboardTableItemLink}
                    >
                      <Link2 />
                    </a>
                  </div>

                  <div className={styles.dashboardTableItem}>
                    <div className={styles.dashboardTableItemWrap}>
                      <p className={styles.dashboardTableItemPlace}>#3</p>

                      <div className={styles.dashboardTableItemImg}></div>

                      <div className={styles.dashboardTableItemTextBlock}>
                        <p className={styles.dashboardTableItemTitle}>
                          Name of Song
                        </p>

                        <p className={styles.dashboardTableItemText}>
                          Artist name
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://google.com"
                      target="_blank"
                      className={styles.dashboardTableItemLink}
                    >
                      <Link2 />
                    </a>
                  </div>

                  <div className={styles.dashboardTableItem}>
                    <div className={styles.dashboardTableItemWrap}>
                      <p className={styles.dashboardTableItemPlace}>#4</p>

                      <div className={styles.dashboardTableItemImg}></div>

                      <div className={styles.dashboardTableItemTextBlock}>
                        <p className={styles.dashboardTableItemTitle}>
                          Name of Song
                        </p>

                        <p className={styles.dashboardTableItemText}>
                          Artist name
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://google.com"
                      target="_blank"
                      className={styles.dashboardTableItemLink}
                    >
                      <Link2 />
                    </a>
                  </div>

                  <div className={styles.dashboardTableItem}>
                    <div className={styles.dashboardTableItemWrap}>
                      <p className={styles.dashboardTableItemPlace}>#5</p>

                      <div className={styles.dashboardTableItemImg}></div>

                      <div className={styles.dashboardTableItemTextBlock}>
                        <p className={styles.dashboardTableItemTitle}>
                          Name of Song
                        </p>

                        <p className={styles.dashboardTableItemText}>
                          Artist name
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://google.com"
                      target="_blank"
                      className={styles.dashboardTableItemLink}
                    >
                      <Link2 />
                    </a>
                  </div> */}
                  {data?.topTracks.map((track, index) => (
                    <div className={styles.dashboardTableItem} key={index}>
                      <div className={styles.dashboardTableItemWrap}>
                        <p className={styles.dashboardTableItemPlace}>
                          #{index + 1}
                        </p>
                        <div className={styles.dashboardTableItemImg}>
                          {track?.album?.images ? (
                            <Image 
                              src={track.album.images[0].url} 
                              alt={track?.name || 'Track image'} 
                              width={40} 
                              height={40}
                              style={{ borderRadius: '4px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              backgroundColor: '#333', 
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '12px'
                            }}>
                              🎵
                            </div>
                          )}
                        </div>

                        <div className={styles.dashboardTableItemTextBlock}>
                          <p className={styles.dashboardTableItemTitle}>
                            {track?.name}
                          </p>

                          <p className={styles.dashboardTableItemText}>
                            {track.artist}
                          </p>
                        </div>
                      </div>
                      <a
                        href="https://google.com"
                        target="_blank"
                        className={styles.dashboardTableItemLink}
                      >
                        <Link2 />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  styles.dashboardTable,
                  styles.dashboardTableBlock
                )}
              >
                <Image
                  src="/img/artist-bg.png"
                  alt="bg"
                  fill
                  className={styles.dashboardTableBlockBg}
                />

                <div className={styles.statsBlockTitle}>
                  <span>
                    <Play />
                  </span>
                  Top Artist
                </div>

                <div className={styles.dashboardTableItems}>
                  {/* <div className={styles.dashboardTableItem}>
                    <div className={styles.dashboardTableItemWrap}>
                      <p className={styles.dashboardTableItemPlace}>#1</p>

                      <div className={styles.dashboardTableItemImg}></div>

                      <div className={styles.dashboardTableItemTextBlock}>
                        <p className={styles.dashboardTableItemTitle}>
                          Artist name
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://google.com"
                      target="_blank"
                      className={styles.dashboardTableItemLink}
                    >
                      <Link2 />
                    </a>
                  </div>

                  <div className={styles.dashboardTableItem}>
                    <div className={styles.dashboardTableItemWrap}>
                      <p className={styles.dashboardTableItemPlace}>#2</p>

                      <div className={styles.dashboardTableItemImg}></div>

                      <div className={styles.dashboardTableItemTextBlock}>
                        <p className={styles.dashboardTableItemTitle}>
                          Artist name
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://google.com"
                      target="_blank"
                      className={styles.dashboardTableItemLink}
                    >
                      <Link2 />
                    </a>
                  </div>

                  <div className={styles.dashboardTableItem}>
                    <div className={styles.dashboardTableItemWrap}>
                      <p className={styles.dashboardTableItemPlace}>#3</p>

                      <div className={styles.dashboardTableItemImg}></div>

                      <div className={styles.dashboardTableItemTextBlock}>
                        <p className={styles.dashboardTableItemTitle}>
                          Artist name
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://google.com"
                      target="_blank"
                      className={styles.dashboardTableItemLink}
                    >
                      <Link2 />
                    </a>
                  </div>

                  <div className={styles.dashboardTableItem}>
                    <div className={styles.dashboardTableItemWrap}>
                      <p className={styles.dashboardTableItemPlace}>#4</p>

                      <div className={styles.dashboardTableItemImg}></div>

                      <div className={styles.dashboardTableItemTextBlock}>
                        <p className={styles.dashboardTableItemTitle}>
                          Artist name
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://google.com"
                      target="_blank"
                      className={styles.dashboardTableItemLink}
                    >
                      <Link2 />
                    </a>
                  </div>

                  <div className={styles.dashboardTableItem}>
                    <div className={styles.dashboardTableItemWrap}>
                      <p className={styles.dashboardTableItemPlace}>#5</p>

                      <div className={styles.dashboardTableItemImg}></div>

                      <div className={styles.dashboardTableItemTextBlock}>
                        <p className={styles.dashboardTableItemTitle}>
                          Artist name
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://google.com"
                      target="_blank"
                      className={styles.dashboardTableItemLink}
                    >
                      <Link2 />
                    </a>
                  </div> */}

                  {data?.topArtists.map((artist, index) => (
                    <div className={styles.dashboardTableItem} key={index}>
                      <div className={styles.dashboardTableItemWrap}>
                        <p className={styles.dashboardTableItemPlace}>
                          #{index + 1}
                        </p>
                        <div className={styles.dashboardTableItemImg}>
                          {artist?.images ? (
                            <Image 
                              src={artist.images[0].url} 
                              alt={artist?.name || 'Artist image'} 
                              width={40} 
                              height={40}
                              style={{ borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              backgroundColor: '#333', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '12px'
                            }}>
                               👤
                             </div>
                           )}
                         </div>

                         <div className={styles.dashboardTableItemTextBlock}>
                           <p className={styles.dashboardTableItemTitle}>
                             {artist?.name}
                           </p>
                         </div>
                       </div>
                       <a
                         href="https://google.com"
                         target="_blank"
                         className={styles.dashboardTableItemLink}
                       >
                         <Link2 />
                       </a>
                     </div>
                   ))}
                </div>
              </div>

              <div
                className={cn(
                  styles.dashboardTable,
                  styles.dashboardTableScore
                )}
              >
                <div
                  className={cn(
                    styles.statsBlockTitle,
                    styles.dashboardTableScoreTitle
                  )}
                >
                  <span>
                    <Star />
                  </span>
                  Score Breakdown
                </div>

                <div className={styles.statsBlockWrap}>
                  <div className={styles.statsBlockElems}>
                    <div className={styles.statsBlockElem}>
                      <div className={styles.statsBlockElemWrap}>
                        <div className={styles.statsBlockElemTitle}>
                          <Volume />
                          Volume Score
                        </div>

                        <p className={styles.statsBlockElemText}>
                         Scaled logarithmically
                        </p>
                      </div>

                      <p className={styles.statsBlockElemValue}>{pointsData?.volumeScore || 0}</p>
                    </div>

                    <div className={styles.statsBlockElem}>
                      <div className={styles.statsBlockElemWrap}>
                        <div className={styles.statsBlockElemTitle}>
                          <Group />
                          Diversity Score
                        </div>

                        <p className={styles.statsBlockElemText}>
                          Rewarded proportionally
                        </p>
                      </div>

                      <p className={styles.statsBlockElemValue}>{pointsData?.diversityScore || 0}</p>
                    </div>

                    <div className={styles.statsBlockElem}>
                      <div className={styles.statsBlockElemWrap}>
                        <div className={styles.statsBlockElemTitle}>
                          <History />
                          History Score
                        </div>

                        <p className={styles.statsBlockElemText}>
                          Rewarded with a multiplier
                        </p>
                      </div>

                      <p className={styles.statsBlockElemValue}>{pointsData?.historyScore || 0}</p>
                    </div>

                    <div className={styles.statsBlockElem}>
                      <div className={styles.statsBlockElemWrap}>
                        <div className={styles.statsBlockElemTitle}>
                          <Share2 />
                          Referal Score
                        </div>

                        <p className={styles.statsBlockElemText}>
                          Multiplier based on sync streaks
                        </p>
                      </div>

                      <p className={styles.statsBlockElemValue}>{pointsData?.referralScore || 0}</p>
                    </div>

                    <div className={styles.statsBlockElem}>
                      <div className={styles.statsBlockElemWrap}>
                        <div className={styles.statsBlockElemTitle}>
                          <Trophy />
                          Total Base Points
                        </div>
                      </div>

                      <p className={styles.statsBlockElemValue}>{pointsData?.totalBasePoints || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.statsBlock}>
              <div className={styles.statsBlockTitle}>
                <span>
                  <Play />
                </span>
                Your Listening Stats
              </div>

              <div className={styles.statsItems}>
                <div className={styles.statsItem}>
                  <Image
                    src="/img/stat1-bg.png"
                    alt="bg"
                    fill
                    className={styles.statsItemBg}
                  />

                  <div className={styles.statsItemIcon}>
                    <Note />
                  </div>

                  <p className={styles.statsItemValue}>
                    {data?.totalTracksPlayed || 0}
                  </p>

                  <p className={styles.statsItemText}>Tracks Played</p>
                </div>

                <div className={styles.statsItem}>
                  <Image
                    src="/img/stat2-bg.png"
                    alt="bg"
                    fill
                    className={styles.statsItemBg}
                  />

                  <div className={styles.statsItemIcon}>
                    <User />
                  </div>

                  <p className={styles.statsItemValue}>
                    {data?.uniqueArtistsCount || 0}
                  </p>

                  <p className={styles.statsItemText}>Unique Artists</p>
                </div>

                <div className={styles.statsItem}>
                  <Image
                    src="/img/stat3-bg.png"
                    alt="bg"
                    fill
                    className={styles.statsItemBg}
                  />

                  <div className={styles.statsItemIcon}>
                    <Headphone />
                  </div>

                  <p className={styles.statsItemValue}>
                    {formatMsToHrMin(data?.totalListeningTimeMs || 0)}
                  </p>

                  <p className={styles.statsItemText}>Listening Time</p>
                </div>

                <div className={styles.statsItem}>
                  <Image
                    src="/img/stat4-bg.png"
                    alt="bg"
                    fill
                    className={styles.statsItemBg}
                  />

                  <div className={styles.statsItemIcon}>
                    <Mask />
                  </div>

                  <p className={styles.statsItemValue}>
                    {data?.anonymousTrackCount || 0}
                  </p>

                  <p className={styles.statsItemText}>Tracks Played</p>
                </div>
              </div>
            </div>

            {/* <div className={styles.techBlock}>
              <p className={styles.techBlockTitle}>Technical Details</p>

              <div className={styles.techBlockInfo}>
                <div className={styles.techBlockItem}>
                  <p className={styles.techBlockItemText}>Contributor:</p>

                  <p className={styles.techBlockItemValue}>0xasf1da..3123</p>
                </div>

                <div className={styles.techBlockItem}>
                  <p className={styles.techBlockItemText}>Account Hash:</p>

                  <p className={styles.techBlockItemValue}>0xasf1da..3123</p>
                </div>

                <div className={styles.techBlockItem}>
                  <p className={styles.techBlockItemText}>Version:</p>

                  <p className={styles.techBlockItemValue}>1.1.1.1</p>
                </div>

                <div className={styles.techBlockItem}>
                  <p className={styles.techBlockItemText}>Data Source:</p>

                  <p className={styles.techBlockItemValue}>IPFS</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <Modal value={claimModal}>
        <div className={styles.claimModal}>
          <button
            onClick={() => setClaimModal(false)}
            className={styles.claimModalClose}
          >
            <Close />
          </button>

          <div className={styles.claimModalTextBlock}>
            <p className={styles.claimModalTitle}>Eligibility to Claim</p>

            <p className={styles.claimModalText}>
              This is dummy.
            </p>

            <p className={styles.claimModalText}>
              The passage is attributed to an unknown typesetter in the 15th
              century who is thought to have scrambled parts of Cicero&apos;s De
              Finibus Bonorum et Malorum for use in a type specimen book. It
              usually begins with:
            </p>
          </div>
        </div>
      </Modal>

      <Modal value={shareModal}>
        <div className={styles.shareModal}>
          <button
            onClick={() => setShareModal(false)}
            className={styles.claimModalClose}
          >
            <Close />
          </button>

          <div className={styles.shareModalContent}>
            <div className={styles.shareModalTitleInner}>
              <div className={styles.shareModalImg}>
                <Image src="/img/share.svg" alt="Share" fill />
              </div>

              <p className={styles.shareModalTitle}>Share Your Insights!</p>

              <p className={styles.shareModalText}>
                Proud Of Your musical taste? Share it
              </p>
            </div>

            <div className={styles.shareModalBanner}>
              <Image
                src="/img/banner-bg.png"
                alt="banner"
                fill
                className={styles.shareModalBannerBg}
              />

              <div className={styles.shareModalBannerTop}>
                <p className={styles.shareModalBannerTitle}>My Musical DNA</p>

                <div className={styles.shareModalBannerLogo}>
                  <Logo2 />
                  Vibin
                </div>
              </div>

              <div className={styles.shareModalBannerStats}>
                <div className={styles.shareModalBannerStatsWrap}>
                  <div className={styles.shareModalBannerStatsBlock}>
                    <p>My Spotify listening data</p>

                    <div className={styles.shareModalBannerStatsEarn}>
                      <p>Earned:</p>

                      <div className={styles.shareModalBannerStatsEarnValue}>
                        123.02
                        <Logo2 />
                      </div>
                    </div>
                  </div>

                  <div className={styles.shareModalBannerStatsItem}>
                    <div className={styles.shareModalBannerStatsItemIcon}>
                      <Headphone />
                    </div>

                    <p className={styles.shareModalBannerStatsItemTitle}>
                      Listening Time
                    </p>

                    <p className={styles.shareModalBannerStatsItemValue}>
                      {formatMsToHrMin(data?.totalListeningTimeMs || 0)}
                    </p>
                  </div>

                  <div className={styles.shareModalBannerStatsItem}>
                    <div className={styles.shareModalBannerStatsItemIcon}>
                      <Note />
                    </div>

                    <p className={styles.shareModalBannerStatsItemTitle}>
                      Discover
                    </p>

                    <p className={styles.shareModalBannerStatsItemValue}>
                      {data?.uniqueArtistsCount} artist
                    </p>
                  </div>
                </div>

                <div className={styles.shareModalBannerArtist}>
                  <p className={styles.shareModalBannerArtistText}>
                    Top Artist:
                  </p>

                  <div className={styles.shareModalBannerArtistItem}>
                    <div className={styles.shareModalBannerArtistItemImg}>
                      {data?.topArtists[0]?.images ? (
                        <Image 
                          src={data.topArtists[0].images[0].url} 
                          alt={data.topArtists[0]?.name || 'Artist 1'} 
                          width={35}
                          height={35}
                          style={{ objectFit: 'cover', borderRadius: '50%' }}
                        />
                      ) : (
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: '#333', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px'
                        }}>
                          👤
                        </div>
                      )}
                    </div>
                    <p className={styles.shareModalBannerArtistItemName}>
                      {data?.topArtists[0]?.name}
                    </p>
                  </div>

                  <div className={styles.shareModalBannerArtistItem}>
                    <div className={styles.shareModalBannerArtistItemImg}>
                      {data?.topArtists[1]?.images ? (
                        <Image 
                          src={data.topArtists[1].images[0].url} 
                          alt={data.topArtists[1]?.name || 'Artist 2'} 
                          width={35}
                          height={35}
                          style={{ objectFit: 'cover', borderRadius: '50%' }}
                        />
                      ) : (
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: '#333', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px'
                        }}>
                          👤
                        </div>
                      )}
                    </div>
                    <p className={styles.shareModalBannerArtistItemName}>
                      {data?.topArtists[1]?.name}
                    </p>
                  </div>

                  <div className={styles.shareModalBannerArtistItem}>
                    <div className={styles.shareModalBannerArtistItemImg}>
                      {data?.topArtists[2]?.images ? (
                        <Image 
                          src={data.topArtists[2].images[0].url} 
                          alt={data.topArtists[2]?.name || 'Artist 3'} 
                          width={35}
                          height={35}
                          style={{ objectFit: 'cover', borderRadius: '50%' }}
                        />
                      ) : (
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: '#333', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px'
                        }}>
                          👤
                        </div>
                      )}
                    </div>
                    <p className={styles.shareModalBannerArtistItemName}>
                      {data?.topArtists[2]?.name}
                    </p>
                  </div>
                </div>

                <p className={styles.shareModalBannerStatsText}>vibin.io</p>
              </div>
            </div>

            <button
              className={styles.shareModalLink}
              onClick={() =>
                postXStats({
                  topTracks: data!.topTracks!,
                  totalListeningTimeMs: data!.totalListeningTimeMs!,
                  uniqueArtistsCount: data!.uniqueArtistsCount!,
                  topArtists: data!.topArtists!,
                })
              }
            >
              Share on X
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

"use client";

import React from "react";
import cn from "classnames";

import styles from "./page.module.css";
import base from "@/shared/styles/base.module.css";
import AuthGuard from "@/components/AuthGuard";
import { useClaimStatus } from "@/lib/hooks/useClaimStatus";

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
  Timer,
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
import { useUserDatabaseData } from '@/lib/hooks/useUserDatabaseData'

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

function DashboardContent() {
  const [shareModal, setShareModal] = React.useState(false);
  const toast = useToast();
  const { data, isLoading, error } = useSpotifyData()
  const { data: userData, isLoading: userDataLoading, error: userDataError } = useUserDatabaseData()
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

  // React.useEffect(() => {
  //   console.log('🎵 Dashboard - Spotify Data:', {
  //     data,
  //     isLoading,
  //     error,
  //     inviteCode,
  //     hasData: !!data,
  //     topTracksCount: data?.topTracks?.length || 0,
  //     totalTracksPlayed: data?.totalTracksPlayed,
  //     uniqueArtistsCount: data?.uniqueArtistsCount,
  //     totalListeningTimeMs: data?.totalListeningTimeMs
  //   });
  // }, [data, isLoading, error, inviteCode]);

  const handleXConnectWithWallet = () => {
    handleXConnect(toast as ToastInstance);
  };

  const { claimStatus, loading: claimStatusLoading} = useClaimStatus(
    typeof window !== 'undefined' ? localStorage.getItem('spotify_email') : null
  )
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
                <p className={styles.dashboardTitle}>You Vibed. You Earned</p>

                <p className={styles.dashboardText}>Own Your Music Data</p>
                
                {/* Data loading indicator */}
                {isLoading && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginTop: '10px',
                    fontSize: '14px',
                    color: '#1DB954'
                  }}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Loading Spotify data...
                  </div>
                )}
                
                {error && (
                  <div style={{ 
                    marginTop: '10px',
                    fontSize: '14px',
                    color: '#ff6b6b'
                  }}>
                    ⚠️ Error loading data. Your spotify token is expired.
                  </div>
                )}
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
                    <div className={styles.dashboardScreenClaimIcon}>
                      <Timer />
                    </div>

                    <div className={styles.dashboardScreenClaimTextBlock}>
                      <p>Next claim:</p>
                      {claimStatusLoading ? (
                        <p>Loading...</p>
                      ) : claimStatus ? (
                        claimStatus.canClaim ? (
                          <p style={{ color: '#10B981' }}>Ready to claim!</p>
                        ) : (
                          <p>-- -- -- --</p>
                        )
                      ) : (
                        <p>-- -- -- --</p>
                      )
                        // ) : (
                        //   <p>
                        //     0{claimStatus.daysUntilNextClaim} : {(claimStatus.hoursUntilNextClaim % 24) > 10 ? claimStatus.hoursUntilNextClaim % 24 : `0${claimStatus.hoursUntilNextClaim % 24}`} : {(claimStatus.minutesUntilNextClaim % 60) > 10 ? claimStatus.minutesUntilNextClaim % 60 : `0${claimStatus.minutesUntilNextClaim % 60}`} : {(claimStatus.secondsUntilNextClaim % 60) > 10 ? claimStatus.secondsUntilNextClaim % 60 : `0${claimStatus.secondsUntilNextClaim % 60}`}
                        //   </p>
                        // )
                        //  (
                        //   <p>--</p>
                        // )
                      }
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
                      {userDataLoading ? (
                        <span>Loading...</span>
                      ) : userDataError ? (
                        <span>Error loading data</span>
                      ) : (
                        <>
                          {userData?.totalBasePoints || 0} pts
                          <Logo2 />
                        </>
                      )}
                    </div>
                  </div>

                  <div className={styles.dashboardScreenRewardClaim}>
                    <button
                      className={styles.dashboardScreenRewardClaimButton}
                      onClick={() =>
                        claimStatus?.canClaim 
                          ? claimWithContract(
                              address,
                              process.env.NEXT_PUBLIC_CLAIM_CONTRACT!,
                              ethersSigner!
                            )
                          : toast.error('You can only claim once per week. Please wait until next claim time.')
                      }
                      disabled={true}
                      style={{ 
                        opacity: claimStatus?.canClaim ? 1 : 0.5,
                        cursor: claimStatus?.canClaim ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {claimStatus?.canClaim ? 'Claim reward' : 'Claim locked'}
                    </button>

                    <a
                      href="https://docs.startvibin.io/claiming"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.dashboardScreenRewardClaimInfo}
                    >
                      Eligibility to Claim
                      <Info />
                    </a>
                  </div>

                  <div className={styles.dashboardScreenLvlInner}>
                    <div className={styles.dashboardScreenLvl}>
                      <p className={styles.dashboardScreenLvlText}>your LVL:</p>

                      <p className={styles.dashboardScreenLvlValue}>
                        {isLoading ? (
                          <span>Loading...</span>
                        ) : error ? (
                          <span>--</span>
                        ) : (
                          data?.uniqueArtistsCount ? Math.floor(data.uniqueArtistsCount / 10) + 1 : 1
                        )}
                      </p>

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
                          {track.imageUrl ? (
                            <img 
                              src={track.imageUrl} 
                              alt={`${track.name} by ${track.artist}`}
                              width={34}
                              height={34}
                            />
                          ) : (
                            <div style={{ 
                              width: '100%', 
                              height: '100%', 
                              background: 'linear-gradient(to right, #000, #E28AFF)',
                              borderRadius: '50%'
                            }} />
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
                          {artist.imageUrl ? (
                            <img 
                              src={artist.imageUrl} 
                              alt={`${artist.name}`}
                              width={34}
                              height={34}
                            />
                          ) : (
                            <div style={{ 
                              width: '100%', 
                              height: '100%', 
                              background: 'linear-gradient(to right, #000, #E28AFF)',
                              borderRadius: '50%'
                            }} />
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
                          Quantity Score
                        </div>

                        <p className={styles.statsBlockElemText}>
                          Scaled logarithmically
                        </p>
                      </div>

                      <p className={styles.statsBlockElemValue}>
                        {userDataLoading ? '--' : userData?.tracksPlayedCount || 0}
                      </p>
                    </div>

                    <div className={styles.statsBlockElem}>
                      <div className={styles.statsBlockElemWrap}>
                        <div className={styles.statsBlockElemTitle}>
                          <Group />
                          Diversity Score
                        </div>

                        <p className={styles.statsBlockElemText}>
                          Rewarded propportionally
                        </p>
                      </div>

                      <p className={styles.statsBlockElemValue}>
                        {userDataLoading ? '--' : userData?.diversityScore || 0}
                      </p>
                    </div>

                    <div className={styles.statsBlockElem}>
                      <div className={styles.statsBlockElemWrap}>
                        <div className={styles.statsBlockElemTitle}>
                          <History />
                          History Score
                        </div>

                        <p className={styles.statsBlockElemText}>
                          Rewarded with a mulitplier
                        </p>
                      </div>

                      <p className={styles.statsBlockElemValue}>
                        {userDataLoading ? '--' : userData?.historyScore || 0}
                      </p>
                    </div>

                    <div className={styles.statsBlockElem}>
                      <div className={styles.statsBlockElemWrap}>
                        <div className={styles.statsBlockElemTitle}>
                          <Share2 />
                          Referral Score
                        </div>

                        <p className={styles.statsBlockElemText}>
                          Multipler based on sync streak
                        </p>
                      </div>

                      <p className={styles.statsBlockElemValue}>
                        {userDataLoading ? '--' : userData?.referralScore || 0}
                      </p>
                    </div>

                    <div className={styles.statsBlockElem}>
                      <div className={styles.statsBlockElemWrap}>
                        <div className={styles.statsBlockElemTitle}>
                          <Trophy />
                          Total Base Points
                        </div>
                      </div>

                      <p className={styles.statsBlockElemValue}>
                        {userDataLoading ? '--' : userData?.totalBasePoints || 0}
                      </p>
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
                    {data?.totalTracksPlayed}
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
                    {data?.uniqueArtistsCount}
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
                    {userDataLoading ? '--' : (() => {
                      // Option 2: Calculate days between first and last activity
                      if (userData?.createdAt && userData?.updatedAt) {
                        const createdDate = new Date(userData.createdAt);
                        const updatedDate = new Date(userData.updatedAt);
                        const diffTime = Math.abs(updatedDate.getTime() - createdDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays;
                      }
                      // Fallback: if no dates available, show 0
                      return 0;
                    })()}
                  </p>

                  <p className={styles.statsItemText}>Active Days</p>
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
                        {userDataLoading ? 'Loading...' : userData?.totalBasePoints ? `${userData.totalBasePoints} pts` : '0 pts'}
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
                    <div className={styles.shareModalBannerArtistItemImg}></div>

                    <p className={styles.shareModalBannerArtistItemName}>
                      {data?.topArtists[0]?.name}
                    </p>
                  </div>

                  <div className={styles.shareModalBannerArtistItem}>
                    <div className={styles.shareModalBannerArtistItemImg}></div>

                    <p className={styles.shareModalBannerArtistItemName}>
                      {data?.topArtists[1]?.name}
                    </p>
                  </div>

                  <div className={styles.shareModalBannerArtistItem}>
                    <div className={styles.shareModalBannerArtistItemImg}></div>

                    <p className={styles.shareModalBannerArtistItemName}>
                      {data?.topArtists[2]?.name}
                    </p>
                  </div>
                </div>

                <a    
                  href="https://startvibin.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shareModalBannerStatsText}
                  >startvibin.io</a>
              </div>
            </div>

            <button
              className={styles.shareModalLink}
              onClick={async () => {
                // Check if user has X connected by checking localStorage
                const hasXAccessToken = typeof window !== 'undefined' && localStorage.getItem('x_access_token');
                
                if (!hasXAccessToken) {
                  toast.error('Please connect your X account first to share your stats!');
                  return;
                }
                
                const result = await postXStats({
                  topTracks: data?.topTracks || [],
                  totalListeningTimeMs: data?.totalListeningTimeMs || 0,
                  uniqueArtistsCount: data?.uniqueArtistsCount || 0,
                  topArtists: data?.topArtists || [],
                });

                // Handle different response cases
                if (result?.alreadyShared) {
                  toast.info('Your update already shared on X! 🎉');
                } else if (result?.success) {
                  toast.success('Successfully shared your stats on X! 🎉');
                  
                  // Try to redirect to X to show the posted tweet
                  try {
                    // Get the tweet ID from the response if available
                    if (result.data?.id) {
                      const tweetUrl = `https://twitter.com/i/status/${result.data.id}`;
                      window.open(tweetUrl, '_blank');
                    } else {
                      // Fallback: open X profile to see recent tweets
                      const profileUrl = 'https://twitter.com/home';
                      window.open(profileUrl, '_blank');
                    }
                  } catch (redirectError) {
                    console.log('Could not redirect to X:', redirectError);
                  }
                } else if (result?.success === false) {
                  toast.error(`Failed to share on X: ${result.error || 'Unknown error'}`);
                } else {
                  toast.error('Failed to share on X. Please try again.');
                }
              }}
            >
              Share on X
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
export default function DashboardPage() {
  return (
    <AuthGuard requireFullAuth={true}>
      <DashboardContent />
    </AuthGuard>
  );
}


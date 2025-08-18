"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import Image from "next/image";
// import cn from "classnames";

import styles from "./page.module.css";
// import base from "@/shared/styles/base.module.css";

import {
  Close,
  Blank,
  Ticket,
  Peoples,
} from "@/shared/icons";
import LeftHalfModal from '@/components/LeftHalfModal';
import { verifyReferalCode } from '@/lib/api';
import { useSharedContext } from '@/provider/SharedContext';
import { Modal } from "@/shared/ui/Modal";

export default function Home() {
  const { sharedValue, setSharedValue } = useSharedContext();
  const { isConnected } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [validReferral, isValidReferral] = useState(false);
  const [accessModal, setAccessModal] = useState(true);
  const { invitationCode: inviteCode } = sharedValue;

  useEffect(() => {
    if (validReferral && !isConnected) {
      router.push('/join/spotify');
    }
  }, [validReferral, isConnected, router]);

  useEffect(() => {
    setSharedValue({ ...sharedValue, invitationCode: inviteCode, showWallet: false });
    
    if (inviteCode) {
      verifyReferalCode(inviteCode).then(e => isValidReferral(e.success));
    }

    // Show access modal on first visit
    if (window && !window.localStorage.getItem("accessModal")) {
      setAccessModal(true);
    }
  }, [inviteCode, sharedValue, setSharedValue]);

  const handleInvitationCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode?.trim()) {
      toast.error('Please enter an invitation code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyReferalCode(inviteCode);
      if (result.success) {
        toast.success("Valid invitation code.");
        localStorage.setItem('inviteCode', inviteCode);
        // Also store in cookies for middleware access
        document.cookie = `inviteCode=${inviteCode}; path=/; max-age=86400`; // 24 hours
        isValidReferral(true);
      } else {
        toast.error("Invalid invitation code. Please try again.");
        isValidReferral(false);
      }
    } catch (error) {
      console.error('Invitation code error:', error);
      toast.error('Invalid invitation code. Please try again.');
      isValidReferral(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.backgroundImage} />
      </div>

      <LeftHalfModal>
        <div className={styles.loginCard}>
          <div className={styles.logoSection}>
            <div className={styles.stepIndicator}>Step 1 / 4</div>
            <h1 className={styles.title}>Welcome to <br />the Vibin&apos; app.</h1>
            <p className={styles.subtitle}>
              Spotify doesn&apos;t pay you for your data. We do.
            </p>
            <p className={styles.subtitle}>
              Invitation code access only - Privacy protected
            </p>
          </div>

          <form onSubmit={handleInvitationCodeSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="invitationCode"
                  type="text"
                  value={inviteCode || ''}
                  onChange={(e) => setSharedValue({ ...sharedValue, invitationCode: e.target.value })}
                  placeholder="Enter your invitation code"
                  className={styles.input}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={styles.continueButton}
                  disabled={isLoading || !inviteCode?.trim()}
                >
                  {isLoading ? (
                    <div className={styles.loadingSpinner} />
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </LeftHalfModal>

      {/* Access Modal - Keep the popup from original main page */}
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

            <button
              className={styles.accessModalLink}
              onClick={() => {
                setAccessModal(false);
                window.localStorage.setItem("accessModal", "true");
              }}
            >
              Be one of the first. Start the ripple.
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ShareInsightsTooltip.module.css';

interface ShareInsightsTooltipProps {
  children: React.ReactNode;
  isVisible: boolean;
}

export const ShareInsightsTooltip: React.FC<ShareInsightsTooltipProps> = ({ 
  children, 
  isVisible 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [tooltipPosition, setTooltipPosition] = useState<'above' | 'below' | 'right' | 'left'>('above');

  useEffect(() => {
    if (isVisible && containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipHeight = 220; // More accurate tooltip height
      const tooltipWidth = 320; // More accurate tooltip width
      const spacing = 15;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const margin = 20; // Safe margin from viewport edges
      
      // Calculate center position of the button
      const buttonCenterX = containerRect.left + containerRect.width / 2;
      const buttonCenterY = containerRect.top + containerRect.height / 2;
      
      // Try positioning above the button first
      let top = containerRect.top - tooltipHeight - spacing;
      let left = buttonCenterX;
      let position: 'above' | 'below' | 'right' | 'left' = 'above';
      
      // Check if there's enough space above
      if (top < margin) {
        // Try positioning to the right
        const rightSpace = viewportWidth - containerRect.right;
        if (rightSpace > tooltipWidth + margin) {
          top = buttonCenterY - tooltipHeight / 2;
          left = containerRect.right + spacing;
          position = 'right';
        } else {
          // Try positioning to the left
          const leftSpace = containerRect.left;
          if (leftSpace > tooltipWidth + margin) {
            top = buttonCenterY - tooltipHeight / 2;
            left = containerRect.left - tooltipWidth - spacing;
            position = 'left';
          } else {
            // Last resort: below the button
            top = containerRect.bottom + spacing;
            left = buttonCenterX;
            position = 'below';
          }
        }
      }
      
      // Ensure tooltip doesn't go off screen horizontally
      if (position === 'above' || position === 'below') {
        if (left - tooltipWidth / 2 < margin) {
          left = tooltipWidth / 2 + margin;
        } else if (left + tooltipWidth / 2 > viewportWidth - margin) {
          left = viewportWidth - tooltipWidth / 2 - margin;
        }
      } else if (position === 'right' || position === 'left') {
        if (left < margin) {
          left = margin;
        } else if (left + tooltipWidth > viewportWidth - margin) {
          left = viewportWidth - tooltipWidth - margin;
        }
      }
      
      // Ensure tooltip doesn't go off screen vertically
      if (top < margin) {
        top = margin;
      } else if (top + tooltipHeight > viewportHeight - margin) {
        top = viewportHeight - tooltipHeight - margin;
      }
      
      setTooltipPosition(position);
      setPosition({ top, left });
    }
  }, [isVisible]);

  const tooltipElement = isVisible ? (
    <div 
      ref={tooltipRef}
      className={`${styles.tooltip} ${isVisible ? styles.tooltipVisible : ''} ${
        tooltipPosition === 'below' ? styles.tooltipBelow : 
        tooltipPosition === 'right' ? styles.tooltipRight : 
        tooltipPosition === 'left' ? styles.tooltipLeft : ''
      }`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: tooltipPosition === 'left' || tooltipPosition === 'right' ? 'none' : 'translateX(-50%)'
      }}
    >
      <div className={styles.tooltipContent}>
        <div className={styles.tooltipHeader}>
          <span className={styles.tooltipIcon}>🎁</span>
          <span className={styles.tooltipTitle}>Earn Rewards!</span>
        </div>
        <div className={styles.tooltipBody}>
          <p className={styles.tooltipText}>
            Share your Spotify insights on X and earn <strong>150 points</strong>!
          </p>
          <div className={styles.tooltipFeatures}>
            <div className={styles.tooltipFeature}>
              <span className={styles.featureIcon}>📊</span>
              <span>Share your music stats</span>
            </div>
            <div className={styles.tooltipFeature}>
              <span className={styles.featureIcon}>💰</span>
              <span>Earn 150 social points</span>
            </div>
            <div className={styles.tooltipFeature}>
              <span className={styles.featureIcon}>🚀</span>
              <span>Boost your leaderboard rank</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.tooltipArrow}></div>
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={styles.tooltipContainer}>
      {children}
      {typeof window !== 'undefined' && tooltipElement && createPortal(tooltipElement, document.body)}
    </div>
  );
};

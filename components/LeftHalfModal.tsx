import React from 'react';
import styles from './LeftHalfModal.module.css';

interface LeftHalfModalProps {
  children: React.ReactNode;
}

export default function LeftHalfModal({ children }: LeftHalfModalProps) {
  return (
    <div className={styles.leftHalfModal}>
      {children}
    </div>
  );
} 
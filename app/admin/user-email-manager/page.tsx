"use client";

import React from 'react';
import { UserEmailManager } from '@/components/UserEmailManager';

export default function UserEmailManagerPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <UserEmailManager />
    </div>
  );
}

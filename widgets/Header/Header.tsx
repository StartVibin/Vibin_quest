"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import cn from "classnames";

import styles from "./index.module.css";
import base from "@/shared/styles/base.module.css";

import {
  Dashboard,
  Logo2,
  Link as LinkIcon,
  Database,
  Target,
  Notify,
  Staking,
  Chart,
  Burn,
} from "@/shared/icons";

import WalletButton from "@/widgets/WalletButton";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Image
        src="/img/header-blur.png"
        alt="circles"
        fill
        className={styles.headerBlur}
      />

      <div className={base.container}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.headerLogo}>
            <Logo2 />
            Vibin&apos;
          </Link>

          <nav className={styles.headerNav}>
            <Link
              href="/dashboard"
              className={cn(styles.headerNavLink, {
                [styles.active]: pathname === "/dashboard",
              })}
            >
              <Dashboard />

              <span className={styles.headerNavLinkWrap}>
                <span className={styles.headerNavLinkText}>Dashboard</span>
              </span>
            </Link>

            {/* <Link
              href="/"
              className={cn(
                styles.headerNavLink,
                pathname === "/" && styles.active
              )}
            >
              <LinkIcon />
            </Link> */}

            <Link
              href="/staking"
              className={cn(styles.headerNavLink, {
                [styles.active]: pathname === "/staking",
              })}
            >
              <Staking />

              <span className={styles.headerNavLinkWrap}>
                <span className={styles.headerNavLinkText}>Staking</span>
              </span>
            </Link>

            <Link
              href="/referal"
              className={cn(styles.headerNavLink, {
                [styles.active]: pathname === "/referal",
              })}
            >
              <LinkIcon />

              <span className={styles.headerNavLinkWrap}>
                <span className={styles.headerNavLinkText}>Referal</span>
              </span>
            </Link>

            <Link
              href="/leaderboard"
              className={cn(styles.headerNavLink, {
                [styles.active]: pathname === "/leaderboard",
              })}
            >
              <Chart />

              <span className={styles.headerNavLinkWrap}>
                <span className={styles.headerNavLinkText}>Leaderboard</span>
              </span>
            </Link>

            <Link
              href="/referal"
              className={cn(styles.headerNavLink, styles.disabled)}
            >
              <Burn />

              <span className={styles.headerNavLinkWrap}>
                <span className={styles.headerNavLinkText}>Burn</span>
                <span className={styles.headerNavLinkTextSoon}>
                  Coming soon
                </span>
              </span>
            </Link>
          </nav>

          <div className={styles.headerWrap}>
            {/* <button className={styles.headerNotify}>
                            <Notify />

                            <span>1</span>
                        </button> */}

            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

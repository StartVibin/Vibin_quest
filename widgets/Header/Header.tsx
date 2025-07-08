"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import cn from "classnames";

import styles from "./index.module.css";
import base from "@/shared/styles/base.module.css";

import {
    Dashboard,
    Logo,
    Link as LinkIcon,
    Database,
    Target,
    Notify,
} from "@/shared/icons";

import WalletButton from "@/widgets/WalletButton";

const Header = () => {
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
                        <Logo />
                        Vibin
                    </Link>

                    <nav className={styles.headerNav}>
                        <Link
                            href="/"
                            className={cn(
                                styles.headerNavLink,
                                styles.disabled
                            )}
                        >
                            <Dashboard />
                        </Link>

                        <Link
                            href="/"
                            className={cn(styles.headerNavLink, styles.active)}
                        >
                            <LinkIcon />
                        </Link>

                        <Link
                            href="/"
                            className={cn(
                                styles.headerNavLink,
                                styles.disabled
                            )}
                        >
                            <Database />
                        </Link>

                        <Link
                            href="/"
                            className={cn(
                                styles.headerNavLink,
                                styles.disabled
                            )}
                        >
                            <Target />
                        </Link>
                    </nav>

                    <div className={styles.headerWrap}>
                        <button className={styles.headerNotify}>
                            <Notify />

                            <span>1</span>
                        </button>

                        <WalletButton />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

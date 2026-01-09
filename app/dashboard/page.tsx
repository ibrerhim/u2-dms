'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

export default function DashboardPage() {
    const { data: session } = useSession();
    const user = session?.user as { role?: string } | undefined;
    const isAdmin = user?.role === 'admin';

    // Different cards for admin vs user
    const cards = isAdmin
        ? [
            {
                href: '/dashboard',
                icon: '⊞',
                label: 'Dashboard',
            },
            {
                href: '/dashboard/users',
                icon: '👥',
                label: 'Manage Users',
            },
            {
                href: '/dashboard/files',
                icon: '📄',
                label: 'Manage Files',
            },
            {
                href: '/dashboard/profile',
                icon: '👤',
                label: 'Profile',
            },
        ]
        : [
            {
                href: '/dashboard/files',
                icon: '📄',
                label: 'Manage Files',
            },
            {
                href: '/dashboard/profile',
                icon: '👤',
                label: 'Profile',
            },
            {
                href: '/dashboard/notifications',
                icon: '🔔',
                label: 'Notifications',
            },
        ];

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            </h1>

            <div className={`${styles.cardGrid} ${isAdmin ? styles.cardGridAdmin : ''}`}>
                {cards.map((card) => (
                    <Link key={card.href + card.label} href={card.href} className={styles.card}>
                        <span className={styles.cardIcon}>{card.icon}</span>
                        <span className={styles.cardLabel}>{card.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

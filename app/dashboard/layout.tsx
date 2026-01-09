'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './layout.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    // Close sidebar when navigating
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (status === 'loading') {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const user = session.user as { name?: string; communityId?: string; role?: string };
    const isAdmin = user?.role === 'admin';

    // Different nav items for admin vs user
    const navItems = isAdmin
        ? [
            { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
            { href: '/dashboard/users', label: 'Manage Users', icon: '👥' },
            { href: '/dashboard/files', label: 'Manage Files', icon: '📄' },
            { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
        ]
        : [
            { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
            { href: '/dashboard/files', label: 'Manage Files', icon: '📄' },
            { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
            { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
        ];

    const handleLogout = () => {
        signOut({ callbackUrl: '/' });
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className={styles.container}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <span className={styles.menuTitle}>Menu</span>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setSidebarOpen(false)}
                    >
                        ×
                    </button>
                </div>

                {/* User card */}
                <div className={styles.userCard}>
                    <div className={styles.userName}>{user?.name || 'User'}</div>
                    <div className={styles.communityId}>
                        Community ID: {user?.communityId || ''}
                    </div>
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''
                                }`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navLabel}>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className={styles.sidebarFooter}>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className={styles.main}>
                <header className={styles.mainHeader}>
                    <button
                        className={styles.hamburger}
                        onClick={toggleSidebar}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <h1 className={styles.logo}>U2 DMS</h1>
                </header>
                <div className={styles.content}>{children}</div>
            </main>
        </div>
    );
}

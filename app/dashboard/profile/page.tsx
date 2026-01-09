'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

interface UserProfile {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    communityId: string;
    role: string;
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile');
            const data = await res.json();
            if (data.user) {
                setProfile(data.user);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                {/* Avatar */}
                <div className={styles.avatarContainer}>
                    <div className={styles.avatar}>
                        <span className={styles.avatarIcon}>👤</span>
                    </div>
                </div>

                {/* User info */}
                <div className={styles.userInfo}>
                    <div className={styles.nameRow}>
                        <span className={styles.userIcon}>👤</span>
                        <span className={styles.userName}>{profile?.fullName}</span>
                    </div>
                    <span className={`${styles.roleBadge} ${profile?.role === 'admin' ? styles.adminBadge : ''}`}>
                        {profile?.role?.toUpperCase() || 'USER'}
                    </span>
                </div>

                {/* Contact info */}
                <div className={styles.contactInfo}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoIcon}>✉️</span>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Email:</span>
                            <span className={styles.infoValue}>{profile?.email}</span>
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <span className={styles.infoIcon}>📞</span>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Phone:</span>
                            <span className={styles.infoValue}>{profile?.phone}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

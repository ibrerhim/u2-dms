'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Notification {
    _id: string;
    message: string;
    type: 'upload' | 'version' | 'revert' | 'delete';
    read: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', { method: 'PUT' });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'upload':
                return '📤';
            case 'version':
                return '📝';
            case 'revert':
                return '↩️';
            case 'delete':
                return '🗑️';
            default:
                return '📢';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading notifications...</p>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Notifications</h1>
                {unreadCount > 0 && (
                    <button className={styles.markReadBtn} onClick={markAllAsRead}>
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🔔</span>
                    <p>No notifications yet</p>
                </div>
            ) : (
                <div className={styles.notificationsList}>
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''
                                }`}
                        >
                            <span className={styles.icon}>
                                {getTypeIcon(notification.type)}
                            </span>
                            <div className={styles.content}>
                                <p className={styles.message}>{notification.message}</p>
                                <span className={styles.time}>
                                    {formatDate(notification.createdAt)}
                                </span>
                            </div>
                            {!notification.read && <span className={styles.unreadDot}></span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

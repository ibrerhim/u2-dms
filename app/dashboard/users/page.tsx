'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface User {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    totalFiles: number;
    lastModifiedFile: string | null;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export default function ManageUsersPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const user = session?.user as { role?: string } | undefined;
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (session && !isAdmin) {
            router.push('/dashboard');
        }
    }, [session, isAdmin, router]);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers(currentPage);
        }
    }, [isAdmin, currentPage]);

    const fetchUsers = async (page: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?page=${page}&limit=10`);
            const data = await res.json();
            setUsers(data.users || []);
            setPagination(data.pagination || null);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'No files uploaded';
        return new Date(dateString).toLocaleDateString();
    };

    if (!isAdmin) {
        return null;
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Users</h1>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Total Files</th>
                            <th>Last Modified File</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.totalFiles}</td>
                                <td>{formatDate(user.lastModifiedFile)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pagination.hasPrev}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.hasNext}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

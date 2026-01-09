'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface DocumentVersion {
    versionId: string;
    versionName: string;
    cloudinaryUrl: string;
    createdAt: string;
}

interface Document {
    _id: string;
    name: string;
    currentVersionName: string;
    versions: DocumentVersion[];
    createdAt: string;
}

export default function ManageFilesPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showVersionsModal, setShowVersionsModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [uploadData, setUploadData] = useState({ name: '', file: null as File | null });
    const [updateFile, setUpdateFile] = useState<File | null>(null);
    const [versionName, setVersionName] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/documents');
            const data = await res.json();
            setDocuments(data.documents || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadData.file || !uploadData.name) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('name', uploadData.name);

        try {
            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setShowUploadModal(false);
                setUploadData({ name: '', file: null });
                fetchDocuments();
            }
        } catch (error) {
            console.error('Error uploading document:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateFile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!updateFile || !selectedDoc) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', updateFile);
        formData.append('versionName', versionName || 'Unnamed Version');

        try {
            const res = await fetch(`/api/documents/${selectedDoc._id}`, {
                method: 'PUT',
                body: formData,
            });

            if (res.ok) {
                setShowUpdateModal(false);
                setUpdateFile(null);
                setVersionName('');
                setSelectedDoc(null);
                fetchDocuments();
            }
        } catch (error) {
            console.error('Error updating document:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleViewVersions = (doc: Document) => {
        setSelectedDoc(doc);
        setShowVersionsModal(true);
    };

    const handleOpenUpdate = (doc: Document) => {
        setSelectedDoc(doc);
        setShowUpdateModal(true);
    };

    const handleRevert = async (versionId: string) => {
        if (!selectedDoc) return;

        try {
            const res = await fetch(`/api/documents/${selectedDoc._id}/revert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionId }),
            });

            if (res.ok) {
                setShowVersionsModal(false);
                setSelectedDoc(null);
                fetchDocuments();
            }
        } catch (error) {
            console.error('Error reverting document:', error);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading documents...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Files</h1>

            <button
                className={styles.uploadBtn}
                onClick={() => setShowUploadModal(true)}
            >
                + Upload File
            </button>

            <div className={styles.fileGrid}>
                {documents.map((doc) => (
                    <div key={doc._id} className={styles.fileCard}>
                        <div className={styles.fileHeader}>
                            <span className={styles.fileName}>{doc.name}</span>
                            <a
                                href={doc.versions[doc.versions.length - 1]?.cloudinaryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.externalLink}
                            >
                                ↗
                            </a>
                        </div>
                        <p className={styles.versionInfo}>
                            Current Version: {doc.currentVersionName}
                        </p>
                        <div className={styles.cardActions}>
                            <button
                                className={styles.viewBtn}
                                onClick={() => handleViewVersions(doc)}
                            >
                                View Versions
                            </button>
                            <button
                                className={styles.updateBtn}
                                onClick={() => handleOpenUpdate(doc)}
                            >
                                Update File
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {documents.length === 0 && (
                <div className={styles.emptyState}>
                    <p>No documents yet. Upload your first file!</p>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className={styles.modalBackdrop} onClick={() => setShowUploadModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowUploadModal(false)}>
                            ×
                        </button>
                        <h2 className={styles.modalTitle}>Upload New File</h2>
                        <form onSubmit={handleUpload} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Document Name</label>
                                <input
                                    type="text"
                                    value={uploadData.name}
                                    onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Select File</label>
                                <input
                                    type="file"
                                    onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.submitBtn} disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Modal */}
            {showUpdateModal && selectedDoc && (
                <div className={styles.modalBackdrop} onClick={() => setShowUpdateModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowUpdateModal(false)}>
                            ×
                        </button>
                        <h2 className={styles.modalTitle}>Update: {selectedDoc.name}</h2>
                        <form onSubmit={handleUpdateFile} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Version Name</label>
                                <input
                                    type="text"
                                    value={versionName}
                                    onChange={(e) => setVersionName(e.target.value)}
                                    placeholder="e.g., Version 2.0"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Select New File</label>
                                <input
                                    type="file"
                                    onChange={(e) => setUpdateFile(e.target.files?.[0] || null)}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.submitBtn} disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload New Version'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Versions Modal */}
            {showVersionsModal && selectedDoc && (
                <div className={styles.modalBackdrop} onClick={() => setShowVersionsModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowVersionsModal(false)}>
                            ×
                        </button>
                        <h2 className={styles.modalTitle}>Versions: {selectedDoc.name}</h2>
                        <div className={styles.versionsList}>
                            {selectedDoc.versions
                                .slice()
                                .reverse()
                                .map((version, index) => (
                                    <div key={version.versionId} className={styles.versionItem}>
                                        <div className={styles.versionInfo}>
                                            <span className={styles.versionName}>{version.versionName}</span>
                                            <span className={styles.versionDate}>
                                                {new Date(version.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className={styles.versionActions}>
                                            <a
                                                href={version.cloudinaryUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.downloadBtn}
                                            >
                                                View
                                            </a>
                                            {index !== 0 && (
                                                <button
                                                    className={styles.revertBtn}
                                                    onClick={() => handleRevert(version.versionId)}
                                                >
                                                    Revert
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

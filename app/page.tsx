'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/LoginModal';
import styles from './page.module.css';

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show loading while checking auth or redirecting
  if (status === 'loading' || status === 'authenticated') {
    return null;
  }

  const handleGetStarted = () => {
    router.push('/register');
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    router.push('/register');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>U2 DMS</div>
        <button className={styles.loginBtn} onClick={handleLoginClick}>
          login <span className={styles.arrow}>›</span>
        </button>
      </header>

      {/* Hero Section */}
      <main className={styles.main}>
        <div className={styles.heroContent}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.tabActive}`}>
              get started
            </button>
            <button className={styles.tabLink} onClick={handleLoginClick}>
              login or create an account <span className={styles.arrow}>›</span>
            </button>
          </div>

          {/* Headline */}
          <h1 className={styles.headline}>
            document<br />
            management system<br />
            with versioning
          </h1>

          {/* Description */}
          <p className={styles.description}>
            this system allows users to seamlessly manage and modify their
            document and also allows reverting to previous document versions .
          </p>

          {/* CTA Button */}
          <button className={styles.ctaBtn} onClick={handleGetStarted}>
            <span className={styles.ctaIcon}>⚡</span>
            Get started <span className={styles.arrow}>›</span>
          </button>
        </div>

        {/* Hero Illustration */}
        <div className={styles.heroIllustration}>
          <div className={styles.deviceContainer}>
            {/* Laptop */}
            <div className={styles.laptop}>
              <div className={styles.laptopScreen}>
                <div className={styles.screenContent}>
                  <div className={styles.screenHeader}></div>
                  <div className={styles.screenCircle}></div>
                  <div className={styles.screenLines}>
                    <div className={styles.screenLine}></div>
                    <div className={styles.screenLine}></div>
                    <div className={styles.screenLine}></div>
                  </div>
                </div>
              </div>
              <div className={styles.laptopBase}></div>
            </div>

            {/* Tablet */}
            <div className={styles.tablet}>
              <div className={styles.tabletScreen}>
                <div className={styles.tabletIcon}>📄</div>
                <div className={styles.tabletCircle}></div>
                <div className={styles.tabletLines}>
                  <div className={styles.tabletLine}></div>
                  <div className={styles.tabletLine}></div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className={styles.phone}>
              <div className={styles.phoneScreen}>
                <div className={styles.phoneIcon}>📄</div>
                <div className={styles.phoneCircle}></div>
                <div className={styles.phoneLines}>
                  <div className={styles.phoneLine}></div>
                  <div className={styles.phoneLine}></div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className={styles.decorCircle1}></div>
            <div className={styles.decorCircle2}></div>
            <div className={styles.decorSquare1}></div>
            <div className={styles.decorSquare2}></div>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
    </div>
  );
}

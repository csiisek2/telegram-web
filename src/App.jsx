import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { SiteDataProvider } from './context/SiteDataContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Footer from './components/Footer';
import SEO from './components/SEO';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';

// Lazy load heavy pages
const FreeBoardPage = lazy(() => import('./pages/FreeBoardPage'));
const ScammerBoardPage = lazy(() => import('./pages/ScammerBoardPage'));
const WritePage = lazy(() => import('./pages/WritePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SiteDataProvider>
          <Router>
          <div className="app">
            <SEO />
            <Header />
            <AuthModal />

            {/* 3-Column Layout Container */}
            <div style={styles.mainContainer}>

              {/* Left Sidebar (Login & Banners) */}
              <div className="mobile-hide" style={{ position: 'sticky', top: '20px', alignSelf: 'flex-start' }}>
                <Sidebar />
              </div>

              {/* Center Main Content */}
              <main style={styles.contentArea}>
                <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/free" element={<FreeBoardPage />} />
                    <Route path="/free/write" element={<WritePage category="free" />} />
                    <Route path="/scammer" element={<ScammerBoardPage />} />
                    <Route path="/scammer/write" element={<WritePage category="scammer" />} />
                    <Route path="/isc8806" element={<AdminPage />} />
                  </Routes>
                </Suspense>
              </main>

              {/* Right Sidebar (Ads) */}
              <div className="mobile-hide" style={{ position: 'sticky', top: '20px', alignSelf: 'flex-start' }}>
                <RightSidebar />
              </div>

            </div>

            <Footer />
          </div>
        </Router>
        </SiteDataProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

const styles = {
  mainContainer: {
    maxWidth: '1300px',
    margin: '24px auto',
    padding: '0 16px',
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  contentArea: {
    flex: 1,
    minWidth: 0,
    width: '100%',
  },
  '@media (max-width: 768px)': {
    mainContainer: {
      margin: '12px auto',
      padding: '0 8px',
      gap: '0',
    }
  }
};

export default App;

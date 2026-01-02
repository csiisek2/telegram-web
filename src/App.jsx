import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Footer from './components/Footer';
import SEO from './components/SEO';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import FreeBoardPage from './pages/FreeBoardPage';
import ScammerBoardPage from './pages/ScammerBoardPage';
import WritePage from './pages/WritePage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <SEO />
            <Header />
            <AuthModal />

            {/* 3-Column Layout Container */}
            <div style={styles.mainContainer}>

              {/* Left Sidebar (Login & Banners) */}
              <Sidebar />

              {/* Center Main Content */}
              <main style={styles.contentArea}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/free" element={<FreeBoardPage />} />
                  <Route path="/free/write" element={<WritePage category="free" />} />
                  <Route path="/scammer" element={<ScammerBoardPage />} />
                  <Route path="/scammer/write" element={<WritePage category="scammer" />} />
                  <Route path="/isc8806" element={<AdminPage />} />
                </Routes>
              </main>

              {/* Right Sidebar (Ads) */}
              <RightSidebar />

            </div>

            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

const styles = {
  mainContainer: {
    maxWidth: '1300px', // Increased width for 3 columns
    margin: '24px auto',
    padding: '0 16px',
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  contentArea: {
    flex: 1,
    minWidth: 0,
  }
};

export default App;

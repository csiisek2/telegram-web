import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Header = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { isLoggedIn, currentUser, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // 방문자 수 추적 (sessionStorage 사용)
    const trackVisitor = () => {
      // 총 방문자 수 가져오기 (localStorage)
      let totalVisitors = parseInt(localStorage.getItem('totalVisitors') || '0');

      // 현재 세션에서 처음 방문했는지 확인
      if (!sessionStorage.getItem('hasVisited')) {
        totalVisitors += 1;
        localStorage.setItem('totalVisitors', totalVisitors.toString());
        sessionStorage.setItem('hasVisited', 'true');
      }

      // 화면에 표시할 숫자 = 실제 방문자 + 300
      setVisitorCount(totalVisitors + 300);
    };

    trackVisitor();
  }, []);

  // URL에서 검색어 읽어오기
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // URL에 검색어 추가
      setSearchParams({ search: searchTerm.trim() });
      // 홈으로 이동
      navigate('/?search=' + encodeURIComponent(searchTerm.trim()));
      // 홈 섹션으로 스크롤
      setTimeout(() => {
        const homeSection = document.getElementById('home');
        if (homeSection) {
          homeSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // 검색어가 비어있으면 검색 초기화
      setSearchParams({});
      navigate('/');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header style={styles.header}>
      <div className="container" style={styles.container}>
        {/* Top Bar: Logo & Search */}
        <div style={styles.topBar} className="header-top">
          <div
            style={{ ...styles.logoArea, cursor: 'pointer' }}
            onClick={() => {
              navigate('/');
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            }}
            className="header-logo"
          >
            <div style={styles.icon}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '32px', height: '32px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#2481CC" />
                <path d="M17.03 8.35L15.39 16.35C15.27 16.89 14.95 17.06 14.49 16.81L11.99 14.95L10.78 16.12C10.65 16.25 10.54 16.36 10.28 16.36L10.46 13.8L15.15 9.53C15.36 9.35 15.11 9.24 14.83 9.41L9.03 13.08L6.53 12.3C5.99 12.13 5.98 11.76 6.64 11.5L16.41 7.74C16.86 7.56 17.26 7.84 17.03 8.35Z" fill="white" />
              </svg>
            </div>
            <h1 style={styles.title} className="header-title">텔레그램 홍보방</h1>
          </div>

          <div style={styles.rightSection} className="header-right">
            {/* 현재 이용자 수 표시 */}
            <div style={styles.visitorCounter} className="mobile-hide">
              <span style={styles.onlineIndicator}>●</span>
              <span style={styles.visitorLabel}>현재 이용자</span>
              <span style={styles.visitorCount}>{visitorCount.toLocaleString()}</span>
            </div>

            <div style={styles.searchBar} className="header-search">
              <input
                type="text"
                placeholder="방 검색"
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button style={styles.searchBtn} onClick={handleSearch}>🔍</button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          <a
            href="/"
            style={styles.navLink}
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            }}
          >
            홈
          </a>
          <a
            href="/"
            style={styles.navLink}
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            }}
          >
            인기순위
          </a>
          <a
            href="/scammer"
            style={styles.navLink}
            onClick={(e) => {
              e.preventDefault();
              navigate('/scammer');
            }}
          >
            사기 업체
          </a>
          <a
            href="/free"
            style={styles.navLink}
            onClick={(e) => {
              e.preventDefault();
              navigate('/free');
            }}
          >
            자유게시판
          </a>
          <a href="https://t.me/xdev90" target="_blank" rel="noopener noreferrer" style={styles.navLink}>고객센터</a>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#fff', // White header
    borderBottom: '1px solid var(--tg-border)',
    marginTop: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: '1300px', // Matches App container
    margin: '0 auto',
    padding: '0 16px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#333',
    letterSpacing: '-0.5px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  visitorCounter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f0f9ff',
    borderRadius: '20px',
    border: '1px solid #bfdbfe',
  },
  onlineIndicator: {
    color: '#22c55e',
    fontSize: '12px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  visitorLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
  },
  visitorCount: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--tg-primary)',
  },
  authSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  welcomeText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  loginBtn: {
    padding: '8px 20px',
    backgroundColor: 'var(--tg-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  logoutBtn: {
    padding: '6px 16px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  searchBar: {
    display: 'flex',
    border: '2px solid var(--tg-primary)',
    borderRadius: '4px',
    overflow: 'hidden',
    width: '300px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    padding: '8px 12px',
    outline: 'none',
    fontSize: '14px',
  },
  searchBtn: {
    backgroundColor: 'var(--tg-primary)',
    color: '#fff',
    padding: '0 16px',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between', // Spread items across full width
    alignItems: 'center',
    paddingBottom: '0',
    borderTop: '1px solid #eee',
    width: '100%',
  },
  navLink: {
    flex: 1, // Each link takes equal space
    textAlign: 'center', // Center text within the link area
    padding: '16px 4px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    borderBottom: '3px solid transparent',
    transition: 'color 0.2s',
    display: 'block', // Ensure full click area
    ':hover': {
      color: 'var(--tg-primary)',
    }
  }
};

export default Header;

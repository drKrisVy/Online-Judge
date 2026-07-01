import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Safely grab the user to check their role
    let user = null;
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            user = JSON.parse(storedUser);
        }
    } catch (e) {
        console.error("Failed to parse user");
    }

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname.includes(path);

    const getLinkStyle = (path) => ({
        textDecoration: 'none',
        padding: '12px 15px',
        borderRadius: '10px',
        backgroundColor: isActive(path) ? '#6b4ce6' : 'transparent',
        color: isActive(path) ? '#ffffff' : '#8b8b99',
        fontWeight: '600',
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s ease',
    });

    const handleMouseOver = (e, path) => {
        if (!isActive(path)) {
            e.currentTarget.style.backgroundColor = '#1a1a24';
            e.currentTarget.style.color = '#ffffff';
        }
    };

    const handleMouseOut = (e, path) => {
        if (!isActive(path)) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#8b8b99';
        }
    };

    return (
        <div style={{ width: '260px', height: '100vh', backgroundColor: '#121215', borderRight: '1px solid #2a2a35', display: 'flex', flexDirection: 'column', padding: '30px 20px', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Logo & Status */}
            <div style={{ marginBottom: '50px', padding: '0 10px' }}>
                <h2 style={{ color: '#ffffff', margin: 0, letterSpacing: '4px', fontSize: '1.8rem', fontWeight: '800' }}>CodePlex</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#28a745', borderRadius: '50%', boxShadow: '0 0 10px #28a745' }}></div>
                    <span style={{ color: '#8b8b99', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>System Online</span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/problems" style={getLinkStyle('/problems')} onMouseOver={(e) => handleMouseOver(e, '/problems')} onMouseOut={(e) => handleMouseOut(e, '/problems')}>
                    <span style={{ fontSize: '1.2rem' }}>💻</span> Problemset
                </Link>
                <Link to="/leaderboard" style={getLinkStyle('/leaderboard')} onMouseOver={(e) => handleMouseOver(e, '/leaderboard')} onMouseOut={(e) => handleMouseOut(e, '/leaderboard')}>
                    <span style={{ fontSize: '1.2rem' }}>🏆</span> Leaderboard
                </Link>
                <Link to="/profile" style={getLinkStyle('/profile')} onMouseOver={(e) => handleMouseOver(e, '/profile')} onMouseOut={(e) => handleMouseOut(e, '/profile')}>
                    <span style={{ fontSize: '1.2rem' }}>👤</span> Profile
                </Link>
                
                {/* SECURED: Only show Admin Panel if user is an admin */}
                {user?.role === 'admin' && (
                    <Link to="/admin/create-problem" style={getLinkStyle('/admin')} onMouseOver={(e) => handleMouseOver(e, '/admin')} onMouseOut={(e) => handleMouseOut(e, '/admin')}>
                        <span style={{ fontSize: '1.2rem' }}>⚙️</span> Admin Panel
                    </Link>
                )}
            </nav>

            {/* User Info & Logout Button */}
            <div style={{ marginTop: 'auto' }}>
                {user && (
                    <div style={{ padding: '0 10px 15px 10px', color: '#8c6cf5', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>
                        @{user.username}
                    </div>
                )}
                <button 
                    onClick={handleLogout} 
                    style={{ width: '100%', padding: '14px', backgroundColor: '#1a1a24', color: '#ff4d4f', border: '1px solid #2a2a35', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'; e.currentTarget.style.borderColor = '#dc3545'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#1a1a24'; e.currentTarget.style.borderColor = '#2a2a35'; }}
                >
                    <span style={{ fontSize: '1.1rem' }}>🚪</span> Log Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
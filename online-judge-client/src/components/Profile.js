import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Profile = () => {
    // 🛡️ BULLETPROOF ID EXTRACTION
    let user = {};
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            user = JSON.parse(storedUser);
        }
    } catch (e) {
        console.error("Failed to parse user from local storage");
    }
    
    // Fallback to the test ID if the user is missing or corrupted
    const userId = user._id || user.id || "64f1b2c3d4e5f6a7b8c9d0e1";
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await api.get(`/profile/${userId}`);
                setStats(response.data);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [userId]);

    const getVerdictStyle = (verdict) => {
        if (verdict === 'Accepted') return { color: '#28a745', bg: 'rgba(40, 167, 69, 0.1)' };
        if (verdict.includes('Pending')) return { color: '#ffc107', bg: 'rgba(255, 193, 7, 0.1)' };
        return { color: '#ff4d4f', bg: 'rgba(255, 77, 79, 0.1)' }; 
    };

    if (loading) return <div style={{ color: '#8b8b99', textAlign: 'center', marginTop: '50px', fontFamily: 'Inter, sans-serif', fontSize: '1.2rem' }}>Loading Profile...</div>;
    if (!stats) return <div style={{ color: '#ff4d4f', textAlign: 'center', marginTop: '50px', fontFamily: 'Inter, sans-serif' }}>Failed to load data. Please log out and log back in.</div>;

    return (
        <div style={{ padding: '40px', backgroundColor: '#0d0d12', minHeight: '100vh', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="glow-text" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px', color: '#ffffff' }}>
                        Hacker Profile
                    </h1>
                    <p style={{ color: '#8b8b99', fontSize: '1.1rem' }}>Track your progress and submission history.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ flex: 1, backgroundColor: '#1a1a24', padding: '30px', borderRadius: '12px', border: '1px solid #2a2a35', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 style={{ margin: '0', color: '#8b8b99', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Problems Solved</h3>
                        <p style={{ fontSize: '4rem', fontWeight: '800', color: '#28a745', margin: '10px 0 0 0', textShadow: '0 0 20px rgba(40, 167, 69, 0.2)' }}>
                            {stats.solvedCount}
                        </p>
                    </div>
                    
                    <div style={{ flex: 1, backgroundColor: '#1a1a24', padding: '30px', borderRadius: '12px', border: '1px solid #2a2a35', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 style={{ margin: '0', color: '#8b8b99', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Total Submissions</h3>
                        <p style={{ fontSize: '4rem', fontWeight: '800', color: '#6b4ce6', margin: '10px 0 0 0', textShadow: '0 0 20px rgba(107, 76, 230, 0.2)' }}>
                            {stats.totalAttempts}
                        </p>
                    </div>
                </div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '20px', color: '#ffffff' }}>Recent Activity</h2>
                <div style={{ backgroundColor: '#16161a', borderRadius: '12px', border: '1px solid #2a2a35', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#1a1a24', borderBottom: '2px solid #2a2a35' }}>
                            <tr>
                                <th style={{ padding: '20px 30px', color: '#8b8b99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Date</th>
                                <th style={{ padding: '20px 30px', color: '#8b8b99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Language</th>
                                <th style={{ padding: '20px 30px', color: '#8b8b99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Verdict</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#8b8b99' }}>No submissions yet. Start coding!</td>
                                </tr>
                            ) : (
                                stats.recentSubmissions.map((sub, index) => {
                                    const verdictStyle = getVerdictStyle(sub.verdict);
                                    return (
                                        <tr 
                                            key={index} 
                                            style={{ borderBottom: index === stats.recentSubmissions.length - 1 ? 'none' : '1px solid #2a2a35', transition: 'background-color 0.2s' }} 
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a1a24'} 
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '20px 30px', color: '#e0e0e0', fontWeight: '500' }}>
                                                {new Date(sub.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ padding: '20px 30px', color: '#a0a0b0', fontWeight: '700' }}>
                                                {sub.language.charAt(0).toUpperCase() + sub.language.slice(1)}
                                            </td>
                                            <td style={{ padding: '20px 30px' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', 
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold',
                                                    backgroundColor: verdictStyle.bg,
                                                    color: verdictStyle.color,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px'
                                                }}>
                                                    {sub.verdict}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Profile;
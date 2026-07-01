import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/leaderboard');
                setUsers(response.data);
            } catch (error) {
                console.error("Failed to load leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankStyle = (index) => {
        switch(index) {
            case 0: return { color: '#ffd700', bg: 'rgba(255, 215, 0, 0.1)' }; // Gold
            case 1: return { color: '#c0c0c0', bg: 'rgba(192, 192, 192, 0.1)' }; // Silver
            case 2: return { color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.1)' }; // Bronze
            default: return { color: '#8b8b99', bg: 'transparent' };
        }
    };

    return (
        <div style={{ padding: '40px', backgroundColor: '#0d0d12', minHeight: '100vh', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '10px', color: '#ffffff', fontWeight: '800' }}>Global Rankings</h1>
                    <p style={{ color: '#8b8b99', fontSize: '1.1rem' }}>Compete with peers and climb the CodePlex ladder.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#8b8b99', marginTop: '50px', fontSize: '1.2rem' }}>Loading rankings...</div>
                ) : (
                    <div style={{ backgroundColor: '#16161a', borderRadius: '12px', border: '1px solid #2a2a35', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#1a1a24', borderBottom: '2px solid #2a2a35' }}>
                                    <th style={{ padding: '20px 30px', color: '#8b8b99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Rank</th>
                                    <th style={{ padding: '20px 30px', color: '#8b8b99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Hacker</th>
                                    <th style={{ padding: '20px 30px', color: '#8b8b99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', textAlign: 'right' }}>Problems Solved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#8b8b99' }}>No data available.</td>
                                    </tr>
                                ) : (
                                    users.map((u, index) => {
                                        const rankStyle = getRankStyle(index);
                                        return (
                                            <tr key={index} style={{ borderBottom: index === users.length - 1 ? 'none' : '1px solid #2a2a35', backgroundColor: rankStyle.bg, transition: '0.2s' }}>
                                                <td style={{ padding: '20px 30px', fontWeight: 'bold', fontSize: '1.2rem', color: rankStyle.color }}>
                                                    #{index + 1}
                                                </td>
                                                <td style={{ padding: '20px 30px', fontSize: '1.1rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#2a2a35', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#ffffff' }}>
                                                        {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    {u.username || "Anonymous Hacker"}
                                                </td>
                                                <td style={{ padding: '20px 30px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: '#6b4ce6' }}>
                                                    {u.solvedCount || 0}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
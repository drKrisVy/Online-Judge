import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Problemset = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await api.get('/problems');
                setProblems(response.data);
            } catch (err) {
                console.error("Error fetching problems:", err);
                setError('Failed to load problems from the server.');
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, []);

    const getDifficultyStyle = (difficulty) => {
        const diff = difficulty?.toLowerCase();
        if (diff === 'easy') return { color: '#28a745', bg: 'rgba(40, 167, 69, 0.1)' };
        if (diff === 'hard') return { color: '#ff4d4f', bg: 'rgba(255, 77, 79, 0.1)' };
        return { color: '#ffc107', bg: 'rgba(255, 193, 7, 0.1)' }; 
    };

    return (
        <div style={{ padding: '40px', backgroundColor: '#0d0d12', minHeight: '100vh', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '10px', color: '#ffffff', fontWeight: '800' }}>Problemset</h1>
                    <p style={{ color: '#8b8b99', fontSize: '1.1rem' }}>Select a challenge below to enter the interactive workspace.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#8b8b99', marginTop: '50px', fontSize: '1.2rem' }}>Loading challenges...</div>
                ) : error ? (
                    <div style={{ padding: '20px', backgroundColor: 'rgba(220, 53, 69, 0.1)', border: '1px solid #dc3545', color: '#ff4d4f', borderRadius: '10px', textAlign: 'center' }}>
                        {error}
                    </div>
                ) : (
                    <div style={{ backgroundColor: '#16161a', borderRadius: '12px', border: '1px solid #2a2a35', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#1a1a24', borderBottom: '2px solid #2a2a35' }}>
                                    <th style={{ padding: '20px 30px', color: '#8b8b99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Challenge Title</th>
                                    <th style={{ padding: '20px 30px', color: '#8b8b99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Difficulty</th>
                                    <th style={{ padding: '20px 30px', color: '#8b8b99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {problems.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#8b8b99' }}>
                                            No problems found. Time to add some via the Admin panel!
                                        </td>
                                    </tr>
                                ) : (
                                    problems.map((problem, index) => {
                                        const diffStyle = getDifficultyStyle(problem.difficulty);
                                        return (
                                            <tr 
                                                key={problem._id} 
                                                style={{ borderBottom: index === problems.length - 1 ? 'none' : '1px solid #2a2a35', transition: 'background-color 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a1a24'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <td style={{ padding: '20px 30px', fontSize: '1.1rem', fontWeight: '600' }}>
                                                    <Link to={`/problems/${problem._id}`} style={{ textDecoration: 'none', color: '#ffffff', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#8c6cf5'} onMouseOut={(e) => e.target.style.color = '#ffffff'}>
                                                        {problem.title}
                                                    </Link>
                                                </td>
                                                <td style={{ padding: '20px 30px' }}>
                                                    <span style={{ 
                                                        padding: '6px 12px', 
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 'bold',
                                                        backgroundColor: diffStyle.bg,
                                                        color: diffStyle.color,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px'
                                                    }}>
                                                        {problem.difficulty || 'Medium'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '20px 30px', textAlign: 'right' }}>
                                                    <Link to={`/problems/${problem._id}`}>
                                                        <button style={{ 
                                                            padding: '10px 24px', 
                                                            backgroundColor: '#6b4ce6', 
                                                            color: 'white', 
                                                            border: 'none', 
                                                            borderRadius: '8px', 
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.95rem',
                                                            transition: 'background-color 0.2s, transform 0.1s' 
                                                        }}
                                                        onMouseOver={(e) => { e.target.style.backgroundColor = '#5a3bc2'; e.target.style.transform = 'translateY(-2px)'; }}
                                                        onMouseOut={(e) => { e.target.style.backgroundColor = '#6b4ce6'; e.target.style.transform = 'translateY(0)'; }}
                                                        >
                                                            Solve
                                                        </button>
                                                    </Link>
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

export default Problemset;
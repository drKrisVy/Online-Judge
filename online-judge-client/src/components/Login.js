import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    // Smart routing: sends them back to where they came from, or defaults to /problems
    const from = location.state?.from;
    const navigateTo = from ? `${from.pathname}${from.search}` : '/problems';

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            // The HTTP-only cookie is automatically handled by the browser here
            const response = await api.post('/auth/login', { email, password });
            
            // Save ONLY the user details to local storage, not the token
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            navigate(navigateTo, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0d0d12', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
            
            {/* LEFT PANE - Branding & Features */}
            <div style={{ flex: 1, padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid #2a2a35', background: 'linear-gradient(135deg, #121215 0%, #1a1a24 100%)' }}>
                <div style={{ maxWidth: '450px', margin: '0 auto' }}>
                    <div style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: 'rgba(107, 76, 230, 0.15)', color: '#8c6cf5', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '20px' }}>
                        INTERACTIVE SANDBOX
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>Sign In to<br/>Continue Your Journey</h1>
                    <h3 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '15px', textTransform: 'uppercase' }}>About The Platform</h3>
                    <p style={{ color: '#8b8b99', lineHeight: '1.6', fontSize: '1rem', marginBottom: '20px' }}>
                        CodePlex is a premium coding sandbox and online judge. Log back in to compete in weekly contests, climb global leaderboards, run tests, and compare performance benchmarks.
                    </p>
                    <p style={{ color: '#8c6cf5', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '40px' }}>Hover over features below to reveal details.</p>

                    {/* Feature List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#8c6cf5' }}>{'</>'}</div>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Resume Your Workspace</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#8c6cf5' }}>⏱️</div>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Fast Code Testing</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#8c6cf5' }}>🛡️</div>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Compare Benchmarks</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANE - Auth Form */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121215' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    
                    {/* Header Top Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '2.5rem', letterSpacing: '8px', fontWeight: '800', margin: '0' }}>CodePlex</h2>
                        <span style={{ fontSize: '0.7rem', color: '#8b8b99', letterSpacing: '4px', textTransform: 'uppercase' }}>Premium Coding Sandbox</span>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', backgroundColor: '#1a1a24', borderRadius: '30px', padding: '5px', marginBottom: '30px', border: '1px solid #2a2a35' }}>
                        <div style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: '#6b4ce6', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</div>
                        <Link to="/register" style={{ flex: 1, textAlign: 'center', padding: '12px', color: '#8b8b99', textDecoration: 'none', fontWeight: 'bold' }}>Create Account</Link>
                    </div>

                    <button style={{ width: '100%', padding: '15px', backgroundColor: '#1a1a24', color: '#ffffff', border: '1px solid #2a2a35', borderRadius: '10px', fontWeight: 'bold', marginBottom: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                        <img src="https://img.icons8.com/color/24/000000/google-logo.png" alt="Google" style={{ width: '18px' }}/>
                        Continue with Google
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#8b8b99', fontSize: '0.85rem' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#2a2a35' }}></div>
                        <span style={{ margin: '0 15px' }}>or use credentials</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#2a2a35' }}></div>
                    </div>

                    {error && <div style={{ padding: '12px', backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#ff4d4f', border: '1px solid #dc3545', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>Email Address</label>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '15px', backgroundColor: '#1a1a24', color: 'white', border: '1px solid #2a2a35', borderRadius: '10px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} 
                                required 
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '15px', backgroundColor: '#1a1a24', color: 'white', border: '1px solid #2a2a35', borderRadius: '10px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} 
                                required 
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', fontSize: '0.9rem' }}>
                            <label style={{ color: '#8b8b99', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="checkbox" style={{ accentColor: '#6b4ce6' }} /> Remember me
                            </label>
                            <span style={{ color: '#8c6cf5', cursor: 'pointer' }}>Forgot password?</span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{ width: '100%', padding: '15px', backgroundColor: '#6b4ce6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', transition: '0.2s' }}
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
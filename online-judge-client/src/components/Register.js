import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        username: '', // Mandatory for the backend 
        email: '', 
        mobileNumber: '', 
        password: '' 
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#121215', color: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }}>
            
            {/* LEFT PANE - Branding */}
            <div style={{ flex: 1, padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid #2a2a35', background: 'linear-gradient(135deg, #121215 0%, #1a1a24 100%)' }}>
                <h1 style={{ fontSize: '3rem', letterSpacing: '4px', margin: '0 0 10px 0', fontWeight: '800' }}>CodePlex</h1>
                <p style={{ color: '#8b8b99', textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.8rem', marginBottom: '60px' }}>Join The Sandbox</p>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', lineHeight: '1.2' }}>Start Competing<br/>Today</h2>
            </div>

            {/* RIGHT PANE - Form (Matching your slide!) */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#16161a' }}>
                <div style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
                    <form onSubmit={handleRegister}>
                        {error && <div style={{ padding: '10px', backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#ff4d4f', border: '1px solid #dc3545', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
                        
                        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required 
                            style={{ width: '100%', padding: '15px', marginBottom: '15px', backgroundColor: '#121215', border: '1px solid #2a2a35', color: '#fff', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
                        
                        <input type="text" name="username" placeholder="Username (e.g. CodeNinja99)" onChange={handleChange} required 
                            style={{ width: '100%', padding: '15px', marginBottom: '15px', backgroundColor: '#121215', border: '1px solid #2a2a35', color: '#fff', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
                        
                        <input type="email" name="email" placeholder="Email" onChange={handleChange} required 
                            style={{ width: '100%', padding: '15px', marginBottom: '15px', backgroundColor: '#121215', border: '1px solid #2a2a35', color: '#fff', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
                        
                        <input type="text" name="mobileNumber" placeholder="Mobile Number" onChange={handleChange} required 
                            style={{ width: '100%', padding: '15px', marginBottom: '15px', backgroundColor: '#121215', border: '1px solid #2a2a35', color: '#fff', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
                        
                        <input type="password" name="password" placeholder="Password" onChange={handleChange} required 
                            style={{ width: '100%', padding: '15px', marginBottom: '30px', backgroundColor: '#121215', border: '1px solid #2a2a35', color: '#fff', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
                        
                        <button type="submit" disabled={isLoading} 
                            style={{ width: '100%', padding: '15px', backgroundColor: '#6b4ce6', color: '#fff', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: '0.2s' }}>
                            {isLoading ? 'Creating Account...' : 'Create Account →'}
                        </button>
                        
                        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#8b8b99' }}>
                            Already have an account? <Link to="/login" style={{ color: '#6b4ce6', textDecoration: 'none', fontWeight: 'bold' }}>Sign In</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
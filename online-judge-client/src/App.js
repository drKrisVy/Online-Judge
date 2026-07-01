import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Components (Ensure these files exist in your /components folder!)
import Login from './components/Login';
import Register from './components/Register';
import Problemset from './components/Problemset';
import AdminCreateProblem from './components/AdminCreateProblem';
import Workspace from './components/Workspace';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import Sidebar from './components/Sidebar';

// Premium Layout Wrapper (Sidebar + Main Content Area)
const PlatformLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0d0d12', overflow: 'hidden', width: '100vw' }}>
            <Sidebar />
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d0d12', display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </div>
    );
};

// Route Protection: Verifies auth and remembers intended destination
const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem('user');
    const location = useLocation(); 
    
    if (!user || user === 'undefined') {
        // Save the intended destination (e.g., /problems/123?session=abc) to redirect them back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return <PlatformLayout>{children}</PlatformLayout>;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app-container" style={{ backgroundColor: '#0d0d12', minHeight: '100vh', color: '#ffffff' }}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Platform Routes (Secured & Wrapped in Layout) */}
          <Route path="/problems" element={<ProtectedRoute><Problemset /></ProtectedRoute>} />
          <Route path="/problems/:id" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          
          {/* Admin Route - Further protection should be added in the component itself to check user.role === 'admin' */}
          <Route path="/admin/create-problem" element={<ProtectedRoute><AdminCreateProblem /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
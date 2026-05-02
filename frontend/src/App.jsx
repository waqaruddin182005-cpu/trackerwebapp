import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Layout from './components/Layout';
import { LoadingSpinner } from './components/common';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/analytics" element={user ? <Layout><Analytics /></Layout> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

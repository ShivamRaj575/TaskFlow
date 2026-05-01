import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LayoutDashboard, FolderKanban, LogOut, CheckSquare, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
        <CheckSquare size={28} color="#3b82f6" />
        <span>TaskFlow</span>
      </Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/')}`}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/projects" className={`nav-link ${isActive('/projects')}`}>
          <FolderKanban size={20} /> Projects
        </Link>
      </div>
      <div className="nav-user flex-between" style={{ gap: '1rem' }}>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={toggleTheme}
          style={{ padding: '0.5rem', borderRadius: '50%' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <span style={{ color: 'var(--text-secondary)' }}>Hi, {user.name}</span>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

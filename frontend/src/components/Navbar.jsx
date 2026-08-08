import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <nav className="navbar">
      <div className="navbar-brand">💪 FitTrack</div>
      <div className="navbar-links">
        <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
        <NavLink to="/workouts" className={linkClass}>Workouts</NavLink>
        <NavLink to="/meals" className={linkClass}>Meals</NavLink>
        <NavLink to="/progress" className={linkClass}>Progress</NavLink>
        <NavLink to="/ai-coach" className={linkClass}>AI Coach</NavLink>
      </div>
      <div className="navbar-user">
        <span>{user.name}</span>
        <button className="btn-outline" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

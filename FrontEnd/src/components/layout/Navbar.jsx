import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Settings } from 'lucide-react';
import { selectUser, logoutThunk } from '../../store/slices/authSlice';
import { selectRecentNotifications } from '../../store/slices/notificationSlice';
import Avatar from '../ui/Avatar';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  
  const user = useSelector(selectUser);
  const recentNotifications = useSelector(selectRecentNotifications);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center">
        {/* Mobile menu button would go here */}
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative transition-colors"
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
          >
            <Bell className="h-5 w-5" />
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-100 py-2">
              <div className="px-4 py-2 border-b">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {recentNotifications?.length > 0 ? (
                  recentNotifications.map(notif => (
                    <div key={notif._id} className="px-4 py-3 hover:bg-gray-50 flex gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{timeAgo(notif.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t text-center">
                <Link to="/notifications" className="text-sm text-indigo-600 hover:underline" onClick={() => setShowNotifMenu(false)}>
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
          >
            <Avatar src={user?.avatarUrl} alt={user?.name} fallback={user?.name?.charAt(0)} size="sm" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link 
                to="/settings/profile" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowProfileMenu(false)}
              >
                <User className="h-4 w-4 mr-2 text-gray-400" />
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut className="h-4 w-4 mr-2 text-red-500" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

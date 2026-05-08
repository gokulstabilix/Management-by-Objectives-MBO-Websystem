import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, CheckCircle2, XCircle, FileText, Calendar, CheckCheck, Inbox } from 'lucide-react';
import { 
  selectNotifications, 
  selectUnreadCount,
  fetchNotificationsThunk,
  markReadThunk,
  markAllReadThunk 
} from '../../store/slices/notificationSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

/**
 * Format an ISO date string or Date into a human-readable relative time.
 */
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
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  // Fetch notifications on mount so the page always has fresh data
  useEffect(() => {
    dispatch(fetchNotificationsThunk());
  }, [dispatch]);

  const getIconForType = (type) => {
    switch (type) {
      case 'form_submitted': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'form_approved': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'form_rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'quarter_opened': return <Calendar className="h-5 w-5 text-indigo-500" />;
      case 'quarter_closed': return <Calendar className="h-5 w-5 text-gray-500" />;
      default: return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllReadThunk());
  };

  const handleNotificationClick = (id, isRead) => {
    if (!isRead) {
      dispatch(markReadThunk(id));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Stay updated on MBO approvals, submissions, and cycle changes.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={handleMarkAllRead} className="gap-2 bg-white">
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="bg-gray-50 border-b flex flex-row items-center justify-between py-4">
          <div className="flex gap-4">
            <button className="text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 pb-1">All Notifications</button>
            <button className="text-sm font-medium text-gray-500 hover:text-gray-700 pb-1">Unread</button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Inbox className="h-12 w-12 mb-4" />
              <p className="text-sm font-medium text-gray-500">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">You'll be notified about form submissions, approvals, and quarter changes.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  onClick={() => handleNotificationClick(notif._id, notif.isRead)}
                  className={`p-4 flex gap-4 cursor-pointer transition-colors hover:bg-gray-50 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className={`mt-1 p-2 rounded-full ${!notif.isRead ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                    {getIconForType(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;

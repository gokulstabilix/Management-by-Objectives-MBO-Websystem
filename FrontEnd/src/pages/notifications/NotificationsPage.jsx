import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, CheckCircle2, XCircle, FileText, Calendar, Inbox } from 'lucide-react';
import { 
  selectNotifications, 
  fetchNotificationsThunk,
} from '../../store/slices/notificationSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500">Stay updated on MBO approvals, submissions, and cycle changes.</p>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 border-b py-4">
          <CardTitle className="text-sm font-semibold text-gray-700">All Notifications</CardTitle>
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
                  className="p-4 flex gap-4 transition-colors hover:bg-gray-50"
                >
                  <div className="mt-1 p-2 rounded-full bg-gray-50">
                    {getIconForType(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
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

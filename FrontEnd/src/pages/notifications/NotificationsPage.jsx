import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, CheckCircle2, XCircle, FileText, Calendar, CheckCheck } from 'lucide-react';
import { 
  selectNotifications, 
  selectUnreadCount,
  markReadThunk,
  markAllReadThunk 
} from '../../store/slices/notificationSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  // using mock data if slice is empty for demo purposes
  const storeNotifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  
  const mockNotifications = [
    { _id: 'n1', type: 'form_submitted', message: 'Mentee Taylor Swift submitted their MBO form', createdAt: '10 mins ago', isRead: false },
    { _id: 'n2', type: 'form_approved', message: 'Your MBO form was approved by David Kim', createdAt: '2 hours ago', isRead: false },
    { _id: 'n3', type: 'quarter_opened', message: 'Quarter Q3-2026 is now open for submissions', createdAt: '1 day ago', isRead: true },
    { _id: 'n4', type: 'form_rejected', message: 'Your MBO form was rejected. Resubmit required.', createdAt: '3 days ago', isRead: true },
    { _id: 'n5', type: 'quarter_closed', message: 'Quarter Q2-2026 has been closed', createdAt: '1 week ago', isRead: true },
  ];

  const notifications = storeNotifications?.length > 0 ? storeNotifications : mockNotifications;
  const mockUnreadCount = notifications.filter(n => !n.isRead).length;
  const displayUnreadCount = storeNotifications?.length > 0 ? unreadCount : mockUnreadCount;

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
        {displayUnreadCount > 0 && (
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
                  <p className="text-xs text-gray-500 mt-1">{notif.createdAt}</p>
                </div>
                {!notif.isRead && (
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;

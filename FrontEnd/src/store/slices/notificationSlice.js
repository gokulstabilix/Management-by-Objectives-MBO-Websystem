import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  list: [],
  recent: [],
  unreadCount: 0,
  isLoading: false,
  pollingIntervalId: null,
};

export const fetchNotificationsThunk = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data; // expects { list: [], unreadCount: 0 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markReadThunk = createAsyncThunk(
  'notifications/markRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      return notificationId;
    } catch (error) {
      return rejectWithValue('Failed to mark as read');
    }
  }
);

export const markAllReadThunk = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.patch('/notifications/read-all');
      return true;
    } catch (error) {
      return rejectWithValue('Failed to mark all as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.list = action.payload.list;
      state.unreadCount = action.payload.unreadCount;
    },
    setRecent: (state, action) => {
      state.recent = action.payload;
    },
    markOneReadLocal: (state, action) => {
      const id = action.payload;
      const notif = state.list.find((n) => n._id === id);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      const recentNotif = state.recent.find((n) => n._id === id);
      if (recentNotif && !recentNotif.isRead) {
        recentNotif.isRead = true;
      }
    },
    markAllReadLocal: (state) => {
      state.list.forEach((n) => (n.isRead = true));
      state.recent.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    },
    setPollingId: (state, action) => {
      state.pollingIntervalId = action.payload;
    },
    clearPolling: (state) => {
      if (state.pollingIntervalId) {
        clearInterval(state.pollingIntervalId);
        state.pollingIntervalId = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
      state.list = action.payload.list || [];
      state.recent = (action.payload.list || []).slice(0, 5);
      state.unreadCount = action.payload.unreadCount || 0;
    });
    builder.addCase(markReadThunk.fulfilled, (state, action) => {
      const id = action.payload;
      const notif = state.list.find((n) => n._id === id);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      const recentNotif = state.recent.find((n) => n._id === id);
      if (recentNotif && !recentNotif.isRead) {
        recentNotif.isRead = true;
      }
    });
    builder.addCase(markAllReadThunk.fulfilled, (state) => {
      state.list.forEach((n) => (n.isRead = true));
      state.recent.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    });
  },
});

export const {
  setNotifications,
  setRecent,
  markOneReadLocal,
  markAllReadLocal,
  setPollingId,
  clearPolling,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.list;
export const selectRecentNotifications = (state) => state.notifications.recent;
export const selectUnreadCount = (state) => state.notifications.unreadCount;

export default notificationSlice.reducer;

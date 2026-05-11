import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  list: [],
  recent: [],
  isLoading: false,
  pollingIntervalId: null,
};

export const fetchNotificationsThunk = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data.data; // { notifications: [] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.list = action.payload.list;
    },
    setRecent: (state, action) => {
      state.recent = action.payload;
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
    builder.addCase(fetchNotificationsThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.list = action.payload.notifications || [];
      state.recent = (action.payload.notifications || []).slice(0, 5);
    });
    builder.addCase(fetchNotificationsThunk.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export const {
  setNotifications,
  setRecent,
  setPollingId,
  clearPolling,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.list;
export const selectRecentNotifications = (state) => state.notifications.recent;

export default notificationSlice.reducer;

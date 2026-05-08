import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api'; // We'll create this next

// Initial State
const initialState = {
  user: null, // { id, name, email, role, level, mentorId, isActive, department }
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Thunks
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data.data; // expects { user, accessToken }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data.data;
    } catch (error) {
      return rejectWithValue('Session expired. Please log in again.');
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      return true;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.token || action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken || action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Refresh Token
    builder.addCase(refreshTokenThunk.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken || action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(refreshTokenThunk.rejected, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    });

    // Logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setCredentials, clearCredentials, setLoading, setError } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserMentorId = (state) => state.auth.user?.mentorId;
export const selectUserLevel = (state) => state.auth.user?.level;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;

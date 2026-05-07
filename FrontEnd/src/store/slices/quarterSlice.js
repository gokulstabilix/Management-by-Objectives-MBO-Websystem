import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  list: [],
  activeQuarter: null, // The currently open quarter (if any)
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchQuartersThunk = createAsyncThunk(
  'quarters/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/quarters');
      return response.data.data.quarters;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quarters');
    }
  }
);

export const createQuarterThunk = createAsyncThunk(
  'quarters/create',
  async (label, { rejectWithValue }) => {
    try {
      const response = await api.post('/quarters', { label });
      return response.data.data.quarter;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create quarter');
    }
  }
);

export const closeQuarterThunk = createAsyncThunk(
  'quarters/close',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/quarters/${id}/close`);
      return response.data.data.quarter;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to close quarter');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const quarterSlice = createSlice({
  name: 'quarters',
  initialState,
  reducers: {
    clearQuarterError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchAll
    builder.addCase(fetchQuartersThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchQuartersThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.list = action.payload || [];
      state.activeQuarter = action.payload?.find((q) => q.status === 'open') || null;
    });
    builder.addCase(fetchQuartersThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // create
    builder.addCase(createQuarterThunk.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(createQuarterThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.list.unshift(action.payload);
      if (action.payload.status === 'open') {
        state.activeQuarter = action.payload;
      }
    });
    builder.addCase(createQuarterThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });

    // close
    builder.addCase(closeQuarterThunk.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(closeQuarterThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      const idx = state.list.findIndex((q) => q._id === action.payload._id);
      if (idx !== -1) state.list[idx] = action.payload;
      if (state.activeQuarter?._id === action.payload._id) {
        state.activeQuarter = null;
      }
    });
    builder.addCase(closeQuarterThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });
  },
});

export const { clearQuarterError } = quarterSlice.actions;

// Selectors
export const selectQuarters = (state) => state.quarters.list;
export const selectActiveQuarter = (state) => state.quarters.activeQuarter;
export const selectQuartersLoading = (state) => state.quarters.isLoading;
export const selectQuartersSubmitting = (state) => state.quarters.isSubmitting;
export const selectQuartersError = (state) => state.quarters.error;

export default quarterSlice.reducer;

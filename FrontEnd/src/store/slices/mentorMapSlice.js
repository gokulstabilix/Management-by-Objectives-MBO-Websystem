import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  mappings: [], // { _id, name, level, department, mentorId, mentorName, hasMentor }
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchMappingsThunk = createAsyncThunk(
  'mentorMap/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch all employees (including those without mentors) for the mapping view
      // Use /users with role=employee and a high limit
      const response = await api.get('/users?role=employee&limit=200');
      const data = response.data.data;
      return data.users || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch mappings');
    }
  }
);

export const assignMentorThunk = createAsyncThunk(
  'mentorMap/assign',
  async ({ employeeId, mentorId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/mentor-map', { employeeId, mentorId });
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign mentor');
    }
  }
);

export const updateMentorThunk = createAsyncThunk(
  'mentorMap/update',
  async ({ employeeId, mentorId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/mentor-map/${employeeId}`, { mentorId });
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update mentor');
    }
  }
);

export const removeMentorThunk = createAsyncThunk(
  'mentorMap/remove',
  async (employeeId, { rejectWithValue }) => {
    try {
      await api.delete(`/mentor-map/${employeeId}`);
      return employeeId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove mentor');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const mentorMapSlice = createSlice({
  name: 'mentorMap',
  initialState,
  reducers: {
    clearMentorMapError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchAll
    builder.addCase(fetchMappingsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMappingsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.mappings = action.payload || [];
    });
    builder.addCase(fetchMappingsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // assign / update — both return updated user object, refresh mappings
    const handleMutate = (state) => {
      state.isSubmitting = false;
    };
    builder.addCase(assignMentorThunk.pending, (state) => { state.isSubmitting = true; state.error = null; });
    builder.addCase(assignMentorThunk.fulfilled, handleMutate);
    builder.addCase(assignMentorThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });

    builder.addCase(updateMentorThunk.pending, (state) => { state.isSubmitting = true; state.error = null; });
    builder.addCase(updateMentorThunk.fulfilled, handleMutate);
    builder.addCase(updateMentorThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });

    // remove
    builder.addCase(removeMentorThunk.pending, (state) => { state.isSubmitting = true; state.error = null; });
    builder.addCase(removeMentorThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      const idx = state.mappings.findIndex((m) => m._id === action.payload);
      if (idx !== -1) {
        state.mappings[idx].mentorId = null;
        state.mappings[idx].hasMentor = false;
      }
    });
    builder.addCase(removeMentorThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });
  },
});

export const { clearMentorMapError } = mentorMapSlice.actions;

// Selectors
export const selectMappings = (state) => state.mentorMap.mappings;
export const selectMentorMapLoading = (state) => state.mentorMap.isLoading;
export const selectMentorMapSubmitting = (state) => state.mentorMap.isSubmitting;
export const selectMentorMapError = (state) => state.mentorMap.error;

export default mentorMapSlice.reducer;

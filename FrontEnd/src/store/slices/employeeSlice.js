import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  list: [],
  total: 0,
  page: 1,
  pages: 1,
  selectedEmployee: null,
  isLoading: false,
  isLoadingProfile: false,
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchEmployeesThunk = createAsyncThunk(
  'employees/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Backend uses 'name' param for search
      const apiParams = { ...params };
      if (apiParams.search) {
        apiParams.name = apiParams.search;
        delete apiParams.search;
      }
      const query = new URLSearchParams(apiParams).toString();
      const response = await api.get(`/users?${query}`);
      return response.data.data; // { users, total, page, pages }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const fetchEmployeeByIdThunk = createAsyncThunk(
  'employees/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data; // { user, mentees, mboHistory }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee');
    }
  }
);

export const createEmployeeThunk = createAsyncThunk(
  'employees/create',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/users', employeeData);
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create employee');
    }
  }
);

export const updateEmployeeThunk = createAsyncThunk(
  'employees/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${id}`, data);
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update employee');
    }
  }
);

export const deactivateEmployeeThunk = createAsyncThunk(
  'employees/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(`/users/${id}/deactivate`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate employee');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchAll
    builder.addCase(fetchEmployeesThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchEmployeesThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.list = action.payload.users || [];
      state.total = action.payload.total || 0;
      state.page = action.payload.page || 1;
      state.pages = action.payload.pages || 1;
    });
    builder.addCase(fetchEmployeesThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // fetchById
    builder.addCase(fetchEmployeeByIdThunk.pending, (state) => {
      state.isLoadingProfile = true;
      state.error = null;
    });
    builder.addCase(fetchEmployeeByIdThunk.fulfilled, (state, action) => {
      state.isLoadingProfile = false;
      state.selectedEmployee = action.payload;
    });
    builder.addCase(fetchEmployeeByIdThunk.rejected, (state, action) => {
      state.isLoadingProfile = false;
      state.error = action.payload;
    });

    // create
    builder.addCase(createEmployeeThunk.fulfilled, (state, action) => {
      state.list.unshift(action.payload);
      state.total += 1;
    });

    // update
    builder.addCase(updateEmployeeThunk.fulfilled, (state, action) => {
      const idx = state.list.findIndex((e) => e._id === action.payload._id);
      if (idx !== -1) state.list[idx] = action.payload;
      if (state.selectedEmployee?.user?._id === action.payload._id) {
        state.selectedEmployee.user = action.payload;
      }
    });

    // deactivate
    builder.addCase(deactivateEmployeeThunk.fulfilled, (state, action) => {
      const idx = state.list.findIndex((e) => e._id === action.payload);
      if (idx !== -1) state.list[idx].isActive = false;
      if (state.selectedEmployee?.user?._id === action.payload) {
        state.selectedEmployee.user.isActive = false;
      }
    });
  },
});

export const { clearSelectedEmployee, clearError } = employeeSlice.actions;

// Selectors
export const selectEmployees = (state) => state.employees.list;
export const selectEmployeeTotal = (state) => state.employees.total;
export const selectEmployeePage = (state) => state.employees.page;
export const selectEmployeePages = (state) => state.employees.pages;
export const selectSelectedEmployee = (state) => state.employees.selectedEmployee;
export const selectEmployeesLoading = (state) => state.employees.isLoading;
export const selectEmployeeProfileLoading = (state) => state.employees.isLoadingProfile;
export const selectEmployeesError = (state) => state.employees.error;

export default employeeSlice.reducer;

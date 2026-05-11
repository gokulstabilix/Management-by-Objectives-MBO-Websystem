import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  // Employee: my own forms
  myForms: [],
  selectedForm: null, // The form currently open in the form builder
  // Mentor: mentee assignment view (source-of-truth — includes mentees without forms)
  myMentees: [],
  isLoadingMyMentees: false,
  // Mentor: mentee forms (legacy review workflow — only mentees with forms)
  menteeForms: [],
  selectedMenteeForm: null,
  // Admin/HR: full list
  adminForms: [],
  adminTotal: 0,
  adminPage: 1,
  adminPages: 1,
  // UI state
  isLoading: false,
  isLoadingForm: false,
  isLoadingMenteeForms: false,
  isSubmitting: false,
  error: null,
};

// ── Thunks: Employee ──────────────────────────────────────────────────────────

export const fetchMyFormsThunk = createAsyncThunk(
  'mbo/fetchMyForms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/mbo/my');
      return response.data.data.forms;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch MBO forms');
    }
  }
);

export const fetchFormByIdThunk = createAsyncThunk(
  'mbo/fetchFormById',
  async (formId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/mbo/${formId}`);
      return response.data.data.form;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch MBO form');
    }
  }
);

export const createDraftThunk = createAsyncThunk(
  'mbo/createDraft',
  async ({ quarterId, objectives }, { rejectWithValue }) => {
    try {
      const response = await api.post('/mbo', { quarterId, objectives });
      return response.data.data.form;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create draft');
    }
  }
);

export const updateDraftThunk = createAsyncThunk(
  'mbo/updateDraft',
  async ({ id, objectives }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/mbo/${id}`, { objectives });
      return response.data.data.form;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save draft');
    }
  }
);

export const submitFormThunk = createAsyncThunk(
  'mbo/submitForm',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/mbo/${id}/submit`);
      return response.data.data.form;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit form');
    }
  }
);

export const resubmitFormThunk = createAsyncThunk(
  'mbo/resubmitForm',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/mbo/${id}/resubmit`);
      return response.data.data.form;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resubmit form');
    }
  }
);

// ── Thunks: Phase 2 (Accomplishments) ─────────────────────────────────────────

export const saveAccomplishmentsThunk = createAsyncThunk(
  'mbo/saveAccomplishments',
  async ({ id, accomplishments }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/mbo/${id}/accomplishments`, { accomplishments });
      return response.data.data.form;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save accomplishments');
    }
  }
);

export const submitAccomplishmentsThunk = createAsyncThunk(
  'mbo/submitAccomplishments',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/mbo/${id}/accomplishments/submit`);
      return response.data.data.form;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit accomplishments');
    }
  }
);

// ── Thunks: Mentor ────────────────────────────────────────────────────────────

export const fetchMenteeFormsThunk = createAsyncThunk(
  'mbo/fetchMenteeForms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/mbo/mentees');
      return response.data.data.forms;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch mentee forms');
    }
  }
);

/**
 * fetchMyMenteesThunk
 * Calls GET /mbo/my-mentees — the new source-of-truth endpoint.
 * Returns { employee, latestForm | null } for EVERY assigned mentee,
 * including those who have not yet started an MBO form.
 */
export const fetchMyMenteesThunk = createAsyncThunk(
  'mbo/fetchMyMentees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/mbo/my-mentees');
      return response.data.data.mentees;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch mentees');
    }
  }
);

export const fetchMenteeFormDetailThunk = createAsyncThunk(
  'mbo/fetchMenteeFormDetail',
  async (formId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/mbo/mentees/${formId}`);
      return response.data.data.form;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch form detail');
    }
  }
);

export const reviewFormThunk = createAsyncThunk(
  'mbo/reviewForm',
  async ({ id, decision, comment }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/mbo/${id}/review`, { decision, comment });
      return response.data.data.form;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

/** Phase 2 final review by mentor: includes per-objective scores and overall comment. */
export const finalReviewThunk = createAsyncThunk(
  'mbo/finalReview',
  async ({ id, objectives, overallComment, decision }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/mbo/${id}/final-review`, {
        objectives,
        overallComment,
        decision,
      });
      return response.data.data.form;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit final review');
    }
  }
);

// ── Thunks: Admin/HR ──────────────────────────────────────────────────────────

export const fetchAdminFormsThunk = createAsyncThunk(
  'mbo/fetchAdminForms',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.get(`/mbo?${query}`);
      return response.data.data; // { forms, total, page, pages }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch MBO forms');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const mboSlice = createSlice({
  name: 'mbo',
  initialState,
  reducers: {
    clearMboError: (state) => {
      state.error = null;
    },
    clearSelectedForm: (state) => {
      state.selectedForm = null;
    },
    clearSelectedMenteeForm: (state) => {
      state.selectedMenteeForm = null;
    },
  },
  extraReducers: (builder) => {
    // fetchMyForms
    builder.addCase(fetchMyFormsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMyFormsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.myForms = action.payload || [];
    });
    builder.addCase(fetchMyFormsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // fetchFormById (direct single-form fetch)
    builder.addCase(fetchFormByIdThunk.pending, (state) => {
      state.isLoadingForm = true;
      state.error = null;
    });
    builder.addCase(fetchFormByIdThunk.fulfilled, (state, action) => {
      state.isLoadingForm = false;
      state.selectedForm = action.payload;
      // Also add/update in myForms list if not present
      const idx = state.myForms.findIndex((f) => f._id === action.payload._id);
      if (idx !== -1) {
        state.myForms[idx] = action.payload;
      } else {
        state.myForms.unshift(action.payload);
      }
    });
    builder.addCase(fetchFormByIdThunk.rejected, (state, action) => {
      state.isLoadingForm = false;
      state.error = action.payload;
    });

    // createDraft
    builder.addCase(createDraftThunk.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(createDraftThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.myForms.unshift(action.payload);
      state.selectedForm = action.payload;
    });
    builder.addCase(createDraftThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });

    // updateDraft
    builder.addCase(updateDraftThunk.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(updateDraftThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      const idx = state.myForms.findIndex((f) => f._id === action.payload._id);
      if (idx !== -1) state.myForms[idx] = action.payload;
      state.selectedForm = action.payload;
    });
    builder.addCase(updateDraftThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });

    // submitForm / resubmitForm — same shape of response
    const handleFormUpdate = (state, action) => {
      state.isSubmitting = false;
      const idx = state.myForms.findIndex((f) => f._id === action.payload._id);
      if (idx !== -1) state.myForms[idx] = action.payload;
      state.selectedForm = action.payload;
    };
    builder.addCase(submitFormThunk.pending, (state) => { state.isSubmitting = true; });
    builder.addCase(submitFormThunk.fulfilled, handleFormUpdate);
    builder.addCase(submitFormThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });
    builder.addCase(resubmitFormThunk.pending, (state) => { state.isSubmitting = true; });
    builder.addCase(resubmitFormThunk.fulfilled, handleFormUpdate);
    builder.addCase(resubmitFormThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });

    // saveAccomplishments
    builder.addCase(saveAccomplishmentsThunk.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(saveAccomplishmentsThunk.fulfilled, handleFormUpdate);
    builder.addCase(saveAccomplishmentsThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });

    // submitAccomplishments
    builder.addCase(submitAccomplishmentsThunk.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(submitAccomplishmentsThunk.fulfilled, handleFormUpdate);
    builder.addCase(submitAccomplishmentsThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });

    // fetchMenteeForms
    builder.addCase(fetchMenteeFormsThunk.pending, (state) => {
      state.isLoadingMenteeForms = true;
      state.error = null;
    });
    builder.addCase(fetchMenteeFormsThunk.fulfilled, (state, action) => {
      state.isLoadingMenteeForms = false;
      state.menteeForms = action.payload || [];
    });
    builder.addCase(fetchMenteeFormsThunk.rejected, (state, action) => {
      state.isLoadingMenteeForms = false;
      state.error = action.payload;
    });

    // fetchMyMentees — source-of-truth mentee list
    builder.addCase(fetchMyMenteesThunk.pending, (state) => {
      state.isLoadingMyMentees = true;
      state.error = null;
    });
    builder.addCase(fetchMyMenteesThunk.fulfilled, (state, action) => {
      state.isLoadingMyMentees = false;
      state.myMentees = action.payload || [];
    });
    builder.addCase(fetchMyMenteesThunk.rejected, (state, action) => {
      state.isLoadingMyMentees = false;
      state.error = action.payload;
    });

    // fetchMenteeFormDetail
    builder.addCase(fetchMenteeFormDetailThunk.pending, (state) => {
      state.isLoadingForm = true;
      state.error = null;
    });
    builder.addCase(fetchMenteeFormDetailThunk.fulfilled, (state, action) => {
      state.isLoadingForm = false;
      state.selectedMenteeForm = action.payload;
    });
    builder.addCase(fetchMenteeFormDetailThunk.rejected, (state, action) => {
      state.isLoadingForm = false;
      state.error = action.payload;
    });

    // reviewForm (Phase 1 review)
    builder.addCase(reviewFormThunk.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(reviewFormThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      // Update in menteeForms list
      const idx = state.menteeForms.findIndex((f) => f._id === action.payload._id);
      if (idx !== -1) state.menteeForms[idx] = action.payload;
      state.selectedMenteeForm = action.payload;
    });
    builder.addCase(reviewFormThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });

    // finalReview (Phase 2 review)
    builder.addCase(finalReviewThunk.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(finalReviewThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      const idx = state.menteeForms.findIndex((f) => f._id === action.payload._id);
      if (idx !== -1) state.menteeForms[idx] = action.payload;
      state.selectedMenteeForm = action.payload;
    });
    builder.addCase(finalReviewThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });

    // fetchAdminForms
    builder.addCase(fetchAdminFormsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminFormsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.adminForms = action.payload.forms || [];
      state.adminTotal = action.payload.total || 0;
      state.adminPage = action.payload.page || 1;
      state.adminPages = action.payload.pages || 1;
    });
    builder.addCase(fetchAdminFormsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export const { clearMboError, clearSelectedForm, clearSelectedMenteeForm } = mboSlice.actions;

// Selectors
export const selectMyForms = (state) => state.mbo.myForms;
export const selectSelectedForm = (state) => state.mbo.selectedForm;
export const selectMenteeForms = (state) => state.mbo.menteeForms;
export const selectMyMentees = (state) => state.mbo.myMentees;          // source-of-truth
export const selectMyMenteesLoading = (state) => state.mbo.isLoadingMyMentees;
export const selectSelectedMenteeForm = (state) => state.mbo.selectedMenteeForm;
export const selectAdminForms = (state) => state.mbo.adminForms;
export const selectAdminFormsTotal = (state) => state.mbo.adminTotal;
export const selectMboLoading = (state) => state.mbo.isLoading;
export const selectMboFormLoading = (state) => state.mbo.isLoadingForm;
export const selectMenteeFormsLoading = (state) => state.mbo.isLoadingMenteeForms;
export const selectMboSubmitting = (state) => state.mbo.isSubmitting;
export const selectMboError = (state) => state.mbo.error;

export default mboSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import employeeReducer from './slices/employeeSlice';
import quarterReducer from './slices/quarterSlice';
import mboReducer from './slices/mboSlice';
import mentorMapReducer from './slices/mentorMapSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    employees: employeeReducer,
    quarters: quarterReducer,
    mbo: mboReducer,
    mentorMap: mentorMapReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
});

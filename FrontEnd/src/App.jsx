import { useEffect, Suspense, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import { refreshTokenThunk, selectIsAuthenticated, selectIsInitialized } from './store/slices/authSlice';
import { fetchNotificationsThunk } from './store/slices/notificationSlice';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);
  const pollingRef = useRef(null);

  // Rehydrate Session on Mount
  useEffect(() => {
    // We attempt to refresh the token on mount to see if user is already logged in
    dispatch(refreshTokenThunk());
  }, [dispatch]);

  // Notifications Polling
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      // Initial fetch
      dispatch(fetchNotificationsThunk());
      
      // Set up polling every 60 seconds
      pollingRef.current = setInterval(() => {
        dispatch(fetchNotificationsThunk());
      }, 60000);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
  }, [isAuthenticated, isInitialized, dispatch]);

  if (!isInitialized) {
    // Splash/Loading screen while checking auth status
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Initializing application...</p>
      </div>
    );
  }

  const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
}

export default App;

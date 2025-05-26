import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getCurrentUser, checkDeviceSecurity } from './src/slices/authSlice';
import { getAccessToken } from './src/utils/auth';
import { logger, logSecurityEvent } from './src/utils/logger';
import { performSecurityCheck } from './src/utils/securityUtils';
import Config from 'react-native-config';

function App(): React.JSX.Element {
  const [appState, setAppState] = useState(AppState.currentState);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const SESSION_TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Handle app state changes for security (background/foreground)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        logger.info('App came to foreground');
        
        // Perform security check when app returns to foreground
        const securityCheck = await performSecurityCheck();
        if (!securityCheck.isSecure) {
          store.dispatch(checkDeviceSecurity());
          logSecurityEvent('security_issue_detected_on_resume', {
            issues: securityCheck.issues,
          }, 'warn');
        }
        
        // Check authentication status
        await checkAuthStatus();
      } else if (nextAppState.match(/inactive|background/) && appState === 'active') {
        // App went to background
        logger.info('App went to background');
      }
      
      setAppState(nextAppState);
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [appState]);

  // Session timeout management
  useEffect(() => {
    const setupSessionTimeout = async () => {
      const token = await getAccessToken();
      
      // Clear any existing timeout
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
      
      // If user is logged in, set up session timeout
      if (token) {
        const timeout = setTimeout(() => {
          // Session expired, log user out
          logSecurityEvent('session_timeout', {}, 'info');
          // We would typically dispatch logout action here, but for demo we'll just log
          logger.info('Session timeout would trigger logout');
        }, SESSION_TIMEOUT_DURATION);
        
        setSessionTimeout(timeout);
      }
    };
    
    setupSessionTimeout();
    
    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [appState]); // Reset timeout when app state changes

  // Initial authentication check
  const checkAuthStatus = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        // If token exists, try to get current user
        store.dispatch(getCurrentUser());
        
        // Perform security check
        store.dispatch(checkDeviceSecurity());
      }
    } catch (error) {
      logger.error('Failed to check authentication status', { error });
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Log app start for security auditing
    logSecurityEvent('app_started', {
      version: Config.APP_VERSION || 'unknown',
    });
  }, []);

  return (
    <StoreProvider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <AppNavigator />
        </SafeAreaProvider>
      </PaperProvider>
    </StoreProvider>
  );
}

export default App;
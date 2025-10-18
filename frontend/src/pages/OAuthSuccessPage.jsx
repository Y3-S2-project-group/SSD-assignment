import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLoggedInUser, selectIsAuthChecked } from '../features/auth/AuthSlice';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const loggedInUser = useSelector(selectLoggedInUser);
    const isAuthChecked = useSelector(selectIsAuthChecked);

    useEffect(() => {
        const handleOAuthSuccess = async () => {
            try {
                // Get user data from URL params
                const userParam = searchParams.get('user');
                
                console.log('OAuth Success page - user param:', userParam);
                
                if (userParam) {
                    console.log('User data found in URL, waiting for auth check...');
                    
                    // Instead of manually calling checkAuthAsync, 
                    // wait for the useAuthCheck hook in App.js to handle it
                    const checkAuth = () => {
                        if (isAuthChecked) {
                            if (loggedInUser) {
                                console.log('Auth check complete, user logged in, navigating to home');
                                navigate('/', { replace: true });
                            } else {
                                console.log('Auth check complete, but no user found, navigating to login');
                                navigate('/login?error=oauth_failed', { replace: true });
                            }
                        } else {
                            // Wait a bit more for auth check to complete
                            setTimeout(checkAuth, 500);
                        }
                    };
                    
                    // Start checking after a small delay to let useAuthCheck run first
                    setTimeout(checkAuth, 1000);
                } else {
                    console.log('No user data, redirecting to login');
                    navigate('/login?error=oauth_failed', { replace: true });
                }
            } catch (error) {
                console.error('OAuth success handling error:', error);
                navigate('/login?error=oauth_failed', { replace: true });
            }
        };

        handleOAuthSuccess();
    }, [navigate, searchParams, loggedInUser, isAuthChecked]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Completing sign in...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait while we verify your authentication...</p>
            </div>
        </div>
    );
};

export default OAuthSuccess;
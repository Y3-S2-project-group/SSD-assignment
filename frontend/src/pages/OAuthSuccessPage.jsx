import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuthAsync } from '../features/auth/AuthSlice';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleOAuthSuccess = async () => {
            try {
                // Get user data from URL params
                const userParam = searchParams.get('user');
                
                console.log('OAuth Success page - user param:', userParam);
                
                if (userParam) {
                    // User data exists, meaning OAuth was successful
                    console.log('User data found, attempting to check auth...');
                    
                    // Add a small delay to ensure cookie is set properly
                    setTimeout(async () => {
                        try {
                            // Check authentication status to update Redux store
                            const result = await dispatch(checkAuthAsync());
                            console.log('checkAuthAsync result:', result);
                            
                            if (result.type.includes('fulfilled')) {
                                console.log('Auth check successful, navigating to home');
                                navigate('/', { replace: true });
                            } else {
                                console.log('Auth check failed, navigating to login');
                                navigate('/login?error=oauth_failed', { replace: true });
                            }
                        } catch (error) {
                            console.error('Error during auth check:', error);
                            navigate('/login?error=oauth_failed', { replace: true });
                        }
                    }, 1000); // 1 second delay
                } else {
                    console.log('No user data, redirecting to login');
                    // No user data, redirect to login
                    navigate('/login?error=oauth_failed', { replace: true });
                }
            } catch (error) {
                console.error('OAuth success handling error:', error);
                navigate('/login?error=oauth_failed', { replace: true });
            }
        };

        handleOAuthSuccess();
    }, [dispatch, navigate, searchParams]);

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
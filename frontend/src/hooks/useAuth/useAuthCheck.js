import { useEffect, useRef } from 'react'
import { checkAuthAsync, selectIsAuthChecked, selectAuthCheckStatus } from '../../features/auth/AuthSlice'
import { useDispatch, useSelector } from 'react-redux'

// Global flag to prevent multiple simultaneous auth checks across all instances
let isAuthCheckInProgress = false;

export const useAuthCheck = () => {

    const dispatch = useDispatch();
    const isAuthChecked = useSelector(selectIsAuthChecked);
    const authCheckStatus = useSelector(selectAuthCheckStatus);
    const hasCheckedRef = useRef(false);

    useEffect(()=>{
        console.log('useAuthCheck effect triggered:', { 
            isAuthChecked, 
            authCheckStatus, 
            isAuthCheckInProgress,
            hasCheckedRef: hasCheckedRef.current 
        });
        
        // Only check auth if:
        // 1. It hasn't been checked yet
        // 2. No auth check is currently in progress (global flag)
        // 3. This hook instance hasn't already triggered a check
        if (!isAuthChecked && !isAuthCheckInProgress && !hasCheckedRef.current) {
            console.log('Dispatching checkAuthAsync from useAuthCheck...');
            isAuthCheckInProgress = true;
            hasCheckedRef.current = true;
            
            dispatch(checkAuthAsync()).finally(() => {
                isAuthCheckInProgress = false;
            });
        } else {
            console.log('Skipping auth check:', { 
                isAuthChecked, 
                authCheckStatus, 
                isAuthCheckInProgress,
                hasCheckedRef: hasCheckedRef.current 
            });
        }
    },[dispatch, isAuthChecked, authCheckStatus])
}

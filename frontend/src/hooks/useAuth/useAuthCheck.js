import { useEffect } from 'react'
import { checkAuthAsync, selectIsAuthChecked, selectAuthStatus } from '../../features/auth/AuthSlice'
import { useDispatch, useSelector } from 'react-redux'

export const useAuthCheck = () => {

    const dispatch = useDispatch();
    const isAuthChecked = useSelector(selectIsAuthChecked);
    const authStatus = useSelector(selectAuthStatus);

    useEffect(()=>{
        // Only check auth if it hasn't been checked yet and no auth check is currently in progress
        if (!isAuthChecked && authStatus !== 'pending') {
            console.log('Checking authentication...');
            dispatch(checkAuthAsync())
        }
    },[dispatch, isAuthChecked, authStatus])
}

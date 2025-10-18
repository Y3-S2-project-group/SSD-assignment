import { useEffect, useRef } from 'react'
import { selectLoggedInUser } from '../../features/auth/AuthSlice'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAddressByUserIdAsync } from '../../features/address/AddressSlice'
import { fetchWishlistByUserIdAsync } from '../../features/wishlist/WishlistSlice'
import { fetchCartByUserIdAsync } from '../../features/cart/CartSlice'
import { fetchAllCategoriesAsync } from '../../features/categories/CategoriesSlice'
import { fetchAllBrandsAsync } from '../../features/brands/BrandSlice'
import { fetchLoggedInUserByIdAsync } from '../../features/user/UserSlice'

export const useFetchLoggedInUserDetails = () => {
    
    const loggedInUser=useSelector(selectLoggedInUser)
    const dispatch = useDispatch();
    const hasFetchedRef = useRef(false);

    useEffect(()=>{
        /* when a user is logged in then this dispatches an action to get all the details of loggedInUser, 
        as while login and signup only the bare-minimum information is sent by the server */
        if(loggedInUser?.isVerified && loggedInUser?._id && !hasFetchedRef.current){
          console.log('Fetching user details for:', loggedInUser._id);
          hasFetchedRef.current = true;
          
          dispatch(fetchLoggedInUserByIdAsync(loggedInUser._id))
          dispatch(fetchAllBrandsAsync())
          dispatch(fetchAllCategoriesAsync())
    
          if(!loggedInUser.isAdmin){
            dispatch(fetchCartByUserIdAsync(loggedInUser._id))
            dispatch(fetchAddressByUserIdAsync(loggedInUser._id))
            dispatch(fetchWishlistByUserIdAsync(loggedInUser._id))
          }
        }
        
        // Reset the flag when user logs out
        if (!loggedInUser) {
            hasFetchedRef.current = false;
        }
    },[loggedInUser, dispatch]) // Include loggedInUser as dependency
}

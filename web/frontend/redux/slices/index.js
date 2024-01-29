import { combineReducers } from '@reduxjs/toolkit';
import { shopSlice } from './shopSlice';

const reducer = combineReducers({
    [shopSlice.name]: shopSlice.reducer,
});

export { reducer };

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, loginParam } from '../../api/user';
export const fetchLogin = createAsyncThunk(
    'user/auth/login',
    async (params: loginParam, thunkAPI) => {
        const data = await login({...params});
        return data;
    }
)

export const userSlice = createSlice({
 name: 'user',
 initialState: {
    info: {},
    token: ''
 },
 reducers: {
    setInfo: (state, action) => {
        state.info = action.payload;
    }
 },
 extraReducers: (builder) => {
    builder.addCase(fetchLogin.fulfilled, (state,action) => {
        state.info = action.payload;
        state.token = action.payload.token;
    })
 }
})

export const { setInfo } = userSlice.actions;
export default userSlice.reducer;
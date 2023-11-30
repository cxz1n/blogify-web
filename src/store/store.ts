import { configureStore } from "@reduxjs/toolkit";
import userReducer from './modules/user';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'root',
    version: 1,
    storage
}
// 持久化根reducers
const persistedReducer = persistReducer(persistConfig, userReducer);
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
    }),
})
let persistor = persistStore(store);
export default store;
export { persistor }
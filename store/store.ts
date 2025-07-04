import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import persistStore from "redux-persist/es/persistStore";
import storage from "redux-persist/lib/storage";
import authSlice from "./features/auth/authSlice";
import adminSlice from "./features/admin/adminSlice";
import patientSlice from "./features/patient/patientSlice";
import forgotPassSlice from "./features/forgotPassword/forgotPasswordSlice";
import scheduleSlice from "./features/schedule/scheduleSlice";
import reportSlice from "./features/reports/reportSlice";

const reducers = combineReducers({
  auth: authSlice,
  staff: adminSlice,
  patient: patientSlice,
  forgotpass: forgotPassSlice,
  schedule: scheduleSlice,
  reports: reportSlice,
});

const persistConfig = {
  key: "root",
  storage,
};

const persistReducers = persistReducer(persistConfig, reducers);
const store = configureStore({
  reducer: persistReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist action types that contain non-serializable values
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;

const persistor = persistStore(store);
export { persistor };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

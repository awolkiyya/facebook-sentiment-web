import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/user.slice"
import languageReducer from "./slices/language.slice"
import mfaReducer from "@/lib/store/slices/mfa.slice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    language:languageReducer,
    mfa: mfaReducer,

  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
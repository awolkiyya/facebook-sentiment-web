import { AuthSecurity, AuthUser } from "@/types/user";
import {
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";



/*
|--------------------------------------------------------------------------
| AUTH STATE
|--------------------------------------------------------------------------
*/

interface AuthState {
  user: AuthUser | null;

  security: AuthSecurity | null;

  isAuthenticated: boolean;
  isLoading: boolean;
}

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState: AuthState = {
  user: null,
  security: null,

  isAuthenticated: false,
  isLoading: true,
};

/*
|--------------------------------------------------------------------------
| AUTH SLICE
|--------------------------------------------------------------------------
*/

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    /*
    |--------------------------------------------------------------------------
    | SET AUTHENTICATED USER
    |--------------------------------------------------------------------------
    |
    | Laravel Sanctum owns the authentication session.
    |
    | Redux stores:
    | - authenticated user
    | - current security context
    |
    */

    setAuth: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        security?: AuthSecurity | null;
      }>
    ) => {
      state.user = action.payload.user;

      state.security =
        action.payload.security ?? null;

      state.isAuthenticated = true;
      state.isLoading = false;
    },

    /*
    |--------------------------------------------------------------------------
    | SET USER
    |--------------------------------------------------------------------------
    |
    | Used when only the authenticated user needs to be updated.
    |
    | Existing security state is preserved.
    |
    */

    setUser: (
      state,
      action: PayloadAction<AuthUser>
    ) => {
      state.user = action.payload;

      state.isAuthenticated = true;
      state.isLoading = false;
    },

    /*
    |--------------------------------------------------------------------------
    | SET SECURITY
    |--------------------------------------------------------------------------
    |
    | Updates the current authentication/security context
    | without replacing the authenticated user.
    |
    */

    setSecurity: (
      state,
      action: PayloadAction<AuthSecurity | null>
    ) => {
      state.security = action.payload;
    },

    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    |
    | Clear all authentication-related Redux state.
    |
    */

    logout: (state) => {
      state.user = null;
      state.security = null;

      state.isAuthenticated = false;
      state.isLoading = false;
    },

    /*
    |--------------------------------------------------------------------------
    | AUTH LOADING
    |--------------------------------------------------------------------------
    |
    | Used while /auth/web-me or /auth/web-session
    | is being resolved.
    |
    */

    setLoading: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isLoading = action.payload;
    },
  },
});

/*
|--------------------------------------------------------------------------
| ACTIONS
|--------------------------------------------------------------------------
*/

export const {
  setAuth,
  setUser,
  setSecurity,
  logout,
  setLoading,
} = authSlice.actions;

/*
|--------------------------------------------------------------------------
| REDUCER
|--------------------------------------------------------------------------
*/

export default authSlice.reducer;


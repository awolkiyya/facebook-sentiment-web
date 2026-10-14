import { createSlice } from "@reduxjs/toolkit";

import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

/*
|--------------------------------------------------------------------------
| MFA Challenge State
|--------------------------------------------------------------------------
|
| Holds the in-flight MFA challenge issued after a successful
| email/password login when the account requires verification
| before authentication is complete.
|
| Lives in memory only (not persisted) — a page refresh on
| /mfa/verify will lose this and should redirect back to /login.
|
*/

export interface MfaChallengeState {
  challengeId: string | null;
  expiresAt: number | null;
  setupRequired: boolean;
}

const initialState: MfaChallengeState = {
  challengeId: null,
  expiresAt: null,
  setupRequired: false,
};

/*
|--------------------------------------------------------------------------
| Set MFA Challenge Payload
|--------------------------------------------------------------------------
*/

export interface SetMfaChallengePayload {
  challengeId: string;
  expiresAt: number;
  setupRequired: boolean;
}

/*
|--------------------------------------------------------------------------
| Slice
|--------------------------------------------------------------------------
*/

const mfaSlice = createSlice({
  name: "mfa",
  initialState,
  reducers: {
    /*
    |--------------------------------------------------------------------------
    | Set MFA Challenge
    |--------------------------------------------------------------------------
    |
    | Called immediately after login returns an MFA challenge,
    | before redirecting to /mfa/verify.
    |
    */

    setMfaChallenge: (
      state,
      action: PayloadAction<SetMfaChallengePayload>,
    ) => {
      state.challengeId = action.payload.challengeId;
      state.expiresAt = action.payload.expiresAt;
      state.setupRequired = action.payload.setupRequired;
    },

    /*
    |--------------------------------------------------------------------------
    | Clear MFA Challenge
    |--------------------------------------------------------------------------
    |
    | Called after successful verification, on expiry, or when
    | the user navigates away from /mfa/verify without completing it.
    |
    */

    clearMfaChallenge: (state) => {
      state.challengeId = null;
      state.expiresAt = null;
      state.setupRequired = false;
    },
  },
});

/*
|--------------------------------------------------------------------------
| Actions
|--------------------------------------------------------------------------
*/

export const {
  setMfaChallenge,
  clearMfaChallenge,
} = mfaSlice.actions;

/*
|--------------------------------------------------------------------------
| Selectors
|--------------------------------------------------------------------------
*/

export const selectMfaChallenge = (
  state: RootState,
): MfaChallengeState => state.mfa;

export const selectIsMfaChallengeExpired = (
  state: RootState,
): boolean => {
  const { expiresAt } = state.mfa;

  if (!expiresAt) {
    return true;
  }

  return Date.now() >= expiresAt;
};

/*
|--------------------------------------------------------------------------
| Reducer
|--------------------------------------------------------------------------
*/

export default mfaSlice.reducer;
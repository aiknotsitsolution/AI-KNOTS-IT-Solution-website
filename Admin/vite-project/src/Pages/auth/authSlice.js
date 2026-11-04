// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("authUser") || "null");
  } catch {
    return null;
  }
};

export const verifyLoginOtp = createAsyncThunk(
  "auth/verifyLoginOtp",
  async ({ challengeId, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "https://api.aiknotsit.com"}/api/auth/login/verify-otp`,
        { challengeId, otp },
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data?.message ||
          err.message ||
          "Unable to verify the sign-in code. Please try again.",
        code: err.response?.data?.code,
      });
    }
  },
);

const initialState = {
  token: localStorage.getItem("token") || null,
  user: getStoredUser(),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("authUser");
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    // You can add more reducers if needed (clearError, etc.)
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyLoginOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyLoginOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("authUser", JSON.stringify(action.payload.user));
      })
      .addCase(verifyLoginOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "OTP verification failed.";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

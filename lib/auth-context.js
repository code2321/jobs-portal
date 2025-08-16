"use client"
import { createContext, useContext, useReducer, useEffect } from "react"

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        error: null,
      }
    case "LOGIN_ERROR":
      return { ...state, loading: false, error: action.payload, isAuthenticated: false }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,
  error: null,
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (typeof window === "undefined") {
          dispatch({ type: "SET_LOADING", payload: false })
          return
        }

        console.log("[v0] Initializing auth context")

        const storedToken = localStorage.getItem("accessToken")
        const storedRefreshToken = localStorage.getItem("refreshToken")
        const storedUser = localStorage.getItem("user")

        console.log("[v0] Stored tokens found:", !!storedToken, !!storedRefreshToken, !!storedUser)

        if (storedToken && storedRefreshToken && storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log("[v0] Restoring user session:", parsedUser.email)

          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: parsedUser,
              accessToken: storedToken,
              refreshToken: storedRefreshToken,
            },
          })
        } else {
          console.log("[v0] No stored session found, showing auth page")
          dispatch({ type: "SET_LOADING", payload: false })
        }
      } catch (error) {
        console.error("[v0] Error initializing auth:", error)
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    initializeAuth()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" })

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)
      localStorage.setItem("user", JSON.stringify(data.user))

      dispatch({ type: "LOGIN_SUCCESS", payload: data })
      return { success: true }
    } catch (error) {
      dispatch({ type: "LOGIN_ERROR", payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    dispatch({ type: "LOGIN_START" })

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)
      localStorage.setItem("user", JSON.stringify(data.user))

      dispatch({ type: "LOGIN_SUCCESS", payload: data })
      return { success: true }
    } catch (error) {
      dispatch({ type: "LOGIN_ERROR", payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    dispatch({ type: "LOGOUT" })
  }

  const refreshAccessToken = async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: state.refreshToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error("Token refresh failed")
      }

      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          ...state,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      })

      return data.accessToken
    } catch (error) {
      logout()
      throw error
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    refreshAccessToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

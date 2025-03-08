import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Toaster } from "react-hot-toast";

const AuthContext = createContext();

// Set base URL for consistent API calls
const API_BASE_URL = "http://localhost:8080/api";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  // Function to get token from localStorage
  const getToken = () => localStorage.getItem("token");

  async function loginUser(login, navigate) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/user/login`, login);
      console.log("Login response:", data.data);

      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);

      setUser(data.user);
      setIsAuth(true);
      toast.success(data.message);
      navigate("/");

      setBtnLoading(false);
    } catch (error) {
      console.log("Error response:", error.response);
      toast.error(error.response?.data?.message || "Login failed");
      setBtnLoading(false);
    }
  }

  async function signInUser(sign, navigate) {
    setBtnLoading(true);
    try {
      // Fixed inconsistent URL, should be same base as other APIs
      const { data } = await axios.post(`${API_BASE_URL}/user/sign`, sign);
      console.log("SignIn response:", data.data);

      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);

      setUser(data.user);
      setIsAuth(true);
      toast.success(data.message);
      navigate("/");

      setBtnLoading(false);
    } catch (error) {
      console.log("Error response:", error.response);
      toast.error(error.response?.data?.message || "Sign up failed");
      setBtnLoading(false);
    }
  }

  async function fetchUser() {
    const token = getToken();
    const userId = localStorage.getItem("userId");

    // Return early if there's no token or userId to prevent unnecessary API calls
    if (!token || !userId) {
      setIsAuth(false);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${API_BASE_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.log("User fetch error:", error);
      setIsAuth(false);
      setLoading(false);

      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        toast.error("Session expired. Please log in again.");
      }
    }
  }

  const Logout = (navigate) => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsAuth(false);
    setUser({});
    toast.success("Logged Out Successfully");
    navigate("/login");
  };

  // Only fetch user when component mounts, not on every user state change
  useEffect(() => {
    fetchUser();
  }, []); // Empty dependency array to run only once on mount

  return (
    <AuthContext.Provider
      value={{
        loginUser,
        btnLoading,
        isAuth,
        setIsAuth,
        user,
        signInUser,
        loading,
        Logout,
      }}
    >
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </AuthContext.Provider>
  );
};

export const AuthData = () => useContext(AuthContext);

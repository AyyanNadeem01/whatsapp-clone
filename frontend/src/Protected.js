import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useUserStore from "./store/useUserStore";
import { checkUserAuth } from "./services/user.service";
import Loader from "./utils/Loader"; // Make sure you have this

export const ProtectedRoute = () => {
  const location = useLocation();
  const [isChecking, setChecking] = useState(true);

  const { isAuthenticated, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const result = await checkUserAuth();
        if (result?.isAuthenticated) {
          setUser(result.user);
        } else {
          clearUser();
        }
      } catch (error) {
        console.error(error);
        clearUser();
      } finally {
        setChecking(false);
      }
    };

    verifyAuth();
  }, [setUser, clearUser]);

  if (isChecking) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/user-login" state={{ from: location }} replace />;
  }

  // User is authenticated — render the protected route
  return <Outlet />;
};

export const PublicRoute = () => {
  const [isChecking, setChecking] = useState(true);
  const { isAuthenticated, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const result = await checkUserAuth();
        if (result?.isAuthenticated) {
          setUser(result.user);
        } else {
          clearUser();
        }
      } catch {
        clearUser();
      } finally {
        setChecking(false);
      }
    };
    verifyAuth();
  }, [setUser, clearUser]);

  if (isChecking) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

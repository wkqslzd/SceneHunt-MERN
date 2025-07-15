import { useUser } from "../hooks/useUser";
import { Navigate } from "react-router-dom";

export default function AuthRoute({ allowedRoles, children }) {
  const { user } = useUser(); // Suppose useUser returns the information of the currently logged-in user
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/403" />;
  return children;
}
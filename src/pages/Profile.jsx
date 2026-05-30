import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Assignment 7 — Profile route.
// Reads the logged-in user from localStorage and renders their info.
// Logout now calls the server's /api/logout endpoint with the bearer token
// BEFORE clearing localStorage — so the server gets a chance to log/blocklist
// the token (useful when we add token blocklists in a more advanced course).
function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("User");
    if (!raw) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(raw));
  }, [navigate]);

  // async logout, remove user and token from local storage
  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }
      toast.success("Logged out");
      
    } catch(err) {
      console.error("Logout network error: ", err);
      toast.error("Network error, logged out locally");
    } finally {
      localStorage.removeItem("User");
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  if (!user) return null;

  return (
    <main className="Profile">
      <h2>Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
}

export default Profile;

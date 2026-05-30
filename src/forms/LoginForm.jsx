import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./Forms.css";

// Assignment 7 — Login route.
// Same shape as A6, but the "already logged in?" check now looks at
// localStorage.token (not .User), and the success handler saves BOTH the
// user object AND the JWT the server returns.
function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // if token present, navigate to profile page
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/profile");
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!username || !password) {
      const message = "Username and password are required.";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        const message = data.error || "Login failed.";
        setError(message);
        toast.error(message);
        return;
      }

      // save the user and the token to localStorage.
      localStorage.setItem("User", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      toast.success(data.message || `Welcome back, ${data.user.username}!`);
      navigate("/profile");
    } catch (err) {
      console.error(err);
      const message = "Network error. Is the server running?";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <form className="Form" onSubmit={handleSubmit}>
      <h2>Log in</h2>
      {error && <p className="Form-error">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button type="submit">Log in</button>
      <p className="Form-link">
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </form>
  );
}

export default LoginForm;

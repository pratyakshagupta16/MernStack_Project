import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = "error") => {
    window.dispatchEvent(
      new CustomEvent("toast", { detail: { message, type } })
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Enter email and password", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        showToast(data.msg || "Login failed", "error");
        return;
      }

      if (!data.token) {
        showToast("Server did not return token", "error");
        return;
      }

      // SAVE TOKEN
      localStorage.setItem("token", data.token);

      // SAVE USER NAME
      if (data.user && data.user.name) {
        localStorage.setItem("userName", data.user.name);
      }

      showToast("Login successful!", "success");

      // Notify parent
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error("Login error:", err);
      showToast("Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Login</h2>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (6+ chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <button type="button" className="cancel-button" onClick={() => onSuccess && onSuccess()}>
            Cancel
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => window.dispatchEvent(new Event("openSignup"))}
            style={{
              marginTop: "10px",
              background: "#eee",
              borderRadius: "8px",
              padding: "10px",
              cursor: "pointer",
            }}
          >
            Create an Account
          </button>
        </form>
      </div>
    </div>
  );
}

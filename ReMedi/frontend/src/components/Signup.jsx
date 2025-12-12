import { useState } from "react";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Signup({ onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = "error") =>
    window.dispatchEvent(new CustomEvent("toast", { detail: { message, type } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast("All fields are required", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.msg || data.error || "Signup failed", "error");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        showToast("Account created", "success");
        if (onSuccess) onSuccess();
      } else {
        showToast("Account created but no token returned", "warning");
      }
    } catch (err) {
      console.error("Signup error:", err);
      showToast("Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
          <button type="button" className="cancel-button" onClick={() => onSuccess && onSuccess()}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

import Button from "../../components/ui/Button.jsx";
import { ErrorState } from "../../components/ui/Status.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(form);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Admin</p>
        <h1>Sign in</h1>
        <p className="muted">Manage the Kashmiri Arts archive and CMS content.</p>
        {error ? <ErrorState error={error} /> : null}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-actions">
          <Button disabled={loading} type="submit">
            <LogIn size={17} />
            {loading ? "Signing in" : "Sign in"}
          </Button>
        </div>
      </form>
    </main>
  );
}

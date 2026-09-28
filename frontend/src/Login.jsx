import { useState } from "react";

const API_URL = "http://localhost:5000/api";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            // Login failed
            if (!response.ok) {
                setError(data.message || "Login failed.");
                setLoading(false);
                return;
            }

            // Save login information
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Tell App.jsx that login was successful
            onLogin(data.user);

        } catch (error) {
            console.error(error);

            setError(
                "Unable to connect to the server. Please try again."
            );
        }

        setLoading(false);
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <h1>Big Mash Barber Shop</h1>

                <p className="login-subtitle">
                    Staff Login
                </p>

                <form onSubmit={handleLogin}>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p className="login-error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin, setAuthToken } from "../services/api";

const initialCredentials = {
    email: "",
    password: "",
};

export default function Admin() {
    const [credentials, setCredentials] = useState(initialCredentials);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    function handleChange(event) {
        const { name, value } = event.target;
        setCredentials((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const response = await adminLogin(credentials);
            const token = response.token;
            localStorage.setItem("adminToken", token);
            setAuthToken(token);
            navigate("/admin/dashboard");
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || "Login failed. Please verify your credentials.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="section admin-login-page">
            <div className="card login-card">
                <span className="eyebrow">Admin Login</span>
                <h1>Administrator Access</h1>
                <p>Enter your admin email and password to manage bookings, packages, and inquiries.</p>

                <form className="stack-form" onSubmit={handleSubmit}>
                    <label>
                        <span>Email</span>
                        <input type="email" name="email" value={credentials.email} onChange={handleChange} required />
                    </label>

                    <label>
                        <span>Password</span>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <button className="button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </button>

                    {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}
                </form>
            </div>
        </section>
    );
}

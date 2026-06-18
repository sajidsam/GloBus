import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase.config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Hooks/AuthContext";
import { Link } from "react-router-dom";

const SignIn = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://glo-bus-backend.vercel.app/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || "Invalid credentials");

      login(data);

      if (data.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      setError("Server error, try again later");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userInfo = {
        name: user.displayName,
        email: user.email,
        role: "user",
      };

      login(userInfo);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 rounded-lg p-3"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg p-3"
          >
            Sign In
          </button>
        </form>

        <div className="my-4 text-center">
          <span className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/SignUp" className="text-blue-600 underline">
              Sign Up
            </Link>
          </span>
        </div>

        <div className="my-6 flex items-center">
          <hr className="flex-1 border-gray-300" />
          <span className="mx-3 text-gray-500">OR</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg p-3"
        >
          <img src="Images/Google.png" className="h-6 w-6" alt="Google Logo" />
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default SignIn;

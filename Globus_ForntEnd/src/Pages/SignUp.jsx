import React, { useState } from "react";
import { auth } from "../firebase.config";
import {
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const googleProvider = new GoogleAuthProvider();

const SignUp = () => {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) return setError("Passwords do not match!");
        if (!agreeTerms) return setError("You must agree to the terms & conditions.");

        try {
            const user = { name, email, phone, password };
            

            const res = await fetch("https://glo-bus-backend.vercel.app/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });

            if (!res.ok) {
                const errMsg = await res.text();
                return setError(errMsg);
            }

            const createdUser = await res.json();

            
            localStorage.setItem("user", JSON.stringify(createdUser));

            navigate("/");

        } catch (err) {
            setError(err.message);
        }
    };

    const googleSignUp = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                        I agree to the terms & privacy policy
                    </label>

                    <button type='submit' className="bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700 transition">
                        Sign Up
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <hr className="flex-1 border-gray-300" />
                    <span className="mx-3 text-gray-500">OR</span>
                    <hr className="flex-1 border-gray-300" />
                </div>

                <button
                    onClick={googleSignUp}
                    className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg p-3 hover:bg-gray-100 transition"
                >
                    <img src="/Images/Google.png" className="h-6 w-6" alt="Google Logo" onError={(e) => (e.target.style.display = "none")} />
                    Sign Up with Google
                </button>

                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <span
                            onClick={() => navigate("/signin")}
                            className="text-blue-600 font-semibold cursor-pointer hover:underline"
                        >
                            Sign In
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;

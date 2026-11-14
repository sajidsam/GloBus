import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase.config";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Hooks/AuthContext";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

// Backend Api
const API_URL = import.meta.env.VITE_API_URL;

const SignIn = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const safeParseResponse = async (res) => {
    try {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return await res.json();
      }
      const text = await res.text();
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const targetUrl = API_URL ? `${API_URL}/signin` : "/signin";
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await safeParseResponse(res);
      if (!res.ok) {
        setLoading(false);
        return setError(data?.message || "Invalid email or password.");
      }

      login(data);

      if (data.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      setError("Unable to connect to the authentication server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      const idToken = await googleUser.getIdToken();

      const targetUrl = API_URL.endsWith("/")
        ? `${API_URL}api/auth/google`
        : `${API_URL}/api/auth/google`;

      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          email: googleUser.email,
          name: googleUser.displayName,
          avatar: googleUser.photoURL,
        }),
      });

      const data = await safeParseResponse(res);
      
      if (!res.ok) {
        return setError(data?.message || "Failed to authenticate with server.");
      }

      login(data.user || data);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during Google sign in.");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-gray-950 overflow-hidden select-none">
      
      {/* ================= LEFT COLUMN: BRANDING, ILLUSTRATION & DOODLES ================= */}
      <div className="relative w-full lg:w-7/12 h-full flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-950 overflow-hidden">
        
        {/* ===== LARGE BLACK DOODLE ARTS ===== */}
        
        {/* Doodle 1: Fashion / Shopping Bag */}
        <img
          src="/Images/ImageMenu/fashion.png"
          alt="Fashion Doodle"
          className="absolute top-4 left-4 sm:left-8 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 brightness-0 opacity-70 dark:invert dark:opacity-85 -rotate-12 animate-bounce select-none pointer-events-none"
          style={{ animationDuration: "4s" }}
        />

        {/* Doodle 2: Device / Tech */}
        <img
          src="/Images/ImageMenu/device.png"
          alt="Device Doodle"
          className="absolute top-6 right-6 sm:right-10 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 brightness-0 opacity-70 dark:invert dark:opacity-85 rotate-12 select-none pointer-events-none"
        />

        {/* Doodle 3: Teddy Bear / Toys */}
        <img
          src="/Images/ImageMenu/teddy-bear.png"
          alt="Toy Doodle"
          className="absolute bottom-4 left-4 sm:left-8 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 brightness-0 opacity-70 dark:invert dark:opacity-85 rotate-6 select-none pointer-events-none"
        />

        {/* Doodle 4: Healthy Food Basket */}
        <img
          src="/Images/ImageMenu/healthy-food.png"
          alt="Food Doodle"
          className="absolute bottom-4 right-4 sm:right-8 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 brightness-0 opacity-70 dark:invert dark:opacity-85 -rotate-12 select-none pointer-events-none"
        />

        {/* Doodle 5: Stationary */}
        <img
          src="/Images/ImageMenu/stationary.png"
          alt="Stationary Doodle"
          className="hidden md:block absolute top-1/2 left-4 w-14 h-14 lg:w-16 lg:h-16 brightness-0 opacity-60 dark:invert dark:opacity-75 -rotate-45 select-none pointer-events-none"
        />

        {/* Doodle 6: Kitchen Appliance */}
        <img
          src="/Images/ImageMenu/kitchen.png"
          alt="Kitchen Doodle"
          className="hidden md:block absolute top-1/2 right-4 w-14 h-14 lg:w-16 lg:h-16 brightness-0 opacity-60 dark:invert dark:opacity-75 rotate-45 select-none pointer-events-none"
        />

        {/* Doodle 7: Hand-Drawn Shopping Cart */}
        <svg
          className="hidden sm:block absolute top-8 left-1/2 -translate-x-1/2 w-14 h-14 text-black/65 dark:text-white/75 -rotate-6 select-none pointer-events-none"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 12h8l6 28h30l6-20H18" />
          <circle cx="24" cy="48" r="4" fill="currentColor" />
          <circle cx="46" cy="48" r="4" fill="currentColor" />
          <path d="M30 22h14M37 15v14" strokeWidth="2.5" />
        </svg>

        {/* TOP BRANDING & HEADLINE */}
        <div className="relative z-10 w-full max-w-xl text-center lg:text-left pt-1">
          <Link to="/" className="inline-block group transition-transform hover:scale-105">
            <span className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-green-600">
              Glo<span className="text-gray-900 dark:text-white">Bus</span>
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
            Happiness in Every Click
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 max-w-md">
            Shop anytime, anywhere with family & friends through our easy, secure gateway.
          </p>
        </div>

        {/* FULL SHOWCASE ILLUSTRATION (Fits nicely without scrolling) */}
        <div className="relative z-10 w-full flex items-center justify-center my-auto flex-1 max-h-[58vh] overflow-hidden">
          <img
            src="/Images/signinBanner.jpg"
            alt="Online Shopping Illustration"
            className="w-auto h-full max-h-[54vh] max-w-full object-contain mix-blend-multiply dark:mix-blend-normal select-none pointer-events-none"
          />
        </div>

        {/* Subtle spacing bottom */}
        <div className="w-full h-2"></div>
      </div>

      {/* ================= RIGHT COLUMN: SEPARATE SIGN IN FORM ================= */}
      <div className="w-full lg:w-5/12 h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-[370px] bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 text-white p-6 sm:p-8 rounded-3xl shadow-2xl shadow-green-900/25 border border-green-500/40">
          
          <div className="mb-5 text-center lg:text-left">
            <div className="lg:hidden inline-block mb-2">
              <Link to="/">
                <span className="font-extrabold text-3xl text-white">
                  Glo<span className="text-gray-900">Bus</span>
                </span>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-green-100/90 mt-1">
              Sign in to your GloBus account to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-300/40 text-white text-xs font-medium flex items-center gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-green-100 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                  <FaEnvelope className="w-4 h-4 text-black" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all text-sm shadow-sm font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-green-100 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-white hover:text-green-200 underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                  <FaLock className="w-4 h-4 text-black" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl border-none bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all text-sm shadow-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-black hover:text-gray-700 cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4 text-black" /> : <FaEye className="w-4 h-4 text-black" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1.5 py-3 px-4 rounded-xl bg-gray-900 hover:bg-black active:bg-gray-950 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="my-3.5 text-center">
            <span className="text-xs sm:text-sm text-green-100">
              Don't have an account?{" "}
              <Link to="/SignUp" className="text-white font-bold underline hover:text-green-200">
                Sign Up
              </Link>
            </span>
          </div>

          <div className="my-3 flex items-center">
            <hr className="flex-1 border-white/30" />
            <span className="mx-3 text-[11px] text-green-100/80 uppercase font-semibold">OR</span>
            <hr className="flex-1 border-white/30" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-white/20 bg-white hover:bg-green-50 text-gray-800 font-semibold text-sm rounded-xl py-3 px-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <img src="Images/Google.png" className="h-4.5 w-4.5" alt="Google Logo" />
            Sign In with Google
          </button>
        </div>

      </div>
    </div>
  );
};

export default SignIn;

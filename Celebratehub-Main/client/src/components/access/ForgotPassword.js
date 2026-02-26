import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Access.css";
import logo2 from "../../assets/logo2-cut.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, phoneNumber }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setMessage(data.message);
      } else {
        setError(data.message || "Error sending OTP");
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset successful. You can now login.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Error resetting password");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="access-container">
      <div className="access-card">
        <img src={logo2} alt="CelebrateHub Logo" className="access-logo" />
        <h3 className="access-subtitle">Forgot Password</h3>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        {!otpSent ? (
          <form className="access-form" onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                Send OTP
              </button>
              <button type="button" className="cancel-btn" onClick={() => navigate("/login")}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form className="access-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="otp">OTP</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the OTP"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                Reset Password
              </button>
            </div>
          </form>
        )}

        <div className="access-footer">
          Remember your password? 
          <Link to="/login" className="access-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

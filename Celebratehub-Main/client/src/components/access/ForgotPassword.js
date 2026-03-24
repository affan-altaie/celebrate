import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Access.css";
import logo2 from "../../assets/logo2-cut.png";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

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
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setMessage(data.message);
      } else {
        setError(data.message || t("errorSendingOtp"));
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setError(t("genericError"));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("passwordTooShort"));
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
        setMessage(t("passwordResetSuccess"));
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || t("passwordResetError"));
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError(t("genericError"));
    }
  };

  return (
    <div className="access-container">
      <div className="access-card">
        <img src={logo2} alt="CelebrateHub Logo" className="access-logo" />
        <h3 className="access-subtitle">{t("forgotPasswordTitle")}</h3>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        {!otpSent ? (
          <form className="access-form" onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="email">{t("emailAddressLabel")}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailAddressPlaceholder")}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {t("sendOtpButton")}
              </button>
              <button type="button" className="cancel-btn" onClick={() => navigate("/login")}>
                {t("cancelButton")}
              </button>
            </div>
          </form>
        ) : (
          <form className="access-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="otp">{t("otpLabel")}</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t("otpPlaceholder")}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t("newPasswordLabel")}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("newPasswordPlaceholder")}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t("confirmNewPasswordLabel")}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("confirmNewPasswordPlaceholder")}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {t("resetPasswordButton")}
              </button>
            </div>
          </form>
        )}

        <div className="access-footer">
          {t("rememberPassword")}
          <Link to="/login" className="access-link">{t("signInLink")}</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

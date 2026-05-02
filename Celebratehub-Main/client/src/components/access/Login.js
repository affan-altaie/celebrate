import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "./Access.css";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    keepMeSignedIn: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t("loginSuccess"));
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on role
        switch (data.user.role) {
          case "admin":
            navigate("/admin-dashboard", { state: { user: data.user } });
            break;
          case "provider":
            navigate("/provider-dashboard", { state: { user: data.user } });
            break;
          case "customer":
          default:
            navigate("/new-booking", { state: { user: data.user } });
        }
      } else {
        if (
          data.message ===
          "Your account is pending email verification. Please check your email for an OTP."
        ) {
          toast.error(
            <div>
              {t("loginPendingVerification")}{" "}
              <Link
                to="/otp-verification"
                state={{ email: formData.email }}
                className="access-link"
                style={{ color: "#c62828", textDecoration: "underline" }}
              >
                {t("verifyHere")}
              </Link>
            </div>
          );
        } else if (
          data.message ===
          "Your account has been rejected. Please register again."
        ) {
          toast.error(t("accountRejected"));
        } else {
          toast.error(data.message || t("loginFailed"));
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(t("genericError"));
    }
  };

  return (
    <div className="access-container">
      <div className="access-card">
        <h3 className="access-subtitle">{t("signInToYourAccount")}</h3>

        <form className="access-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t("emailAddress")}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("enterYourEmail")}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t("password")}</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("enterYourPassword")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="password-toggle-btn"
              >
                {showPassword ? (
                  <i className="fa-solid fa-eye"></i>
                ) : (
                  <i className="fa-solid fa-eye-slash"></i>
                )}
              </button>
            </div>
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password-link">
              {t("forgotPassword")}
            </Link>
            <div className="form-check">
              <input
                type="checkbox"
                id="keepMeSignedIn"
                name="keepMeSignedIn"
                checked={formData.keepMeSignedIn}
                onChange={handleChange}
                className="form-check-input"
              />
              <label htmlFor="keepMeSignedIn" className="form-check-label">
                {t("keepMeSignedIn")}
              </label>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {t("signIn")}
          </button>
        </form>

        <div className="access-footer">
          {t("dontHaveAnAccount")}{" "}
          <Link to="/register" className="access-link">
            {t("signUp")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

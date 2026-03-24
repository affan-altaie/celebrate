import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import "./Access.css";

const OtpVerification = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: location.state?.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t("resendOtpFailed"));
      } else {
        setResendCooldown(60); // 60-second cooldown
      }
    } catch (err) {
      setError(t("genericError"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/login");
      } else {
        setError(data.message || t("otpVerificationFailed"));
      }
    } catch (err) {
      setError(t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="access-container">
      <div className="access-card">
        <h3 className="access-subtitle">{t("verifyYourEmail")}</h3>
        <p style={{ marginBottom: "1rem" }}>{t("otpSentTo", { email: location.state?.email })}</p>

        {error && <div className="error-message">{error}</div>}

        <form className="access-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp">{t("enterOtp")}</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError("");
              }}
              placeholder={t("enterOtp")}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? t("verifying") : t("verify")}
          </button>
        </form>

        <div className="access-footer">
          <button
            className="access-link"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0
              ? t("resendOtpCooldown", { seconds: resendCooldown })
              : t("resendOtp")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
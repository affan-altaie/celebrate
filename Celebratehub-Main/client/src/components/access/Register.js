import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./Access.css";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    location: "",
    document: null,
  });
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordRequirements, setPasswordRequirements] = useState(false);
  const [passwordValidity, setPasswordValidity] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const validate = useCallback(() => {
    const errors = {};
    if (!formData.username) {
      errors.username = t('usernameRequired');
    }
    if (!formData.email) {
      errors.email = t('emailRequired');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      errors.email = t('emailInvalid');
    }
    if (!formData.phoneNumber) {
      errors.phoneNumber = t('phoneRequired');
    } else if (!/^[79][0-9]{7}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = t('phoneInvalid');
    }
    if (!formData.password) {
      errors.password = t('passwordRequired');
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('passwordsDoNotMatch');
    }
    if (formData.role === "provider") {
      if (!formData.location) {
        errors.location = t('locationRequired');
      }
      if (!formData.document) { // New validation for document
        errors.document = t('documentRequired');
      }
    }
    return errors;
  }, [formData, t]);

  useEffect(() => {
    const errors = validate();
    setFormErrors(errors);
  }, [validate]);


  const validatePassword = (password) => {
    const newValidity = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*]/.test(password),
    };
    setPasswordValidity(newValidity);
    return Object.values(newValidity).every((v) => v);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "document") {
      setFormData((prevState) => ({
        ...prevState,
        document: files[0],
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));

      if (name === "password") {
        validatePassword(value);
      }
      if (error) setError("");
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    setTouched({
        username: true,
        email: true,
        phoneNumber: true,
        password: true,
        confirmPassword: true,
        location: true,
        document: true,
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(t('passwordRequirementsError'));
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append("username", formData.username);
      formDataObj.append("email", formData.email);
      formDataObj.append("phoneNumber", `+968${formData.phoneNumber}`);
      formDataObj.append("password", formData.password);
      formDataObj.append("role", formData.role);
      formDataObj.append("location", formData.location);
      
      if (formData.document) {
        formDataObj.append("document", formData.document);
      }

      const response = await fetch("/api/register", {
        method: "POST",
        body: formDataObj,
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Registration successful");
        if (formData.role === "provider") {
          alert(t('registrationPending'));
        }
        navigate("/login");
      } else {
        if (data.message === "User already registered") {
          navigate("/login");
        } else {
          setError(data.message || t('registrationFailed'));
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(t('genericError'));
    }
  };

  return (
    <div className="access-container">
      <div className="access-card">
        <h3 className="access-subtitle">{t('createYourAccount')}</h3>

        {error && <div className="error-message">{error}</div>}

        <form className="access-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t('username')}</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('chooseAUsername')}
              required
            />
            {touched.username && formErrors.username && (
              <div className="error-message">{formErrors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">{t('iWantToRegisterAsA')}</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                marginBottom: "1rem",
              }}
            >
              <option value="customer">{t('customer')}</option>
              <option value="provider">{t('serviceProvider')}</option>
            </select>
          </div>

          {formData.role === "provider" && (
            <div className="form-group">
              <label htmlFor="location">{t('locationOfBusiness')}</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('enterYourBusinessLocation')}
                required
              />
              {touched.location && formErrors.location && (
                <div className="error-message">{formErrors.location}</div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">{t('emailAddress')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('enterYourEmail')}
              required
            />
            {touched.email && formErrors.email && (
              <div className="error-message">{formErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">{t('phoneNumber')}</label>
            <div className="phone-input-container">
              <span className="country-code">+968</span>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('enterYourPhoneNumber')}
                required
              />
            </div>
            {touched.phoneNumber && formErrors.phoneNumber && (
              <div className="error-message">{formErrors.phoneNumber}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setPasswordRequirements(true)}
              onBlur={(e) => {
                setPasswordRequirements(false);
                handleBlur(e);
              }}
              placeholder={t('createAPassword')}
              required
            />
            {passwordRequirements && (
              <div className="password-requirements">
                <ul>
                  <li className={passwordValidity.length ? "valid" : "invalid"}>
                    {t('atLeast8Characters')}
                  </li>
                  <li className={passwordValidity.uppercase ? "valid" : "invalid"}>
                    {t('atLeastOneUppercaseLetter')}
                  </li>
                  <li className={passwordValidity.lowercase ? "valid" : "invalid"}>
                    {t('atLeastOneLowercaseLetter')}
                  </li>
                  <li className={passwordValidity.number ? "valid" : "invalid"}>
                    {t('atLeastOneNumber')}
                  </li>
                  <li className={passwordValidity.specialChar ? "valid" : "invalid"}>
                    {t('atLeastOneSpecialCharacter')}
                  </li>
                </ul>
              </div>
            )}
             {touched.password && formErrors.password && (
              <div className="error-message">{formErrors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('confirmYourPassword')}
              required
            />
            {touched.confirmPassword && formErrors.confirmPassword && (
              <div className="error-message">{formErrors.confirmPassword}</div>
            )}
          </div>

          {formData.role === "provider" && (
            <div className="form-group">
              <label htmlFor="document">{t('businessDocument')}</label>
              <input
                type="file"
                id="document"
                name="document"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleChange}
                onBlur={handleBlur}
                className="document-input"
                required
              />
              {touched.document && formErrors.document && (
                <div className="error-message">{formErrors.document}</div>
              )}
              <small className="form-hint">{t('documentHint')}</small>
            </div>
          )}

          <button type="submit" className="submit-btn">
            {t('createAccount')}
          </button>
        </form>

        <div className="access-footer">
          {t('alreadyHaveAnAccount')}
          <Link to="/login" className="access-link">
            {t('signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
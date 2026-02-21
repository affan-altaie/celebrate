import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Access.css";
import logo2 from "../../assets/logo2-cut.png";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    location: "",
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

  const validate = () => {
    const errors = {};
    if (!formData.username) {
      errors.username = "Username is required";
    }
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      errors.email = "Email address is invalid";
    }
    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^[79]\\d{7}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must be 8 digits and start with 7 or 9";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (formData.role === "provider" && !formData.location) {
      errors.location = "Business location is required";
    }
    return errors;
  };

  useEffect(() => {
    const errors = validate();
    setFormErrors(errors);
  }, [formData]);


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
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "password") {
      validatePassword(value);
    }
    if (error) setError("");
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
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          phoneNumber: `+968${formData.phoneNumber}`,
          password: formData.password,
          role: formData.role,
          location: formData.location,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Registration successful");
        if (formData.role === "provider") {
          alert(
            "Registration successful! Your account is pending approval from the administrator."
          );
        }
        navigate("/login");
      } else {
        if (data.message === "User already registered") {
          navigate("/login");
        } else {
          setError(data.message || "Registration failed");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred during registration");
    }
  };

  return (
    <div className="access-container">
      <div className="access-card">
        <img src={logo2} alt="CelebrateHub Logo" className="access-logo" />

        <h3 className="access-subtitle">Create your account</h3>

        {error && <div className="error-message">{error}</div>}

        <form className="access-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Choose a username"
              required
            />
            {touched.username && formErrors.username && (
              <div className="error-message">{formErrors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">I want to register as a:</label>
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
              <option value="customer">Customer</option>
              <option value="provider">Service Provider</option>
            </select>
          </div>

          {formData.role === "provider" && (
            <div className="form-group">
              <label htmlFor="location">Location of Business</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your business location"
                required
              />
              {touched.location && formErrors.location && (
                <div className="error-message">{formErrors.location}</div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              required
            />
            {touched.email && formErrors.email && (
              <div className="error-message">{formErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <div className="phone-input-container">
              <span className="country-code">+968</span>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your phone number"
                required
              />
            </div>
            {touched.phoneNumber && formErrors.phoneNumber && (
              <div className="error-message">{formErrors.phoneNumber}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
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
              placeholder="Create a password"
              required
            />
            {passwordRequirements && (
              <div className="password-requirements">
                <ul>
                  <li className={passwordValidity.length ? "valid" : "invalid"}>
                    At least 8 characters
                  </li>
                  <li className={passwordValidity.uppercase ? "valid" : "invalid"}>
                    At least one uppercase letter
                  </li>
                  <li className={passwordValidity.lowercase ? "valid" : "invalid"}>
                    At least one lowercase letter
                  </li>
                  <li className={passwordValidity.number ? "valid" : "invalid"}>
                    At least one number
                  </li>
                  <li className={passwordValidity.specialChar ? "valid" : "invalid"}>
                    At least one special character
                  </li>
                </ul>
              </div>
            )}
             {touched.password && formErrors.password && (
              <div className="error-message">{formErrors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              required
            />
            {touched.confirmPassword && formErrors.confirmPassword && (
              <div className="error-message">{formErrors.confirmPassword}</div>
            )}
          </div>

          <button type="submit" className="submit-btn">
            Create Account
          </button>
        </form>

        <div className="access-footer">
          Already have an account?
          <Link to="/login" className="access-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

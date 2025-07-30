"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGoogle,
  // faApple, // remove if not using Apple
} from "@fortawesome/free-brands-svg-icons"
import { faEye, faEyeSlash, faArrowRight, faShield } from "@fortawesome/free-solid-svg-icons"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import "./Signin.css" // Use the CSS you provided
import { authAPI } from "../../APILinks"

const Signin = () => {
  // Toggle between Sign In or Sign Up
  const [isSignup, setIsSignup] = useState(false)

  // OTP fields
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])

  // UI states
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form data for both Sign In & Sign Up
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phone: "", // We'll store the full phone number (with country code) here
  })

  // Remove this line
  // const API_BASE_URL = "https://ec2-3-110-142-76.ap-south-1.compute.amazonaws.com/auth"

  // Toggle between Sign In and Sign Up
  const toggleMode = () => {
    setIsSignup(!isSignup)
    setOtpSent(false)
    setOtp(["", "", "", "", "", ""])
    setError(null)
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      phone: "",
    })
  }

  // Handle text input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Handle phone number changes via react-phone-input-2
  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }))
  }

  // Handle OTP input changes
  const handleOtpChange = (e, index) => {
    const value = e.target.value
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        if (nextInput) nextInput.focus()
      }
    }
  }

  // Handle OTP input backspacing
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  // New state for email verification
  const [emailVerificationNeeded, setEmailVerificationNeeded] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (isSignup) {
        // SIGN UP
        const payload = {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          mobilenumber: formData.phone, // phone with country code
          password: formData.password,
        }

        const response = await authAPI.signUp(payload)
        showNotification(response.data)
        // After successful signup, switch to sign in form
        setIsSignup(false)
      } else {
        // SIGN IN
        try {
          const response = await authAPI.signIn({
            email: formData.email,
            password: formData.password,
          })

          // Check if the response indicates the user needs to verify their email
          if (response.data && response.data.includes("verify your email")) {
            setEmailVerificationNeeded(true)
            setError("Please verify your email before signing in.")
          } else {
            showNotification(response.data)
            // If backend indicates OTP is required
            setOtpSent(true)
          }
        } catch (err) {
          // Check if the error response indicates email verification is needed
          if (err.response?.data && err.response.data.includes("verify your email")) {
            setEmailVerificationNeeded(true)
            setError("Please verify your email before signing in.")
          } else {
            setError(err.response?.data || "An error occurred")
          }
        } finally {
          setIsLoading(false)
        }
      }
    } catch (err) {
      setError(err.response?.data || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await authAPI.resendOtp(formData.email)
      showNotification(response.data)
    } catch (err) {
      setError(err.response?.data || "Error resending OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerificationEmail = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await authAPI.resendVerificationEmail(formData.email)
      showNotification("Verification email has been resent. Please check your inbox.")
    } catch (err) {
      setError(err.response?.data || "Error resending verification email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const otpValue = otp.join("")
      const response = await authAPI.verifyOtp(formData.email, otpValue)

      showNotification("Login Successful!")
      // Store tokens or user info as needed
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("userId", response.data.userid)
      localStorage.setItem("email", response.data.email)

      // Optional: Fetch role
      const roleResponse = await authAPI.getUserRole(formData.email)
      localStorage.setItem("role", roleResponse.data.trim())

      // Redirect
      window.location.href = "/"
    } catch (err) {
      setError(err.response?.data || "Invalid OTP")
    } finally {
      setIsLoading(false)
    }
  }

  // Simple notification (replace with toast if needed)
  const showNotification = (message) => {
    alert(message)
  }

  return (
    <div className="smain">
      <div className="page-container">
        {/* MAIN AUTH LAYOUT */}
        <div className="auth-layout">
          {/* LEFT COLUMN (Gradient + Form) */}
          <div className="auth-left">
            <div className="auth-left-content">
              {/* LOGO */}
              <div className="logo-container">
                <img src="assets/taxallnewww22n.png" alt="Logo" className="auth-logo" />
              </div>

              <div className="auth-card">
                {/* Title */}
                <h1 className="auth-title">{isSignup ? "Create Account" : "Welcome Back"}</h1>
                <p className="auth-subtitle">
                  {isSignup ? "Fill in your details to get started" : "Sign in to continue to your account"}
                </p>

                {/* IF OTP IS SENT, SHOW OTP FORM */}
                {otpSent ? (
                  <form onSubmit={handleOtpSubmit} className="auth-form otp-form">
                    <div className="otp-header">
                      <FontAwesomeIcon icon={faShield} className="otp-icon" />
                      <h3>Verification Code</h3>
                      <p>We've sent a code to {formData.email}</p>
                    </div>
                    <div className="otp-inputs">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          required
                        />
                      ))}
                    </div>
                    <div className="otp-actions">
                      <button
                        type="submit"
                        className={`auth-btn primary-btn ${isLoading ? "loading" : ""}`}
                        disabled={isLoading}
                      >
                        {isLoading ? <span className="spinner"></span> : "Verify"}
                      </button>
                      <button
                        type="button"
                        className="auth-btn secondary-btn"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                      >
                        Resend Code
                      </button>
                    </div>
                  </form>
                ) : (
                  /* SIGN IN / SIGN UP FORM */
                  <form onSubmit={handleSubmit} className="auth-form">
                    {isSignup && (
                      <>
                        <div className="form-row">
                          <div className="auth-input-group">
                            <label>First Name</label>
                            <input
                              type="text"
                              name="firstname"
                              value={formData.firstname}
                              onChange={handleChange}
                              placeholder="Ashmit"
                              required
                            />
                          </div>
                          <div className="auth-input-group">
                            <label>Last Name</label>
                            <input
                              type="text"
                              name="lastname"
                              value={formData.lastname}
                              onChange={handleChange}
                              placeholder="Raj"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="auth-input-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    {isSignup && (
                      <div className="auth-input-group">
                        <label>Phone Number</label>
                        <PhoneInput
                          country="us"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          // Inline styles for a black/gray look
                          inputStyle={{
                            width: "100%",
                            borderRadius: "8px",
                            padding: "12px 16px",
                            backgroundColor: "#f3f3f3",
                            color: "#333",
                            border: "1px solid #ccc",
                          }}
                          buttonStyle={{
                            backgroundColor: "#f3f3f3",
                            border: "none",
                          }}
                          dropdownStyle={{
                            backgroundColor: "#fff",
                            color: "#333",
                          }}
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                    )}

                    <div className="auth-input-group password-group">
                      <label>Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                      </div>
                    </div>

                    {/* FORGOT PASSWORD LINK (Sign In Only) */}
                    {!isSignup && (
                      <div className="forgot-password">
                        <a href="#">Forgot password?</a>
                      </div>
                    )}

                    <button
                      type="submit"
                      className={`auth-btn primary-btn ${isLoading ? "loading" : ""}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="spinner"></span>
                      ) : (
                        <>
                          {isSignup ? "Create Account" : "Sign In"}
                          <FontAwesomeIcon icon={faArrowRight} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Error display */}
                {error && (
                  <div className="auth-error">
                    <p>{error}</p>
                    {emailVerificationNeeded && (
                      <button
                        type="button"
                        className="auth-btn secondary-btn mt-3"
                        onClick={handleResendVerificationEmail}
                        disabled={isLoading}
                      >
                        Resend Verification Email
                      </button>
                    )}
                  </div>
                )}

                {/* TOGGLE LINK */}
                {!otpSent && (
                  <div className="auth-toggle">
                    {isSignup ? (
                      <p>
                        Already have an account? <span onClick={toggleMode}>Sign In</span>
                      </p>
                    ) : (
                      <p>
                        Don&apos;t have an account? <span onClick={toggleMode}>Sign Up</span>
                      </p>
                    )}
                  </div>
                )}

                {/* DIVIDER */}
                {!otpSent && (
                  <div className="auth-divider">
                    <span>or continue with</span>
                  </div>
                )}

                {/* SOCIAL SIGN IN/UP OPTIONS */}
                {!otpSent && (
                  <div className="social-auth">
                    <button className="social-btn google-btn">
                      <FontAwesomeIcon icon={faGoogle} />
                      <span>Google</span>
                    </button>
                    {/* 
                    <button className="social-btn apple-btn">
                      <FontAwesomeIcon icon={faApple} />
                      <span>Apple</span>
                    </button>
                    */}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (BACKGROUND IMAGE) */}
          <div className="auth-right">
            <div className="auth-right-content">
              <div className="testimonial">
                <div className="quote-mark">"</div>
                <p className="quote-text">
                  {isSignup
                    ? "“We’ve streamlined our entire onboarding process thanks to this platform. Highly recommended for any growing business.”"
                    : "This platform has completely transformed how we manage our finances. The intuitive interface and powerful features make it a joy to use every day."}
                </p>
                <div className="testimonial-author">
                  <img
                    src={
                      isSignup
                        ? "https://randomuser.me/api/portraits/men/32.jpg"
                        : "https://randomuser.me/api/portraits/women/44.jpg"
                    }
                    alt="Testimonial Author"
                  />
                  <div>
                    <h4>{isSignup ? "John Anderson" : "Sarah Johnson"}</h4>
                    <p>{isSignup ? "CEO, ExampleCorp" : "CFO, TechCorp Inc."}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OPTIONAL About Us SECTION */}
        <section className="about-section">
          <div className="about-content">
            <h2>About Us</h2>
            <p>
              We are a modern company dedicated to delivering top-notch solutions for businesses worldwide. Our mission
              is to empower our clients through seamless services, ensuring growth and innovation.
            </p>
            <div className="about-features">
              <div className="feature">
                <div className="feature-icon">🚀</div>
                <h3>Fast & Reliable</h3>
                <p>Lightning-fast performance you can count on</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🔒</div>
                <h3>Secure</h3>
                <p>Enterprise-grade security for your data</p>
              </div>
              <div className="feature">
                <div className="feature-icon">💼</div>
                <h3>Business Ready</h3>
                <p>Tailored solutions for businesses of all sizes</p>
              </div>
            </div>
          </div>
        </section>
        {/* FOOTER (optional) */}
      </div>
    </div>
  )
}

export default Signin


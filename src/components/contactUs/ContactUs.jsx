"use client"

import { useState } from "react"
import "./ContactUs.css"
import { FaFacebook, FaEnvelope, FaInstagram, FaLinkedin, FaPhone, FaMapMarkerAlt } from "react-icons/fa"
import { contactAPI } from "../../APILinks"

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  })

  const [responseMessage, setResponseMessage] = useState("")

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent page refresh
    try {
      const response = await contactAPI.submitContact(formData)
      setResponseMessage(response.data) // Set success message
      setFormData({ name: "", email: "", mobile: "", subject: "", message: "" }) // Clear form
    } catch (error) {
      setResponseMessage("Failed to send message. Please try again.")
      console.error(error)
    }
  }

  return (
    <div className="contact-us">
      <div className="contact-container">
        <div className="contact-info">
          <h1>Let's Talk</h1>
          <p>
            Have a complex tax issue or need a tailored solution? Reach out—we’d love to hear about your situation and
            provide expert guidance to help you navigate the complexities of taxes.
          </p>

          <div className="contact-details">
            <div className="detail-item">
              <FaEnvelope size="1.2rem" color="#007bff" />
              <a href="mailto:info@example.com">taxallfinance@gmail.com</a>
            </div>
            <div className="detail-item">
              <FaPhone size="1.2rem" color="#007bff" />
              <a href="tel:+918709253824">+91 87 0925 3824</a>
            </div>
            <div className="detail-item">
              <FaMapMarkerAlt size="1.2rem" color="#007bff" />
              <span>narayana nagar Laxmi nagar lalita park NEW DELHI, DELHI 110092 India</span>
            </div>
            <div className="social-icons">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook size="1.5rem" color="#007bff" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram size="1.5rem" color="#007bff" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin size="1.5rem" color="#007bff" />
              </a>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" placeholder="Enter your name" value={formData.name} onChange={handleChange} />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />

          <label htmlFor="mobile">Mobile Number</label>
          <input
            id="mobile"
            type="text"
            placeholder="Enter your mobile number"
            value={formData.mobile}
            onChange={handleChange}
          />

          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            placeholder="Enter subject"
            value={formData.subject}
            onChange={handleChange}
          />

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            placeholder="Enter your message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
          ></textarea>

          <button type="submit">Send</button>
        </form>

        {responseMessage && <p className="response-message">{responseMessage}</p>}
      </div>
    </div>
  )
}

export default ContactUs


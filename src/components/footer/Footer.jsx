// Footer.jsx
import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import "./Footer.css";
// Import your footer logo image – adjust the path based on your project structure.
import footerLogo from "/assets/taxallnewww22n.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-overlay">
        <div className="footer-container">
          {/* Brand Section with Uploaded Logo */}
          <div className="footer-logo">
            <img src={footerLogo} alt="Best of Beat Logo" className="logo-image" />
            <p>Simplify Your Taxes, Amplify Your Savings</p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Services</a>
              </li>
              <li>
                <a href="#">Gallery</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="footer-contact">
            <h3>Contact Us</h3>
            <p> Narayana nagar Laxmi nagar
lalita park
NEW DELHI, DELHI 110092
India</p>
            <p>Email: taxallfinance@gmail.com</p>
            <p>Phone: (+91) 79798 47852</p>
          </div>

          {/* Newsletter Subscription */}
          <div className="footer-newsletter">
            <h3>Subscribe</h3>
            <p>Join our newsletter for the latest updates.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="footer-social">
          <a href="#" className="social-icon">
            <FaFacebookF />
          </a>
          <a href="#" className="social-icon">
            <FaTwitter />
          </a>
          <a href="#" className="social-icon">
            <FaInstagram />
          </a>
          <a href="#" className="social-icon">
            <FaYoutube />
          </a>
        </div>

        {/* Bottom Footer */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} Best of Beat. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="content-wrapper">
        {/* Left Section */}
        <section className="left-content">
          <img
            src="assets/taxallnewww.png"
            alt="Intuit Logo"
            className="logo"
          />
          <h1 className="title">
            FREE <span className="pricing">₹0 | ₹0 | ₹0</span>
          </h1>
          <h2 className='subtitle2'>Why waste your time elsewhere? </h2>
          <p className="subtitle">
          Expert ITR Filing, TDS on Property Sales, Legal Solutions & Accounting Services – Your One-Stop Destination for Financial Excellence!{' '} </p>
            {/* <a href="#" className="link">
              Simple Form 1040 returns only
            </a>{' '}
            (no schedules except for Earned Income Tax Credit, Child Tax Credit, and student loan interest).
          </p> */}
          <p className="description">
            Transfer last year’s info for a head start on your taxes with <b><b>Taxall </b></b>  Free Edition.
          </p>
          <a href="#" className="cta-button">
            Subscribe Now 
          </a>
        </section>

        {/* Right Section */}
        <section className="right-content">
          <img
            src="assets/akkk.png"
            alt="Customer holding a tablet with refund details"
            className="hero-image"
          />
        </section>
      </div>
    </div>
  );
};

export default Home;

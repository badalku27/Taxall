// Products.jsx
import React, { useEffect, useState } from 'react';
import './Products.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { FaTimes } from 'react-icons/fa';
import IncomeTaxCalculator from '../incometaxcalculator/IncomeTaxCalculator'; 
import Imgtotxt from '../imgtotst/Imgtotxt';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Products = () => {
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: false });

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (modalType) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [modalType]);

  const openModal = (type) => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  return (
    <div className="product-main">
      <div className="products-container flex flex-col items-center justify-center">
        <h1 className="products-heading" data-aos="fade-down">Our Products</h1>

        <div className="parent-container">
          {/* Income Tax Calculator */}
          <div className="product-box" data-aos="fade-up">
            <div className="icon-container">
              <DotLottieReact
                src="https://lottie.host/d2355234-4f3b-4bc6-aacf-e5405e8c26bf/7AuAzli9Nf.lottie"
                loop
                autoplay
                className="icon"
              />
            </div>
            <h2 className="section-title1">Income Tax Calculator</h2>
            <p className="section-description">
              Our Income Tax Calculator is designed to help you quickly and accurately estimate your taxes based on your income, deductions, and credits. Plan your finances confidently with our intuitive tool.
            </p>
            <button className="btn-calc">
              <a href='/incometaxcalculator'>Calculate Now</a>
            </button>
          </div>

          {/* Taxall File Converter */}
          <div className="product-box" data-aos="fade-up" data-aos-delay="200">
            <div className="icon-container">
              <DotLottieReact
                src="https://lottie.host/e87388ea-7e59-4cfc-b6e5-8a1d0bd33207/GVN8oyZtuc.lottie"
                loop
                autoplay
                className="icon"
              />
            </div>
            <h2 className="section-title1">Taxall File Converter</h2>
            <p className="section-description">
              Taxall File Converter is a professional online tool enabling secure conversion of diverse file formats. Optimize your documents effortlessly with intelligent scaling, quality control, and a sleek, intuitive user interface.
            </p>
            <button className="btn-calc">
             <a href='/fileconverter'>Convert Now</a>
            </button>
          </div>

          {/* Example: Image to Text (if needed later) */}
          {/* <div className="product-box" data-aos="fade-up" data-aos-delay="400">
            ...
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Products;

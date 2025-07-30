import React from 'react';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import Converter from './Converter'; // Import the existing Converter component

const ConverterPage = () => {
  return (
    <div>
      <Header />
      <Converter />
      <Footer />
    </div>
  );
};

export default ConverterPage;

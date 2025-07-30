import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Askme from "./components/askme/ChatBot";
import Home from "./components/home/Home";
import OurService from "./components/ourservices/OurService";
import Products from "./components/products/Product";
import Review from "./components/review/Review";
import ContactUs from "./components/contactUs/ContactUs";
import Blog from "./components/blog/Blog";
import IncomeTaxCalculator from "./components/incometaxcalculator/IncomeTaxCalculator";
import "./App.css"
import Conversion from "./components/conversion/Conversion";
// import UploadTest from "./components/signin/UploadTest"
import Signin from "./components/signin/Signin";
import UserDashboard from "./components/signin/UserDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import BlogView from "./components/blog/BlogView";
import BlogList from "./components/blog/BlogList";
const App = () => {
  const location = useLocation(); // Get current location

  return (
    <div>
      <Header />
      <Askme />
     
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Home />
                <OurService />
                <Products />
                <Blog />
                <ContactUs />
                <Review />
              </>
            }
          />
          <Route path="/incometaxcalculator" element={<IncomeTaxCalculator />} />
          <Route path="/fileconverter" element={<Conversion />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/profile" element={<UserDashboard />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/blogs" element={<BlogList />} />
          /blogs
          <Route path="/blogview/:id" element={<BlogView />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
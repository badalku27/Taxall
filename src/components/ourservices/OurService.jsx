"use client"

import { useEffect, useState } from "react"
import AOS from "aos"
import "aos/dist/aos.css"
import "./OurService.css"
import { FileText, CheckCircle, Scale, Calculator, MessageCircle, Mail, X, Receipt, Settings } from "lucide-react"

const services = [
  {
    title: "ITR Filing",
    icon: <FileText className="service-icon" />,
    description: "Timely and accurate filing of Income Tax Returns for individuals and businesses.",
  },
  {
    title: "TDS",
    icon: <CheckCircle className="service-icon" />,
    description: "Seamless management of Tax Deducted at Source (TDS) with expert advice.",
  },
  {
    title: "Legal Services",
    icon: <Scale className="service-icon" />,
    description: "Professional legal support tailored to business and personal needs.",
  },
  {
    title: "Accounting",
    icon: <Calculator className="service-icon" />,
    description: "Efficient accounting services to keep your finances in order.",
  },
  {
    title: "GST Services",
    icon: <Receipt className="service-icon" />,
    description: "Comprehensive GST registration, filing, and compliance management services.",
  },
  {
    title: "Other Services",
    icon: <Settings className="service-icon" />,
    description: "Additional financial and business consulting services tailored to your needs.",
  },
]

const OurService = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedService, setSelectedService] = useState("")

  useEffect(() => {
    AOS.init({ duration: 1000, once: false })
  }, [])

  const handleApplyNow = (serviceName) => {
    setSelectedService(serviceName)
    setShowModal(true)
  }

  const handleWhatsAppClick = () => {
    const message = `Hi! I need help with ${selectedService}. Can you provide pricing and details? Thanks!`
    const phoneNumber = "918709253824" // Replace with your actual WhatsApp number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    setShowModal(false)
  }

  const handleContactFormClick = () => {
    // Scroll to contact section
    const contactSection = document.querySelector(".contact-us")
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" })
    }
    setShowModal(false)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedService("")
  }

  return (
    <section className="service-section">
      <div className="text-center" data-aos="fade-down">
        <h2 className="main-heading">Our Services</h2>
        <p className="sub-heading">
          We offer a wide range of tax, legal, and financial services to support individuals and businesses.
        </p>
      </div>
      <div className="service-container">
        {services.map((service, index) => (
          <div key={index} className="service-card" data-aos="fade-up" data-aos-delay={index * 100}>
            <div className="service-icon-container">{service.icon}</div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-description">{service.description}</p>
            <button className="service-button" onClick={() => handleApplyNow(service.title)}>
              Apply Now
            </button>
          </div>
        ))}
      </div>

      {/* Simple Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Contact Us for {selectedService}</h3>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p>How would you like to get in touch?</p>

              <div className="contact-options">
                <button className="contact-btn whatsapp-btn" onClick={handleWhatsAppClick}>
                  <MessageCircle size={20} />
                  <span>WhatsApp</span>
                </button>

                <button className="contact-btn email-btn" onClick={handleContactFormClick}>
                  <Mail size={20} />
                  <span>Contact Form</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default OurService

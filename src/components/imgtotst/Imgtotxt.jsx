// import React, { useState, useRef, useEffect } from 'react';
// import Tesseract from 'tesseract.js';
// import axios from 'axios';
// import { saveAs } from 'file-saver';
// import * as htmlToImage from 'html-to-image';
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';
// import './Imgtotxt.css';

// pdfMake.vfs = pdfFonts.vfs;

// const Imgtotxt = () => {
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [extractedText, setExtractedText] = useState('');
//   const [translatedText, setTranslatedText] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [translating, setTranslating] = useState(false);
//   const textPreviewRef = useRef(null);

//   // Clean up the object URL when component unmounts or image changes
//   useEffect(() => {
//     if (selectedImage) {
//       const url = URL.createObjectURL(selectedImage);
//       setImagePreview(url);
//       return () => URL.revokeObjectURL(url);
//     } else {
//       setImagePreview(null);
//     }
//   }, [selectedImage]);

//   // Handle file input change
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedImage(file);
//       setExtractedText('');
//       setTranslatedText('');
//     }
//   };

//   // Extract text from the image using Tesseract.js
//   const handleExtractText = async () => {
//     if (!selectedImage) {
//       alert('Please select an image first!');
//       return;
//     }
//     setLoading(true);
//     setTranslatedText('');
//     try {
//       const { data } = await Tesseract.recognize(
//         selectedImage,
//         'eng+hin', // Detect both English and Hindi
//         { logger: (m) => console.log(m) }
//       );
//       setExtractedText(data.text.trim() || 'No text found in the image.');
//     } catch (error) {
//       console.error('Error extracting text:', error);
//       setExtractedText('Failed to extract text. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper: Split text into chunks (for MyMemory API's query length limit)
//   const chunkText = (text, chunkSize = 500) => {
//     const chunks = [];
//     for (let i = 0; i < text.length; i += chunkSize) {
//       chunks.push(text.substring(i, i + chunkSize));
//     }
//     return chunks;
//   };

//   // Translate text using the MyMemory API with chunking
//   const translateText = async () => {
//     if (!extractedText) return;
//     setTranslating(true);
//     let sourceLang, targetLang;
//     // Detect if Hindi characters exist in the text
//     if (/[\u0900-\u097F]/.test(extractedText)) {
//       sourceLang = 'hi';
//       targetLang = 'en';
//     } else {
//       sourceLang = 'en';
//       targetLang = 'hi';
//     }
//     const chunks = chunkText(extractedText, 500);
//     try {
//       const translatedChunks = await Promise.all(
//         chunks.map(async (chunk) => {
//           const response = await axios.get('https://api.mymemory.translated.net/get', {
//             params: {
//               q: chunk,
//               langpair: `${sourceLang}|${targetLang}`
//             }
//           });
//           return response.data.responseData.translatedText;
//         })
//       );
//       setTranslatedText(translatedChunks.join(' '));
//     } catch (error) {
//       console.error('Translation error:', error);
//       setTranslatedText('Failed to translate text.');
//     } finally {
//       setTranslating(false);
//     }
//   };

//   // Download extracted text as a PDF using pdfMake
//   const downloadAsPDF = () => {
//     try {
//       const docDefinition = {
//         content: [
//           { text: 'Extracted Text:', style: 'header' },
//           { text: extractedText, style: 'body' }
//         ],
//         styles: {
//           header: { fontSize: 18, bold: true, marginBottom: 10 },
//           body: { fontSize: 12 }
//         }
//       };
//       pdfMake.createPdf(docDefinition).download('extracted-text.pdf');
//     } catch (error) {
//       console.error('PDF download error:', error);
//     }
//   };

//   // Download the text preview as an image (JPG)
//   const downloadAsImage = () => {
//     if (textPreviewRef.current) {
//       htmlToImage.toBlob(textPreviewRef.current)
//         .then((blob) => saveAs(blob, 'extracted-text.jpg'))
//         .catch((error) => console.error('Error converting to image:', error));
//     }
//   };

//   // Download extracted text as a Word document
//   const downloadAsWord = () => {
//     try {
//       const blob = new Blob([extractedText], { type: 'application/msword' });
//       saveAs(blob, 'extracted-text.doc');
//     } catch (error) {
//       console.error('Word download error:', error);
//     }
//   };

//   return (
//     <div className="imgtotxt-container">
//       <h1 className="imgtotxt-title">Taxall Image to Text Converter</h1>
//       <div className="imgtotxt-upload-container">
//         <input type="file" accept="image/*" onChange={handleImageChange} />
//         {imagePreview && (
//           <img
//             src={imagePreview}
//             alt="Selected"
//             className="imgtotxt-image-preview"
//           />
//         )}
//       </div>
//       <div style={{ textAlign: 'center' }}>
//         <button 
//           className="imgtotxt-button" 
//           onClick={handleExtractText} 
//           disabled={loading}
//         >
//           {loading ? 'Extracting...' : 'Extract Text'}
//         </button>
//       </div>
//       {extractedText && (
//         <div className="imgtotxt-result-container">
//           <h2 className="imgtotxt-result-title">Extracted Text:</h2>
//           <div className="imgtotxt-text-preview" ref={textPreviewRef}>
//             <p className="imgtotxt-result-text">{extractedText}</p>
//           </div>
//           <div style={{ textAlign: 'center' }}>
//             <button 
//               className="imgtotxt-button" 
//               onClick={translateText} 
//               disabled={translating}
//             >
//               {translating ? 'Translating...' : 'Translate Text'}
//             </button>
//           </div>
//           {translatedText && (
//             <p className="imgtotxt-translated-text">{translatedText}</p>
//           )}
//           <div className="imgtotxt-download-options">
//             <h3 className="imgtotxt-download-title">Download Options:</h3>
//             <button className="imgtotxt-button" onClick={downloadAsPDF}>
//               Download as PDF
//             </button>
//             <button className="imgtotxt-button" onClick={downloadAsImage}>
//               Download as JPG
//             </button>
//             <button className="imgtotxt-button" onClick={downloadAsWord}>
//               Download as Word
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Imgtotxt;

"use client"

import { useState, useRef, useEffect } from "react"
import Tesseract from "tesseract.js"
import { saveAs } from "file-saver"
import * as htmlToImage from "html-to-image"
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
import "./Imgtotxt.css"
import { translateAPI } from "../../APILinks"

pdfMake.vfs = pdfFonts.vfs

const Imgtotxt = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [extractedText, setExtractedText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState(false)
  const textPreviewRef = useRef(null)

  // Clean up the object URL when component unmounts or image changes
  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage)
      setImagePreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setImagePreview(null)
    }
  }, [selectedImage])

  // Handle file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      setExtractedText("")
      setTranslatedText("")
    }
  }

  // Extract text from the image using Tesseract.js
  const handleExtractText = async () => {
    if (!selectedImage) {
      alert("Please select an image first!")
      return
    }
    setLoading(true)
    setTranslatedText("")
    try {
      const { data } = await Tesseract.recognize(
        selectedImage,
        "eng+hin", // Detect both English and Hindi
        { logger: (m) => console.log(m) },
      )
      setExtractedText(data.text.trim() || "No text found in the image.")
    } catch (error) {
      console.error("Error extracting text:", error)
      setExtractedText("Failed to extract text. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Helper: Split text into chunks (for MyMemory API's query length limit)
  const chunkText = (text, chunkSize = 500) => {
    const chunks = []
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize))
    }
    return chunks
  }

  // Translate text using the MyMemory API with chunking
  const translateText = async () => {
    if (!extractedText) return
    setTranslating(true)
    let sourceLang, targetLang
    // Detect if Hindi characters exist in the text
    if (/[\u0900-\u097F]/.test(extractedText)) {
      sourceLang = "hi"
      targetLang = "en"
    } else {
      sourceLang = "en"
      targetLang = "hi"
    }
    const chunks = chunkText(extractedText, 500)
    try {
      const translatedChunks = await Promise.all(
        chunks.map(async (chunk) => {
          const response = await translateAPI.translate(chunk, sourceLang, targetLang)
          return response.data.responseData.translatedText
        }),
      )
      setTranslatedText(translatedChunks.join(" "))
    } catch (error) {
      console.error("Translation error:", error)
      setTranslatedText("Failed to translate text.")
    } finally {
      setTranslating(false)
    }
  }

  // Download extracted text as a PDF using pdfMake
  const downloadAsPDF = () => {
    try {
      const docDefinition = {
        content: [
          { text: "Extracted Text:", style: "header" },
          { text: extractedText, style: "body" },
        ],
        styles: {
          header: { fontSize: 18, bold: true, marginBottom: 10 },
          body: { fontSize: 12 },
        },
      }
      pdfMake.createPdf(docDefinition).download("extracted-text.pdf")
    } catch (error) {
      console.error("PDF download error:", error)
    }
  }

  // Download the text preview as an image (JPG)
  const downloadAsImage = () => {
    if (textPreviewRef.current) {
      htmlToImage
        .toBlob(textPreviewRef.current)
        .then((blob) => saveAs(blob, "extracted-text.jpg"))
        .catch((error) => console.error("Error converting to image:", error))
    }
  }

  // Download extracted text as a Word document
  const downloadAsWord = () => {
    try {
      const blob = new Blob([extractedText], { type: "application/msword" })
      saveAs(blob, "extracted-text.doc")
    } catch (error) {
      console.error("Word download error:", error)
    }
  }

  return (
    <div className="imgtotxt-container">
      <h1 className="imgtotxt-title">Taxall Image to Text Converter</h1>
      <div className="imgtotxt-upload-container">
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && (
          <img src={imagePreview || "/placeholder.svg"} alt="Selected" className="imgtotxt-image-preview" />
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        <button className="imgtotxt-button" onClick={handleExtractText} disabled={loading}>
          {loading ? "Extracting..." : "Extract Text"}
        </button>
      </div>
      {extractedText && (
        <div className="imgtotxt-result-container">
          <h2 className="imgtotxt-result-title">Extracted Text:</h2>
          <div className="imgtotxt-text-preview" ref={textPreviewRef}>
            <p className="imgtotxt-result-text">{extractedText}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <button className="imgtotxt-button" onClick={translateText} disabled={translating}>
              {translating ? "Translating..." : "Translate Text"}
            </button>
          </div>
          {translatedText && <p className="imgtotxt-translated-text">{translatedText}</p>}
          <div className="imgtotxt-download-options">
            <h3 className="imgtotxt-download-title">Download Options:</h3>
            <button className="imgtotxt-button" onClick={downloadAsPDF}>
              Download as PDF
            </button>
            <button className="imgtotxt-button" onClick={downloadAsImage}>
              Download as JPG
            </button>
            <button className="imgtotxt-button" onClick={downloadAsWord}>
              Download as Word
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Imgtotxt


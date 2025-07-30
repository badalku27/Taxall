// import React, { useState, useEffect } from "react";
// import Tesseract from "tesseract.js";
// import { jsPDF } from "jspdf";
// import JSZip from "jszip"; // <-- For combining multiple image files when needed
// import { FaFilePdf, FaFileImage, FaFileWord, FaFileAlt } from "react-icons/fa";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import "./Conversion.css";

// // ------------------ Helper Functions ------------------

// const base64ToBlob = (base64, mime) => {
//   if (base64.startsWith("data:")) {
//     base64 = base64.split(",")[1];
//   }
//   base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
//   while (base64.length % 4 !== 0) {
//     base64 += "=";
//   }
//   const byteCharacters = atob(base64);
//   const byteNumbers = new Array(byteCharacters.length);
//   for (let i = 0; i < byteCharacters.length; i++) {
//     byteNumbers[i] = byteCharacters.charCodeAt(i);
//   }
//   return new Blob([new Uint8Array(byteNumbers)], { type: mime });
// };

// const getExtension = (conversionType) => {
//   switch (conversionType) {
//     case "docx-to-pdf":
//       return "pdf";
//     case "pdf-to-docx":
//       return "docx";
//     case "docx-to-jpg":
//       return "jpg";
//     case "pdf-to-jpg":
//       return "zip";
//     case "jpg-to-pdf":
//       return "pdf";
//     case "merge-pdf":
//       return "pdf";
//     default:
//       return "file";
//   }
// };

// const getAcceptForConversion = (conversionType) => {
//   switch (conversionType) {
//     case "docx-to-pdf":
//     case "docx-to-jpg":
//       return ".docx";
//     case "pdf-to-docx":
//     case "pdf-to-jpg":
//     case "merge-pdf":
//       return ".pdf";
//     case "jpg-to-pdf":
//       return ".jpg,.jpeg";
//     default:
//       return "";
//   }
// };

// const getConvertedFilename = (originalName, conversionType) => {
//   const dotIndex = originalName.lastIndexOf(".");
//   const baseName = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
//   return `${baseName}.${getExtension(conversionType)}`;
// };

// const getFileUrlFromResponse = (fileObj, conversionType) => {
//   console.log("Processing file object:", fileObj);
//   if (fileObj.File) return fileObj.File;
//   if (fileObj.Url) return fileObj.Url;
//   if (fileObj.FileData) {
//     let mimeType = "application/octet-stream";
//     if (conversionType === "docx-to-pdf" || conversionType === "jpg-to-pdf")
//       mimeType = "application/pdf";
//     else if (conversionType === "pdf-to-docx")
//       mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
//     else if (conversionType === "docx-to-jpg")
//       mimeType = "image/jpeg";
//     else if (conversionType === "pdf-to-jpg")
//       mimeType = "application/zip";
//     else if (conversionType === "merge-pdf")
//       mimeType = "application/pdf";
//     const blob = base64ToBlob(fileObj.FileData, mimeType);
//     return URL.createObjectURL(blob);
//   }
//   return "";
// };

// // ------------------ Conversion Functions ------------------

// const convertDocxToPdf = async (file) => {
//   const formData = new FormData();
//   formData.append("File", file);
//   const response = await fetch("https://v2.convertapi.com/convert/docx/to/pdf", {
//     method: "POST",
//     headers: { Authorization: "Bearer secret_BGps62890R8yIFfz" },
//     body: formData,
//   });
//   console.log("DOCX to PDF - Raw response:", response);
//   const data = await response.json();
//   console.log("DOCX to PDF - JSON response:", data);
//   if (data.Files && data.Files.length > 0) {
//     const fileObj = data.Files[0];
//     const url = getFileUrlFromResponse(fileObj, "docx-to-pdf");
//     if (url) return url;
//   }
//   throw new Error("DOCX to PDF conversion failed");
// };

// const convertPdfToDocx = async (file) => {
//   const formData = new FormData();
//   formData.append("File", file);
//   const response = await fetch("https://v2.convertapi.com/convert/pdf/to/docx", {
//     method: "POST",
//     headers: { Authorization: "Bearer secret_e8H2rPx2EGZ3KMhG" },
//     body: formData,
//   });
//   console.log("PDF to DOCX - Raw response:", response);
//   const data = await response.json();
//   console.log("PDF to DOCX - JSON response:", data);
//   if (data.Files && data.Files.length > 0) {
//     const fileObj = data.Files[0];
//     const url = getFileUrlFromResponse(fileObj, "pdf-to-docx");
//     if (url) return url;
//   }
//   throw new Error("PDF to DOCX conversion failed");
// };

// const convertDocxToJpg = async (file) => {
//   const formData = new FormData();
//   formData.append("File", file);
//   formData.append("StoreFile", "true");
//   const response = await fetch("https://v2.convertapi.com/convert/docx/to/jpg", {
//     method: "POST",
//     headers: { Authorization: "Bearer secret_e8H2rPx2EGZ3KMhG" },
//     body: formData,
//   });
//   console.log("DOCX to JPG - Raw response:", response);
//   const data = await response.json();
//   console.log("DOCX to JPG - JSON response:", data);
//   if (data.Files && data.Files.length > 0) {
//     if (data.Files.length === 1) {
//       const fileObj = data.Files[0];
//       return getFileUrlFromResponse(fileObj, "docx-to-jpg");
//     }
//     const firstFile = data.Files[0];
//     if (firstFile.FileName && firstFile.FileName.toLowerCase().endsWith(".zip")) {
//       return getFileUrlFromResponse(firstFile, "docx-to-jpg");
//     }
//     const zip = new JSZip();
//     for (let i = 0; i < data.Files.length; i++) {
//       const fileObj = data.Files[i];
//       const fileUrl = getFileUrlFromResponse(fileObj, "docx-to-jpg");
//       const res = await fetch(fileUrl);
//       const blob = await res.blob();
//       console.log(`DOCX-to-JPG: File ${i} size: ${blob.size}`);
//       const fileName = fileObj.FileName || `page_${i}.jpg`;
//       zip.file(fileName, blob);
//     }
//     const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
//     const zipBlob = new Blob([zipArrayBuffer], { type: "application/zip" });
//     console.log("Generated DOCX-to-JPG zip size:", zipBlob.size);
//     return URL.createObjectURL(zipBlob);
//   }
//   throw new Error("DOCX to JPG conversion failed");
// };

// const convertPdfToJpg = async (file) => {
//   const formData = new FormData();
//   formData.append("File", file);
//   formData.append("ZipFiles", "true");
//   formData.append("StoreFile", "true");
//   const response = await fetch("https://v2.convertapi.com/convert/pdf/to/jpg", {
//     method: "POST",
//     headers: { Authorization: "Bearer secret_e8H2rPx2EGZ3KMhG" },
//     body: formData,
//   });
//   console.log("PDF to JPG - Raw response:", response);
//   const data = await response.json();
//   console.log("PDF to JPG - JSON response:", data);
//   if (data.Files && data.Files.length > 0) {
//     const firstFile = data.Files[0];
//     if (firstFile.FileName && firstFile.FileName.toLowerCase().endsWith(".zip")) {
//       return getFileUrlFromResponse(firstFile, "pdf-to-jpg");
//     }
//     if (data.Files.length > 1) {
//       const zip = new JSZip();
//       for (let i = 0; i < data.Files.length; i++) {
//         const fileObj = data.Files[i];
//         const fileUrl = getFileUrlFromResponse(fileObj, "pdf-to-jpg");
//         const res = await fetch(fileUrl);
//         const blob = await res.blob();
//         console.log(`PDF-to-JPG: File ${i} size: ${blob.size}`);
//         const fileName = fileObj.FileName || `page_${i}.jpg`;
//         zip.file(fileName, blob);
//       }
//       const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
//       const zipBlob = new Blob([zipArrayBuffer], { type: "application/zip" });
//       console.log("Generated PDF-to-JPG zip size:", zipBlob.size);
//       return URL.createObjectURL(zipBlob);
//     }
//     const fileObj = data.Files[0];
//     return getFileUrlFromResponse(fileObj, "pdf-to-jpg");
//   }
//   throw new Error("PDF to JPG conversion failed");
// };

// const convertJpgToPdf = async (file) => {
//   const formData = new FormData();
//   formData.append("File", file);
//   formData.append("StoreFile", "true");
//   const response = await fetch("https://v2.convertapi.com/convert/jpg/to/pdf", {
//     method: "POST",
//     headers: { Authorization: "Bearer secret_e8H2rPx2EGZ3KMhG" },
//     body: formData,
//   });
//   console.log("JPG to PDF - Raw response:", response);
//   const data = await response.json();
//   console.log("JPG to PDF - JSON response:", data);
//   if (data.Files && data.Files.length > 0) {
//     const fileObj = data.Files[0];
//     const url = getFileUrlFromResponse(fileObj, "jpg-to-pdf");
//     if (url) return url;
//   }
//   throw new Error("JPG to PDF conversion failed");
// };

// // New function: Merge multiple PDFs into one using the correct endpoint
// const mergePdfFiles = async (files) => {
//   const formData = new FormData();
//   files.forEach((file, index) => {
//     formData.append(`Files[${index}]`, file);
//   });
//   formData.append("StoreFile", "true");

//   // Use the correct merge endpoint from ConvertAPI documentation:
//   const response = await fetch("https://v2.convertapi.com/convert/pdf/to/merge", {
//     method: "POST",
//     headers: { Authorization: "Bearer secret_e8H2rPx2EGZ3KMhG" },
//     body: formData,
//   });

//   console.log("Merge PDF - Raw response:", response);
//   if (!response.ok) {
//     console.error("Merge PDF API returned an error:", response.status, response.statusText);
//     throw new Error(`Merge PDF conversion failed with status ${response.status}`);
//   }

//   const data = await response.json();
//   console.log("Merge PDF - JSON response:", data);
//   if (data.Files && data.Files.length > 0) {
//     const fileObj = data.Files[0];
//     return getFileUrlFromResponse(fileObj, "merge-pdf");
//   }
//   throw new Error("Merge PDF conversion failed");
// };

// const convertFile = async (file, conversionType) => {
//   switch (conversionType) {
//     case "docx-to-pdf":
//       return await convertDocxToPdf(file);
//     case "pdf-to-docx":
//       return await convertPdfToDocx(file);
//     case "docx-to-jpg":
//       return await convertDocxToJpg(file);
//     case "pdf-to-jpg":
//       return await convertPdfToJpg(file);
//     case "jpg-to-pdf":
//       return await convertJpgToPdf(file);
//     case "merge-pdf":
//       return await mergePdfFiles(file);
//     default:
//       throw new Error("Invalid conversion type");
//   }
// };

// // ------------------ OCR Functions ------------------

// const imageToTextOCR = async (file) => {
//   try {
//     const result = await Tesseract.recognize(file, "eng+hin", {
//       logger: (m) => console.log("OCR:", m),
//     });
//     return result.data.text;
//   } catch (error) {
//     throw error;
//   }
// };

// const convertFileToText = async (file) => {
//   const fileName = file.name.toLowerCase();
//   if (fileName.endsWith(".pdf")) {
//     try {
//       const jpgUrl = await convertPdfToJpg(file);
//       const result = await Tesseract.recognize(jpgUrl, "eng+hin", {
//         logger: (m) => console.log("OCR:", m),
//       });
//       return result.data.text;
//     } catch (error) {
//       throw new Error("PDF to text conversion failed: " + error.message);
//     }
//   } else {
//     return await imageToTextOCR(file);
//   }
// };

// const downloadBlobFile = (blob, filename) => {
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.style.display = "none";
//   a.href = url;
//   a.download = filename;
//   document.body.appendChild(a);
//   a.click();
//   setTimeout(() => {
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   }, 0);
// };

// const downloadTextFile = (text, filename) => {
//   const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
//   downloadBlobFile(blob, filename);
// };

// // ------------------ Reusable Components ------------------

// // DropZone Component
// const DropZone = ({ onFileSelect, accept, file, placeholder, multiple = false }) => {
//   const [isDragging, setIsDragging] = useState(false);
//   const fileInputRef = React.useRef(null);
//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(true);
//   };
//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//   };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       if (multiple) {
//         onFileSelect(Array.from(e.dataTransfer.files));
//       } else {
//         onFileSelect(e.dataTransfer.files[0]);
//       }
//       e.dataTransfer.clearData();
//     }
//   };
//   const handleClick = () => {
//     fileInputRef.current.click();
//   };
//   return (
//     <div
//       className={`dropzone ${isDragging ? "dragging" : ""}`}
//       onDragOver={handleDragOver}
//       onDragLeave={handleDragLeave}
//       onDrop={handleDrop}
//       onClick={handleClick}
//       style={{ cursor: "pointer" }}
//     >
//       <input
//         type="file"
//         ref={fileInputRef}
//         style={{ display: "none" }}
//         accept={accept}
//         multiple={multiple}
//         onChange={(e) => {
//           if (e.target.files && e.target.files.length > 0) {
//             if (multiple) {
//               onFileSelect(Array.from(e.target.files));
//             } else {
//               onFileSelect(e.target.files[0]);
//             }
//           }
//         }}
//       />
//       {file
//         ? multiple
//           ? <p>{file.map((f) => f.name).join(", ")}</p>
//           : <p>File: {file.name}</p>
//         : <p>{placeholder}</p>}
//     </div>
//   );
// };

// const ModalPopup = ({ isOpen, onClose, title, children }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="modal-overlay">
//       <div className="modal-cont">
//         <button className="modal-close" onClick={onClose}>
//           &times;
//         </button>
//         <div className="modal-header">
//           <h2>{title}</h2>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// };

// const ProgressBar = ({ progress }) => (
//   <div className="progress-container">
//     <div className="progress-bar" style={{ width: `${progress}%` }}>
//       {Math.floor(progress)}%
//     </div>
//   </div>
// );

// const ConversionCard = ({ conversionType, label, description, icon, onClick }) => (
//   <div className="conversion-card" onClick={onClick}>
//     <div className="card-icon">{icon}</div>
//     <h3 className="card-title">{label}</h3>
//     <p className="card-description">{description}</p>
//   </div>
// );

// // ------------------ Main Conversion Component ------------------

// const Conversion = () => {
//   useEffect(() => {
//     if (window.innerWidth >= 768) {
//       AOS.init({ duration: 800, once: true });
//     }
//   }, []);

//   // --- File Converter States ---
//   const [selectedConversion, setSelectedConversion] = useState("docx-to-pdf");
//   const [isFileModalOpen, setIsFileModalOpen] = useState(false);
//   // For merge-pdf, fileInput will be an array; otherwise a single file
//   const [fileInput, setFileInput] = useState(null);
//   const [convertedFileUrl, setConvertedFileUrl] = useState("");
//   const [fileProgress, setFileProgress] = useState(0);
//   const [fileConverting, setFileConverting] = useState(false);

//   // --- Text Converter States ---
//   const [textFile, setTextFile] = useState(null);
//   const [convertedText, setConvertedText] = useState("");
//   const [textProgress, setTextProgress] = useState(0);
//   const [textConverting, setTextConverting] = useState(false);

//   // ------------------ Progress Simulation with Water Float Animation ------------------
//   const simulateProgress = (duration, setProgress) => {
//     return new Promise((resolve) => {
//       let progress = 10; // Immediately start at 10%
//       setProgress(progress);
//       const interval = setInterval(() => {
//         if (progress < 99) {
//           // Increase by a small random float increment to simulate a water-like float effect
//           progress += Math.random() * 2;
//           if (progress > 99) progress = 99;
//           setProgress(progress);
//         }
//       }, duration / 100);

//       // Resolve the promise after the duration has passed
//       setTimeout(() => {
//         clearInterval(interval);
//         setProgress(100);
//         resolve();
//       }, duration);
//     });
//   };

//   // ------------------ Conversion Handlers ------------------

//   const handleFileConversion = async () => {
//     if (!fileInput || (selectedConversion === "merge-pdf" && fileInput.length === 0)) {
//       alert("Please select at least one file.");
//       return;
//     }
//     setFileConverting(true);
//     setFileProgress(0);
//     const minDuration = 3000; // 3 seconds minimum for progress simulation
//     try {
//       let resultUrl;
//       if (selectedConversion === "merge-pdf") {
//         resultUrl = await convertFile(fileInput, selectedConversion);
//       } else {
//         resultUrl = await convertFile(fileInput, selectedConversion);
//       }
//       await simulateProgress(minDuration, setFileProgress);
      
//       // Trigger download after progress reaches 100%
//       if (
//         selectedConversion === "pdf-to-jpg" ||
//         selectedConversion === "docx-to-jpg"
//       ) {
//         if (resultUrl.startsWith("http")) {
//           const a = document.createElement("a");
//           a.href = resultUrl;
//           a.download = getConvertedFilename(
//             Array.isArray(fileInput)
//               ? fileInput[0].name
//               : fileInput.name,
//             selectedConversion
//           );
//           a.style.display = "none";
//           document.body.appendChild(a);
//           a.click();
//           document.body.removeChild(a);
//         } else {
//           const blobResponse = await fetch(resultUrl);
//           const blob = await blobResponse.blob();
//           const dotIndex = Array.isArray(fileInput)
//             ? fileInput[0].name.lastIndexOf(".")
//             : fileInput.name.lastIndexOf(".");
//           const baseName =
//             dotIndex !== -1
//               ? (Array.isArray(fileInput)
//                   ? fileInput[0].name.substring(0, dotIndex)
//                   : fileInput.name.substring(0, dotIndex))
//               : (Array.isArray(fileInput)
//                   ? fileInput[0].name
//                   : fileInput.name);
//           const downloadFilename = `${baseName}.${getExtension(selectedConversion)}`;
//           downloadBlobFile(blob, downloadFilename);
//         }
//       } else {
//         setConvertedFileUrl(resultUrl);
//         const downloadFilename = getConvertedFilename(
//           Array.isArray(fileInput)
//             ? fileInput[0].name
//             : fileInput.name,
//           selectedConversion
//         );
//         const a = document.createElement("a");
//         a.href = resultUrl;
//         a.download = downloadFilename;
//         a.style.display = "none";
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//       }
//     } catch (err) {
//       console.error("Conversion error:", err);
//       alert("Conversion failed: " + err.message);
//     }
//     setFileConverting(false);
//   };

//   // ------------------ New Handler for Merge PDF ------------------
//   const handleAddMergeFile = (newFile) => {
//     setFileInput((prevFiles) => {
//       const updatedFiles = prevFiles ? [...prevFiles, newFile] : [newFile];
//       return updatedFiles;
//     });
//   };

//   const handleRemoveMergeFile = (indexToRemove) => {
//     setFileInput((prevFiles) =>
//       prevFiles.filter((_, index) => index !== indexToRemove)
//     );
//   };

//   const handleConvertToText = async () => {
//     if (!textFile) {
//       alert("Please select a file for text conversion.");
//       return;
//     }
//     setTextConverting(true);
//     setTextProgress(0);
//     const minDuration = 3000;
//     try {
//       const conversionPromise = convertFileToText(textFile);
//       const [text] = await Promise.all([
//         conversionPromise,
//         simulateProgress(minDuration, setTextProgress),
//       ]);
//       setTextProgress(100);
//       setConvertedText(text);
//     } catch (error) {
//       console.error("Text conversion failed:", error);
//       alert("Conversion to text failed: " + error.message);
//     }
//     setTextConverting(false);
//   };

//   const handleDownloadText = () => {
//     downloadTextFile(convertedText, "extracted_text.txt");
//   };

//   const handleDownloadTextAsPDF = () => {
//     const doc = new jsPDF();
//     const lines = doc.splitTextToSize(convertedText, 180);
//     doc.text(lines, 10, 10);
//     doc.save("extracted_text.pdf");
//   };

//   const conversionCards = [
//     {
//       type: "docx-to-pdf",
//       label: "DOCX to PDF",
//       description: "Convert DOCX files into polished, print-ready PDFs.",
//       icon: <FaFilePdf size={40} />,
//     },
//     {
//       type: "pdf-to-docx",
//       label: "PDF to DOCX",
//       description: "Transform your PDFs into editable DOCX documents.",
//       icon: <FaFileWord size={40} />,
//     },
//     {
//       type: "docx-to-jpg",
//       label: "DOCX to JPG",
//       description:
//         "Generate crisp JPG images from DOCX files. (If multiple pages, they are zipped.)",
//       icon: <FaFileImage size={40} />,
//     },
//     {
//       type: "pdf-to-jpg",
//       label: "PDF to JPG",
//       description:
//         "Extract high-quality JPG images from your PDFs. (If multiple pages, they are zipped.)",
//       icon: <FaFileAlt size={40} />,
//     },
//     {
//       type: "jpg-to-pdf",
//       label: "JPG to PDF",
//       description: "Merge JPGs into a single streamlined PDF.",
//       icon: <FaFilePdf size={40} />,
//     },
//     {
//       type: "merge-pdf",
//       label: "Merge PDF",
//       description: "Merge multiple PDF files into a single document.",
//       icon: <FaFilePdf size={40} />,
//     },
//   ];

//   const openConversionModal = (convType) => {
//     setSelectedConversion(convType);
//     setConvertedFileUrl("");
//     setFileProgress(0);
//     setFileInput(convType === "merge-pdf" ? [] : null);
//     setIsFileModalOpen(true);
//   };

//   return (
//     <div className="conversion-container">
//       {/* Conversion Tools Section */}
//       <div className="conversion-tools">
//         <h1 className="section-header">Conversion Tools</h1>
//         <div className="cards-container">
//           {conversionCards.map((card, index) => (
//             <ConversionCard
//               key={index}
//               conversionType={card.type}
//               label={card.label}
//               description={card.description}
//               icon={card.icon}
//               onClick={() => openConversionModal(card.type)}
//             />
//           ))}
//         </div>
//       </div>

//       {/* File Converter Modal Popup */}
//       <ModalPopup
//         isOpen={isFileModalOpen}
//         onClose={() => setIsFileModalOpen(false)}
//         title={
//           conversionCards.find((c) => c.type === selectedConversion)?.label ||
//           "File Converter"
//         }
//       >
//         <p className="modal-instruction">
//           Choose a file that matches the format requirements below.
//         </p>
//         {selectedConversion === "merge-pdf" ? (
//           <>
//             <DropZone
//               onFileSelect={handleAddMergeFile}
//               accept={getAcceptForConversion(selectedConversion)}
//               file={null}
//               multiple={false}
//               placeholder="Click to add a PDF file"
//             />
//             {fileInput && fileInput.length > 0 && (
//               <div className="merge-file-list">
//                 <h4>Files to Merge:</h4>
//                 <ul>
//                   {fileInput.map((file, index) => (
//                     <li key={index}>
//                       {file.name}{" "}
//                       <button onClick={() => handleRemoveMergeFile(index)}>
//                         Remove
//                       </button>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </>
//         ) : (
//           <DropZone
//             onFileSelect={setFileInput}
//             accept={getAcceptForConversion(selectedConversion)}
//             file={fileInput}
//             multiple={false}
//             placeholder={`Click to upload or drag and drop a ${getAcceptForConversion(
//               selectedConversion
//             )
//               .replace(".", "")
//               .toUpperCase()} file`}
//           />
//         )}
//         {fileInput &&
//           selectedConversion !== "merge-pdf" && (
//             <p className="selected-file">File: {fileInput.name}</p>
//           )}
//         <button onClick={handleFileConversion} disabled={fileConverting}>
//           Convert Now
//         </button>
//         {fileConverting && <ProgressBar progress={fileProgress} />}
//         {convertedFileUrl &&
//           selectedConversion !== "pdf-to-jpg" &&
//           selectedConversion !== "docx-to-jpg" && (
//             <div className="download-container">
//               <a
//                 href={convertedFileUrl}
//                 download={getConvertedFilename(
//                   selectedConversion === "merge-pdf"
//                     ? (fileInput && fileInput[0] ? fileInput[0].name : "merged")
//                     : fileInput.name,
//                   selectedConversion
//                 )}
//               >
//                 Download Converted File
//               </a>
//             </div>
//           )}
//       </ModalPopup>

//       {/* Text Converter Section */}
//       <div className="text-converter-section">
//         <h1 className="section-header">Text Converter</h1>
//         <h3>Upload Your File</h3>
//         <p className="text-converter-description">
//           Our advanced OCR tool quickly converts images, PDFs, and DOC/DOCX files into editable text. Upload your file and let our technology extract the content for you.
//         </p>
//         <section className="text-converter">
//           <div className="text-converter-inner">
//             <DropZone
//               onFileSelect={setTextFile}
//               accept=".svg,.png,.jpg,.jpeg,.gif"
//               file={textFile}
//               placeholder="Click to upload or drag and drop SVG, PNG, JPG or GIF (MAX. 800x400px)"
//             />
//             {textFile && <p className="selected-file">File: {textFile.name}</p>}
//             <button onClick={handleConvertToText} disabled={textConverting}>
//               Convert Now
//             </button>
//             {textConverting && <ProgressBar progress={textProgress} />}
//             {convertedText && (
//               <div className="text-result">
//                 <h3>Extracted Text</h3>
//                 <textarea value={convertedText} readOnly rows="8" />
//                 <div className="download-options">
//                   <button onClick={handleDownloadText}>Download as TXT</button>
//                   <button onClick={handleDownloadTextAsPDF}>Download as PDF</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default Conversion;


import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import html2pdf from 'html2pdf.js';
import JSZip from "jszip"; // <-- For combining multiple image files when needed
import { FaFilePdf, FaFileImage, FaFileWord, FaFileAlt } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Conversion.css";

// ------------------ Helper Functions ------------------

const base64ToBlob = (base64, mime) => {
  if (base64.startsWith("data:")) {
    base64 = base64.split(",")[1];
  }
  base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: mime });
};

const getExtension = (conversionType) => {
  switch (conversionType) {
    case "docx-to-pdf":
      return "pdf";
    case "pdf-to-docx":
      return "docx";
    case "docx-to-jpg":
      return "jpg";
    case "pdf-to-jpg":
      return "zip";
    case "jpg-to-pdf":
      return "pdf";
    case "merge-pdf":
      return "pdf";
    default:
      return "file";
  }
};

const getAcceptForConversion = (conversionType) => {
  switch (conversionType) {
    case "docx-to-pdf":
    case "docx-to-jpg":
      return ".docx";
    case "pdf-to-docx":
    case "pdf-to-jpg":
    case "merge-pdf":
      return ".pdf";
    case "jpg-to-pdf":
      return ".jpg,.jpeg";
    default:
      return "";
  }
};

const getConvertedFilename = (originalName, conversionType) => {
  const dotIndex = originalName.lastIndexOf(".");
  const baseName = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
  return `${baseName}.${getExtension(conversionType)}`;
};

const getFileUrlFromResponse = (fileObj, conversionType) => {
  console.log("Processing file object:", fileObj);
  if (fileObj.File) return fileObj.File;
  if (fileObj.Url) return fileObj.Url;
  if (fileObj.FileData) {
    let mimeType = "application/octet-stream";
    if (conversionType === "docx-to-pdf" || conversionType === "jpg-to-pdf")
      mimeType = "application/pdf";
    else if (conversionType === "pdf-to-docx")
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (conversionType === "docx-to-jpg")
      mimeType = "image/jpeg";
    else if (conversionType === "pdf-to-jpg")
      mimeType = "application/zip";
    else if (conversionType === "merge-pdf")
      mimeType = "application/pdf";
    const blob = base64ToBlob(fileObj.FileData, mimeType);
    return URL.createObjectURL(blob);
  }
  return "";
};

// ------------------ Conversion Functions ------------------

const convertDocxToPdf = async (file) => {
  const formData = new FormData();
  formData.append("File", file);
  const response = await fetch("https://v2.convertapi.com/convert/docx/to/pdf", {
    method: "POST",
    headers: { Authorization: "Bearer secret_BGps62890R8yIFfz" },
    body: formData,
  });
  console.log("DOCX to PDF - Raw response:", response);
  const data = await response.json();
  console.log("DOCX to PDF - JSON response:", data);
  if (data.Files && data.Files.length > 0) {
    const fileObj = data.Files[0];
    const url = getFileUrlFromResponse(fileObj, "docx-to-pdf");
    if (url) return url;
  }
  throw new Error("DOCX to PDF conversion failed");
};

const convertPdfToDocx = async (file) => {
  const formData = new FormData();
  formData.append("File", file);
  const response = await fetch("https://v2.convertapi.com/convert/pdf/to/docx", {
    method: "POST",
    headers: { Authorization: "Bearer secret_e8H2rPx2EGZ3KMhG" },
    body: formData,
  });
  console.log("PDF to DOCX - Raw response:", response);
  const data = await response.json();
  console.log("PDF to DOCX - JSON response:", data);
  if (data.Files && data.Files.length > 0) {
    const fileObj = data.Files[0];
    const url = getFileUrlFromResponse(fileObj, "pdf-to-docx");
    if (url) return url;
  }
  throw new Error("PDF to DOCX conversion failed");
};

const convertDocxToJpg = async (file) => {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("StoreFile", "true");
  const response = await fetch("https://v2.convertapi.com/convert/docx/to/jpg", {
    method: "POST",
    headers: { Authorization: "Bearer secret_e8H2rPx2EGZ3KMhG" },
    body: formData,
  });
  console.log("DOCX to JPG - Raw response:", response);
  const data = await response.json();
  console.log("DOCX to JPG - JSON response:", data);
  if (data.Files && data.Files.length > 0) {
    if (data.Files.length === 1) {
      const fileObj = data.Files[0];
      return getFileUrlFromResponse(fileObj, "docx-to-jpg");
    }
    const firstFile = data.Files[0];
    if (firstFile.FileName && firstFile.FileName.toLowerCase().endsWith(".zip")) {
      return getFileUrlFromResponse(firstFile, "docx-to-jpg");
    }
    const zip = new JSZip();
    for (let i = 0; i < data.Files.length; i++) {
      const fileObj = data.Files[i];
      const fileUrl = getFileUrlFromResponse(fileObj, "docx-to-jpg");
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      console.log(`DOCX-to-JPG: File ${i} size: ${blob.size}`);
      const fileName = fileObj.FileName || `page_${i}.jpg`;
      zip.file(fileName, blob);
    }
    const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
    const zipBlob = new Blob([zipArrayBuffer], { type: "application/zip" });
    console.log("Generated DOCX-to-JPG zip size:", zipBlob.size);
    return URL.createObjectURL(zipBlob);
  }
  throw new Error("DOCX to JPG conversion failed");
};

const convertPdfToJpg = async (file) => {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("ZipFiles", "true");
  formData.append("StoreFile", "true");
  const response = await fetch("https://v2.convertapi.com/convert/pdf/to/jpg", {
    method: "POST",
    headers: { Authorization: "Bearer secret_e8H2rPx2EGZ3KMhG" },
    body: formData,
  });
  console.log("PDF to JPG - Raw response:", response);
  const data = await response.json();
  console.log("PDF to JPG - JSON response:", data);
  if (data.Files && data.Files.length > 0) {
    const firstFile = data.Files[0];
    if (firstFile.FileName && firstFile.FileName.toLowerCase().endsWith(".zip")) {
      return getFileUrlFromResponse(firstFile, "pdf-to-jpg");
    }
    if (data.Files.length > 1) {
      const zip = new JSZip();
      for (let i = 0; i < data.Files.length; i++) {
        const fileObj = data.Files[i];
        const fileUrl = getFileUrlFromResponse(fileObj, "pdf-to-jpg");
        const res = await fetch(fileUrl);
        const blob = await res.blob();
        console.log(`PDF-to-JPG: File ${i} size: ${blob.size}`);
        const fileName = fileObj.FileName || `page_${i}.jpg`;
        zip.file(fileName, blob);
      }
      const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
      const zipBlob = new Blob([zipArrayBuffer], { type: "application/zip" });
      console.log("Generated PDF-to-JPG zip size:", zipBlob.size);
      return URL.createObjectURL(zipBlob);
    }
    const fileObj = data.Files[0];
    return getFileUrlFromResponse(fileObj, "pdf-to-jpg");
  }
  throw new Error("PDF to JPG conversion failed");
};

const convertJpgToPdf = async (file) => {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("StoreFile", "true");
  const response = await fetch("https://v2.convertapi.com/convert/jpg/to/pdf", {
    method: "POST",
    headers: { Authorization: "Bearer secret_e8H2rPx2EGZ3KMhG" },
    body: formData,
  });
  console.log("JPG to PDF - Raw response:", response);
  const data = await response.json();
  console.log("JPG to PDF - JSON response:", data);
  if (data.Files && data.Files.length > 0) {
    const fileObj = data.Files[0];
    const url = getFileUrlFromResponse(fileObj, "jpg-to-pdf");
    if (url) return url;
  }
  throw new Error("JPG to PDF conversion failed");
};

// New function: Merge multiple PDFs into one using the correct endpoint
const mergePdfFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`Files[${index}]`, file);
  });
  formData.append("StoreFile", "true");

  // Use the correct merge endpoint from ConvertAPI documentation:
  const response = await fetch("https://v2.convertapi.com/convert/pdf/to/merge", {
    method: "POST",
    headers: { Authorization: "Bearer secret_e8H2rPx2EGZ3KMhG" },
    body: formData,
  });

  console.log("Merge PDF - Raw response:", response);
  if (!response.ok) {
    console.error("Merge PDF API returned an error:", response.status, response.statusText);
    throw new Error(`Merge PDF conversion failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log("Merge PDF - JSON response:", data);
  if (data.Files && data.Files.length > 0) {
    const fileObj = data.Files[0];
    return getFileUrlFromResponse(fileObj, "merge-pdf");
  }
  throw new Error("Merge PDF conversion failed");
};

const convertFile = async (file, conversionType) => {
  switch (conversionType) {
    case "docx-to-pdf":
      return await convertDocxToPdf(file);
    case "pdf-to-docx":
      return await convertPdfToDocx(file);
    case "docx-to-jpg":
      return await convertDocxToJpg(file);
    case "pdf-to-jpg":
      return await convertPdfToJpg(file);
    case "jpg-to-pdf":
      return await convertJpgToPdf(file);
    case "merge-pdf":
      return await mergePdfFiles(file);
    default:
      throw new Error("Invalid conversion type");
  }
};

// ------------------ OCR Functions ------------------

const imageToTextOCR = async (file) => {
  try {
    const result = await Tesseract.recognize(file, "eng+hin", {
      logger: (m) => console.log("OCR:", m),
    });
    return result.data.text;
  } catch (error) {
    throw error;
  }
};

const convertFileToText = async (file) => {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".pdf")) {
    try {
      const jpgUrl = await convertPdfToJpg(file);
      const result = await Tesseract.recognize(jpgUrl, "eng+hin", {
        logger: (m) => console.log("OCR:", m),
      });
      return result.data.text;
    } catch (error) {
      throw new Error("PDF to text conversion failed: " + error.message);
    }
  } else {
    return await imageToTextOCR(file);
  }
};

const downloadBlobFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};

const downloadTextFile = (text, filename) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  downloadBlobFile(blob, filename);
};

// ------------------ Reusable Components ------------------

// DropZone Component
const DropZone = ({ onFileSelect, accept, file, placeholder, multiple = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (multiple) {
        onFileSelect(Array.from(e.dataTransfer.files));
      } else {
        onFileSelect(e.dataTransfer.files[0]);
      }
      e.dataTransfer.clearData();
    }
  };
  const handleClick = () => {
    fileInputRef.current.click();
  };
  return (
    <div
      className={`dropzone ${isDragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            if (multiple) {
              onFileSelect(Array.from(e.target.files));
            } else {
              onFileSelect(e.target.files[0]);
            }
          }
        }}
      />
      {file
        ? multiple
          ? <p>{file.map((f) => f.name).join(", ")}</p>
          : <p>File: {file.name}</p>
        : <p>{placeholder}</p>}
    </div>
  );
};

const ModalPopup = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-cont">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
};

const ProgressBar = ({ progress }) => (
  <div className="progress-container">
    <div className="progress-bar" style={{ width: `${progress}%` }}>
      {Math.floor(progress)}%
    </div>
  </div>
);

const ConversionCard = ({ conversionType, label, description, icon, onClick }) => (
  <div className="conversion-card" onClick={onClick}>
    <div className="card-icon">{icon}</div>
    <h3 className="card-title">{label}</h3>
    <p className="card-description">{description}</p>
  </div>
);

// ------------------ Main Conversion Component ------------------

const Conversion = () => {
  useEffect(() => {
    if (window.innerWidth >= 768) {
      AOS.init({ duration: 800, once: true });
    }
  }, []);

  // --- File Converter States ---
  const [selectedConversion, setSelectedConversion] = useState("docx-to-pdf");
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  // For merge-pdf, fileInput will be an array; otherwise a single file
  const [fileInput, setFileInput] = useState(null);
  const [convertedFileUrl, setConvertedFileUrl] = useState("");
  const [fileProgress, setFileProgress] = useState(0);
  const [fileConverting, setFileConverting] = useState(false);

  // --- Text Converter States ---
  const [textFile, setTextFile] = useState(null);
  const [convertedText, setConvertedText] = useState("");
  const [textProgress, setTextProgress] = useState(0);
  const [textConverting, setTextConverting] = useState(false);

  // ------------------ Progress Simulation with Water Float Animation ------------------
  const simulateProgress = (duration, setProgress) => {
    return new Promise((resolve) => {
      let progress = 10; // Immediately start at 10%
      setProgress(progress);
      const interval = setInterval(() => {
        if (progress < 99) {
          // Increase by a small random float increment to simulate a water-like float effect
          progress += Math.random() * 2;
          if (progress > 99) progress = 99;
          setProgress(progress);
        }
      }, duration / 100);

      // Resolve the promise after the duration has passed
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        resolve();
      }, duration);
    });
  };

  // ------------------ Conversion Handlers ------------------

  const handleFileConversion = async () => {
    if (!fileInput || (selectedConversion === "merge-pdf" && fileInput.length === 0)) {
      alert("Please select at least one file.");
      return;
    }
    setFileConverting(true);
    setFileProgress(0);
    const minDuration = 3000; // 3 seconds minimum for progress simulation
    try {
      let resultUrl;
      if (selectedConversion === "merge-pdf") {
        resultUrl = await convertFile(fileInput, selectedConversion);
      } else {
        resultUrl = await convertFile(fileInput, selectedConversion);
      }
      await simulateProgress(minDuration, setFileProgress);
      
      // Trigger download after progress reaches 100%
      if (
        selectedConversion === "pdf-to-jpg" ||
        selectedConversion === "docx-to-jpg"
      ) {
        if (resultUrl.startsWith("http")) {
          const a = document.createElement("a");
          a.href = resultUrl;
          a.download = getConvertedFilename(
            Array.isArray(fileInput)
              ? fileInput[0].name
              : fileInput.name,
            selectedConversion
          );
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          const blobResponse = await fetch(resultUrl);
          const blob = await blobResponse.blob();
          const dotIndex = Array.isArray(fileInput)
            ? fileInput[0].name.lastIndexOf(".")
            : fileInput.name.lastIndexOf(".");
          const baseName =
            dotIndex !== -1
              ? (Array.isArray(fileInput)
                  ? fileInput[0].name.substring(0, dotIndex)
                  : fileInput.name.substring(0, dotIndex))
              : (Array.isArray(fileInput)
                  ? fileInput[0].name
                  : fileInput.name);
          const downloadFilename = `${baseName}.${getExtension(selectedConversion)}`;
          downloadBlobFile(blob, downloadFilename);
        }
      } else {
        setConvertedFileUrl(resultUrl);
        const downloadFilename = getConvertedFilename(
          Array.isArray(fileInput)
            ? fileInput[0].name
            : fileInput.name,
          selectedConversion
        );
        const a = document.createElement("a");
        a.href = resultUrl;
        a.download = downloadFilename;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Conversion error:", err);
      alert("Conversion failed: " + err.message);
    }
    setFileConverting(false);
  };

  // ------------------ New Handler for Merge PDF ------------------
  const handleAddMergeFile = (newFile) => {
    setFileInput((prevFiles) => {
      const updatedFiles = prevFiles ? [...prevFiles, newFile] : [newFile];
      return updatedFiles;
    });
  };

  const handleRemoveMergeFile = (indexToRemove) => {
    setFileInput((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleConvertToText = async () => {
    if (!textFile) {
      alert("Please select a file for text conversion.");
      return;
    }
    setTextConverting(true);
    setTextProgress(0);
    const minDuration = 3000;
    try {
      const conversionPromise = convertFileToText(textFile);
      const [text] = await Promise.all([
        conversionPromise,
        simulateProgress(minDuration, setTextProgress),
      ]);
      setTextProgress(100);
      setConvertedText(text);
    } catch (error) {
      console.error("Text conversion failed:", error);
      alert("Conversion to text failed: " + error.message);
    }
    setTextConverting(false);
  };

  const handleDownloadText = () => {
    downloadTextFile(convertedText, "extracted_text.txt");
  };

  const handleDownloadTextAsPDF = () => {
    // Create a temporary container for the text content
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.lineHeight = '1.5';
    
    // Split text into paragraphs and add to container
    const paragraphs = convertedText.split('\n\n');
    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        const p = document.createElement('p');
        p.textContent = paragraph;
        container.appendChild(p);
      }
    });
    
    // Append to document temporarily (needed for html2pdf to work)
    document.body.appendChild(container);
    
    // Configure html2pdf options
    const options = {
      margin: 1,
      filename: 'extracted_text.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate PDF
    html2pdf().from(container).set(options).save().then(() => {
      // Remove the temporary container after PDF is generated
      document.body.removeChild(container);
    });
  };

  const conversionCards = [
    {
      type: "docx-to-pdf",
      label: "DOCX to PDF",
      description: "Convert DOCX files into polished, print-ready PDFs.",
      icon: <FaFilePdf size={40} />,
    },
    {
      type: "pdf-to-docx",
      label: "PDF to DOCX",
      description: "Transform your PDFs into editable DOCX documents.",
      icon: <FaFileWord size={40} />,
    },
    {
      type: "docx-to-jpg",
      label: "DOCX to JPG",
      description:
        "Generate crisp JPG images from DOCX files. (If multiple pages, they are zipped.)",
      icon: <FaFileImage size={40} />,
    },
    {
      type: "pdf-to-jpg",
      label: "PDF to JPG",
      description:
        "Extract high-quality JPG images from your PDFs. (If multiple pages, they are zipped.)",
      icon: <FaFileAlt size={40} />,
    },
    {
      type: "jpg-to-pdf",
      label: "JPG to PDF",
      description: "Merge JPGs into a single streamlined PDF.",
      icon: <FaFilePdf size={40} />,
    },
    {
      type: "merge-pdf",
      label: "Merge PDF",
      description: "Merge multiple PDF files into a single document.",
      icon: <FaFilePdf size={40} />,
    },
  ];

  const openConversionModal = (convType) => {
    setSelectedConversion(convType);
    setConvertedFileUrl("");
    setFileProgress(0);
    setFileInput(convType === "merge-pdf" ? [] : null);
    setIsFileModalOpen(true);
  };

  return (
    <div className="conversion-container">
      {/* Conversion Tools Section */}
      <div className="conversion-tools">
        <h1 className="section-header">Conversion Tools</h1>
        <div className="cards-container">
          {conversionCards.map((card, index) => (
            <ConversionCard
              key={index}
              conversionType={card.type}
              label={card.label}
              description={card.description}
              icon={card.icon}
              onClick={() => openConversionModal(card.type)}
            />
          ))}
        </div>
      </div>

      {/* File Converter Modal Popup */}
      <ModalPopup
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        title={
          conversionCards.find((c) => c.type === selectedConversion)?.label ||
          "File Converter"
        }
      >
        <p className="modal-instruction">
          Choose a file that matches the format requirements below.
        </p>
        {selectedConversion === "merge-pdf" ? (
          <>
            <DropZone
              onFileSelect={handleAddMergeFile}
              accept={getAcceptForConversion(selectedConversion)}
              file={null}
              multiple={false}
              placeholder="Click to add a PDF file"
            />
            {fileInput && fileInput.length > 0 && (
              <div className="merge-file-list">
                <h4>Files to Merge:</h4>
                <ul>
                  {fileInput.map((file, index) => (
                    <li key={index}>
                      {file.name}{" "}
                      <button onClick={() => handleRemoveMergeFile(index)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <DropZone
            onFileSelect={setFileInput}
            accept={getAcceptForConversion(selectedConversion)}
            file={fileInput}
            multiple={false}
            placeholder={`Click to upload or drag and drop a ${getAcceptForConversion(
              selectedConversion
            )
              .replace(".", "")
              .toUpperCase()} file`}
          />
        )}
        {fileInput &&
          selectedConversion !== "merge-pdf" && (
            <p className="selected-file">File: {fileInput.name}</p>
          )}
        <button onClick={handleFileConversion} disabled={fileConverting}>
          Convert Now
        </button>
        {fileConverting && <ProgressBar progress={fileProgress} />}
        {convertedFileUrl &&
          selectedConversion !== "pdf-to-jpg" &&
          selectedConversion !== "docx-to-jpg" && (
            <div className="download-container">
              <a
                href={convertedFileUrl}
                download={getConvertedFilename(
                  selectedConversion === "merge-pdf"
                    ? (fileInput && fileInput[0] ? fileInput[0].name : "merged")
                    : fileInput.name,
                  selectedConversion
                )}
              >
                Download Converted File
              </a>
            </div>
          )}
      </ModalPopup>

      {/* Text Converter Section */}
      <div className="text-converter-section">
        <h1 className="section-header">Text Converter</h1>
        <h3>Upload Your File</h3>
        <p className="text-converter-description">
          Our advanced OCR tool quickly converts images, PDFs, and DOC/DOCX files into editable text. Upload your file and let our technology extract the content for you.
        </p>
        <section className="text-converter">
          <div className="text-converter-inner">
            <DropZone
              onFileSelect={setTextFile}
              accept=".svg,.png,.jpg,.jpeg,.gif"
              file={textFile}
              placeholder="Click to upload or drag and drop SVG, PNG, JPG or GIF (MAX. 800x400px)"
            />
            {textFile && <p className="selected-file">File: {textFile.name}</p>}
            <button onClick={handleConvertToText} disabled={textConverting}>
              Convert Now
            </button>
            {textConverting && <ProgressBar progress={textProgress} />}
            {convertedText && (
              <div className="text-result">
                <h3>Extracted Text</h3>
                <textarea value={convertedText} readOnly rows="8" />
                <div className="download-options">
                  <button onClick={handleDownloadText}>Download as TXT</button>
                  <button onClick={handleDownloadTextAsPDF}>Download as PDF</button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Conversion;
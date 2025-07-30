import axios from "axios"

// Base API URL
const BASE_URL = "https://backend.taxall.co.in"

// Create axios instance with default config
const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// Add Authorization token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if token is invalid
      localStorage.removeItem("token")
      localStorage.removeItem("userId")
      localStorage.removeItem("email")
      localStorage.removeItem("role")

      // Only redirect if we're in a browser environment
      if (typeof window !== "undefined") {
        // Don't redirect if already on login page to avoid redirect loops
        if (!window.location.pathname.includes("/signin")) {
          window.location.href = "/signin"
        }
      }
    }
    return Promise.reject(error)
  },
)

// ==================== AUTH ENDPOINTS ====================
export const authAPI = {
  signIn: (credentials) => API.post("/auth/signin", credentials),
  signUp: (userData) => API.post("/auth/signup", userData),
  verifyOtp: (email, otp) => API.post(`/auth/verify-otp?email=${email}&otp=${otp}`),
  resendOtp: (email) => API.post("/auth/resend-otp", { email }),
  resendVerificationEmail: (email) => API.post(`/auth/resend-verification-email?email=${email}`),
  getUserRole: (email) => API.get(`/auth/users/role?email=${email}`),
  refreshToken: () => API.post("/auth/refresh"),
}

// ==================== USER ENDPOINTS ====================
export const userAPI = {
  getUserById: (userId) => API.get(`/userReq/profile/${userId}`),
  getUserIdByEmail: (email) => API.get(`/userReq/user/id?email=${email}`),
  updateUser: (userId, userData) => API.put(`/userReq/users/${userId}`, userData),
  updateEmail: (userId, newEmail) => API.put(`/userReq/users/${userId}/email?newEmail=${newEmail}`),
  verifyEmailUpdate: (userId, token) => API.post(`/userReq/users/${userId}/email/verify?token=${token}`),
}

// ==================== ADMIN USER MANAGEMENT ENDPOINTS ====================
export const adminUserAPI = {
  getAllUsers: () => API.get("/admin/users"),
  getUserById: (id) => API.get(`/admin/users/${id}`),
  createUser: (userData) => API.post("/admin/users", userData),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
}

// ==================== DOCUMENT ENDPOINTS ====================
export const documentAPI = {
  // User documents
  getUserDocuments: (userId) => API.get(`/documents/list?userId=${userId}`),
  uploadDocument: (formData) =>
    API.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  downloadDocument: (documentId) =>
    API.get(`/documents/download/${documentId}`, {
      responseType: "blob",
    }),
  deleteDocument: (documentId, userId, type) =>
    API.delete(`/documents/delete/${documentId}`, {
      data: { userId, type },
    }),
  getProfileImage: () =>
    API.get("/documents/profile", {
      responseType: "arraybuffer",
    }),

  // Admin document management
  getAdminUserDocuments: (userId) => API.get(`/admin/users/${userId}/documents`),
  deleteAdminDocument: (documentId) => API.delete(`/admin/documents/${documentId}`),
  updateAdminDocument: (documentId, documentName, documentType) =>
    API.put(
      `/admin/documents/${documentId}?documentName=${encodeURIComponent(documentName)}${documentType ? `&type=${encodeURIComponent(documentType)}` : ""}`,
    ),
  downloadAdminDocument: (documentId) =>
    API.get(`/admin/download/${documentId}`, {
      responseType: "blob",
    }),
}

// ==================== BLOG ENDPOINTS ====================
export const blogAPI = {
  getAllBlogs: () => API.get("/blogs"),
  getBlogById: (id) => API.get(`/blogs/${id}`),
  createBlog: (blogData, imageFiles) => {
    const formData = new FormData()
    formData.append("blog", new Blob([JSON.stringify(blogData)], { type: "application/json" }))

    if (imageFiles.image1) formData.append("image1", imageFiles.image1)
    if (imageFiles.image2) formData.append("image2", imageFiles.image2)
    if (imageFiles.image3) formData.append("image3", imageFiles.image3)

    return API.post("/blogs/create-with-images", formData)
  },
  updateBlog: (id, blogData, imageFiles, removeFlags = {}) => {
    const formData = new FormData()
    formData.append("blog", new Blob([JSON.stringify(blogData)], { type: "application/json" }))

    if (imageFiles.image1) formData.append("image1", imageFiles.image1)
    if (imageFiles.image2) formData.append("image2", imageFiles.image2)
    if (imageFiles.image3) formData.append("image3", imageFiles.image3)

    formData.append("adminId", "1")

    if (removeFlags.removeImage1) formData.append("removeImage1", "true")
    if (removeFlags.removeImage2) formData.append("removeImage2", "true")
    if (removeFlags.removeImage3) formData.append("removeImage3", "true")

    return API.put(`/blogs/${id}/update-with-images`, formData)
  },
  deleteBlog: (id) => API.delete(`/blogs/${id}`),
  likeBlog: (id, userId = "anonymous") => API.post(`/blogs/${id}/like?userId=${userId}`),
  incrementView: (id) => API.post(`/blogs/${id}/view`),
  getTotalStats: async () => {
    const [viewsResponse, blogsResponse] = await Promise.all([
      API.get("/blogs/totalViews"),
      API.get("/blogs/totalBlogs"),
    ])
    return {
      totalViews: viewsResponse.data,
      totalBlogs: blogsResponse.data,
    }
  },
}

// ==================== CONTACT ENDPOINTS ====================
export const contactAPI = {
  getAllContacts: (page = 0, size = 10) => API.get(`/admin/contacts?page=${page}&size=${size}`),
  getContactById: (id) => API.get(`/admin/contacts/${id}`),
  markAsSeen: (id, seen = true) => API.patch(`/admin/contacts/${id}/seen?seen=${seen}`),
  submitContact: (contactData) => API.post("/contacts", contactData),
}

// ==================== REVIEW ENDPOINTS ====================
export const reviewAPI = {
  getAllReviews: (page = 1) => API.get(`/reviews?page=${page}`),
  getUserReview: (userId) => API.get(`/reviews/user/${userId}`),
  createReview: (reviewData) => {
    const formData = new URLSearchParams()
    formData.append("stars", reviewData.stars)
    formData.append("description", reviewData.description)

    return API.post("/reviews", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
  },
  updateReview: (id, reviewData) => {
    const formData = new URLSearchParams()
    formData.append("stars", reviewData.stars)
    formData.append("description", reviewData.description)

    return API.put(`/reviews/${id}`, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
  },
}

// ==================== EXTERNAL APIS ====================
// MyMemory Translation API
export const translateAPI = {
  translate: (text, sourceLang, targetLang) =>
    axios.get("https://api.mymemory.translated.net/get", {
      params: {
        q: text,
        langpair: `${sourceLang}|${targetLang}`,
      },
    }),
}

// ConvertAPI for file conversions
export const convertAPI = {
  docxToPdf: (file) => {
    const formData = new FormData()
    formData.append("File", file)
    return axios.post("https://v2.convertapi.com/convert/docx/to/pdf", formData, {
      headers: { Authorization: "Bearer secret_BGps62890R8yIFfz" },
    })
  },
  pdfToDocx: (file) => {
    const formData = new FormData()
    formData.append("File", file)
    return axios.post("https://v2.convertapi.com/convert/pdf/to/docx", formData, {
      headers: { Authorization: "Bearer secret_e8H2rPx2EGZ3KMhG" },
    })
  },
  // Add other conversion methods as needed
}

export default API


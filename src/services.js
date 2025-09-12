// src/services/authService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// ✅ Shared axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // important if backend uses cookies
});

// ✅ Automatically attach token to all requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- LOGIN & REGISTER ---
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/api/login", credentials, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error in loginUser:", error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/api/register", userData);
    return response.data;
  } catch (error) {
    console.error("❌ Error in registerUser:", error.response?.data || error.message);
    throw error;
  }
};

// --- LEADS & REQUIREMENTS ---
export const fetchSalesLeads = async () => {
  try {
    const res = await api.get("/api/leads");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching leads:", error.response?.data || error.message);
    throw error;
  }
};

export const submitSalesRequirement = async (requirement) => {
  try {
    const res = await api.post("/api/requirements/sales/submit", requirement);
    return res.data;
  } catch (error) {
    console.error("❌ Error submitting requirement:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchSalesRequirements = async () => {
  try {
    const res = await api.get("/api/requirements/sales/view");
    console.log("✅ Fetched Sales Requirements:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching requirements:", error.response?.data || error.message);
    return error;
  }
};

export const fetchUnassignedRequirements = async () => {
  try {
    const res = await api.get("/api/requirements/leads/unassigned");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching unassigned requirements:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchRecruiters = async () => {
  try {
    const res = await api.get("/api/recruiters");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching recruiters:", error.response?.data || error.message);
    return error;
  }
};

export const bulkAssignRequirements = async (payload) => {
  try {
    const res = await api.put("/api/requirements/leads/assign-multiple", payload);
    return res.data;
  } catch (error) {
    console.error("❌ Error bulk assigning requirements:", error.response?.data || error.message);
    return error;
  }
};

export const fetchAllLeadRequirements = async () => {
  try {
    const res = await api.get("/api/requirements/leads/all");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching all lead requirements:", error.response?.data || error.message);
    return [];
  }
};

// --- CANDIDATES ---
export const fetchCandidates = async () => {
  try {
    const res = await api.get("/api/candidates/leads");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching candidates:", error.response?.data || error.message);
    return { error: true, message: error.message };
  }
};

export const getAllCandidates = async () => {
  try {
    const res = await api.get("/api/candidates/leads");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching candidates:", error.response?.data || error.message);
    return { error: true, message: error.message };
  }
};

export const getRecruiterCandidates = async (userEmail) => {
  try {
    const res = await api.get(`/api/candidates/recruiter/my-candidates/${userEmail}`);
    return res.data.candidates;
  } catch (error) {
    console.error("❌ Error fetching recruiter candidates:", error.response?.data || error.message);
    return [];
  }
};

export const submitCandidate = async (data) => {
  try {
    const res = await api.post("/api/candidates/recruiter/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error submitting candidate:", error.response?.data || error.message);
    return { error: true, message: error.message };
  }
};

export const forwardCandidateToSales = async (candidateId, forwardedBy, forwardedToSales) => {
  try {
    // Validate inputs
    if (!forwardedBy || !forwardedToSales) {
      throw new Error("❌ Both forwardedBy and forwardedToSales are required");
    }

    // Ensure forwardedToSales is always an array
    const salesEmails = Array.isArray(forwardedToSales) ? forwardedToSales : [forwardedToSales];

    const res = await api.post(`/api/candidates/leads/forward/${candidateId}`, {
      forwardedBy,            // Lead email
      forwardedToSales: salesEmails,  // Always send as array
    });

    return res.data;
  } catch (error) {
    console.error("❌ Error forwarding candidate:", error.response?.data || error.message);
    throw error;
  }
};




export const getForwardedCandidates = async () => {
  try {
    const res = await api.get("/api/candidates/sales");
    return res.data;
  } catch (error) {
    console.error("❌ Failed to fetch forwarded candidates:", error.response?.data || error.message);
    return { error: true, message: error.message };
  }
};

// --- UPDATE FIELDS ---
export const updateCandidateActiveStatus = async (candidateId, newStatus) => {
  try {
    const res = await api.put("/api/candidates/recruiter/update-fields", { candidateId, isActive: newStatus });
    return res.data;
  } catch (error) {
    console.error("❌ Error updating active status:", error.response?.data || error.message);
    throw error;
  }
};

export const updateCandidateFields = async (candidateId, updateData) => {
  try {
    const res = await api.put("/api/candidates/recruiter/update-fields", {
      candidateId,
      ...updateData,
    });
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error updating candidate fields:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const updateRequirementStatus = async (requirementId, newStatus) => {
  try {
    const res = await api.put("/api/requirements/update-status", {
      requirementId,       // old key
      id: requirementId,   // new key
      requirementStatus: newStatus, // old key
      newStatus,                  // new key
    });
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error updating requirement status:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const updateCandidateLeadStatus = async (candidateId, leadStatus) => {
  try {
    const res = await api.put("/api/candidates/recruiter/update-fields", { candidateId, lead_update: leadStatus });
    return res.data;
  } catch (error) {
    console.error("❌ Error updating lead status for candidate:", error.response?.data || error.message);
    throw error;
  }
};

// --- RECRUITER REQUIREMENTS ---
export const getAssignedRequirements = async (email) => {
  try {
    const res = await api.get(`/api/requirements/recruiter/view?email=${email}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching recruiter requirements:", error.response?.data || error.message);
    return { error: true };
  }
};

// --- ALL REQUIREMENTS ---
export const fetchAllRequirements = async () => {
  try {
    const res = await api.get("/api/requirements/leads/all");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching all requirements:", error.response?.data || error.message);
    return [];
  }
};

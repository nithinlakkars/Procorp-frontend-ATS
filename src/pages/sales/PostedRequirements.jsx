import React, { useEffect, useState } from "react";
import {
  fetchSalesRequirements,
  getAllCandidates,
  updateRequirementStatus,
} from "../../services";
import { Modal, Button } from "react-bootstrap";

export default function PostedRequirements({ onCountUpdate }) {
  const [submittedReqs, setSubmittedReqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReq, setSelectedReq] = useState(null);
  const [loading, setLoading] = useState(false);
  const reqsPerPage = 5;

  useEffect(() => {
    console.log("📣 useEffect triggered");
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    try {
      console.log("🟡 loadRequirements called");

      setLoading(true);

      const [requirementsRes, candidatesRes] = await Promise.all([
        fetchSalesRequirements(),
        getAllCandidates(),
      ]);

      console.log("✅ fetchSalesRequirements response:", requirementsRes);
      console.log("✅ getAllCandidates response:", candidatesRes);

      // ✅ Adjust based on whether requirementsRes is already an array
      const requirementData = Array.isArray(requirementsRes)
        ? requirementsRes
        : requirementsRes?.data || [];

      // ✅ Extract candidates
      const candidates = Array.isArray(candidatesRes?.candidates)
        ? candidatesRes.candidates
        : candidatesRes?.data?.candidates || [];

      console.log("🧾 Cleaned requirement data:", requirementData);
      console.log("🧾 Cleaned candidates data:", candidates);

      // 🔁 Build submission count map
      const submissionMap = {};
      candidates.forEach((candidate) => {
        const reqIds = Array.isArray(candidate.requirementId)
          ? candidate.requirementId
          : [candidate.requirementId];

        reqIds.forEach((reqId) => {
          const trimmed = reqId?.trim?.();
          if (trimmed) {
            submissionMap[trimmed] = (submissionMap[trimmed] || 0) + 1;
          }
        });
      });

      // 🏗️ Enrich requirements with submission count
      const enrichedRequirements = requirementData.map((req) => {
        const count = submissionMap[req.requirementId?.trim()] || 0;
        return { ...req, submissionCount: count };
      });

      setSubmittedReqs(enrichedRequirements);
      onCountUpdate?.(enrichedRequirements.length);
    } catch (error) {
      console.error("❌ Failed to load requirements or candidates:", error);
    } finally {
      setLoading(false);
    }
  };



  const handleStatusChange = async (requirementId, newStatus) => {
    try {
      await updateRequirementStatus(requirementId, newStatus);

      // ✅ Refetch updated requirements
      await loadRequirements(); // reloads everything including submissionCount

    } catch (err) {
      console.error("Failed to update requirement status", err);
    }
  };

  const filteredReqs = submittedReqs.filter((req) => {
    const query = searchQuery.toLowerCase();
    return (
      req.requirementId?.toLowerCase().includes(query) ||
      req.title?.toLowerCase().includes(query) ||
      req.client?.toLowerCase().includes(query) ||
      req.priority?.toLowerCase().includes(query) ||
      (Array.isArray(req.leadAssignedTo)
        ? req.leadAssignedTo.some((lead) =>
          lead.toLowerCase().includes(query)
        )
        : req.leadAssignedTo?.toLowerCase().includes(query))
    );
  });

  const totalPages = Math.ceil(filteredReqs.length / reqsPerPage);
  const currentReqs = filteredReqs.slice(
    (currentPage - 1) * reqsPerPage,
    currentPage * reqsPerPage
  );

  return (
    <section className="mt-4">
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search requirements..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Requirement ID</th>
              <th>Position</th>
              <th>Client</th>
              <th>Priority</th>
              <th>Duration</th> {/* <-- New column */}
              <th>Assigned Lead(s)</th>
              <th>Assigned Recruiter(s)</th>
              <th>Submitted Count</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentReqs.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No matching requirements found.
                </td>
              </tr>
            ) : (
              currentReqs.map((req) => (
                <tr key={req._id}>
                  <td>{req.requirementId || "N/A"}</td>
                  <td>
                    <Button
                      variant="link"
                      className="p-0 text-primary fw-semibold"
                      onClick={() => setSelectedReq(req)}
                    >
                      {req.title || "Untitled"}
                    </Button>
                    <div className="text-muted small">
                      {(Array.isArray(req.locations)
                        ? req.locations.join(", ")
                        : req.locations) || "N/A"}{" "}
                      | {req.workSetting || "N/A"}
                    </div>
                  </td>
                  <td>{req.client || "N/A"}</td>
                  <td>{req.priority || "N/A"}</td>
                  <td>{req.duration || "N/A"}</td>
                  <td>
                    {Array.isArray(req.leadAssignedTo)
                      ? req.leadAssignedTo.join(", ")
                      : req.leadAssignedTo || "N/A"}
                  </td>
                  <td>
                    {Array.isArray(req.recruiterAssignedTo) &&
                      req.recruiterAssignedTo.length > 0
                      ? req.recruiterAssignedTo.join(", ")
                      : "Not Assigned"}
                  </td>
                  <td>{req.submissionCount || 0}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={req.requirementStatus || "open"}
                      onChange={(e) =>
                        handleStatusChange(req._id, e.target.value)
                      }
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ⬅ Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next ➡
        </button>
      </div>

      <Modal show={!!selectedReq} onHide={() => setSelectedReq(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Requirement Overview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Position:</strong> {selectedReq?.title}
          </p>
          <p>
            <strong>Location:</strong>{" "}
            {Array.isArray(selectedReq?.locations)
              ? selectedReq.locations.join(", ")
              : selectedReq?.locations}
          </p>
          <p>
            <strong>Work Setting:</strong> {selectedReq?.workSetting || "N/A"}
          </p>
          <p>
            <strong>Work Authorization:</strong>{" "}
            {Array.isArray(selectedReq?.workAuthorization)
              ? selectedReq.workAuthorization.join(", ")
              : selectedReq?.workAuthorization?.split(",").join(", ") || "N/A"}
          </p>
          <p>
            <strong>Rate:</strong> {selectedReq?.rate || "N/A"}
          </p>
          <hr />
          <p>
            <strong>Primary Skills:</strong>
          </p>
          <div className="text-muted">
            {Array.isArray(selectedReq?.primarySkills)
              ? selectedReq.primarySkills.join(", ")
              : selectedReq?.primarySkills || "N/A"}
          </div>
          <p className="mt-3">
            <strong>Description:</strong>
          </p>
          <div className="text-muted" style={{ whiteSpace: "pre-line" }}>
            {selectedReq?.description || "No description available."}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedReq(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}

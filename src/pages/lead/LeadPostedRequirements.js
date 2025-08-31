import React, { useEffect, useState } from "react";
import {
  fetchAllLeadRequirements,
  getAllCandidates,
  updateRequirementStatus,
} from "../../services";
import { Modal, Button } from "react-bootstrap";

export default function LeadPostedRequirements({ onCountUpdate }) {
  const [requirements, setRequirements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReq, setSelectedReq] = useState(null);
  const [loading, setLoading] = useState(false);
  const reqsPerPage = 5;

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    try {
      setLoading(true);

      const allRequirements = await fetchAllLeadRequirements();
      const candidatesRes = await getAllCandidates();

      const candidates = Array.isArray(candidatesRes?.candidates)
        ? candidatesRes.candidates
        : candidatesRes?.data?.candidates || [];

      const submissionMap = {};
      candidates.forEach((candidate) => {
        const ids = Array.isArray(candidate.requirementId)
          ? candidate.requirementId
          : [candidate.requirementId];
        ids.forEach((id) => {
          const trimmed = id?.trim?.();
          if (trimmed)
            submissionMap[trimmed] = (submissionMap[trimmed] || 0) + 1;
        });
      });

      const enriched = allRequirements.map((req) => {
        const count = submissionMap[req.requirementId?.trim()] || 0;
        const reqCandidates = candidates.filter((c) =>
          (Array.isArray(c.requirementId) ? c.requirementId : [c.requirementId])
            .map((id) => id.trim())
            .includes(req.requirementId?.trim())
        );
        return { ...req, submissionCount: count, candidates: reqCandidates };
      });

      setRequirements(enriched);
      onCountUpdate?.(enriched.length);
    } catch (err) {
      console.error("❌ Failed to load lead requirements:", err);
      setRequirements([]);
      onCountUpdate?.(0);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRequirementStatus(id, newStatus);
      await loadRequirements();
    } catch (err) {
      console.error("❌ Failed to update requirement status", err);
    }
  };

  const filtered = requirements.filter((req) => {
    const q = searchQuery.toLowerCase();
    return (
      req.requirementId?.toLowerCase().includes(q) ||
      req.title?.toLowerCase().includes(q) ||
      req.client?.toLowerCase().includes(q) ||
      req.priority?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / reqsPerPage);
  const currentReqs = filtered.slice(
    (currentPage - 1) * reqsPerPage,
    currentPage * reqsPerPage
  );

  return (
    <section className="mt-4">
      {/* Search */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="🔍 Search requirements..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead className="table-light">
            <tr>
              <th>Requirement ID</th>
              <th>Position</th>
              <th>Client</th>
              <th>Priority</th>
              <th>Duration</th>
              <th>Submissions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentReqs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No lead requirements found.
                </td>
              </tr>
            ) : (
              currentReqs.map((req) => (
                <tr key={req._id}>
                  <td>{req.requirementId}</td>
                  <td>
                    <Button variant="link" onClick={() => setSelectedReq(req)}>
                      {req.title}
                    </Button>
                  </td>
                  <td>{req.client}</td>
                  <td>{req.priority}</td>
                  <td>{req.duration}</td>
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

      {/* Pagination */}
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

      {/* Modal */}
      <Modal show={!!selectedReq} onHide={() => setSelectedReq(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Requirement Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Title:</strong> {selectedReq?.title}
          </p>
          <p>
            <strong>Description:</strong> {selectedReq?.description}
          </p>
          <p>
            <strong>Work Setting:</strong> {selectedReq?.workSetting}
          </p>
          <p>
            <strong>Rate:</strong> {selectedReq?.rate}
          </p>
          <p>
            <strong>Primary Skills:</strong> {selectedReq?.primarySkills}
          </p>
          {/* Hidden section: Assigned Recruiters */}
          <p>
            <strong>Assigned Recruiters:</strong>{" "}
            {Array.isArray(selectedReq?.recruiterAssignedTo) &&
            selectedReq?.recruiterAssignedTo.length > 0
              ? selectedReq.recruiterAssignedTo.join(", ")
              : "Not Assigned"}
          </p>
        </Modal.Body>
      </Modal>
    </section>
  );
}

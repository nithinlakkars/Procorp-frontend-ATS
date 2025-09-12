import React, { useEffect, useState } from "react";
import { Table, Button, Collapse, Badge, Form } from "react-bootstrap";
import { updateCandidateLeadStatus } from "../../services";
import { forwardCandidateToSales } from "../../services";

export default function SubmittedCandidates({
  candidates = [],
  forwardCandidateToSales,
  leadEmail,
  setMessage,
  loadCandidates,
}) {
  const [expandedRows, setExpandedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 5;

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [candidates]);

  const handleForward = async (candidateId) => {
    try {
      const userStr = sessionStorage.getItem("user");
      if (!userStr) {
        alert("❌ User not found in session. Please log in again.");
        return;
      }

      const user = JSON.parse(userStr); // parse the JSON string
      const leadEmail = user.email;      // get the email
      if (!leadEmail) {
        alert("❌ Lead email not found. Please log in again.");
        return;
      }

      const salesEmail = "sales@procorpsystems.com"; // Or dynamic emails
      await forwardCandidateToSales(candidateId, leadEmail, salesEmail);

      alert("✅ Candidate forwarded successfully!");
    } catch (error) {
      console.error("Forwarding error:", error);
      alert("❌ Failed to forward candidate");
    }
  };



  const toggleExpand = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleLeadStatusChange = async (candidateId, newStatus) => {
    try {
      await updateCandidateLeadStatus(candidateId, newStatus);
      await loadCandidates();
    } catch (err) {
      console.error("❌ Failed to update lead status:", err);
      setMessage("❌ Failed to update lead status");
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Applied":
        return "info";
      case "Internal Reject":
        return "success";
      case "submitted to client":
      case "interview":
        return "danger";
      case "selected":
      case "Rejected":
        return "warning";
      case "Backout":
        return "primary";
      case "offer":
      case "submitted-to-client":
        return "secondary";
      default:
        return "dark";
    }
  };

  // 🔹 Visible fields in table
  const visibleFields = ["candidateId", "name", "role", "requirementId"];

  // 🔹 Hidden fields inside collapse
  const hiddenFields = [
    "email",
    "phone",
    "rate",
    "addedBy",
    "VisaStatus",
    "candidate_update",
    "currentLocation",
    "relocation",
    "passportnumber",
    "Last4digitsofSSN",
    "LinkedinUrl",
    "clientdetails"
  ]
    ;

  const fieldLabels = {
    candidateId: "Candidate ID",
    name: "Candidate Name",
    role: "Role",
    requirementId: "Requirement ID",
    email: "Email",
    phone: "Phone",
    rate: "Rate",
    addedBy: "Added By",
    VisaStatus: "Visa Status",
    candidate_update: "Sales Update",
  };

  const indexOfLast = currentPage * candidatesPerPage;
  const indexOfFirst = indexOfLast - candidatesPerPage;
  const currentCandidates = candidates.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(candidates.length / candidatesPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <section className="container mt-4">
      <Table hover responsive className="border-bottom">
        <thead>
          <tr className="text-muted">
            {visibleFields.map((field) => (
              <th key={field}>{fieldLabels[field] || field}</th>
            ))}
            <th>Documents</th>

            <th>Active</th>
            <th>SalesStatus</th>
            <th>Lead Update</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentCandidates.length > 0 ? (
            currentCandidates.map((candidate) => (
              <React.Fragment key={candidate._id}>
                <tr>
                  {visibleFields.map((field) =>
                    field === "name" ? (
                      <td key={field}>
                        <Button
                          variant="link"
                          className="p-0 text-decoration-none"
                          onClick={() => toggleExpand(candidate._id)}
                        >
                          {candidate[field] || "N/A"}
                        </Button>
                      </td>
                    ) : (
                      <td key={field}>{candidate[field] || "N/A"}</td>
                    )
                  )}

                  {/* Documents */}
                  <td>
                    {candidate.resumeUrls?.length > 0 ? (
                      <a
                        href={candidate.resumeUrls[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-success"
                      >
                        📁 View Documents
                      </a>
                    ) : (
                      "No Folder"
                    )}
                  </td>



                  {/* Active */}
                  <td>
                    <span
                      className={`badge ${candidate.isActive === "available" ? "bg-success" : "bg-secondary"
                        }`}
                    >
                      {candidate.isActive === "available" ? "Available" : "Not Available"}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <Badge bg={getStatusVariant(candidate.candidate_update)}>
                      {candidate.candidate_update || "N/A"}
                    </Badge>
                  </td>

                  {/* Lead Update */}
                  <td>
                    <Form.Select
                      size="sm"
                      value={candidate.lead_update || ""}
                      onChange={(e) => handleLeadStatusChange(candidate._id, e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Applied">Applied</option>
                      <option value="Internal Reject">Internal Reject</option>
                      <option value="submitted to client">Submitted to Client</option>
                      <option value="interview">Interview</option>
                      <option value="selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                      <option value="backout">Backout</option>
                      <option value="offer">offer</option>

                    </Form.Select>
                  </td>

                  {/* Action: Forward to Sales */}
                  <td>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleForward(candidate._id)}
                    >
                      Forward to Sales
                    </Button>
                  </td>
                </tr>

                {/* Hidden Fields */}
                <tr>
                  <td colSpan={visibleFields.length + 5} className="p-0">
                    <Collapse in={expandedRows.includes(candidate._id)}>
                      <div className="p-3 bg-light text-dark">
                        {hiddenFields.map((field) => (
                          <p key={field} className="mb-1">
                            <strong>{fieldLabels[field] || field}:</strong>{" "}
                            {candidate[field] || "N/A"}
                          </p>
                        ))}
                      </div>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan={visibleFields.length + 5} className="text-center">
                No candidates submitted yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex justify-content-center align-items-center mt-3">
        <Button
          size="sm"
          variant="outline-primary"
          className="me-2"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          ◀ Previous
        </Button>
        <span className="mx-2">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline-primary"
          className="ms-2"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next ▶
        </Button>
      </div>
    </section>
  );
}

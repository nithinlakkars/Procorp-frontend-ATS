import React, { useEffect, useState } from "react";
import { Table, Button, Collapse, Badge, Form } from "react-bootstrap";
import { updateCandidateLeadStatus } from "../../services";

export default function SubmittedCandidates({
  candidates = [],
  forwardCandidateToSales,
  setCandidates,
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

  const handleForward = async (id) => {
    try {
      const res = await forwardCandidateToSales(id, {
        forwardedBy: leadEmail,
      });
      setMessage(res.data.message);
      await loadCandidates();
    } catch {
      setMessage("❌ Forwarding failed");
    }
  };

  const toggleExpand = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  // Update handleStatusChange to use lead_update
  const handleLeadStatusChange = async (candidateId, newStatus) => {
    try {
      await updateCandidateLeadStatus(candidateId, newStatus);
      await loadCandidates(); // refresh table
    } catch (err) {
      console.error("❌ Failed to update lead status:", err);
      setMessage("❌ Failed to update lead status");
    }
  };

  const visibleFields = [
    "candidateId",
    "name",
    "role",
    "email",
    "phone",
    "rate",
    "addedBy",
    "VisaStatus",
    "requirementId",
  ];

  const hiddenFields = [
    "source",
    "currentLocation",
    "relocation",
    "passportnumber",
    "Last4digitsofSSN",
    "LinkedinUrl",
    "clientdetails",
    "forwardedBy",
  ];

  const indexOfLast = currentPage * candidatesPerPage;
  const indexOfFirst = indexOfLast - candidatesPerPage;
  const currentCandidates = candidates.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(candidates.length / candidatesPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "L1-cleared":
        return "info"; // light blue
      case "selected":
        return "success"; // green
      case "rejected":
      case "internal-rejection":
        return "danger"; // red
      case "Waiting-for-update":
      case "Decision-pending":
        return "warning"; // yellow
      case "To-be-interviewed":
        return "primary"; // blue
      case "submitted":
      case "submitted-to-client":
        return "secondary"; // gray
      default:
        return "dark"; // fallback
    }
  };


  return (
    <section className="container mt-4">
      <Table hover responsive className="border-bottom">
        <thead>
          <tr className="text-muted">
            {visibleFields.map((field, i) => (
              <th key={i} className="text-capitalize">
                {field === "requirementId" ? "Requirement ID" : field}
              </th>
            ))}
            <th>Resume</th>
            <th>Active</th>
            <th>Sales Status</th>
            <th>Sales Update</th>
            <th>Lead Update</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentCandidates.length > 0 ? (
            currentCandidates.map((candidate) => (
              <React.Fragment key={candidate._id}>
                <tr>
                  {visibleFields.map((field, i) => (
                    <td key={i}>{candidate[field] || "N/A"}</td>
                  ))}

                  {/* Resume URLs */}
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

                  {/* Active badge */}
                  <td>
                    <span
                      className={`badge ${candidate.isActive ? "bg-success" : "bg-secondary"}`}
                    >
                      {candidate.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Sales Status */}
                  <td>
                    <Badge bg={getStatusVariant(candidate.status)}>
                      {candidate.status || "N/A"}
                    </Badge>
                  </td>

                  {/* Sales Update */}
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
                      <option value="L1-cleared">L1 Cleared</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                      <option value="Waiting-for-update">Waiting for update</option>
                      <option value="To-be-interviewed">To be interviewed</option>
                      <option value="Decision-pending">Decision pending</option>
                      <option value="internal-rejection">Internal Rejection</option>
                      <option value="submitted-to-client">Submitted to Client</option>
                      <option value="submitted">Submitted</option>
                    </Form.Select>

                  </td>

                  <td>
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() => toggleExpand(candidate._id)}
                    >
                      {expandedRows.includes(candidate._id) ? "Hide" : "View More"}
                    </Button>
                  </td>
                </tr>

                <tr>
                  <td colSpan={visibleFields.length + 6} className="p-0">
                    <Collapse in={expandedRows.includes(candidate._id)}>
                      <div className="p-3 bg-light text-dark">
                        {hiddenFields.map((field) => (
                          <p key={field} className="mb-1">
                            <strong className="text-capitalize">{field}:</strong>{" "}
                            {candidate[field] || "N/A"}
                          </p>
                        ))}
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleForward(candidate._id)}
                        >
                          Forward to Sales
                        </Button>
                      </div>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan={visibleFields.length + 6} className="text-center">
                No candidates submitted yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-center align-items-center mt-3">
        <Button
          size="sm"
          variant="outline-primary"
          className="me-2"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
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
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next ▶
        </Button>
      </div>
    </section>
  );
}

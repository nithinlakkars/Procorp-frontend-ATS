import React, { useEffect, useState } from "react";
import { Table, Collapse, Button, Form } from "react-bootstrap";
import { getForwardedCandidates, updateCandidateFields } from "../../services";

export default function ForwardedCandidates({ onCountUpdate }) {
  const [forwardedCandidates, setForwardedCandidates] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const response = await getForwardedCandidates();
      const candidates = Array.isArray(response.candidates)
        ? response.candidates
        : response.candidates || [];

      setForwardedCandidates(candidates);

      if (onCountUpdate && typeof onCountUpdate === "function") {
        const count = candidates.filter(
          (c) => c.candidate_update === "forwarded-to-sales"
        ).length;
        onCountUpdate(count);
      }
    } catch (err) {
      console.error("Failed to fetch forwarded candidates", err);
      setForwardedCandidates([]);
    }
  };

  const toggleExpand = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      await updateCandidateFields(candidateId, { candidate_update: newStatus });

      // Update local state immediately
      setForwardedCandidates((prev) =>
        prev.map((c) =>
          c._id === candidateId ? { ...c, candidate_update: newStatus } : c
        )
      );
    } catch (error) {
      console.error("❌ Failed to update status:", error);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "forwarded-to-sales":
        return "primary";
      case "selected":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  const visibleFields = [
    "candidateId",
    "name",
    "role",
    // "client",
    "forwardedBy",
    "addedBy",
    "requirementId",
  ];

  const hiddenFields = [
    "email",
    "phone",
    "rate",
    "source",
    "currentLocation",
    "relocation",
    "passportnumber",
    "Last4digitsofSSN",
    "LinkedinUrl",
    "clientdetails",
  ];

  const fieldLabels = {
    candidateId: "Candidate ID",
    name: "Candidate Name",
    role: "Position",
    client: "Client",
    forwardedBy: "Forwarded By",
    addedBy: "Submitted By",
    requirementId: "Requirement ID",
    email: "Email",
    phone: "Phone",
    rate: "Rate",
    source: "Source",
    currentLocation: "Current Location",
    relocation: "Relocation",
    passportnumber: "Passport Number",
    Last4digitsofSSN: "Last 4 digits of SSN",
    LinkedinUrl: "LinkedIn URL",
    clientdetails: "Client Details",
  };

  const filteredCandidates = forwardedCandidates.filter((candidate) => {
    const query = searchQuery.toLowerCase();
    return (
      candidate.name?.toLowerCase().includes(query) ||
      candidate.role?.toLowerCase().includes(query) ||
      candidate.client?.toLowerCase().includes(query) ||
      candidate.forwardedBy?.toLowerCase().includes(query) ||
      candidate.addedBy?.toLowerCase().includes(query) ||
      candidate.requirementId?.toLowerCase().includes(query) ||
      candidate.candidateId?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredCandidates.length / pageSize);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <section className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Control
          type="text"
          placeholder="🔍 Search by name, role, client, candidateId, requirementId..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          style={{ maxWidth: "400px" }}
        />
      </div>

      <div className="table-responsive">
        <Table hover className="align-middle no-vertical-lines">
          <thead className="table-light">
            <tr>
              {visibleFields.map((field, i) => (
                <th key={i}>{fieldLabels[field] || field}</th>
              ))}
              <th>Active</th>
              <th>Documents</th>
              <th>Status Update</th>
            </tr>
          </thead>

          <tbody>
            {paginatedCandidates.length > 0 ? (
              paginatedCandidates.map((candidate) => (
                <React.Fragment key={candidate._id}>
                  <tr>
                    {visibleFields.map((field, i) => {
                      if (field === "name") {
                        return (
                          <td key={i}>
                            <Button
                              variant="link"
                              className="p-0 text-decoration-none"
                              onClick={() => toggleExpand(candidate._id)}
                            >
                              {candidate[field] || "N/A"}
                            </Button>
                          </td>
                        );
                      } else {
                        return <td key={i}>{candidate[field] || "N/A"}</td>;
                      }
                    })}

                    <td>
                      {candidate.isActive ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </td>

                    <td>
                      {candidate.resumeUrls && candidate.resumeUrls.length > 0 ? (
                        <a
                          href={candidate.resumeUrls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-success"
                          title="Open candidate folder on Google Drive"
                        >
                          📁 View Documents
                        </a>
                      ) : (
                        <span className="text-muted">No Folder</span>
                      )}
                    </td>

                    <td>
                      <Form.Select
                        size="sm"
                        value={candidate.candidate_update || ""}
                        onChange={(e) =>
                          handleStatusChange(candidate._id, e.target.value)
                        }
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
                  </tr>

                  <tr>
                    <td colSpan={visibleFields.length + 3} className="p-0">
                      <Collapse in={expandedRows.includes(candidate._id)}>
                        <div className="p-3 bg-light">
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
                <td
                  colSpan={visibleFields.length + 3}
                  className="text-center text-muted"
                >
                  No matching candidates found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {filteredCandidates.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
          <Button
            variant="outline-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            ⬅ Previous
          </Button>

          <div className="d-flex flex-wrap gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "primary" : "outline-primary"}
                onClick={() => setCurrentPage(page)}
                size="sm"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next ➡
          </Button>
        </div>
      )}
    </section>
  );
}

import React, { useEffect, useState } from "react";
import { Table, Button, Form, Collapse } from "react-bootstrap";
import {
  fetchUnassignedRequirements,
  fetchRecruiters,
  bulkAssignRequirements,
} from "../../services";

export default function NewRequirementsSection({ setMessage }) {
  const [requirements, setRequirements] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [selectedReqs, setSelectedReqs] = useState([]);
  const [selectedRecruiters, setSelectedRecruiters] = useState([]);

  const user = sessionStorage.getItem("user");

  const mainFields = [
    "requirementId",
    "title",
    // "locations",
    "employmentType",
    "rate",
    "client",
    "priority",

    // "leadAssignedTo",
    // "recruiterAssignedTo",
  ];

  const extraFields = [
    "description",
    "primarySkills",
    // "workSetting",
    "workAuthorization"
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const reqRes = await fetchUnassignedRequirements();
        const recRes = await fetchRecruiters();
        setRequirements(reqRes?.data || reqRes);
        setRecruiters(recRes?.data || recRes);
      } catch (error) {
        console.error("❌ Fetch error", error);
        setMessage("❌ Failed to load data.");
      }
    };
    loadData();
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleCheckboxChange = (id) => {
    setSelectedReqs((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedReqs.length === 0 || selectedRecruiters.length === 0) {
      alert("❌ Select at least one requirement and one recruiter.");
      return;
    }

    try {
      const res = await bulkAssignRequirements({
        requirementIds: selectedReqs,
        recruiterEmails: selectedRecruiters,
        leadEmail: user,
      });

      setMessage(res.message || "✅ Requirements assigned successfully.");
      setSelectedReqs([]);
      setSelectedRecruiters([]);

      const updated = await fetchUnassignedRequirements();
      setRequirements(updated?.data || updated);
    } catch (error) {
      console.error("❌ Assignment error", error);
      setMessage("❌ Assignment failed.");
    }
  };

  return (
    <section className="container mt-4">
      {/* <h4 className="text-primary mb-4">Job Requirements</h4> */}

      <Table hover responsive className="border-bottom">

        <thead>
          <tr className="text-muted">
            <th>Select</th>
            {mainFields.map((field, index) => (
              <th key={index} className="text-capitalize">
                {field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requirements.length > 0 ? (
            requirements.map((req, idx) => (
              <React.Fragment key={req._id}>
                <tr>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedReqs.includes(req._id)}
                      onChange={() => handleCheckboxChange(req._id)}
                    />
                  </td>
                  {mainFields.map((field, i) => (
                    <td key={i}>
                      {field === "title" ? (
                        <>
                          <Button
                            variant="link"
                            className="p-0 text-primary fw-semibold"
                            onClick={() => toggleExpand(req._id)}
                          >
                            {req[field] || "Untitled"}
                          </Button>
                          <div className="text-muted small">
                            {Array.isArray(req.locations)
                              ? req.locations.join(", ")
                              : req.locations || "N/A"}
                            {" | "}
                            {req.workSetting || "N/A"}
                          </div>
                        </>
                      ) : Array.isArray(req[field]) ? (
                        req[field].join(", ")
                      ) : (
                        req[field] || "N/A"
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td colSpan={mainFields.length + 1} className="p-0">
                    <Collapse in={expanded.includes(req._id)}>
                      <div className="p-3 bg-light">
                        {extraFields.map((field, i) => (
                          <p key={i} className="mb-1">
                            <strong className="text-capitalize">{field}:</strong>{" "}
                            {field === "workAuthorization"
                              ? (Array.isArray(req[field])
                                ? req[field]
                                : typeof req[field] === "string"
                                  ? req[field].split(",")
                                  : []
                              )
                                .map((auth) =>
                                ({
                                  USC: "US Citizen",
                                  GC: "Green Card",
                                  H1B: "H1B",
                                  OPT: "OPT/CPT",
                                  Other: "Other",
                                }[auth.trim()] || auth.trim())
                                )
                                .join(", ") || "N/A"
                              : Array.isArray(req[field])
                                ? req[field].join(", ")
                                : req[field] || "N/A"}

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
              <td colSpan={mainFields.length + 1} className="text-center">
                No requirements available.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* ✅ Recruiter Selection */}
      <div className="mb-3">
        <h5>Select Recruiters:</h5>
        {recruiters.map((r) => (
          <Form.Check
            inline
            key={r.email}
            label={r.name || r.email}
            type="checkbox"
            checked={selectedRecruiters.includes(r.email)}
            onChange={() =>
              setSelectedRecruiters((prev) =>
                prev.includes(r.email)
                  ? prev.filter((e) => e !== r.email)
                  : [...prev, r.email]
              )
            }
          />
        ))}
      </div>

      {/* ✅ Assign Button */}
      <Button
        variant="success"
        disabled={selectedReqs.length === 0 || selectedRecruiters.length === 0}
        onClick={handleAssign}
      >
        Assign Selected Requirements
      </Button>
    </section>
  );
}
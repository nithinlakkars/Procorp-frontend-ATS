import React, { useState, useEffect } from "react";
import { fetchSalesLeads, fetchRecruiters, submitSalesRequirement } from "../../services";
import citiesByState from "../../data/usCitiesByState.json";

const requiredFields = [
  "title",
  "description",
  "employmentType",
  "priority",
  "workSetting",
  "rate",
  "primarySkills",
  "client",
  "workAuthorization",
  "duration"
];

export default function RequirementForm({
  form,
  setForm,
  locationSearch,
  setLocationSearch,
  handleChange,
  handleMultiCheckbox,
  rateRanges,
}) {
  const [leads, setLeads] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const leadsData = await fetchSalesLeads();
        const recruitersData = await fetchRecruiters();
        setLeads(leadsData);
        setRecruiters(recruitersData);
      } catch (err) {
        console.error("Error loading leads or recruiters", err);
        setErrorMsg("❌ Failed to load leads or recruiters");
      }
    };
    loadData();
  }, []);

  const handleSubmitRequirement = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    for (let field of requiredFields) {
      if (!form[field] || (Array.isArray(form[field]) && form[field].length === 0)) {
        setErrorMsg("❌ Please fill all required fields");
        return;
      }
    }

    try {
      setLoading(true);

      // 🔑 Transform frontend fields into what backend expects
      const payload = {
        ...form,
        leadEmails: Array.isArray(form.leadAssignedTo) ? form.leadAssignedTo : [],
        recruiterAssignedTo: Array.isArray(form.recruiterAssignedTo) ? form.recruiterAssignedTo : [],
      };


      await submitSalesRequirement(payload);

      setSuccessMsg("✅ Requirement submitted successfully!");
      setForm({
        title: "",
        description: "",
        client: "",
        leadAssignedTo: [],
        recruiterAssignedTo: [],
        locations: [],
        employmentType: "",
        workSetting: "",
        workAuthorization: [],
        rate: "",
        primarySkills: "",
        priority: "",
        duration: "",
      });
      setLocationSearch("");
    } catch (err) {
      console.error("❌ Error submitting requirement:", err);
      setErrorMsg("❌ Failed to submit requirement");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 3000);
    }
  };


  const searchResults = [];
  if (locationSearch.trim()) {
    Object.entries(citiesByState).forEach(([state, cities]) => {
      cities.forEach((city) => {
        const label = `${city}, ${state}`;
        if (
          label.toLowerCase().includes(locationSearch.toLowerCase()) &&
          !form.locations.includes(label)
        ) {
          searchResults.push(label);
        }
      });
    });
  }

  const handleWorkAuthCheckbox = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const updated = checked
        ? [...prev.workAuthorization, value]
        : prev.workAuthorization.filter((auth) => auth !== value);
      return { ...prev, workAuthorization: updated };
    });
  };

  return (
    <div className="card p-4 mb-5 shadow">
      <h4 className="mb-3 text-success">📋 Post New Requirement</h4>
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form onSubmit={handleSubmitRequirement}>
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          className="form-control mb-2"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Job Description"
          rows="3"
          className="form-control mb-2"
          value={form.description}
          onChange={handleChange}
          required
        />

        <label className="fw-bold">Assign to Leads:</label>
        <div className="mb-2 d-flex flex-wrap">
          {leads.length === 0 ? (
            <p className="text-muted">No leads available</p>
          ) : (
            leads.map((lead) => (
              <div key={lead.email} className="form-check me-3 mb-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`lead-${lead.email}`}
                  checked={form.leadAssignedTo?.includes(lead.email) || false}
                  onChange={() => handleMultiCheckbox("leadAssignedTo", lead.email)}
                />
                <label className="form-check-label" htmlFor={`lead-${lead.email}`}>
                  {lead.username || lead.email}
                </label>
              </div>
            ))
          )}
        </div>

        {/* <label className="fw-bold mt-3">Assign to Recruiters:</label>
        <div className="mb-2 d-flex flex-wrap">
          {recruiters.length === 0 ? (
            <p className="text-muted">No recruiters available</p>
          ) : (
            recruiters.map((recruiter) => (
              <div key={recruiter.email} className="form-check me-3 mb-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`recruiter-${recruiter.email}`}
                  checked={form.recruiterAssignedTo?.includes(recruiter.email) || false}
                  onChange={() => handleMultiCheckbox("recruiterAssignedTo", recruiter.email)}
                />
                <label className="form-check-label" htmlFor={`recruiter-${recruiter.email}`}>
                  {recruiter.username || recruiter.email}
                </label>
              </div>
            ))
          )}
        </div> */}

        <label className="fw-bold mt-3">Locations:</label>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Search US City or State"
          value={locationSearch}
          onChange={(e) => setLocationSearch(e.target.value)}
        />

        {/* Search Suggestions + Manual Add */}
        {(searchResults.length > 0 || locationSearch.trim()) && (
          <div className="border rounded p-2 mb-2" style={{ maxHeight: "150px", overflowY: "auto" }}>
            {/* Matching cities */}
            {searchResults.slice(0, 10).map((loc) => (
              <button
                key={loc}
                type="button"
                className="btn btn-sm btn-outline-primary me-2 mb-1"
                onClick={() => {
                  handleMultiCheckbox("locations", loc);
                  setLocationSearch("");
                }}
              >
                {loc}
              </button>
            ))}

            {/* Allow manual location if not found */}
            {locationSearch.trim() &&
              !searchResults.some((res) => res.toLowerCase() === locationSearch.toLowerCase()) &&
              !form.locations.includes(locationSearch.trim()) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success me-2 mb-1"
                  onClick={() => {
                    handleMultiCheckbox("locations", locationSearch.trim());
                    setLocationSearch("");
                  }}
                >
                  ➕ Use "{locationSearch}"
                </button>
              )}
          </div>
        )}

        {/* Selected Locations */}
        {form.locations?.length > 0 && (
          <div className="mb-2 d-flex flex-wrap">
            {form.locations.map((loc) => (
              <span key={loc} className="badge bg-success me-2 mb-1 d-flex align-items-center">
                {loc}
                <button
                  type="button"
                  className="btn-close btn-close-white btn-sm ms-2"
                  aria-label="Remove"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      locations: prev.locations.filter((l) => l !== loc),
                    }))
                  }
                ></button>
              </span>
            ))}
          </div>
        )}


        <div className="row">
          <div className="col-md-6 mb-2">
            <select
              name="employmentType"
              className="form-select"
              value={form.employmentType}
              onChange={handleChange}
              required
            >
              <option value="">Select Employment Type</option>
              <option value="W2">W2</option>
              <option value="C2C">C2C</option>
              <option value="C2H">C2H</option>
              <option value="Full Time">Full Time</option>
            </select>

          </div>

          <div className="col-md-6 mb-2">
            <select
              name="duration"
              className="form-select"
              value={form.duration}
              onChange={handleChange}
              required
            >
              <option value="">Select Duration</option>
              <option value="longterm">Long Term</option>
              <option value="shortterm">Short Term</option>
            </select>
          </div>

          <div className="col-md-6 mb-2">
            <select
              name="priority"
              className="form-select"
              value={form.priority}
              onChange={handleChange}
              required
            >
              <option value="">Select Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="col-md-6 mb-2">
            <select
              name="workSetting"
              className="form-select"
              value={form.workSetting}
              onChange={handleChange}
              required
            >
              <option value="">Select Work Setting</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>

          <div className="col-md-6 mb-2">
            <div className="mb-3">
              <label className="form-label fw-bold">Work Authorization</label>
              {["USC", "GC", "GC-EAD", "H1B", "H4-EAD", "TN", "L2-EAD", "OPT", "Other"].map((option) => (
                <div className="form-check" key={option}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`wa-${option}`}
                    value={option}
                    checked={form.workAuthorization?.includes(option) || false}
                    onChange={handleWorkAuthCheckbox}
                    required={form.workAuthorization?.length === 0}
                  />
                  <label className="form-check-label" htmlFor={`wa-${option}`}>
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <select
          name="rate"
          className="form-select mb-2"
          value={form.rate}
          onChange={handleChange}
          required
        >
          <option value="">Select Rate Range</option>
          {rateRanges.map((rate) => (
            <option key={rate} value={rate}>
              {rate}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="primarySkills"
          placeholder="Primary Skills (comma separated)"
          className="form-control mb-3"
          value={form.primarySkills}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="client"
          placeholder="Client Name"
          className="form-control mb-2"
          value={form.client}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Submitting..." : "Submit Requirement"}
        </button>
      </form>
    </div>
  );

}

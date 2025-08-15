import React, { useEffect, useState } from "react";
import citiesByState from "../../data/usCitiesByState.json";
import {
  fetchRecruiters,
  submitSalesRequirement,
} from "../../services";

const requiredFields = [
  "title",
  "description",
  "recruiterEmails",
  "locations",
  "employmentType",
  "workSetting",
  "rate",
  "primarySkills",
  "workAuthorization",
  "client",
];

export default function RequirementForm({
  form,
  setForm,
  locationSearch,
  setLocationSearch,
  handleChange,
  handleMultiCheckbox,
  rateRanges = [],
}) {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const recruitersData = await fetchRecruiters();
        setRecruiters(recruitersData);
      } catch (err) {
        console.error("Error loading recruiters", err);
        setErrorMsg("❌ Failed to load recruiters");
      }
    };
    loadData();
  }, []);

  const handleSubmitRequirement = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!form.title || !form.description) {
      setErrorMsg("❌ Please fill all required fields");
      return;
    }
    if (!form.workAuthorization || form.workAuthorization.length === 0) {
      setErrorMsg("❌ Please select at least one work authorization");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        recruiterAssignedTo: form.recruiterEmails || [],
      };

      await submitSalesRequirement(payload);
      console.log("Submitted requirement:", payload);

      setForm({
        title: "",
        description: "",
        recruiterEmails: [],
        locations: [],
        employmentType: "",
        workSetting: "",
        rate: "",
        primarySkills: "",
        workAuthorization: [],
        client: "",
      });
      setLocationSearch("");
      setSuccessMsg("✅ Requirement submitted successfully!");
    } catch {
      setErrorMsg("❌ Failed to submit requirement");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 3000);
    }
  };

  const locationsArray = form.locations || [];

  const searchResults = [];
  if ((locationSearch || "").trim()) {
    Object.entries(citiesByState).forEach(([state, cities]) => {
      cities.forEach((city) => {
        const label = `${city}, ${state}`;
        if (
          label.toLowerCase().includes(locationSearch.toLowerCase()) &&
          !locationsArray.includes(label)
        ) {
          searchResults.push(label);
        }
      });
    });
  }

  return (
    <div className="card p-4 mb-5 shadow">
      <h4 className="mb-3 text-success">Post New Requirement</h4>
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

        <label className="fw-bold mt-3">Assign to Recruiters:</label>
        <div className="mb-2 d-flex flex-wrap">
          {recruiters.length === 0 ? (
            <p className="text-muted">No recruiters available</p>
          ) : (
            recruiters.map((rec) => (
              <div key={rec.email} className="form-check me-3 mb-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`rec-${rec.name}`}
                  checked={(form.recruiterEmails || []).includes(rec.email)}
                  onChange={() =>
                    handleMultiCheckbox("recruiterEmails", rec.email)
                  }
                />
                <label className="form-check-label" htmlFor={`rec-${rec.name}`}>
                  {rec.name || rec.name}
                </label>
              </div>
            ))
          )}
        </div>

        <label className="fw-bold mt-3">Locations:</label>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Search US City or State"
          value={locationSearch}
          onChange={(e) => setLocationSearch(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div
            className="border rounded p-2 mb-2"
            style={{ maxHeight: "120px", overflowY: "auto" }}
          >
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
          </div>
        )}
        {locationsArray.length > 0 && (
          <div className="mb-2">
            {locationsArray.map((loc) => (
              <span key={loc} className="badge bg-success me-2 mb-1">
                {loc}
                <button
                  type="button"
                  className="btn btn-sm btn-light ms-2 py-0 px-1"
                  style={{ lineHeight: 1 }}
                  onClick={() => {
                    const updatedLocations = locationsArray.filter((l) => l !== loc);
                    setForm({ ...form, locations: updatedLocations });
                  }}
                >
                  ✖
                </button>
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
        </div>

        <input
          type="text"
          name="client"
          placeholder="Client Name"
          className="form-control mb-2"
          value={form.client}
          onChange={handleChange}
          required
        />

        <label className="fw-bold mt-3">Work Authorization:</label>
        <div className="mb-2 d-flex flex-wrap">
          {["US Citizen", "Green Card", "H1B", "OPT", "EAD"].map((auth) => (
            <div key={auth} className="form-check me-3 mb-1">
              <input
                type="checkbox"
                className="form-check-input"
                id={`wa-${auth}`}
                checked={(form.workAuthorization || []).includes(auth)}
                onChange={() => handleMultiCheckbox("workAuthorization", auth)}
              />
              <label className="form-check-label" htmlFor={`wa-${auth}`}>
                {auth}
              </label>
            </div>
          ))}
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

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Requirement"}
        </button>
      </form>
    </div>
  );
}

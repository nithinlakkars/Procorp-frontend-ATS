import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import axios from "axios";

const API_URL = "http://localhost:5000/api/stats/recruiter-dashboard";

const RecruiterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch recruiter stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const { data } = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ template string fixed
          },
        });

        console.log("Recruiter dashboard stats:", data);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch recruiter stats, using dummy data", err);

        // fallback dummy data
        setStats({
          assignedRequirements: 5,
          submissions: 12,
          activeCandidates: 8,
          candidateStats: {
            Applied: 10,
            "Internal Reject": 3,
            "Submitted to Client": 5,
            Interview: 2,
            Selected: 4,
            Rejected: 6,
            Backout: 1,
            Offer: 2,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ✅ Top Stat Cards
  const cards = [
    { title: "Assigned Requirements", value: stats?.assignedRequirements || 0, icon: "bi-briefcase" },
    { title: "Submissions", value: stats?.submissions || 0, icon: "bi-upload" },
    { title: "Active Candidates", value: stats?.activeCandidates || 0, icon: "bi-person-check" },
  ];

  // ✅ Candidate Statuses (8 cards)
  const candidateStatuses = stats?.candidateStats || {
    Applied: 0,
    "Internal Reject": 0,
    "Submitted to Client": 0,
    Interview: 0,
    Selected: 0,
    Rejected: 0,
    Backout: 0,
    Offer: 0,
  };

  return (
    <Container fluid className="p-4">
      <h4 className="fw-bold mb-4">Recruiter Dashboard</h4>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          {/* ✅ Stat Cards */}
          <Row className="mb-4">
            {cards.map((card, idx) => (
              <Col md={4} key={idx}>
                <Card className="mb-3 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Card.Title className="mb-0 fs-6">{card.title}</Card.Title>
                      <i className={`bi ${card.icon} fs-4 text-primary`}></i> {/* ✅ fixed template string */}
                    </div>
                    <h4 className="fw-bold">{card.value}</h4>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* ✅ Candidate Status Counts */}
          <Row>
            <Col>
              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <Card.Title className="mb-3">Candidate Statuses</Card.Title>
                  <Row>
                    {Object.entries(candidateStatuses).map(([status, count], idx) => (
                      <Col key={idx} md={3} className="mb-3">
                        <Card bg="light" className="text-center p-2 h-100">
                          <h6 className="mb-1">{status}</h6>
                          <h5 className="fw-bold">{count}</h5>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default RecruiterDashboard;

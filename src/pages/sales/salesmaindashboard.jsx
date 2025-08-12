import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import axios from "axios";

const API_URL = "http://localhost:5000/api/stats/sales-dashboard";
const SALES_CANDIDATES_URL = "http://localhost:5000/api/candidates/sales";

const AccountManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [salesCandidates, setSalesCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);

  // ✅ Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const { data } = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Dashboard stats:", data);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ✅ Fetch candidates forwarded to sales
  // useEffect(() => {
  //   const fetchSalesCandidates = async () => {
  //     const token = sessionStorage.getItem("token");

  //     try {
  //       const { data } = await axios.get(SALES_CANDIDATES_URL, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       setSalesCandidates(data?.candidates || []);
  //     } catch (err) {
  //       console.error("Failed to fetch sales candidates", err);
  //     } finally {
  //       setCandidatesLoading(false);
  //     }
  //   };

  //   fetchSalesCandidates();
  // }, []);

  const cards = [
    { title: "Active Requirements", value: stats?.activeRequirements || 0, icon: "bi-briefcase" },
    { title: "Closed Requirements", value: stats?.closedRequirements || 0, icon: "bi-check-circle" },
    { title: "Active Candidates", value: stats?.activeCandidates || 0, icon: "bi-people" },
    { title: "Inactive Candidates", value: stats?.inactiveCandidates || 0, icon: "bi-person-x" },
  ];

  const candidateStatuses = stats?.candidateStats || {};

  return (
    <Container fluid className="p-4">
      <h4 className="fw-bold mb-4">Sales Dashboard</h4>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <Row className="mb-4">
            {cards.map((card, idx) => (
              <Col md={3} key={idx}>
                <Card className="mb-3 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Card.Title className="mb-0 fs-6">{card.title}</Card.Title>
                      <i className={`bi ${card.icon} fs-4 text-primary`}></i>
                    </div>
                    <h4 className="fw-bold">{card.value}</h4>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Candidate Status Counts */}
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

          {/* Sales Candidates Table */}
          {/* <Row>
            <Col>
              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <Card.Title className="mb-3">Forwarded to Sales Candidates</Card.Title>
                  {candidatesLoading ? (
                    <div className="text-center">
                      <Spinner animation="border" />
                    </div>
                  ) : salesCandidates.length === 0 ? (
                    <p className="text-muted">No candidates forwarded to sales yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Requirement Title</th>
                            <th>Status</th>
                            <th>Is Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesCandidates.map((candidate) => (
                            <tr key={candidate._id}>
                              <td>{candidate.name}</td>
                              <td>{candidate.email}</td>
                              <td>{candidate.requirementId?.title || "N/A"}</td>
                              <td>{candidate.status}</td>
                              <td>{candidate.isActive ? "Yes" : "No"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row> */}
        </>
      )}
    </Container>
  );
};

export default AccountManagerDashboard;

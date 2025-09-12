import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Table } from "react-bootstrap";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// ✅ All possible candidate statuses (from enum)
const ALL_STATUSES = [
  "Applied",
  "Internal Reject",
  "submitted to client",
  "interview",
  "selected",
  "Rejected",
  "Backout",
  "Offer"
];

const AccountManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedList, setSelectedList] = useState([]);
  const [listTitle, setListTitle] = useState("");

  // ✅ Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const { data } = await axios.get(`${API_URL}/api/stats/sales-dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container fluid className="p-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  // ✅ Stat cards (Requirements & Candidates)
  const cards = [
    { title: "Active Requirements", value: stats?.activeRequirements || 0, key: "activeRequirementsList", icon: "bi-briefcase" },
    { title: "Closed Requirements", value: stats?.closedRequirements || 0, key: "closedRequirementsList", icon: "bi-check-circle" },
    { title: "Active Candidates", value: stats?.activeCandidates || 0, key: "activeCandidatesList", icon: "bi-people" },
    { title: "Inactive Candidates", value: stats?.inactiveCandidates || 0, key: "inactiveCandidatesList", icon: "bi-person-x" },
  ];

  // ✅ Candidate statuses (fill missing with 0 + empty list)
  const candidateStatuses = {};
  ALL_STATUSES.forEach((status) => {
    candidateStatuses[status] = stats?.candidateStats?.[status] || { count: 0, list: [] };
  });

  // ✅ Handle card click
  const handleCardClick = (key, title, list = []) => {
    setSelectedList(list);
    setListTitle(title);
  };

  return (
    <Container fluid className="p-4">
      <h4 className="fw-bold mb-4">Sales Dashboard</h4>

      {/* Main Stat Cards */}
      <Row className="mb-4">
        {cards.map((card, idx) => (
          <Col md={3} key={idx}>
            <Card
              className="mb-3 shadow-sm"
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick(card.key, card.title, stats[card.key] || [])}
            >
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

      {/* Candidate Status Cards */}
      <Row className="mb-4">
        {Object.entries(candidateStatuses).map(([status, obj], idx) => (
          <Col md={3} key={idx}>
            <Card
              className="mb-3 shadow-sm text-center"
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick(status, `Candidates - ${status}`, obj?.list || [])}
            >
              <Card.Body>
                <Card.Title className="mb-1 fs-6">
                  {status.replace(/-/g, " ")} {/* Pretty labels */}
                </Card.Title>
                <h4 className="fw-bold">{obj?.count || 0}</h4>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Selected List Table */}
      {selectedList.length > 0 && (
        <Card className="shadow-sm mt-4">
          <Card.Body>
            <Card.Title>{listTitle}</Card.Title>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    {listTitle.includes("Requirement") && (
                      <>
                        <th>Requirement ID</th>
                        <th>Position</th>
                        <th>Client</th>
                        <th>Priority</th>
                        <th>Duration</th>
                      </>
                    )}
                    {listTitle.includes("Candidate") && (
                      <>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Requirement</th>
                        <th>Candidate Update</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {selectedList.map((item) => (
                    <tr key={item._id}>
                      {listTitle.includes("Requirement") && (
                        <>
                          <td>{item.requirementId}</td>
                          <td>{item.title}</td>
                          <td>{item.client}</td>
                          <td>{item.priority}</td>
                          <td>{item.duration || "N/A"}</td>
                        </>
                      )}
                      {listTitle.includes("Candidate") && (
                        <>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>{item.requirementId?.title || item.requirementId}</td>
                          <td>{item.candidate_update || "N/A"}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default AccountManagerDashboard;

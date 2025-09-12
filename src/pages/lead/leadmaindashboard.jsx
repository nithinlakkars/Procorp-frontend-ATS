import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Table, Modal } from "react-bootstrap";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// All possible candidate statuses
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

const LeadDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState([]);
  const [listTitle, setListTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/api/stats/lead-dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(data);
      } catch (err) {
        console.error("❌ Failed to fetch lead dashboard stats", err);
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

  // Main stat cards
  const cards = [
    { title: "Active Requirements", value: stats?.activeRequirements || 0, key: "activeRequirementsList", icon: "bi-briefcase", list: stats?.activeRequirementsList || [] },
    { title: "Closed Requirements", value: stats?.closedRequirements || 0, key: "closedRequirementsList", icon: "bi-check-circle", list: stats?.closedRequirementsList || [] },
    { title: "Forwarded to Sales", value: stats?.forwardedToSales || 0, key: "forwardedToSalesList", icon: "bi-send", list: stats?.forwardedToSalesList || [] },
    { title: "Active Candidates", value: stats?.activeCandidates || 0, key: "activeCandidatesList", icon: "bi-people", list: stats?.activeCandidatesList || [] },
    { title: "Inactive Candidates", value: stats?.inactiveCandidates || 0, key: "inactiveCandidatesList", icon: "bi-person-x", list: stats?.inactiveCandidatesList || [] },
  ];

  const candidateStatuses = {};
  ALL_STATUSES.forEach((status) => {
    candidateStatuses[status] = stats?.candidateStats?.[status] || { count: 0, list: [] };
  });

  const handleCardClick = (key, title, list = []) => {
    setSelectedList(list);
    setListTitle(title);
    setShowModal(true);
  };

  const renderTableRows = () =>
    selectedList.map((item) => (
      <tr key={item._id}>
        {listTitle.includes("Requirement") && (
          <>
            <td>{item.requirementId}</td>
            <td>{item.title}</td>
            <td>{item.client}</td>
            <td>{item.priority}</td>
            <td>{item.duration || "N/A"}</td>
            <td>{item.recruiterAssignedTo?.join(", ") || "N/A"}</td>
          </>
        )}
        {listTitle.includes("Candidate") && (
          <>
            <td>{item.name}</td>
            <td>{item.email}</td>
            <td>
              {Array.isArray(item.requirementId)
                ? item.requirementId.map(r => r.title || r).join(", ")
                : item.requirementId?.title || item.requirementId || "N/A"}
            </td>
            <td>{item.candidate_update || "N/A"}</td>
            <td>{item.isActive || "not available"}</td>
          </>
        )}
      </tr>
    ));

  return (
    <Container fluid className="p-4">
      <h4 className="fw-bold mb-4">Lead Dashboard</h4>

      {/* Main Stat Cards */}
      <Row className="mb-4">
        {cards.map((card, idx) => (
          <Col md={3} key={idx}>
            <Card
              className="mb-3 shadow-sm"
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick(card.key, card.title, card.list)}
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
                <Card.Title className="mb-1 fs-6">{status.replace(/-/g, " ")}</Card.Title>
                <h4 className="fw-bold">{obj?.count || 0}</h4>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal for Selected List */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{listTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  {listTitle.includes("Requirement") && (
                    <>
                      <th>Requirement ID</th>
                      <th>Title</th>
                      <th>Client</th>
                      <th>Priority</th>
                      <th>Duration</th>
                      <th>Recruiters</th>
                    </>
                  )}
                  {listTitle.includes("Candidate") && (
                    <>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Requirement</th>
                      <th>Candidate Update</th>
                      <th>Is Active</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default LeadDashboard;

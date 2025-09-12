import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Table, Modal } from "react-bootstrap";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const ALL_STATUSES = ["Applied", "Internal Reject", "Submitted to Client", "Interview", "Selected", "Rejected", "Backout", "Offer"];

const RecruiterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState([]);
  const [listTitle, setListTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/api/stats/recruiter-dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Recruiter Dashboard API Response:", data); // 🔍 Check the output here
        setStats(data);
      } catch (err) {
        console.error("❌ Failed to fetch recruiter dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);


  if (loading) return <Container fluid className="p-4 text-center"><Spinner animation="border" /></Container>;

  const cards = [
    { title: "Assigned Requirements", value: stats?.assignedRequirements || 0, key: "assignedRequirementsList", icon: "bi-briefcase", list: stats?.assignedRequirementsList || [] },
    { title: "Submissions", value: stats?.submissions || 0, key: "submissionsList", icon: "bi-upload", list: stats?.submissionsList || [] },
    { title: "Active Candidates", value: stats?.activeCandidates || 0, key: "activeCandidatesList", icon: "bi-person-check", list: stats?.activeCandidatesList || [] },
  ];

  const candidateStatuses = {};
  ALL_STATUSES.forEach(status => candidateStatuses[status] = stats?.candidateStats?.[status] || { count: 0, list: [] });

  const handleCardClick = (key, title, list = []) => {
    setSelectedList(list);
    setListTitle(title);
    setShowModal(true);
  };

  const renderTableRows = () => selectedList.map(item => (
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
          <td>{Array.isArray(item.requirementId) ? item.requirementId.map(r => r.title || r).join(", ") : item.requirementId?.title || item.requirementId || "N/A"}</td>
          <td>{item.candidate_update || "N/A"}</td>
          <td>{item.isActive ? "Active" : "Inactive"}</td>
        </>
      )}
    </tr>
  ));

  return (
    <Container fluid className="p-4">
      <h4 className="fw-bold mb-4">Recruiter Dashboard</h4>

      <Row className="mb-4">
        {cards.map((card, idx) => (
          <Col md={4} key={idx}>
            <Card className="mb-3 shadow-sm" style={{ cursor: "pointer" }} onClick={() => handleCardClick(card.key, card.title, card.list)}>
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

      <Row className="mb-4">
        {Object.entries(candidateStatuses).map(([status, obj], idx) => (
          <Col md={3} key={idx}>
            <Card className="mb-3 shadow-sm text-center" style={{ cursor: "pointer" }} onClick={() => handleCardClick(status, `Candidates - ${status}`, obj?.list || [])}>
              <Card.Body>
                <Card.Title className="mb-1 fs-6">{status}</Card.Title>
                <h4 className="fw-bold">{obj?.count || 0}</h4>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>{listTitle}</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  {listTitle.includes("Requirement") && <><th>Requirement ID</th><th>Title</th><th>Client</th><th>Priority</th><th>Duration</th></>}
                  {listTitle.includes("Candidate") && <><th>Name</th><th>Email</th><th>Requirement</th><th>Candidate Update</th><th>Status</th></>}
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

export default RecruiterDashboard;

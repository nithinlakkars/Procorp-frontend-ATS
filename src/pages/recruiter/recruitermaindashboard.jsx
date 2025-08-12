import React from "react";
import { Container, Row, Col, Card, ProgressBar, ListGroup } from "react-bootstrap";

const AccountManagerDashboard = () => {
  const stats = [
    { title: "Active Candidates", value: 145, icon: "bi-people", change: "+12%" },
    { title: "Open Positions", value: 23, icon: "bi-briefcase", change: "+5%" },
    { title: "Interviews This Week", value: 32, icon: "bi-calendar-week", change: "+18%" },
    { title: "Positions Filled", value: 18, icon: "bi-check-circle", change: "+3%" },
  ];

  const recentActivity = [
    { title: "New application", name: "Sarah Johnson", role: "Frontend Developer", time: "2 hours ago" },
    { title: "Interview scheduled", name: "Michael Chen", role: "Product Manager", time: "5 hours ago" },
    { title: "Candidate rejected", name: "Emily Rodriguez", role: "UX Designer", time: "Yesterday" },
    { title: "Offer sent", name: "David Kim", role: "Data Scientist", time: "Yesterday" },
  ];

  const pipeline = [
    { stage: "Applied", count: 145 },
    { stage: "Screening", count: 87 },
    { stage: "Interview", count: 32 },
    { stage: "Offer", count: 12 },
    { stage: "Hired", count: 5 },
  ];

  return (
    <Container fluid className="p-4">
      <h4 className="fw-bold mb-4">Dashboard</h4>

      {/* Stat Cards */}
      <Row className="mb-4">
        {stats.map((s, idx) => (
          <Col md={3} key={idx}>
            <Card className="mb-3 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Card.Title className="mb-0 fs-6">{s.title}</Card.Title>
                  <i className={`bi ${s.icon} fs-4 text-primary`}></i>
                </div>
                <h4 className="fw-bold">{s.value}</h4>
                <small className="text-success">{s.change} from last month</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Activity + Pipeline */}
      <Row>
        {/* Recent Activity */}
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Recent Activity</Card.Title>
              <ListGroup variant="flush">
                {recentActivity.map((item, idx) => (
                  <ListGroup.Item key={idx}>
                    <span className="text-primary fw-semibold">{item.title}</span><br />
                    <span>{item.name} • {item.role}</span><br />
                    <small className="text-muted">{item.time}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Hiring Pipeline */}
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Hiring Pipeline</Card.Title>
              <ProgressBar now={60} variant="primary" className="mb-3" />
              <div className="d-flex justify-content-between text-center">
                {pipeline.map((step, idx) => (
                  <div key={idx}>
                    <div className="fw-semibold">{step.stage}</div>
                    <small className="text-muted">{step.count}</small>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountManagerDashboard;

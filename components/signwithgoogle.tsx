"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, Form, Button, Container, Row, Col } from "react-bootstrap";

const SignInWithGoogle = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      toast.success("Login Successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1000);
    } else {
      toast.error("Please enter valid credentials");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center">
      <Row>
        <Col>
          <Card className="shadow-lg p-4 rounded" style={{ width: "350px" }}>
            <Card.Body>
              <Card.Title className="text-center mb-3 fs-3 fw-bold">Sign In</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100">
                  Login
                </Button>
              </Form>

              <div className="text-center my-3 text-muted">or</div>

              <Button
                variant="outline-danger"
                className="w-100 d-flex align-items-center justify-content-center"
                onClick={() => signIn("google")}
              >
                <svg
                  className="me-2"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.6h6.6c-.3 1.3-1 2.4-2 3.3v2.7h3.3c2-1.8 3.1-4.4 3.1-7.3z"></path>
                  <path d="M12 24c2.8 0 5.1-.9 6.8-2.4l-3.3-2.7c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.9-4.3H2.6v2.7c1.7 3.3 5.1 5.7 9.4 5.7z"></path>
                  <path d="M6.1 14.6c-.4-1.3-.4-2.7 0-4H2.6c-.9 1.8-.9 4 .0 5.9l3.5-1.9z"></path>
                  <path d="M12 4.8c1.5 0 2.9.5 4 .7l3-2.8C16.9 1 14.6 0 12 0 7.7 0 4.3 2.4 2.6 5.9l3.5 1.9c.9-2.5 3.2-4.2 5.9-4.2z"></path>
                </svg>
                Sign in with Google
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignInWithGoogle;

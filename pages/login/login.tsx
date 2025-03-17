"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import SignWithGoogle from "../../components/signwithgoogle";
import Welcome from "../welcome";
import Signin from "../signin/signin";
import { Toast, ToastContainer } from "react-bootstrap";
import { useEffect, useState } from "react";

export default function Login() {
  const { data: session } = useSession();
  console.log("session", session);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (session?.isNewUser) {
      setToastMessage("User created successfully!");
      setShowToast(true);
    } else if (session?.user) {
      setToastMessage("User already exists!");
      setShowToast(true);
    }
  }, [session]);

  return (
    <>
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
      {session ? (
        <div>
          <Welcome />
        </div>
      ) : (
        <Signin />
      )}
    </>
  );
}

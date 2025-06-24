 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [slaptazodis, setSlaptazodis] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Sign in user with credentials provider
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password: slaptazodis,
    });

    if (result?.error) {
      setErrorMsg("Neteisingi prisijungimo duomenys");
      return;
    }

    // Get session properly with getSession
    const session = await getSession();
    const role = session?.user?.role;

    if (role === "tutor") {
      router.push("/tutor_dashboard");
    } else if (role === "client") {
      router.push("/student_dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          backgroundColor: "#fff",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          color: "#000",
        }}
      >
        <p
          style={{
            fontWeight: "bold",
            textTransform: "lowercase",
            marginBottom: 20,
            fontSize: 18,
            textAlign: "center",
          }}
        >
          prisijungimas:
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="email"
            placeholder="El. paštas"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Slaptažodis"
            value={slaptazodis}
            onChange={(e) => setSlaptazodis(e.target.value)}
            required
          />

          <button
            type="submit"
            style={{
              padding: 12,
              backgroundColor: "#0070f3",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Prisijungti
          </button>
        </form>

        {errorMsg && (
          <p style={{ color: "red", marginTop: 10, textAlign: "center" }}>
            {errorMsg}
          </p>
        )}

        <p style={{ marginTop: 15, textAlign: "center", fontSize: 14 }}>
          Neturite paskyros?{" "}
          <a
            href="/auth/"
            style={{ color: "#0070f3", textDecoration: "underline" }}
          >
            Registracija
          </a>
        </p>
      </div>
    </div>
  );
}

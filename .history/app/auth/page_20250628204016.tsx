"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RegistracijaPage() {
  const [vardas, setVardas] = useState("");
  const [pavarde, setPavarde] = useState("");
  const [vaikoVardas, setVaikoVardas] = useState("");
  const [pamokos, setPamokos] = useState<string[]>([]);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [slaptazodis, setSlaptazodis] = useState("");
  const [repeatSlaptazodis, setRepeatSlaptazodis] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const router = useRouter();

  const handlePamokosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setPamokos((prev) => [...prev, value]);
    } else {
      setPamokos((prev) => prev.filter((item) => item !== value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!role) {
      setErrorMsg("Prašome pasirinkti rolę.");
      return;
    }

    if (role !== "tutor" && !vaikoVardas.trim()) {
      setErrorMsg("Prašome įvesti vaiko vardą.");
      return;
    }

    if (slaptazodis !== repeatSlaptazodis) {
      setErrorMsg("Slaptažodžiai nesutampa");
      return;
    }

    if (pamokos.length === 0) {
      setErrorMsg("Prašome pasirinkti bent vieną pamoką.");
      return;
    }

    try {
      // Clean email (trim + lowercase)
      const cleanedEmail = email.trim().toLowerCase();

      console.log("Signing up with email:", `"${cleanedEmail}"`);

      // Sign up user via Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanedEmail,
        password: slaptazodis,
      });

      if (signUpError) {
        setErrorMsg(signUpError.message);
        return;
      }

      if (!data?.user) {
        setErrorMsg("Nepavyko sukurti vartotojo.");
        return;
      }

      // Insert user profile to your 'users' table
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        vardas,
        pavarde,
        vaikoVardas: role !== "tutor" ? vaikoVardas : null,
        pamokos,
        role,
        email: cleanedEmail,
      });

      if (insertError) {
        setErrorMsg("Nepavyko išsaugoti vartotojo duomenų.");
        return;
      }

      setSuccessMsg("Registracija sėkminga! Nukreipiame...");

      setTimeout(() => {
        if (role === "tutor") {
          router.push(`/tutor_dashboard/${data.user.id}`);
        } else if (role === "client") {
          router.push(`/student_dashboard/${data.user.id}`);
        } else {
          router.push("/auth/log-in");
        }
      }, 2000);
    } catch (error: any) {
      setErrorMsg("Serverio klaida: " + (error.message || "Nežinoma klaida"));
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
            marginBottom: 20,
            fontSize: 18,
            textAlign: "center",
          }}
        >
          REGISTRACIJA:
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
          >
            <option value="">Pasirinkite rolę</option>
            <option value="tutor">Mokytojas</option>
            <option value="client">Klientas</option>
          </select>

          {role !== "tutor" && (
            <input
              type="text"
              placeholder="Vaiko vardas"
              value={vaikoVardas}
              onChange={(e) => setVaikoVardas(e.target.value)}
              required={role !== "tutor"}
            />
          )}

          <input
            type="text"
            placeholder="Vardas"
            value={vardas}
            onChange={(e) => setVardas(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Pavardė"
            value={pavarde}
            onChange={(e) => setPavarde(e.target.value)}
            required
          />

          <fieldset
            style={{
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: 10,
              marginBottom: 12,
            }}
          >
            <legend style={{ fontWeight: "bold" }}>Pasirinkite pamokas:</legend>
            {["Matematika", "Anglų kalba", "Programavimas", "Fizika"].map(
              (lesson) => (
                <label
                  key={lesson}
                  style={{ display: "block", marginBottom: 6, cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    value={lesson}
                    checked={pamokos.includes(lesson)}
                    onChange={handlePamokosChange}
                    style={{ marginRight: 8 }}
                  />
                  {lesson}
                </label>
              )
            )}
          </fieldset>

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
          <input
            type="password"
            placeholder="Pakartokite slaptažodį"
            value={repeatSlaptazodis}
            onChange={(e) => setRepeatSlaptazodis(e.target.value)}
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
            Užsiregistruoti
          </button>
        </form>

        {errorMsg && (
          <p style={{ color: "red", marginTop: 10, textAlign: "center" }}>
            {errorMsg}
          </p>
        )}
        {successMsg && (
          <p style={{ color: "green", marginTop: 10, textAlign: "center" }}>
            {successMsg}
          </p>
        )}

        <p style={{ marginTop: 15, textAlign: "center", fontSize: 14 }}>
          Jau turite paskyrą?{" "}
          <a
            href="/auth/log-in"
            style={{ color: "#0070f3", textDecoration: "underline" }}
          >
            Prisijunkite
          </a>
        </p>
      </div>
    </div>
  );
}

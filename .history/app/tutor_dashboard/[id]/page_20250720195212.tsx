"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Calendar, { CalendarProps } from "react-calendar";
import 'react-calendar/dist/Calendar.css';

type Lesson = {
  id: number;
  date: string;
  topic: string;
  student: string;
};

type UserFlags = {
  signed: boolean;
  signed_at: string | null;
};

type TimeSlot = {
  id: number;
  start: string;
  end: string;
  booked: boolean;
};

function TermsPopup({ onAccept }: { onAccept: () => void }) {
  const [agreed, setAgreed] = useState(false);

  const handleAgree = () => {
    if (!agreed) {
      alert("Prašome sutikti su paslaugų teikimo sutartimi.");
      return;
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Paslaugų teikimo sutartis</h2>
        <div className="text-sm text-gray-700 mb-6 whitespace-pre-line">
          <p>Korepetitorius patvirtina, kad sutinka laikytis šių paslaugų teikimo sąlygų:</p>
          <p>1. Korepetitorius įsipareigoja teikti kokybiškas ir laiku vykdomas mokymo paslaugas.</p>
          <p>2. Paslaugų apimtis, trukmė ir kaina yra sutartinai nustatytos.</p>
          <p>3. Ginčų atveju šalys sieks susitarti derybų būdu.</p>
          <p>4. Korepetitorius patvirtina, kad yra susipažinęs su visomis sąlygomis ir jas priima.</p>
        </div>

        <label className="flex items-center space-x-2 mb-6">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="w-5 h-5"
          />
          <span>Sutinku su paslaugų teikimo sutartimi</span>
        </label>

        <div className="flex justify-end">
          <button
            onClick={handleAgree}
            disabled={!agreed}
            className={`px-4 py-2 rounded text-white ${
              agreed ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Sutinku
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TutorDashboard() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showTerms, setShowTerms] = useState(false);
  const [userFlags, setUserFlags] = useState<UserFlags | null>(null);

  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const checkAgreement = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("signed, signed_at")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Klaida tikrinant sutikimą:", error.message);
        return;
      }

      if (!data.signed) setShowTerms(true);
      setUserFlags(data);
    };

    checkAgreement();
  }, []);

  useEffect(() => {
    fetchTimeSlots();
  }, [selectedDate]);

  const fetchTimeSlots = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const { data, error } = await supabase
      .from("availability")
      .select("id, start_time, end_time, is_booked")
      .eq("user_id", user.id)
      .gte("start_time", startOfDay.toISOString())
      .lt("start_time", endOfDay.toISOString())
      .order("start_time");

    if (!error && data) {
      setTimeSlots(
        data.map(slot => ({
          id: slot.id,
          start: new Date(slot.start_time).toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" }),
          end: new Date(slot.end_time).toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" }),
          booked: slot.is_booked,
        }))
      );
    }
  };

  const addAvailability = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dateStr = selectedDate.toISOString().split("T")[0];
    const start = new Date(`${dateStr}T${startTime}`);
    const end = new Date(`${dateStr}T${endTime}`);

    if (start >= end) {
      alert("Pabaigos laikas turi būti vėlesnis nei pradžios.");
      return;
    }

    const { error } = await supabase.from("availability").insert({
      user_id: user.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });

    if (!error) {
      await fetchTimeSlots();
      setStartTime("10:00");
      setEndTime("11:00");
    } else {
      alert("Nepavyko įrašyti prieinamumo: " + error.message);
    }
  };

  const handleDateChange: CalendarProps["onChange"] = (v) => {
    const date = Array.isArray(v) ? v[0] : v;
    if (date instanceof Date) setSelectedDate(date);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("lt-LT");

  const selectedDateStr = selectedDate.toLocaleDateString("lt-LT");

  const lessons: Lesson[] = [
    { id: 1, date: "2025-07-01", topic: "Įvadas į R ir RStudio", student: "Dovydas" },
    { id: 2, date: "2025-07-03", topic: "Statistikos pagrindai", student: "Gabija" },
    { id: 3, date: "2025-07-05", topic: "Excel duomenų analizė", student: "Tomas" },
  ];

  const lessonsOnSelectedDate = lessons.filter(
    lesson => formatDate(lesson.date) === selectedDateStr
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/auth/log-in");
  };

  const goTo = (path: string) => {
    if (id) router.push(`/tutor_dashboard/${id}/${path}`);
  };

  if (showTerms) return <TermsPopup onAccept={checkAgreement} />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sveiki, mokytojau!</h1>
          {userFlags?.signed_at && (
            <p className="text-xs text-gray-500">
              Sutartis pasirašyta: {new Date(userFlags.signed_at).toLocaleDateString("lt-LT")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={() => goTo("sf_form")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Išrašyti sąskaitą</button>
          <button onClick={() => goTo("add_lesson")} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Pridėti pamoką</button>
          <button onClick={() => goTo("grades")} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Pridėti pažymį</button>
          <a
            href="https://drive.google.com/drive/folders/1uBSRCUxunwWaXNIIeAWP8keY1O5wlzm7?usp=share_link"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Resursai
          </a>
          <button onClick={handleLogout} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700">Atsijungti</button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Kalendorius</h2>
          <Calendar onChange={handleDateChange} value={selectedDate} locale="lt-LT" />
        </section>

        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pamokos {selectedDateStr}</h2>
          {lessonsOnSelectedDate.length === 0 ? (
            <p className="text-gray-600">Nėra suplanuotų pamokų šiai dienai.</p>
          ) : (
            <ul className="space-y-3">
              {lessonsOnSelectedDate.map(lesson => (
                <li key={lesson.id} className="border-b border-gray-200 pb-2">
                  <div><strong>Tema:</strong> {lesson.topic}</div>
                  <div><strong>Studentas:</strong> {lesson.student}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded shadow p-6 col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Naujas prieinamumo langas</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
            <div>
              <label className="block text-sm">Nuo</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border rounded p-1" />
            </div>
            <div>
              <label className="block text-sm">Iki</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border rounded p-1" />
            </div>
            <button onClick={addAvailability} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Pridėti</button>
          </div>

          <h3 className="text-md font-semibold mb-2">Esami langai {selectedDateStr}:</h3>
          {timeSlots.length === 0 ? (
            <p className="text-sm text-gray-500">Nėra prieinamumo šiai dienai.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {timeSlots.map(slot => (
                <li key={slot.id} className="flex justify-between items-center border-b pb-1">
                  <span>{slot.start} – {slot.end}</span>
                  {slot.booked ? <span className="text-red-500">Užsakyta</span> : <span className="text-green-600">Laisva</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

export default function TutorDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const lessons = [
    { id: 1, date: "2025-07-01", topic: "Įvadas į R ir RStudio", student: "Dovydas" },
    { id: 2, date: "2025-07-03", topic: "Statistikos pagrindai", student: "Gabija" },
    { id: 3, date: "2025-07-05", topic: "Excel duomenų analizė", student: "Tomas" },
  ];

  // Filtruojame pamokas pagal pasirinkta datą
  const selectedDateISO = selectedDate.toISOString().slice(0, 10);
  const lessonsOnSelectedDate = lessons.filter(lesson => lesson.date === selectedDateISO);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Sveiki, mokytojau!</h1>
        
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Įrašyti sąskaitos faktūrą
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-green-700 transition">
            Pridėti pamoką
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-purple-700 transition">
            Resursai
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Kalendorius */}
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Kalendorius</h2>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
          />
        </section>

        {/* Pamokos pagal pasirinktą dieną */}
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Pamokos {selectedDate.toLocaleDateString("lt-LT")}
          </h2>
          {lessonsOnSelectedDate.length === 0 ? (
            <p>Nėra pamokų šiai dienai.</p>
          ) : (
            <ul>
              {lessonsOnSelectedDate.map(lesson => (
                <li key={lesson.id} className="border-b border-gray-200 py-2">
                  <div><strong>Tema:</strong> {lesson.topic}</div>
                  <div><strong>Studentas:</strong> {lesson.student}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}

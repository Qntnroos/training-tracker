// Card Layout Only: Training Tracker Web App with Save/Load + CSV Export + Improved Styling + Persistent Dark Mode + Selectable Chart

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const defaultSchedule = {
  Monday: ["Bench Press", "Dumbbell Shoulder Press", "Triceps Pushdowns"],
  Tuesday: ["Conventional Deadlift", "Front Squat", "Hamstring Curls"],
  Wednesday: ["4×800m Intervals @ 6:00/km"],
  Thursday: ["Pull-Ups", "Barbell Row", "Bicep Curls"],
  Friday: ["Back Squat", "RDL", "Hip Thrusts"],
  Saturday: ["Long Run: 10–20km @ 6:45–7:00/km"],
  Sunday: ["Recovery Run or Mobility"],
};

const STORAGE_KEY = "trainingLogs";
const MODE_KEY = "darkMode";

export default function TrainingTracker() {
  const motivationalQuotes = [
    "Push yourself, because no one else is going to do it for you.",
    "No pain, no gain.",
    "Success starts with self-discipline.",
    "Don’t limit your challenges, challenge your limits.",
    "The only bad workout is the one that didn’t happen.",
    "Strive for progress, not perfection.",
    "You are stronger than you think.",
    "Consistency is more important than intensity.",
  ];
  const randomQuote =
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const [logs, setLogs] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("");

  useEffect(() => {
    const savedLogs = localStorage.getItem(STORAGE_KEY);
    const savedMode = localStorage.getItem(MODE_KEY);
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedMode) setDarkMode(savedMode === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, darkMode.toString());
  }, [darkMode]);

  const updateLog = (day, exercise, setIndex, field, value) => {
    setLogs(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [exercise]: {
          ...prev[day]?.[exercise],
          [setIndex]: {
            ...prev[day]?.[exercise]?.[setIndex],
            [field]: value,
          },
        },
      },
    }));
  };

  const exportCSV = () => {
    let csv = "Day,Exercise,Set,Weight,Reps\n";
    Object.entries(logs).forEach(([day, exercises]) => {
      Object.entries(exercises).forEach(([exercise, sets]) => {
        Object.entries(sets).forEach(([setIndex, data]) => {
          csv += `${day},${exercise},${parseInt(setIndex) + 1},${
            data.weight || ""
          },${data.reps || ""}\n`;
        });
      });
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "training_log.csv";
    link.click();
  };

  const modeClasses = darkMode
    ? "bg-gray-900 text-white"
    : "bg-white text-gray-900";

  const exerciseOptions = Array.from(
    new Set(Object.values(defaultSchedule).flat())
  );

  const chartData = [];
  Object.entries(logs).forEach(([day, exercises]) => {
    Object.entries(exercises).forEach(([exercise, sets]) => {
      if (!selectedExercise || exercise === selectedExercise) {
        let totalWeight = 0;
        let count = 0;
        Object.values(sets).forEach(set => {
          const weight = parseFloat(set.weight);
          if (!isNaN(weight)) {
            totalWeight += weight;
            count++;
          }
        });
        if (count > 0) {
          chartData.push({
            name: `${day} - ${exercise}`,
            weight: totalWeight / count,
            reps:
              Object.values(sets).reduce((sum, set) => {
                const r = parseFloat(set.reps);
                return !isNaN(r) ? sum + r : sum;
              }, 0) / count,
          });
        }
      }
    });
  });

  return (
    <div
      className={`p-6 max-w-6xl mx-auto font-sans min-h-screen transition ${modeClasses}`}
    >
      <div className="mb-4 text-center italic text-lg text-purple-600 dark:text-purple-300">
        "{randomQuote}"
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
          💪 Training Tracker
        </h1>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <span className="text-sm">Dark Mode</span>
        </label>
      </div>

      <div className="text-center mb-8">
        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          ⬇️ Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow mb-10">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">
          📈 Average Weight Per Exercise
        </h2>

        <div className="mb-4 text-center">
          <select
            value={selectedExercise}
            onChange={e => setSelectedExercise(e.target.value)}
            className="px-3 py-1 rounded border dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Exercises</option>
            {exerciseOptions.map(ex => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-30}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={true}
            />
            <Line
              type="monotone"
              dataKey="reps"
              stroke="#10B981"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {Object.entries(defaultSchedule).map(([day, exercises]) => (
        <div
          key={day}
          className="mb-10 border rounded-xl p-5 shadow-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-4 border-b pb-1 border-gray-300 dark:border-gray-600">
            {day}
          </h3>
          {exercises.map(exercise => (
            <div key={exercise} className="mb-5">
              <h4 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">
                {exercise}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[0, 1, 2, 3].map(setIndex => (
                  <div key={setIndex} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Set ${setIndex + 1} Weight (kg)`}
                      className="w-1/2 border rounded px-2 py-1 text-sm focus:ring focus:border-blue-300 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={logs[day]?.[exercise]?.[setIndex]?.weight || ""}
                      onChange={e =>
                        updateLog(
                          day,
                          exercise,
                          setIndex,
                          "weight",
                          e.target.value
                        )
                      }
                    />
                    <input
                      type="text"
                      placeholder={`Set ${setIndex + 1} Reps`}
                      className="w-1/2 border rounded px-2 py-1 text-sm focus:ring focus:border-blue-300 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={logs[day]?.[exercise]?.[setIndex]?.reps || ""}
                      onChange={e =>
                        updateLog(
                          day,
                          exercise,
                          setIndex,
                          "reps",
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

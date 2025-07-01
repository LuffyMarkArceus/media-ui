import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../components/topnav";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HealthInfo {
  cpu_usage: string;
  db_status: string;
  ram_available: string;
  ram_total: string;
  ram_used: string;
  status: string;
  timestamp: string;
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function Health() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [data, setData] = useState<HealthInfo>();
  const [history, setHistory] = useState<
    { time: string; cpu: number; ram: number }[]
  >([]);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) {
      navigate("/");
    }
  }, [user, navigate]);

  // Periodic health polling
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/health`);
        const json = await res.json();
        setData(json);

        const timestamp = new Date().toLocaleTimeString();
        const newEntry = {
          time: timestamp,
          cpu: parseFloat(json.cpu_usage.replace("%", "")),
          ram: parseFloat(json.ram_used.replace(" GB", "")),
        };
        setHistory((prev) => [...prev.slice(-19), newEntry]);
      } catch (err) {
        console.error("Health fetch failed", err);
      }
    };

    fetchHealth(); // Initial fetch
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="text-center mt-10 text-xl">Loading health metrics...</div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <TopNav />
      </div>

      <h1 className="text-2xl font-bold mb-6">Server Health</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded shadow">
          <p className="font-semibold">CPU Usage</p>
          <p>{data.cpu_usage}</p>
        </div>
        <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded shadow">
          <p className="font-semibold">RAM Used</p>
          <p>
            {data.ram_used} / {data.ram_total}
          </p>
        </div>
        <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded shadow">
          <p className="font-semibold">DB Status</p>
          <p>{data.db_status}</p>
        </div>
        <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded shadow">
          <p className="font-semibold">Snapshot Time</p>
          <p>{data.timestamp.replace("T", " ")}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">CPU & RAM Usage Over Time</h2>
      <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded shadow">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="cpu"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorCpu)"
              name="CPU %"
            />
            <Area
              type="monotone"
              dataKey="ram"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorRam)"
              name="RAM GB"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// pages/Home.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { DarkModeSwitch } from "@/components/DarkModeSwitch";

interface VideoMeta {
  name: string;
  size: number;
  path: string;
  type: string;
}

export default function Home() {
  const [videos, setVideos] = useState<VideoMeta[]>([]);

  useEffect(() => {
    axios.get("/api/media").then((res) => {
      setVideos(res.data);
      console.log("Fetched videos:", res.data);
    });
  }, []);

  return (
    <div className="min-h-screen p-4 bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Video Library</h1>
        <DarkModeSwitch />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {videos.map((video) => (
          <Link
            to={`/video/${encodeURIComponent(video.path)}`}
            key={video.path}
            className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700"
          >
            <img
              src={`/api/thumbnail/${encodeURIComponent(video.path)}`}
              alt={video.name}
              className="w-full h-32 object-cover"
            />
            <div className="p-2">
              <div className="font-semibold text-sm truncate">{video.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(video.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

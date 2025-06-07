// src/pages/VideoPage.tsx
import { useParams } from "react-router-dom";
import { VideoPlayer } from "../components/VideoPlayer";
import { DarkModeSwitch } from "@/components/DarkModeSwitch";

export default function VideoPage() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen p-4 bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Now Playing</h2>
        <DarkModeSwitch />
      </div>

      <h3 className="text-base mb-4 text-gray-700 dark:text-gray-300 truncate">
        {slug}
      </h3>

      <VideoPlayer src={`/api/media/${slug}`} title={slug} />
    </div>
  );
}

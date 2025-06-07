// src/pages/VideoPage.tsx
import { useParams } from "react-router-dom";
import { VideoPlayer } from "../components/VideoPlayer";
import { TopNav } from "../components/topnav";

export default function VideoPage() {
  const { slug } = useParams();

  const arr = slug?.split("\\") ?? [];
  const name = arr[arr.length - 1];

  return (
    <div className="min-h-screen p-4 bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
      <div>
        <TopNav />
      </div>

      <h3 className="font-bold ml-125 mt-4 text-base mb-4 text-gray-700 dark:text-gray-300 truncate">
        {name}
      </h3>

      <VideoPlayer src={`/api/media/${slug}`} title={name} />
    </div>
  );
}

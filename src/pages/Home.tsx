import { useEffect, useState } from "react";
import axios from "axios";
import { TopNav } from "../components/topnav";
import { VideoCard } from "../components/VideoCard";

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
    });
  }, []);

  return (
    <div className="min-h-screen p-4 bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <TopNav />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.path} video={video} />
        ))}
      </div>
    </div>
  );
}

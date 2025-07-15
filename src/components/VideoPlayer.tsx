import { useRef, useEffect } from "react";
import Hls from "hls.js";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

interface VideoPlayerProps {
  videoSrc: string;
  subtitleSrc?: string; // Make it optional
  onEnded?: () => void;
}

export function VideoPlayer({
  videoSrc,
  subtitleSrc,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // const [hasSubtitle, setHasSubtitle] = useState(false);

  console.log(videoSrc);
  useEffect(() => {
    if (Hls.isSupported() && videoRef.current && subtitleSrc) {
      const hls = new Hls();
      hls.loadSource(subtitleSrc);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    } else if (videoRef.current && subtitleSrc) {
      videoRef.current.src = subtitleSrc;
    }
  }, [subtitleSrc]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <MediaPlayer
        aspectRatio="16/9"
        src={{ src: videoSrc, type: "video/mp4" }}
        className="aspect-video w-full rounded-lg overflow-hidden border border-gray-300 dark:border-zinc-700 shadow-md dark:shadow-lg bg-white dark:bg-zinc-800"
        onEnded={onEnded}
      >
        <MediaProvider>
          {subtitleSrc !== "" && (
            <track
              kind="subtitles"
              src={subtitleSrc}
              srcLang="en"
              label="English"
              default
            />
          )}
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}

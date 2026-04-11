"use client";

import ReactPlayer from "react-player";

interface VideoPlayerProps {
  videoId: string;
  onComplete: () => void;
}

export default function VideoPlayer({ videoId, onComplete }: VideoPlayerProps) {
  const handleProgress = (state: { played: number }) => {
    // Trigger complete when 90% of the video is watched
    if (state.played > 0.9) {
      onComplete();
    }
  };

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()} 
      className="relative w-full rounded-lg overflow-hidden border bg-black shadow-md"
    >
      <ReactPlayer
        url={`https://www.youtube.com/watch?v=${videoId}`}
        controls
        width="100%"
        height="500px"
        config={{
          youtube: {
            playerVars: {
              modestbranding: 1,
              rel: 0,
              fs: 1,
            },
          },
        }}
        onProgress={handleProgress}
        style={{ backgroundColor: "black" }}
      />
    </div>
  );
}

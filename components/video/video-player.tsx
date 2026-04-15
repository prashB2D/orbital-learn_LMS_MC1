"use client";

import { useRef, useEffect, useState } from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  contentId: string;
  enrollmentId: string;
  videoId: string;
  duration: number; // in seconds
  lastWatchedTime: number; // in seconds
  onComplete: () => void;
  onReadyToComplete: (ready: boolean) => void;
}

export default function VideoPlayer({ 
  contentId, 
  enrollmentId, 
  videoId, 
  duration, 
  lastWatchedTime,
  onComplete,
  onReadyToComplete
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const [playedSeconds, setPlayedSeconds] = useState(lastWatchedTime);
  const [hasTriggeredComplete, setHasTriggeredComplete] = useState(false);
  const syncInterval = useRef<NodeJS.Timeout | null>(null);

  // Sync to database
  const syncProgress = async (time: number) => {
    try {
      await fetch(`/api/content/${contentId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId, lastWatchedTime: time }),
      });
    } catch (err) {
      console.error("Failed to sync progress");
    }
  };

  // Start at last watched time
  const handleReady = () => {
    if (lastWatchedTime > 0 && playerRef.current) {
      playerRef.current.seekTo(lastWatchedTime, 'seconds');
    }
  };

  useEffect(() => {
    const requiredTime = duration > 0 ? duration * 0.8 : 0;
    if (lastWatchedTime >= requiredTime && !hasTriggeredComplete) {
      setHasTriggeredComplete(true);
      onReadyToComplete(true);
    }
  }, [duration, lastWatchedTime, hasTriggeredComplete, onReadyToComplete]);

  const handleProgress = (state: { playedSeconds: number }) => {
    setPlayedSeconds(state.playedSeconds);

    const requiredTime = duration > 0 ? duration * 0.8 : 0;
    if (state.playedSeconds >= requiredTime && !hasTriggeredComplete) {
      setHasTriggeredComplete(true);
      onReadyToComplete(true);
    }
  };

  // Sync optimally
  const handlePause = () => {
    syncProgress(playedSeconds);
  };

  const handleEnded = () => {
    syncProgress(playedSeconds);

    if (!hasTriggeredComplete) {
      setHasTriggeredComplete(true);
      onReadyToComplete(true);
    }

    onComplete();
  };

  useEffect(() => {
    // Sync every 30 seconds to minimize bandwidth
    syncInterval.current = setInterval(() => {
      if (playedSeconds > 0) {
        syncProgress(playedSeconds);
      }
    }, 30000);

    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, [playedSeconds]);

  // Reset states when content changes
  useEffect(() => {
    setHasTriggeredComplete(false);
    onReadyToComplete(false);
    setPlayedSeconds(lastWatchedTime);
  }, [contentId, lastWatchedTime, onReadyToComplete]);

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()} 
      className="relative w-full rounded-lg overflow-hidden border bg-black shadow-md"
    >
      <ReactPlayer
        ref={playerRef}
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
        onReady={handleReady}
        onProgress={handleProgress}
        onPause={handlePause}
        onEnded={handleEnded}
        progressInterval={1000}
        style={{ backgroundColor: "black" }}
      />
    </div>
  );
}

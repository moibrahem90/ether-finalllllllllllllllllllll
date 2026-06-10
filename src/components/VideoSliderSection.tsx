"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useVideos from "@/hooks/useVideos";

export default function VideoSliderSection() {
  const { videos, loading } = useVideos();
  const [centerIndex, setCenterIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Play all videos simultaneously
  useEffect(() => {
    const vids = document.querySelectorAll(".slider-video");
    vids.forEach((vid) => {
      if (vid instanceof HTMLVideoElement) {
        vid.play().catch(() => {});
      }
    });
  }, [centerIndex, videos]);

  const goPrev = () => setCenterIndex((p) => Math.max(0, p - 1));
  const goNext = () => setCenterIndex((p) => Math.min(videos.length - 1, p + 1));

  if (loading) {
    return (
      <section className="py-24 bg-[#faf9f7] flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-[#c9a96e] animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </section>
    );
  }

  if (!videos || videos.length === 0) return null;

  // Build a window of up to 3 videos centered on centerIndex
  const getWindow = () => {
    if (videos.length === 1) return [{ video: videos[0], pos: "center" as const }];
    if (videos.length === 2) {
      if (centerIndex === 0)
        return [
          { video: videos[0], pos: "center" as const },
          { video: videos[1], pos: "right" as const },
        ];
      return [
        { video: videos[0], pos: "left" as const },
        { video: videos[1], pos: "center" as const },
      ];
    }
    // 3+ videos
    const left = centerIndex > 0 ? videos[centerIndex - 1] : null;
    const center = videos[centerIndex];
    const right = centerIndex < videos.length - 1 ? videos[centerIndex + 1] : null;
    const result = [];
    if (left) result.push({ video: left, pos: "left" as const });
    result.push({ video: center, pos: "center" as const });
    if (right) result.push({ video: right, pos: "right" as const });
    return result;
  };

  const window3 = getWindow();

  const posStyles = {
    left: {
      wrapper: "flex-shrink-0 w-[28%] opacity-60 scale-95 cursor-pointer transition-all duration-500 hover:opacity-75",
      inner: "rounded-2xl overflow-hidden border border-stone-200 shadow-md aspect-[9/16] bg-stone-900",
    },
    center: {
      wrapper: "flex-shrink-0 w-[40%] opacity-100 scale-100 z-10 cursor-default transition-all duration-500",
      inner: "rounded-3xl overflow-hidden border-2 border-[#d4a84b]/60 shadow-[0_8px_48px_rgba(212,168,75,0.25)] aspect-[9/16] bg-stone-900 ring-4 ring-[#d4a84b]/20",
    },
    right: {
      wrapper: "flex-shrink-0 w-[28%] opacity-60 scale-95 cursor-pointer transition-all duration-500 hover:opacity-75",
      inner: "rounded-2xl overflow-hidden border border-stone-200 shadow-md aspect-[9/16] bg-stone-900",
    },
  };

  return (
    <section className="py-24 bg-[#faf9f7] overflow-hidden">
      {/* Header */}
      <div className="text-center mb-14 px-4">
        <p
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.25em" }}
          className="text-xs text-[#c9a96e] uppercase mb-3"
        >
          OUR RITUALS
        </p>
        <h2
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-4xl md:text-5xl font-normal text-stone-900"
        >
          See It Come to Life
        </h2>
      </div>

      {/* 3-up video row */}
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-center gap-4">
          {window3.map(({ video, pos }, idx) => {
            const isCenter = pos === "center";
            const actualIndex = isCenter
              ? centerIndex
              : pos === "left"
              ? centerIndex - 1
              : centerIndex + 1;
            return (
              <div
                key={video.id}
                className={posStyles[pos].wrapper}
                onClick={() => !isCenter && setCenterIndex(actualIndex)}
              >
                <div className={posStyles[pos].inner}>
                  <video
                    ref={(el) => { videoRefs.current[actualIndex] = el; }}
                    src={video.url}
                    className="w-full h-full object-cover slider-video"
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                    poster={video.thumbnail ?? ""}
                  />
                  {/* Label overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                    <p
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      className={`text-white font-medium truncate ${isCenter ? "text-lg" : "text-sm"}`}
                    >
                      {video.title}
                    </p>
                    {isCenter && video.description && (
                      <p className="text-white/70 text-xs mt-1 line-clamp-2">{video.description}</p>
                    )}
                  </div>
                </div>
                {isCenter && (
                  <p
                    className="text-center text-xs text-[#c9a96e] mt-3 uppercase tracking-widest font-bold"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    Now Playing
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation arrows */}
        {centerIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-600 hover:bg-[#f5e6c0] hover:text-[#a07828] hover:border-[#d4a84b]/40 transition-all z-20"
            aria-label="Previous video"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {centerIndex < videos.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-600 hover:bg-[#f5e6c0] hover:text-[#a07828] hover:border-[#d4a84b]/40 transition-all z-20"
            aria-label="Next video"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {videos.length > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {videos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCenterIndex(i)}
              aria-label={`Go to video ${i + 1}`}
              className={`rounded-full border-none cursor-pointer p-0 transition-all duration-300 ${
                i === centerIndex
                  ? "w-6 h-2 bg-[#c9a96e]"
                  : "w-2 h-2 bg-stone-300 hover:bg-stone-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
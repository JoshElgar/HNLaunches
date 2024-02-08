"use client";
import React, { useEffect, useState, useRef } from "react";
import launchData from "./data/launch_hn_responses.json";

type LaunchData = {
  points: number;
  created_at: string;
  title: string;
  story_id: number;
  color?: string;
}[];

interface Square extends Omit<LaunchData[number], "color"> {
  color: string;
}

const CommitGraph: React.FC = () => {
  const [squares, setSquares] = useState<Square[]>([]);
  const [tooltip, setTooltip] = useState<{
    story_id: number;
    title: string;
    points: number;
    created_at: string;
    x: number;
    y: number;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [percentile95thScore, setPercentile95thScore] = useState<number>(0);

  useEffect(() => {
    // Sort the launch data by created_at in descending order to get the latest 900 objects
    const sortedLaunchData = [...(launchData as LaunchData)]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 900)
      .reverse();

    // Calculate the 95th percentile score
    const pointsScores = sortedLaunchData.map((item) => item.points);
    const calculatedPercentile95thScore = pointsScores.sort((a, b) => a - b)[
      Math.floor(0.95 * pointsScores.length) - 1
    ];
    setPercentile95thScore(calculatedPercentile95thScore);

    // Filter out the top 5% data points and calculate logarithmic scaling for the rest
    const filteredLaunchData = sortedLaunchData.filter(
      (item) => item.points <= calculatedPercentile95thScore
    );
    const logPoints = filteredLaunchData.map((item) => Math.log1p(item.points));
    const maxLogPoints = Math.max(...logPoints);

    const loadedSquares: Square[] = sortedLaunchData.map((item) => {
      if (item.points > calculatedPercentile95thScore) {
        // Create a sexy gold gradient for top 5% data points
        const gradient = `linear-gradient(to top, #ffcc00, #ffd700, #ff9900, #ffcc00, #ffd700)`;
        return { ...item, color: gradient };
      } else {
        // Find the index in the filtered array for logarithmic scaling
        const index = filteredLaunchData.findIndex(
          (filteredItem) => filteredItem.story_id === item.story_id
        );
        const saturation = (item.points / calculatedPercentile95thScore) * 100;
        const boundedSaturation = Math.min(saturation, 100); // Ensure saturation does not exceed 100%
        const color = `hsl(24, ${boundedSaturation}%, 50%)`;
        return { ...item, color };
      }
    });

    setSquares(loadedSquares);
  }, []);

  const renderKey = () => {
    const keyItems = [
      { label: "50th percentile", color: "hsl(24, 50%, 50%)" },
      { label: "95th percentile", color: "hsl(24, 100%, 50%)" },
      {
        label: "Above 95th percentile",
        color:
          "linear-gradient(to top, #ffcc00, #ffd700, #ff9900, #ffcc00, #ffd700)",
      },
    ];

    return (
      <div className="key flex flex-wrap justify-center">
        {keyItems.map((item) => (
          <div
            className="key-item flex flex-row sm:flex-row items-center m-2"
            key={item.label}
          >
            <div
              className="key-color w-4 h-4 sm:w-8 sm:h-8 rounded-sm m-2"
              style={{ background: item.color }}
            ></div>
            <div className="key-label text-sm sm:mt-0 sm:ml-2">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div
        ref={gridRef}
        className="relative grid gap-2 mb-8"
        style={{
          maxWidth: "1500px",
          gridTemplateColumns: "repeat(40, minmax(0, 1fr))",
        }}
        onMouseLeave={() => setTooltip(null)}
      >
        {squares.map((square) => (
          <a
            key={square.story_id}
            href={`https://news.ycombinator.com/item?id=${square.story_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-2 h-2 sm:w-4 sm:h-4 rounded-sm relative block"
            style={{ backgroundColor: square.color, background: square.color }}
            onMouseEnter={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setTooltip({
                story_id: square.story_id,
                title: square.title,
                points: square.points,
                created_at: square.created_at,
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY,
              });
            }}
            // onMouseLeave={() => setTooltip(null)}
          />
        ))}
        {tooltip && gridRef.current && (
          <div
            className="absolute w-auto p-2 text-white bg-black rounded z-20"
            style={{
              left: tooltip.x - gridRef.current.offsetLeft,
              top: tooltip.y - gridRef.current.offsetTop,
              transform: "translate(-50%, -100%)",
              whiteSpace: "nowrap",
              opacity: 0.9,
              zIndex: 10,
              pointerEvents: "none", // Added to prevent the tooltip from blocking hover events
            }}
          >
            <div>{tooltip.title}</div>
            <div>Points: {tooltip.points}</div>
            <div>Date: {new Date(tooltip.created_at).toLocaleDateString()}</div>
          </div>
        )}
      </div>
      {renderKey()}
    </>
  );
};

export default CommitGraph;

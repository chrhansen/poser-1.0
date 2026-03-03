// Deterministic mock metric generators for analysis results
import type { AnalysisMetrics } from "@/lib/types";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateMockMetrics(frameCount: number, seed = 42): AnalysisMetrics {
  const rand = seededRandom(seed);

  // Shin parallel
  const shinParallel = Array.from({ length: frameCount }, (_, i) => ({
    frame: i,
    shinAngle: 5 + rand() * 20,
    parallelismScore: Math.round(60 + rand() * 40),
  }));

  // COM
  const com = Array.from({ length: frameCount }, (_, i) => ({
    frame: i,
    x: -0.5 + Math.sin(i * 0.3) * 1.2 + rand() * 0.1,
    y: 0.9 + Math.sin(i * 0.15) * 0.15 + rand() * 0.05,
    z: i * 0.08 + rand() * 0.05,
  }));

  // Angulation
  const angulation = Array.from({ length: frameCount }, (_, i) => {
    const signed = Math.sin(i * 0.4) * 18 + rand() * 4;
    return { frame: i, absolute: Math.abs(signed), signed: Math.round(signed * 10) / 10 };
  });

  // Counter
  const counter = Array.from({ length: frameCount }, (_, i) => {
    const signed = Math.cos(i * 0.35) * 14 + rand() * 3;
    return { frame: i, absolute: Math.abs(signed), signed: Math.round(signed * 10) / 10 };
  });

  // Angulation vs Inclination
  const angulationVsInclination = Array.from({ length: frameCount }, (_, i) => {
    const lower = 8 + Math.sin(i * 0.4) * 12 + rand() * 3;
    const upper = 4 + Math.sin(i * 0.4 + 0.5) * 8 + rand() * 2;
    return {
      frame: i,
      lowerBodyLean: Math.round(lower * 10) / 10,
      upperBodyLean: Math.round(upper * 10) / 10,
      difference: Math.round((lower - upper) * 10) / 10,
      ratio: upper !== 0 ? Math.round((lower / upper) * 100) / 100 : 0,
    };
  });

  // Turn segments — roughly 1 turn every ~8 frames
  const turnCount = Math.max(2, Math.floor(frameCount / 8));
  const framesPerTurn = Math.floor(frameCount / turnCount);
  const turnSegments = Array.from({ length: turnCount }, (_, i) => ({
    id: `turn_${i + 1}`,
    direction: (i % 2 === 0 ? "left" : "right") as "left" | "right",
    startFrame: i * framesPerTurn,
    endFrame: Math.min((i + 1) * framesPerTurn - 1, frameCount - 1),
    apexFrame: i * framesPerTurn + Math.floor(framesPerTurn / 2),
    durationMs: Math.round((framesPerTurn / 30) * 1000 + rand() * 200),
  }));

  // Edge similarity
  const leftTurns = turnSegments.filter((t) => t.direction === "left");
  const rightTurns = turnSegments.filter((t) => t.direction === "right");
  const turnScores = turnSegments.map((t) => ({
    turnId: t.id,
    score: Math.round(65 + rand() * 30),
  }));
  const leftAvg = leftTurns.length > 0
    ? Math.round(turnScores.filter((s) => s.turnId.endsWith(String(leftTurns.findIndex((l) => `turn_${leftTurns.indexOf(l) * 2 + 1}` === s.turnId) + 1)) || true).reduce((a, b) => a + b.score, 0) / turnScores.length)
    : 0;

  const allScores = turnScores.map((s) => s.score);
  const overall = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  const edgeSimilarity = {
    overall,
    left: Math.round(overall + (rand() - 0.5) * 8),
    right: Math.round(overall - (rand() - 0.5) * 8),
    perTurn: turnScores,
  };

  // Turn cadence
  const turnCadence = {
    tpmMedian: Math.round((12 + rand() * 8) * 10) / 10,
    tpmPeak6: Math.round((16 + rand() * 6) * 10) / 10,
    turnDurationCv: Math.round(rand() * 0.3 * 100) / 100,
  };

  return {
    shinParallel,
    com,
    angulation,
    counter,
    angulationVsInclination,
    turnSegments,
    edgeSimilarity,
    turnCadence,
  };
}

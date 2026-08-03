const BOUNDARY_IDLE_MS = 320;
const GESTURE_WINDOW_MS = 650;
const INTENT_THRESHOLD = 120;

type WheelBoundaryIntentOptions = {
  atBoundary: () => boolean;
  direction: "down" | "up";
  onIntent: () => void;
};

export function createWheelBoundaryIntent({
  atBoundary,
  direction,
  onIntent,
}: WheelBoundaryIntentOptions) {
  const directionSign = direction === "down" ? 1 : -1;
  let lastWheelAt = performance.now();
  let gestureStartedAt: number | null = null;
  let gestureDelta = 0;

  const resetGesture = () => {
    gestureStartedAt = null;
    gestureDelta = 0;
  };

  return (event: WheelEvent) => {
    const now = performance.now();
    const idleSincePreviousEvent = now - lastWheelAt;
    const directionalDelta = event.deltaY * directionSign;
    lastWheelAt = now;

    if (event.ctrlKey || directionalDelta <= 0 || !atBoundary()) {
      resetGesture();
      return;
    }

    if (
      gestureStartedAt !== null &&
      (now - gestureStartedAt > GESTURE_WINDOW_MS || idleSincePreviousEvent > GESTURE_WINDOW_MS)
    ) {
      resetGesture();
    }

    if (gestureStartedAt === null) {
      if (idleSincePreviousEvent < BOUNDARY_IDLE_MS) return;
      gestureStartedAt = now;
    }

    event.preventDefault();
    gestureDelta += directionalDelta;
    if (gestureDelta < INTENT_THRESHOLD) return;

    resetGesture();
    onIntent();
  };
}

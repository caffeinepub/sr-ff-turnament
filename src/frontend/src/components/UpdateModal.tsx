import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface UpdateModalProps {
  onUpdate: () => void;
  onLater: () => void;
}

export default function UpdateModal({ onUpdate, onLater }: UpdateModalProps) {
  const [phase, setPhase] = useState<"available" | "downloading" | "done">(
    "available",
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== "downloading") return;

    // Simulate Play Store download progress
    const steps = [
      { target: 15, delay: 200 },
      { target: 32, delay: 400 },
      { target: 55, delay: 600 },
      { target: 72, delay: 400 },
      { target: 88, delay: 500 },
      { target: 96, delay: 300 },
      { target: 100, delay: 400 },
    ];

    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const step of steps) {
      elapsed += step.delay;
      const t = setTimeout(() => {
        setProgress(step.target);
        if (step.target === 100) {
          setTimeout(() => setPhase("done"), 600);
        }
      }, elapsed);
      timers.push(t);
    }

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") {
      const t = setTimeout(() => onUpdate(), 800);
      return () => clearTimeout(t);
    }
  }, [phase, onUpdate]);

  const handleUpdateClick = () => {
    setPhase("downloading");
    setProgress(0);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="update-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end justify-center"
        style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)" }}
        data-ocid="update.modal"
      >
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="relative w-full max-w-md rounded-t-3xl overflow-hidden pb-safe"
          style={{
            background: "linear-gradient(180deg, #111827 0%, #0d1117 100%)",
            border: "1px solid rgba(249,115,22,0.25)",
            borderBottom: "none",
            boxShadow: "0 -20px 60px rgba(0,0,0,0.8)",
          }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div
              className="w-10 h-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)" }}
            />
          </div>

          <div className="px-6 pb-8 pt-2">
            {/* App info row */}
            <div className="flex items-center gap-4 mb-6">
              {/* App icon */}
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{
                  boxShadow: "0 0 24px rgba(249,115,22,0.5)",
                  border: "2px solid rgba(249,115,22,0.4)",
                }}
              >
                <img
                  src="/assets/uploads/sr_ff_tournament_icon_512-1.png"
                  alt="SR-FF-TURNAMENT"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.style.display = "none";
                    if (t.parentElement)
                      t.parentElement.innerHTML =
                        '<span style="font-size:2.5rem">🔥</span>';
                  }}
                />
              </div>

              {/* App name + badge */}
              <div className="flex-1 min-w-0">
                <h2
                  className="font-black text-lg leading-tight"
                  style={{
                    background: "linear-gradient(90deg, #f97316, #fbbf24)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  SR-FF-TURNAMENT
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  SR Technology Pvt Ltd
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(249,115,22,0.15)",
                      border: "1px solid rgba(249,115,22,0.35)",
                      color: "#f97316",
                    }}
                  >
                    ✨ Update Available
                  </span>
                </div>
              </div>
            </div>

            {/* What's New box */}
            {phase === "available" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 mb-5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
                  style={{ color: "#f59e0b" }}
                >
                  Naya Kya Hai
                </p>
                <ul className="space-y-2">
                  {[
                    { icon: "🚀", text: "Naye features add kiye gaye" },
                    { icon: "⚡", text: "Faster loading & smooth experience" },
                    { icon: "🐛", text: "Bugs fix kiye gaye" },
                  ].map((item) => (
                    <li
                      key={item.text}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "rgba(255,255,255,0.75)" }}
                    >
                      <span className="text-base leading-none">
                        {item.icon}
                      </span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Download progress */}
            {(phase === "downloading" || phase === "done") && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {phase === "done"
                      ? "✅ Update Complete!"
                      : "⏬ Downloading update..."}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#f97316" }}
                  >
                    {progress}%
                  </span>
                </div>

                {/* Progress bar — Play Store style */}
                <div
                  className="w-full h-3 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #f97316, #fbbf24, #f97316)",
                      backgroundSize: "200% 100%",
                    }}
                    animate={{
                      width: `${progress}%`,
                      backgroundPosition:
                        progress < 100 ? ["0% 0%", "100% 0%"] : "0% 0%",
                    }}
                    transition={{
                      width: { duration: 0.4, ease: "easeOut" },
                      backgroundPosition: {
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 1.5,
                        ease: "linear",
                      },
                    }}
                  />
                </div>

                {phase === "done" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-center mt-3"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    App reload ho raha hai...
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Buttons */}
            {phase === "available" && (
              <div className="flex flex-col gap-3">
                <motion.button
                  type="button"
                  onClick={handleUpdateClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-2xl font-black text-lg text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)",
                    boxShadow:
                      "0 0 30px rgba(34,197,94,0.45), 0 8px 20px rgba(0,0,0,0.3)",
                    letterSpacing: "0.03em",
                  }}
                  data-ocid="update.update_button"
                >
                  ⬇️ Update Karo
                </motion.button>

                <button
                  type="button"
                  onClick={onLater}
                  className="w-full py-3 rounded-2xl font-semibold text-sm transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  data-ocid="update.later_button"
                >
                  Baad Mein
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

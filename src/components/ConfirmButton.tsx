import { useEffect, useState, type ReactNode } from "react";

/** Zweistufiger Button statt window.confirm() (funktioniert auch in eingebetteten Ansichten). */
export function ConfirmButton({ className = "btn", confirmLabel, onConfirm, children }: { className?: string; confirmLabel: string; onConfirm: () => void; children: ReactNode }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      className={`${className}${armed ? " danger" : ""}`}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}

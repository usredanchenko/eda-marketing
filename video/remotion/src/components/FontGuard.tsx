import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";
import { TOKENS } from "../brand";
import { ensureFonts } from "../fonts";

/**
 * Holds rendering until every brand font face is actually loaded, and fails the render if one is missing,
 * so a silent fallback font can never end up in a video.
 * document.fonts.check() is not enough — it returns true for unknown families — so loaded FontFaces are inspected.
 */
export const FontGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handle] = useState(() => delayRender("FontGuard: brand fonts"));
  useEffect(() => {
    ensureFonts()
      .then(() => document.fonts.ready)
      .then(() => {
        const loaded = new Set<string>();
        document.fonts.forEach((f) => {
          if (f.status === "loaded") loaded.add(`${f.family.replace(/"/g, "")}|${f.weight}`);
        });
        const missing = Object.values(TOKENS)
          .flatMap((t) => t.fonts.files.map((f) => `${f.family}|${f.weight}`))
          .filter((k) => !loaded.has(k));
        if (missing.length) cancelRender(new Error(`Brand fonts not loaded (fallback would render): ${[...new Set(missing)].join(", ")}`));
        else continueRender(handle);
      })
      .catch((err: unknown) => cancelRender(err as Error));
  }, [handle]);
  return <>{children}</>;
};

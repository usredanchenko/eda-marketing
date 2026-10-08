import { CanvasImage, staticFile, useVideoConfig } from "remotion";
import { useBrand } from "../brand";

/**
 * Simple device frame around a REAL screenshot (Real UI first): no fake titanium render,
 * soft shadow, brand corner radius. Children are overlays inside the screen (highlights, callouts).
 */
export const PhoneFrame: React.FC<{ src: string; width: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ src, width, style, children }) => {
  const c = useBrand();
  const { fps } = useVideoConfig();
  const ratio = 2622 / 1206;
  const r = c.t.radii.phone ?? 64;
  const bezel = Math.round(width * 0.022);
  return (
    <div
      style={{
        position: "relative",
        width,
        height: Math.round(width * ratio),
        borderRadius: r,
        padding: bezel,
        background: "#0b0b0e",
        boxShadow: "0 40px 120px rgba(0,0,0,.55), 0 0 0 2px rgba(255,255,255,.06)",
        ...style,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: r - bezel, overflow: "hidden" }}>
        <CanvasImage src={staticFile(src)} premountFor={fps} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {children}
      </div>
    </div>
  );
};

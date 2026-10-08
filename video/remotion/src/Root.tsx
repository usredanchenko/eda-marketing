import { FORMATS, VideoProps, type VideoProps as VideoPropsT } from "@mos/core";
import { Composition, Folder, type CalculateMetadataFunction } from "remotion";
import { EXAMPLE_SIZES, EXAMPLE_VARIANTS, ExampleAsset, ExampleAssetProps } from "./examples/ExampleAssets";
import { FIXTURES } from "./fixtures";
import { ensureFonts } from "./fonts";
import { PACKAGES } from "./generated/registry";
import { SceneTimeline } from "./templates/SceneTimeline";

// Explicit call (not a side-effect import): brand fonts start loading before any composition renders.
void ensureFonts();

/** Duration, size and fps come from props, so every format and every package uses the same component. */
const calculateMetadata: CalculateMetadataFunction<VideoPropsT> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.round(props.durationSec * props.fps)),
  fps: props.fps,
  width: FORMATS[props.format].width,
  height: FORMATS[props.format].height,
});

const comp = (id: string, props: VideoPropsT) => (
  <Composition
    key={id}
    id={id}
    component={SceneTimeline}
    schema={VideoProps}
    defaultProps={props}
    calculateMetadata={calculateMetadata}
    durationInFrames={Math.max(1, Math.round(props.durationSec * props.fps))}
    fps={props.fps}
    width={FORMATS[props.format].width}
    height={FORMATS[props.format].height}
  />
);

export const RemotionRoot: React.FC = () => (
  <>
    {[...new Set(PACKAGES.map((p) => p.props.brand))].sort().map((brand) => (
      <Folder key={brand} name={brand}>
        {PACKAGES.filter((p) => p.props.brand === brand).map((p) => comp(`${p.id}-${p.format}`, p.props))}
      </Folder>
    ))}
    <Folder name="fixtures">{FIXTURES.map((f) => comp(f.id, f.props))}</Folder>
    <Folder name="example-assets">
      {EXAMPLE_VARIANTS.map((v) => (
        <Composition key={v} id={`example-${v}`} component={ExampleAsset} schema={ExampleAssetProps} defaultProps={{ variant: v, brand: "acme-focus" }} durationInFrames={1} fps={30} width={EXAMPLE_SIZES[v][0]} height={EXAMPLE_SIZES[v][1]} />
      ))}
    </Folder>
  </>
);

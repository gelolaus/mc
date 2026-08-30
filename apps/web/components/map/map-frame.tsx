import { GuiPanel } from '../gui/gui-panel';
import { ItemFrame } from '../gui/item-frame';

export function MapFrame() {
  const url = process.env.NEXT_PUBLIC_WORLD_MAP_URL;
  return (
    <GuiPanel>
      <ItemFrame className="map-frame-wrap">
        {url ? (
          <iframe title="Interactive world map" src={url} className="map-frame" />
        ) : (
          <div className="map-placeholder pixel">Map coming soon</div>
        )}
      </ItemFrame>
    </GuiPanel>
  );
}

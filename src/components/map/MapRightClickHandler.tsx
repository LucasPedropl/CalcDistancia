import { useMapEvents } from 'react-leaflet';

interface MapRightClickHandlerProps {
  onContextMenu: (lat: number, lng: number, clientX: number, clientY: number) => void;
}

export function MapRightClickHandler({ onContextMenu }: MapRightClickHandlerProps) {
  useMapEvents({
    contextmenu: (event) => {
      event.originalEvent.preventDefault();
      const { clientX, clientY } = event.originalEvent;
      onContextMenu(event.latlng.lat, event.latlng.lng, clientX, clientY);
    },
  });
  return null;
}

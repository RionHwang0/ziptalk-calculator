interface Coordinates {
  lat: number;
  lng: number;
}

interface Apartment {
  id: number;
  name: string;
  location: string;
  competitionRate: number;
  level: 'high' | 'medium' | 'low';
  coordinates: Coordinates;
}

export interface NaverMapInstance {
  map: any;
  markers: any[];
  addMarker: (apartment: Apartment) => void;
  panTo: (coordinates: Coordinates) => void;
}

declare global {
  interface Window {
    naver: any;
  }
}

/**
 * Initialize a Naver Map instance
 */
export function initNaverMap(mapContainer: HTMLElement): NaverMapInstance | null {
  // Check if Naver Maps API is loaded
  if (!window.naver || !window.naver.maps) {
    console.error("Naver Maps API is not loaded");
    return null;
  }

  // Default center coordinates (Seoul)
  const defaultCenter = new window.naver.maps.LatLng(37.5665, 126.9780);

  // Create map instance
  const map = new window.naver.maps.Map(mapContainer, {
    center: defaultCenter,
    zoom: 12,
    zoomControl: true,
    zoomControlOptions: {
      style: window.naver.maps.ZoomControlStyle.SMALL,
      position: window.naver.maps.Position.TOP_RIGHT
    }
  });

  const markers: any[] = [];

  return {
    map,
    markers,
    
    /**
     * Add a marker for an apartment on the map
     */
    addMarker(apartment: Apartment) {
      const position = new window.naver.maps.LatLng(
        apartment.coordinates.lat, 
        apartment.coordinates.lng
      );
      
      // Determine marker color based on competition level
      let markerColor = '#3182F6'; // Default blue (medium)
      if (apartment.level === 'high') {
        markerColor = '#FF5252'; // Red for high competition
      } else if (apartment.level === 'low') {
        markerColor = '#2AC769'; // Green for low competition
      }
      
      // Create marker
      const marker = new window.naver.maps.Marker({
        position,
        map,
        title: apartment.name,
        icon: {
          content: `
            <div style="width: 24px; height: 24px; background-color: ${markerColor}; border-radius: 12px; 
                       border: 2px solid white; display: flex; justify-content: center; align-items: center;
                       box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer;">
            </div>
          `,
          size: new window.naver.maps.Size(24, 24),
          anchor: new window.naver.maps.Point(12, 12)
        }
      });
      
      // Create info window for the marker
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 5px;">${apartment.name}</h3>
            <p style="font-size: 12px; margin-bottom: 3px;">${apartment.location}</p>
            <p style="font-size: 12px;">경쟁률: ${apartment.competitionRate}:1</p>
          </div>
        `,
        borderWidth: 0,
        disableAnchor: true,
        backgroundColor: "white",
        borderColor: "#333333",
        anchorSize: new window.naver.maps.Size(0, 0)
      });
      
      // Add click listener to show info window
      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }
      });
      
      markers.push(marker);
      return marker;
    },
    
    /**
     * Pan the map to specified coordinates
     */
    panTo(coordinates: Coordinates) {
      map.panTo(new window.naver.maps.LatLng(coordinates.lat, coordinates.lng));
    }
  };
}

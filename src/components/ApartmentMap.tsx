import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import { initNaverMap, NaverMapInstance } from "@/lib/NaverMap";

interface Apartment {
  id: number;
  name: string;
  location: string;
  competitionRate: number;
  level: 'high' | 'medium' | 'low';
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface ApartmentMapProps {
  competitionData: any | null;
  onApartmentSelect: (apartment: Apartment | null) => void;
}

export default function ApartmentMap({ competitionData, onApartmentSelect }: ApartmentMapProps) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<NaverMapInstance | null>(null);

  useEffect(() => {
    if (competitionData && mapContainerRef.current) {
      // Initialize Naver Map
      mapInstanceRef.current = initNaverMap(mapContainerRef.current);
      
      // Process competition data into apartments
      const processedApartments = competitionData.apartments || [];
      setApartments(processedApartments);
      
      // Add markers to map
      if (mapInstanceRef.current) {
        processedApartments.forEach((apt: Apartment) => {
          mapInstanceRef.current?.addMarker(apt);
        });
      }
    }
  }, [competitionData]);

  const filteredApartments = apartments.filter(apt => 
    apt.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    apt.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleApartmentClick = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    onApartmentSelect(apartment);
    
    // Center map on selected apartment
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(apartment.coordinates);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-[#FF5252]';
      case 'medium': return 'text-[#3182F6]';
      case 'low': return 'text-[#2AC769]';
      default: return 'text-gray-500';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'high': return '높음';
      case 'medium': return '중간';
      case 'low': return '낮음';
      default: return '-';
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-md p-2 mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <MapPin className="h-6 w-6 mr-2 text-[#FEE500]" />
          아파트 위치 및 정보
        </h2>
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="아파트 이름 또는 지역명으로 검색"
              className="w-full p-3 pl-10 border border-[#EAEBEE] rounded-lg"
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Map Container */}
        <div 
          id="map" 
          ref={mapContainerRef}
          className="w-full h-80 bg-[#F5F6F7] rounded-lg mb-4 relative"
        >
          {!competitionData && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400">경쟁률 데이터를 먼저 업로드해주세요</span>
            </div>
          )}
        </div>
        
        {/* Apartment Info List */}
        {apartments.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {filteredApartments.map((apt) => (
              <div 
                key={apt.id}
                className={`border ${selectedApartment?.id === apt.id ? 'border-[#3182F6]' : 'border-[#EAEBEE]'} 
                  rounded-lg p-3 hover:bg-[#F5F6F7] transition cursor-pointer flex justify-between items-center`}
                onClick={() => handleApartmentClick(apt)}
              >
                <div>
                  <h4 className="font-medium">{apt.name}</h4>
                  <p className="text-sm text-gray-500">{apt.location} • 평균 경쟁률 {apt.competitionRate}:1</p>
                </div>
                <span className={`font-medium ${getLevelColor(apt.level)}`}>{getLevelText(apt.level)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

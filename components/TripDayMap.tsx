"use client";

import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Activity {
  id: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  title: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
}

interface TripDayMapProps {
  activities: Activity[];
}

/**
 * TripDayMap: Renders a Leaflet map showing all activities for a day
 * with markers and a polyline connecting them in chronological order.
 * Client-only component (requires window/DOM).
 */
export default function TripDayMap({ activities }: TripDayMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Filter activities that have coordinates
  const activitiesWithCoords = activities.filter((a) => a.coordinates);

  // If no activities have coordinates, show a placeholder
  if (activitiesWithCoords.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
        <p className="text-sm text-gray-500">
          Map unavailable — no location data for this day
        </p>
      </div>
    );
  }

  // Sort activities by time of day (morning → afternoon → evening)
  const timeOfDayOrder = { morning: 0, afternoon: 1, evening: 2 };
  const sortedActivities = [...activitiesWithCoords].sort(
    (a, b) =>
      timeOfDayOrder[a.timeOfDay as keyof typeof timeOfDayOrder] -
      timeOfDayOrder[b.timeOfDay as keyof typeof timeOfDayOrder],
  );

  // Extract coordinates for polyline
  const polylineCoords = sortedActivities.map(
    (a) => [a.coordinates!.lat, a.coordinates!.lng] as [number, number],
  );

  // Calculate bounds to fit all markers
  const bounds = L.latLngBounds(polylineCoords);

  // Custom marker icons for different times of day
  const getMarkerIcon = (timeOfDay: string, activityIndex: number) => {
    const colors: Record<string, string> = {
      morning: "#f59e0b", // amber
      afternoon: "#f97316", // orange
      evening: "#6366f1", // indigo
    };
    const color = colors[timeOfDay] || "#3b82f6";

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          font-weight: bold;
          color: white;
          font-size: 14px;
        ">
          ${activityIndex + 1}
        </div>
      `,
      iconSize: [32, 32],
      className: "custom-marker",
    });
  };

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [50, 50] }}
        style={{ width: "100%", height: "100%" }}
        ref={mapRef}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Polyline connecting all markers in order */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            color="#3b82f6"
            weight={3}
            opacity={0.7}
            dashArray="5, 5"
          />
        )}

        {/* Markers for each activity */}
        {sortedActivities.map((activity, idx) => (
          <Marker
            key={activity.id}
            position={[activity.coordinates!.lat, activity.coordinates!.lng]}
            icon={getMarkerIcon(activity.timeOfDay, idx)}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-gray-900">
                  {idx + 1}. {activity.title}
                </div>
                <div className="text-xs text-gray-600 mt-1 capitalize">
                  {activity.timeOfDay}
                </div>
                {activity.location && (
                  <div className="text-xs text-gray-500 mt-1">
                    📍 {activity.location}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

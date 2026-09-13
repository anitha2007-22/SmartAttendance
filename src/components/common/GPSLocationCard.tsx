import React from 'react';
import { GPSLocationData } from '../../hooks/useGPSLocation';
import {
  MapPin,
  Navigation,
  Compass,
  RefreshCw,
  ShieldCheck,
  Radio,
  Satellite,
  Wifi,
} from 'lucide-react';

interface GPSLocationCardProps {
  gps: GPSLocationData;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  classroomName?: string;
  compact?: boolean;
}

export const GPSLocationCard: React.FC<GPSLocationCardProps> = ({
  gps,
  isRefreshing = false,
  onRefresh,
  classroomName = 'Lecture Hall LH-302',
  compact = false,
}) => {
  const percentageOfRadius = Math.min(100, Math.round((gps.distanceToClassroom / gps.geofenceRadius) * 100));

  if (compact) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 text-white border border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute opacity-75"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 relative"></span>
          </div>
          <div>
            <div className="font-bold flex items-center gap-1.5 text-slate-100">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>GPS: {gps.latitude}°N, {gps.longitude}°E</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {gps.distanceToClassroom}m to {classroomName} • ±{gps.accuracy}m accuracy
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Refresh GPS Fix"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Satellite className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Live GPS Geolocation
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                GNSS Locked
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Multi-signal satellite & campus WiFi positioning
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            id="btn-refresh-gps"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            title="Query device GNSS hardware for fresh coordinates"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Locating...' : 'Refresh GPS'}</span>
          </button>
        )}
      </div>

      {/* Coordinate & Accuracy Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <Compass className="w-3 h-3 text-blue-400" />
            <span>Latitude</span>
          </div>
          <div className="font-mono font-bold text-slate-100 text-[11px] sm:text-xs">
            {gps.latitude.toFixed(5)}° N
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <Navigation className="w-3 h-3 text-blue-400" />
            <span>Longitude</span>
          </div>
          <div className="font-mono font-bold text-slate-100 text-[11px] sm:text-xs">
            {gps.longitude.toFixed(5)}° E
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>Accuracy</span>
          </div>
          <div className="font-mono font-bold text-emerald-300 text-[11px] sm:text-xs">
            ±{gps.accuracy}m (High)
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            <span>Classroom Dist.</span>
          </div>
          <div className="font-mono font-bold text-indigo-300 text-[11px] sm:text-xs">
            {gps.distanceToClassroom} meters
          </div>
        </div>
      </div>

      {/* Geofence Proximity Status Bar */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${gps.isInsideGeofence ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className="font-bold text-slate-200">
              {gps.isInsideGeofence
                ? `Within Geofence (${gps.distanceToClassroom}m / ${gps.geofenceRadius}m max)`
                : `Outside Geofence (${gps.distanceToClassroom}m exceeds ${gps.geofenceRadius}m limit)`}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Target: {classroomName}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              gps.isInsideGeofence
                ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                : 'bg-gradient-to-r from-amber-500 to-rose-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(10, percentageOfRadius))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span>0m (Lecture Desk)</span>
          <span className="font-semibold text-slate-300">
            {gps.isInsideGeofence ? '✓ Geofence Verified for Attendance' : '⚠ Out-of-bounds scan will be flagged'}
          </span>
          <span>{gps.geofenceRadius}m (Classroom Perimeter)</span>
        </div>
      </div>
    </div>
  );
};

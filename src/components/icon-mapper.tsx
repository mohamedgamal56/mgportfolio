import {
  Aperture,
  Building2,
  Camera,
  Clapperboard,
  Droplets,
  Film,
  Folder,
  Handshake,
  HeartPulse,
  Layers,
  Mic,
  MonitorPlay,
  Shapes,
  Smile,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
  Video,
} from 'lucide-react';
import React from 'react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  stethoscope: Stethoscope,
  mic: Mic,
  'trending-up': TrendingUp,
  clapperboard: Clapperboard,
  layers: Layers,
  video: Video,
  sparkles: Sparkles,
  smile: Smile,
  'heart-pulse': HeartPulse,
  'user-check': UserCheck,
  handshake: Handshake,
  users: Users,
  shapes: Shapes,
  droplets: Droplets,
  'building-2': Building2,
  camera: Camera,
  aperture: Aperture,
  'monitor-play': MonitorPlay,
  folder: Folder,
  film: Film,
};

export const AVAILABLE_ICON_NAMES = Object.keys(ICON_MAP);

export function PortfolioIcon({
  name,
  className = 'w-6 h-6',
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && ICON_MAP[name]) || Film;
  return <Icon className={className} />;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChemicalLevel {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface Recommendation {
  id: string;
  text: string;
  icon: string;
}

export interface Report {
  id: string;
  location: string;
  date: string;
  status: 'Under Review' | 'In Progress' | 'Resolved';
  type: 'Chemical' | 'Physical' | 'Emergency';
}

export interface UserReport {
  id: string;
  descripcion: string;
  tipo: string;
  nivel: string;
  direccion: string;
  photoName?: string;
  photoUrl?: string;
  status: 'Under Review' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface EducationCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export type WaterStatus = 'Safe' | 'Moderate' | 'Critical';

export interface Municipality {
  id: string;
  name: string;
  status: WaterStatus;
  phosphorus: number;
  sulfate: number;
  algae: string;
  path: string;
}

export interface WaterBody {
  id: string;
  name: string;
  status: WaterStatus;
  alert: boolean;
  description: string;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PhysicsObject {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  mass: number;
  bounciness: number; // Coefficient of restitution: 0 (no bounce) to 1 (perfect elastic rebound)
  color: string;
  label: string;
  type: 'cube' | 'circle' | 'polygon';
  rotation: number;
  angularVelocity: number;
  iconName: string;
}

export type ThemePreset = 'neumorphic' | 'cyberpunk' | 'warmwood' | 'bubbleglass' | 'monochrome';

export interface PhysicsParams {
  gravity: number;       // Gravity acceleration (pixels/frame^2)
  restitution: number;   // Global rebound multiplier
  friction: number;      // Air resistance / friction multiplier (0 to 0.05)
  collisionEnabled: boolean; // Enable elastic box-to-box collisions
  scrollSensitivity: number; // Amplification of scroll velocity into physical thrust
  scrollReactionMode: 'upward_lift' | 'downward_push' | 'rotational_torque' | 'chaotic_blast';
}

export interface ScrollMetrics {
  currentScrollY: number;
  scrollSpeed: number;        // pixels per second or frame
  scrollAcceleration: number; // change in speed
  scrollDirection: 'UP' | 'DOWN' | 'NONE';
  fps: number;
}

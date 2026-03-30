/**
 * Sort Coco — The Organizer
 * 4-bit (8x8 grid) C-Block character for the Conveyor Trust Center.
 *
 * Usage:
 *   import Coco from './Coco';
 *   <Coco size={48} state="idle" />
 *
 * Props:
 *   size   — pixel width/height (default 48). The SVG scales to any size.
 *   state  — "idle" | "thinking" | "sorting" | "waving" | "celebrating" | "sleeping"
 *
 * Drop this file into your src/ directory and import it wherever you render Coco.
 * The character is the Conveyor "C" logo shape with animated sorting eyes.
 * In idle state, the eyes flick left/right and green (approved) / gold (flagged)
 * indicator pixels flash on either side.
 *
 * COLOR REFERENCE (Conveyor Green palette):
 *   #5DDBB8  — bright green (top bar, arm)
 *   #33C69F  — primary green (body spine, feet)
 *   #2AA886  — mid green (inner bar, bottom curve)
 *   #1E7F65  — dark green (bottom bar)
 *   #0F3D31  — interior shadow (C opening)
 *   #7AE8CB  — bright accent (left eye, approved flash)
 *   #FFD700  — gold accent (flagged flash)
 *   #FFF     — smile (at 0.7 opacity)
 */

import React from 'react';

const STATES = {
  idle: {
    eyeAnimation: true,
    sortFlash: true,
    speed: '3s',
    bodyOpacity: 1,
    bounce: true,
  },
  thinking: {
    eyeAnimation: false,
    sortFlash: false,
    speed: '3s',
    bodyOpacity: 0.75,
    bounce: false,
  },
  sorting: {
    eyeAnimation: true,
    sortFlash: true,
    speed: '1.5s',
    bodyOpacity: 1,
    bounce: false,
  },
  waving: {
    eyeAnimation: false,
    sortFlash: false,
    speed: '3s',
    bodyOpacity: 1,
    bounce: true,
  },
  celebrating: {
    eyeAnimation: false,
    sortFlash: false,
    speed: '3s',
    bodyOpacity: 1,
    bounce: false,
  },
  sleeping: {
    eyeAnimation: false,
    sortFlash: false,
    speed: '3s',
    bodyOpacity: 0.6,
    bounce: false,
  },
};

export default function Coco({ size = 48, state = 'idle' }) {
  const config = STATES[state] || STATES.idle;
  const dur = config.speed;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: config.bounce ? 'cocoBounce 2.5s ease-in-out infinite' : 'none',
        position: 'relative',
      }}
    >
      <style>{`
        @keyframes cocoBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes cocoWaveArm {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-1px); }
          50% { transform: translateY(-2px); }
          75% { transform: translateY(-1px); }
        }
        @keyframes cocoPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes cocoParticle1 {
          0% { transform: translate(0,0); opacity: 1; }
          100% { transform: translate(-3px,-4px); opacity: 0; }
        }
        @keyframes cocoParticle2 {
          0% { transform: translate(0,0); opacity: 1; }
          100% { transform: translate(3px,-3px); opacity: 0; }
        }
        @keyframes cocoParticle3 {
          0% { transform: translate(0,0); opacity: 1; }
          100% { transform: translate(4px,-5px); opacity: 0; }
        }
        @keyframes cocoZFloat {
          0% { transform: translateY(0); opacity: 0.6; }
          100% { transform: translateY(-8px); opacity: 0; }
        }
      `}</style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 8 8"
        xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: 'pixelated', opacity: config.bodyOpacity }}
      >
        {/* ===== C SHAPE BODY ===== */}
        {/* Top bar of C */}
        <rect x="2" y="0" width="4" height="1" fill="#5DDBB8" />
        {/* Left spine of C */}
        <rect x="1" y="1" width="2" height="1" fill="#33C69F" />
        <rect x="1" y="2" width="1" height="1" fill="#33C69F" />
        <rect x="1" y="3" width="1" height="1" fill="#33C69F" />
        {/* Bottom curve of C */}
        <rect x="1" y="4" width="2" height="1" fill="#2AA886" />
        {/* Bottom bar */}
        <rect x="2" y="5" width="4" height="1" fill="#1E7F65" />
        {/* Top bar inner extension */}
        <rect x="3" y="1" width="3" height="1" fill="#2AA886" />
        {/* C opening (dark interior) */}
        <rect x="3" y="4" width="3" height="1" fill="#0F3D31" opacity="0.3" />

        {/* ===== EYES ===== */}
        {state === 'sleeping' ? (
          <>
            {/* Sleeping — flat line eyes */}
            <rect x="3" y="2" width="1" height="1" fill="#5E5E72" />
            <rect x="5" y="2" width="1" height="1" fill="#5E5E72" />
          </>
        ) : state === 'thinking' ? (
          <>
            {/* Thinking — pulsing eyes */}
            <rect x="3" y="2" width="1" height="1" fill="#7AE8CB">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </rect>
            <rect x="5" y="2" width="1" height="1" fill="#5DDBB8">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </rect>
          </>
        ) : state === 'celebrating' ? (
          <>
            {/* Celebrating — bright white eyes */}
            <rect x="3" y="2" width="1" height="1" fill="#FFF" />
            <rect x="5" y="2" width="1" height="1" fill="#FFF" />
          </>
        ) : state === 'waving' ? (
          <>
            {/* Waving — static centered eyes */}
            <rect x="3" y="2" width="1" height="1" fill="#7AE8CB" />
            <rect x="5" y="2" width="1" height="1" fill="#7AE8CB" />
          </>
        ) : (
          <>
            {/* Idle / Sorting — eyes flick left/right */}
            <rect x="3" y="2" width="1" height="1" fill="#7AE8CB">
              <animate attributeName="x" values="3;3;2;2;3;3;4;4;3;3" dur={dur} repeatCount="indefinite" />
            </rect>
            <rect x="5" y="2" width="1" height="1" fill="#5DDBB8">
              <animate attributeName="x" values="5;5;4;4;5;5;6;6;5;5" dur={dur} repeatCount="indefinite" />
            </rect>
          </>
        )}

        {/* ===== SMILE ===== */}
        <rect
          x="1"
          y="3"
          width="1"
          height="1"
          fill="#FFF"
          opacity={state === 'waving' ? 1 : 0.7}
        />

        {/* ===== ARM ===== */}
        {state === 'waving' ? (
          /* Waving arm — animates up */
          <rect x="0" y="2" width="1" height="1" fill="#5DDBB8">
            <animate attributeName="y" values="2;1;0;1;2;2" dur="1.2s" repeatCount="indefinite" />
          </rect>
        ) : state === 'celebrating' ? (
          /* Celebrating — arm raised */
          <rect x="0" y="1" width="1" height="1" fill="#5DDBB8" />
        ) : (
          /* Default arm position */
          <rect x="0" y="2" width="1" height="1" fill="#5DDBB8" />
        )}

        {/* ===== SORTING INDICATOR FLASHES ===== */}
        {config.sortFlash && (
          <>
            {/* Left flash — green (approved) */}
            <rect x="0" y="1" width="1" height="1" fill="#7AE8CB" opacity="0">
              <animate attributeName="opacity" values="0;0;0.8;0.4;0;0;0;0;0;0" dur={dur} repeatCount="indefinite" />
            </rect>
            {/* Right flash — gold (flagged) */}
            <rect x="7" y="1" width="1" height="1" fill="#FFD700" opacity="0">
              <animate attributeName="opacity" values="0;0;0;0;0;0;0.8;0.4;0;0" dur={dur} repeatCount="indefinite" />
            </rect>
          </>
        )}

        {/* Celebrating — both flashes fire simultaneously */}
        {state === 'celebrating' && (
          <>
            <rect x="0" y="1" width="1" height="1" fill="#7AE8CB">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.6s" repeatCount="indefinite" />
            </rect>
            <rect x="7" y="1" width="1" height="1" fill="#FFD700">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.6s" repeatCount="indefinite" />
            </rect>
          </>
        )}

        {/* ===== FEET ===== */}
        <rect x="2" y="6" width="1" height="1" fill="#33C69F" />
        <rect x="5" y="6" width="1" height="1" fill="#33C69F" />
      </svg>

      {/* ===== PARTICLES (celebrating state) ===== */}
      {state === 'celebrating' && (
        <>
          <div style={{ position: 'absolute', top: '10%', left: '20%', width: 4, height: 4, background: '#7AE8CB', animation: 'cocoParticle1 0.8s ease-out infinite' }} />
          <div style={{ position: 'absolute', top: '15%', right: '20%', width: 4, height: 4, background: '#FFD700', animation: 'cocoParticle2 0.8s ease-out infinite 0.2s' }} />
          <div style={{ position: 'absolute', top: '5%', right: '30%', width: 3, height: 3, background: '#5DDBB8', animation: 'cocoParticle3 0.8s ease-out infinite 0.4s' }} />
        </>
      )}

      {/* ===== Z's (sleeping state) ===== */}
      {state === 'sleeping' && (
        <>
          <div style={{ position: 'absolute', top: '-10%', right: '15%', fontSize: size * 0.2, color: '#5E5E72', fontFamily: 'monospace', animation: 'cocoZFloat 2s ease-out infinite' }}>z</div>
          <div style={{ position: 'absolute', top: '-20%', right: '5%', fontSize: size * 0.25, color: '#5E5E72', fontFamily: 'monospace', animation: 'cocoZFloat 2s ease-out infinite 0.7s' }}>z</div>
        </>
      )}

      {/* ===== THINKING DOTS ===== */}
      {state === 'thinking' && (
        <div style={{ position: 'absolute', bottom: '-15%', display: 'flex', gap: 2 }}>
          {[0, 0.3, 0.6].map((delay, i) => (
            <div key={i} style={{ width: size * 0.06, height: size * 0.06, borderRadius: '50%', background: '#7AE8CB', animation: `cocoPulse 1s ease-in-out infinite ${delay}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

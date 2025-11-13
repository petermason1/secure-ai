'use client';

import React from 'react';
// Optional: import { Sparklines, SparklinesLine } from 'react-sparklines';

import type { ValidationData } from '../data/validationMockData';

type ValidationBadgeProps = ValidationData;

export default function ValidationBadge({
  searchVolume,
  sparkline,
  label,
}: ValidationBadgeProps) {
  if (!searchVolume && !(sparkline && sparkline.length > 0)) {
    return (
      <span className="validation-badge validation-badge--empty">
        No validation data
      </span>
    );
  }

  return (
    <span className="validation-badge validation-badge--main" title={label}>
      {label && <strong className="validation-badge__label">{label} • </strong>}
      {searchVolume && (
        <span className="validation-badge__volume">
          🔎 {searchVolume.toLocaleString()}/mo
        </span>
      )}
      {/* Optional sparklines - uncomment when ready */}
      {/* {sparkline && sparkline.length > 0 && (
        <Sparklines data={sparkline} width={60} height={15}>
          <SparklinesLine color="#0070f3" style={{ strokeWidth: 2 }} />
        </Sparklines>
      )} */}
    </span>
  );
}


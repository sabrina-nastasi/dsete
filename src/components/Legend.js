import React from 'react';
import * as d3 from 'd3';
import './Legend.css';
const Legend = ({ colorBy }) => {
  const width = 200;
  const height = 20;
  const sentimentColorScale = d3
    .scaleLinear()
    .domain([-1, 0, 1])
    .range(['red', '#ECECEC', 'green']);
  const subjectivityColorScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range(['#ECECEC', '#4467C4']);
  const colorScale =
    colorBy === 'Sentiment'
      ? sentimentColorScale
      : subjectivityColorScale;
  const gradientId = `gradient-${colorBy}`;
  return (
    <div className="legend">
      <h3>Legend: {colorBy}</h3>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {colorBy === 'Sentiment' ? (
              <>
                <stop offset="0%" stopColor="red" />
                <stop offset="50%" stopColor="#ECECEC" />
                <stop offset="100%" stopColor="green" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#ECECEC" />
                <stop offset="100%" stopColor="#4467C4" />
              </>
            )}
          </linearGradient>
        </defs>
        <rect
          width={width}
          height={height}
          fill={`url(#${gradientId})`}
        />
        <text
          x={0}
          y={height + 15}
          textAnchor="start"
          fontSize="12px"
        >
          {colorBy === 'Sentiment' ? 'Negative' : 'Objective'}
        </text>
        {colorBy === 'Sentiment' && (
          <text
            x={width}
            y={height + 15}
            textAnchor="end"
            fontSize="12px"
          >
            Positive
          </text>
        )}
        {colorBy === 'Subjectivity' && (
          <text
            x={width}
            y={height + 15}
            textAnchor="end"
            fontSize="12px"
          >
            Subjective
          </text>
        )}
      </svg>
    </div>
  );
};
export default Legend;


import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './Visualization.css';

const Visualization = ({ data, colorBy, toggleTweetSelection, selectedTweets }) => {
  const svgRef = useRef();

  useEffect(() => {
    // Set dimensions with increased left margin for month labels
    const margin = { top: 10, right: 70, bottom: 10, left: 70 };
    const width = 1300 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Clear previous SVG elements
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Define color scales based on the selected metric
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

    // Group tweets by month
    const monthGroups = d3.group(data, (d) => d.Month);
    const months = Array.from(monthGroups.keys());

    // Define vertical spacing between months
    const verticalSpacing = height / (months.length + 1); // +1 to add padding at the top and bottom

    // Define a yOffset function to position each month group
    const yOffset = (monthIndex) => (monthIndex + 1) * verticalSpacing;

    // Assign a unique y position to each tweet based on its month
    const processedData = data.map((d) => ({
      ...d,
      yPosition: yOffset(months.indexOf(d.Month)),
    }));

    // Define scales for dimensions
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(processedData, (d) => d['Dimension 1']))
      .range([0, width]);

    // Define circle size and collision radius
    const circleRadius = 4; // Reduced from 6 to 4
    const collisionRadius = circleRadius + 2; // Slightly larger than radius to prevent overlap

    // Create a force simulation to prevent overlapping within each month group
    const simulation = d3
      .forceSimulation(processedData)
      .force(
        'x',
        d3
          .forceX((d) => xScale(d['Dimension 1']))
          .strength(0.5)
      )
      .force(
        'y',
        d3.forceY((d) => d.yPosition).strength(0.5) // Position based on yOffset
      )
      .force('collide', d3.forceCollide(collisionRadius)) // Prevent overlapping circles
      .stop();

    // Run the simulation until it stabilizes
    for (let i = 0; i < 300; i++) simulation.tick();

    // Create a tooltip div (hidden by default)
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', '#f9f9f9')
      .style('padding', '8px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px');

    // Draw circles for each tweet
    svg
      .selectAll('circle')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', circleRadius) // Updated circle radius
      .attr('fill', (d) => colorScale(d[colorBy]))
      .attr(
        'stroke',
        (d) =>
          selectedTweets.find((t) => t.idx === d.idx) ? 'black' : 'none'
      )
      .attr('stroke-width', 2)
      .on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(50)
          .style('opacity', .9);
        tooltip.html(`
          <strong>Tweet:</strong> ${d.text}<br/>
          <strong>Sentiment:</strong> ${d.Sentiment}<br/>
          <strong>Subjectivity:</strong> ${d.Subjectivity}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(50)
          .style('opacity', 0);
      })
      .on('click', (event, d) => {
        toggleTweetSelection(d);
      });

    // Add month labels to the left of the y-axis
    svg
      .selectAll('.month-label')
      .data(months)
      .enter()
      .append('text')
      .attr('class', 'month-label')
      .attr('x', -20) // Position labels outside the y-axis
      .attr('y', (d, i) => yOffset(i))
      .attr('text-anchor', 'end') // Align text to the end (right-aligned)
      .attr('alignment-baseline', 'middle') // Vertically center the text
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text((d) => d)
      .attr('fill', '#333'); // Optional: Set a contrasting color

    // Add legend for the color scale
    const legendData = colorBy === 'Sentiment' ? ['Negative', 'Neutral', 'Positive'] : ['Objective', 'Subjective'];
    const legendScale = d3.scaleLinear().domain([0, legendData.length - 1]).range([0, 100]);

    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 150}, 20)`); // Position the legend in the top-right corner

    legend
      .selectAll('rect')
      .data(legendData)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 20)
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', (d, i) => {
        if (colorBy === 'Sentiment') {
          if (d === 'Negative') return colorScale(-1);
          if (d === 'Neutral') return colorScale(0);
          if (d === 'Positive') return colorScale(1);
        } else {
          if (d === 'Objective') return colorScale(0);
          if (d === 'Subjective') return colorScale(1);
        }
        return '#ECECEC'; // Default color
      });

    legend
      .selectAll('text')
      .data(legendData)
      .enter()
      .append('text')
      .attr('x', 15)
      .attr('y', (d, i) => i * 20 + 10)
      .text((d) => d)
      .attr('font-size', '12px')
      .attr('alignment-baseline', 'middle')
      .attr('fill', '#333');
  }, [data, colorBy, toggleTweetSelection, selectedTweets]);

  return (
    <div className="visualization-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Visualization;



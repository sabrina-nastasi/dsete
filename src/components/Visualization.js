import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './Visualization.css';
const Visualization = ({ data, colorBy, toggleTweetSelection, selectedTweets }) => {
  const svgRef = useRef();
  useEffect(() => {
    const margin = { top: 30, right: 80, bottom: 30, left: 120 }; 
    const width = 1300 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
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
    const monthGroups = d3.group(data, (d) => d.Month);
    const months = Array.from(monthGroups.keys());
    const verticalSpacing = (height / (months.length + 2)) * 1.2; 
    const yOffset = (monthIndex) => (monthIndex + 1) * verticalSpacing;
    const processedData = data.map((d) => ({
      ...d,
      yPosition: yOffset(months.indexOf(d.Month)),
    }));
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(processedData, (d) => d['Dimension 1']))
      .range([0, width]);
    const circleRadius = 4; 
    const collisionRadius = circleRadius + 2; 
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
        d3.forceY((d) => d.yPosition).strength(0.5) 
      )
      .force('collide', d3.forceCollide(collisionRadius)) 
      .stop();
    for (let i = 0; i < 300; i++) simulation.tick();
    svg
      .selectAll('circle')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', circleRadius) 
      .attr('fill', (d) => colorScale(d[colorBy]))
      .attr(
        'stroke',
        (d) =>
          selectedTweets.find((t) => t.idx === d.idx) ? 'black' : 'none'
      )
      .attr('stroke-width', 2)
      .on('click', (event, d) => {
        toggleTweetSelection(d);
      });
    svg
      .selectAll('.month-label')
      .data(months)
      .enter()
      .append('text')
      .attr('class', 'month-label')
      .attr('x', -10) 
      .attr('y', (d, i) => yOffset(i))
      .attr('text-anchor', 'end') 
      .attr('alignment-baseline', 'middle') 
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text((d) => d)
      .attr('fill', '#333'); 
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('Dimension 1');
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('Dimension 2');
    const legendData = colorBy === 'Sentiment' ? ['Negative', 'Neutral', 'Positive'] : ['Objective', 'Subjective'];
    const legendScale = d3.scaleLinear().domain([0, legendData.length - 1]).range([0, 100]);
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 150}, 20)`); 
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
        return '#ECECEC'; 
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



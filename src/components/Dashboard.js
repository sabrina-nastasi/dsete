// src/components/Dashboard.js

import React, { useState } from 'react';
import Visualization from './Visualization';
import Legend from './Legend';
import SelectedTweets from './SelectedTweets';
import './Dashboard.css';

const Dashboard = () => {
  const [tweets, setTweets] = useState([]);
  const [selectedColorScale, setSelectedColorScale] = useState('Sentiment');
  const [selectedTweets, setSelectedTweets] = useState([]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const processedData = data.map((tweet) => ({
            ...tweet,
            // Extract text from RawTweet
            text: extractText(tweet.RawTweet),
          }));
          setTweets(processedData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Extract text from RawTweet
  const extractText = (raw) => {
    if (Array.isArray(raw)) {
      // If it's an array, join the elements
      return raw.map((item) => stripB(item)).join(' ');
    } else {
      // If it's a string, strip leading 'b' and quotes if present
      return stripB(raw);
    }
  };

  // Function to strip leading 'b' and quotes
  const stripB = (str) => {
    if (str.startsWith("b'") || str.startsWith('b"')) {
      return str.slice(2, -1);
    }
    return str;
  };

  // Toggle tweet selection
  const toggleTweetSelection = (tweet) => {
    const exists = selectedTweets.find((t) => t.idx === tweet.idx);
    if (exists) {
      setSelectedTweets(selectedTweets.filter((t) => t.idx !== tweet.idx));
    } else {
      setSelectedTweets([tweet, ...selectedTweets]);
    }
  };

  return (
    <div className="dashboard">
      <div className="upload-section">
        <input type="file" accept=".json" onChange={handleFileUpload} />
        {tweets.length > 0 && (
          <select
            value={selectedColorScale}
            onChange={(e) => setSelectedColorScale(e.target.value)}
          >
            <option value="Sentiment">Sentiment</option>
            <option value="Subjectivity">Subjectivity</option>
          </select>
        )}
      </div>
      {tweets.length > 0 && (
        <>
          <Visualization
            data={tweets}
            colorBy={selectedColorScale}
            toggleTweetSelection={toggleTweetSelection}
            selectedTweets={selectedTweets}
          />
          <Legend colorBy={selectedColorScale} />
          <SelectedTweets tweets={selectedTweets} toggleTweetSelection={toggleTweetSelection} />
        </>
      )}
    </div>
  );
};

export default Dashboard;



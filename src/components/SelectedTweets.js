import React from 'react';
import './SelectedTweets.css';
const SelectedTweets = ({ tweets }) => {
  return (
    <div className="selected-tweets">
      <h3>Selected Tweets</h3>
      {tweets.length === 0 && <p>No tweets selected.</p>}
      {tweets.map((tweet) => (
        <div key={tweet.idx} className="tweet">
          <p>{tweet.text}</p>
        </div>
      ))}
    </div>
  );
};
export default SelectedTweets;



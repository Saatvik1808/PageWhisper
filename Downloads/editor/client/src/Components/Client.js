import React, { useState } from 'react';
import Avatar from 'react-avatar';
import "./clinet.css"; // Import your CSS file

const Client = ({ username }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const clientClassName = `client ${isHovered ? 'hovered' : ''}`;

  return (
    <div
      className={clientClassName}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Avatar name={username} size="40" round={true} textSizeRatio={2} className="avatar" />
      <span className="username">{username}</span>
    </div>
  );
};

export default Client;
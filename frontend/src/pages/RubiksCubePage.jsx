import React from 'react';

const RubiksCubePage = () => {
  return (
    <div className="w-full" style={{ height: 'calc(100vh - 80px)' }}>
      <iframe
        src="/rubiks-cube.html"
        title="Rubik's Cube Game"
        className="w-full h-full border-none"
      />
    </div>
  );
};

export default RubiksCubePage;

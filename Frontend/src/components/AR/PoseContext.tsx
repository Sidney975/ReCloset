import React, { createContext, useContext, useState } from 'react';

const PoseContext = createContext<any>(null);

export const PoseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPose, setCurrentPose] = useState(null);

  return (
    <PoseContext.Provider value={{ currentPose, setCurrentPose }}>
      {children}
    </PoseContext.Provider>
  );
};

export const usePose = () => useContext(PoseContext);

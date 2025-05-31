
import React from 'react';

const ContactProgressBar = ({ contactCount }) => {
  // Milestone intervals and their corresponding colors
  const milestones = [
    { value: 5, color: '#C85A5A', size: 40 },
    { value: 15, color: '#D4998A', size: 50 },
    { value: 35, color: '#E6C2A6', size: 60 },
    { value: 75, color: '#F2D98D', size: 70 },
    { value: 150, color: '#E8D88A', size: 80 },
    { value: 500, color: '#B8C9A0', size: 90 },
    { value: 1500, color: '#8FA888', size: 100 }
  ];

  // Calculate current milestone index and progress
  const getCurrentMilestone = () => {
    for (let i = 0; i < milestones.length; i++) {
      if (contactCount <= milestones[i].value) {
        return { index: i, milestone: milestones[i] };
      }
    }
    return { index: milestones.length - 1, milestone: milestones[milestones.length - 1] };
  };

  const { index: currentMilestoneIndex, milestone: currentMilestone } = getCurrentMilestone();
  
  // Calculate progress percentage within current milestone
  const previousMilestone = currentMilestoneIndex > 0 ? milestones[currentMilestoneIndex - 1].value : 0;
  const progressInCurrentSegment = currentMilestoneIndex === 0 
    ? (contactCount / currentMilestone.value) * 100
    : ((contactCount - previousMilestone) / (currentMilestone.value - previousMilestone)) * 100;

  const progressPercentage = Math.min(100, Math.max(0, progressInCurrentSegment));

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Network Growth Progress</h3>
        <span className="text-sm text-gray-500">
          {contactCount} contacts • Next milestone: {currentMilestone.value}
        </span>
      </div>
      
      {/* Progress track */}
      <div className="relative">
        {/* Background track */}
        <div className="h-2 bg-gray-200 rounded-full relative overflow-hidden">
          {/* Progress fill */}
          <div 
            className="h-full transition-all duration-500 ease-out rounded-full"
            style={{ 
              width: `${(currentMilestoneIndex / (milestones.length - 1)) * 100 + (progressPercentage / 100) * (100 / (milestones.length - 1))}%`,
              background: `linear-gradient(to right, ${milestones[0].color}, ${currentMilestone.color})`
            }}
          />
        </div>
        
        {/* Milestone bubbles */}
        <div className="absolute top-0 left-0 w-full h-2 flex justify-between items-center">
          {milestones.map((milestone, index) => {
            const isReached = contactCount >= milestone.value;
            const isCurrent = index === currentMilestoneIndex;
            
            return (
              <div
                key={milestone.value}
                className="relative flex flex-col items-center"
                style={{ 
                  transform: 'translateY(-50%)',
                  left: index === 0 ? '0%' : index === milestones.length - 1 ? '-100%' : '-50%'
                }}
              >
                {/* Milestone bubble */}
                <div
                  className={`rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                    isReached ? 'shadow-lg' : 'opacity-50'
                  } ${isCurrent && !isReached ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
                  style={{
                    backgroundColor: milestone.color,
                    width: `${milestone.size}px`,
                    height: `${milestone.size}px`,
                    fontSize: `${Math.max(10, milestone.size * 0.25)}px`
                  }}
                >
                  {milestone.value}
                </div>
                
                {/* Milestone label */}
                <span className="text-xs text-gray-600 mt-1 whitespace-nowrap">
                  {milestone.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContactProgressBar;

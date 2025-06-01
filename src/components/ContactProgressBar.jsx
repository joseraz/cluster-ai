
import React from 'react';

const ContactProgressBar = ({ contactCount }) => {
  // Milestone intervals and their corresponding colors
  const milestones = [
    { value: 5, size: 40 },
    { value: 15, size: 50 },
    { value: 35, size: 60 },
    { value: 75, size: 70 },
    { value: 150, size: 80 },
    { value: 500, size: 90 },
    { value: 1500, size: 100 }
  ];

  // Calculate overall progress percentage across all milestones
  const maxContacts = milestones[milestones.length - 1].value;
  const overallProgress = Math.min((contactCount / maxContacts) * 100, 100);

  // Calculate current milestone index for display
  const getCurrentMilestone = () => {
    for (let i = 0; i < milestones.length; i++) {
      if (contactCount <= milestones[i].value) {
        return { index: i, milestone: milestones[i] };
      }
    }
    return { index: milestones.length - 1, milestone: milestones[milestones.length - 1] };
  };

  const { milestone: currentMilestone } = getCurrentMilestone();

  // Function to get color based on position in gradient (red -> yellow -> green)
  const getGradientColor = (position) => {
    if (position <= 50) {
      // Red to Yellow (0% to 50%)
      const ratio = position / 50;
      const red = 255;
      const green = Math.floor(255 * ratio);
      const blue = 0;
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      // Yellow to Green (50% to 100%)
      const ratio = (position - 50) / 50;
      const red = Math.floor(255 * (1 - ratio));
      const green = 255;
      const blue = 0;
      return `rgb(${red}, ${green}, ${blue})`;
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-100 py-6">
      {/* Centered container for the progress bar */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Network Growth Progress</h3>
          <span className="text-sm text-gray-500">
            {contactCount} contacts • Next milestone: {currentMilestone.value}
          </span>
        </div>
        
        {/* Progress track with integrated bubbles */}
        <div className="relative">
          {/* Background track */}
          <div className="h-4 bg-gray-200 rounded-full relative overflow-hidden">
            {/* Progress fill with red-to-green gradient */}
            <div 
              className="h-full transition-all duration-500 ease-out rounded-full"
              style={{ 
                width: `${overallProgress}%`,
                background: `linear-gradient(to right, 
                  rgb(255, 0, 0) 0%, 
                  rgb(255, 255, 0) 50%, 
                  rgb(0, 255, 0) 100%)`
              }}
            />
          </div>
          
          {/* Milestone bubbles positioned ON the progress track */}
          <div className="absolute inset-0 flex items-center">
            {milestones.map((milestone, index) => {
              const isReached = contactCount >= milestone.value;
              const position = (milestone.value / maxContacts) * 100;
              const bubbleColor = getGradientColor(position);
              
              return (
                <div
                  key={milestone.value}
                  className="absolute flex flex-col items-center"
                  style={{ 
                    left: `${position}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {/* Milestone bubble embedded in the track */}
                  <div
                    className={`rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 border-2 border-white ${
                      isReached ? 'shadow-lg scale-110' : 'opacity-60 scale-90'
                    }`}
                    style={{
                      backgroundColor: bubbleColor,
                      width: `${milestone.size}px`,
                      height: `${milestone.size}px`,
                      fontSize: `${Math.max(10, milestone.size * 0.25)}px`,
                      zIndex: 10
                    }}
                  >
                    {milestone.value}
                  </div>
                  
                  {/* Milestone label below the bubble */}
                  <span className="text-xs text-gray-600 mt-2 whitespace-nowrap">
                    {milestone.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactProgressBar;

'use client';

interface PixelProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function PixelProgressBar({ currentStep, totalSteps }: PixelProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const pixelSize = 3; // Size of each "pixel" in the art
  
  return (
    <div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20"
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
      style={{ imageRendering: 'pixelated' }}
    >
      <div className="flex items-center gap-4">
        
        {/* Step counter - pixel art style */}
        <div 
          className="font-[family-name:var(--font-pixelify)] text-xl font-bold text-white px-3 py-2"
          style={{ 
            textShadow: '3px 3px 0px #000',
            imageRendering: 'pixelated'
          }}
        >
          {currentStep + 1}/{totalSteps}
        </div>
        
        {/* Pixel Art Potion Bottle - hand-drawn with divs */}
        <div className="relative" style={{ imageRendering: 'pixelated' }}>
          {/* Bottle container - 60 pixels wide, 16 pixels tall */}
          <div className="relative flex" style={{ gap: 0 }}>
            
            {/* Left cap (2px wide) */}
            <div className="flex flex-col" style={{ gap: 0 }}>
              <div style={{ width: pixelSize * 2, height: pixelSize * 3, backgroundColor: 'transparent' }} />
              <div style={{ width: pixelSize * 2, height: pixelSize * 10, backgroundColor: '#3498db' }} />
              <div style={{ width: pixelSize * 2, height: pixelSize * 3, backgroundColor: 'transparent' }} />
            </div>
            
            {/* Main bottle body (50px wide) - this fills with potion */}
            <div className="relative overflow-hidden" style={{ width: pixelSize * 50, height: pixelSize * 16 }}>
              {/* Glass outline */}
              <div className="absolute inset-0 flex flex-col" style={{ gap: 0 }}>
                {/* Top border */}
                <div style={{ height: pixelSize * 3, backgroundColor: '#2980b9' }} />
                {/* Middle transparent area */}
                <div className="flex-1 flex">
                  <div style={{ width: pixelSize * 2, backgroundColor: '#2980b9' }} />
                  <div className="flex-1" style={{ backgroundColor: 'rgba(41, 128, 185, 0.2)' }} />
                  <div style={{ width: pixelSize * 2, backgroundColor: '#2980b9' }} />
                </div>
                {/* Bottom border */}
                <div style={{ height: pixelSize * 3, backgroundColor: '#2980b9' }} />
              </div>
              
              {/* Potion liquid filling */}
              <div 
                className="absolute transition-all duration-700 ease-out"
                style={{ 
                  left: pixelSize * 2,
                  top: pixelSize * 3,
                  bottom: pixelSize * 3,
                  width: `calc(${progress}% - ${pixelSize * 4}px)`,
                  backgroundColor: '#27ae60',
                  imageRendering: 'pixelated'
                }}
              >
                {/* Potion highlight (top 2 pixels) */}
                <div style={{ height: pixelSize * 2, backgroundColor: '#2ecc71' }} />
                
                {/* Pixel bubbles */}
                {progress > 10 && (
                  <>
                    <div 
                      className="absolute"
                      style={{
                        width: pixelSize * 2,
                        height: pixelSize * 2,
                        backgroundColor: '#52be80',
                        animation: 'bubble-float-1 4s linear infinite',
                        imageRendering: 'pixelated'
                      }}
                    />
                    <div 
                      className="absolute"
                      style={{
                        width: pixelSize * 2,
                        height: pixelSize * 2,
                        backgroundColor: '#52be80',
                        top: pixelSize * 4,
                        animation: 'bubble-float-2 5s linear infinite 1s',
                        imageRendering: 'pixelated'
                      }}
                    />
                  </>
                )}
              </div>
              
              {/* Glass shine pixels */}
              <div 
                className="absolute pointer-events-none"
                style={{ 
                  left: pixelSize * 4, 
                  top: pixelSize * 4, 
                  width: pixelSize * 3, 
                  height: pixelSize * 3, 
                  backgroundColor: 'rgba(255, 255, 255, 0.3)' 
                }}
              />
            </div>
            
            {/* Neck (4px wide) */}
            <div className="flex flex-col" style={{ gap: 0 }}>
              <div style={{ width: pixelSize * 4, height: pixelSize * 4, backgroundColor: 'transparent' }} />
              <div style={{ width: pixelSize * 4, height: pixelSize * 8, backgroundColor: '#2980b9' }} />
              <div style={{ width: pixelSize * 4, height: pixelSize * 4, backgroundColor: 'transparent' }} />
            </div>
            
            {/* Cork (4px wide) */}
            <div className="flex flex-col" style={{ gap: 0 }}>
              <div style={{ width: pixelSize * 4, height: pixelSize * 2, backgroundColor: 'transparent' }} />
              <div className="relative" style={{ width: pixelSize * 4, height: pixelSize * 12, backgroundColor: '#6b4423' }}>
                {/* Cork highlight */}
                <div style={{ 
                  position: 'absolute',
                  top: pixelSize * 2, 
                  right: pixelSize, 
                  width: pixelSize * 2, 
                  height: pixelSize * 2, 
                  backgroundColor: '#8b5a3c' 
                }} />
              </div>
              <div style={{ width: pixelSize * 4, height: pixelSize * 2, backgroundColor: 'transparent' }} />
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes bubble-float-1 {
          0% {
            left: 0%;
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
          100% {
            left: 95%;
            transform: translateY(0);
          }
        }
        
        @keyframes bubble-float-2 {
          0% {
            left: 0%;
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
          100% {
            left: 95%;
            transform: translateY(0);
          }
        }
        
        @keyframes bubble-float-3 {
          0% {
            left: 0%;
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
          100% {
            left: 95%;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

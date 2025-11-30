interface CauldronAssetProps {
  className?: string;
  imageSrc?: string;
}

export function CauldronAsset({ className = '', imageSrc = '/cauldron.png' }: CauldronAssetProps) {
  // Use smaller size for cauldron_stages.png
  const isStagesImage = imageSrc.includes('cauldron_stages');
  const sizeClass = isStagesImage ? 'w-64' : 'w-80';
  
  return (
    <div 
      className={`fixed inset-x-0 bottom-[5vh] flex justify-center z-0 pointer-events-none ${className}`} 
      aria-hidden="true"
    >
      <img
        src={imageSrc}
        alt=""
        className={`cauldron-asset ${sizeClass} mr-4`}
        style={{ imageRendering: 'pixelated' }}
        role="presentation"
        onError={(e) => {
          // Hide image if it fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

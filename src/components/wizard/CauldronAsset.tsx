interface CauldronAssetProps {
  className?: string;
}

export function CauldronAsset({ className = '' }: CauldronAssetProps) {
  return (
    <div 
      className={`fixed inset-x-0 bottom-[5vh] flex justify-center z-0 pointer-events-none ${className}`} 
      aria-hidden="true"
    >
      <img
        src="/cauldron.png"
        alt=""
        className="cauldron-asset w-80 mr-4"
        role="presentation"
        onError={(e) => {
          // Hide image if it fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

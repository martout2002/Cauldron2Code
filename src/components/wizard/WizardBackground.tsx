export function WizardBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Background color fills the entire viewport */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#0a0e1a',
        }}
      />
      
      {/* Background image - wider image, height-fitted without stretching */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/background_image.png')",
          backgroundSize: 'auto 100%',
        }}
      />
    </div>
  );
}

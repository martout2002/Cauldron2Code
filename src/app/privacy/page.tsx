export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>Information We Collect</h2>
          <p>
            Cauldron2Code collects minimal information necessary to provide our service:
          </p>
          <ul>
            <li>OAuth tokens from GitHub, Vercel, Railway, and Render (encrypted and stored securely)</li>
            <li>Project configuration data (stored temporarily during generation)</li>
            <li>Usage analytics (anonymous)</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>
            We use the collected information to:
          </p>
          <ul>
            <li>Generate and deploy your projects</li>
            <li>Create repositories on your behalf (with your explicit authorization)</li>
            <li>Improve our service</li>
          </ul>

          <h2>Data Storage and Security</h2>
          <p>
            All OAuth tokens are encrypted using industry-standard encryption (AES-256).
            Tokens are stored in HTTP-only cookies and are never exposed to client-side JavaScript.
            We do not store your project code or generated files.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            Cauldron2Code integrates with:
          </p>
          <ul>
            <li>GitHub (for repository creation)</li>
            <li>Vercel (for deployment)</li>
            <li>Railway (for deployment)</li>
            <li>Render (for deployment)</li>
          </ul>
          <p>
            Each service has its own privacy policy. We recommend reviewing them.
          </p>

          <h2>Your Rights</h2>
          <p>
            You can:
          </p>
          <ul>
            <li>Disconnect any OAuth integration at any time</li>
            <li>Revoke access tokens through the respective platform</li>
            <li>Request deletion of your data</li>
          </ul>

          <h2>Contact</h2>
          <p>
            For privacy concerns, please open an issue on our{' '}
            <a href="https://github.com/yourusername/cauldron2code">GitHub repository</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

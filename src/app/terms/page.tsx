export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          Terms of Service
        </h1>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>Acceptance of Terms</h2>
          <p>
            By using Cauldron2Code, you agree to these terms of service.
            If you do not agree, please do not use our service.
          </p>

          <h2>Description of Service</h2>
          <p>
            Cauldron2Code is a web application that generates full-stack project scaffolds
            based on user-selected technologies. The service includes:
          </p>
          <ul>
            <li>Project scaffold generation</li>
            <li>GitHub repository creation (with user authorization)</li>
            <li>Automated deployment to hosting platforms</li>
          </ul>

          <h2>User Responsibilities</h2>
          <p>
            You are responsible for:
          </p>
          <ul>
            <li>Maintaining the security of your OAuth tokens</li>
            <li>Complying with the terms of service of integrated platforms (GitHub, Vercel, etc.)</li>
            <li>The code and projects you generate and deploy</li>
            <li>Any costs incurred on third-party platforms</li>
          </ul>

          <h2>Service Availability</h2>
          <p>
            We strive to maintain high availability but do not guarantee uninterrupted service.
            We may perform maintenance or updates that temporarily affect availability.
          </p>

          <h2>Limitations of Liability</h2>
          <p>
            Cauldron2Code is provided "as is" without warranties of any kind.
            We are not liable for:
          </p>
          <ul>
            <li>Generated code quality or functionality</li>
            <li>Deployment failures or issues</li>
            <li>Data loss or security breaches on third-party platforms</li>
            <li>Costs incurred on third-party services</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            The code you generate using Cauldron2Code is yours.
            Cauldron2Code itself is open source under the MIT License.
          </p>

          <h2>Termination</h2>
          <p>
            You may stop using Cauldron2Code at any time by disconnecting OAuth integrations.
            We reserve the right to terminate or suspend access for violations of these terms.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may update these terms from time to time.
            Continued use of the service constitutes acceptance of updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these terms, please open an issue on our{' '}
            <a href="https://github.com/yourusername/cauldron2code">GitHub repository</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

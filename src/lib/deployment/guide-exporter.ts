import type {
  DeploymentGuide,
  DeploymentStep,
  DeploymentSubstep,
  CommandSnippet,
  CodeSnippet,
  ChecklistItem,
  TroubleshootingIssue,
} from '@/types/deployment-guides';
import { getGuideErrorHandler } from './guide-error-handler';

/**
 * GuideExporter
 * 
 * Exports deployment guides to various formats (Markdown, etc.)
 * Formats guides with proper headings, code blocks, and structure
 * for offline use, sharing, or documentation purposes.
 * 
 * Requirement 10.6: Export as Markdown option
 */
export class GuideExporter {
  private readonly errorHandler = getGuideErrorHandler();
  /**
   * Export a deployment guide as Markdown
   * 
   * @param guide - The deployment guide to export
   * @returns Markdown-formatted string of the complete guide
   * @throws Error if export fails
   * 
   * Requirement 10.6: Export guide as markdown file
   */
  exportAsMarkdown(guide: DeploymentGuide): string {
    try {
      return this.generateMarkdown(guide);
    } catch (error) {
      const guideError = this.errorHandler.handleExportError(error as Error, 'markdown');
      this.errorHandler.logError(guideError, { platform: guide.platform.id });
      throw error;
    }
  }

  /**
   * Generate markdown content (internal method)
   */
  private generateMarkdown(guide: DeploymentGuide): string {
    const sections: string[] = [];

    // Title and header
    sections.push(this.formatTitle(guide));
    sections.push('');

    // Platform information
    sections.push(this.formatPlatformInfo(guide));
    sections.push('');

    // Estimated time
    sections.push(`**Estimated Time:** ${guide.estimatedTime}`);
    sections.push('');
    sections.push('---');
    sections.push('');

    // Table of Contents
    sections.push(this.formatTableOfContents(guide));
    sections.push('');
    sections.push('---');
    sections.push('');

    // Deployment Steps
    sections.push('## Deployment Steps');
    sections.push('');
    
    for (const step of guide.steps) {
      sections.push(this.formatStep(step));
      sections.push('');
    }

    sections.push('---');
    sections.push('');

    // Post-Deployment Checklist
    if (guide.postDeploymentChecklist && guide.postDeploymentChecklist.length > 0) {
      sections.push('## Post-Deployment Checklist');
      sections.push('');
      sections.push(this.formatChecklist(guide.postDeploymentChecklist));
      sections.push('');
      sections.push('---');
      sections.push('');
    }

    // Troubleshooting
    if (guide.troubleshooting) {
      sections.push('## Troubleshooting');
      sections.push('');
      sections.push(this.formatTroubleshooting(guide));
      sections.push('');
      sections.push('---');
      sections.push('');
    }

    // Footer
    sections.push(this.formatFooter(guide));

    return sections.join('\n');
  }

  /**
   * Download guide as markdown file
   * 
   * @param guide - The deployment guide to download
   * @throws Error if download fails
   */
  downloadMarkdown(guide: DeploymentGuide): void {
    try {
      const markdown = this.exportAsMarkdown(guide);
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `deploy-to-${guide.platform.id}-${Date.now()}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      const guideError = this.errorHandler.handleExportError(error as Error, 'markdown');
      this.errorHandler.logError(guideError, { platform: guide.platform.id });
      throw error;
    }
  }

  /**
   * Print the guide
   * 
   * @throws Error if print fails
   */
  printGuide(): void {
    try {
      if (typeof window !== 'undefined' && window.print) {
        window.print();
      } else {
        throw new Error('Print functionality is not available');
      }
    } catch (error) {
      const guideError = this.errorHandler.handleExportError(error as Error, 'print');
      this.errorHandler.logError(guideError);
      throw error;
    }
  }

  /**
   * Format the guide title and description
   */
  private formatTitle(guide: DeploymentGuide): string {
    return `# Deploy to ${guide.platform.name}\n\n${guide.platform.description}`;
  }

  /**
   * Format platform information section
   */
  private formatPlatformInfo(guide: DeploymentGuide): string {
    const lines: string[] = [];
    
    lines.push('## Platform Information');
    lines.push('');
    lines.push(`- **Platform:** ${guide.platform.name}`);
    lines.push(`- **Best For:** ${guide.platform.bestFor.join(', ')}`);
    lines.push(`- **Free Tier:** ${guide.platform.features.freeTier ? 'Yes' : 'No'}`);
    lines.push(`- **Database Support:** ${guide.platform.features.databaseSupport ? 'Yes' : 'No'}`);
    lines.push(`- **Custom Domains:** ${guide.platform.features.customDomains ? 'Yes' : 'No'}`);
    lines.push(`- **Build Minutes:** ${guide.platform.features.buildMinutes}`);
    lines.push(`- **Ease of Use:** ${this.capitalizeFirst(guide.platform.features.easeOfUse)}`);
    lines.push('');
    lines.push(`📚 [Documentation](${guide.platform.documentationUrl}) | 💰 [Pricing](${guide.platform.pricingUrl})`);

    return lines.join('\n');
  }

  /**
   * Format table of contents
   */
  private formatTableOfContents(guide: DeploymentGuide): string {
    const lines: string[] = [];
    
    lines.push('## Table of Contents');
    lines.push('');
    
    // Deployment steps
    for (let i = 0; i < guide.steps.length; i++) {
      const step = guide.steps[i];
      if (step) {
        lines.push(`${i + 1}. [${step.title}](#${this.createAnchor(step.title)})`);
      }
    }
    
    // Post-deployment checklist
    if (guide.postDeploymentChecklist && guide.postDeploymentChecklist.length > 0) {
      lines.push(`${guide.steps.length + 1}. [Post-Deployment Checklist](#post-deployment-checklist)`);
    }
    
    // Troubleshooting
    if (guide.troubleshooting) {
      lines.push(`${guide.steps.length + 2}. [Troubleshooting](#troubleshooting)`);
    }

    return lines.join('\n');
  }

  /**
   * Format a deployment step
   */
  private formatStep(step: DeploymentStep): string {
    const lines: string[] = [];
    
    // Step title
    lines.push(`### ${step.order}. ${step.title}`);
    lines.push('');
    
    // Description
    lines.push(step.description);
    lines.push('');

    // Warnings
    if (step.warnings && step.warnings.length > 0) {
      lines.push('> ⚠️ **Warning:**');
      for (const warning of step.warnings) {
        lines.push(`> - ${warning}`);
      }
      lines.push('');
    }

    // Commands
    if (step.commands && step.commands.length > 0) {
      for (const command of step.commands) {
        lines.push(this.formatCommand(command));
        lines.push('');
      }
    }

    // Code snippets
    if (step.codeSnippets && step.codeSnippets.length > 0) {
      for (const snippet of step.codeSnippets) {
        lines.push(this.formatCodeSnippet(snippet));
        lines.push('');
      }
    }

    // Substeps
    if (step.substeps && step.substeps.length > 0) {
      for (const substep of step.substeps) {
        lines.push(this.formatSubstep(substep));
        lines.push('');
      }
    }

    // Notes
    if (step.notes && step.notes.length > 0) {
      lines.push('**Notes:**');
      for (const note of step.notes) {
        lines.push(`- ${note}`);
      }
      lines.push('');
    }

    // External links
    if (step.externalLinks && step.externalLinks.length > 0) {
      lines.push('**Learn More:**');
      for (const link of step.externalLinks) {
        lines.push(`- [${link.text}](${link.url})`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format a substep
   */
  private formatSubstep(substep: DeploymentSubstep): string {
    const lines: string[] = [];
    
    lines.push(`#### ${substep.title}`);
    lines.push('');
    lines.push(substep.description);
    lines.push('');

    // Commands
    if (substep.commands && substep.commands.length > 0) {
      for (const command of substep.commands) {
        lines.push(this.formatCommand(command));
        lines.push('');
      }
    }

    // External links
    if (substep.externalLinks && substep.externalLinks.length > 0) {
      lines.push('**Resources:**');
      for (const link of substep.externalLinks) {
        lines.push(`- [${link.text}](${link.url})`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format a command snippet
   */
  private formatCommand(command: CommandSnippet): string {
    const lines: string[] = [];
    
    if (command.description) {
      lines.push(`**${command.description}**`);
      lines.push('');
    }

    // Code block with language
    lines.push('```' + command.language);
    lines.push(command.command);
    lines.push('```');

    // Placeholder information
    if (command.placeholders && command.placeholders.length > 0) {
      lines.push('');
      lines.push('*Replace the following placeholders:*');
      for (const placeholder of command.placeholders) {
        lines.push(`- \`${placeholder.key}\`: ${placeholder.description}`);
        if (placeholder.example) {
          lines.push(`  - Example: \`${placeholder.example}\``);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Format a code snippet
   */
  private formatCodeSnippet(snippet: CodeSnippet): string {
    const lines: string[] = [];
    
    if (snippet.title) {
      lines.push(`**${snippet.title}**`);
      lines.push('');
    }

    if (snippet.filename) {
      lines.push(`*File: \`${snippet.filename}\`*`);
      lines.push('');
    }

    if (snippet.description) {
      lines.push(snippet.description);
      lines.push('');
    }

    // Code block
    lines.push('```' + snippet.language);
    lines.push(snippet.code);
    lines.push('```');

    return lines.join('\n');
  }

  /**
   * Format the post-deployment checklist
   */
  private formatChecklist(items: ChecklistItem[]): string {
    const lines: string[] = [];
    
    lines.push('Complete these tasks after your initial deployment:');
    lines.push('');

    for (const item of items) {
      const checkbox = item.completed ? '[x]' : '[ ]';
      const required = item.required ? '**[Required]**' : '*[Optional]*';
      
      lines.push(`- ${checkbox} ${required} **${item.title}**`);
      lines.push(`  - ${item.description}`);

      // Commands
      if (item.commands && item.commands.length > 0) {
        lines.push('');
        for (const command of item.commands) {
          lines.push('  ```' + command.language);
          lines.push('  ' + command.command);
          lines.push('  ```');
        }
      }

      // External links
      if (item.externalLinks && item.externalLinks.length > 0) {
        lines.push('');
        for (const link of item.externalLinks) {
          lines.push(`  - [${link.text}](${link.url})`);
        }
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format the troubleshooting section
   */
  private formatTroubleshooting(guide: DeploymentGuide): string {
    const lines: string[] = [];
    
    lines.push('### Common Issues and Solutions');
    lines.push('');

    // Common issues
    for (const issue of guide.troubleshooting.commonIssues) {
      lines.push(this.formatTroubleshootingIssue(issue));
      lines.push('');
    }

    // Platform status and community links
    lines.push('### Additional Resources');
    lines.push('');
    lines.push(`- [${guide.platform.name} Status Page](${guide.troubleshooting.platformStatusUrl})`);
    
    for (const link of guide.troubleshooting.communityLinks) {
      lines.push(`- [${link.text}](${link.url})`);
    }

    return lines.join('\n');
  }

  /**
   * Format a troubleshooting issue
   */
  private formatTroubleshootingIssue(issue: TroubleshootingIssue): string {
    const lines: string[] = [];
    
    lines.push(`#### ${issue.title}`);
    lines.push('');

    // Symptoms
    if (issue.symptoms && issue.symptoms.length > 0) {
      lines.push('**Symptoms:**');
      for (const symptom of issue.symptoms) {
        lines.push(`- ${symptom}`);
      }
      lines.push('');
    }

    // Causes
    if (issue.causes && issue.causes.length > 0) {
      lines.push('**Possible Causes:**');
      for (const cause of issue.causes) {
        lines.push(`- ${cause}`);
      }
      lines.push('');
    }

    // Solutions
    if (issue.solutions && issue.solutions.length > 0) {
      lines.push('**Solutions:**');
      for (const solution of issue.solutions) {
        lines.push(`- ${solution}`);
      }
      lines.push('');
    }

    // Related links
    if (issue.relatedLinks && issue.relatedLinks.length > 0) {
      lines.push('**Related Documentation:**');
      for (const link of issue.relatedLinks) {
        lines.push(`- [${link.text}](${link.url})`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format the footer
   */
  private formatFooter(guide: DeploymentGuide): string {
    const lines: string[] = [];
    
    lines.push('## Need Help?');
    lines.push('');
    lines.push(`Visit the [${guide.platform.name} documentation](${guide.platform.documentationUrl}) for more information.`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('*This guide was generated by Cauldron2Code. Your deployment progress is saved automatically in your browser.*');

    return lines.join('\n');
  }

  /**
   * Create a markdown anchor from a title
   */
  private createAnchor(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  /**
   * Capitalize first letter of a string
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Get a singleton instance of GuideExporter
 */
let guideExporterInstance: GuideExporter | null = null;

export function getGuideExporter(): GuideExporter {
  if (!guideExporterInstance) {
    guideExporterInstance = new GuideExporter();
  }
  return guideExporterInstance;
}

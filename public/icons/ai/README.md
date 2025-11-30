# AI Template and Provider Icons

This directory contains SVG icons for AI templates and AI providers used in the PixelArtWizard.

## AI Template Icons

These icons represent different AI-powered features that can be added to a project:

- `chatbot.svg` - AI Chatbot (MessageSquare icon from Lucide)
- `document-analyzer.svg` - Document Analyzer (FileText icon from Lucide)
- `semantic-search.svg` - Semantic Search (Search icon from Lucide)
- `code-assistant.svg` - Code Assistant (Code icon from Lucide)
- `image-generator.svg` - Image Generator (Image icon from Lucide)

## AI Provider Icons

These icons represent different AI service providers:

- `anthropic.svg` - Anthropic Claude (custom logo with brand color #D97757)
- `openai.svg` - OpenAI (custom logo with brand color #10A37F)
- `aws-bedrock.svg` - AWS Bedrock (custom logo with AWS orange #FF9900)
- `gemini.svg` - Google Gemini (custom logo with Google blue #4285F4)

## Usage

These icons are used in the wizard steps configuration (`src/lib/wizard/wizard-steps.ts`) and are preloaded by the asset preloader (`src/lib/wizard/asset-preloader.ts`) for optimal performance.

The icons are rendered by the OptionGrid component as `<img>` tags with proper error handling and fallback to placeholder icons.

## Icon Format

All icons are SVG format with:
- 24x24 viewBox
- Stroke-based design for template icons (using `currentColor` for theming)
- Filled design with brand colors for provider icons
- Optimized for display at various sizes (16px to 96px)

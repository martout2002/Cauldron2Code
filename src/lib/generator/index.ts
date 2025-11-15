export { ScaffoldGenerator } from './scaffold-generator';
export type { GeneratedFile, GenerationResult } from './scaffold-generator';
export { TemplateEngine } from './template-engine';
export type { TemplateContext, FileTemplate, DirectoryStructure } from './template-engine';
export { DocumentationGenerator } from './documentation-generator';
export {
  getDirectoryStructure,
  getFilePath,
  normalizeProjectName,
  toPascalCase,
  toCamelCase,
} from './file-structure';

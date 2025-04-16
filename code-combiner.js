/**
 * Code Combiner Script
 *
 * This script recursively scans a project directory and combines all source files
 * into a single document. It preserves file paths and includes file headers.
 *
 * Usage: node code-combiner.js <directory-path> <output-file> [--exclude=pattern1,pattern2,...]
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

// Convert fs functions to promise-based
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// Default file extensions to include
const DEFAULT_INCLUDE_EXTENSIONS = [
  // JavaScript and TypeScript
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  // Web
  '.html',
  '.css',
  '.scss',
  '.sass',
  '.less',
  // Configuration files
  '.json',
  '.yml',
  '.yaml',
  '.toml',
  '.xml',
  // Others
  '.sql',
  '.graphql',
  '.md',
];

// Default directories to exclude
const DEFAULT_EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  'public',
  'assets',
  'vendor',
];

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      'Usage: node code-combiner.js <directory-path> <output-file> [--exclude=pattern1,pattern2,...] [--include-ext=ext1,ext2,...]'
    );
    process.exit(1);
  }

  const directoryPath = args[0];
  const outputFile = args[1];

  let excludePatterns = DEFAULT_EXCLUDE_DIRS;
  let includeExtensions = DEFAULT_INCLUDE_EXTENSIONS;

  // Parse additional options
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--exclude=')) {
      const patterns = arg.substring('--exclude='.length).split(',');
      excludePatterns = [...excludePatterns, ...patterns];
    }

    if (arg.startsWith('--include-ext=')) {
      const extensions = arg.substring('--include-ext='.length).split(',');
      includeExtensions = extensions.map((ext) => (ext.startsWith('.') ? ext : `.${ext}`));
    }
  }

  return { directoryPath, outputFile, excludePatterns, includeExtensions };
}

// Check if a path should be excluded
function shouldExclude(filePath, excludePatterns) {
  return excludePatterns.some((pattern) => filePath.includes(pattern));
}

// Check if a file should be included based on its extension
function shouldIncludeFile(filePath, includeExtensions) {
  const ext = path.extname(filePath).toLowerCase();
  return includeExtensions.includes(ext);
}

// Get all files recursively from a directory
async function getFiles(dir, excludePatterns, includeExtensions, baseDir = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(baseDir, entry.name);

    if (shouldExclude(fullPath, excludePatterns)) {
      continue;
    }

    if (entry.isDirectory()) {
      const subDirFiles = await getFiles(
        fullPath,
        excludePatterns,
        includeExtensions,
        relativePath
      );
      files.push(...subDirFiles);
    } else if (shouldIncludeFile(fullPath, includeExtensions)) {
      files.push({
        fullPath,
        relativePath,
      });
    }
  }

  return files;
}

// Format file content with header
function formatFileContent(filePath, content) {
  const separator = '='.repeat(80);
  return `\n${separator}\n${filePath}\n${separator}\n\n${content}\n`;
}

// Main function
async function main() {
  try {
    const { directoryPath, outputFile, excludePatterns, includeExtensions } = parseArgs();

    console.log('Starting code combination process...');
    console.log(`Directory: ${directoryPath}`);
    console.log(`Output file: ${outputFile}`);
    console.log(`Excluding: ${excludePatterns.join(', ')}`);
    console.log(`Including extensions: ${includeExtensions.join(', ')}`);

    // Get all files
    const files = await getFiles(directoryPath, excludePatterns, includeExtensions);
    console.log(`Found ${files.length} files to process.`);

    // Sort files by path for better readability
    files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

    // Initialize the output content with a header
    let outputContent = `# Project Code Compilation\n\nGenerated on: ${new Date().toISOString()}\nDirectory: ${directoryPath}\nTotal files: ${
      files.length
    }\n\n`;

    // Add table of contents
    outputContent += '## Table of Contents\n\n';
    for (const file of files) {
      outputContent += `- [${file.relativePath}](#${encodeURIComponent(file.relativePath)})\n`;
    }

    // Process each file
    for (const file of files) {
      console.log(`Processing: ${file.relativePath}`);

      try {
        const content = await readFile(file.fullPath, 'utf8');
        outputContent += formatFileContent(file.relativePath, content);
      } catch (err) {
        console.error(`Error reading file ${file.fullPath}: ${err.message}`);
        outputContent += formatFileContent(
          file.relativePath,
          `ERROR: Could not read file - ${err.message}`
        );
      }
    }

    // Write combined content to output file
    await writeFile(outputFile, outputContent, 'utf8');

    console.log(`\nSuccess! Combined ${files.length} files into ${outputFile}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Run the main function
main();

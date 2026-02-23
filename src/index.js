#!/usr/bin/env node

import { Command } from 'commander';
import { promises as fs } from 'fs';
import yaml from 'js-yaml';
import * as toml from 'toml';
import JSON5 from 'json5';
import { XMLParser } from 'fast-xml-parser';
import handlebars from 'handlebars';
import repeat from "handlebars-helper-repeat";
import helpers from "handlebars-helpers";
import { Liquid } from 'liquidjs';
import ejs from 'ejs';
import nunjucks from 'nunjucks';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

handlebars.registerHelper('repeat', repeat);

helpers({
  handlebars
});

// Configure nunjucks
nunjucks.configure({ autoescape: false });

async function fetchFile(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function getFileContent(filePath) {
  // Handle @repo/file format for n-p-x GitHub organization
  if (filePath.startsWith('@')) {
    const [, repo, ...pathParts] = filePath.split('/');
    const repoPath = pathParts.join('/');
    const url = `https://raw.githubusercontent.com/n-p-x/${repo}/main/${repoPath}`;
    return fetchFile(url);
  }
  
  // Handle remote URLs
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return fetchFile(filePath);
  }
  
  // Handle local files
  return fs.readFile(filePath, 'utf8');
}

function parseConfig(content, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    switch (ext) {
      case '.json':
        return JSON.parse(content);
      case '.json5':
        return JSON5.parse(content);
      case '.yml':
      case '.yaml':
        return yaml.load(content);
      case '.toml':
        return toml.parse(content);
      case '.xml':
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
          parseAttributeValue: true
        });
        return parser.parse(content);
      default:
        // Try to parse as JSON first, then YAML as fallback
        try {
          return JSON.parse(content);
        } catch {
          return yaml.load(content);
        }
    }
  } catch (error) {
    throw new Error(`Failed to parse config file ${filePath}: ${error.message}`);
  }
}

async function renderTemplate(templateContent, templatePath, data) {
  const ext = path.extname(templatePath).toLowerCase();
  
  try {
    switch (ext) {
      case '.hbs':
      case '.handlebars':
        const template = handlebars.compile(templateContent);
        return template(data);
        
      case '.liquid':
        const liquid = new Liquid();
        return liquid.parseAndRender(templateContent, data);
        
      case '.ejs':
        return ejs.render(templateContent, data);
        
      case '.jinja':
      case '.j2':
        return nunjucks.renderString(templateContent, data);
        
      default:
        // Default to handlebars for unknown extensions
        const defaultTemplate = handlebars.compile(templateContent);
        return defaultTemplate(data);
    }
  } catch (error) {
    throw new Error(`Failed to render template ${templatePath}: ${error.message}`);
  }
}

async function main() {
  const program = new Command();
  
  program
    .name('apparel')
    .description('Fill templates with variables from config files')
    .version('0.0.1')
    .argument('<src>', 'Config file path (local file, URL, or @repo/file format)')
    .argument('<tpl>', 'Template file path (local file, URL, or @repo/file format)')
    .argument('[dst]', 'Output file path (optional, defaults to stdout)')
    .action(async (src, tpl, dst) => {
      try {
        console.error(`Loading config from: ${src}`);
        const configContent = await getFileContent(src);
        const config = parseConfig(configContent, src);
        
        console.error(`Loading template from: ${tpl}`);
        const templateContent = await getFileContent(tpl);
        
        console.error('Rendering template...');
        const output = await renderTemplate(templateContent, tpl, config);
        
        if (dst) {
          // Write to file
          await fs.writeFile(dst, output, 'utf8');
          console.error(`Output written to: ${dst}`);
        } else {
          // Write to stdout
          process.stdout.write(output);
        }
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    });
  
  await program.parseAsync();
}

(async () => {
  await main();
})();

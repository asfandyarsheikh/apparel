# Apparel

A powerful NPX script that fills templates with variables from configuration files. Supports multiple config formats and template engines.

## Features

- **Multiple Config Formats**: JSON, JSON5, YAML, TOML, XML
- **Multiple Template Engines**: Handlebars, EJS, Liquid, Jinja/Nunjucks
- **Local and Remote Files**: Support for local files, URLs, and GitHub repos
- **GitHub Integration**: Use `@repo/file` format to fetch from n-p-x organization
- **Flexible Output**: Write to file or stdout

## Installation

Install globally to use as an NPX command:

```bash
npm install -g apparel
```

Or use directly with npx:

```bash
npx apparel <src> <tpl> [dst]
```

## Usage

```bash
apparel <src> <tpl> [dst]
```

### Arguments

- `src` (required): Config file path
- `tpl` (required): Template file path  
- `dst` (optional): Output file path (defaults to stdout)

### File Sources

Files can be loaded from:

1. **Local files**: `./config.json`, `../templates/email.hbs`
2. **URLs**: `https://example.com/config.json`
3. **GitHub repos**: `@myrepo/config.json` (fetches from `n-p-x/myrepo`)

## Supported Config Formats

| Extension | Format | Parser |
|-----------|--------|---------|
| `.json` | JSON | Native JSON.parse |
| `.json5` | JSON5 | json5 |
| `.yml`, `.yaml` | YAML | js-yaml |
| `.toml` | TOML | toml |
| `.xml` | XML | fast-xml-parser |

## Supported Template Engines

| Extension | Engine | Library |
|-----------|--------|---------|
| `.hbs`, `.handlebars` | Handlebars | handlebars |
| `.ejs` | EJS | ejs |
| `.liquid` | Liquid | liquidjs |
| `.jinja`, `.j2` | Jinja | nunjucks |

## Examples

### Basic Usage

```bash
# JSON config with Handlebars template
apparel config.json template.hbs output.txt

# YAML config with EJS template to stdout
apparel config.yml template.ejs

# Remote config with local template
apparel https://example.com/config.json template.hbs
```

### GitHub Integration

```bash
# Fetch config from n-p-x/configs repo
apparel @configs/prod.json template.hbs

# Fetch both config and template from GitHub
apparel @configs/prod.json @templates/email.hbs output.html
```

### Example Files

#### Config (config.json)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Developer",
  "skills": ["JavaScript", "TypeScript", "Node.js"]
}
```

#### Handlebars Template (template.hbs)
```handlebars
Hello {{name}},

Your role: {{role}}
Skills: {{#each skills}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
```

#### Output
```
Hello John Doe,

Your role: Developer
Skills: JavaScript, TypeScript, Node.js
```

## Template Syntax Examples

### Handlebars
```handlebars
{{name}} - {{email}}
{{#each skills}}
- {{this}}
{{/each}}
```

### EJS
```ejs
<%= name %> - <%= email %>
<% skills.forEach(skill => { %>
- <%= skill %>
<% }); %>
```

### Liquid
```liquid
{{ name }} - {{ email }}
{% for skill in skills %}
- {{ skill }}
{% endfor %}
```

### Jinja/Nunjucks
```jinja
{{ name }} - {{ email }}
{% for skill in skills %}
- {{ skill }}
{% endfor %}
```

## Error Handling

The script provides detailed error messages for:
- File not found or network errors
- Invalid config file format
- Template rendering errors
- Missing required arguments

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test locally
node dist/index.js examples/config.json examples/template.hbs
```

## License

ISC
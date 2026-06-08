# AI Wrapper – Secure AI-Powered Coding Assistant

## Overview

AI Wrapper is a secure AI-assisted coding platform that combines:

* A VS Code extension for AI-powered code generation
* A Node.js backend server
* Local LLM integration (LLaMA via Ollama)
* Security scanning and automatic vulnerability remediation
* Repository-aware code retrieval using GitHub snippets

The goal is to provide developers with secure, context-aware code generation while enforcing OWASP-aligned security practices before any AI-generated code reaches the editor.

---

## Architecture

```text
┌────────────────────┐
│   VS Code Plugin   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│   Node.js Server   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│   Local LLaMA LLM  │
│     (Ollama)       │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ GitHub Snippet DB  │
└────────────────────┘
```

---

## Features

### AI-Powered Code Generation

* Generates executable code from natural language prompts
* Uses local LLaMA models through Ollama
* Returns code-only responses

### Repository-Aware Context Retrieval

* Extracts technical tags from user requests
* Searches GitHub repositories for relevant code snippets
* Provides contextual code generation

### Security-First Design

Before insertion into the editor:

* Sanitizes AI responses
* Blocks dangerous code patterns
* Runs OWASP-inspired vulnerability scans
* Automatically attempts secure code remediation

### Automatic Vulnerability Detection

Detects:

* Code Injection (`eval`)
* Command Injection (`exec`)
* Cross-Site Scripting (`innerHTML`)
* Hardcoded Credentials
* SQL Injection Patterns
* Server-Side Request Forgery (SSRF)

### Auto-Fix Pipeline

When vulnerabilities are found:

1. Security issues are identified
2. AI receives remediation instructions
3. Secure code is regenerated
4. Code is rescanned before insertion

---

## Project Structure

```text
AI-Wrapper/
│
├── code-ai/                 # VS Code Extension
│   ├── src/
│   │   ├── extension.ts
│   │   ├── aiIntegration.ts
│   │   └── securityScanner.ts
│   │
│   └── package.json
│
├── server/
│   ├── routes/
│   ├── services/
│   ├── tools/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## Technology Stack

### Frontend

* TypeScript
* VS Code Extension API

### Backend

* Node.js
* Express.js

### AI Layer

* Ollama
* LLaMA 3

### Security

* OWASP-aligned rules
* Static pattern scanning
* Automated remediation

### Repository Intelligence

* GitHub API
* Snippet Matching Engine

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd AI-Wrapper
```

---

## Setup Backend

```bash
cd server
npm install
```

Create a `.env` file if required.

Start the server:

```bash
npm start
```

Server runs on:

```text
http://localhost:3000
```

---

## Setup Ollama

Install Ollama:

```bash
https://ollama.com
```

Pull LLaMA 3:

```bash
ollama pull llama3
```

Run model:

```bash
ollama run llama3
```

Default endpoint:

```text
http://localhost:11434
```

---

## Setup VS Code Extension

```bash
cd code-ai
npm install
npm run compile
```

Launch extension development mode:

```bash
F5
```

---

## Usage

1. Open VS Code
2. Launch the extension
3. Run:

```text
Get AI-Powered Response
```

4. Enter a prompt such as:

```text
Create an Express.js authentication middleware
```

5. The system will:

* Generate code
* Scan for vulnerabilities
* Auto-remediate insecure patterns
* Insert secure code into the editor

---

## Security Workflow

```text
User Prompt
      │
      ▼
Generate Code
      │
      ▼
Sanitize Output
      │
      ▼
Security Scan
      │
      ▼
Auto-Fix Vulnerabilities
      │
      ▼
Rescan
      │
      ▼
Insert Into Editor
```

---

## Example Security Checks

| Vulnerability          | Severity |
| ---------------------- | -------- |
| eval() usage           | Critical |
| Command execution      | Critical |
| Hardcoded passwords    | High     |
| SQL injection patterns | High     |
| innerHTML assignment   | High     |
| SSRF patterns          | Medium   |

---

## Future Enhancements

* Semantic code search using embeddings
* Multi-repository context retrieval
* Support for GPT, Gemini, Claude, and local models
* Advanced static analysis
* CI/CD integration
* Real-time vulnerability reporting
* Secure code quality scoring

---

## Research Contributions

This project explores:

* Retrieval-Augmented Code Generation (RAG)
* Secure AI-Assisted Software Development
* Automated Vulnerability Remediation
* Context-Aware Developer Assistants
* Local LLM Integration for Privacy-Preserving Development

---

## License

This project is intended for educational, research, and development purposes.

---

## Author

Developed as a secure AI coding assistant focused on combining repository intelligence, local LLMs, and automated security enforcement.

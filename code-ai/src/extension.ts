import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { getAIPoweredBotResponse } from './aiIntegration'

// Typing Effect
async function typeTextInEditor(editor: vscode.TextEditor, text: string) {
    for (let i = 0; i < text.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50))
        editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, text[i])
        })
    }
}

// Handle user input
async function handleUserInput() {
    const prompt = await vscode.window.showInputBox({
        prompt: "Please enter your prompt"
    })

    if (prompt === undefined) return

    const editor = vscode.window.activeTextEditor
    if (!editor) return

    // Display loading message
    editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, 'Fetching Response ...')
    })

    // Fetch Bot Response
    const botResponse = await getAIPoweredBotResponse(prompt)

    // Remove loading message
    const loadingMessageLength = 'Fetching Response ...'.length
    editor.edit(editBuilder => {
        editBuilder.delete(
            new vscode.Range(
                editor.selection.active.translate(0, -loadingMessageLength),
                editor.selection.active
            )
        )
    })

    // Simulate typing effect for the bot Response
    await typeTextInEditor(editor, botResponse)

    // Display completion
    vscode.window.showInformationMessage('Response received and typed')

    // --- NEW: Check for linting errors and prompt to fix ---
    await promptFixLinting(editor)
}

// Function to check ESLint and fix
async function promptFixLinting(editor: vscode.TextEditor) {
    if (!editor.document.fileName.endsWith('.js') && !editor.document.fileName.endsWith('.ts')) {
        return // Only run for JS/TS files
    }

    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders) return
    const workspacePath = workspaceFolders[0].uri.fsPath

    const eslintConfigPath = path.join(workspacePath, 'eslint.config.js')

    // Check if ESLint config exists; if not, create it
    if (!fs.existsSync(eslintConfigPath)) {
        const defaultConfig = `import { FlatCompat } from "eslint-define-config";
const compat = FlatCompat.fromESLint();
export default [
    ...compat.extends("eslint:recommended"),
    {
        files: ["*.js", "*.ts"],
        rules: {
            "no-unused-vars": "warn",
            "semi": ["error", "always"],
            "quotes": ["error", "double"]
        },
    },
];`
        fs.writeFileSync(eslintConfigPath, defaultConfig, { encoding: 'utf8' })
        vscode.window.showInformationMessage('Created default eslint.config.js in workspace.')
    }

    // Install necessary ESLint packages if not present
    const nodeModulesPath = path.join(workspacePath, 'node_modules')
    if (!fs.existsSync(nodeModulesPath) || !fs.existsSync(path.join(nodeModulesPath, 'eslint'))) {
        vscode.window.showInformationMessage('Installing ESLint packages...')
        exec(`npm install eslint eslint-define-config --save-dev`, { cwd: workspacePath }, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error installing ESLint: ${error.message}`)
                return
            }
            vscode.window.showInformationMessage('ESLint packages installed successfully.')
            runEslintFix(editor, eslintConfigPath)
        })
    } else {
        runEslintFix(editor, eslintConfigPath)
    }
}

// Run ESLint fix on the current file
function runEslintFix(editor: vscode.TextEditor, eslintConfigPath: string) {
    const terminal = vscode.window.createTerminal({ name: 'ESLint Fix' })
    terminal.show()
    terminal.sendText(`npx eslint --config "${eslintConfigPath}" --fix "${editor.document.fileName}"`)
    vscode.window.showInformationMessage('ESLint fix applied to current file.')
}

// Activate extension
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.getAIPoweredBotResponse', async () => {
        await handleUserInput()
    })
    context.subscriptions.push(disposable)
}

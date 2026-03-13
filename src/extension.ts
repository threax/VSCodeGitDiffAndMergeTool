// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	function getRelativeItemPath(projectPath: string, fullTargetFilePath: string): string | null {
		var relativeFilePath = fullTargetFilePath.replace(projectPath, '');
		// remove first / or \
		if (relativeFilePath[0] === '/' || relativeFilePath[0] === '\\') {
			relativeFilePath = relativeFilePath.slice(1, relativeFilePath.length);
		}

		return relativeFilePath;
	}

	async function executeOperation(
		commandParam: any,
		gitArgumentsFunc: (targetFile: string) => string[],
		infoMessageFunc: (targetFile: string) => string): Promise<void> {
		if (!commandParam) {
			vscode.window.showErrorMessage('Could not launch merge tool. VSCode did not supply command parameters. Try again in a few seconds.');
			return;
		}

		const fullTargetFilePath: string = commandParam.resourceUri.fsPath;

		if (vscode.workspace.workspaceFolders) {
			// Look through the workspace folders and find the one that has our file.
			for (let workspaceFolder of vscode.workspace.workspaceFolders) {
				const projectPath = workspaceFolder.uri.fsPath;
				if (fullTargetFilePath.startsWith(projectPath)) {
					var targetFile = getRelativeItemPath(projectPath, fullTargetFilePath);
					if (targetFile === null) {
						vscode.window.showErrorMessage('Could not get target path.');
						return;
					}

					const notifyOnOpen = vscode.workspace.getConfiguration('git-diff-and-merge-tool').get('showNotificationOnOpen');
					if (notifyOnOpen) {
						vscode.window.showInformationMessage(infoMessageFunc(targetFile));
					}

					const git = spawn('git', gitArgumentsFunc(targetFile), {
						cwd: workspaceFolder.uri.fsPath
					});

					// Handle process output streams
					git.stdout.on('data', (data) => {
						console.log(`stdout: ${data}`);
					});

					git.stderr.on('data', (data) => {
						console.error(`stderr: ${data}`);
					});

					await new Promise((resolve) => {
						git.on('close', (code) => {
							console.log(`Child process exited with code ${code}`);
							resolve(0);
						});
					});

					return;
				}
			}

			vscode.window.showErrorMessage('Could not find workspace for ' + fullTargetFilePath);
		}
	}

	let diffCommand = vscode.commands.registerCommand('gitdiffandmergetool.diff', (param: any) => {
		executeOperation(
			param,
			(targetFile: string) => { return ['difftool', '-t', path.extname(targetFile), '-y', targetFile]; },
			(targetFile: string) => { return 'Launching diff tool for ' + targetFile; });
	});

	let mergeCommand = vscode.commands.registerCommand('gitdiffandmergetool.merge', async (param: any) => {
		executeOperation(
			param,
			(targetFile: string) => { return ['mergetool', '-t', path.extname(targetFile), '-y', targetFile]; },
			(targetFile: string) => { return 'Launching merge tool for ' + targetFile; });
	});

	context.subscriptions.push(mergeCommand);
	context.subscriptions.push(diffCommand);
}

// This method is called when your extension is deactivated
export function deactivate() { }

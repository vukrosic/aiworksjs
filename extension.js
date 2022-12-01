const vscode = require('vscode');
const { Configuration, OpenAIApi } = require("openai");


let API_KEY = "YOUR_API_KEY";
let model1 = "code-davinci-002";
// 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

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	
	//console.log('Congratulations, your extension "aiworksjs" is now active!');

	let max_tokens = 256;

	let attributes = vscode.commands.registerCommand('aiworksjs.setAttributes', async function () {
		vscode.window.showInputBox({ prompt: "OpenAI Codex: Enter max length!" }).then(max_tokens1 => {
			console.log(max_tokens1);
			max_tokens = max_tokens1;
		});
	});

	let apiKey = vscode.commands.registerCommand('aiworksjs.setAPIKey', async function () {
		vscode.window.showInputBox({ prompt: "OpenAI Codex: Enter API Key!" }).then(API_KEY1 => {
			console.log(API_KEY1);
			API_KEY = API_KEY1;
		});
	});

	let model = vscode.commands.registerCommand('aiworksjs.setModel', async function () {
		const options = ["code-davinci-002", "code-cushman-001", "text-davinci-003", "text-curie-001", "text-babbage-001", "text-ada-001"];
		const quickPick = vscode.window.createQuickPick();
		quickPick.items = Object.values(options).map(label => ({ label }));
		// set model1 to the selected model
		model1 = await new Promise(resolve => {
			quickPick.onDidChangeSelection(selection => resolve(selection[0].label));
			quickPick.onDidHide(() => resolve(undefined));
			// close
			quickPick.show();
			// on selected close the quick pick
			quickPick.onDidChangeSelection(selection => quickPick.hide());
		});
		console.log(model1);

		quickPick.onDidHide(() => quickPick.dispose());
		// on selected model, set model1 to the selected model
	});
	
	// this model quick pick will activate when the user presses ctrl+shift+p and types "OpenAI Codex: Set Model"


	let disposable = vscode.commands.registerCommand('aiworksjs.wtffff', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Retrieving Codex generation!');
		// get selected text
		const editor = vscode.window.activeTextEditor;
		const selection = editor.selection;
		const text = editor.document.getText(selection);

		
		

	// convert text to string
	callOpenAI(text.toString(), max_tokens);
});



	



	context.subscriptions.push(disposable);
	context.subscriptions.push(attributes);
	context.subscriptions.push(apiKey);
	context.subscriptions.push(model);
	//context.subscriptions.push(change);

}

function deactivate() {}


async function callOpenAI(prompt1, max_tokens1) {
	// let change = vscode.workspace.onDidChangeTextDocument(async event => {

		const configuration = new Configuration({
			apiKey: API_KEY,
		});
		const openai = new OpenAIApi(configuration);
		let response = ""
		// put this into try ca
		try {
		response = await openai.createCompletion({
			model: model1,
			prompt: prompt1,
			temperature: 0,
			max_tokens: max_tokens1,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		  });
		}
		catch (error) {
			vscode.window.showErrorMessage('OpenAI Codex: Error! Ctrl+Shift+P & "OpenAI Codex: Set API Key" to set your API Key!');
		}
	

		  // write response to the next line in the editor
		  let responseText = response.data.choices[0].text;
		  const editor = vscode.window.activeTextEditor;
		  // write responseText to the next line
		  editor.edit(editBuilder => {
			editBuilder.insert(new vscode.Position(editor.selection.end.line + 1, 0), responseText);
		  });
		console.log(responseText);
		console.log("\n\n\n");
		console.log(prompt1);
}




module.exports = {
	activate,
	deactivate
}

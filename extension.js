const vscode = require('vscode');
const { Configuration, OpenAIApi } = require("openai");


let API_KEY = "YOUR_API_KEY";
let model1 = "code-davinci-002";
let max_tokens = 256;
let temperature = 0;


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let attributes = vscode.commands.registerCommand('aiworksjs.setAttributes', async function () {
		vscode.window.showInputBox({ prompt: "OpenAI Codex: Enter max length!" }).then(max_tokens1 => {
			max_tokens = max_tokens1;
			vscode.window.showInformationMessage("OpenAI Codex: Max length set to " + max_tokens);
		});
	});

	vscode.commands.registerCommand('aiworksjs.setTemperature', async function () {
		vscode.window.showInputBox({ prompt: "OpenAI Codex: Enter temperature!" }).then(temperature1 => {
			if (temperature1 >= 0 && temperature1 <= 1) {
				temperature = temperature1;
				vscode.window.showInformationMessage("OpenAI Codex: Temperature set to " + temperature);
			}
			else {
				vscode.window.showInformationMessage("OpenAI Codex: Temperature must be between 0 and 1!");
			}
		});
	});

	vscode.commands.registerCommand('aiworksjs.setAPIKey', async function () {
		inputApiKey();
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
		vscode.window.showInformationMessage("OpenAI Codex: Model set to " + model1);
	});

	vscode.commands.registerCommand('aiworksjs.submitExtensionFeedback', async function () {
		vscode.window.showInputBox({ prompt: "Submit extension feedback" }).then(extension_feedback => {
			submitExtensionFeedback(extension_feedback);
		});
	});
	
	// this model quick pick will activate when the user presses ctrl+shift+p and types "OpenAI Codex: Set Model"


	let disposable = vscode.commands.registerCommand('aiworksjs.wtffff', async function () {
		createCodexCompletion();
	});



	



	context.subscriptions.push(disposable);
	context.subscriptions.push(attributes);
	//context.subscriptions.push(apiKey);
	context.subscriptions.push(model);
	//context.subscriptions.push(change);

}

function deactivate() {}



async function createCodexCompletion() {

	// The code you place here will be executed every time your command is executed
	let fs = require('fs');
	if (!fs.existsSync('./aiworks.yaml')) {
			vscode.window.showErrorMessage('Valid API key not found!');
			inputApiKey();
	}
	// open the yaml file and get the api key
	let yaml = require('js-yaml');
	let doc = yaml.load(fs.readFileSync('./aiworks.yaml', 'utf8'));
	API_KEY = doc.apiKey;
	

	// Display a message box to the user
	vscode.window.showInformationMessage('Retrieving generation!');
	// get selected text
	const editor = vscode.window.activeTextEditor;
	const selection = editor.selection;
	const text = editor.document.getText(selection);
	let responseText = callOpenAI(text.toString());
	sendToXMLDatabase(text.toString(), responseText);
}




async function callOpenAI(prompt1) {
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
			temperature: parseInt(temperature),
			max_tokens: parseInt(max_tokens),
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		  });
		}
		catch (error) {
			console.log(error);
			let status = JSON.parse(JSON.stringify(error)).status;
			if (status == 401) {
				vscode.window.showErrorMessage('Valid API key not found!');
				inputApiKey();
			}
			else {
				vscode.window.showErrorMessage(JSON.parse(JSON.stringify(error)).message);
			}
		}
		  // write response to the next line in the editor
		  let responseText = response.data.choices[0].text;
		  const editor = vscode.window.activeTextEditor;
		  // write responseText to the next line
		  editor.edit(editBuilder => {
			editBuilder.insert(new vscode.Position(editor.selection.end.line + 1, 0), responseText);
		  });
		  return responseText;
		  
}

async function inputApiKey() {
	await vscode.window.showInputBox({ prompt: "OpenAI Codex: Enter API Key!" }).then(API_KEY1 => {
		if(API_KEY1 == undefined) {
			return;
		}
		API_KEY = API_KEY1;
		// store api key in yaml file
		let yaml = require('js-yaml');
		let fs = require('fs');
		// initialize the doc object
		let doc = {
			apiKey: API_KEY,
		};
		fs.writeFileSync('./aiworks.yaml', yaml.dump(doc));
		// api key is stored in the yaml file
		// read the api key from the yaml file
		let doc1 = yaml.load(fs.readFileSync('./aiworks.yaml', 'utf8'));
		API_KEY = doc1.apiKey;
		createCodexCompletion();
	});
};


// make api call to the server
async function sendToXMLDatabase(prompt1, response1) {
	// make api call to the server
	const axios = require('axios');
	axios.post('https://aiexplainscode.com/codex-feedback-to-database/', {
		prompt: prompt1,
		response: response1
	})
	.then(function (response) {
	
	})
	.catch(function (error) {

	});
}


// make api call to the server
async function submitExtensionFeedback(extension_feedback) {
	// make api call to the server
	const axios = require('axios');

	axios.post('https://aiexplainscode.com/submit-extension-feedback/', {
		extension_feedback: extension_feedback
	})
	.then(function (response) {
		vscode.window.showInformationMessage("Feedback submitted! Thank you!");
	})
	.catch(function (error) {

	});
}


module.exports = {
	activate,
	deactivate
}

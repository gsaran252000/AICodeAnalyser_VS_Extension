const vscode = require('vscode');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyBc7dqqVCykOu7zHgatExkU-BRkMQ0HQu0");

async function run(extension, selectedtext, editor, option) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  let input_text = "";
  if(option === 1){
    input_text = "explain the below" + extension +" lines of code, do not give corrected code.\n\n"+selectedtext;
  } else{
    input_text = "Add Comments to the below" + extension +" lines of code, Do not add any additional changes to the code interms of functionality and keep the comments presise\n\n"+selectedtext;
  }

  vscode.window.showInformationMessage('Processing.....');
  const result = await model.generateContent(input_text);
  const response = await result.response;
  let text = response.text();
  let output = "";

  if(option === 1) {
    if(extension === ".py"){
      output = "\n\"\"\"\"\n"+text+"\n\"\"\"\n"+selectedtext;
      } else{
      output = "\n/*\n"+text+"\n*/\n"+selectedtext;
      }
    
      editor.edit(editBuilder => {
      editBuilder.replace(editor.selection, output);
      });
  } else {
    if(text.includes("```")){
      console.log("Contains backticks\n");
      text.replace(/^```([a-zA-Z]+)?\n?([\s\S]*?)\n?```$/gm, '$2');
    } 
      editor.edit(editBuilder => {
      editBuilder.replace(editor.selection, text);
      });
  }
//
 
 }

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	let disposableSummarise = vscode.commands.registerCommand('code-analyse-gpt.addSummarise', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No text selected!');
            return;
        }

        const selectedText = editor.document.getText(editor.selection);
        const fileName = editor.document.fileName;
        const extension = fileName.match(/\.(\w+)$/)[0];

		  run(extension, selectedText, editor, 1);
    });

    let disposableAddComments = vscode.commands.registerCommand('code-analyse-gpt.addComments', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
          vscode.window.showInformationMessage('No text selected!');
          return;
      }
      const selectedText = editor.document.getText(editor.selection);
      const fileName = editor.document.fileName;
      const extension = fileName.match(/\.(\w+)$/)[0];

      run(extension, selectedText, editor, 2);
  });

  context.subscriptions.push(disposableAddComments);
  context.subscriptions.push(disposableSummarise);

  }

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

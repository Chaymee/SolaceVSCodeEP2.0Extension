// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const eventPortal = require('@solace-community/eventportal');
import { epToken } from './token';




// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	vscode.window.registerTreeDataProvider(
		'applicationDomains',
		new TreeDataProvider()
	  );


	  /*
	const disposable = vscode.commands.registerCommand('solace.eventportal', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});
	*/



	//context.subscriptions.push(disposable);
	
}

export async function getEPData(): Promise<Array<Object>>{
	const token = epToken;
	// Create the Event Portal object
	const ep = new eventPortal(epToken);
	let completeDomains = [];
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "solaceepplugin" is now active!');
	try {
		let domains = await ep.getApplicationDomains();
		completeDomains = await Promise.all(domains.data.map(async(domain: { id: any; applications: any; events: any; schemas: any; }) =>{
			console.log(domain.id);
			//results.push(await ep.getApplicationDomainByID(domain.id));
			const myApplications = await ep.getApplications(domains.data.id);
			domain.applications = myApplications;
			const myEvents = await ep.getEvents(domains.data.id);
			domain.events = myEvents;
			const mySchemas = await ep.getSchemas(domains.data.id);
			domain.schemas = mySchemas;
			return domain;
		}));
		console.log("completeDomains " + completeDomains[0].name);
		console.log(completeDomains);
	} catch (e: unknown) {
		if (typeof e === "string") {
			e.toUpperCase();
		} else if (e instanceof Error) {
			e.message;
		}
	}
	return Promise.resolve(completeDomains);
}



// Build an object that represents a complete Event Portal App Domain
class EPDomain {

}

// Build an object that represents an Event Portal App
class EPApp {

}

// Build an object that represents an Event Portal Event
class EPEvent {

}


// Build an object that represents an Event Portal Schema


// this method is called when your extension is deactivated
export function deactivate() {}


export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
	onDidChangeTreeData?: vscode.Event<TreeItem | null | undefined> | undefined;

	data: TreeItem[];
	
	constructor() {
		let obj = getEPData();
		this.data = obj.then((domains) => {
			let result;
			result = ( domains.map((domain) => {
				return domain.name;
			}))
			//console.log(result[0]);
			let temp = [new TreeItem('Domain',
			domains.map((domain) => {
				return new TreeItem(domain.name, 
				[
					new TreeItem('applications',
					(domain.applications.data).map((app) => {
						return new TreeItem(app.name);
					})),
					new TreeItem('events', 
						(domain.events.data).map((event) => {
							return new TreeItem(event.name);
						})
					),
					new TreeItem('schemas',
					(domain.schemas.data).map((schema) => {
						return new TreeItem(schema.name);
					})
					)
				]);
			})
			/* result.map((result) => {
				console.log(result);
				return new TreeItem((result));
			}) */
			)]
			console.log(temp);
			return Promise.resolve(temp);
		})
	}
	getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
		return element;
			
	   }
	
		getChildren(element?: TreeItem|undefined): vscode.ProviderResult<TreeItem[]> {
			if (element === undefined) {
				return this.data;
			}
			return element.children;
	   	}
}

class TreeItem extends vscode.TreeItem {
	children: TreeItem[]|undefined;

	constructor(label: string, children?: TreeItem[]) {
		super(
			label,
			children === undefined ? vscode.TreeItemCollapsibleState.None : 
									vscode.TreeItemCollapsibleState.Expanded);
		
		this.children = children;
	}
}


// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;

// This is based on the scriptdude installer script and modified to manage the Ford Widget script
const scriptSrcUrl = 'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/docs/FordWidgetTool.js';
const scriptName = 'FordWidgetTool';
const scriptDocsUrl = 'https://github.com/tonesto7/fordpass-scriptable#readme';
const scriptGlyph = 'magic';
const scriptColor = 'blue';

class WidgetInstaller {
    constructor(hoehe, breite) {
        this.fileManager = FileManager.iCloud();
        this.documentsDirectory = this.fileManager.documentsDirectory();
    }

    hashCode(input) {
        return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0);
    }

    async installScript(name, sourceUrl, documentationUrl, icon, color, showMessage) {
        let filePath = this.fileManager.joinPath(this.documentsDirectory, name + '.js');
        let req = new Request(sourceUrl);
        let code = await req.loadString();
        let hash = this.hashCode(code);
        let codeToStore = Data.fromString(
            `// Variables used by Scriptable.\n// These must be at the very top of the file. Do not edit.\n// icon-color: ${color}; icon-glyph: ${icon};\n// This script was downloaded using FordWidgetTool.\n// Do not remove these lines, if you want to benefit from automatic updates.\n// source: ${sourceUrl}; docs: ${documentationUrl}; hash: ${hash};\n\n${code}`,
        );
        this.fileManager.write(filePath, codeToStore);
        let selfFilePath = this.fileManager.joinPath(this.documentsDirectory, Script.name() + '.js');
        this.fileManager.remove(selfFilePath);
        let callback = new CallbackURL('scriptable:///run');
        callback.addParameter('scriptName', scriptName);
        callback.open();
    }
}

await new WidgetInstaller().installScript(scriptName, scriptSrcUrl, scriptDocsUrl, scriptGlyph, scriptColor, false);

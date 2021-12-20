const url = 'https://scriptdu.de/script.js';

class ScriptDudeInstaller {
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
            `// Variables used by Scriptable.\n// These must be at the very top of the file. Do not edit.\n// icon-color: ${color}; icon-glyph: ${icon};\n// This script was downloaded using ScriptDude.\n// Do not remove these lines, if you want to benefit from automatic updates.\n// source: ${sourceUrl}; docs: ${documentationUrl}; hash: ${hash};\n\n${code}`,
        );
        this.fileManager.write(filePath, codeToStore);
        // let selfFilePath = this.fileManager.joinPath(this.documentsDirectory, Script.name() + '.js');
        // this.fileManager.remove(selfFilePath);
        let callback = new CallbackURL('scriptable:///run');
        callback.addParameter('scriptName', 'Fordpass Widget');
        callback.open();
    }
}

await new ScriptDudeInstaller().installScript('ScriptDude', url, 'https://scriptdu.de/', 'user-astronaut', 'blue', false);

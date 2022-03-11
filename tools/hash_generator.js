const fs = require('fs');
const path = require('path');
class WidgetInstaller {
    constructor() {}

    async hashCode(input) {
        return Array.from(input).reduce((accumulator, currentChar) => (accumulator << 5) - accumulator + currentChar.charCodeAt(0), 0);
        // return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0);
    }

    async processModulesFolder() {
        try {
            const modulesFolder = path.join(__dirname, '../Modules');
            const modules = fs.readdirSync(modulesFolder).filter((file) => file.endsWith('.js'));
            console.log(JSON.stringify(modules));
            let modulesOut = [];
            if (modules.length) {
                console.log(`Info: Processing Modules: ${modules.length}`);
                for (const [i, module] of modules.entries()) {
                    let buffer = fs.readFileSync(path.join(modulesFolder, module));
                    const code = buffer.toString();
                    let hash = await this.hashCode(code);
                    // console.log(`Info: Module ${module} hash: ${hash}`);
                    modulesOut.push(`${module}||${hash}`);
                }
                await this.saveModuleConfig(modulesOut.sort());
            }
            return;
        } catch (e) {
            console.error(`proceModulesFolder | Error: ${e}`);
        }
    }

    async saveModuleConfig(output) {
        try {
            let filePath = path.join(__dirname, '../', 'module_hashes.json');
            fs.writeFileSync(filePath, `${JSON.stringify({ hashes: output })}`);
            console.log(JSON.stringify(output));
            return true;
        } catch (e) {
            console.error(`saveModuleConfig() Error: ${e}`);
            return false;
        }
    }
}

const wI = new WidgetInstaller();

wI.processModulesFolder();
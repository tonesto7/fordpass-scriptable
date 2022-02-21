// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;

// This is based on the scriptdude installer https://github.com/kevinkub/scriptdu.de script and modified to manage the Ford Widget script

const SCRIPT_VERSION = '1.0.0';

class WidgetInstaller {
    constructor() {
        this.localFileManager = FileManager.local();
        this.localDocDirectory = this.localFileManager.documentsDirectory();
        this.icloudFileManager = FileManager.iCloud();
        this.icloudDocDirectory = this.icloudFileManager.documentsDirectory();
    }

    async hashCode(input) {
        return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0);
    }

    async showAlert(title, message) {
        let alert = new Alert();
        alert.title = title;
        alert.message = message;
        alert.addAction('OK');
        const respInd = await alert.presentAlert();
        // console.log(`showAlert Response: ${respInd}`);
        switch (respInd) {
            case 0:
                // console.log(`${title} alert was cleared...`);
                return true;
        }
    }

    async proceModulesFolder() {
        try {
            const modulesFolder = this.icloudFileManager.joinPath(this.icloudDocDirectory, 'FPWModules');
            const modules = await this.icloudFileManager.listContents(modulesFolder);
            // console.log(JSON.stringify(modules));
            let modulesOut = [];
            if (modules.length) {
                console.log(`Info: Processing Modules: ${modules.length}`);
                for (const [i, module] of modules.entries()) {
                    let code = await this.icloudFileManager.readString(this.icloudFileManager.joinPath(modulesFolder, module));
                    let hash = await this.hashCode(code);
                    console.log(`Info: Module ${module} hash: ${hash}`);
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
            let filePath = this.icloudFileManager.joinPath(this.icloudDocDirectory, 'modules_config.json');
            let data = Data.fromString(`${JSON.stringify(output)}`);
            this.icloudFileManager.write(filePath, data);
            return true;
        } catch (e) {
            console.error(`saveModuleConfig() Error: ${e}`);
            return false;
        }
    }
}

const wI = new WidgetInstaller();

async function menuBuilderByType(type) {
    try {
        let title = undefined;
        let message = undefined;
        let items = [];
        switch (type) {
            case 'main':
                title = `FordWidget Tool Menu`;
                message = `Tool Version: (${SCRIPT_VERSION})`;
                items = [{
                        title: `Generate Module Config File`,
                        action: async() => {
                            console.log('(Main Menu) Generate Config was pressed');
                            await wI.proceModulesFolder();
                        },
                        destructive: false,
                        show: true,
                    },
                    {
                        title: 'Exit',
                        action: async() => {
                            console.log(`(${type} Menu) Exit was pressed`);
                        },
                        destructive: false,
                        show: true,
                    },
                ];
                break;
        }
        if (title.length > 0 && items.length > 0) {
            let menuItems = items.filter((item) => item.show === true);
            // console.log(`subcontrol menuItems(${menuItems.length}): ${JSON.stringify(menuItems)}`);
            const menu = new Alert();
            menu.title = title;
            menu.message = message;
            menuItems.forEach((item, ind) => {
                if (item.destructive) {
                    menu.addDestructiveAction(item.title);
                } else {
                    menu.addAction(item.title);
                }
            });
            const respInd = await menu.presentSheet();
            if (respInd !== null) {
                const menuItem = menuItems[respInd];
                // console.log(`(Sub Control Menu) Selected: ${JSON.stringify(menuItem)}`);
                menuItem.action();
            }
        }
    } catch (e) {
        console.log(`menuBuilderByType | Error: ${e}`);
    }
}

if (config.runsInApp || config.runsFromHomeScreen) {
    console.log('start | showing Main Menu');
    menuBuilderByType('main');
}
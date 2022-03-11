// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;

// This is based on the scriptdude installer https://github.com/kevinkub/scriptdu.de script and modified to manage the Ford Widget script

const SCRIPT_VERSION = '1.0.0';

class WidgetInstaller {
    constructor() {
        this.localFm = FileManager.local();
        this.localDocs = this.localFm.documentsDirectory();
        this.icloudFm = FileManager.iCloud();
        this.icloudDocs = this.icloudFm.documentsDirectory();
    }

    async hashCode(input) {
        return Array.from(input).reduce((accumulator, currentChar) => (accumulator << 5) - accumulator + currentChar.charCodeAt(0), 0);
        // return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0);
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

    async processModulesFolder() {
        try {
            const localModsFolder = this.localFm.joinPath(this.localDocs, 'FPWModules');
            const localMods = this.localFm
                .listContents(localModsFolder)
                .filter((item) => item.endsWith('.js'))
                .sort();
            const icloudModsFolder = this.icloudFm.joinPath(this.icloudDocs, 'FPWModules');
            const icloudMods = this.icloudFm
                .listContents(icloudModsFolder)
                .filter((item) => item.endsWith('.js'))
                .sort();

            let modulesOut = { iCloud: [], Local: [] };
            // console.log(JSON.stringify(modules));
            if (localMods.length > 0) {
                console.log(`Info: Processing Local Modules: ${localMods.length}`);
                for (const [i, module] of localMods.entries()) {
                    let code = this.localFm.readString(this.localFm.joinPath(localModsFolder, module));
                    let hash = await this.hashCode(code);
                    // console.log(`Info: Module ${module} hash: ${hash}`);
                    modulesOut.Local.push(`${module}||${hash}`);
                }
            }

            if (icloudMods.length > 0) {
                console.log(`Info: Processing iCloud Modules: ${icloudMods.length}`);
                for (const [i, module] of icloudMods.entries()) {
                    let code = this.icloudFm.readString(this.icloudFm.joinPath(icloudModsFolder, module));
                    let hash = await this.hashCode(code);
                    // console.log(`Info: Module ${module} hash: ${hash}`);
                    modulesOut.iCloud.push(`${module}||${hash}`);
                }
            }
            let filePath = this.icloudFm.joinPath(this.icloudDocs, 'modules_config.json');
            let data = Data.fromString(`${JSON.stringify(modulesOut)}`);
            this.icloudFm.write(filePath, data);
            console.log(JSON.stringify(modulesOut));
        } catch (e) {
            console.error(`proceModulesFolder | Error: ${e}`);
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
    // menuBuilderByType('main');
    await wI.processModulesFolder();
}
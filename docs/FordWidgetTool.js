// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;

// This is based on the scriptdude installer https://github.com/kevinkub/scriptdu.de script and modified to manage the Ford Widget script

const SCRIPT_VERSION = '2.0.0';
const maxSupportedInstance = 10;
const configUrl = `https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/docs/config.json`;

class WidgetInstaller {
    constructor() {
        this.localFileManager = FileManager.local();
        this.localDocDirectory = this.localFileManager.documentsDirectory();
        this.icloudFileManager = FileManager.iCloud();
        this.icloudDocDirectory = this.icloudFileManager.documentsDirectory();
        this.scriptConfig = {
            scriptName: 'Fordpass Widget',
            scriptColor: 'blue',
            scriptGlyph: 'car',
            sourceUrl: 'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Fordpass%20Widget.js',
            sourceModules: [
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Alerts.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Files.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_FordAPIs.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Keychain.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Menus.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Notifications.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_ShortcutParser.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Tables.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Tables_AlertPage.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Tables_ChangesPage.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Tables_MainPage.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Tables_MessagePage.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Tables_RecallPage.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Tables_WidgetStylePage.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Timers.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Widgets_Helpers.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Widgets_Small.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Widgets_Medium.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Widgets_Large.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Widgets_ExtraLarge.js',
            ],
            docsUrl: 'https://github.com/tonesto7/fordpass-scriptable#readme',
            cleanup: {
                keys: ['fpToken', 'fpToken2', 'fpUsername', 'fpUser', 'fpPass', 'fpPassword', 'fpVin', 'fpUseMetricUnits', 'fpUsePsi', 'fpVehicleType', 'fpMapProvider', 'fpCat1Token', 'fpTokenExpiresAt', 'fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits', 'fpSpeedUnits'],
                files: [
                    'gas-station_dark.png',
                    'gas-station_light.png',
                    'lock_dark.png',
                    'lock_light.png',
                    'tire_dark.png',
                    'tire_light.png',
                    'unlock_dark.png',
                    'unlock_light.png',
                    'battery_dark.png',
                    'battery_light.png',
                    'door_dark.png',
                    'door_light.png',
                    'window_dark.png',
                    'window_light.png',
                    'oil_dark.png',
                    'oil_light.png',
                    'key_dark.png',
                    'key_light.png',
                    'location_dark.png',
                    'location_light.png',
                    'ev_battery_dark.png',
                    'ev_battery_light.png',
                    'ev_plug_dark.png',
                    'ev_plug_light.png',
                    'vehicle_image.png',
                    'fp_vehicleData.json',
                ],
            },
        };
        this.widgetModules = [''];
    }

    hashCode(input) {
        return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0);
    }

    async getScriptConfig() {
        let req = new Request(await this.getConfigUrl());
        req.headers = {
            'Content-Type': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
        };
        req.method = 'GET';
        req.timeoutInterval = 10;
        try {
            let data = await req.loadJSON();
            if (data && data.scriptName) {
                this.scriptConfig = data;
            }
        } catch (e) {
            console.log(`getScriptConfig Error: Could Not Load Config File | ${e}`);
        }
    }

    async getConfigUrl() {
        const releaseMode = await this.getReleaseMode();
        return releaseMode === 'beta' ? configUrl.replace('main', 'beta') : configUrl;
    }

    async getDocUrl() {
        const releaseMode = await this.getReleaseMode();
        return releaseMode === 'beta' ? this.scriptConfig.docsUrl.replace('#readme', '/blob/beta/README.md') : this.scriptConfig.docsUrl;
    }

    async getSrcUrl() {
        const releaseMode = await this.getReleaseMode();
        return releaseMode === 'beta' ? this.scriptConfig.sourceUrl.replace('main', 'beta') : this.scriptConfig.sourceUrl;
    }

    async getSrcReleaseUrl(url) {
        const releaseMode = await this.getReleaseMode();
        return releaseMode === 'beta' ? url.replace('main', 'beta') : url;
    }

    async getReleaseMode() {
        return (await wI.getKeychainValue('fpWtReleaseMode')) || 'public';
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

    async toggleReleaseMode() {
        let releaseMode = await this.getReleaseMode();
        await this.setKeychainValue('fpWtReleaseMode', releaseMode === 'beta' ? 'public' : 'beta');
    }

    async getKeychainValue(key) {
        try {
            if (await Keychain.contains(key)) {
                return await Keychain.get(key);
            }
        } catch (e) {
            console.log(`getKeychainValue(${key}) Error: ${e}`);
        }
        return null;
    }

    async setKeychainValue(key, value) {
        if (key && value) {
            await Keychain.set(key, value);
        }
    }

    async hasKeychainValue(key) {
        return await Keychain.contains(key);
    }

    // removes a keychain value pair based on the key and id
    async removeKeychainValue(key, id) {
        key = id !== null && id !== undefined && id > 0 ? `${key}_${id}` : key;
        if (await Keychain.contains(key)) {
            await Keychain.remove(key);
        }
    }

    // removes a script, its keychain, and files based on the id
    async clearDataForId(id) {
        console.log('Info: Clearing Keychain and File Data for ID: ' + id);
        const keys = this.scriptConfig.cleanup.keys;
        for (const key in keys) {
            await this.removeKeychainValue(keys[key], id);
        }
        let files2Del = [`vehicle_image${id === 0 ? '' : id}.png`, `vehicle_data_${id === 0 ? '' : id}.json`];
        files2Del.forEach(async(file) => {
            let filePath = this.localFileManager.joinPath(this.localDocDirectory, file);
            if (await this.localFileManager.fileExists(filePath)) {
                console.log('Info: Deleting file: ' + file);
                await this.localFileManager.remove(filePath);
            }
        });
    }

    // removes all scripts, their keychains, and files (Full purge)
    async removeAllInstances() {
        // console.log('getAllInstances');
        let fnd = await this.getAllInstances();
        for (let i = 0; i < fnd.length; i++) {
            await this.removeInstance(fnd[i]);
        }
        const files = this.scriptConfig.cleanup.files;
        for (let i = 0; i < files.length; i++) {
            let filePath = this.localFileManager.joinPath(this.localDocDirectory, files[i]);
            if (await this.localFileManager.fileExists(filePath)) {
                console.log('Info: Deleting file: ' + files[i]);
                await this.localFileManager.remove(filePath);
            }
        }
    }

    async removeInstance(name) {
        console.log(`removeInstance(${name})`);
        try {
            let filePath = this.icloudFileManager.joinPath(this.icloudDocDirectory, name + '.js');
            if (await this.icloudFileManager.fileExists(filePath)) {
                let id = await this.getIdFromFIle(name);
                await this.clearDataForId(id);
                await this.icloudFileManager.remove(filePath);
                return true;
            }
        } catch (e) {
            console.error(`removeInstance | Error: ${e}`);
        }
        return false;
    }

    async getAllInstances() {
        // console.log('getAllInstances');
        let fnd = [];
        for (let i = 0; i < 10; i++) {
            let n = i >= 1 ? `${this.scriptConfig.scriptName} ${i + 1}` : this.scriptConfig.scriptName;
            let file = this.icloudFileManager.joinPath(this.icloudDocDirectory, n + '.js');
            if (await this.icloudFileManager.fileExists(file)) {
                fnd.push(n);
            }
        }
        return fnd;
    }

    async getNextInstanceId() {
        let miss = [];
        for (let i = 0; i < maxSupportedInstance; i++) {
            let n = i >= 1 ? `${this.scriptConfig.scriptName} ${i + 1}` : this.scriptConfig.scriptName;
            let file = this.icloudFileManager.joinPath(this.icloudDocDirectory, n + '.js');
            if (!(await this.icloudFileManager.fileExists(file))) {
                miss.push(i);
            }
        }
        // console.log(miss[0] >= 1 ? miss[0] + 1 : miss[0]);
        return miss[0] ? (miss[0] >= 1 ? miss[0] + 1 : miss[0]) : undefined;
    }

    getIdFromCode(code) {
        let match = code.match(/const SCRIPT_ID = [0-9]+;/);
        if (match && match[0]) {
            return match[0].split('=')[1].trim().replace(';', '');
        } else {
            return 0;
        }
    }

    async getIdFromFIle(file) {
        let filePath = this.icloudFileManager.joinPath(this.icloudDocDirectory, file + '.js');
        if (await this.icloudFileManager.fileExists(filePath)) {
            let code = await this.icloudFileManager.readString(filePath);
            return await this.getIdFromCode(code);
        } else {
            return undefined;
        }
    }

    updateIdInCode(code, newId) {
        let match = code.match(/const SCRIPT_ID = [0-9]+;/);
        if (match && match[0]) {
            code = code.replace(/const SCRIPT_ID = [0-9]+;/, `const SCRIPT_ID = ${newId};`);
        }
        return code;
    }

    async installModules() {
        try {
            const modules = this.scriptConfig.sourceModules;
            if (modules.length) {
                // console.log(`Info: Installing Modules: ${modules.join(', ')}`);
                for (const [i, module] of modules.entries()) {
                    let url = await this.getSrcReleaseUrl(module);
                    console.log(`Installing Module ${i + 1} of ${modules.length}`);
                    // console.log(`Module URL: ${url}`);
                    await this.saveModule(url);
                }
            }
            return;
        } catch (e) {
            console.error(`installModules | Error: ${e}`);
        }
    }

    async saveModule(url) {
        try {
            let req = new Request(url);
            let code = await req.loadString();
            let moduleName = url.substring(url.lastIndexOf('/') + 1);
            let codeToStore = Data.fromString(`${code}`);
            await this.icloudFileManager.createDirectory(this.icloudFileManager.joinPath(this.icloudDocDirectory, 'FPWModules'), true);
            let filePath = this.icloudFileManager.joinPath(this.icloudDocDirectory, 'FPWModules') + `/${moduleName}`;
            this.icloudFileManager.write(filePath, codeToStore);
            return true;
        } catch (e) {
            console.error('saveModule error: ' + e);
            return false;
        }
    }

    async newScript(name, sourceUrl, docsUrl, icon, color) {
        try {
            await this.installModules();

            let fileName = name;
            let nextId = 0;
            let filesFnd = await this.getAllInstances();
            // console.log('newScript | filesFnd: ' + filesFnd.length);
            if (filesFnd.length >= maxSupportedInstance) {
                await this.showAlert('Maximum Instances Reached', `You have reached the maximum number of (${maxSupportedInstance}) instances of this script.`);
                return false;
            }
            nextId = await this.getNextInstanceId();
            // console.log('nextInstanceId: ' + nextId);
            if (nextId >= 1) {
                fileName = `${name} ${nextId}`;
            }
            // console.log(`newScript | name: ${fileName} | nextId: ${nextId}`);
            if (await this.saveScript(fileName, nextId, sourceUrl, docsUrl, icon, color)) {
                this.runScript(fileName);
                return true;
            }
        } catch (e) {
            console.log(`newScript | Error: ${e}`);
            return false;
        }
    }

    async saveScript(name, nextId, sourceUrl, docsUrl, icon, color) {
        try {
            let req = new Request(sourceUrl);
            let code = await req.loadString();
            if (nextId) {
                // console.log('saveScript | id: ' + nextId);
                code = await this.updateIdInCode(code, nextId);
                let newId = await this.getIdFromCode(code);
                console.log(`Wrote Scipt With ID: ${newId}`);
            }
            let hash = this.hashCode(code);
            let codeToStore = Data.fromString(`// Variables used by Scriptable.\n// These must be at the very top of the file. Do not edit.\n// icon-color: ${color}; icon-glyph: ${icon};\n// This script was downloaded using FordWidgetTool.\nhash: ${hash};\n\n${code}`);
            let filePath = this.icloudFileManager.joinPath(this.icloudDocDirectory, name + '.js');
            this.icloudFileManager.write(filePath, codeToStore);
            return true;
        } catch (e) {
            console.error('saveScript error: ' + e);
            return false;
        }
    }

    runScript(name) {
        let callback = new CallbackURL('scriptable:///run');
        callback.addParameter('scriptName', name);
        callback.open();
    }

    async updateScripts(name, sourceUrl, docsUrl, icon, color) {
            console.log(`updateScripts | ${name} | ${sourceUrl} | ${docsUrl} | ${icon} | ${color}`);
            try {
                let filesFnd = await this.getAllInstances();
                if (filesFnd.length) {
                    await this.installModules();

                    console.log(`filesFnd: (${filesFnd.length})`);
                    for (let i = 0; i < filesFnd.length; i++) {
                        let id = await this.getIdFromFIle(filesFnd[i]);
                        await this.saveScript(filesFnd[i], id, sourceUrl, docsUrl, icon, color);
                    }
                }
                await this.showAlert(`Widget Tool - Script Updater`, `The following Scripts were updated to the latest version:\n${filesFnd.join('\n')}${this.scriptConfig.sourceModules.length ? `\n\n${this.scriptConfig.sourceModules.length} Modules were Updated` : ''}`);
        } catch (e) {
            console.log(`updateScripts | Error: ${e}`);
            return false;
        }
    }
}

const wI = new WidgetInstaller();
await wI.getScriptConfig();

async function menuBuilderByType(type) {
    try {
        let title = undefined;
        let message = undefined;
        const releaseMode = await wI.getReleaseMode();
        let items = [];
        let filesFnd = await wI.getAllInstances();
        switch (type) {
            case 'main':
                title = `FordWidget Tool Menu`;
                message = `Tool Version: (${SCRIPT_VERSION})\nRelease Mode: (${releaseMode.toUpperCase()})`;
                items = [
                    {
                        title: `Update ${filesFnd.length} Instance${filesFnd.length > 1 ? 's' : ''}`,
                        action: async () => {
                            console.log('(Main Menu) Update Widgets was pressed');
                            await wI.updateScripts(wI.scriptConfig.scriptName, await wI.getSrcUrl(), await wI.getDocUrl(), wI.scriptConfig.scriptGlyph, wI.scriptConfig.scriptColor);
                        },
                        destructive: true,
                        show: filesFnd.length >= 1,
                    },
                    {
                        title: 'Create New Instance',
                        action: async () => {
                            console.log('(Main Menu) Create New Instance was pressed');
                            await wI.newScript(wI.scriptConfig.scriptName, await wI.getSrcUrl(), await wI.getDocUrl(), wI.scriptConfig.scriptGlyph, wI.scriptConfig.scriptColor);
                        },
                        destructive: false,
                        show: true,
                    },
                    {
                        title: 'Remove Instances',
                        action: async () => {
                            console.log('(Main Menu) Instances Removal was pressed');
                            await menuBuilderByType('removal');
                        },
                        destructive: true,
                        show: true,
                    },
                    {
                        title: 'Settings',
                        action: async () => {
                            console.log('(Main Menu) Settings was pressed');
                            menuBuilderByType('setting');
                        },
                        destructive: false,
                        show: true,
                    },
                    {
                        title: 'Exit',
                        action: async () => {
                            console.log(`(${type} Menu) Exit was pressed`);
                        },
                        destructive: false,
                        show: true,
                    },
                ];
                break;
            case 'setting':
                title = `Settings Menu`;
                message = ``;
                items = [
                    {
                        title: `Release Mode: ${releaseMode}`,
                        action: async () => {
                            console.log(`(${type} Menu) Toggle Release Mode was pressed`);
                            await wI.toggleReleaseMode();
                            menuBuilderByType('setting');
                        },
                        destructive: false,
                        show: true,
                    },
                    {
                        title: 'Back',
                        action: async () => {
                            console.log(`(${type} Menu) Back was pressed`);
                            await this.menuBuilderByType('main');
                        },
                        destructive: false,
                        show: true,
                    },
                ];
                break;
            case 'removal':
                title = `Instance Removal Menu`;
                message = `Tap on an instance to delete it and remove all data`;
                if (filesFnd.length) {
                    for (const i in filesFnd) {
                        items.push({
                            title: filesFnd[i],
                            action: async () => {
                                console.log(`(Removal Menu) ${filesFnd[i]} was pressed`);
                                await wI.removeInstance(filesFnd[i]);
                                await wI.showAlert('Widget Tool - Instance Removal', `${filesFnd[i]} Instance removed...`);
                                menuBuilderByType('main');
                            },
                            destructive: true,
                            show: true,
                        });
                    }
                }
                items.push(
                    {
                        title: 'Remove All Instances',
                        action: async () => {
                            console.log(`(Removal Menu) Remove All was pressed`);
                            await wI.removeAllInstances();
                            await wI.showAlert('Widget Tool - Instances Removal', `All ${filesFnd.length} Instances were removed`);
                            menuBuilderByType('main');
                        },
                        destructive: true,
                        show: filesFnd.length ? true : false,
                    },
                    {
                        title: 'Back',
                        action: async () => {
                            console.log(`(${type} Menu) Back was pressed`);
                            await menuBuilderByType('main');
                        },
                        destructive: false,
                        show: true,
                    },
                );
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
    let fnd = await wI.getAllInstances();
    // console.log('start | fnd: ' + fnd.length);
    if (fnd.length < 1) {
        console.log('start | no scripts found creating new one');
        await wI.newScript(wI.scriptConfig.scriptName, await wI.getSrcUrl(), await wI.getDocUrl(), wI.scriptConfig.scriptGlyph, wI.scriptConfig.scriptColor);
    } else {
        console.log('start | showing Main Menu');
        // console.log(JSON.stringify(await wI.getFileDetails(fnd[0])));
        menuBuilderByType('main');
    }
}
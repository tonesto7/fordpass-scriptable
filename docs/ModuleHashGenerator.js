// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;

// This is based on the scriptdude installer https://github.com/kevinkub/scriptdu.de script and modified to manage the Ford Widget script

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
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Alerts.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Files.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_FordCommands.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_FordRequests.js',
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
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Utils.js',
                'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/FPW_Widgets.js',
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

    async proceModulesFolder() {
        try {
            const modulesFolder = this.icloudFileManager.joinPath(this.icloudDocDirectory, 'FPWModules');
            const modules = await this.icloudFileManager.listContents(modulesFolder);
            console.log(JSON.stringify(modules));
            if (modules.length) {
                // console.log(`Info: Installing Modules: ${modules.join(', ')}`);
                // for (const [i, module] of modules.entries()) {
                //     let url = await this.getSrcReleaseUrl(module);
                //     console.log(`Installing Module ${i + 1} of ${modules.length}`);
                //     // console.log(`Module URL: ${url}`);
                //     await this.saveModule(url);
                // }
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
            let codeToStore = Data.fromString(`//This module was downloaded using FordWidgetTool.\n\n${code}`);
            await this.icloudFileManager.createDirectory(this.icloudFileManager.joinPath(this.icloudDocDirectory, 'FPWModules'), true);
            let filePath = this.icloudFileManager.joinPath(this.icloudDocDirectory, 'FPWModules') + `/${moduleName}`;
            this.icloudFileManager.write(filePath, codeToStore);
            return true;
        } catch (e) {
            console.error('saveModule error: ' + e);
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
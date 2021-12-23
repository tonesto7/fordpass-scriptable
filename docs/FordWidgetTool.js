// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

// This is based on the scriptdude installer https://github.com/kevinkub/scriptdu.de script and modified to manage the Ford Widget script

const SCRIPT_VERSION = '1.1.0';
const scriptSrcUrl = 'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Fordpass%20Widget.js';
// const scriptSrcUrl = 'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/beta/Fordpass%20Widget.js';
const scriptName = 'Fordpass Widget';
const scriptDocsUrl = 'https://github.com/tonesto7/fordpass-scriptable#readme';
const scriptGlyph = 'car';
const scriptColor = 'blue';
const maxSupportedInstance = 10;

class WidgetInstaller {
    constructor() {
        this.localFileManager = FileManager.local();
        this.localDocDirectory = this.localFileManager.documentsDirectory();
        this.icloudFileManager = FileManager.iCloud();
        this.icloudDocDirectory = this.icloudFileManager.documentsDirectory();
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
        const keys = ['fpToken', 'fpToken2', 'fpUsername', 'fpUser', 'fpPass', 'fpPassword', 'fpVin', 'fpUseMetricUnits', 'fpUsePsi', 'fpVehicleType', 'fpMapProvider', 'fpCat1Token', 'fpTokenExpiresAt', 'fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits', 'fpSpeedUnits'];
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
        const files = [
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
        ];
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
            let n = i >= 1 ? `${scriptName} ${i + 1}` : scriptName;
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
            let n = i >= 1 ? `${scriptName} ${i + 1}` : scriptName;
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
            return match[0].split('=')[1].trim();
        } else {
            return 0;
        }
    }

    async getIdFromFIle(file) {
        let filePath = this.icloudFileManager.joinPath(this.icloudDocDirectory, file + '.js');

        if (await this.icloudFileManager.fileExists(filePath)) {
            let code = await this.icloudFileManager.readString(filePath);
            return await this.getIdFromCode(code);
        }
        return undefined;
    }

    updateIdInCode(code, newId) {
        let match = code.match(/const SCRIPT_ID = [0-9]+;/);
        if (match && match[0]) {
            code = code.replace(/const SCRIPT_ID = [0-9]+;/, `const SCRIPT_ID = ${newId};`);
        }
        return code;
    }

    async newScript(name, sourceUrl, documentationUrl, icon, color) {
        try {
            let fileName = name;
            let nextId = 0;
            let filesFnd = await this.getAllInstances();
            // console.log('newScript | filesFnd: ' + filesFnd.length);
            if (filesFnd.length >= maxSupportedInstance) {
                await this.showAlert('Maximum Instances Reached', `You have reached the maximum number of (${maxSupportedInstance}) instances of this script.`);
                return false;
            }
            nextId = await this.getNextInstanceId();
            //console.log('nextInstanceId: ' + nextId);
            if (nextId >= 1) {
                fileName = `${name} ${nextId}`;
            }
            // console.log(`newScript | name: ${fileName} | nextId: ${nextId}`);
            if (await this.saveScript(fileName, nextId, sourceUrl, documentationUrl, icon, color)) {
                this.runScript(fileName);
                return true;
            }
        } catch (e) {
            console.log(`newScript | Error: ${e}`);
            return false;
        }
    }

    async saveScript(name, nextId, sourceUrl, documentationUrl, icon, color) {
        try {
            let req = new Request(sourceUrl);
            let code = await req.loadString();
            code = this.updateIdInCode(code, nextId);
            let hash = this.hashCode(code);
            // console.log('Writing Scipt With ID: ' + this.getIdFromCode(code));
            let codeToStore = Data.fromString(
                `// Variables used by Scriptable.\n// These must be at the very top of the file. Do not edit.\n// icon-color: ${color}; icon-glyph: ${icon};\n// This script was downloaded using FordWidgetTool.\n// Do not remove these lines, if you want to benefit from automatic updates.\n// source: ${sourceUrl}; docs: ${documentationUrl}; hash: ${hash};\n\n${code}`,
            );
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

    async updateScripts(name, sourceUrl, documentationUrl, icon, color) {
        try {
            let filesFnd = await this.getAllInstances();
            if (filesFnd.length) {
                // console.log(`filesFnd: (${filesFnd.length})`);
                for (let i = 0; i < filesFnd.length; i++) {
                    let id = this.getIdFromFIle(filesFnd[i]);
                    await this.saveScript(filesFnd[i], id, sourceUrl, documentationUrl, icon, color);
                }
            }
            await this.showAlert(`Widget Tool - Script Updater`, `The following Scripts were updated to the latest version:\n${filesFnd.join('\n')}`);
        } catch (e) {
            console.log(`updateScripts | Error: ${e}`);
            return false;
        }
    }
}

const wI = new WidgetInstaller();

async function getMenuItems(type, showExit = false) {
    let items = [];
    let filesFnd = await wI.getAllInstances();
    switch (type) {
        case 'main':
            items = [{
                    title: `Update ${filesFnd.length} Instance${filesFnd.length > 1 ? 's' : ''}`,
                    action: async() => {
                        console.log('(Main Menu) Update Ford Widgets was pressed');
                        await wI.updateScripts(scriptName, scriptSrcUrl, scriptDocsUrl, scriptGlyph, scriptColor);
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Create New Instance',
                    action: async() => {
                        console.log('(Main Menu) Update Ford Widgets was pressed');
                        await wI.newScript(scriptName, scriptSrcUrl, scriptDocsUrl, scriptGlyph, scriptColor);
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Remove Instances',
                    action: async() => {
                        console.log('(Main Menu) Instances Removal was pressed');
                        await createMenu('removal');
                    },
                    destructive: true,
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

        case 'removal':
            if (filesFnd.length) {
                for (const i in filesFnd) {
                    items.push({
                        title: filesFnd[i],
                        action: async() => {
                            console.log(`(Removal Menu) ${filesFnd[i]} was pressed`);
                            await wI.removeInstance(filesFnd[i]);
                            await wI.showAlert('Widget Tool - Instance Removal', `${filesFnd[i]} Instance removed...`);
                            createMenu('main');
                        },
                        destructive: true,
                        show: true,
                    });
                }
            }
            items.push({
                title: 'Remove All Instances',
                action: async() => {
                    console.log(`(Removal Menu) Remove All was pressed`);
                    await wI.removeAllInstances();
                    await wI.showAlert('Widget Tool - Instances Removal', `All ${filesFnd.length} Instances were removed`);
                    createMenu('main');
                },
                destructive: true,
                show: filesFnd.length ? true : false,
            }, {
                title: 'Back',
                action: async() => {
                    console.log(`(${type} Menu) Back was pressed`);
                    await createMenu('main');
                },
                destructive: false,
                show: true,
            }, );
            break;
    }
    return items;
}

async function createMenu(type, showExit = false) {
    const menu = new Alert();
    menu.title = '';
    menu.message = '';
    let menuItems = [];
    try {
        switch (type) {
            case 'main':
                menu.title = `FordWidget Tool Menu`;
                menu.message = `Tool Version: (${SCRIPT_VERSION})`;
                menuItems = (await getMenuItems(type, showExit)).filter((item) => item.show === true);
                break;
            case 'removal':
                menu.title = `Instance Removal Menu`;
                menu.message = `Tap on an instance to delete it and remove all data`;
                menuItems = (await getMenuItems(type, showExit)).filter((item) => item.show === true);
                break;
        }
        // console.log(`Menu Items: (${menuItems.length}) ${JSON.stringify(menuItems)}`);
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
            // console.log(`(Main Menu) Selected: ${JSON.stringify(menuItem)}`);
            menuItem.action();
        }
    } catch (e) {
        console.log(`createMenu | Error: ${e}`);
    }
}

if (config.runsInApp || config.runsFromHomeScreen) {
    let fnd = await wI.getAllInstances();
    // console.log('start | fnd: ' + fnd.length);
    if (fnd.length < 1) {
        console.log('start | no scripts found creating new one');
        await wI.newScript(scriptName, scriptSrcUrl, scriptDocsUrl, scriptGlyph, scriptColor);
    } else {
        console.log('start | showing Main Menu');
        // console.log(JSON.stringify(await wI.getFileDetails(fnd[0])));
        createMenu('main', true);
    }
}
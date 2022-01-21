// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: car;

/**************
 * Permission to use, copy, modify, and/or distribute this software for any purpose without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER
 * IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
 * OF THIS SOFTWARE.
 *
 *
 * This is a widget for the iOS/iPad/MacOS app named Scriptable https://scriptable.app/ created by tonesto7 (https://github.com/tonesto7)
 *
 * Fuel pump Icon made by Kiranshastry from www.flaticon.com
 *
 * Based off the work of others:
 *  - The original Fordpass Scriptable script by Damian Schablowsky  <dschablowsky.dev@gmail.com> (https://github.com/dschablowsky/FordPassWidget)
 *  - Api Logic based on ffpass from https://github.com/d4v3y0rk - thanks a lot for the work!
 *  - Borrowed a couple method mapping functions from WidgetMarkup.js by @rafaelgandi (https://github.com/rafaelgandi/WidgetMarkup-Scriptable)
 *
 * IMPORTANT NOTE: This widget will only work with vehicles that show up in the FordPassFordPass app!
 */

/**************
Changelog:
    v2.0.0:
        - Modified the fuel/battery bar to show the icon and percentage in the bar. The bar is now green when vehicle is EV, and red when below 10% and yellow below 20%;
        - Removed vehicle odometer from the widget UI to save space (moved it to the dashboard menu section)
        - Modified the margins of the widget to be more consistent and be better on small screens and small widgets.
        - Renamed debug menu to advanced info menu.
        - Added new option to advanced info menu to allow emailing your anonymous vehicle data to me 
            (Because this is email I will see your address, but you can choose to setup a private email using icloud hide email feature)(Either way i will never share or use your email for anything)
        
// Todo: This Release (v2.0.0)) 
    - use OTA info to show when an update is available or pending.
    - move OTA info to table view.
    - Show notifications for specific events or errors (like low battery, low oil, ota updates)
    - add actionable notifications for items like doors still unlocked after a certain time or low battery offer remote star... etc
    - Create widgets with less details and larger image.
    - Change module storage from iCloud to local storage.
    - add a hash to the modules so we make sure it loads the correct modules.
    - add test mode to use cached data for widget testing
    - figure out why fetchVehicleData is called multiple times with token expires error.

// Todo: Next Release (Post 2.0.x)
- setup up daily schedule that makes sure the doors are locked at certain time of day (maybe).
    - add support for other languages
    - add charge scheduling to dashboard menu
    - add support for right hand drive (driver side windows, and doors etc.)
    - add option to define dark or light mode (this might not work because the UI is driven based on OS theme)
    - add voice interface using siri shortcut
        * generate list of actionable commands based on capability
        * generate list of request command info available (are the doors locked, is the vehicle on, current fuel level, etc)
        * handle context and tense of command
    
**************/

const changelog = {
    '2.0.0': {
        added: [
            'All new menu that functions like an app interface',
            'Added new option to advanced info menu to allow emailing your anonymous vehicle data to me (Because this is email I will see your address, but you can choose to setup a private email using icloud hide email feature)(Either way i will never share or use your email for anything).',
            'Script changes are show in a window when new versions are released.',
        ],
        fixed: ['Modified the margins of the widget to be more consistent and be better on small screens and small widgets.', 'Vehicle images should now load correctly.'],
        removed: ['Removed vehicle odometer from the widget UI to save space (moved it to the dashboard menu section).'],
        updated: ['Modified the fuel/battery bar to show the icon and percentage in the bar. The bar is now green when vehicle is EV, and red when below 10% and yellow below 20%.', 'Renamed debug menu to advanced info menu.'],
    },
};

const SCRIPT_VERSION = '2.0.0';
const SCRIPT_TS = '2022/01/21, 6:00 pm';
const SCRIPT_ID = 0; // Edit this is you want to use more than one instance of the widget. Any value will work as long as it is a number and  unique.

//******************************************************************
//* Customize Widget Options
//******************************************************************
const widgetConfig = {
    debugMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    debugAuthMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    logVehicleData: false, // Logs the vehicle data to the console (Used to help end users easily debug their vehicle data and share with develop)
    screenShotMode: true, // Places a dummy address in the widget for anonymous screenshots.
    refreshInterval: 5, // allow data to refresh every (xx) minutes
    alwaysFetch: true, // always fetch data from FordPass, even if it is not needed
    tirePressureThresholds: {
        // Tire Pressure Thresholds in PSI
        low: 27,
        critical: 20,
    },
    /**
     * Only use the options below if you are experiencing problems. Set them back to false once everything is working.
     * Otherwise the token and the pictures are newly fetched everytime the script is executed.
     */
    useBetaModules: true,
    useLocalModules: false,
    ignoreHashCheck: true,
    clearKeychainOnNextRun: false, // false or true
    clearFileManagerOnNextRun: false, // false or true
    showTestUIStuff: true,
};

// const FPWClass = await getModules(widgetConfig.useLocalModules);
// if (FPWClass === undefined) {
//     throw new Error('Could NOT Load FordPassWidget Class');
// }
// const FPW = new FPWClass(SCRIPT_ID, SCRIPT_VERSION, SCRIPT_TS, widgetConfig);

//************************************************************************* */
//*                  Device Detail Functions
//************************************************************************* */
const darkMode = Device.isUsingDarkAppearance();
const runningWidgetSize = config.widgetFamily;

// console.log('---------------DEVICE INFO ----------------');
// console.log(`OSDarkMode: ${FPW.darkMode}`);
// console.log(`IsSmallDisplay: ${FPW.isSmallDisplay}`);
// console.log(`ScreenSize: Width: ${FPW.screenSize.width} | Height: ${FPW.screenSize.height}`);
// console.log(`Device Info | Model: ${FPW.deviceModel} | OSVersion: ${FPW.deviceSystemVersion}`);
// console.log(`ScriptURL: ${URLScheme.forRunningScript()}`);
// console.log(`Script QueryParams: ${args.queryParameter}`);
// console.log(`Script WidgetParams: ${args.widgetParameter}`);

//******************************************************************************
//* Main Widget Code - ONLY make changes if you know what you are doing!!
//******************************************************************************

class Widget {
    constructor(fpw) {
        try {
            this.FPW = fpw;
            this.FPW.Files.appendToLogFile('Widget Started');
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }

    // /**
    //  * @description This is the main function that runs the widget.
    //  * @return
    //  * @memberof Widget
    //  */
    // async start() {
    //     let fordData = await this.prepWidget();
    //     if (fordData === null) return;

    //     try {
    //         if (config.runsInWidget) {
    //             console.log('(generateWidget) Running in Widget...');
    //             this.FPW.Files.appendToLogFile('(generateWidget) Running in Widget...');
    //             // await this.FPW.Widgets.generateWidget(runningWidgetSize, fordData);
    //             let w = await testWidget(fordData);
    //         } else if (config.runsInApp || config.runsFromHomeScreen) {
    //             // Show alert with current data (if running script in app)
    //             if (args.shortcutParameter) {
    //                 // Create a parser function...
    //                 await Speech.speak(await this.FPW.ShortcutParser.parseIncomingSiriCommand(args.shortcutParameter));
    //             } else {
    //                 // await(await generateWidget('medium', fordData)).presentMedium();
    //                 // await this.FPW.Menus.menuBuilderByType('main');
    //                 await this.FPW.Tables.MainPage.createMainPage();
    //             }
    //         } else if (config.runsWithSiri || config.runsInActionExtension) {
    //             // console.log('runsWithSiri: ' + config.runsWithSiri);
    //             // console.log('runsInActionExtension: ' + config.runsInActionExtension);
    //         } else {
    //             this.FPW.Files.appendToLogFile('(generateWidget) Running in Widget (else)...');
    //             await this.FPW.Widgets.generateWidget(runningWidgetSize, fordData);
    //         }
    //     } catch (e) {
    //         console.log(`start() Error: ${e}`);
    //         this.FPW.Files.appendToLogFile(`start() Error: ${e}`);
    //     }
    //     Script.complete();
    // }

    /**
     * @description Makes sure the widget is ready to run by checking for proper settings. It will prompt the user to change settings if needed.
     * @return
     * @memberof Widget
     */
    async prepWidget() {
        try {
            if (widgetConfig.clearKeychainOnNextRun) {
                await this.FPW.Kc.clearSettings();
            }
            if (widgetConfig.clearFileManagerOnNextRun) {
                await this.FPW.Files.clearFileManager();
            }
            // Tries to fix the format of the VIN field (Makes sure they are capitalized)
            await this.FPW.Utils.vinFix(await this.FPW.Kc.getSettingVal('fpVin'));

            let frcPrefs = false;
            let reqOk = await this.FPW.Kc.requiredPrefsOk(this.FPW.Kc.prefKeys().core);
            // console.log(`reqOk: ${reqOk}`);
            if (!reqOk) {
                let prompt = await this.FPW.Menus.requiredPrefsMenu();

                // console.log(`(prepWidget) Prefs Menu Prompt Result: ${prompt}`);
                if (prompt === undefined) {
                    await this.prepWidget();
                } else if (prompt === false) {
                    console.log('(prepWidget) Login, VIN, or Prefs not set... | User cancelled!!!');
                    return null;
                } else {
                    frcPrefs = true;
                }
            }
            // console.log('(prepWidget) Checking for token...');
            const cAuth = await this.FPW.FordRequests.checkAuth();
            // console.log(`(prepWidget) CheckAuth Result: ${cAuth}`);

            // console.log(`(prepWidget) Checking User Prefs | Force: (${frcPrefs})`);
            const fPrefs = await this.FPW.FordRequests.queryFordPassPrefs(frcPrefs);
            // console.log(`(prepWidget) User Prefs Result: ${fPrefs}`);

            // console.log('(prepWidget) Fetching Vehicle Data...');
            const vData = await this.FPW.FordRequests.fetchVehicleData();
            return vData;
        } catch (err) {
            console.log(`(prepWidget) Error: ${err}`);
            this.FPW.Files.appendToLogFile(`prepWidget() Error: ${err}`);
            return null;
        }
    }

    /**
     * @description Takes the size and data and generates the widget
     * @param  {String} size
     * @param  {Object} data
     * @return
     * @memberof Widget
     */
    async generateWidget(size, data) {
        let w = null;
        try {
            switch (size) {
                case 'small':
                    w = await this.FPW.WidgetSmall.createWidget(data);
                    break;
                case 'large':
                    w = await this.FPW.WidgetLarge.createWidget(data);
                    break;
                case 'extraLarge':
                    w = await this.FPW.WidgetExtraLarge.createWidget(data);
                    break;

                default:
                    w = await this.FPW.WidgetMedium.createWidget(data);
                    break;
            }
            if (w === null) {
                return;
            }
            w.setPadding(0, 5, 0, 1);
            Script.setWidget(w);
            w.refreshAfterDate = new Date(Date.now() + 1000 * 300); // Update the widget every 5 minutes from last run (this is not always accurate and there can be a swing of 1-5 minutes)
        } catch (e) {
            console.log(`generateWidget Error: ${e}`);
            this.FPW.Files.appendToLogFile(`generateWidget() Error: ${e}`);
        }
        return w;
    }

    async testWidget(data) {
        const widget = new ListWidget();
        widget.backgroundGradient = this.FPW.getBgGradient();

        try {
            let mainStack = widget.addStack();
            mainStack.layoutVertically();
            mainStack.setPadding(0, 0, 0, 0);

            let contentStack = mainStack.addStack();
            let row = await this.FPW.WidgetHelpers.createRow(contentStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
            await this.FPW.WidgetHelpers.createText(row, 'This is a test', { font: Font.boldSystemFont(13), textColor: new Color(darkMode ? '#FFFFFF' : '#000000'), lineLimit: 1 });
            contentStack.layoutHorizontally();
        } catch (e) {
            console.log(`testWidget Error: ${e}`);
            this.FPW.Files.appendToLogFile(`testWidget() Error: ${e}`);
        }
        widget.setPadding(0, 5, 0, 1);
        Script.setWidget(widget);
        // return widget;
    }
}

async function appendToLogFile(txt) {
    // console.log('appendToLogFile: Saving Data to Log...');
    try {
        let fm = FileManager.iCloud();
        const logDir = fm.joinPath(fm.documentsDirectory(), 'Logs');
        const devName = Device.name()
            .replace(/[^a-zA-Z\s]/g, '')
            .replace(/\s/g, '_')
            .toLowerCase();
        let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `$fp_${devName}_log_${this.SCRIPT_ID}.log` : `fp_${devName}_log.log`;
        let path = fm.joinPath(logDir, fileName);
        if (!(await fm.isDirectory(logDir))) {
            console.log('Creating Logs directory...');
            await fm.createDirectory(logDir);
        }
        let logText = '';
        if (await fm.fileExists(path)) {
            logText = await fm.readString(path);
            logText += '\n[' + new Date().toLocaleString() + '] - ' + txt.toString();
            // console.log(logText);
        } else {
            logText = '[' + new Date().toLocaleString() + '] - ' + txt.toString();
            // console.log(logText);
        }
        await fm.writeString(path, logText);
    } catch (e) {
        console.log(`appendToLogFile Error: ${e}`);
    }
}

/**
 * @description This loads and makes sure all modules are loaded before running the script
 * @param  {boolean} [useLocal=false] Tells the function to use the local version of the file manager instead of the icloud version
 * @return
 */
async function validateModules(useLocal = false) {
    const fm = useLocal ? FileManager.local() : FileManager.iCloud();
    let moduleRepo = `https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/`;
    moduleRepo = widgetConfig.useBetaModules ? moduleRepo.replace('main', 'beta') : moduleRepo;
    const moduleFiles = [
        'FPW.js||-1951498029',
        'FPW_Alerts.js||1575654697',
        'FPW_Files.js||-32167747',
        'FPW_FordCommands.js||-1513595181',
        'FPW_FordRequests.js||-530235373',
        'FPW_Keychain.js||954896526',
        'FPW_Menus.js||-1221558013',
        'FPW_Notifications.js||-1071883614',
        'FPW_ShortcutParser.js||966556475',
        'FPW_Tables.js||1324977678',
        'FPW_Tables_AlertPage.js||1012159356',
        'FPW_Tables_ChangesPage.js||-473781684',
        'FPW_Tables_MainPage.js||-757583604',
        'FPW_Tables_MessagePage.js||-1754669539',
        'FPW_Tables_RecallPage.js||-285170438',
        'FPW_Tables_WidgetStylePage.js||786295863',
        'FPW_Timers.js||-694575770',
        'FPW_Utils.js||-1891424353',
        'FPW_Widgets.js||175049418',
        'FPW_Widgets_ExtraLarge.js||-453486313',
        'FPW_Widgets_Helpers.js||-1095305750',
        'FPW_Widgets_Large.js||642581411',
        'FPW_Widgets_Medium.js||-1667929836',
        'FPW_Widgets_Small.js||812484577',
    ];

    async function downloadModule(fileName, filePath) {
        try {
            let req = new Request(`${moduleRepo}${fileName}`);
            let code = await req.loadString();
            let codeData = Data.fromString(`${code}`);
            await fm.write(filePath, codeData);
            return true;
        } catch (error) {
            logger(`(downloadModule) ${error}`, true);
            return false;
        }
    }

    async function hashCode(input) {
        return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0);
    }

    let available = [];
    try {
        const moduleDir = fm.joinPath(fm.documentsDirectory(), 'FPWModules');
        if (!(await fm.isDirectory(moduleDir))) {
            console.log('Creating FPWModules directory...');
            await fm.createDirectory(moduleDir);
        }
        for (const [i, file] of moduleFiles.entries()) {
            const [fileName, fileHash] = file.split('||');
            const filePath = fm.joinPath(moduleDir, fileName);
            if (!(await fm.fileExists(filePath))) {
                console.log(`Required Module Missing... Downloading ${fileName}`);
                if (await downloadModule(fileName, filePath)) {
                    available.push(fileName);
                }
            } else {
                let fileCode = await fm.readString(filePath);
                const hash = await hashCode(fileCode);
                // console.log(`${fileName} hash: ${hash} | ${fileHash}`);
                if (widgetConfig.ignoreHashCheck === false && hash.toString() !== fileHash.toString()) {
                    console.log(`Module Hash Missmatch... Downloading ${fileName}`);
                    if (await downloadModule(fileName, filePath)) {
                        available.push(fileName);
                    }
                } else {
                    available.push(fileName);
                }
            }
        }
        if (available.length === moduleFiles.length) {
            console.log(`All Required Modules (${moduleFiles.length}) Found!`);
            try {
                const modulePath = FileManager.iCloud().joinPath(FileManager.iCloud().documentsDirectory(), 'FPWModules', 'FPW.js');
                return !(await fm.fileExists(modulePath)) ? undefined : true;
            } catch (e) {
                console.log(`Error Importing FPW.js: ${e}`);
                return undefined;
            }
        }
    } catch (error) {
        logger(`validateModules() Error: ${error}`, true);
        return undefined;
    }
}

async function logger(msg, error = false, saveToLog = true) {
    if (saveToLog) {
        await appendToLogFile(msg);
    }
    if (error) {
        console.error(msg);
    } else {
        console.log(msg);
    }
}

async function checkForClassModule() {
    try {
        const fm = FileManager.iCloud();
        const classPath = fm.joinPath(fm.documentsDirectory(), 'FPWModules', 'FPW.js');
        if (await fm.fileExists(classPath)) {
            logger('Class Module Found!');
            return true;
        } else {
            logger('Class Module Not Found!');
            return false;
        }
    } catch (error) {
        logger(`checkForClassModule() Error: ${error}`, true);
        return false;
    }
}

async function start() {
    logger(`Starting...  | RunsInWidget: ${config.runsInWidget} | RunsInApp: ${config.runsInApp}`);
    const modulePath = FileManager.iCloud().joinPath(FileManager.iCloud().documentsDirectory(), 'FPWModules') + '/FPW.js';
    logger(`ModulePath: ${modulePath}`);
    const modulesLoaded = await validateModules();
    logger(`ModulesLoaded: ${modulesLoaded}`);
    if (modulesLoaded === undefined) {
        logger(`Widget: ${config.runsInWidget} | App: ${config.runsInApp} |  Error Loading FPW.js | Exiting...`);
        throw new Error('Could NOT Load FordPassWidget Class');
    }
    // const FPWClass = await getModules(widgetConfig.useLocalModules);

    // if (FPWClass === undefined) {
    //     throw new Error('Could NOT Load FordPassWidget Class');
    // }
    const FPWClass = importModule(modulePath);
    const FPW = new FPWClass(SCRIPT_ID, SCRIPT_VERSION, SCRIPT_TS, widgetConfig);
    const wc = new Widget(FPW);
    // await wc.start();
    let fordData = await wc.prepWidget();
    if (fordData === null) return;

    try {
        if (config.runsInWidget) {
            console.log('(generateWidget) Running in Widget...');
            wc.FPW.Files.appendToLogFile('(generateWidget) Running in Widget...');
            // await this.FPW.Widgets.generateWidget(runningWidgetSize, fordData);
            let w = await wc.testWidget(fordData);
        } else if (config.runsInApp || config.runsFromHomeScreen) {
            // Show alert with current data (if running script in app)
            if (args.shortcutParameter) {
                // Create a parser function...
                await Speech.speak(await wc.FPW.ShortcutParser.parseIncomingSiriCommand(args.shortcutParameter));
            } else {
                // await(await generateWidget('medium', fordData)).presentMedium();
                // await this.FPW.Menus.menuBuilderByType('main');
                await wc.FPW.Tables.MainPage.createMainPage();
            }
        } else if (config.runsWithSiri || config.runsInActionExtension) {
            // console.log('runsWithSiri: ' + config.runsWithSiri);
            // console.log('runsInActionExtension: ' + config.runsInActionExtension);
        } else {
            wc.FPW.Files.appendToLogFile('(generateWidget) Running in Widget (else)...');
            await wc.FPW.Widgets.generateWidget(runningWidgetSize, fordData);
        }
    } catch (e) {
        logger(`start() Error: ${e}`, true);
    }
    Script.complete();
}
start();
// const wc = new Widget(FPW);
// await wc.start();
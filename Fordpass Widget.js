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
const SCRIPT_TS = '2022/01/19, 6:00 pm';
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
    clearKeychainOnNextRun: false, // false or true
    clearFileManagerOnNextRun: false, // false or true
    showTestUIStuff: false,
};

const FPWClass = await getModules(widgetConfig.useLocalModules);
const FPW = new FPWClass(SCRIPT_ID, SCRIPT_VERSION, SCRIPT_TS, widgetConfig);

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
            console.log(`this: ${JSON.stringify(this.FPW.SCRIPT_VERSION)}`);
            this.FPW.Files.appendToLogFile('Widget Started');
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }

    /**
     * @description This is the main function that runs the widget.
     * @return
     * @memberof Widget
     */
    async start() {
        let fordData = await this.prepWidget();
        if (fordData === null) return;

        try {
            if (config.runsInWidget) {
                console.log('(generateWidget) Running in Widget...');
                this.FPW.Files.appendToLogFile('(generateWidget) Running in Widget...');
                // await this.FPW.Widgets.generateWidget(runningWidgetSize, fordData);
                let w = await testWidget(fordData);
            } else if (config.runsInApp || config.runsFromHomeScreen) {
                // Show alert with current data (if running script in app)
                if (args.shortcutParameter) {
                    // Create a parser function...
                    await Speech.speak(await this.FPW.ShortcutParser.parseIncomingSiriCommand(args.shortcutParameter));
                } else {
                    // await(await generateWidget('medium', fordData)).presentMedium();
                    await this.FPW.Tables.MainPage.createMainPage();
                }
            } else if (config.runsWithSiri || config.runsInActionExtension) {
                // console.log('runsWithSiri: ' + config.runsWithSiri);
                // console.log('runsInActionExtension: ' + config.runsInActionExtension);
            } else {
                this.FPW.Files.appendToLogFile('(generateWidget) Running in Widget (else)...');
                await this.FPW.Widgets.generateWidget(runningWidgetSize, fordData);
            }
        } catch (e) {
            console.log(`start() Error: ${e}`);
            this.FPW.Files.appendToLogFile(`start() Error: ${e}`);
        }
        Script.complete();
    }

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
            const wStyle = await this.FPW.Kc.getWidgetStyle();
            // console.log(`wStyle: ${wStyle}`);

            switch (size) {
                case 'small':
                    w = wStyle === 'simple' ? await this.FPW.Widgets.Small.createWidget(data) : await this.FPW.Widgets.Small.createWidget(data);
                    break;
                case 'large':
                    w = await this.FPW.Widgets.Large.createWidget(data);
                    break;
                case 'extraLarge':
                    w = await this.FPW.Widgets.ExtraLarge.createWidget(data);
                    break;

                default:
                    // w = wStyle === 'simple' ? await this.FPW.Widgets.Medium.createWidget(data) : await this.FPW.Widgets.Medium.createWidgetSimple(data);
                    w = await this.FPW.Widgets.Medium.createWidgetSimple(data);
                    break;
            }
            if (w === null) {
                return;
            }
            w.setPadding(0, 5, 0, 1);
            Script.setWidget(w);
            // w.refreshAfterDate = new Date(Date.now() + 1000 * 300); // Update the widget every 5 minutes from last run (this is not always accurate and there can be a swing of 1-5 minutes)
        } catch (e) {
            console.log(`generateWidget Error: ${e}`);
            this.FPW.Files.appendToLogFile(`generateWidget() Error: ${e}`);
        }
        return w;
    }
}

async function testWidget(data) {
    const widget = new ListWidget();
    widget.backgroundGradient = this.FPW.getBgGradient();

    try {
        let mainStack = widget.addStack();
        mainStack.layoutVertically();
        mainStack.setPadding(0, 0, 0, 0);

        let contentStack = mainStack.addStack();
        let row = await this.FPW.Widgets.createRow(contentStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
        await this.FPW.Widgets.createText(row, 'This is a test', { font: Font.boldSystemFont(13), textColor: new Color(darkMode ? '#FFFFFF' : '#000000'), lineLimit: 1 });
        contentStack.layoutHorizontally();
    } catch (e) {
        console.log(`testWidget Error: ${e}`);
        this.FPW.Files.appendToLogFile(`testWidget() Error: ${e}`);
    }
    widget.setPadding(0, 5, 0, 1);
    Script.setWidget(widget);
    // return widget;
}

// //***************************************************END WIDGET ELEMENT FUNCTIONS********************************************************
// //***************************************************************************************************************************************

/**
 * @description This loads and makes sure all modules are loaded before running the script
 * @param  {boolean} [useLocal=false] Tells the function to use the local version of the file manager instead of the icloud version
 * @return
 */
async function getModules(useLocal = false) {
    const fm = useLocal ? FileManager.local() : FileManager.iCloud();
    // Load the modules
    let moduleRepo = `https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/`;
    moduleRepo = widgetConfig.useBetaModules ? moduleRepo.replace('main', 'beta') : moduleRepo;
    const moduleFiles = [
        'FPW.js',
        'FPW_Alerts.js',
        'FPW_Files.js',
        'FPW_FordCommands.js',
        'FPW_FordRequests.js',
        'FPW_Keychain.js',
        'FPW_Menus.js',
        'FPW_Notifications.js',
        'FPW_ShortcutParser.js',
        'FPW_Tables.js',
        'FPW_Tables_AlertPage.js',
        'FPW_Tables_ChangesPage.js',
        'FPW_Tables_MainPage.js',
        'FPW_Tables_MessagePage.js',
        'FPW_Tables_RecallPage.js',
        'FPW_Tables_WidgetStylePage.js',
        'FPW_Timers.js',
        'FPW_Utils.js',
        'FPW_Widgets.js',
        'FPW_Widgets_Small.js',
        'FPW_Widgets_Medium.js',
        'FPW_Widgets_Large.js',
        'FPW_Widgets_ExtraLarge.js',
    ];

    let available = [];
    try {
        const moduleDir = fm.joinPath(fm.documentsDirectory(), 'FPWModules');
        if (!(await fm.isDirectory(moduleDir))) {
            console.log('Creating FPWModules directory...');
            await fm.createDirectory(moduleDir);
        }

        for (const [i, file] of moduleFiles.entries()) {
            const filePath = fm.joinPath(moduleDir, file);
            // console.log(filePath);
            if (!(await fm.fileExists(filePath))) {
                let req = new Request(`${moduleRepo}${file}`);
                let code = await req.loadString();
                available.push(file);
                const headerTxt = `//This module was downloaded using FordWidgetTool.\n\n`;
                const newCode = code.replace(headerTxt, '');
                let codeToStore = Data.fromString(`${headerTxt}${newCode}`);
                console.log(`Required Module Missing... Downloading ${file}`);
                await fm.write(filePath, codeToStore);
            } else {
                available.push(file);
            }
        }
        if (available.length === moduleFiles.length) {
            console.log(`All Required Modules (${moduleFiles.length}) Found!`);
            try {
                return importModule(fm.joinPath(moduleDir, 'FPW.js'));
            } catch (e) {
                console.log(`Error Importing FPW.js: ${e}`);
                // this.FPW.Files.appendToLogFile(`getModules() Error: ${e}`);
            }
        }
    } catch (error) {
        console.error(`(getModules) ${error}`);
        // FPW.Files.appendToLogFile(`(getModules) ${error}`);
        return undefined;
    }
}

const wc = new Widget(FPW);
await wc.start();
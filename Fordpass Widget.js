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
 *  - Borrowed a couple method mapping functions from bmw-linker script by @opp100 (https://github.com/opp100/bmw-scriptable-widgets)
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
    [-] use OTA info to show when an update is available or pending.
    [-] move OTA info to table view.
    [-] Show notifications for specific events or errors (like low battery, low oil, ota updates)
    [-] add actionable notifications for items like doors still unlocked after a certain time or low battery offer remote star... etc
    [x] Create widgets with less details and larger image.
    [x] Change module storage from iCloud to local storage.
    [x] add a hash to the modules so we make sure it loads the correct modules.
    [x] add test mode to use cached data for widget testing
    [-] figure out why fetchVehicleData is called multiple times with token expires error.
    [-] fix main page not refreshing every 30 seconds.
    [-] possibly add vehicle status overlay to image using canvas?!...
    [x] Use individual file for each widget to reduce stack size.
    [-] Switch to subfolder for widgets and have the app scan for the available widgets to use.
    [x] Allow forcing of dark/light mode
    [x] allow solid color backgrounds for widgets
    [-] allow transparent backgrounds

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
const changelogs = {
    '2022.02.08': {
        added: [
            'All new menu that functions like an app interface',
            'New widget layouts for small, medium, and large widgets and some include quick action buttons.',
            'For users who use multiple widgets for the same device you can define the widget type and color using the Edit Widget on the homescreen and use one of the following params: smallSimple, smallDetailed, and an optional definition of color (no color = use system color mode) Dark, Light, the same applies to the medium and large widgets.  The large Widget only has a detailed version of the layout',
            'Setup menu now includes widget style and color mode settings, links to setup videos and documentation.',
            'Added new option to advanced info menu to allow emailing your anonymous vehicle data to me (Because this is email I will see your address, but you can choose to setup a private email using icloud hide email feature)(Either way i will never share or use your email for anything).',
            'Script changes are shown in a window when new versions are released.',
            "Lot's of other items I can't remember yet",
        ],
        fixed: ['Modified the margins of the widget to be more consistent and be better on small screens and small widgets.', 'Vehicle images should now load correctly.', "Lot's of other items I can't remember yet"],
        removed: ['Removed vehicle odometer from the widget UI to save space (moved it to the dashboard menu section).'],
        updated: ['Modified the fuel/battery bar to show the icon and percentage in the bar. The bar is now green when vehicle is EV, and red when below 10% and yellow below 20%.', 'Renamed debug menu to advanced info menu.', "Lot's of other items I can't remember yet"],
    },
};

const SCRIPT_VERSION = '2022.02.08';
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
    testMode: false, // Use cached data for testing
    useBetaModules: true, // Forces the use of the modules under the beta branch of the FordPass-scriptable GitHub repo.
    useLocalModules: false, // Stores and loads modules from local storage instead of iCloud.  disable to access the module files under the scriptable folder in iCloud Drive.
    useLocalLogs: false, // Stores logs locally for debugging purposes. Enable to see the logs in the Scriptable Folder in iCloud Drive
    useLocalFiles: true, // Use iCloud files for storing data
    ignoreHashCheck: true, // Enable this when you are editing modules and don't want the script to validate the hash for the file and overwrite the file.
    clearKeychainOnNextRun: false, // false or true
    clearFileManagerOnNextRun: false, // false or true
    showTestUIStuff: false,
};

//************************************************************************* */
//*                  Device Detail Functions
//************************************************************************* */
const screenResolution = Device.screenResolution();
const screenSize = Device.screenSize();
const screenScale = Device.screenScale();
const isSmallDisplay = screenResolution.width < 1200 === true;
const darkMode = Device.isUsingDarkAppearance();
if (typeof require === 'undefined') require = importModule;
const runningWidgetSize = config.widgetFamily;

// console.log('---------------DEVICE INFO ----------------');
// console.log(`OSDarkMode: ${darkMode}`);
// console.log(`IsSmallDisplay: ${isSmallDisplay}`);
// console.log(`ScreenSize: Width: ${screenSize.width} | Height: ${screenSize.height}`);
// console.log(`Device Info | Model: ${deviceModel} | OSVersion: ${deviceSystemVersion}`);

//******************************************************************************
//* Main Widget Code - ONLY make changes if you know what you are doing!!
//******************************************************************************

class Widget {
    colorMap = {
        text: {
            system: Color.dynamic(new Color('#000000'), new Color('#EDEDED')),
            dark: new Color('#EDEDED'),
            light: new Color('#000000'),
        },
        normalText: Color.dynamic(new Color('#000000'), new Color('#EDEDED')),
        lightText: Color.dynamic(Color.darkGray(), Color.lightGray()),
        openColor: new Color('#FF5733'),
        closedColor: new Color('#5A65C0'),
        orangeColor: new Color('#FF6700'),
        redColor: new Color('#DE1738'),
        textBlack: '#000000',
        textWhite: '#EDEDED',
        backColor: darkMode ? '#111111' : '#FFFFFF', // Background Color'
        backColorGrad: darkMode ? ['#141414', '#13233F'] : ['#BCBBBB', '#DDDDDD'], // Background Color Gradient}
        backColorGradDark: ['#141414', '#13233F'],
        backColorGradLight: ['#BCBBBB', '#DDDDDD'],
    };

    iconMap = {
        fuelIcon: darkMode ? 'gas-station_dark.png' : 'gas-station_light.png', // Image for gas station
        lockStatus: darkMode ? 'lock_dark.png' : 'lock_light.png', // Image Used for Lock Icon
        lockIcon: darkMode ? 'lock_dark.png' : 'lock_light.png', // Image Used for Lock Icon
        tirePressure: darkMode ? 'tire_dark.png' : 'tire_light.png', // Image for tire pressure
        unlockIcon: darkMode ? 'unlock_dark.png' : 'unlock_light.png', // Image Used for UnLock Icon
        batteryStatus: darkMode ? 'battery_dark.png' : 'battery_light.png', // Image Used for Battery Icon
        doors: darkMode ? 'door_dark.png' : 'door_light.png', // Image Used for Door Lock Icon
        windows: darkMode ? 'window_dark.png' : 'window_light.png', // Image Used for Window Icon
        oil: darkMode ? 'oil_dark.png' : 'oil_light.png', // Image Used for Oil Icon
        ignitionStatus: darkMode ? 'key_dark.png' : 'key_light.png', // Image Used for Ignition Icon
        keyIcon: darkMode ? 'key_dark.png' : 'key_light.png', // Image Used for Key Icon
        position: darkMode ? 'location_dark.png' : 'location_light.png', // Image Used for Location Icon
        evBatteryStatus: darkMode ? 'ev_battery_dark.png' : 'ev_battery_light.png', // Image Used for EV Battery Icon
        evChargeStatus: darkMode ? 'ev_plug_dark.png' : 'ev_plug_light.png', // Image Used for EV Plug Icon
    };

    sizeMap = {
        small: {
            titleFontSize: isSmallDisplay ? 9 : 10,
            fontSizeSmall: isSmallDisplay ? 8 : 9,
            fontSizeMedium: isSmallDisplay ? 9 : 10,
            fontSizeBig: isSmallDisplay ? 12 : 12,
            barGauge: {
                w: isSmallDisplay ? 65 : 65,
                h: isSmallDisplay ? 15 : 17,
                fs: isSmallDisplay ? 8 : 10,
            },
            logoSize: {
                w: isSmallDisplay ? 65 : 65,
                h: isSmallDisplay ? 35 : 35,
            },
            iconSize: {
                w: isSmallDisplay ? 11 : 11,
                h: isSmallDisplay ? 11 : 11,
            },
        },
        medium: {
            titleFontSize: isSmallDisplay ? 9 : 10,
            fontSizeSmall: isSmallDisplay ? 8 : 10,
            fontSizeMedium: isSmallDisplay ? 9 : 11,
            fontSizeBig: isSmallDisplay ? 12 : 12,
            barGauge: {
                w: isSmallDisplay ? 80 : 80,
                h: isSmallDisplay ? 15 : 17,
                fs: isSmallDisplay ? 8 : 10,
            },
            logoSize: {
                w: isSmallDisplay ? 85 : 85,
                h: isSmallDisplay ? 45 : 45,
            },
            iconSize: {
                w: isSmallDisplay ? 11 : 11,
                h: isSmallDisplay ? 11 : 11,
            },
        },
        large: {
            titleFontSize: 14,
            fontSizeSmall: 10,
            fontSizeMedium: 13,
            fontSizeBig: 16,
            barGauge: {
                w: 295,
                h: 20,
                fs: 13,
            },
            logoSize: {
                w: 160,
                h: 84.7,
            },
            iconSize: {
                w: 12,
                h: 12,
            },
        },
        extraLarge: {
            titleFontSize: 15,
            fontSizeSmall: 11,
            fontSizeMedium: 13,
            fontSizeBig: 17,
            barGauge: {
                w: 300,
                h: 20,
                fs: 14,
            },
            logoSize: {
                w: 160,
                h: 84.7,
            },
            iconSize: {
                w: 12,
                h: 12,
            },
        },
    };

    constructor() {
        this.SCRIPT_NAME = 'Fordpass Widget';
        this.SCRIPT_ID = SCRIPT_ID;
        this.SCRIPT_VERSION = SCRIPT_VERSION;
        // this.SCRIPT_TS = SCRIPT_TS;
        this.stateStore = {};
        this.moduleMap = {};
        this.localFM = FileManager.local();
        this.localDocs = this.localFM.documentsDirectory();
        this.localModuleDir = this.localFM.joinPath(this.localDocs, 'FPWModules');
        this.iCloudFM = FileManager.iCloud();
        this.iCloudDocs = this.iCloudFM.documentsDirectory();
        this.iCloudModuleDir = this.iCloudFM.joinPath(this.iCloudDocs, 'FPWModules');
        this.logger = logger.bind(this);
        this.logInfo = logInfo.bind(this);
        this.logError = logError.bind(this);
        //************************************************************************* */
        //*                  Device Detail Functions
        //************************************************************************* */
        this.screenResolution = screenResolution;
        this.screenSize = screenSize;
        this.screenScale = screenScale;
        this.isSmallDisplay = isSmallDisplay;
        this.darkMode = darkMode;
        this.runningWidgetSize = config.widgetFamily;
        this.isPhone = Device.isPhone();
        this.isPad = Device.isPad();
        this.deviceModel = Device.model();
        this.deviceSystemVersion = Device.systemVersion();
        this.widgetConfig = widgetConfig;
        if (config.runsInApp) {
            this.Timers = this.moduleLoader('Timers');
            this.Alerts = this.moduleLoader('Alerts');
        }
        this.Notifications = this.moduleLoader('Notifications');
        // }
        // this.ShortcutParser = this.moduleLoader('ShortcutParser');
        this.Files = this.moduleLoader('Files');
        this.FordAPI = this.moduleLoader('FordAPIs');
        if (config.runsInApp) {
            this.changelogs = changelogs;
            this.Tables = this.moduleLoader('Tables');
            this.Menus = this.moduleLoader('Menus');
        }
        this.checkForUpdates();
    }

    /**
     * @description
     * @param  {any} moduleName
     * @return
     * @memberof Widget
     */
    moduleLoader(moduleName) {
        try {
            const module = require(this.iCloudModuleDir + `/FPW_${moduleName}.js`);
            return new module(this);
        } catch (error) {
            this.logError(`Module Loader | (${moduleName}) | Error: ${error}`);
        }
    }

    widgetModuleLoader(moduleName) {
        try {
            const module = require(this.iCloudModuleDir + `/FPW_${moduleName}.js`);
            return new module(this);
        } catch (error) {
            this.logError(`Module Loader | (${moduleName}) | Error: ${error}`);
        }
    }

    /**
     * @description
     * @return
     * @memberof Widget
     */
    async run() {
        try {
            this.logInfo('---------------------------');
            this.logInfo('Widget RUN...');
            // Starts the widget load process
            // console.log(`Device Models From ViewPort: ${await this.viewPortSizes.devices}`);
            // console.log(`widgetSize(run): ${JSON.stringify(await this.viewPortSizes)}`);
            let fordData = widgetConfig.testMode ? await this.FordAPI.fetchVehicleData(true) : await this.prepWidget(config.runsInWidget);
            if (fordData === null) return;
            if (config.runsInWidget) {
                if (args.widgetParameter) {
                    await this.generateWidget(args.widgetParameter, fordData);
                } else {
                    await this.generateWidget(runningWidgetSize, fordData);
                }
            } else if (config.runsInApp || config.runsFromHomeScreen) {
                if (args.shortcutParameter) {
                    // Create a parser function...
                    await Speech.speak(await this.ShortcutParser.parseIncomingSiriCommand(args.shortcutParameter));
                } else if (args.queryParameters && Object.keys(args.queryParameters).length > 0) {
                    console.log(JSON.stringify(args.queryParameters));
                    // this.Alerts.showAlert('Query Params', JSON.stringify(args.queryParameters));
                    await this.processQueryParams(args.queryParameters, fordData);
                } else {
                    let w2 = await this.generateWidget('small', fordData);
                    await w2.presentSmall();
                    let w3 = await this.generateWidget('smallSimple', fordData);
                    await w3.presentSmall();
                    let w = await this.generateWidget('medium', fordData);
                    await w.presentMedium();
                    let w4 = await this.generateWidget('mediumSimple', fordData);
                    await w4.presentMedium();
                    let w5 = await this.generateWidget('large', fordData);
                    await w5.presentLarge();

                    await this.Tables.MainPage.createMainPage();
                }
            } else if (config.runsWithSiri || config.runsInActionExtension) {
                // console.log('runsWithSiri: ' + config.runsWithSiri);
                // console.log('runsInActionExtension: ' + config.runsInActionExtension);
            } else {
                // this.logInfo('(generateWidget) Running in Widget (else)...');
                await this.generateWidget(runningWidgetSize, fordData);
            }
            Script.complete();
        } catch (e) {
            await this.logError(`run() Error: ${e}`, true);
        }
    }

    async processQueryParams(params, vData) {
        if (params && params.command) {
            switch (params.command) {
                case 'show_menu':
                    this.Tables.MainPage.createMainPage();
                    break;
                case 'lock_command':
                case 'start_command':
                    this.Tables.MainPage.createMainPage(false, params.command);
                    break;
            }
        }
    }

    /**
     * @description Makes sure the widget is ready to run by checking for proper settings. It will prompt the user to change settings if needed.
     * @return
     * @memberof Widget
     */
    async prepWidget(isWidget = false) {
        try {
            if (widgetConfig.clearKeychainOnNextRun) {
                await this.clearSettings();
            }
            if (widgetConfig.clearFileManagerOnNextRun) {
                await this.Files.clearFileManager();
            }
            // Tries to fix the format of the VIN field (Makes sure they are capitalized)
            await this.vinFix(await this.getSettingVal('fpVin'));

            let frcPrefs = false;
            let reqOk = await this.requiredPrefsOk(this.prefKeys().core);
            // console.log(`reqOk: ${reqOk}`);
            if (!reqOk) {
                let prompt = await this.Menus.requiredPrefsMenu();

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
            const cAuth = await this.FordAPI.checkAuth('prepWidget');
            // console.log(`(prepWidget) CheckAuth Result: ${cAuth}`);

            // console.log(`(prepWidget) Checking User Prefs | Force: (${frcPrefs})`);
            const fPrefs = await this.FordAPI.queryFordPassPrefs(frcPrefs);
            // console.log(`(prepWidget) User Prefs Result: ${fPrefs}`);

            // console.log('(prepWidget) Fetching Vehicle Data...');
            const vData = await this.FordAPI.fetchVehicleData(false, isWidget);
            return vData;
        } catch (err) {
            this.logError(`prepWidget() Error: ${err}`);
            return null;
        }
    }

    /**
     * @description Takes the widget size and vehicle data and generates the widget object
     * @param  {String} size
     * @param  {Object} data
     * @return
     * @memberof Widget
     */
    async generateWidget(size, data) {
        this.logInfo(`generateWidget() | Size: ${size}`);
        let mod = null;
        let widget = null;
        let bgType = (await this.getBackgroundType()) || 'system';
        let colorMode = await this.getUIColorMode();
        if (size.includes('dark')) {
            bgType = 'dark';
            colorMode = 'dark';
        } else if (size.includes('light')) {
            bgType = 'light';
            colorMode = 'light';
        } else if (size.includes('transparent')) {
            bgType = 'transparent';
        }

        console.log(`bgType: ${bgType} | colorMode: ${colorMode}`);
        try {
            switch (size) {
                case 'small':
                    mod = await this.moduleLoader('Widgets_Small');
                    widget = await mod.createWidget(data, 'detailed', bgType, colorMode);
                    break;
                case 'smallSimple':
                    mod = await this.moduleLoader('Widgets_Small');
                    widget = await mod.createWidget(data, 'simple', bgType, colorMode);
                    break;
                case 'large':
                    mod = await this.moduleLoader('Widgets_Large');
                    widget = await mod.createWidget(data, 'detailed', bgType, colorMode);
                    break;
                case 'largeSimple':
                    mod = await this.moduleLoader('Widgets_Large');
                    widget = await mod.createWidget(data, 'simple', bgType, colorMode);
                    break;
                case 'extraLarge':
                    mod = await this.moduleLoader('Widgets_Large');
                    widget = await mod.createWidget(data, 'detailed', bgType, colorMode);
                    break;
                case 'medium':
                    mod = await this.moduleLoader('Widgets_Medium');
                    widget = await mod.createWidget(data, 'detailed', bgType, colorMode);
                    break;
                case 'mediumSimple':
                    mod = await this.moduleLoader('Widgets_Medium');
                    widget = await mod.createWidget(data, 'simple', bgType, colorMode);
                    break;
                default:
                    mod = await this.moduleLoader('Widgets_Medium');
                    widget = await mod.createWidget(data, 'detailed', bgType, colorMode);
                    break;
            }
            if (widget === null) {
                this.logError(`generateWidget() | Widget is null!`);
                return;
            }
        } catch (e) {
            this.logError(`generateWidget() Error: ${e}`);
        }
        widget.setPadding(0, 5, 0, 1);
        widget.refreshAfterDate = new Date(Date.now() + 1000 * 240); // Update the widget every 5 minutes from last run (this is not always accurate and there can be a swing of 1-5 minutes)
        Script.setWidget(widget);
        this.logInfo(`Created Widget(${size})...`);
        return widget;
    }

    // Modified version of this https://talk.automators.fm/t/get-available-widget-height-and-width-depending-on-the-devices-screensize/9258/5
    async getViewPortSizes(widgetFamily) {
        const vpSize = `${this.screenSize.width}x${this.screenSize.height}`;
        await this.logInfo(`getViewPortSizes | ViewPort Size: ${vpSize}`);
        const sizeMap = {
            // IPAD_VIEWPORT_SIZES
            '768x1024': {
                devices: ['iPad Mini 2/3/4', 'iPad 3/4', 'iPad Air 1/2', '9.7" iPad Pro'],
                small: { width: 120, height: 120 },
                medium: { width: 260, height: 120 },
                large: { width: 260, height: 260 },
                extraLarge: { width: 540, height: 260 },
            },
            '810x1080': {
                devices: ['10.2" iPad'],
                small: { width: 124, height: 124 },
                medium: { width: 272, height: 124 },
                large: { width: 272, height: 272 },
                extraLarge: { width: 568, height: 272 },
            },
            '834x1112': {
                devices: ['10.5" iPad Pro', '10.5" iPad Air 3rd Gen'],
                small: { width: 132, height: 132 },
                medium: { width: 288, height: 132 },
                large: { width: 288, height: 288 },
                extraLarge: { width: 600, height: 288 },
            },
            '820x1180': {
                devices: ['10.9" iPad Air 4th Gen'],
                small: { width: 136, height: 136 },
                medium: { width: 300, height: 136 },
                large: { width: 300, height: 300 },
                extraLarge: { width: 628, height: 300 },
            },
            '834x1194': {
                devices: ['11" iPad Pro'],
                small: { width: 155, height: 155 },
                medium: { width: 329, height: 155 },
                large: { width: 345, height: 329 },
                extraLarge: { width: 628, height: 300 },
            },
            '1024x1366': {
                devices: ['12.9" iPad Pro'],
                small: { width: 170, height: 170 },
                medium: { width: 332, height: 170 },
                large: { width: 382, height: 332 },
                extraLarge: { width: 748, height: 356 },
            },

            // IPHONE_VIEWPORT_SIZES
            '428x926': {
                devices: ['12 Pro Max'],
                small: { width: 170, height: 170 },
                medium: { width: 364, height: 170 },
                large: { width: 364, height: 382 },
            },
            '360x780': {
                devices: ['12 Mini'],
                small: { width: 155, height: 155 },
                medium: { width: 329, height: 155 },
                large: { width: 329, height: 345 },
            },
            '414x896': {
                devices: ['XR', 'XS Max', '11', '11 Pro Max'],
                small: { width: 169, height: 169 },
                medium: { width: 360, height: 169 },
                large: { width: 360, height: 376 },
            },
            '390x844': {
                devices: ['12', '12 Pro'],
                small: { width: 158, height: 158 },
                medium: { width: 338, height: 158 },
                large: { width: 338, height: 354 },
            },
            '375x812': {
                devices: ['X', 'XS', '11 Pro'],
                small: { width: 155, height: 155 },
                medium: { width: 329, height: 155 },
                large: { width: 329, height: 345 },
            },
            '414x736': {
                devices: ['6S Plus', '7 Plus', '8 Plus'],
                small: { width: 159, height: 159 },
                medium: { width: 348, height: 159 },
                large: { width: 348, height: 357 },
            },
            '375x667': {
                devices: ['6', '6S', '7', '8', 'SE (2nd Gen)'],
                small: { width: 148, height: 148 },
                medium: { width: 322, height: 148 },
                large: { width: 322, height: 324 },
            },
            '320x568': {
                devices: ['SE (1st Gen)'],
                small: { width: 141, height: 141 },
                medium: { width: 291, height: 141 },
                large: { width: 291, height: 299 },
            },
        };

        if (sizeMap[vpSize]) {
            await this.logger(`getViewPortSizes | Device Models: ${sizeMap[vpSize].devices.join(', ') || 'Unknown'}`);
            // console.log(`getViewPortSizes | Sizes: ${JSON.stringify(sizeMap[vpSize])}`);
            return sizeMap[vpSize][widgetFamily];
        } else {
            let fallback = {
                devices: ['Fallback'],
                small: { width: 155, height: 155 },
                medium: { width: 329, height: 155 },
                large: { width: 329, height: 345 },
                extraLarge: { width: 329, height: 345 },
            };
            // await this.logger(`getViewPortSizes(fallback) | Device Models: ${fallback.devices.join(', ') || 'Unknown'}`);
            return fallback[widgetFamily];
        }
    }

    /**
     * @description
     * @return {void}@memberof Widget
     */
    async checkForUpdates() {
        const v = await this.getLatestScriptVersion();
        this.setStateVal('LATEST_VERSION', v);
        this.setStateVal('updateAvailable', this.isNewerVersion(this.SCRIPT_VERSION, v));
        console.log(`Script Version: ${this.SCRIPT_VERSION}`);
        console.log(`Update Available: ${this.getStateVal('updateAvailable')}`);
        console.log(`Latest Version: ${this.getStateVal('LATEST_VERSION')}`);
    }

    /**
     * @description
     * @return
     * @memberof Widget
     */
    async readLogFile(logType) {
        try {
            let fm = widgetConfig.useLocalLogs ? FileManager.local() : FileManager.iCloud();
            const logDir = fm.joinPath(fm.documentsDirectory(), 'Logs');
            const devName = Device.name()
                .replace(/[^a-zA-Z\s]/g, '')
                .replace(/\s/g, '_')
                .toLowerCase();
            let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `$fp_${devName}_${logType}_${this.SCRIPT_ID}.log` : `fp_${devName}_${logType}.log`;
            let path = fm.joinPath(logDir, fileName);
            if (await fm.fileExists(path)) {
                return await fm.readString(path);
            } else {
                return undefined;
            }
        } catch (e) {
            this.logError(`readLogFile Error: ${e}`);
        }
    }

    /**
     * @description
     * @return
     * @memberof Widget
     */
    async getLogFilePath(logType) {
        try {
            const fm = widgetConfig.useLocalLogs ? FileManager.local() : FileManager.iCloud();
            const logDir = fm.joinPath(fm.documentsDirectory(), 'Logs');
            const devName = Device.name()
                .replace(/[^a-zA-Z\s]/g, '')
                .toLowerCase();
            let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `$fp_${devName}_${logType}_${this.SCRIPT_ID}.log` : `fp_${devName}_${logType}.log`;
            let path = fm.joinPath(logDir, fileName);
            if (fm.fileExists(path)) {
                return path;
            } else {
                return undefined;
            }
        } catch (e) {
            this.logError(`getLogFilePath Error: ${e}`);
        }
    }

    /**
     * @description
     * @param  {any} key
     * @param  {any} value
     * @return {void}@memberof Widget
     */
    setStateVal(key, value) {
        this.stateStore[key] = value;
    }

    /**
     * @description
     * @param  {any} key
     * @return
     * @memberof Widget
     */
    getStateVal(key) {
        return this.stateStore[key];
    }

    /**
     * @description
     * @param  {any} key
     * @return {void}@memberof Widget
     */
    removeStateVal(key) {
        delete this.stateStore[key];
    }

    setWidgetBackground(widget, mode = 'system') {
        let grad = null;
        switch (mode) {
            case 'transparent':
                // TODO Finish this.
                break;
            case 'dark':
                grad = new LinearGradient();
                grad.locations = [0, 1];
                grad.colors = [new Color(this.colorMap.backColorGradDark[0]), new Color(this.colorMap.backColorGradDark[1])];
                widget.backgroundGradient = grad;
                break;
            case 'light':
                grad = new LinearGradient();
                grad.locations = [0, 1];
                grad.colors = [new Color(this.colorMap.backColorGradLight[0]), new Color(this.colorMap.backColorGradLight[1])];
                widget.backgroundGradient = grad;
                break;
            default:
                grad = new LinearGradient();
                grad.locations = [0, 1];
                grad.colors = [new Color(this.colorMap.backColorGrad[0]), new Color(this.colorMap.backColorGrad[1])];
                widget.backgroundGradient = grad;
                break;
        }
    }

    /**
     * @description
     * @return
     * @memberof Widget
     */
    getBgGradient(mode = undefined) {
        let grad = new LinearGradient();
        grad.locations = [0, 1];
        grad.colors = [new Color(this.colorMap.backColorGrad[0]), new Color(this.colorMap.backColorGrad[1])];
        return grad;
    }

    /**
     * @description
     * @param  {any} str
     * @return
     * @memberof Widget
     */
    textMap(str) {
        return {
            symbols: {
                closed: '✓',
                open: '✗',
            },
            // Widget Title
            elemHeaders: {
                fuelTank: 'Fuel',
                odometer: '',
                oil: 'Oil Life',
                windows: 'Windows',
                doors: 'Doors',
                position: 'Location',
                tirePressure: `Tires (${str})`,
                lockStatus: 'Locks',
                lock: 'Lock',
                unlock: 'Unlock',
                ignitionStatus: 'Ignition',
                batteryStatus: 'Battery',
                evChargeStatus: 'Charger',
                remoteStart: 'Remote Start',
            },
            UIValues: {
                closed: 'Closed',
                open: 'Open',
                unknown: 'Unknown',
                second: 'Second',
                minute: 'Minute',
                hour: 'Hour',
                day: 'Day',
                month: 'Month',
                year: 'Year',
                perYear: 'p.a.',
                plural: 's', // 's' in english
                precedingAdverb: '', // used in german language, for english let it empty
                subsequentAdverb: 'ago', // used in english language ('ago'), for german let it empty
            },
            errorMessages: {
                invalidGrant: 'Incorrect Login Data',
                connectionErrorOrVin: 'Incorrect VIN Number',
                unknownError: 'Unknown Error',
                noMessages: 'No Messages',
                accessDenied: 'Access Denied',
                noData: 'No Data',
                noCredentials: 'Missing Login Credentials',
                noVin: 'VIN Missing',
                cmd_err_590: 'Command Failed!\n\nVehicle failed to start. You must start from inside your vehicle after two consecutive remote start events. ',
                cmd_err: `There was an error sending the command to the vehicle!\n`,
            },
            successMessages: {
                locks_cmd_title: 'Lock Command',
                locked_msg: 'Vehicle Received Lock Command Successfully',
                unlocked_msg: 'Vehicle Received Unlock Command Successfully',
                cmd_success: `Vehicle Received Command Successfully`,
            },
            about: {
                author: 'Anthony S.',
                authorGithub: 'https://github.com/tonesto7',
                desc: "This is a custom widget for Ford's Vehicle Connect app.\n\nIt is a work in progress and is not yet complete.\n\nIf you have any questions or comments, please contact me at",
                email: 'purer_06_fidget@icloud.com',
                donationsDesc: 'If you like this widget, please consider making a donation to the author.\n\nYou can do so by clicking the button below.',
                donationUrl: 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HWBN4LB9NMHZ4',
                documentationUrl: 'https://github.com/tonesto7/fordpass-scriptable#readme',
                issuesUrl: 'https://github.com/tonesto7/fordpass-scriptable/issues',
                helpVideos: {
                    setup: {
                        title: 'Setup the Widget',
                        url: 'https://tonesto7.github.io/fordpass-scriptable/videos/setup_demo.mp4',
                    },
                },
            },
        };
    }

    //********************************************************************************************************************************
    //*                                                     UTILITY FUNCTIONS
    //********************************************************************************************************************************

    /**
     * @description
     * @param  {any} name
     * @return {void}@memberof Widget
     */
    runScript(name, params = {}) {
        let callback = new CallbackURL('scriptable:///run');
        callback.addParameter('scriptName', name);
        if (params && Object.keys(params).length > 0) {
            for (let key in params) {
                callback.addParameter(key, params[key]);
            }
        }
        callback.open();
    }

    async buildCallbackUrl(params = {}) {
        let callback = new CallbackURL(URLScheme.forRunningScript());

        if (params && Object.keys(params).length > 0) {
            for (let key in params) {
                callback.addParameter(key, params[key]);
            }
        }
        return callback.getURL();
    }

    /**
     * @description
     * @return {void}@memberof Widget
     */
    openScriptable() {
        let callback = new CallbackURL('scriptable:///');
        callback.open();
    }

    /**
     * @description
     * @param  {any} url
     * @param  {any} locale
     * @return
     * @memberof Widget
     */
    async getReleaseNotes(url, locale) {
        console.log(`getReleaseNotes | Url: ${url} | Locale: ${locale}`);
        let req = new Request(url);
        req.method = 'GET';
        req.headers = {
            'Content-Type': 'plain/text',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
        };
        req.timeoutInterval = 10;
        let data = await req.loadString();
        let cmdResp = req.response;
        try {
            if (cmdResp.statusCode === 200 && data) {
                let json = JSON.parse(data);
                // console.log(JSON.stringify(json));
                let rTextFnd = json.filter((r) => r.LanguageCodeMobileApp && r.LanguageCodeMobileApp === locale);
                // console.log(`rTextFnd: ${JSON.stringify(rTextFnd)}`);
                if (rTextFnd && rTextFnd[0] && rTextFnd[0].Text) {
                    // console.log(rTextFnd[0].Text);
                    return rTextFnd[0].Text;
                }
            }
        } catch (e) {
            this.logError(`getReleaseNotes Error: Could Not Load Release Notes. ${e}`);
        }
        return undefined;
    }

    /**
     * @description
     * @return
     * @memberof Widget
     */
    async getLatestScriptVersion() {
        let req = new Request(`https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/latest_v2.json`);
        req.headers = {
            'Content-Type': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
        };
        req.method = 'GET';
        req.timeoutInterval = 10;
        try {
            let ver = await req.loadJSON();
            return ver && ver.version ? ver.version.replace('v', '') : undefined;
        } catch (e) {
            this.logError(`getLatestScriptVersion Error: Could Not Load Version File | ${e}`);
        }
    }

    /**
     * @description
     * @param  {any} data
     * @param  {boolean} [attachJson=false]
     * @return {void}@memberof Widget
     */
    async createVehicleDataEmail(data, attachJson = false) {
        try {
            let email = new Mail();
            const vehType = data.info && data.info.vehicle && data.info.vehicle.vehicleType ? data.info.vehicle.vehicleType : undefined;
            const vehVin = data.info && data.info.vehicle && data.info.vehicle.vin ? data.info.vehicle.vin : undefined;
            email.subject = `${vehType || 'FordPass'} Vehicle Data`;
            email.toRecipients = [this.textMap().about.email]; // This is my anonymous email address provided by Apple,
            email.body = attachJson ? 'Vehicle data is attached file' : JSON.stringify(data, null, 4);
            email.isBodyHTML = true;
            let fm = FileManager.local();
            let dir = fm.documentsDirectory();
            let path = fm.joinPath(dir, vehType ? `${vehType.replace(/\s/g, '_')}${vehVin ? '_' + vehVin : '_export'}.json` : `vehicleDataExport.json`);
            if (attachJson) {
                // Creates temporary JSON file and attaches it to the email
                if (await fm.fileExists(path)) {
                    await fm.remove(path); //removes existing file if it exists
                }
                await fm.writeString(path, JSON.stringify(data));
                await email.addFileAttachment(path);
            }
            await email.send();
            await fm.remove(path);
        } catch (e) {
            this.logError(`createVehicleDataEmail Error: Could Not Create Email | ${e}`);
        }
    }

    /**
     * @description
     * @return {void}@memberof Widget
     */
    async createLogEmail() {
        try {
            const email = new Mail();
            email.subject = `FordPass Widget Logs`;
            email.toRecipients = [this.textMap().about.email]; // This is my anonymous email address provided by Apple,
            email.body = 'Widget Logs are Attached';
            email.isBodyHTML = true;
            let appLogs = await this.getLogFilePath('app');
            if (appLogs) {
                await email.addFileAttachment(appLogs);
            }
            let widgetLogs = await this.getLogFilePath('widget');
            if (widgetLogs) {
                await email.addFileAttachment(widgetLogs);
            }
            await email.send();
        } catch (e) {
            this.logError(`createLogEmail Error: Could Not Send Log Email. ${e}`);
        }
    }

    /**
     * @description
     * @param  {any} data
     * @return
     * @memberof Widget
     */
    async getPosition(data) {
        let loc = await Location.reverseGeocode(parseFloat(data.gps.latitude), parseFloat(data.gps.longitude));
        return `${loc[0].postalAddress.street}, ${loc[0].postalAddress.city}`;
    }

    /**
     * @description
     * @param  {any} src
     * @return
     * @memberof Widget
     */
    convertFordDtToLocal(src) {
        try {
            let dtp = new Date(Date.parse(src.replace(/-/g, '/')));
            let dto = new Date(dtp.getTime() - dtp.getTimezoneOffset() * 60 * 1000);
            return dto;
        } catch (e) {
            this.logError(`convertFordDtToLocal Error: ${e}`);
        }
    }

    /**
     * @description
     * @param  {any} prevTime
     * @param  {boolean} [asObj=false]
     * @return
     * @memberof Widget
     */
    timeDifference(prevTime, asObj = false) {
        const now = new Date().getTime();
        const min = 60 * 1000;
        const hour = min * 60;
        const day = hour * 24;
        const month = day * 30;
        const year = day * 365;
        const elap = now - prevTime;

        if (elap < min) {
            let d = Math.round(elap / 1000);
            return `${d} ${this.textMap().UIValues.second}${d > 1 ? this.textMap().UIValues.plural : ''} ${this.textMap().UIValues.subsequentAdverb}`;
        } else if (elap < hour) {
            let d = Math.round(elap / min);
            return `${d} ${this.textMap().UIValues.minute}${d > 1 ? this.textMap().UIValues.plural : ''} ${this.textMap().UIValues.subsequentAdverb}`;
        } else if (elap < day) {
            let d = Math.round(elap / hour);
            return `${d} ${this.textMap().UIValues.hour}${d > 1 ? this.textMap().UIValues.plural : ''} ${this.textMap().UIValues.subsequentAdverb}`;
        } else if (elap < month) {
            let d = Math.round(elap / day);
            return `${d} ${this.textMap().UIValues.day}${d > 1 ? this.textMap().UIValues.plural : ''} ${this.textMap().UIValues.subsequentAdverb}`;
        } else if (elap < year) {
            let d = Math.round(elap / month);
            return `${d} ${this.textMap().UIValues.month}${d > 1 ? this.textMap().UIValues.plural : ''} ${this.textMap().UIValues.subsequentAdverb}`;
        } else {
            let d = Math.round(elap / year);
            return `${d} ${this.textMap().UIValues.year}${d > 1 ? this.textMap().UIValues.plural : ''} ${this.textMap().UIValues.subsequentAdverb}`;
        }
    }

    async getLastRefreshElapsedString(vData) {
        const elap = this.timeDifference(this.convertFordDtToLocal(vData.lastRefreshed));
        return elap;
    }

    /**
     * @description
     * @param  {any} prevTime
     * @return
     * @memberof Widget
     */
    getElapsedMinutes(prevTime) {
        const now = new Date().getTime();
        const min = 60 * 1000;
        const hour = min * 60;
        const elap = now - prevTime;
        if (elap < min) {
            let d = Math.round(elap / 1000);
            return 0;
        } else if (elap < hour) {
            return Math.round(elap / min);
        }
        return 60;
    }

    /**
     * @description
     * @param  {any} pressure
     * @param  {any} digits
     * @return
     * @memberof Widget
     */
    async pressureToFixed(pressure, digits) {
        // console.log(`pressureToFixed(${pressure}, ${digits})`);
        try {
            let unit = await this.getSettingVal('fpPressureUnits');
            switch (unit) {
                case 'PSI':
                    return pressure ? (pressure * 0.1450377).toFixed(digits) : -1;
                case 'BAR':
                    return pressure ? (parseFloat(pressure) / 100).toFixed(digits) : -1;
                default:
                    //KPA
                    return pressure || -1;
            }
        } catch (e) {
            this.logError(`pressureToFixed Error: ${e}`);
        }
    }

    /**
     * @description
     * @param  {Object} items
     * @return {Array} openItems
     * @memberof Widget
     */
    getOpenItems(src = '', items) {
        let openItems = [];
        if (items && Object.keys(items).length) {
            Object.keys(items)
                .filter((k) => {
                    return items[k];
                })
                .map((k) => k)
                .forEach((k) => {
                    switch (k) {
                        case 'driverFront':
                            openItems.push('DF');
                            break;
                        case 'passFront':
                            openItems.push('PF');
                            break;
                        case 'leftRear':
                            openItems.push('LR');
                            break;
                        case 'rightRear':
                            openItems.push('RR');
                            break;
                        case 'hood':
                            openItems.push('HD');
                            break;
                        case 'tailgate':
                            openItems.push('TG');
                            break;
                        case 'innerTailgate':
                            openItems.push('ITG');
                            break;
                    }
                });
        }
        return openItems;
    }

    /**
     * @description
     * @param  {any} vin
     * @return {void}@memberof Widget
     */
    async vinFix(vin) {
        if (vin && vin.length && this.hasLowerCase(vin)) {
            console.log('VIN Validation Error: Your saved VIN number has lowercase letters.\nUpdating your saved value for you!');
            await this.setSettingVal('fpVin', vin.toUpperCase());
        }
    }

    /**
     * @description
     * @param  {any} str
     * @return {boolean}
     * @memberof Widget
     */
    hasLowerCase(str) {
        return str.toUpperCase() != str;
    }

    /**
     * @description
     * @param  {any} data
     * @return
     * @memberof Widget
     */
    scrubPersonalData(data) {
        function scrubInfo(obj, id) {
            function scrub(type, str) {
                switch (type) {
                    case 'vin':
                    case 'relevantVin':
                        return str.substring(0, str.length - 4) + 'XXXX';
                    case 'position':
                    case 'address1':
                    case 'streetAddress':
                        return '1234 Someplace Drive';
                    case 'zipCode':
                    case 'postalCode':
                        return '12345';
                    case 'city':
                        return 'Some City';
                    case 'state':
                        return 'SW';
                    case 'country':
                        return 'UNK';
                    case 'licenseplate':
                        return 'ABC1234';
                    case 'latitude':
                        return 42.123456;
                    case 'longitude':
                        return -89.123456;
                }
            }
            Object.keys(obj).forEach((key) => {
                if (key === id) {
                    obj[key] = scrub(id, obj[key]);
                } else if (obj[key] !== null && typeof obj[key] === 'object') {
                    scrubInfo(obj[key], id);
                }
            });
            return obj;
        }
        let out = data;
        const keys = ['vin', 'relevantVin', 'position', 'streetAddress', 'address1', 'postalCode', 'zipCode', 'city', 'state', 'licenseplate', 'country', 'latitude', 'longitude'];
        for (const [i, key] of keys.entries()) {
            out = scrubInfo(data, key);
        }
        return out;
    }

    /**
     * @description
     * @param  {any} val
     * @return
     * @memberof Widget
     */
    inputTest(val) {
        return val !== '' && val !== null && val !== undefined;
    }

    /**
     * @description
     * @param  {any} str
     * @return
     * @memberof Widget
     */
    capitalizeStr(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    //********************************************************************************************************************************
    //*                                             KEYCHAIN/Settings MANAGEMENT FUNCTIONS
    //********************************************************************************************************************************

    /**
     * @description
     * @param  {any} vin
     * @param  {boolean} [setup=false]
     * @return
     * @memberof Widget
     */
    async vinCheck(vin, setup = false) {
        vin = vin || (await this.getSettingVal('fpVin'));
        let vinLen = vin && vin.length === 17;
        let vinChar = vin && vin.match(/^[a-zA-Z0-9]+$/);
        let msgs = [];
        if (vin) {
            if (setup && !vinLen) {
                msgs.push('VIN Number is not 17 characters long!');
            }
            if (setup && !vinChar) {
                msgs.push('VIN Number contains invalid characters!\nOnly A-Z, 0-9 are allowed!');
            }
            if (msgs.length > 0) {
                console.log(`VIN Format Issues (${msgs.length}) | Current VIN: ${vin} | Errors: ${msgs.join('\n')}`);
                if (!config.runsInWidget) {
                    //Added this to prevent the Alerts not supported in widgets error
                    // await this.FPW.Alerts.showAlert('VIN Validation Error', msgs.join('\n'));
                }
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    /**
     * @description
     * @return
     * @memberof Widget
     */
    async useMetricUnits() {
        return (await this.getSettingVal('fpDistanceUnits')) !== 'mi';
    }

    /**
     * @description
     * @return
     * @memberof Widget
     */
    async getMapProvider() {
        return (await this.getSettingVal('fpMapProvider')) || 'apple';
    }

    /**
     * @description
     * @param  {any} value
     * @return {void}@memberof Widget
     */
    async setMapProvider(value) {
        await this.setSettingVal('fpMapProvider', value);
    }

    /**
     * @description
     * @return {void}@memberof Widget
     */
    async toggleMapProvider() {
        await this.setMapProvider((await this.getMapProvider()) === 'google' ? 'apple' : 'google');
    }

    /**
     * @description
     * @param  {any} key
     * @return
     * @memberof Widget
     */
    async getSettingVal(key) {
        key = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `${key}_${this.SCRIPT_ID}` : key;
        try {
            if (await Keychain.contains(key)) {
                return await Keychain.get(key);
            }
        } catch (e) {
            this.FPW.logger(`getSettingVal(${key}) Error: ${e}`, true);
        }
        return null;
    }

    /**
     * @description
     * @param  {any} key
     * @param  {any} value
     * @return {void}@memberof Widget
     */
    async setSettingVal(key, value) {
        if (key && value) {
            key = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `${key}_${this.SCRIPT_ID}` : key;
            await Keychain.set(key, value);
        }
        return false;
    }

    async getUIColorMode(frcMode = undefined) {
        try {
            const modeSetting = await this.getSettingVal('fpUIColorMode');
            const mode = frcMode !== undefined ? frcMode : modeSetting;
            // console.log(`getUIColorMode(${mode})`);
            switch (mode) {
                case 'dark':
                case 'light':
                    return mode;
                default:
                    return this.darkMode ? 'dark' : 'light';
            }
        } catch (e) {
            this.FPW.logger(`getUIColorMode() Error: ${e}`, true);
        }
    }

    async getColorMode() {
        return (await this.getSettingVal('fpUIColorMode')) || 'system';
    }

    async setUIColorMode(mode) {
        return await this.setSettingVal('fpUIColorMode', mode);
    }

    async getBackgroundType() {
        return (await this.getSettingVal('fpWidgetBackground')) || 'system';
    }

    async setBackgroundType(type) {
        return await this.setSettingVal('fpWidgetBackground', type);
    }

    /**
     * @description
     * @return
     * @memberof Widget
     */
    async getWidgetStyle() {
        return (await this.getSettingVal('fpWidgetStyle')) || 'detailed';
    }

    /**
     * @description
     * @param  {any} style
     * @return
     * @memberof Widget
     */
    async setWidgetStyle(style) {
        return await this.setSettingVal('fpWidgetStyle', style);
    }

    /**
     * @description
     * @param  {any} key
     * @return {boolean}
     * @memberof Widget
     */
    hasSettingVal(key) {
        return Keychain.contains(key);
    }

    /**
     * @description
     * @param  {any} key
     * @return {void}@memberof Widget
     */
    async removeSettingVal(key) {
        key = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `${key}_${this.SCRIPT_ID}` : key;
        if (await Keychain.contains(key)) {
            await Keychain.remove(key);
        }
    }

    // async  performKeychainMigration() {
    //     let kcKeys = ['fpUser', 'fpPass', 'fpToken2', 'fpVin', 'fpMapProvider', 'fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpSpeedUnits'];
    //     for (const key in kcKeys) {
    //         // if (Keychain.contains())
    //     }
    // }

    /**
     * @description
     * @return
     * @memberof Widget
     */
    prefKeys() {
        return {
            core: ['fpUser', 'fpPass', 'fpToken2', 'fpVin', 'fpMapProvider', 'fpCountry', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits'], // 'fpDeviceLanguage'
            user: ['fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits'],
        };
    }

    /**
     * @description
     * @param  {any} keys
     * @return
     * @memberof Widget
     */
    async requiredPrefsOk(keys) {
        let missingKeys = [];
        for (const key in keys) {
            let val = await this.getSettingVal(keys[key]);
            if (val === null || val === '' || val === undefined) {
                missingKeys.push(keys[key]);
            }
        }

        if (missingKeys.length > 0) {
            console.log('Required Prefs Missing: ' + missingKeys);
            return false;
        } else {
            return true;
        }
    }

    /**
     * @description
     * @return {void}@memberof Widget
     */
    async clearSettings() {
        this.logInfo('Info: Clearing All Widget Settings from Keychain');
        const keys = [
            'fpToken',
            'fpToken2',
            'fpUsername',
            'fpUser',
            'fpPass',
            'fpPassword',
            'fpVin',
            'fpUseMetricUnits',
            'fpUsePsi',
            'fpVehicleType',
            'fpMapProvider',
            'fpCat1Token',
            'fpTokenExpiresAt',
            'fpCountry',
            'fpDeviceLanguage',
            'fpLanguage',
            'fpTz',
            'fpPressureUnits',
            'fpDistanceUnits',
            'fpSpeedUnits',
            'fpScriptVersion',
            'fpWidgetBackground',
            'fpWidgetStyle',
            'fpUIColorMode',
        ];
        for (const key in keys) {
            await this.removeSettingVal(keys[key]);
        }
    }

    // Shamelessly borrowed from WidgetMarkup.js by @rafaelgandi
    /**
     * @description
     * @param  {any} obj
     * @return
     * @memberof Widget
     */
    _getObjectClass(obj) {
        // See: https://stackoverflow.com/a/12730085
        if (obj && obj.constructor && obj.constructor.toString) {
            let arr = obj.constructor.toString().match(/function\s*(\w+)/);
            if (arr && arr.length == 2) {
                return arr[1];
            }
        }
        return undefined;
    }

    /**
     * @description
     * @param  {any} inst
     * @param  {any} options
     * @return
     * @memberof Widget
     */
    _mapMethodsAndCall(inst, options) {
        Object.keys(options).forEach((key) => {
            if (key.indexOf('*') !== -1) {
                key = key.replace('*', '');
                if (!(key in inst)) {
                    throw new Error(`Method "${key}()" is not applicable to instance of ${this._getObjectClass(inst)}`);
                }
                if (Array.isArray(options['*' + key])) {
                    inst[key](...options['*' + key]);
                } else {
                    inst[key](options[key]);
                }
            } else {
                if (!(key in inst)) {
                    throw new Error(`Property "${key}" is not applicable to instance of ${this._getObjectClass(inst)}`);
                }
                inst[key] = options[key];
            }
        });
        return inst;
    }

    /**
     * @description
     * @param  {any} oldVer
     * @param  {any} newVer
     * @return {boolean}
     * @memberof Widget
     */
    isNewerVersion(oldVer, newVer) {
        try {
            const oldParts = oldVer.split('.');
            const newParts = newVer.split('.');
            for (var i = 0; i < newParts.length; i++) {
                const a = ~~newParts[i]; // parse int
                const b = ~~oldParts[i]; // parse int
                if (a > b) return true;
                if (a < b) return false;
            }
        } catch (e) {
            this.logError(`isNewerVersion Error: ${e}`);
        }
        return false;
    }

    // widgetSizes() {
    //     return {
    //         old: {
    //             '428x926': {
    //                 small: { width: 176, height: 176 },
    //                 medium: { width: 374, height: 176 },
    //                 large: { width: 374, height: 391 },
    //             },
    //             '390x844': {
    //                 small: { width: 161, height: 161 },
    //                 medium: { width: 342, height: 161 },
    //                 large: { width: 342, height: 359 },
    //             },
    //             '414x896': {
    //                 small: { width: 169, height: 169 },
    //                 medium: { width: 360, height: 169 },
    //                 large: { width: 360, height: 376 },
    //             },
    //             '375x812': {
    //                 small: { width: 155, height: 155 },
    //                 medium: { width: 329, height: 155 },
    //                 large: { width: 329, height: 345 },
    //             },
    //             '414x736': {
    //                 small: { width: 159, height: 159 },
    //                 medium: { width: 348, height: 159 },
    //                 large: { width: 348, height: 357 },
    //             },
    //             '375x667': {
    //                 small: { width: 148, height: 148 },
    //                 medium: { width: 322, height: 148 },
    //                 large: { width: 322, height: 324 },
    //             },
    //             '320x568': {
    //                 small: { width: 141, height: 141 },
    //                 medium: { width: 291, height: 141 },
    //                 large: { width: 291, height: 299 },
    //             },
    //         },
    //     };
    // }
}

//********************************************************************************************************************************
//*                                                    MODULE AND LOG FUNCTIONS
//********************************************************************************************************************************

/**
 * @description This makes sure all modules are loaded and/or the correct version before running the script.
 * @return
 */
async function validateModules() {
    const moduleFiles = [
        'FPW_Alerts.js||1575654697',
        'FPW_Files.js||-732942791',
        'FPW_FordAPIs.js||908574209',
        'FPW_Keychain.js||865182748',
        'FPW_Menus.js||566532256',
        'FPW_Notifications.js||-168421043',
        'FPW_ShortcutParser.js||2076658623',
        'FPW_Tables.js||-102791873',
        'FPW_Tables_AlertPage.js||-1687899018',
        'FPW_Tables_ChangesPage.js||-1348322738',
        'FPW_Tables_MainPage.js||-189298638',
        'FPW_Tables_MessagePage.js||-1931255899',
        'FPW_Tables_RecallPage.js||1094245826',
        'FPW_Tables_WidgetStylePage.js||1814395347',
        'FPW_Timers.js||-1888476318',
        'FPW_Widgets_ExtraLarge.js||1098647483',
        'FPW_Widgets_Helpers.js||1392293995',
        'FPW_Widgets_Large.js||1561128693',
        'FPW_Widgets_Medium.js||21895432',
        'FPW_Widgets_Small.js||-219679237',
    ];
    const fm = widgetConfig.useLocalModules ? FileManager.local() : FileManager.iCloud();
    let moduleRepo = `https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/`;
    moduleRepo = widgetConfig.useBetaModules ? moduleRepo.replace('main', 'beta') : moduleRepo;
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

    let available = [];
    try {
        const moduleDir = fm.joinPath(fm.documentsDirectory(), 'FPWModules');
        if (!(await fm.isDirectory(moduleDir))) {
            logger('Creating FPWModules directory...');
            await fm.createDirectory(moduleDir);
        }
        for (const [i, file] of moduleFiles.entries()) {
            const [fileName, fileHash] = file.split('||');
            const filePath = fm.joinPath(moduleDir, fileName);
            if (!(await fm.fileExists(filePath))) {
                logger(`Required Module Missing... Downloading ${fileName}`);
                if (await downloadModule(fileName, filePath)) {
                    available.push(fileName);
                }
            } else {
                if (!widgetConfig.useLocalModules) {
                    await fm.downloadFileFromiCloud(filePath);
                }
                let fileCode = await fm.readString(filePath);
                const hash = Array.from(fileCode).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0);
                // console.log(`${fileName} hash: ${hash} | ${fileHash}`);
                if (widgetConfig.ignoreHashCheck === false && hash.toString() !== fileHash.toString()) {
                    logger(`Module Hash Missmatch... Downloading ${fileName}`);
                    if (await downloadModule(fileName, filePath)) {
                        available.push(fileName);
                    }
                } else {
                    available.push(fileName);
                }
            }
        }
        if (available.length === moduleFiles.length) {
            logger(`All (${moduleFiles.length}) Required Modules Found!`);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        logError(`validateModules() Error: ${error}`);
        return undefined;
    }
}

/**
 * @description
 * @param  {any} txt
 * @return {void}
 */
async function appendToLogFile(txt) {
    // console.log('appendToLogFile: Saving Data to Log...');
    try {
        const fm = widgetConfig.useLocalLogs ? FileManager.local() : FileManager.iCloud();
        const logDir = fm.joinPath(fm.documentsDirectory(), 'Logs');
        const devName = Device.name()
            .replace(/[^a-zA-Z\s]/g, '')
            .replace(/\s/g, '_')
            .toLowerCase();
        const type = config.runsInWidget ? 'widget' : config.runsInApp ? 'app' : 'unknown';
        let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `$fp_${devName}_${type}_${this.SCRIPT_ID}.log` : `fp_${devName}_${type}.log`;
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
 * @description
 * @param  {any} msg
 * @param  {boolean} [error=false]
 * @param  {boolean} [saveToLog=true]
 * @return {void}
 */
async function logger(msg, error = false, saveToLog = true) {
    if (saveToLog) {
        appendToLogFile(msg);
    }
    if (error) {
        console.error(msg);
    } else {
        console.log(msg);
    }
}

/**
 * @description
 * @param  {any} msg
 * @param  {boolean} [saveToLog=true]
 * @return {void}
 */
async function logInfo(msg, saveToLog = true) {
    logger(msg, false, saveToLog);
}

/**
 * @description
 * @param  {any} msg
 * @param  {boolean} [saveToLog=true]
 * @return {void}
 */
async function logError(msg, saveToLog = true) {
    logger(msg, true, saveToLog);
}

//********************************************************************************************************************************
//*                                              THIS IS WHAT RUNS THE ACTUAL SCRIPT
//********************************************************************************************************************************
// try {
if (await validateModules()) {
    const wc = new Widget();

    await wc.run();
}
// } catch (error) {
// logError(`Error: ${error}`);
//     throw new Error(error);
// }
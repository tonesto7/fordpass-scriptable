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
    - fix main page not refreshing every 30 seconds.
    - possibly add vehicle status overlay to image using canvas?!...

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

const SCRIPT_VERSION = '2.0.0';
const SCRIPT_TS = '2022/01/31, 6:00 pm';
const SCRIPT_ID = 0; // Edit this is you want to use more than one instance of the widget. Any value will work as long as it is a number and  unique.

//******************************************************************
//* Customize Widget Options
//******************************************************************
//test
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
    testMode: true,
    ignoreHashCheck: true,
    clearKeychainOnNextRun: false, // false or true
    clearFileManagerOnNextRun: false, // false or true
    showTestUIStuff: false,
};

//************************************************************************* */
//*                  Device Detail Functions
//************************************************************************* */
const screenSize = Device.screenResolution();
const screenScale = Device.screenScale();
const isSmallDisplay = screenSize.width < 1200 === true;
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
    changelog = {
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

    colorMap = {
        textColor1: darkMode ? '#EDEDED' : '#000000', // Header Text Color
        textColor2: darkMode ? '#EDEDED' : '#000000', // Value Text Color
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
    };

    iconMap = {
        textColor1: darkMode ? '#EDEDED' : '#000000', // Header Text Color
        textColor2: darkMode ? '#EDEDED' : '#000000', // Value Text Color
        textBlack: '#000000',
        textWhite: '#EDEDED',
        backColor: darkMode ? '#111111' : '#FFFFFF', // Background Color'
        backColorGrad: darkMode ? ['#141414', '#13233F'] : ['#BCBBBB', '#DDDDDD'], // Background Color Gradient
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
            titleFontSize: isSmallDisplay ? 9 : 9,
            fontSizeSmall: isSmallDisplay ? 8 : 8,
            fontSizeMedium: isSmallDisplay ? 9 : 9,
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
            titleFontSize: isSmallDisplay ? 12 : 12,
            fontSizeSmall: isSmallDisplay ? 14 : 14,
            fontSizeMedium: isSmallDisplay ? 16 : 16,
            fontSizeBig: isSmallDisplay ? 18 : 18,
            barGauge: {
                w: isSmallDisplay ? 300 : 300,
                h: isSmallDisplay ? 15 : 17,
                fs: isSmallDisplay ? 8 : 10,
            },
            logoSize: {
                w: isSmallDisplay ? 160 : 160,
                h: isSmallDisplay ? 84.7 : 84.7,
            },
            iconSize: {
                w: isSmallDisplay ? 12 : 12,
                h: isSmallDisplay ? 12 : 12,
            },
        },
        extraLarge: {
            titleFontSize: 10,
            fontSizeSmall: 10,
            fontSizeMedium: 11,
            fontSizeBig: 12,
            barGauge: {
                w: isSmallDisplay ? 300 : 300,
                h: isSmallDisplay ? 15 : 17,
                fs: isSmallDisplay ? 8 : 10,
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
        this.SCRIPT_TS = SCRIPT_TS;
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
        // if (config.runsInApp) {
        this.Timers = this.moduleLoader('Timers');
        this.Alerts = this.moduleLoader('Alerts');
        this.Notifications = this.moduleLoader('Notifications');
        // }
        // this.ShortcutParser = this.moduleLoader('ShortcutParser');
        this.Files = this.moduleLoader('Files');
        this.FordAPI = this.moduleLoader('FordAPIs');
        if (config.runsInApp) {
            this.Images = this.moduleLoader('Images');
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
            this.logError(`${moduleName} Load Error: ${error}`);
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
            let fordData = widgetConfig.testMode ? await this.FordAPI.fetchVehicleData(true) : await this.prepWidget();
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
                    this.Alerts.showAlert('Params Received', JSON.stringify(args.queryParameters));
                } else {
                    // let w = await this.generateWidget('medium', fordData);
                    // await w.presentMedium();
                    // let w2 = await this.generateWidget('small', fordData);
                    // await w2.presentSmall();
                    // let w3 = await this.generateWidget('smallSimple', fordData);
                    // await w3.presentSmall();
                    let w4 = await this.generateWidget('mediumSimple', fordData);
                    await w4.presentMedium();
                    let w5 = await this.generateWidget('large', fordData);
                    await w5.presentLarge();

                    // await this.Tables.MainPage.createMainPage();
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

    /**
     * @description Makes sure the widget is ready to run by checking for proper settings. It will prompt the user to change settings if needed.
     * @return
     * @memberof Widget
     */
    async prepWidget() {
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
            const vData = await this.FordAPI.fetchVehicleData();
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
        try {
            switch (size) {
                case 'small':
                    mod = await this.moduleLoader('Widgets_Small');
                    widget = await mod.createWidget(data, 'detailed');
                    break;
                case 'smallSimple':
                    mod = await this.moduleLoader('Widgets_Small');
                    widget = await mod.createWidget(data, 'simple');
                    break;
                case 'large':
                    mod = await this.moduleLoader('Widgets_Large');
                    widget = await mod.createWidget(data, 'detailed');
                    break;
                case 'largeSimple':
                    mod = await this.moduleLoader('Widgets_Large');
                    widget = await mod.createWidget(data, 'simple');
                    break;
                case 'extraLarge':
                    mod = await this.moduleLoader('Widgets_ExtraLarge');
                    widget = await mod.createWidget(data, 'detailed');
                    break;
                case 'medium':
                    mod = await this.moduleLoader('Widgets_Medium');
                    widget = await mod.createWidget(data, 'detailed');
                    break;
                case 'mediumSimple':
                    mod = await this.moduleLoader('Widgets_Medium');
                    widget = await mod.createWidget(data, 'simple');
                    break;
                default:
                    mod = await this.moduleLoader('Widgets_Medium');
                    widget = await mod.createWidget(data, 'detailed');
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
        widget.refreshAfterDate = new Date(Date.now() + 1000 * 60); // Update the widget every 5 minutes from last run (this is not always accurate and there can be a swing of 1-5 minutes)
        Script.setWidget(widget);
        this.logInfo(`Created Widget(${size})...`);
        return widget;
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
    async readLogFile() {
        try {
            let fm = FileManager.iCloud();
            const logDir = fm.joinPath(fm.documentsDirectory(), 'Logs');
            const devName = Device.name()
                .replace(/[^a-zA-Z\s]/g, '')
                .replace(/\s/g, '_')
                .toLowerCase();
            let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `$fp_${devName}_log_${this.SCRIPT_ID}.log` : `fp_${devName}_log.log`;
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
    async getLogFilePath() {
        try {
            let fm = FileManager.iCloud();
            const logDir = fm.joinPath(fm.documentsDirectory(), 'Logs');
            const devName = Device.name()
                .replace(/[^a-zA-Z\s]/g, '')
                .toLowerCase();
            let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `$fp_${devName}_log_${this.SCRIPT_ID}.log` : `fp_${devName}_log.log`;
            let path = fm.joinPath(logDir, fileName);
            if (await fm.fileExists(path)) {
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

    /**
     * @description
     * @return
     * @memberof Widget
     */
    getBgGradient() {
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
        let req = new Request(`https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/latest.json`);
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
            let email = new Mail();
            email.subject = `FordPass Widget Logs`;
            email.toRecipients = [this.textMap().about.email]; // This is my anonymous email address provided by Apple,
            email.body = 'Widget Logs are Attached';
            email.isBodyHTML = true;
            let logFile = await this.getLogFilePath();
            await email.addFileAttachment(logFile);
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
     * @param  {any} pressure
     * @param  {any} unit
     * @param  {string} [wSize='medium']
     * @return
     * @memberof Widget
     */
    getTirePressureStyle(pressure, unit, wSize = 'medium') {
        const styles = {
            normTxt: { font: Font.mediumSystemFont(this.sizeMap[wSize].fontSizeMedium), textColor: new Color(this.colorMap.textColor2) },
            statLow: { font: Font.heavySystemFont(this.sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF6700') },
            statCrit: { font: Font.heavySystemFont(this.sizeMap[wSize].fontSizeMedium), textColor: new Color('#DE1738') },
            offset: 10,
        };
        let p = parseFloat(pressure);
        if (p) {
            let low = this.widgetConfig.tirePressureThresholds.low;
            let crit = this.widgetConfig.tirePressureThresholds.critical;
            switch (unit) {
                case 'kPa':
                    low = this.widgetConfig.tirePressureThresholds.low / 0.145377;
                    crit = this.widgetConfig.tirePressureThresholds.critical / 0.145377;
                    break;
                case 'bar':
                    low = this.widgetConfig.tirePressureThresholds.low / 14.5377;
                    crit = this.widgetConfig.tirePressureThresholds.critical / 14.5377;
                    break;
            }
            if (p >= 0 && p > crit && p < low) {
                // console.log(`Tire Pressure Low(${low}) | Pressure ${p} | Func: (${p >= 0 && p > crit && p < low})`);
                return styles.statLow;
            } else if (p >= 0 && p < crit) {
                // console.log(`Tire Pressure Critical(${crit}) | Pressure ${p} | Func: (${p < crit && p >= 0})`);
                return styles.statCrit;
            } else {
                // console.log(`Tire Pressure | Pressure ${p}`);
                return styles.normTxt;
            }
        }
        // console.log(`Tire Pressure | Pressure ${p}`);
        return styles.normTxt;
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
        const keys = ['fpToken', 'fpToken2', 'fpUsername', 'fpUser', 'fpPass', 'fpPassword', 'fpVin', 'fpUseMetricUnits', 'fpUsePsi', 'fpVehicleType', 'fpMapProvider', 'fpCat1Token', 'fpTokenExpiresAt', 'fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits', 'fpSpeedUnits', 'fpScriptVersion'];
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

    /**
     * @description
     * @return
     * @memberof Widget
     */
    phoneSizes() {
        return {
            // 12 and 12 Pro
            2532: {
                small: 474,
                medium: 1014,
                large: 1062,
                left: 78,
                right: 618,
                top: 231,
                middle: 819,
                bottom: 1407,
            },

            // 11 Pro Max, XS Max
            2688: {
                small: 507,
                medium: 1080,
                large: 1137,
                left: 81,
                right: 654,
                top: 228,
                middle: 858,
                bottom: 1488,
            },

            // 11, XR
            1792: {
                small: 338,
                medium: 720,
                large: 758,
                left: 54,
                right: 436,
                top: 160,
                middle: 580,
                bottom: 1000,
            },

            // 11 Pro, XS, X
            2436: {
                small: 465,
                medium: 987,
                large: 1035,
                left: 69,
                right: 591,
                top: 213,
                middle: 783,
                bottom: 1353,
            },

            // Plus phones
            2208: {
                small: 471,
                medium: 1044,
                large: 1071,
                left: 99,
                right: 672,
                top: 114,
                middle: 696,
                bottom: 1278,
            },

            // SE2 and 6/6S/7/8
            1334: {
                small: 296,
                medium: 642,
                large: 648,
                left: 54,
                right: 400,
                top: 60,
                middle: 412,
                bottom: 764,
            },

            // SE1
            1136: {
                small: 282,
                medium: 584,
                large: 622,
                left: 30,
                right: 332,
                top: 59,
                middle: 399,
                bottom: 399,
            },

            // 11 and XR in Display Zoom mode
            1624: {
                small: 310,
                medium: 658,
                large: 690,
                left: 46,
                right: 394,
                top: 142,
                middle: 522,
                bottom: 902,
            },

            // Plus in Display Zoom mode
            2001: {
                small: 444,
                medium: 963,
                large: 972,
                left: 81,
                right: 600,
                top: 90,
                middle: 618,
                bottom: 1146,
            },
        };
    }
}

//********************************************************************************************************************************
//*                                                    MODULE AND LOG FUNCTIONS
//********************************************************************************************************************************

/**
 * @description This makes sure all modules are loaded and/or the correct version before running the script.
 * @param  {boolean} [useLocal=false] Tells the function to use the local file manager versus icloud version.
 * @return
 */
async function validateModules(useLocal = false) {
    const moduleFiles = [
        'FPW_Alerts.js||1575654697',
        'FPW_Files.js||-1368940717',
        'FPW_FordAPIs.js||-1527776815',
        'FPW_Images.js||-1368940717',
        'FPW_Keychain.js||865182748',
        'FPW_Menus.js||1069934756',
        'FPW_Notifications.js||-168421043',
        'FPW_ShortcutParser.js||2076658623',
        'FPW_Tables.js||1668082861',
        'FPW_Tables_AlertPage.js||1112174215',
        'FPW_Tables_ChangesPage.js||226382571',
        'FPW_Tables_MainPage.js||-531891446',
        'FPW_Tables_MessagePage.js||-848345285',
        'FPW_Tables_RecallPage.js||-169548452',
        'FPW_Tables_WidgetStylePage.js||-1509087067',
        'FPW_Timers.js||-1888476318',
        'FPW_Widgets_ExtraLarge.js||1913554047',
        'FPW_Widgets_Helpers.js||384162293',
        'FPW_Widgets_Large.js||692726051',
        'FPW_Widgets_Medium.js||-219951054',
        'FPW_Widgets_Small.js||-76095761',
    ];
    const fm = useLocal ? FileManager.local() : FileManager.iCloud();
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
                if (!useLocal) {
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
        const fm = FileManager.iCloud();
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
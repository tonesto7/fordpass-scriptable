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
// Todo: Next Release (Post 2.0.x)
// Add OTA Update Notification CHecks with Schedule.

// vehicle info page with capabilities, job number, build date, etc.
[-] use OTA info to show when an update is available or pending.
    [-] add actionable notifications for items like doors still unlocked after a certain time or low battery offer remote star... etc
    [x] allow solid color backgrounds for widgets
[-] setup up daily schedule that makes sure the doors are locked at certain time of day (maybe).
    [-] add support for other languages
    [-] add charge scheduling to dashboard menu
    [-] add support for right hand drive (driver side windows, and doors etc.)
    [-] add voice interface using siri shortcut
        [*] generate list of actionable commands based on capability
        [*] generate list of request command info available (are the doors locked, is the vehicle on, current fuel level, etc)
        [*] handle context and tense of command
    
**************/
const changelogs = {
    '2022.05.03.0': {
        added: ['Added Warranty Info to advanced info page.', 'Added ability to send me just OTA data under Advanced Info > Diagnostics > Send OTA Data.'],
        fixed: [],
        removed: [],
        updated: ['Condensed more than 3 recalls on the mainpage to a single button.', 'Updated UI elements colors and layouts to be more consistent and easier to follow.'],
        clearFlags: [],
    },
    '2022.04.28.1': {
        added: [],
        fixed: ['Fixed self updater not working and other bugs'],
        removed: [],
        updated: [],
        clearFlags: [],
    },
    '2022.04.28.0': {
        added: [
            'Builtin Updater Mechanism to Self-Update the main script without needing the widget tool (tool is still needed for install, and creating multiple instances)',
            'You can now install the latest version of the widget tool by opening the menu > Help & Info > Update to Latest WidgetTool.',
            'New Alert Notifications for the following: Low Tire Pressure, EV Charging Paused',
        ],
        fixed: ['Fixes for the Fuel level showing -- when the tank was at 100%', 'Notification menu takes you back to main menu instead of settings.'],
        removed: [],
        updated: ["Updated the Advanced Info page layout and added a new page for the vehicle's capabilities.", 'New version of the widget tool is now available for download. It adds the ability to reset a specific instance of the widget.'],
        clearFlags: [],
    },
};

const SCRIPT_VERSION = '2022.05.03.0';
const SCRIPT_ID = 0; // Edit this is you want to use more than one instance of the widget. Any value will work as long as it is a number and  unique.

//******************************************************************
//* Customize Widget Options
//******************************************************************

const widgetConfig = {
    debugMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    debugAuthMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    logVehicleData: false, // Logs the vehicle data to the console (Used to help end users easily debug their vehicle data and share with develop)
    screenShotMode: false, // Places a dummy address in the widget for anonymous screenshots.
    notifications: {
        scriptUpdate: {
            rate: 86400, // How often to allow available update notifications (in seconds - 86400 = 1 day)
            enabled: true, // Default value of notification
        },
        otaUpdate: {
            rate: Math.round(86400 * 2), // How often to allow available alert notifications (in seconds - 86400 * 0.25 = every 6 hours)
            enabled: true, // Default value of notification
        },
        deepSleep: {
            rate: Math.round(86400 * 0.25), // How often to allow available alert notifications (in seconds - 86400 * 0.25 = every 6 hours)
            enabled: true, // Default value of notification
        },
        oilLow: {
            rate: 86400, // How often to show Oil Low Notifications (in seconds - 86400 = 1 day)
            enabled: false, // Default value of notification
        },
        tireLow: {
            rate: Math.round(86400 * 0.25), // How often to show Tire Low Notifications (in seconds - 86400 * 0.25 = every 6 hours)
            enabled: true, // Default value of Notification
        },
        lvBatteryLow: {
            rate: 86400, // How often to show 12v battery notifications (in seconds - 86400 = 1 day)
            enabled: false, // Default value of notification
        },
        chargingPaused: {
            rate: 14400, // How often to show 12v battery notifications (in seconds - 14400 = 4 hours)
            enabled: false, // Default value of notification
        },
    },
    tirePressureThresholds: {
        // Tire Pressure Thresholds in PSI
        low: 27,
        critical: 20,
    },
    /**
     * Only use the options below if you are experiencing problems. Set them back to false once everything is working.
     * Otherwise the token and the pictures are newly fetched everytime the script is executed.
     */

    loadCacheOnly: false, // Use cached data for quick testing of widget and menu viewing
    saveFilesToIcloud: false, // Save files to icloud
    saveLogsToIcloud: false, // Save logs to icloud
    useBetaModules: false, // Forces the use of the modules under the beta branch of the FordPass-scriptable GitHub repo.
    writeToLog: false, // Writes to the log file.
    showModuleVersions: false, // Will display the module versions loaded in the console.
    exportVehicleImagesToIcloud: false, // This will download all 5 vehicle angle images to the Sciptable iCloud Folder as PNG files for use elsewhere.
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
        backColor: this.widgetColor === 'dark' ? '#111111' : '#FFFFFF', // Background Color'
        backColorGrad: this.widgetColor === 'dark' ? ['#141414', '#13233F'] : ['#BCBBBB', '#DDDDDD'], // Background Color Gradient}
        backColorGradDark: ['#141414', '#13233F'],
        backColorGradLight: ['#BCBBBB', '#DDDDDD'],
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
            titleFontSize: isSmallDisplay ? 12 : 14,
            fontSizeSmall: isSmallDisplay ? 9 : 10,
            fontSizeMedium: isSmallDisplay ? 11 : 13,
            fontSizeBig: isSmallDisplay ? 14 : 16,
            barGauge: {
                w: isSmallDisplay ? 275 : 295,
                h: isSmallDisplay ? 17 : 20,
                fs: isSmallDisplay ? 11 : 13,
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
        try {
            this.SCRIPT_NAME = 'Fordpass Widget';
            this.SCRIPT_ID = SCRIPT_ID;
            this.SCRIPT_VERSION = SCRIPT_VERSION;
            this.isDevMode = isDevMode;
            this.stateStore = {};
            this.moduleMap = {};
            this.localFM = FileManager.local();
            this.localDocs = this.localFM.documentsDirectory();
            this.localModuleDir = this.localFM.joinPath(this.localDocs, 'FPWModules');
            this.iCloudFM = FileManager.iCloud();
            this.iCloudDocs = this.iCloudFM.documentsDirectory();
            this.iCloudModuleDir = this.iCloudFM.joinPath(this.iCloudDocs, 'FPWModules');
            // this.logger = logger.bind(this);
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
            this.widgetSize = 'medium';
            this.widgetColor = 'system';
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
            // this.ShortcutParser = this.moduleLoader('ShortcutParser');
            this.Files = this.moduleLoader('Files');
            this.FordAPI = this.moduleLoader('FordAPIs');
            if (config.runsInApp) {
                this.changelogs = changelogs;
                this.App = this.moduleLoader('App');
                this.Menus = this.moduleLoader('Menus');
                this.AsBuilt = this.moduleLoader('AsBuilt');
            }
            this.checkForUpdates();
            // if (this.isDevMode) {
            //     this.Files.exportModuleHashes();
            // }
        } catch (e) {
            this.logError(e);
        }
    }

    /**
     * @description
     * @param  {any} moduleName
     * @return
     * @memberof Widget
     */
    moduleLoader(moduleName) {
        try {
            const fm = !this.isDevMode ? FileManager.local() : FileManager.iCloud();
            const module = importModule(fm.joinPath(fm.joinPath(fm.documentsDirectory(), 'FPWModules'), `FPW_${moduleName}.js`));
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
            this.logInfo('Widget RUN()');
            // Starts the widget load process
            // console.log(`Device Models From ViewPort: ${await this.viewPortSizes.devices}`);
            // console.log(`widgetSize(run): ${JSON.stringify(await this.viewPortSizes)}`);
            let fordData = await this.prepWidget(config.runsInWidget, widgetConfig.loadCacheOnly || config.runsInApp || config.runsFromHomeScreen);
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
                    Speech.speak(await this.ShortcutParser.parseIncomingSiriCommand(args.shortcutParameter));
                } else if (args.queryParameters && Object.keys(args.queryParameters).length > 0) {
                    console.log(JSON.stringify(args.queryParameters));
                    // this.Alerts.showAlert('Query Params', JSON.stringify(args.queryParameters));
                    await this.processQueryParams(args.queryParameters, fordData);
                } else {
                    // let s1 = await this.generateWidget('small', fordData);
                    // await s1.presentSmall();
                    // let s2 = await this.generateWidget('smallSimple', fordData);
                    // await s2.presentSmall();
                    // let m1 = await this.generateWidget('medium', fordData);
                    // await m1.presentMedium();
                    // let m2 = await this.generateWidget('mediumSimple', fordData);
                    // await m2.presentMedium();
                    // let w5 = await this.generateWidget('large', fordData);
                    // await w5.presentLarge();

                    await this.App.createMainPage();
                    // await this.App.createAdvancedInfoPage();
                    await this.Timers.stopTimer('mainTableRefresh');
                }
            } else if (config.runsWithSiri || config.runsInActionExtension) {
                // console.log('runsWithSiri: ' + config.runsWithSiri);
                // console.log('runsInActionExtension: ' + config.runsInActionExtension);
            } else {
                await this.logInfo('(generateWidget) Running in Widget (else)...');
                await this.generateWidget(runningWidgetSize, fordData);
            }
            await this.checkForVehicleAlerts(fordData);
            Script.complete();
        } catch (e) {
            await this.logError(`run() Error: ${e}`, true);
        }
    }

    async processQueryParams(params, vData) {
        if (params && params.command) {
            switch (params.command) {
                case 'show_menu':
                    await this.App.createMainPage();
                    break;
                case 'show_updater':
                    runScript('FordWidgetTool');
                    break;
                case 'lock_command':
                case 'start_command':
                case 'request_refresh':
                    await this.App.createMainPage(false, params.command);
                    break;
            }
        }
    }

    /**
     * @description Makes sure the widget is ready to run by checking for proper settings. It will prompt the user to change settings if needed.
     * @return
     * @memberof Widget
     */
    async prepWidget(isWidget = false, loadLocal = false) {
        try {
            if (widgetConfig.clearKeychainOnNextRun) {
                await this.clearSettings();
            }
            if (widgetConfig.clearFileManagerOnNextRun) {
                await this.Files.clearFileManager();
            }
            // Tries to fix the format of the VIN field (Makes sure they are capitalized)
            await this.vinFix(await this.getSettingVal('fpVin'));
            // const devCreds = await this.Files.loadLocalDevCredentials();
            // console.log(JSON.stringify(devCreds));
            let frcPrefs = false;
            let reqOk = await this.requiredPrefsOk(this.prefKeys().core);
            // console.log(`reqOk: ${reqOk}`);
            if (!reqOk) {
                let prompt = await this.Menus.requiredPrefsMenu();

                // console.log(`(prepWidget) Prefs Menu Prompt Result: ${prompt}`);
                if (prompt === undefined) {
                    await this.prepWidget(isWidget);
                } else if (prompt === false) {
                    console.log('(prepWidget) Login, VIN, or Prefs not set... | User cancelled!!!');
                    return null;
                } else {
                    frcPrefs = true;
                }
                loadLocal = false;
            }
            // console.log('(prepWidget) Checking for token...');
            const cAuth = await this.FordAPI.checkAuth('prepWidget');
            // console.log(`(prepWidget) CheckAuth Result: ${cAuth}`);

            // console.log(`(prepWidget) Checking User Prefs | Force: (${frcPrefs})`);
            const fPrefs = await this.FordAPI.queryFordPassPrefs(frcPrefs);
            // console.log(`(prepWidget) User Prefs Result: ${fPrefs}`);

            // console.log('(prepWidget) Fetching Vehicle Data...');
            console.log(`(prepWidget) Fetching Vehicle Data | Local: (${loadLocal})`);
            const vData = await this.FordAPI.fetchVehicleData(loadLocal);
            return isWidget ? await this.leanOutDataForWidget(vData) : vData;
        } catch (err) {
            this.logError(`prepWidget() Error: ${err}`, true);
            return null;
        }
    }

    async leanOutDataForWidget(vData) {
        delete vData.rawStatus;
        delete vData.messages;
        delete vData.syncInfo;
        delete vData.recallInfo;
        // delete vData.otaInfo
        return vData;
    }

    /**
     * @description Takes the widget size and vehicle data and generates the widget object
     * @param  {String} size
     * @param  {Object} data
     * @return
     * @memberof Widget
     */
    async generateWidget(params, data) {
        this.logInfo(`generateWidget() | Params: ${params}`);
        let widget = null;

        // return await this.generateTestWidget(params, data);

        try {
            const { family, style, color, output } = await this.processWidgetParams(params);
            this.logInfo(`family: ${family} | Style: ${style} | Color: ${color}`, false);
            this.widgetColor = color;
            this.widgetSize = family;
            switch (family) {
                case 'small':
                    if (style === 'simple') {
                        widget = await this.smallSimpleWidget(data, color);
                    } else {
                        widget = await this.smallDetailedWidget(data, color);
                    }
                    break;
                case 'medium':
                    if (style === 'simple') {
                        widget = await this.mediumSimpleWidget(data, color);
                    } else {
                        widget = await this.mediumDetailedWidget(data, color);
                    }
                    break;
                case 'large':
                    // if (style === 'simple') {
                    //     widget = await this.largeDetailedWidget(data, color);
                    // } else {
                    widget = await this.largeDetailedWidget(data, color);
                    // }
                    break;
                case 'extraLarge':
                    widget = await this.largeDetailedWidget(data, color);
                    break;
                default:
                    await this.logError(`generateWidget() | Widget is null!`, true);
                    return;
            }
        } catch (e) {
            this.logError(`generateWidget() Error: ${e}`);
        }
        widget.setPadding(0, 5, 0, 1);
        // widget.refreshAfterDate = new Date(Date.now() + 1000 * 300); // Update the widget every 5 minutes from last run (this is not always accurate and there can be a swing of 1-5 minutes)
        Script.setWidget(widget);
        // await this.logInfo(`Created Widget(${size})...`);
        return widget;
    }

    async generateTestWidget(params, data) {
        const { family, style, color, output } = await this.processWidgetParams(params);
        let widget = new ListWidget();
        let stk = widget.addStack();
        stk.layoutVertically();

        let txt1 = stk.addText(`Params: ${params}`);
        txt1.font = Font.systemFont(9);

        let txt2 = stk.addText(`Family: ${family}`);
        txt2.font = Font.systemFont(9);

        let txt3 = stk.addText(`Style: ${style}`);
        let txt4 = stk.addText(`Color: ${color}`);
        txt3.font = Font.systemFont(9);
        txt4.font = Font.systemFont(9);

        let txt6 = stk.addText(`Output: ${output}`);
        txt6.font = Font.systemFont(9);

        widget.addSpacer();
        let txt5 = stk.addText(`Updated: ${new Date().toLocaleString()}`);
        txt5.font = Font.systemFont(9);

        Script.setWidget(widget);
        return widget;
    }

    async processWidgetParams(params) {
        params = params.toLowerCase();
        let style = await this.getWidgetStyle();
        let color = await this.getUIColorMode();
        let family = runningWidgetSize;

        let output = `Detected | style = ${style} | color = ${color}`;
        if (params.includes('dark')) {
            color = 'dark';
            output += ` | parsed color = ${color}`;
        } else if (params.includes('light')) {
            color = 'light';
            output += ` | parsed color = ${color}`;
        }

        if (params.includes('simple')) {
            style = 'simple';
        } else if (params.includes('detailed')) {
            style = 'detailed';
        }
        if (params.includes('small')) {
            family = 'small';
        } else if (params.includes('medium')) {
            family = 'medium';
        } else if (params.includes('large')) {
            family = 'large';
        } else if (params.includes('extralarge')) {
            family = 'extraLarge';
        }
        return { family: family, style: style, color: color, output: output };
    }

    /**
     * @description
     * @return {void}@memberof Widget
     */
    async checkForUpdates() {
        const latest = await this.getLatestScriptVersion();
        this.setStateVal('LATEST_VERSION', latest);
        const isNewerVersion = this.isNewerVersion(this.SCRIPT_VERSION, latest);
        this.setStateVal('updateAvailable', isNewerVersion);
        console.log(`Script Version: ${this.SCRIPT_VERSION}`);
        console.log(`Update Available: ${this.getStateVal('updateAvailable')}`);
        console.log(`Latest Version: ${this.getStateVal('LATEST_VERSION')}`);
        if (isNewerVersion) {
            await this.Notifications.processNotification('scriptUpdate');
        }
    }

    async timeIsBetween(start, end) {
        const now = new Date();
        try {
            const startTime = new Date(start);
            const endTime = new Date(end);
            if (startTime <= endTime) {
                return startTime <= now && now <= endTime;
            } else {
                return !(endTime < now && now < startTime);
            }
        } catch (e) {
            return false;
        }
    }

    // otaDemoData() {
    //     return {
    //         displayOTAStatusReport: 'UserAllowed',
    //         ccsStatus: { ccsConnectivity: 'On', ccsVehicleData: 'On' },
    //         error: null,
    //         fuseResponse: {
    //             fuseResponseList: [{
    //                 vin: '3FMTK4SX6MME0XXXX',
    //                 oemCorrelationId: 'FLARE-PRD-SOFTWARE-FNV2-488616-531743',
    //                 deploymentId: '6f988608-3ec4-4597-9e49-c843310318a8',
    //                 deploymentCreationDate: '2022-02-28T19:35:38.896+0000',
    //                 deploymentExpirationTime: '2022-03-07T19:35:38.896+0000',
    //                 otaTriggerExpirationTime: '2022-01-29T21:12:54.875+0000',
    //                 communicationPriority: 'High',
    //                 type: 'NEW_FEATURE',
    //                 triggerType: 'SOFTWARE',
    //                 inhibitRequired: false,
    //                 additionalConsentLevel: 1,
    //                 tmcEnvironment: 'PRD',
    //                 latestStatus: { aggregateStatus: 'success', detailedStatus: 'OTAM_S1010', dateTimestamp: '2022-02-28T20:05:04.459+0000' },
    //                 packageUpdateDetails: {
    //                     releaseNotesUrl: 'https://mmota.autonomic.ai/1/bytestream/custom-release-note-1643652676921-4f36ab37-6ff2-41a2-9472-7f9bd6140b20',
    //                     updateDisplayTime: 13,
    //                     wifiRequired: false,
    //                     packagePriority: 1,
    //                     failedOnResponse: 'none',
    //                     cdnreleaseNotesUrl: 'http://vehicleupdates.files.ford.com/release-notes/custom-release-note-1643652676921-4f36ab37-6ff2-41a2-9472-7f9bd6140b20',
    //                 },
    //                 deploymentFinalConsumerAction: 'Not Set',
    //             }, ],
    //             languageText: { Language: 'English (US/NA)', LanguageCode: 'ENU', LanguageCodeMobileApp: 'en-US', Text: 'The Ford BlueCruise map in your vehicle has been updated so you can continue taking advantage of hands-free highway driving on more than 130,000 miles of prequalified sections of divided highways.' },
    //         },
    //         tappsResponse: {
    //             vin: '3FMTK4SX6MME0XXXX',
    //             status: 200,
    //             vehicleInhibitStatus: null,
    //             lifeCycleModeStatus: { lifeCycleMode: 'NORMAL', oemCorrelationId: '', vehicleDateTime: '2022-02-02T19:15:01.000Z', tappsDateTime: '2022-02-02T19:15:14.321802Z' },
    //             asuActivationSchedule: { scheduleType: '', dayOfWeekAndTime: null, activationScheduleDaysOfWeek: [], activationScheduleTimeOfDay: null, oemCorrelationId: '', vehicleDateTime: '', tappsDateTime: '' },
    //             asuSettingsStatus: null,
    //             version: '2.0.0',
    //         },
    //         updatePendingState: null,
    //         otaAlertStatus: 'YOU ARE ALL SET',
    //     };
    // }

    async checkForVehicleAlerts(vData) {
        // const otaCheckOk = true; //(await this.getShowNotificationType('otaUpdate')) && (await this.getOtaUpdCheckOk());
        // if (otaCheckOk) {
        //     let otaInfo = undefined;
        //     const data = this.otaDemoData(); //await this.FordAPI.getVehicleOtaInfo();
        //     // console.log(`OTA Info: ${JSON.stringify(data, null, 2)}`);
        //     const fuseResp = data && data.fuseResponse ? data.fuseResponse : undefined;
        //     const fuseList = fuseResp && fuseResp.fuseResponseList ? fuseResp.fuseResponseList : undefined;
        //     if (fuseList && fuseList.length > 0) {

        //         // console.log(`Fuse List: ${JSON.stringify(fuseList, null, 2)}`);
        //         for (const [i, item] of fuseList.entries()) {
        //             const statusTs = item.latestStatus && item.latestStatus.dateTimestamp ? new Date(Date.parse(item.latestStatus.dateTimestamp)) : undefined;
        //             const lastStatusUpdDt = await this.getSettingVal('fpLastOtaStatusUpdDt');

        //             // console.log(`Last Status Update Date: ${lastStatusUpdDt}`);
        //             if ((statusTs && !lastStatusUpdDt) || statusTs.getTime() > parseInt(lastStatusUpdDt)) {
        //                 console.log('OTA Status Timestamp is newer than saved timestamp | Saving Timestamp');
        //                 this.setSettingVal('fpLastOtaStatusUpdDt', statusTs.getTime().toString());
        //             }
        //             const depStartDt = item.deploymentCreationDate ? new Date(Date.parse(item.deploymentCreationDate)) : undefined;
        //             const depEndDt = item.deploymentExpirationTime ? new Date(Date.parse(item.deploymentExpirationTime)) : undefined;
        //             console.log(`depStartDt: ${depStartDt.toLocaleString()} | depEndDt: ${depEndDt.toLocaleString()}`);
        //             const isBtwnTime = await this.timeIsBetween(depStartDt, depEndDt);
        //             console.log(`isBtwnTime: ${isBtwnTime}`);
        //             const latestStatus = item.latestStatus && item.latestStatus.aggregateStatus ? item.latestStatus.aggregateStatus : undefined;
        //             if (isBtwnTime && latestStatus && latestStatus.toLowerCase() !== '') {
        //                 otaInfo = item;
        //                 break;
        //             }
        //         }
        //     }
        //     if (otaInfo) {
        //         this.setStateVal('updateAvailable', true);
        //         await this.Notifications.processNotification('otaUpdate', otaInfo);
        //     }
        // }

        if (vData) {
            if (vData.deepSleepMode !== undefined && vData.deepSleepMode) {
                await this.Notifications.processNotification('deepSleep');
            }
            // if (vData.firmwareUpdating !== undefined && vData.firmwareUpdating) {
            //     await this.Notifications.processNotification('otaUpdate');
            //     // return;
            // }
            if (vData.batteryStatus !== undefined && vData.batteryLevel === 'STATUS_LOW') {
                await this.Notifications.processNotification('lvBatteryLow');
            }
            if (vData.tirePressure && Object.keys(vData.tirePressure).length) {
                let lowTires = [];
                let tires = ['leftFront', 'leftRear', 'rightFront', 'rightRear'];
                for (let tire of tires) {
                    const val = vData.tirePressure[tire];
                    if (val && val >= 0 && val <= widgetConfig.tirePressureThresholds.low) {
                        lowTires.push(`${tire}: ${val}`);
                    }
                }
                if (lowTires.length) {
                    await this.Notifications.processNotification('lowTires', lowTires.join(', '));
                }
            }
            if (vData.capabilities.includes('EV_SMART_CHARGING') && vData.chargingStatus && vData.chargingStatus.value && vData.chargingStatus.value === 'EvsePaused') {
                await this.Notifications.processNotification('evChargingPaused');
            }

            // if (vData.oilLow) {
            //     await this.Notifications.processNotification('oilLow');
            //     return;
            // }
            return;
        } else {
            return;
        }
    }

    /**
     * @description
     * @return
     * @memberof Widget
     */
    async readLogFile(logType) {
        try {
            let fm = !widgetConfig.saveLogsToIcloud ? FileManager.local() : FileManager.iCloud();
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
            await this.logError(`readLogFile Error: ${e}`);
        }
    }

    async getChangeFlags() {
        let changes = this.FPW.changelogs[this.SCRIPT_VERSION];
        return changes && changes.clearFlags && changes.clearFlags.length ? changes.clearFlags : [];
    }

    /**
     * @description
     * @return
     * @memberof Widget
     */
    async getLogFilePath(logType) {
        try {
            const fm = !widgetConfig.saveLogsToIcloud ? FileManager.local() : FileManager.iCloud();
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
            await this.logError(`getLogFilePath Error: ${e}`);
        }
    }

    iconMap(colorMode) {
        return {
            fuelIcon: colorMode === 'dark' ? 'gas-station_dark.png' : 'gas-station_light.png', // Image for gas station
            lockStatus: colorMode === 'dark' ? 'lock_dark.png' : 'lock_light.png', // Image Used for Lock Icon
            lockIcon: colorMode === 'dark' ? 'lock_dark.png' : 'lock_light.png', // Image Used for Lock Icon
            tirePressure: colorMode === 'dark' ? 'tire_dark.png' : 'tire_light.png', // Image for tire pressure
            unlockIcon: colorMode === 'dark' ? 'unlock_dark.png' : 'unlock_light.png', // Image Used for UnLock Icon
            batteryStatus: colorMode === 'dark' ? 'battery_dark.png' : 'battery_light.png', // Image Used for Battery Icon
            doors: colorMode === 'dark' ? 'door_dark.png' : 'door_light.png', // Image Used for Door Lock Icon
            windows: colorMode === 'dark' ? 'window_dark.png' : 'window_light.png', // Image Used for Window Icon
            oil: colorMode === 'dark' ? 'oil_dark.png' : 'oil_light.png', // Image Used for Oil Icon
            ignitionStatus: colorMode === 'dark' ? 'key_dark.png' : 'key_light.png', // Image Used for Ignition Icon
            keyIcon: colorMode === 'dark' ? 'key_dark.png' : 'key_light.png', // Image Used for Key Icon
            position: colorMode === 'dark' ? 'location_dark.png' : 'location_light.png', // Image Used for Location Icon
            evBatteryStatus: colorMode === 'dark' ? 'ev_battery_dark.png' : 'ev_battery_light.png', // Image Used for EV Battery Icon
            evChargeStatus: colorMode === 'dark' ? 'ev_plug_dark.png' : 'ev_plug_light.png', // Image Used for EV Plug Icon
        };
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
            appMessages: {
                noMessages: 'No Messages',
                noRecalls: 'No Recalls Reported',
                noUnreadMessages: 'No Unread Messages',
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
                donationUrl: 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=5GMA6C3RTLXH6',
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

    getIdFromCode(code) {
        let match = code.match(/const SCRIPT_ID = [0-9]+;/);
        if (match && match[0]) {
            return match[0].split('=')[1].trim().replace(';', '');
        } else {
            return 0;
        }
    }

    async getIdFromFIle(file) {
        const fm = this.iCloudFM;
        let filePath = fm.joinPath(fm.documentsDirectory(), file + '.js');
        if (await fm.fileExists(filePath)) {
            let code = await fm.readString(filePath);
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

    async updateThisScript() {
        try {
            const fm = this.iCloudFM;
            const req = new Request('https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Fordpass%20Widget.js');
            let code = await req.loadString();
            let curId = await this.getIdFromCode(code);
            let fileName = 'Fordpass Widget';
            if (curId && curId > 0) {
                code = await this.updateIdInCode(code, curId);
                fileName += `${fileName} ${curId}`;
            }
            const hash = Array.from(code).reduce((accumulator, currentChar) => (accumulator << 5) - accumulator + currentChar.charCodeAt(0), 0);

            const codeToStore = Data.fromString(`// Variables used by Scriptable.\n// These must be at the very top of the file. Do not edit.\n// icon-color: blue; icon-glyph: magic;\n// This script was downloaded using FordWidgetTool.\nhash: ${hash};\n\n${code}`);
            const filePath = fm.joinPath(fm.documentsDirectory(), fileName + '.js');
            await fm.write(filePath, codeToStore);
            console.log('Updated Fordpass Widget...');
            return true;
        } catch (e) {
            console.error('updateThisScript error: ' + e);
            return false;
        }
    }

    async downloadLatestWidgetTool() {
        const fm = this.iCloudFM;
        const filePath = fm.joinPath(fm.documentsDirectory(), 'FordWidgetTool.js');
        const req = new Request('https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/docs/FordWidgetTool.js');
        const code = await req.loadString();
        const codeToStore = Data.fromString(`// Variables used by Scriptable.\n// These must be at the very top of the file. Do not edit.\n// icon-color: blue; icon-glyph: magic;\n${code}`);
        await fm.write(filePath, codeToStore);
        return true;
    }

    runScript(name, params = {}) {
        if (name === undefined) {
            name = Script.name();
        }
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
        req.timeoutInterval = 15;
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
            await this.logError(`getReleaseNotes Error: Could Not Load Release Notes. ${e}`);
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
            await this.logError(`getLatestScriptVersion Error: Could Not Load Version File | ${e}`, true);
        }
    }

    async getLatestModuleHashes() {
        let req = new Request(`https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/module_hashes.json`);
        req.headers = {
            'Content-Type': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
        };
        req.method = 'GET';
        req.timeoutInterval = 10;
        try {
            const h = await req.loadJSON();
            return h && h.hashes ? h.hashes : undefined;
        } catch (e) {
            await this.logError(`getLatestModuleHashes Error: Could Not Load Hash File | ${e}`, true);
        }
    }

    /**
     * @description
     * @param  {any} data
     * @param  {any} params
     * @param  {boolean} [attachJson=false]
     * @return {void}@memberof Widget
     */
    async createDataEmail(data, params, attachJson = false) {
        try {
            let email = new Mail();
            const vehType = data.info && data.info.vehicleType ? data.info.vehicleType : undefined;
            const vehVin = data.info && data.info.vin ? data.info.vin : undefined;
            email.subject = `${vehType || 'FordPass'} ${params.title}`;
            email.toRecipients = [this.textMap().about.email]; // This is my anonymous email address provided by Apple,
            email.body = attachJson ? `${params.title} is in attached file` : JSON.stringify(data, null, 4);
            email.isBodyHTML = true;
            let fm = FileManager.local();
            let dir = fm.documentsDirectory();
            let path = fm.joinPath(dir, vehType ? `${vehType.replace(/\s/g, '_')}${vehVin ? '_' + vehVin : params.fileNamePost}.json` : params.fileName);
            if (attachJson) {
                // Creates temporary JSON file and attaches it to the email
                if (await fm.fileExists(path)) {
                    await fm.remove(path); //removes existing file if it exists
                }
                await fm.writeString(path, JSON.stringify(data));
                email.addFileAttachment(path);
            }
            await email.send();
            await fm.remove(path);
        } catch (e) {
            await this.logError(`createDataEmail Error: Could Not Create Email | ${e}`, true);
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
                email.addFileAttachment(appLogs);
            }
            let widgetLogs = await this.getLogFilePath('widget');
            if (widgetLogs) {
                email.addFileAttachment(widgetLogs);
            }
            await email.send();
        } catch (e) {
            await this.logError(`createLogEmail Error: Could Not Send Log Email. ${e}`, true);
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

    decamelize(str, separator) {
        separator = typeof separator === 'undefined' ? '_' : separator;

        return str.replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2').replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2');
        // .toLowerCase();
    }

    valueChk(value, min = undefined, max = undefined) {
        // console.log(`valueChk(${value}, ${min}, ${max})`);
        if (!isNaN(value)) {
            const val = parseFloat(value);
            if (min !== undefined && max !== undefined) {
                // console.log(`valueChk: ${val} is between ${min} and ${max} | ${val >= min && val <= max}`);
                return val >= min && val <= max;
            } else {
                return true;
            }
        } else {
            return false;
        }
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
                    // await this.Alerts.showAlert('VIN Validation Error', msgs.join('\n'));
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
     * @return
     * @memberof Widget
     */
    async getStorageLocation() {
        return (await this.getSettingVal('fpStorageLocation')) || 'iCloud';
    }

    /**
     * @description
     * @param  {any} value
     * @return {void}@memberof Widget
     */
    async moveStorageLocation() {
        const newLocation = (await this.getStorageLocation()) === 'local' ? 'iCloud' : 'local';
        await this.setSettingVal('fpStorageLocation', newLocation);
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
            await this.logError(`getSettingVal(${key}) Error: ${e}`, true);
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
            return true;
        }
        return false;
    }

    async getUIColorMode(frcMode = undefined) {
        try {
            const modeSetting = await this.getSettingVal('fpUIColorMode');
            const mode = frcMode || modeSetting;
            // console.log(`getUIColorMode(${mode})`);
            switch (mode) {
                case 'dark':
                case 'light':
                    return mode;
                default:
                    return this.darkMode ? 'dark' : 'light';
            }
        } catch (e) {
            await this.logError(`getUIColorMode() Error: ${e}`, true);
            return this.darkMode ? 'dark' : 'light';
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

    async getNotificationTypeKeys(type) {
        let sKey;
        let dtKey;
        switch (type) {
            case 'scriptUpdate':
                sKey = 'fpShowUpdateNotifications';
                dtKey = 'fpLastUpdateNotificationDt';
                break;
            case 'otaUpdate':
                sKey = 'fpShowOtaNotifications';
                dtKey = 'fpLastOtaUpdNotificationDt';
                break;
            case 'deepSleep':
                sKey = 'fpShowSleepNotifications';
                dtKey = 'fpLastDeepSleepNotificationDt';
                break;
            case 'lvBatteryLow':
                sKey = 'fpShowLvbBattLowNotifications';
                dtKey = 'fpLastLvbBattLowNotificationDt';
                break;
            case 'oilLow':
                sKey = 'fpShowOilLowNotifications';
                dtKey = 'fpLastOilLowNotificationDt';
                break;
            case 'tireLow':
                sKey = 'fpShowTireLowNotifications';
                dtKey = 'fpLastTireLowNotificationDt';
                break;
            case 'evChargingPaused':
                sKey = 'fpShowEvChargingPausedNotifications';
                dtKey = 'fpLastEvChargingPausedNotificationDt';
                break;
        }
        return { sKey, dtKey };
    }

    async getShowNotificationType(type) {
        try {
            const { sKey, dtKey } = await this.getNotificationTypeKeys(type);
            const def = this.widgetConfig.notifications[type] ? this.widgetConfig.notifications[type].enabled : false;
            const cur = await this.getSettingVal(sKey);
            if (cur === null || cur === undefined) {
                return def;
            }
            return cur === 'true';
        } catch (e) {
            this.logError(`getShowNotificationType(${type}) Error: ${e}`, true);
            return false;
        }
    }

    async setShowNotificationType(type, show) {
        const { sKey, dtKey } = await this.getNotificationTypeKeys(type);
        return this.setSettingVal(sKey, show.toString());
    }

    async toggleNotificationType(type) {
        await this.setShowNotificationType(type, (await this.getShowNotificationType(type)) === false ? true : false);
    }

    async storeLastNotificationDtByType(type) {
        const { sKey, dtKey } = await this.getNotificationTypeKeys(type);
        if (dtKey !== undefined) {
            this.setSettingVal(dtKey, Date.now().toString());
        }
    }

    async getOtaUpdCheckOk() {
        const type = 'otaUpdate';
        try {
            const rateSec = this.widgetConfig.notifications[type].rate || 86400 * 2;
            const lastNotif = await this.getSettingVal('fpLastOtaUpdCheckDt');
            if (lastNotif === null || lastNotif === undefined) {
                return true;
            }
            const lastDt = parseInt(lastNotif);
            const nowDt = Date.now();
            const elap = Math.round((nowDt - lastDt) / 1000);
            return elap > rateSec;
        } catch (e) {
            this.logError(`getOtaUpdCheckOk(${type}) Error: ${e}`, true);
            return false;
        }
    }

    async getLastNotifElapsedOkByType(type) {
        try {
            const { sKey, dtKey } = await this.getNotificationTypeKeys(type);
            const rateSec = this.widgetConfig.notifications[type].rate || 86400;
            const lastNotif = await this.getSettingVal(dtKey);
            if (lastNotif === null || lastNotif === undefined) {
                return true;
            }
            const lastDt = parseInt(lastNotif);
            const nowDt = Date.now();
            const elap = Math.round((nowDt - lastDt) / 1000);
            return elap > rateSec;
        } catch (e) {
            this.logError(`getLastNotifElapsedOkByType(${type}) Error: ${e}`, true);
            return false;
        }
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
            'fpCity',
            'fpState',
            'fpZipCode',
            'fpPressureUnits',
            'fpDistanceUnits',
            'fpSpeedUnits',
            'fpScriptVersion',
            'fpWidgetBackground',
            'fpWidgetStyle',
            'fpUIColorMode',
            'fpShowUpdateNotifications',
            'fpShowOtaNotifications',
            'fpShowSleepNotifications',
            'fpShowAlertNotifications',
            'fpShowOilLowNotifications',
            'fpLastUpdateNotificationDt',
            'fpShowLvbBattLowNotifications',
            'fpLastDeepSleepNotificationDt',
            'fpShowTireLowNotifications',
            'fpLastTireLowNotificationDt',
            'fpLastFirmUpdNotificationDt',
            'fpLastOtaUpdNotificationDt',
            'fpLastOtaUpdCheckDt',
            'fpLastOilLowNotificationDt',
            'fpLastLvbBattLowNotificationDt',
            'fpShowEvChargingPausedNotifications',
            'fpLastEvChargingPausedNotificationDt',
            'fpLastOtaStatusUpdDt',
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

    async smallSimpleWidget(vData, colorMode = undefined) {
        // Defines the Widget Object
        const widget = new ListWidget();
        this.setWidgetBackground(widget, colorMode);
        try {
            const widgetSizes = await this.getViewPortSizes(this.widgetSize);
            console.log(`widgetSizes: ${JSON.stringify(widgetSizes)}`);
            const { width, height } = widgetSizes;
            let paddingTop = Math.round(height * 0.08);
            let paddingLeft = Math.round(width * 0.04);
            // let paddingLeft = 8;
            // console.log(`padding | Left: ${paddingLeft}`);
            //************************
            //* TOP LEFT BOX CONTAINER
            //************************

            const wContent = await this.createColumn(widget, { '*setPadding': [paddingTop, paddingLeft, paddingTop, paddingLeft] });
            const topBox = await this.createRow(wContent, { '*setPadding': [0, paddingLeft, 0, 0] });

            // ---Top left part---
            const topLeftContainer = await this.createRow(topBox, {});

            // Vehicle Title
            const vehicleNameContainer = await this.createRow(topLeftContainer, { '*setPadding': [paddingTop, 0, 0, 0] });

            let vehicleNameStr = vData.info.vehicleType || '';
            // get dynamic size
            let vehicleNameSize = Math.round(width * 0.12);
            if (vehicleNameStr.length >= 10) {
                vehicleNameSize = vehicleNameSize - Math.round(vehicleNameStr.length / 4);
            }
            await this.createText(vehicleNameContainer, vehicleNameStr, { font: Font.semiboldSystemFont(vehicleNameSize), textColor: this.colorMap.text[colorMode], '*leftAlignText': null });
            // ---The top left part is finished---
            topBox.addSpacer();

            //***********************************
            //* MIDDLE ROW CONTAINER
            //***********************************
            const carInfoContainer = await this.createColumn(wContent, { '*setPadding': [0, paddingLeft, 0, 0] });

            // ****************************************
            // * LEFT BODY COLUMN CONTAINER
            // ****************************************

            // Range and Odometer
            const miContainer = await this.createRow(carInfoContainer, { '*bottomAlignContent': null });

            try {
                const { isEV, lvlValue, dteValue, odometerVal, dtePostfix, distanceMultiplier, distanceUnit, dteInfo } = await this.getRangeData(vData);
                const fs = this.isSmallDisplay ? 14 : 16;

                // DTE Text
                await this.createText(miContainer, `${dteInfo}`, { font: Font.systemFont(fs), textColor: this.colorMap.text[colorMode], textOpacity: 0.7 });

                let levelContainer = await this.createRow(miContainer, {});
                // DTE + Level Separator
                await this.createText(levelContainer, ' / ', { font: Font.systemFont(fs - 2), textColor: this.colorMap.text[colorMode], textOpacity: 0.6 });
                // Level Text
                await this.createText(levelContainer, this.valueChk(lvlValue, 0, 100) ? `${lvlValue}%` : '--', { font: Font.systemFont(fs), textColor: this.colorMap.text[colorMode], textOpacity: 0.6 });

                // Odometer Text
                let mileageContainer = await this.createRow(carInfoContainer, { '*bottomAlignContent': null });
                await this.createText(mileageContainer, `Odometer: ${odometerVal}`, { font: Font.systemFont(9), textColor: this.colorMap.text[colorMode], textOpacity: 0.7 });
            } catch (e) {
                console.error(e.message);
                miContainer.addText('Error Getting Range Data');
            }

            // Car Status box
            const carStatusContainer = await this.createColumn(carInfoContainer, { '*setPadding': [4, 0, 4, 0] });
            const carStatusBox = await this.createRow(carStatusContainer, { '*setPadding': [3, 3, 3, 3], '*centerAlignContent': null, cornerRadius: 4, backgroundColor: Color.dynamic(new Color('#f5f5f8', 0.45), new Color('#fff', 0.2)), size: new Size(Math.round(width * 0.55), Math.round(height * 0.12)) });
            const doorsLocked = vData.lockStatus === 'LOCKED';
            const carStatusRow = await this.createRow(carStatusBox, { '*setPadding': [0, paddingLeft, 0, 0] });
            try {
                carStatusRow.addSpacer();
                await this.createText(carStatusRow, `${doorsLocked ? 'Locked' : 'Unlocked'}`, {
                    '*centerAlignText': null,
                    font: doorsLocked ? Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium) : Font.heavySystemFont(this.sizeMap[this.widgetSize].fontSizeMedium),
                    textColor: doorsLocked ? this.colorMap.text[colorMode] : this.colorMap.openColor,
                    textOpacity: 0.7,
                    '*centerAlignText': null,
                });
                carStatusRow.addSpacer();
            } catch (e) {
                console.error(e.message);
                carStatusRow.addText(`Lock Status Failed`);
            }
            carStatusBox.addSpacer();
            // carStatusContainer.addSpacer();

            // Vehicle Image Container
            const carImageContainer = await this.createRow(wContent, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            carImageContainer.addSpacer();
            let canvasWidth = Math.round(width * 0.85);
            // let newH = this.isSmallDisplay ? 0.27 : 0.32;
            let canvasHeight = Math.round(width * 0.32);
            await this.createImage(carImageContainer, await this.Files.getVehicleImage(vData.info.modelYear, false, 1), { imageSize: new Size(canvasWidth, canvasHeight), resizable: true, '*rightAlignImage': null });
            carImageContainer.addSpacer();

            //**************************
            //* BOTTOM ROW CONTAINER
            //**************************
            // Displays the Last Vehicle Checkin Time Elapsed...
            let timestampRow = await this.createRow(wContent, { '*setPadding': [3, paddingLeft, 3, 0] });
            await this.createTimeStampElement(timestampRow, vData, 'center', 8);
            wContent.addSpacer();
            // ***************** BOTTOM ROW CONTAINER END *****************
        } catch (e) {
            await this.logError(`smallSimpleWidget Error: ${e}`, true);
        }
        return widget;
    }

    async smallDetailedWidget(vData, colorMode = undefined) {
        // Defines the Widget Object
        const widget = new ListWidget();
        this.setWidgetBackground(widget, colorMode);
        try {
            const widgetSizes = await this.getViewPortSizes(this.widgetSize);
            console.log(`widgetSizes: ${JSON.stringify(widgetSizes)}`);
            const { width, height } = widgetSizes;
            let paddingTop = Math.round(height * 0.08);
            let paddingLeft = Math.round(width * 0.04);
            console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            // vData.deepSleepMode = true;
            // vData.firmwareUpdating = true;
            const hasStatusMsg = await this.hasStatusMsg(vData);

            const wContent = await this.createColumn(widget, { '*setPadding': [paddingTop, paddingLeft, paddingTop, 0] });

            let bodyContainer = await this.createRow(wContent, { '*setPadding': [0, 0, 0, 0] });

            //*****************
            //* First column
            //*****************
            let mainCol1 = await this.createColumn(bodyContainer, { '*setPadding': [paddingTop, paddingLeft, 0, 0], size: new Size(Math.round(width * 0.5), Math.round(height * 0.85)) });

            // Vehicle Logo
            await this.createVehicleImageElement(mainCol1, vData, this.sizeMap[this.widgetSize].logoSize.w, this.sizeMap[this.widgetSize].logoSize.h);

            // Creates the Vehicle Logo, Odometer, Fuel/Battery and Distance Info Elements
            await this.createFuelRangeElements(mainCol1, vData);

            // Creates Low-Voltage Battery Voltage Elements
            await this.createBatteryElement(mainCol1, vData, 'left');

            // Creates Oil Life Elements
            if (!vData.evVehicle) {
                await this.createOilElement(mainCol1, vData, 'left');
            } else {
                // Creates EV Plug Elements
                await this.createEvChargeElement(mainCol1, vData, 'left');
            }
            mainCol1.addSpacer();
            // bodyContainer.addSpacer();

            //************************
            //* Second column
            //************************
            let mainCol2 = await this.createColumn(bodyContainer, { '*setPadding': [paddingTop, 0, 0, 0], size: new Size(Math.round(width * 0.5), Math.round(height * 0.85)) });

            // Creates the Lock Status Elements
            await this.createLockStatusElement(mainCol2, vData, 'left');

            // Creates the Ignition Status Elements
            await this.createIgnitionStatusElement(mainCol2, vData, 'left');

            // Creates the Door Status Elements
            await this.createDoorElement(mainCol2, vData, 'left');

            // Creates the Door Status Elements
            await this.createWindowElement(mainCol2, vData, 'left');

            mainCol2.addSpacer();

            // bodyContainer.addSpacer();

            //**********************
            //* Refresh and error
            //*********************
            if (hasStatusMsg) {
                let statusRow = await this.createRow(wContent, { '*layoutHorizontally': null, '*setPadding': [0, paddingLeft, 0, 0] });
                await this.createStatusElement(statusRow, vData, 1);
            } else {
                wContent.addSpacer();
            }
            // Displays the Last Vehicle Checkin Time Elapsed...
            let timestampRow = await this.createRow(wContent, { '*setPadding': [3, 0, 0, 0] });
            await this.createTimeStampElement(timestampRow, vData, 'center', 8);
        } catch (e) {
            await this.logError(`smallDetailedWidget Error: ${e}`, true);
        }
        return widget;
    }

    async mediumSimpleWidget(vData, colorMode = undefined) {
        // console.log(`mediumSimpleWidget called...`);
        // Defines the Widget Object
        const widget = new ListWidget();
        this.setWidgetBackground(widget, colorMode);
        try {
            const widgetSizes = await this.getViewPortSizes(this.widgetSize);
            console.log(`widgetSizes: ${JSON.stringify(widgetSizes)}`);
            const { width, height } = widgetSizes;
            let paddingTop = Math.round(height * 0.04);
            let paddingLeft = Math.round(width * 0.03);
            // console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            // widget.setPadding(paddingTop, paddingLeft, 0, 0);
            const wContent = await this.createColumn(widget, { '*setPadding': [0, 0, 0, 0] });
            //************************
            //* TOP ROW CONTAINER
            //************************

            let bodyContainer = await this.createRow(wContent, { '*setPadding': [0, 0, 0, 0], '*topAlignContent': null });
            // ****************************************
            // * LEFT BODY COLUMN CONTAINER
            // ****************************************
            let leftContainer = await this.createColumn(bodyContainer, { '*setPadding': [0, 0, 0, 0] });
            leftContainer.addSpacer();
            // Vehicle Title
            const vehicleNameContainer = await this.createRow(leftContainer, { '*setPadding': [paddingTop, paddingLeft, 0, 0] });
            let vehicleNameStr = vData.info.vehicleType || ''; //'2021 Mustang Mach-E';

            let vehicleNameSize = 24;
            if (vehicleNameStr.length >= 10) {
                vehicleNameSize = vehicleNameSize - Math.round(vehicleNameStr.length / 4);
            }
            // console.log(`vehicleNameSize: ${vehicleNameSize}`);
            await this.createText(vehicleNameContainer, vehicleNameStr, { font: Font.semiboldSystemFont(vehicleNameSize), textColor: this.colorMap.text[colorMode], '*leftAlignText': null, minimumScaleFactor: 0.4, lineLimit: 1 });
            vehicleNameContainer.addSpacer();
            // Range and Odometer
            let miContainer = await this.createRow(leftContainer, { '*setPadding': [0, paddingLeft, 0, 0], '*bottomAlignContent': null });

            try {
                const { isEV, lvlValue, dteValue, odometerVal, dtePostfix, distanceMultiplier, distanceUnit, dteInfo } = await this.getRangeData(vData);
                const fs = this.isSmallDisplay ? 14 : 16;
                // DTE Text
                await this.createText(miContainer, `${dteInfo}`, { font: Font.systemFont(fs), textColor: this.colorMap.text[colorMode], textOpacity: 0.7 });

                let levelContainer = await this.createRow(miContainer, {});
                // DTE + Level Separator
                await this.createText(levelContainer, ' / ', { font: Font.systemFont(fs - 2), textColor: this.colorMap.text[colorMode], textOpacity: 0.6 });
                // Level Text
                await this.createText(levelContainer, this.valueChk(lvlValue, 0, 100) ? `${lvlValue}%` : '--', { font: Font.systemFont(fs), textColor: this.colorMap.text[colorMode], textOpacity: 0.6 });

                // leftContainer.addSpacer();
                let mileageContainer = await this.createRow(leftContainer, { '*setPadding': [0, paddingLeft, 0, 0] });

                // Odometer Text
                await this.createText(mileageContainer, `Odometer: ${odometerVal}`, { font: Font.systemFont(10), textColor: this.colorMap.text[colorMode], textOpacity: 0.7 });
            } catch (e) {
                console.error(e.message);
                miContainer.addText('Error Getting Range Data');
            }

            // Vehicle Location Row
            const locationContainer = await this.createRow(leftContainer, { '*setPadding': [5, paddingLeft, 0, 0], '*topAlignContent': null });
            let url = (await this.getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vData.latitude},${vData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vData.info.nickName)}&ll=${vData.latitude},${vData.longitude}`;
            let locationStr = vData.position ? (this.widgetConfig.screenShotMode ? '1234 Someplace Drive, Somewhere' : `${vData.position}`) : this.textMap().errorMessages.noData;
            await this.createText(locationContainer, locationStr, { url: url, font: Font.body(), textColor: this.colorMap.text[colorMode], lineLimit: 2, minimumScaleFactor: 0.6, textOpacity: 0.7 });

            leftContainer.addSpacer();

            //***********************************
            //* RIGHT BODY CONTAINER
            //***********************************

            const rightContainer = await this.createColumn(bodyContainer, { '*setPadding': [0, 0, 0, 0] });
            rightContainer.addSpacer();

            // Vehicle Image Container
            let imgWidth = Math.round(width * 0.5);
            let imgHeight = Math.round(height * 0.4);
            const carImageContainer = await this.createRow(rightContainer, { '*setPadding': [paddingTop, 0, 0, 0], '*centerAlignContent': null });
            carImageContainer.addSpacer();
            await this.createImage(carImageContainer, await this.Files.getVehicleImage(vData.info.modelYear, false, 1), { imageSize: new Size(imgWidth, imgHeight), '*rightAlignImage': null, resizable: true });
            carImageContainer.addSpacer();
            const doorWindStatusContainer = await this.createRow(rightContainer, { '*setPadding': [0, 0, 0, 0] });
            doorWindStatusContainer.addSpacer();
            await this.createDoorWindowText(doorWindStatusContainer, vData);
            doorWindStatusContainer.addSpacer();

            rightContainer.addSpacer();

            //*****************************
            //* COMMAND BUTTONS CONTAINER
            //*****************************
            const controlsContainer = await this.createRow(wContent, { '*setPadding': [7, 0, 5, 0] });
            controlsContainer.addSpacer();
            // vData.deepSleepMode = true;
            // vData.firmwareUpdating = true;
            await this.createWidgetButtonRow(controlsContainer, vData, 0, width, 35, 24);
            controlsContainer.addSpacer();

            //**************************
            //* BOTTOM ROW CONTAINER
            //**************************
            // if (hasStatusMsg) {
            //     let statusRow = await this.createRow(wContent, { '*setPadding': [3, 0, 3, 0], '*centerAlignContent': null, size: new Size(Math.round(width * 1), Math.round(height * 0.1)) });
            //     await this.createStatusElement(statusRow, vData, 2, this.widgetSize);
            //     statusRow.addSpacer();
            // }

            // Displays the Last Vehicle Checkin Time Elapsed...
            let timestampRow = await this.createRow(wContent, { '*setPadding': [3, 0, 5, 0], '*bottomAlignContent': null });
            await this.createTimeStampElement(timestampRow, vData, 'center', 8);

            // ***************** RIGHT BODY CONTAINER END *****************
        } catch (e) {
            await this.logError(`mediumSimpleWidget Error: ${e}`, true);
        }
        return widget;
    }

    async mediumDetailedWidget(vData, colorMode = undefined) {
        // Defines the Widget Object
        const widget = new ListWidget();
        this.setWidgetBackground(widget, colorMode);
        try {
            const widgetSizes = await this.getViewPortSizes(this.widgetSize);
            console.log(`widgetSizes: ${JSON.stringify(widgetSizes)}`);
            const { width, height } = widgetSizes;
            let paddingTop = Math.round(height * 0.08);
            let paddingLeft = Math.round(width * 0.04);
            // console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            // vData.deepSleepMode = true;
            // vData.firmwareUpdating = true;
            const hasStatusMsg = await this.hasStatusMsg(vData);
            //_______________________________
            //|         |         |         |
            //|         |         |         |
            //|         |         |         |
            //|_________|_________|_________|
            //|                             |
            //-------------------------------

            const wContent = await this.createColumn(widget, { '*setPadding': [paddingTop, paddingLeft, paddingTop, paddingLeft] });

            let bodyContainer = await this.createRow(wContent, { '*setPadding': [paddingTop, 0, 0, 0] });
            //*****************
            //* First column
            //*****************
            let mainCol1 = await this.createColumn(bodyContainer, {});

            // Vehicle Image Container
            let imgWidth = Math.round(width * 0.33);
            let imgHeight = Math.round(height * 0.3);
            await this.createVehicleImageElement(mainCol1, vData, this.sizeMap[this.widgetSize].logoSize.w, this.sizeMap[this.widgetSize].logoSize.h + 10);

            // Creates the Odometer, Fuel/Battery and Distance Info Elements
            await this.createFuelRangeElements(mainCol1, vData);

            // Creates Low-Voltage Battery Voltage Elements
            await this.createBatteryElement(mainCol1, vData, 'left');

            // Creates Oil Life Elements
            if (!vData.evVehicle) {
                await this.createOilElement(mainCol1, vData, 'left');
            } else {
                // Creates EV Plug Elements
                await this.createEvChargeElement(mainCol1, vData, 'left');
            }
            mainCol1.addSpacer();

            //************************
            //* Second column
            //************************
            let mainCol2 = await this.createColumn(bodyContainer, {});
            // mainCol2.addSpacer();

            // Creates the Lock Status Elements
            await this.createLockStatusElement(mainCol2, vData, 'center', true);

            // Creates the Door Status Elements
            await this.createDoorElement(mainCol2, vData, 'center', true);

            // Create Tire Pressure Elements
            await this.createTireElement(mainCol2, vData, 'center');
            mainCol2.addSpacer();

            //****************
            //* Third column
            //****************
            let mainCol3 = await this.createColumn(bodyContainer, {});
            // mainCol3.addSpacer();

            // Creates the Ignition Status Elements
            await this.createIgnitionStatusElement(mainCol3, vData, 'center', true);

            // Creates the Door Status Elements
            await this.createWindowElement(mainCol3, vData, 'center', true);

            // Creates the Vehicle Location Element
            await this.createPositionElement(mainCol3, vData, 'center');
            mainCol3.addSpacer();

            //**********************
            //* Refresh and error
            //*********************

            if (hasStatusMsg) {
                let statusRow = await this.createRow(wContent, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
                await this.createStatusElement(statusRow, vData, 2);
                statusRow.addSpacer(); // Pushes Status Message to the left
            } else if (!this.isSmallDisplay) {
                wContent.addSpacer();
            }

            // Displays the Last Vehicle Checkin Time Elapsed...
            const timestampRow = await this.createRow(wContent, { '*setPadding': [5, 0, 0, 0] });
            await this.createTimeStampElement(timestampRow, vData, 'center', 8);
            wContent.addSpacer();
        } catch (e) {
            await this.logError(`mediumDetailedWidget Error: ${e}`, true);
        }
        return widget;
    }

    async largeDetailedWidget(vData, colorMode = undefined) {
        // Defines the Widget Object
        const widget = new ListWidget();
        this.setWidgetBackground(widget, colorMode);
        try {
            const widgetSizes = await this.getViewPortSizes(this.widgetSize);
            console.log(`widgetSizes: ${JSON.stringify(widgetSizes)}`);
            const { width, height } = widgetSizes;

            let paddingTop = 10; //Math.round(height * 0.08);
            let paddingLeft = 7; //Math.round(width * 0.06);
            console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            const wContent = await this.createColumn(widget, { '*setPadding': [paddingTop, paddingLeft, paddingTop, paddingLeft] });

            const isEV = vData.evVehicle === true;
            let dtePostfix = isEV ? 'Range' : 'to E';
            let distanceMultiplier = (await this.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
            let distanceUnit = (await this.useMetricUnits()) ? 'km' : 'mi'; // unit of length
            // vData.deepSleepMode = true;
            // vData.firmwareUpdating = true;
            const hasStatusMsg = await this.hasStatusMsg(vData);

            //*****************
            //* TOP ROW
            //*****************
            let topRowContainer = await this.createRow(wContent, {});

            //*****************
            //* TOP LEFT COLUMN
            //*****************

            let topRowLeftCol = await this.createColumn(topRowContainer, { '*bottomAlignContent': null });
            // topRowLeftCol.addSpacer();
            // Vehicle Title
            let nameContainer = await this.createRow(topRowLeftCol, { '*setPadding': [paddingTop, paddingLeft, 0, 0] });
            // nameContainer.addSpacer(); // Pushes the vehicle name to the left
            let nameStr = vData.info.vehicleType || '';

            let nameSize = 24;
            if (nameStr.length >= 10) {
                nameSize = nameSize - Math.round(nameStr.length / 4);
            }
            await this.createText(nameContainer, nameStr, { font: Font.semiboldSystemFont(nameSize), textColor: this.colorMap.text[colorMode], minimumScaleFactor: 0.9, lineLimit: 1 });
            nameContainer.addSpacer(); // Pushes the vehicle name to the left

            topRowLeftCol.addSpacer();
            const extraPadding = this.isSmallDisplay ? 0 : 15;
            const topLeftInfoCol = await this.createColumn(topRowLeftCol, { '*setPadding': [0, paddingLeft + extraPadding, 0, 0] });
            // Creates Battery Level Elements
            topLeftInfoCol.addSpacer();
            await this.createBatteryElement(topLeftInfoCol, vData, 'left');

            // Creates Oil Life Elements
            if (!vData.evVehicle) {
                await this.createOilElement(topLeftInfoCol, vData, 'left');
            } else {
                // Creates EV Plug Elements
                await this.createEvChargeElement(topLeftInfoCol, vData, 'left');
            }
            // topRowLeftCol.addSpacer();

            //*********************
            //* TOP RIGHT COLUMN
            //*********************

            let topRowRightCol = await this.createColumn(topRowContainer, { '*setPadding': [0, 0, 0, 0] });
            // topRowRightCol.addSpacer(); // Pushes Content to the middle to help center

            // Vehicle Image Container
            let imgWidth = Math.round(width * 0.4);
            let imgHeight = Math.round(height * 0.25);
            const carImageContainer = await this.createRow(topRowRightCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            // carImageContainer.addSpacer();
            await this.createImage(carImageContainer, await this.Files.getVehicleImage(vData.info.modelYear, false, 1), { resizable: true, imageSize: new Size(imgWidth, imgHeight) });
            carImageContainer.addSpacer();
            topRowRightCol.addSpacer(); // Pushes Content to the middle to help center

            //*******************************
            //* FUEL/BATTERY BAR CONTAINER
            //*******************************
            // Creates the Fuel/Battery Info Elements
            const fuelBattRow = await this.createRow(wContent, { '*setPadding': [0, 0, 0, 0] });

            // Fuel/Battery Section
            const fuelBattCol = await this.createColumn(fuelBattRow, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

            // Fuel/Battery Level BAR
            const barRow = await this.createRow(fuelBattCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
            let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;
            barRow.addSpacer();
            await this.createImage(barRow, await this.createProgressBar(lvlValue ? lvlValue : 50, vData), { '*centerAlignImage': null, imageSize: new Size(this.sizeMap[this.widgetSize].barGauge.w, this.sizeMap[this.widgetSize].barGauge.h + 3) });
            barRow.addSpacer();

            // Distance/Range to Empty
            const dteRow = await this.createRow(fuelBattCol, { '*setPadding': [0, 0, 0, 0] });
            let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.textMap().errorMessages.noData;
            dteRow.addSpacer();
            await this.createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.systemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.text[colorMode], lineLimit: 1 });
            dteRow.addSpacer();
            fuelBattRow.addSpacer();
            fuelBattCol.addSpacer();

            //*****************
            //* Row 3 Container
            //*****************
            const row3Col = await this.createColumn(wContent, { '*setPadding': [0, 0, 0, 0], '*topAlignContent': null });
            const row3Row = await this.createRow(row3Col, { '*setPadding': [0, 0, 0, 0], '*topAlignContent': null });

            row3Row.addSpacer();
            const row3LeftCol = await this.createColumn(row3Row, { '*setPadding': [0, 0, 0, 0] });
            // Creates the Lock Status Elements
            await this.createLockStatusElement(row3LeftCol, vData);
            row3LeftCol.addSpacer(); // Pushes Row 3 Left content to top
            // Creates the Door Status Elements
            await this.createDoorElement(row3LeftCol, vData);

            row3LeftCol.addSpacer(); // Pushes Row 3 Left content to top

            const row3CenterCol = await this.createColumn(row3Row, { '*setPadding': [0, 0, 0, 0] });
            row3CenterCol.addSpacer(); // Pushes Row 3 Left content to top
            // Create Tire Pressure Elements
            await this.createTireElement(row3CenterCol, vData);
            row3CenterCol.addSpacer(); // Pushes Row 3 Left content to top
            // row3CenterCol.addSpacer(); // Pushes Row 3 Left content to top

            const row3RightCol = await this.createColumn(row3Row, { '*setPadding': [0, 0, 0, 0] });
            // row3RightCol.addSpacer(); // Pushes Row 3 Right content to top
            // Creates the Ignition Status Elements
            await this.createIgnitionStatusElement(row3RightCol, vData);
            row3RightCol.addSpacer(); // Pushes Row 3 Right content to top

            // Creates the Window Status Elements
            await this.createWindowElement(row3RightCol, vData);
            row3RightCol.addSpacer(); // Pushes Row 3 Right content to top

            // row3Row.addSpacer();
            row3Col.addSpacer(); // Pushes Row 3 content to top
            wContent.addSpacer();

            const row4Container = await this.createRow(wContent, { '*setPadding': [0, 0, 0, 0] });
            const row4CenterCol = await this.createColumn(row4Container, { '*setPadding': [0, 0, 0, 0] });
            // Creates the Vehicle Location Element
            await this.createPositionElement(row4CenterCol, vData, 'center');

            wContent.addSpacer(); // Pushes all content to the top
            // widget.addSpacer(); // Pushes all content to the top
            // //**********************
            // //* Status Row
            // //*********************

            if (hasStatusMsg) {
                let statusRow = await this.createRow(wContent, { '*setPadding': [0, paddingLeft, 0, 0], '*bottomAlignContent': null });
                // statusRow.addSpacer();
                await this.createStatusElement(statusRow, vData, 3);
                statusRow.addSpacer();
            } else if (!this.isSmallDisplay) {
                wContent.addSpacer();
            }
            // //*****************************
            // //* COMMAND BUTTONS CONTAINER
            // //*****************************
            const controlsContainer = await this.createRow(wContent, { '*setPadding': [7, 0, 5, 0] });
            controlsContainer.addSpacer();

            await this.createWidgetButtonRow(controlsContainer, vData, 0, width, 35, 28);
            controlsContainer.addSpacer();

            // Displays the Last Vehicle Checkin Time Elapsed...
            let timestampRow = await this.createRow(wContent, { '*setPadding': [3, 0, 3, 0] });
            await this.createTimeStampElement(timestampRow, vData, 'center', 8);
        } catch (e) {
            await this.logError(`largeDetailedWidget Error: ${e}`, true);
        }
        return widget;
    }

    async createDoorWindowText(srcElem, vData) {
        try {
            const styles = {
                open: { font: Font.semiboldSystemFont(10), textColor: this.colorMap.openColor, lineLimit: 2, minimumScaleFactor: 0.9 },
                closed: { font: Font.systemFont(10), textColor: this.colorMap.text[this.widgetColor], textOpacity: 0.7, lineLimit: 2, minimumScaleFactor: 0.9 },
            };
            const statusCol = await this.createColumn(srcElem, { '*setPadding': [0, 0, 0, 0] });
            let doorsOpen = await this.getOpenItems('createDoorWindowText', vData.statusDoors); //['LF', 'RR', 'HD'];
            let windowsOpen = await this.getOpenItems('createDoorWindowText', vData.statusWindows);

            console.log(`doorsOpen: ${doorsOpen.join(', ')}`);
            console.log(`windowsOpen: ${windowsOpen.join(', ')}`);

            if (Object.keys(doorsOpen).length > 0 || Object.keys(windowsOpen).length > 0) {
                const dRow = await this.createRow(statusCol, { '*setPadding': [0, 0, 0, 0] });
                dRow.addSpacer();
                const ds = doorsOpen.length ? `Door${doorsOpen.length > 1 ? 's' : ''}: ${doorsOpen.join(', ')} Open` : 'All Doors Closed';
                await this.createText(dRow, ds, doorsOpen.length > 0 ? styles.open : styles.closed);
                dRow.addSpacer();

                const wRow = await this.createRow(statusCol, { '*setPadding': [0, 0, 0, 0] });
                wRow.addSpacer();
                const ws = windowsOpen.length ? `Window${windowsOpen.length > 1 ? 's' : ''}: ${windowsOpen.join(', ')} Open` : 'All Windows Closed';
                await this.createText(wRow, ws, windowsOpen.length > 0 ? styles.open : styles.closed);
                wRow.addSpacer();
            } else {
                const os = 'Doors & Windows Closed';
                const sRow = await this.createRow(statusCol, { '*setPadding': [0, 0, 0, 0] });
                sRow.addSpacer();
                await this.createText(sRow, os, styles.closed);
                sRow.addSpacer();
            }
        } catch (err) {
            await this.logError(`createDoorWindowText(medium) ${err}`, true);
        }
        return srcElem;
    }

    async createFuelRangeElements(srcElem, vData) {
        try {
            const isEV = vData.evVehicle === true;
            let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
            let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;
            let dtePostfix = isEV ? 'Range' : 'to E';
            let distanceMultiplier = (await this.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
            let distanceUnit = (await this.useMetricUnits()) ? 'km' : 'mi'; // unit of length
            // console.log('isEV: ' + isEV);
            // console.log(`fuelLevel: ${vData.fuelLevel}`);
            // console.log(`distanceToEmpty: ${vData.distanceToEmpty}`);
            // console.log(`evBatteryLevel: ${vData.evBatteryLevel}`);
            // console.log('evDistanceToEmpty: ' + vData.evDistanceToEmpty);
            // console.log(`lvlValue: ${lvlValue}`);
            // console.log(`dteValue: ${dteValue}`);

            // Fuel/Battery Section
            let elemCol = await this.createColumn(srcElem, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

            // Fuel/Battery Level BAR
            let barRow = await this.createRow(elemCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            await this.createImage(barRow, await this.createProgressBar(lvlValue ? lvlValue : 50, vData), { '*centerAlignImage': null, imageSize: new Size(this.sizeMap[this.widgetSize].barGauge.w, this.sizeMap[this.widgetSize].barGauge.h + 3) });

            // Distance to Empty
            let dteRow = await this.createRow(elemCol, { '*centerAlignContent': null, '*topAlignContent': null });
            let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.textMap().errorMessages.noData;
            await this.createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.regularSystemFont(this.sizeMap[this.widgetSize].fontSizeSmall), textColor: this.colorMap.text[this.widgetColor], lineLimit: 1 });
            srcElem.addSpacer(3);
        } catch (e) {
            await this.logError(`createFuelRangeElements() Error: ${e}`, true);
        }
    }

    async createBatteryElement(srcStack, vData, position = 'center') {
        try {
            const styles = {
                normal: { font: Font.systemFont(this.sizeMap[this.widgetSize].titleFontSize), textColor: this.colorMap.text[this.widgetColor], lineLimit: 1 },
                warning: { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].titleFontSize), textColor: this.colorMap.orangeColor, lineLimit: 1 },
                critical: { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].titleFontSize), textColor: this.colorMap.redColor, lineLimit: 1 },
            };
            const titleRow = await this.createRow(srcStack, { '*setPadding': [0, 0, 3, 0] });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'batteryStatus', true, this.isSmallDisplay || this.widgetSize === 'small');
            titleRow.addSpacer(3);
            let txtStyle = styles.normal;
            let value = vData.batteryLevel ? `${vData.batteryLevel}V` : 'N/A';
            // console.log(`batteryLevel: ${value}`);
            let lowBattery = vData.batteryStatus === 'STATUS_LOW' ? true : false;
            if (lowBattery) {
                txtStyle = styles.critical;
            }
            await this.createText(titleRow, value, txtStyle);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }
        } catch (e) {
            await this.logError(`createBatteryElement() Error: ${e}`, true);
        }
    }

    async createOilElement(srcStack, vData, position = 'center') {
        try {
            const styles = {
                normal: { font: Font.systemFont(this.sizeMap[this.widgetSize].titleFontSize), textColor: this.colorMap.text[this.widgetColor], lineLimit: 1 },
                warning: { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].titleFontSize), textColor: this.colorMap.orangeColor, lineLimit: 1 },
                critical: { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].titleFontSize), textColor: this.colorMap.redColor, lineLimit: 1 },
            };
            const titleRow = await this.createRow(srcStack, { '*setPadding': [0, 0, 3, 0] });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'oil', true, this.isSmallDisplay || this.widgetSize === 'small');
            titleRow.addSpacer(3);
            let txtStyle = styles.normal;
            if (vData.oilLife && vData.oilLife >= 0 && vData.oilLife <= 25) {
                txtStyle = styles.warning;
            }
            // console.log(`oilLife: ${vData.oilLife}`);
            let text = vData.oilLife ? `${vData.oilLife}%` : this.textMap().errorMessages.noData;
            await this.createText(titleRow, text, txtStyle);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }
        } catch (e) {
            await this.logError(`createOilElement() Error: ${e}`, true);
        }
    }

    async createEvChargeElement(srcStack, vData, position = 'center') {
        try {
            const txtStyle = { font: Font.systemFont(this.sizeMap[this.widgetSize].titleFontSize), textColor: this.colorMap.text[this.widgetColor], lineLimit: 1 };
            const titleRow = await this.createRow(srcStack, { '*setPadding': [0, 0, 3, 0] });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'evChargeStatus', true, this.isSmallDisplay || this.widgetSize === 'small');
            titleRow.addSpacer(2);
            let value = vData.evChargeStatus ? `${vData.evChargeStatus}` : this.textMap().errorMessages.noData;
            // console.log(`battery charge: ${value}`);
            await this.createText(titleRow, value, txtStyle);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }
        } catch (e) {
            await this.logError(`createEvChargeElement() Error: ${e}`, true);
        }
    }

    async createPositionElement(srcStack, vData, position = 'center') {
        try {
            const titleRow = await this.createRow(srcStack);
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'position', false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            const valueRow = await this.createRow(srcStack, { '*centerAlignContent': null });
            let url = (await this.getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vData.latitude},${vData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vData.info.nickName)}&ll=${vData.latitude},${vData.longitude}`;
            let value = vData.position ? (this.widgetConfig.screenShotMode ? '1234 Someplace Drive, Somewhere' : `${vData.position}`) : this.textMap().errorMessages.noData;
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            await this.createText(valueRow, value, { url: url, font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.text[this.widgetColor], lineLimit: 2, minimumScaleFactor: 0.8 });
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
        } catch (e) {
            await this.logError(`createPositionElement() Error: ${e}`, true);
        }
    }

    async createLockStatusElement(srcStack, vData, position = 'center', postSpace = false) {
        try {
            const styles = {
                unlocked: { font: Font.heavySystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 1 },
                locked: { font: Font.heavySystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 1 },
            };
            let titleRow = await this.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'lockStatus', false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            let valueRow = await this.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
            let value = vData.lockStatus ? vData.lockStatus.toLowerCase().charAt(0).toUpperCase() + vData.lockStatus.toLowerCase().slice(1) : this.textMap().errorMessages.noData;
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            await this.createText(valueRow, value, vData.lockStatus !== undefined && vData.lockStatus === 'LOCKED' ? styles.locked : styles.unlocked);
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
            if (postSpace) {
                srcStack.addSpacer();
            }
        } catch (e) {
            await this.logError(`createLockStatusElement() Error: ${e}`, true);
        }
    }

    async createIgnitionStatusElement(srcStack, vData, position = 'center', postSpace = false) {
        try {
            let remStartOn = vData.remoteStartStatus && vData.remoteStartStatus.running ? true : false;
            let status = '';
            if (remStartOn) {
                status = `Remote Start (ON)`;
            } else if (vData.ignitionStatus !== undefined) {
                status = vData.ignitionStatus.charAt(0).toUpperCase() + vData.ignitionStatus.slice(1); //vData.ignitionStatus.toUpperCase();
            } else {
                this.textMap().errorMessages.noData;
            }
            let titleRow = await this.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'ignitionStatus', false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            let valueRow = await this.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            // let txtSize = status.length >= 10 ? Math.round(this.sizeMap[this.widgetSize].fontSizeMedium * 0.75) : this.sizeMap[this.widgetSize].fontSizeMedium;
            const styles = {
                on: { font: Font.heavySystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 1, minimumScaleFactor: status.length >= 10 ? 0.7 : 1 },
                off: { font: Font.heavySystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.closedColor },
            };
            await this.createText(valueRow, status, vData.ignitionStatus !== undefined && (vData.ignitionStatus === 'On' || vData.ignitionStatus === 'Run' || remStartOn) ? styles.on : styles.off);
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
            if (postSpace) {
                srcStack.addSpacer();
            }
        } catch (e) {
            await this.logError(`createIgnitionStatusElement() Error: ${e}`, true);
        }
    }

    // ********************************
    // |.  HELPER FUNCTIONS
    // ********************************

    async createColumn(srcElem, styles = {}) {
        try {
            let col = srcElem.addStack();
            col.layoutVertically();
            if (styles && Object.keys(styles).length > 0) {
                this._mapMethodsAndCall(col, styles);
            }
            return col;
        } catch (e) {
            await this.logError(`createColumn Error: ${e}`);
        }
    }

    async createRow(srcElem, styles = {}) {
        try {
            let row = srcElem.addStack();
            row.layoutHorizontally();
            if (styles && Object.keys(styles).length > 0) {
                this._mapMethodsAndCall(row, styles);
            }
            return row;
        } catch (e) {
            await this.logError(`createRow Error: ${e}`);
            return null;
        }
    }

    async createText(srcElem, text, styles = {}) {
        let txt = srcElem.addText(text);
        if (styles && Object.keys(styles).length > 0) {
            this._mapMethodsAndCall(txt, styles);
        }
        return txt;
    }

    async createImage(srcElem, image, styles = {}) {
        let _img = srcElem.addImage(image);
        if (styles && Object.keys(styles).length > 0) {
            this._mapMethodsAndCall(_img, styles);
        }
        return _img;
    }

    async createTitle(srcElem, titleText, colon = true, hideTitleForSmall = false) {
        let titleParams = titleText.split('||');
        let icon = this.iconMap(this.widgetColor)[titleParams[0]];
        let titleStack = await this.createRow(srcElem, { '*centerAlignContent': null });
        if (icon !== undefined) {
            let imgFile = await this.Files.getImage(icon.toString());
            await this.createImage(titleStack, imgFile, { imageSize: new Size(this.sizeMap[this.widgetSize].iconSize.w, this.sizeMap[this.widgetSize].iconSize.h), resizable: true });
        }
        // console.log(`titleParams(${titleText}): ${titleParams}`);
        if (titleText && titleText.length && !hideTitleForSmall) {
            titleStack.addSpacer(2);
            let title = titleParams.length > 1 ? this.textMap(titleParams[1]).elemHeaders[titleParams[0]] : this.textMap().elemHeaders[titleParams[0]];
            await this.createText(titleStack, `${title}${colon ? ':' : ''}`, { font: Font.boldSystemFont(this.sizeMap[this.widgetSize].titleFontSize), textColor: this.colorMap.text[this.widgetColor], lineLimit: 1 });
        }
    }

    async createProgressBar(percent, vData) {
        // percent = 12;
        const isEV = vData.evVehicle === true;
        let fillLevel = percent > 100 ? 100 : percent;
        const barWidth = this.sizeMap[this.widgetSize].barGauge.w;
        const context = new DrawContext();
        context.size = new Size(barWidth, this.sizeMap[this.widgetSize].barGauge.h + 3);
        context.opaque = false;
        context.respectScreenScale = true;

        // Bar Background Gradient
        const lvlBgPath = new Path();
        lvlBgPath.addRoundedRect(new Rect(0, 0, barWidth, this.sizeMap[this.widgetSize].barGauge.h), 3, 2);
        context.addPath(lvlBgPath);
        context.setFillColor(Color.lightGray());
        context.fillPath();

        // Bar Level Background
        const lvlBarPath = new Path();
        lvlBarPath.addRoundedRect(new Rect(0, 0, (barWidth * fillLevel) / 100, this.sizeMap[this.widgetSize].barGauge.h), 3, 2);
        context.addPath(lvlBarPath);
        let barColor = isEV ? '#94ef4a' : '#619ded';
        if (percent >= 0 && percent <= 10) {
            barColor = '#FF6700';
        } else if (percent > 10 && percent <= 20) {
            barColor = '#FFCD00';
        }
        context.setFillColor(new Color(barColor));
        context.fillPath();

        let xPos = barWidth / 2 - 20;
        context.setFont(Font.mediumSystemFont(this.sizeMap[this.widgetSize].barGauge.fs));
        context.setTextColor(Color.black());

        // if (fillLevel > 75) {
        //     context.setTextColor(Color.white());
        // }
        const icon = isEV ? String.fromCodePoint('0x1F50B') : '\u26FD';
        const lvlStr = this.valueChk(percent, 0, 100) ? `${percent}%` : '--';
        context.drawTextInRect(`${icon} ${lvlStr}`, new Rect(xPos, this.sizeMap[this.widgetSize].barGauge.h / this.sizeMap[this.widgetSize].barGauge.fs, this.sizeMap[this.widgetSize].barGauge.w, this.sizeMap[this.widgetSize].barGauge.h));
        context.setTextAlignedCenter();
        return await context.getImage();
    }

    async createVehicleImageElement(srcElem, vData, width, height, angle = 4) {
        let logoRow = await this.createRow(srcElem, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        if (vData.info !== undefined && vData.info !== undefined) {
            await this.createImage(logoRow, await this.Files.getVehicleImage(vData.info.modelYear, false, angle), { imageSize: new Size(width, height), '*centerAlignImage': null, resizable: true });
            srcElem.addSpacer(3);
        }
    }

    async getRangeData(data) {
        const isEV = data.evVehicle === true;
        const dtePostfix = isEV ? 'Range' : 'to E';
        const distanceMultiplier = (await this.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
        const distanceUnit = (await this.useMetricUnits()) ? 'km' : 'mi'; // unit of length
        const dteValueRaw = !isEV ? (data.distanceToEmpty ? data.distanceToEmpty : undefined) : data.evDistanceToEmpty ? data.evDistanceToEmpty : undefined;
        return {
            isEV: isEV,
            lvlValue: !isEV ? (data.fuelLevel ? data.fuelLevel : 0) : data.evBatteryLevel ? data.evBatteryLevel : 0,
            dteValue: dteValueRaw ? Math.round(dteValueRaw * distanceMultiplier) : undefined,
            odometerVal: data.odometer ? `${Math.round(data.odometer * distanceMultiplier)} ${distanceUnit}` : this.textMap().errorMessages.noData,
            dtePostfix: dtePostfix,
            // distanceMultiplier: distanceMultiplier, // distance multiplier
            distanceUnit: distanceUnit, // unit of length
            dteInfo: dteValueRaw ? `${Math.round(dteValueRaw * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.textMap().errorMessages.noData,
        };
    }

    async createDoorElement(srcStack, vData, position = 'center', postSpace = false) {
        const styles = {
            normTxt: { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.text[this.widgetColor], lineLimit: 2 },
            open: { font: Font.heavySystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 2 },
            closed: { font: Font.heavySystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 2 },
            offset: 5,
        };

        let titleRow = await this.createRow(srcStack, { '*centerAlignContent': null });
        if (position == 'center' || position == 'right') {
            titleRow.addSpacer();
        }
        await this.createTitle(titleRow, 'doors', false);
        if (position == 'center' || position == 'left') {
            titleRow.addSpacer();
        }
        let valueRow = await this.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
        const openDoors = await this.getOpenItems('createDoorElement2', vData.statusDoors); //['LF', 'RR', 'HD'];
        let value = openDoors.length ? openDoors.join(', ') : 'All Closed';
        if (position == 'center' || position == 'right') {
            valueRow.addSpacer();
        }
        await this.createText(valueRow, value, openDoors.length > 0 ? styles.open : styles.closed);
        if (position == 'center' || position == 'left') {
            valueRow.addSpacer();
        }
        if (postSpace) {
            srcStack.addSpacer();
        }
    }

    async createWindowElement(srcStack, vData, position = 'center', postSpace = false) {
        const styles = {
            normTxt: { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.text[this.widgetColor], lineLimit: 2 },
            open: { font: Font.heavySystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 2 },
            closed: { font: Font.heavySystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 2 },
            offset: 5,
        };

        let titleRow = await this.createRow(srcStack, { '*centerAlignContent': null });
        if (position == 'center' || position == 'right') {
            titleRow.addSpacer();
        }
        await this.createTitle(titleRow, 'windows', false);
        if (position == 'center' || position == 'left') {
            titleRow.addSpacer();
        }
        let valueRow = await this.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
        const openWindows = await this.getOpenItems('createWindowElement2', vData.statusWindows); //['LF', 'RR', 'HD'];
        let value = openWindows.length ? openWindows.join(', ') : 'All Closed';
        if (position == 'center' || position == 'right') {
            valueRow.addSpacer();
        }
        await this.createText(valueRow, value, openWindows.length > 0 ? styles.open : styles.closed);
        if (position == 'center' || position == 'left') {
            valueRow.addSpacer();
        }
        if (postSpace) {
            srcStack.addSpacer();
        }
    }

    async createTireElement(srcStack, vData, position = 'center') {
        try {
            const styles = {
                normTxt: { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.text[this.widgetColor] },
            };
            let titleRow = await this.createRow(srcStack);
            let pressureUnits = await this.getSettingVal('fpPressureUnits');
            let unitTxt = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, `tirePressure||${unitTxt}`, false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            let valueRow = await this.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            // Row 1 - Tire Pressure Left Front amd Right Front
            let col1 = await this.createColumn(valueRow, { '*setPadding': [0, 0, 0, 0] });
            let col1row1 = await this.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col1row1, vData.tirePressure.leftFront, this.getTirePressureStyle(vData.tirePressure.leftFront, unitTxt));
            let col2 = await this.createColumn(valueRow, { '*setPadding': [0, 3, 0, 3] });
            let col2row1 = await this.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col2row1, '|', styles.normTxt);
            let col3 = await this.createColumn(valueRow, { '*setPadding': [0, 0, 0, 0] });
            let col3row1 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col3row1, vData.tirePressure.rightFront, this.getTirePressureStyle(vData.tirePressure.rightFront, unitTxt));

            // Row 2 - Tire Pressure Left Rear amd Right Rear
            let col1row2 = await this.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col1row2, vData.tirePressure.leftRear, this.getTirePressureStyle(vData.tirePressure.leftRear, unitTxt));
            let col2row2 = await this.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col2row2, '|', styles.normTxt);
            let col3row2 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col3row2, vData.tirePressure.rightRear, this.getTirePressureStyle(vData.tirePressure.rightRear, unitTxt));

            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
        } catch (e) {
            await this.logError(`createTireElement() Error: ${e}`, true);
        }
    }

    /**
     * @description
     * @param  {any} pressure
     * @param  {any} unit
     * @return
     * @memberof Widget
     */
    getTirePressureStyle(pressure, unit) {
        const styles = {
            normTxt: { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.text[this.widgetColor] },
            statLow: { font: Font.heavySystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.orangeColor },
            statCrit: { font: Font.heavySystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.redColor },
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

    async createTimeStampElement(srcRow, vData, position = 'center', fontSize = undefined) {
        try {
            let refreshTime = (await this.getLastRefreshElapsedString(vData)) || this.textMap.UIValues.unknown;
            console.log(`createTimeStampElement() | refreshTime: ${JSON.stringify(refreshTime)}`);
            if (position === 'center' || position === 'right') {
                srcRow.addSpacer();
            }
            await this.createText(srcRow, 'Updated: ' + refreshTime, { font: Font.mediumSystemFont(fontSize || this.sizeMap[this.widgetSize].fontSizeSmall), textColor: this.colorMap.text[this.widgetColor], textOpacity: 0.6, lineLimit: 1 });
            if (position === 'center' || position === 'left') {
                srcRow.addSpacer();
            }
        } catch (e) {
            await this.logError(`createTimeStampElement() Error: ${e}`, true);
        }
    }

    async imgBtnRowBuilder(srcRow, elemWidth, widthPerc, elemHeight, icon) {
        const btnCol = await this.createColumn(srcRow, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(elemWidth * widthPerc), elemHeight), cornerRadius: 10, borderWidth: 2, borderColor: this.colorMap.text[this.widgetColor] });
        btnCol.addSpacer(); // Pushes Button column down to help center in middle

        const btnImgRow = await this.createRow(btnCol, { '*setPadding': [0, 0, 0, 0] });
        btnImgRow.addSpacer();
        await this.createImage(btnImgRow, icon.image, icon.opts);
        btnImgRow.addSpacer();
        btnCol.addSpacer(); // Pushes Button column up to help center in middle
    }

    async createWidgetButtonRow(srcRow, vData, padding, rowWidth, rowHeight = 40, btnImgSize = 24) {
        const useDarkMode = this.widgetColor === 'dark';
        const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
        const hasStatusMsg = await this.hasStatusMsg(vData);
        const remStartOn = vData.remoteStartStatus && vData.remoteStartStatus.running ? true : false;
        const lockBtnIcon = vData.lockStatus === 'LOCKED' ? (useDarkMode ? 'lock_btn_dark_64.png' : 'lock_btn_light_64.png') : 'unlock_btn_red_64.png'; //useDarkMode ? 'unlock_btn_dark.png' : 'unlock_btn_light.png';
        const startBtnIcon = vData.ignitionStatus !== undefined && (vData.ignitionStatus === 'On' || vData.ignitionStatus === 'Run' || remStartOn) ? 'ignition_red_64.png' : useDarkMode ? 'ignition_dark_64.png' : 'ignition_light_64.png';
        const menuBtnIcon = hasStatusMsg ? 'menu_btn_red_64.png' : useDarkMode ? 'menu_btn_dark_64.png' : 'menu_btn_light_64.png';

        const buttonRow = await this.createRow(srcRow, { '*setPadding': [0, padding || 0, 0, padding || 0], spacing: 10 });

        const buttons = [{
                show: caps && caps.includes('DOOR_LOCK_UNLOCK'),
                icon: {
                    image: await this.Files.getImage(lockBtnIcon),
                    opts: { url: await this.buildCallbackUrl({ command: 'lock_command' }), '*centerAlignImage': null, imageSize: new Size(btnImgSize, btnImgSize) },
                },
            },
            {
                show: caps && caps.includes('REMOTE_START'),
                icon: {
                    image: await this.Files.getImage(startBtnIcon),
                    opts: { resizable: true, url: await this.buildCallbackUrl({ command: 'start_command' }), '*centerAlignImage': null, imageSize: new Size(btnImgSize, btnImgSize) },
                },
            },
            {
                show: caps && caps.includes('REMOTE_PANIC_ALARM'),
                icon: {
                    image: await this.Files.getImage(useDarkMode ? 'horn_lights_dark_64.png' : 'horn_lights_light_64.png'),
                    opts: { resizable: true, url: await this.buildCallbackUrl({ command: 'horn_and_lights' }), '*centerAlignImage': null, imageSize: new Size(btnImgSize, btnImgSize) },
                },
            },
            {
                show: true,
                icon: {
                    image: await this.Files.getImage(useDarkMode ? 'refresh_btn_dark_64.png' : 'refresh_btn_light_64.png'),
                    opts: { resizable: true, url: await this.buildCallbackUrl({ command: 'request_refresh' }), '*centerAlignImage': null, imageSize: new Size(btnImgSize, btnImgSize) },
                },
            },
            {
                show: true,
                icon: {
                    image: await this.Files.getImage(menuBtnIcon),
                    opts: { resizable: true, url: await this.buildCallbackUrl({ command: 'show_menu' }), '*centerAlignImage': null, imageSize: new Size(btnImgSize, btnImgSize) },
                },
            },

            {
                show: false,
                icon: {
                    image: await this.Files.getImage('FP_Logo.png'),
                    opts: { resizable: true, url: await this.buildCallbackUrl({ command: 'open_fp_app' }), '*centerAlignImage': null, imageSize: new Size(btnImgSize, btnImgSize) },
                },
            },
        ];

        let buttonsToShow = buttons.filter((btn) => btn.show === true);
        buttonRow.size = new Size(Math.round(rowWidth * (0.17 * buttonsToShow.length)), rowHeight);
        for (const [i, btn] of buttonsToShow.entries()) {
            await this.imgBtnRowBuilder(buttonRow, Math.round(rowWidth * 0.2), Math.round(buttonsToShow.length / 100), rowHeight, btn.icon);
        }
    }

    async hasStatusMsg(vData) {
        return vData.error || (!vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') || vData.deepSleepMode || vData.firmwareUpdating || this.getStateVal('updateAvailable') === true; //|| (!vData.evVehicle && vData.oilLow)
    }

    async createStatusElement(stk, vData, maxMsgs = 2) {
        try {
            let cnt = 0;
            const hasStatusMsg = await this.hasStatusMsg(vData);
            // Creates Elements to display any errors in red at the bottom of the widget
            if (vData.error) {
                // stk.addSpacer(5);
                await this.createText(stk, vData.error ? 'Error: ' + vData.error : '', { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: Color.red() });
            } else {
                if (cnt < maxMsgs && !vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.createText(stk, `\u2022 12V Battery Low`, { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: Color.red(), lineLimit: 1 });
                    cnt++;
                }
                // if (cnt < maxMsgs && !vData.evVehicle && vData.oilLow) {
                //     stk.addSpacer(cnt > 0 ? 5 : 0);
                //     await createText(stk, `\u2022 Oil Reporting Low`, { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: Color.red(), lineLimit: 1 });
                //     cnt++;
                // }
                if (cnt < maxMsgs && vData.deepSleepMode) {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.createText(stk, `\u2022 Deep Sleep Mode`, { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: Color.orange(), lineLimit: 1 });
                    cnt++;
                }
                if (cnt < maxMsgs && vData.firmwareUpdating) {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.createText(stk, `\u2022 Firmware Updating`, { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: Color.green(), lineLimit: 1 });
                    cnt++;
                }
                if (cnt < maxMsgs && this.getStateVal('updateAvailable') === true) {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.createText(stk, `\u2022 Script Update: v${this.getStateVal('LATEST_VERSION')}`, { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: Color.orange(), lineLimit: 1 });
                    cnt++;
                }
            }
            if (!hasStatusMsg) {
                // await this.createText(stk, `     `, { font: Font.mediumSystemFont(this.sizeMap[this.widgetSize].fontSizeMedium), textColor: this.colorMap.text[this.widgetColor], lineLimit: 1 });
            }
            return stk;
        } catch (e) {
            await this.logError(`createStatusElement() Error: ${e}`, true);
        }
    }

    getVinGuideUrl(modelYear) {
        switch (modelYear.toString()) {
            case '2015':
                return 'https://www.fleet.ford.com/content/dam/aem_fleet/en_us/fleet/vin-guides/2015%20VIN%20Guide_2.pdf';
            case '2016':
                return 'https://www.fleet.ford.com/content/dam/aem_fleet/en_us/fleet/vin-guides/2016_VIN_Guide_Final.pdf';
            case '2017':
                return 'https://www.fleet.ford.com/content/dam/aem_fleet/en_us/fleet/vin-guides/2017%20VIN%20Guide%20V11.pdf';
            case '2018':
                return 'https://www.fleet.ford.com/content/dam/aem_fleet/en_us/fleet/vin-guides/FINALVIN%20GUIDE.pdf';
            case '2019':
                return 'https://www.fleet.ford.com/content/dam/aem_fleet/en_us/fleet/vin-guides/23377-2019-VIN-Guide-v7.pdf';
            case '2020':
                return 'https://www.fleet.ford.com/content/dam/aem_fleet/en_us/fleet/vin-guides/23377-2020-VIN-Guide.pdf';
            case '2021':
            case '2022':
                return `https://www.fleet.ford.com/content/dam/aem_fleet/en_us/fleet/vin-guides/${modelYear}_VIN_Guide.pdf`;
            default:
                return undefined;
        }
    }

    // Modified version of this https://talk.automators.fm/t/get-available-widget-height-and-width-depending-on-the-devices-screensize/9258/5
    async getViewPortSizes(widgetFamily) {
        // const vpSize = `${this.screenSize.width}x${this.screenSize.height}`;
        // console.log(`screenSize: ${JSON.stringify(this.screenSize)}`);
        const vpSize = (({ width: w, height: h }) => (w > h ? `${h}x${w}` : `${w}x${h}`))(this.screenSize);
        const fallback = {
            devices: ['Fallback'],
            small: { width: 155, height: 155 },
            medium: { width: 329, height: 155 },
            large: { width: 329, height: 345 },
            extraLarge: { width: 329, height: 345 },
        };
        try {
            const sizeMap = {
                // IPAD_VIEWPORT_SIZES
                '768x1024': {
                    devices: ['iPad Mini 2/3/4', 'iPad 3/4', 'iPad Air 1/2', '9.7" iPad Pro'],
                    small: { width: 120, height: 120 },
                    medium: { width: 260, height: 120 },
                    large: { width: 260, height: 260 },
                    extraLarge: { width: 540, height: 260 },
                },
                '744x1133': {
                    devices: ['iPad Mini 6'],
                    small: { width: 141, height: 141 },
                    medium: { width: 306, height: 141 },
                    large: { width: 306, height: 306 },
                    extraLarge: { width: 635, height: 306 },
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
                '2048x1280': {
                    devices: ['MacBook Pro'],
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
                await this.logInfo(`ViewPort Size: ${vpSize} | Device Models: ${sizeMap[vpSize].devices.join(', ') || 'Unknown'}`, true);
                return sizeMap[vpSize][widgetFamily];
            } else {
                await this.logInfo(`ViewPort Size (FALLBACK): ${vpSize} | Device Models: ${sizeMap[vpSize].devices.join(', ') || 'Unknown'}`, true);
                return fallback[widgetFamily];
            }
        } catch (e) {
            await this.logInfo(`ViewPort Size (FALLBACK): ${vpSize}`, true);
            return fallback[widgetFamily];
        }
    }
}

//********************************************************************************************************************************
//*                                                    MODULE AND LOG FUNCTIONS
//********************************************************************************************************************************

function runScript(name, params = {}) {
    let callback = new CallbackURL('scriptable:///run');
    callback.addParameter('scriptName', name);
    if (params && Object.keys(params).length > 0) {
        for (let key in params) {
            callback.addParameter(key, params[key]);
        }
    }
    callback.open();
}

async function clearModuleCache() {
    console.log('FileManager: Clearing All Module Files from Local Cache...');
    try {
        const fm = FileManager.local();
        const dir = fm.joinPath(fm.documentsDirectory(), 'FPWModules');
        fm.listContents(dir).forEach(async(file) => {
            const fp = fm.joinPath(dir, file);
            if ((await fm.fileExtension(fp)) === 'js') {
                console.log(`FileManager: Removing Module File: ${file}`);
                await fm.remove(fp);
            }
        });
    } catch (e) {
        this.FPW.logError(`clearModuleCache Error: ${e}`);
    }
}

/**
 * @description This makes sure all modules are loaded and/or the correct version before running the script.
 * @return
 */
const moduleFiles = ['FPW_Alerts.js||-45948353581', 'FPW_App.js||-63143283190', 'FPW_AsBuilt.js||168995733960', 'FPW_Files.js||259736685833', 'FPW_FordAPIs.js||-395044504100', 'FPW_Menus.js||-408835560406', 'FPW_Notifications.js||-83526369547', 'FPW_ShortcutParser.js||-29506917687', 'FPW_Timers.js||-77400635330'];

async function validateModules() {
    const fm = isDevMode ? FileManager.iCloud() : FileManager.local();
    if (isDevMode) {
        await clearModuleCache();
    }
    let moduleRepo = `https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/Modules/`;
    moduleRepo = widgetConfig.useBetaModules ? moduleRepo.replace('main', 'beta') : moduleRepo;
    async function downloadModule(fileName, filePath) {
        try {
            let req = new Request(`${moduleRepo}${fileName}`);
            let code = await req.loadString();
            let codeData = Data.fromString(`${code}`);
            if (isDevMode) {
                await fm.downloadFileFromiCloud(filePath);
            }
            if (await fm.fileExists(filePath)) {
                if (isDevMode && !fm.isFileDownloaded(filePath)) {
                    await fm.downloadFileFromiCloud(filePath);
                }
                console.log(`Removing Old Module: ${fileName}`);
                await fm.remove(filePath);
            }
            await fm.write(filePath, codeData);
            return true;
        } catch (error) {
            logError(`(downloadModule) ${error}`, true);
            return false;
        }
    }

    async function hashCode(input) {
        return Array.from(input).reduce((accumulator, currentChar) => (accumulator << 5) - accumulator + currentChar.charCodeAt(0), 0);
        // return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0);
    }

    let available = [];
    try {
        const moduleDir = fm.joinPath(fm.documentsDirectory(), 'FPWModules');
        if (!(await fm.isDirectory(moduleDir))) {
            logInfo('Creating FPWModules directory...');
            await fm.createDirectory(moduleDir);
        }
        for (const [i, file] of moduleFiles.entries()) {
            const [fileName, fileHash] = file.split('||');
            const filePath = await fm.joinPath(moduleDir, fileName);
            if (!(await fm.fileExists(filePath))) {
                logInfo(`Required Module Missing... Downloading ${fileName}`);
                if (await downloadModule(fileName, filePath)) {
                    available.push(fileName);
                }
            } else {
                if (isDevMode) {
                    await fm.downloadFileFromiCloud(filePath);
                }
                let fileCode = await fm.readString(filePath);
                const hash = await hashCode(fileCode);
                // const hash = Array.from(fileCode).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0);
                // console.log(`${fileName} | File Hash: ${hash} | Desired Hash: ${fileHash}`);
                if (hash.toString() !== fileHash.toString()) {
                    // logInfo(`${isDevMode ? '(Cloud)' : ''} Module ${fileName} (${fileCode.length}) Hash Missmatch | File: ${hash} | Desired: ${fileHash}`);
                    if (isDevMode === false) {
                        logInfo(`Module Hash Missmatch${isDevMode ? '(Cloud)' : ''}... Downloading ${fileName}`);
                        if (await downloadModule(fileName, filePath)) {
                            available.push(fileName);
                        }
                    } else {
                        logInfo(`${isDevMode ? '(Cloud)' : ''} Module ${fileName} Hash Missmatch | File: ${hash} | Desired: ${fileHash}`);
                        available.push(fileName);
                    }
                } else {
                    available.push(fileName);
                }
            }
        }
        if (available.length === moduleFiles.length) {
            logInfo(`All (${moduleFiles.length}) Required Modules Found!`);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        logError(`validateModules() Error: ${error}`, true);
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
        const fm = !widgetConfig.saveLogsToIcloud ? FileManager.local() : FileManager.iCloud();
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
    if (widgetConfig.writeToLog && saveToLog) {
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
const cloudFm = FileManager.iCloud();
const isDevMode = cloudFm.fileExists(cloudFm.joinPath(cloudFm.documentsDirectory(), 'FPW_Devmode')); // Disables Module File Hash checks, disables localModule loading, disables saving logs to iCloud Folder.
if (isDevMode) {
    console.log('Dev Mode Enabled!');
}
if (await validateModules()) {
    const wc = new Widget();
    await wc.run();
}
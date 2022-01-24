//This module was downloaded using FordWidgetTool.

const screenSize = Device.screenResolution();
const isSmallDisplay = screenSize.width < 1200 === true;
const darkMode = Device.isUsingDarkAppearance();

module.exports = class FPW {
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
        extraLarge: {
            titleFontSize: 10,
            fontSizeSmall: 10,
            fontSizeMedium: 11,
            fontSizeBig: 12,
            barGauge: {
                w: isSmallDisplay ? 80 : 80,
                h: isSmallDisplay ? 15 : 17,
                fs: isSmallDisplay ? 8 : 10,
            },
            logoSize: {
                w: 85,
                h: 45,
            },
            iconSize: {
                w: 11,
                h: 11,
            },
        },
    };

    phoneSizes = {
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

    constructor(SCRIPT_ID, SCRIPT_VERSION, SCRIPT_TS, widgetConfig) {
        try {
            this.SCRIPT_NAME = 'Fordpass Widget';
            this.SCRIPT_ID = SCRIPT_ID;
            this.SCRIPT_VERSION = SCRIPT_VERSION;
            this.SCRIPT_TS = SCRIPT_TS;
            this.stateStore = {};
            this.localFM = FileManager.local();
            this.localDocs = this.localFM.documentsDirectory();
            this.localModuleDir = this.localFM.joinPath(this.localDocs, 'FPWModules');
            this.iCloudFM = FileManager.iCloud();
            this.iCloudDocs = this.iCloudFM.documentsDirectory();
            this.iCloudModuleDir = this.iCloudFM.joinPath(this.iCloudDocs, 'FPWModules');
            //************************************************************************* */
            //*                  Device Detail Functions
            //************************************************************************* */
            this.screenSize = screenSize;
            this.isSmallDisplay = isSmallDisplay;
            this.darkMode = darkMode;
            this.runningWidgetSize = config.widgetFamily;
            this.isPhone = Device.isPhone();
            this.isPad = Device.isPad();
            this.deviceModel = Device.model();
            this.deviceSystemVersion = Device.systemVersion();
            this.widgetConfig = widgetConfig;
            if (config.runsInApp) {
                this.Timers = this.loadTimers();
                this.Alerts = this.loadAlerts();
            }
            this.Notifications = this.loadNotifications();
            this.ShortcutParser = this.loadShortcutParser();
            this.Kc = this.loadKeychain();
            this.Files = this.loadFiles();
            this.Logger = this.logger.bind(this);
            this.FordRequests = this.loadFordRequests();
            if (config.runsInApp) {
                this.FordCommands = this.loadFordCommands();
                this.Tables = this.loadTables();
                this.Menus = this.loadMenus();
            }
            this.WidgetHelpers = this.loadWidgetHelpers();
            this.WidgetSmall = this.loadSmallWidgetModule();
            this.WidgetMedium = this.loadMediumWidgetModule();
            this.WidgetLarge = this.loadLargeWidgetModule();
            this.WidgetExtraLarge = this.loadExtraLargeWidgetModule();
            this.checkForUpdates();
        } catch (e) {
            console.error(`FPW.js: constructor() - Error: ${e}`);
        }
    }

    async checkForUpdates() {
        const v = await this.getLatestScriptVersion();
        this.setStateVal('LATEST_VERSION', v);
        this.setStateVal('updateAvailable', await this.isNewerVersion(this.SCRIPT_VERSION, v));
        console.log(`Script Version: ${this.SCRIPT_VERSION} | Update Available: ${this.getStateVal('updateAvailable')} | Latest Version: ${this.getStateVal('LATEST_VERSION')}`);
    }

    async logger(msg, error = false, saveToLog = true) {
        if (saveToLog) {
            await this.appendToLogFile(msg);
        }
        if (error) {
            console.error(msg);
        } else {
            console.log(msg);
        }
    }

    async appendToLogFile(txt) {
        // console.log('appendToLogFile: Saving Data to Log...');
        try {
            let fm = FileManager.iCloud();
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
            console.error(`appendToLogFile Error: ${e}`);
        }
    }

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
            console.log(`readLogFile Error: ${e}`);
        }
    }

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
            console.log(`getLogFilePath Error: ${e}`);
        }
    }

    setStateVal(key, value) {
        this.stateStore[key] = value;
    }

    getStateVal(key) {
        return this.stateStore[key];
    }

    removeStateVal(key) {
        delete this.stateStore[key];
    }

    loadFiles() {
        const FPW_Files = importModule(this.iCloudModuleDir + '/FPW_Files.js');
        return new FPW_Files(this);
    }

    loadKeychain() {
        const FPW_Keychain = importModule(this.iCloudModuleDir + '/FPW_Keychain.js');
        return new FPW_Keychain(this);
    }

    loadMenus() {
        const FPW_Menus = importModule(this.iCloudModuleDir + '/FPW_Menus.js');
        return new FPW_Menus(this);
    }

    loadTimers() {
        const FPW_Timers = importModule(this.iCloudModuleDir + '/FPW_Timers.js');
        return new FPW_Timers(this);
    }

    loadTables() {
        const FPW_Tables = importModule(this.iCloudModuleDir + '/FPW_Tables.js');
        return new FPW_Tables(this);
    }

    loadAlerts() {
        const FPW_Alerts = importModule(this.iCloudModuleDir + '/FPW_Alerts.js');
        return new FPW_Alerts(this);
    }

    loadNotifications() {
        const FPW_Notifications = importModule(this.iCloudModuleDir + '/FPW_Notifications.js');
        return new FPW_Notifications(this);
    }

    loadFordRequests() {
        const FPW_FordRequests = importModule(this.iCloudModuleDir + '/FPW_FordRequests.js');
        return new FPW_FordRequests(this);
    }

    loadFordCommands() {
        const FPW_FordCommands = importModule(this.iCloudModuleDir + '/FPW_FordCommands.js');
        return new FPW_FordCommands(this);
    }

    loadShortcutParser() {
        const FPW_ShortcutParser = importModule(this.iCloudModuleDir + '/FPW_ShortcutParser.js');
        return new FPW_ShortcutParser(this);
    }

    loadWidgetHelpers() {
        const FPW_WidgetHelpers = importModule(this.iCloudModuleDir + '/FPW_Widgets_Helpers.js');
        return new FPW_WidgetHelpers(this);
    }

    loadSmallWidgetModule() {
        const FPW_Widgets_Small = importModule(this.iCloudModuleDir + '/FPW_Widgets_Small.js');
        return new FPW_Widgets_Small(this);
    }

    loadMediumWidgetModule() {
        const FPW_Widgets_Medium = importModule(this.iCloudModuleDir + '/FPW_Widgets_Medium.js');
        return new FPW_Widgets_Medium(this);
    }

    loadLargeWidgetModule() {
        const FPW_Widgets_Large = importModule(this.iCloudModuleDir + '/FPW_Widgets_Large.js');
        return new FPW_Widgets_Large(this);
    }

    loadExtraLargeWidgetModule() {
        const FPW_Widgets_ExtraLarge = importModule(this.iCloudModuleDir + '/FPW_Widgets_ExtraLarge.js');
        return new FPW_Widgets_ExtraLarge(this);
    }

    getBgGradient() {
        let grad = new LinearGradient();
        grad.locations = [0, 1];
        grad.colors = [new Color(this.colorMap.backColorGrad[0]), new Color(this.colorMap.backColorGrad[1])];
        return grad;
    }

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

    runScript(name) {
        let callback = new CallbackURL('scriptable:///run');
        callback.addParameter('scriptName', name);
        callback.open();
    }

    openScriptable() {
        let callback = new CallbackURL('scriptable:///');
        callback.open();
    }

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
            this.logger(`getReleaseNotes Error: Could Not Load Release Notes. ${e}`, true);
        }
        return undefined;
    }

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
            this.logger(`getLatestScriptVersion Error: Could Not Load Version File | ${e}`, true);
        }
    }

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
            this.logger(`createVehicleDataEmail Error: Could Not Create Email | ${e}`, true);
        }
    }

    async createLogEmail() {
        console.log('createLogEmail');
        try {
            let email = new Mail();
            email.subject = `FordPass Widget Logs`;
            email.toRecipients = [this.textMap().about.email]; // This is my anonymous email address provided by Apple,
            email.body = 'Widget Logs are Attached';
            email.isBodyHTML = true;
            let logFile = await this.Files.getLogFilePath();
            await email.addFileAttachment(logFile);
            await email.send();
        } catch (e) {
            this.logger(`createLogEmail Error: Could Not Send Log Email. ${e}`, true);
        }
    }

    async getPosition(data) {
        let loc = await Location.reverseGeocode(parseFloat(data.gps.latitude), parseFloat(data.gps.longitude));
        return `${loc[0].postalAddress.street}, ${loc[0].postalAddress.city}`;
    }

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

    convertFordDtToLocal(src) {
        try {
            let dtp = new Date(Date.parse(src.replace(/-/g, '/')));
            let dto = new Date(dtp.getTime() - dtp.getTimezoneOffset() * 60 * 1000);
            return dto;
        } catch (e) {
            console.log(`convertFordDtToLocal Error: ${e}`);
            this.Files.appendToLogFile(`convertFordDtToLocal Error: ${e}`);
        }
    }

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

    async pressureToFixed(pressure, digits) {
        // console.log(`pressureToFixed(${pressure}, ${digits})`);
        try {
            let unit = await this.Kc.getSettingVal('fpPressureUnits');
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
            console.error(`pressureToFixed Error: ${e}`);
        }
    }

    async vinFix(vin) {
        if (vin && vin.length && this.hasLowerCase(vin)) {
            console.log('VIN Validation Error: Your saved VIN number has lowercase letters.\nUpdating your saved value for you!');
            await this.setSettingVal('fpVin', vin.toUpperCase());
        }
    }

    hasLowerCase(str) {
        return str.toUpperCase() != str;
    }

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

    inputTest(val) {
        return val !== '' && val !== null && val !== undefined;
    }

    capitalizeStr(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Shamelessly borrowed from WidgetMarkup.js by @rafaelgandi
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
            this.logger(`isNewerVersion Error: ${e}`, true);
        }
        return false;
    }
};
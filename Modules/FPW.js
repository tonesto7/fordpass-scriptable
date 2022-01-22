const screenSize = Device.screenResolution();
const isSmallDisplay = screenSize.width < 1200 === true;
const darkMode = Device.isUsingDarkAppearance();

module.exports = class FPW {
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
            this.Timers = this.loadTimers();
            this.Alerts = this.loadAlerts();
            this.Notifications = this.loadNotifications();
            this.ShortcutParser = this.loadShortcutParser();
            this.Kc = this.loadKeychain();
            this.Files = this.loadFiles();
            this.Logger = this.logger.bind(this);
            this.Utils = this.loadUtils();
            this.FordRequests = this.loadFordRequests();
            this.FordCommands = this.loadFordCommands();
            this.Tables = this.loadTables();
            this.Menus = this.loadMenus();
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
        const v = await this.Utils.getLatestScriptVersion();
        this.setStateVal('LATEST_VERSION', v);
        this.setStateVal('updateAvailable', await this.Utils.isNewerVersion(this.SCRIPT_VERSION, v));
        console.log(`Script Version: ${this.SCRIPT_VERSION} | Update Available: ${this.getStateVal('updateAvailable')} | Latest Version: ${this.getStateVal('LATEST_VERSION')}`);
    }

    async logger(msg, error = false, saveToLog = true) {
        if (saveToLog) {
            await this.Files.appendToLogFile(msg);
        }
        if (error) {
            console.error(msg);
        } else {
            console.log(msg);
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

    loadUtils() {
        const FPW_Utils = importModule(this.iCloudModuleDir + '/FPW_Utils.js');
        return new FPW_Utils(this);
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
};
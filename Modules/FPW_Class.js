//This module was downloaded using FordWidgetTool.

const FPW_Files = importModule('/FPWModules/FPW_Files.js'),
    FPW_Keychain = importModule('/FPWModules/FPW_Keychain.js'),
    FPW_Utils = importModule('/FPWModules/FPW_Utils.js'),
    FPW_Timers = importModule('/FPWModules/FPW_Timers.js'),
    FPW_Tables = importModule('/FPWModules/FPW_Tables.js'),
    FPW_Alerts = importModule('/FPWModules/FPW_Alerts.js'),
    FPW_Notifications = importModule('/FPWModules/FPW_Notifications.js'),
    FPW_FordRequests = importModule('/FPWModules/FPW_FordRequests.js'),
    FPW_FordCommands = importModule('/FPWModules/FPW_FordCommands.js'),
    FPW_ShortcutParser = importModule('/FPWModules/FPW_ShortcutParser.js'),
    FPW_Menus = importModule('/FPWModules/FPW_Menus.js');

module.exports = class FPW {
    constructor(SCRIPT_ID, SCRIPT_VERSION, SCRIPT_TS, widgetConfig) {
        // console.log(`FPW_Utils.js: constructor()`);
        this.SCRIPT_NAME = 'Fordpass Widget';
        this.SCRIPT_ID = SCRIPT_ID;
        this.SCRIPT_VERSION = SCRIPT_VERSION;
        this.SCRIPT_TS = SCRIPT_TS;
        //************************************************************************* */
        //*                  Device Detail Functions
        //************************************************************************* */
        this.screenSize = Device.screenResolution();
        this.isSmallDisplay = this.screenSize.width < 1200 === true;
        this.darkMode = Device.isUsingDarkAppearance();
        this.runningWidgetSize = config.widgetFamily;
        this.isPhone = Device.isPhone();
        this.isPad = Device.isPad();
        this.deviceModel = Device.model();
        this.deviceSystemVersion = Device.systemVersion();
        this.widgetConfig = widgetConfig;
        this.statics = importModule('FPW_Statics.js');
        this.timers = this.loadTimers();
        this.alerts = this.loadAlerts();
        this.notifications = this.loadNotifications();
        this.shortcutParser = this.loadShortcutParser();
        this.kc = this.loadKeychain();
        this.files = this.loadFiles();
        this.utils = this.loadUtils();
        this.fordRequests = this.loadFordRequests();
        this.fordCommands = this.loadFordCommands();
        this.tables = this.loadTables();
        this.menus = this.loadMenus();
    }

    loadFiles() {
        return new FPW_Files(this);
    }

    loadKeychain() {
        return new FPW_Keychain(this);
    }

    loadMenus() {
        return new FPW_Menus(this);
    }

    loadUtils() {
        return new FPW_Utils(this);
    }

    loadTimers() {
        return new FPW_Timers(this);
    }

    loadTables() {
        return new FPW_Tables(this);
    }

    loadAlerts() {
        return new FPW_Alerts(this);
    }

    loadNotifications() {
        return new FPW_Notifications(this);
    }

    loadFordRequests() {
        return new FPW_FordRequests(this);
    }

    loadFordCommands() {
        return new FPW_FordCommands(this);
    }

    loadShortcutParser() {
        return new FPW_ShortcutParser(this);
    }
};
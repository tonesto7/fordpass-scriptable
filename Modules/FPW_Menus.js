module.exports = class FPW_Menus {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.Kc = FPW.Kc;
        this.Statics = FPW.Statics;
        this.FordRequests = FPW.FordRequests;
        this.Alerts = FPW.Alerts;
        this.Timers = FPW.Timers;
    }
};
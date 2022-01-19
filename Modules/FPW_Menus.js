module.exports = class FPW_Menus {
    constructor(fpw) {
        this.fpw = fpw;
        this.SCRIPT_ID = fpw.SCRIPT_ID;
        this.widgetConfig = fpw.widgetConfig;
        this.kc = fpw.kc;
        this.statics = fpw.statics;
        this.fordRequests = fpw.fordRequests;
        this.alerts = fpw.alerts;
        this.timers = fpw.timers;
    }
};
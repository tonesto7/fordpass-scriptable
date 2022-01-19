module.exports = class FPW_Menus {
    constructor(fpClass) {
        this.fpClass = fpClass;
        this.SCRIPT_ID = fpClass.SCRIPT_ID;
        this.widgetConfig = fpClass.widgetConfig;
        this.kc = fpClass.kc;
        this.statics = fpClass.statics;
        this.fordRequests = fpClass.fordRequests;
        this.alerts = fpClass.alerts;
        this.timers = fpClass.timers;
    }
};
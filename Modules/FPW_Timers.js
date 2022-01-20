let timerMap = {};
module.exports = class FPW_Timers {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.Kc = FPW.Kc;
        this.Statics = FPW.Statics;
        this.FordRequests = FPW.FordRequests;
        this.Alerts = FPW.Alerts;
        this.Utils = FPW.Utils;
        this.Timers = FPW.Timers;
    }

    async getTimer(timerName) {
        if (timerMap[timerName]) {
            return timerMap[timerName];
        }
        let timer = new Timer();
        timerMap[timerName] = timer;
        return timerMap[timerName];
    }

    async stopTimer(timerName) {
        try {
            timerMap[timerName].invalidate();
        } catch (e) {
            // console.log(`stopTimer Error: Could Not Stop Timer | ${e}`);
        }
        delete timerMap[timerName];
    }

    async createTimer(name, interval, repeat = false, actions, clearExisting = false) {
        if (clearExisting && timerMap[name]) {
            await this.stopTimer(name);
        }
        let timer = await this.getTimer(name);
        if (timer && interval && actions) {
            timer.schedule(10000, repeat, actions);
        } else {
            console.log(`createTimer Error: Could Not Create Timer | Name: ${name} | Interval: ${interval} | Repeat: ${repeat} | Actions: ${actions}`);
        }
    }
};
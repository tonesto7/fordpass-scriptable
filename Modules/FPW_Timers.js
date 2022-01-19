//This module was downloaded using FordWidgetTool.

//This module was downloaded using FordWidgetTool.

let timerMap = {};
module.exports = class FPW_Timers {
    constructor(fpw) {
        this.fpw = fpw;
        this.SCRIPT_ID = fpw.SCRIPT_ID;
        this.widgetConfig = fpw.widgetConfig;
        this.kc = fpw.kc;
        this.statics = fpw.statics;
        this.fordRequests = fpw.fordRequests;
        this.alerts = fpw.alerts;
        this.utils = fpw.utils;
        this.timers = fpw.timers;
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
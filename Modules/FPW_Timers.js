//This module was downloaded using FordWidgetTool.

module.exports = class FPW_Timers {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.Kc = FPW.Kc;
        this.FordRequests = FPW.FordRequests;
        this.Alerts = FPW.Alerts;
        this.Utils = FPW.Utils;
        this.Timers = FPW.Timers;
        this.Tables = FPW.Tables;
        this.timerMap = {};
    }

    async getTimer(timerName) {
        if (this.timerMap[timerName]) {
            return this.timerMap[timerName];
        }
        let timer = new Timer();
        this.timerMap[timerName] = timer;
        return this.timerMap[timerName];
    }

    async stopTimer(timerName) {
        try {
            this.timerMap[timerName].invalidate();
        } catch (e) {
            // console.log(`stopTimer Error: Could Not Stop Timer | ${e}`);
        }
        delete this.timerMap[timerName];
    }

    async createTimer(name, interval, repeat = false, actions, clearExisting = false) {
        if (clearExisting && this.timerMap[name]) {
            await this.stopTimer(name);
        }
        let timer = await this.getTimer(name);
        if (timer && interval && actions) {
            timer.schedule(10000, repeat, actions);
        } else {
            console.log(`createTimer Error: Could Not Create Timer | Name: ${name} | Interval: ${interval} | Repeat: ${repeat} | Actions: ${actions}`);
        }
    }

    async scheduleMainTableRefresh(interval) {
        await this.Timers.createTimer(
            'mainTableRefresh',
            interval,
            false,
            async() => {
                console.log('(Main Table) Refresh Timer Fired');
                await this.FordRequests.fetchVehicleData(false);
                await this.Tables.TableMainMenu.generateMainInfoTable(true);
            },
            false,
        );
    }

    async createRemoteStartStatusTimer() {
        console.log('createRemoteStartStatusTimer');
        await this.Timers.createTimer(
            'remoteStartStatus',
            60000,
            false,
            async() => {
                console.log('(Remote Start Status) Timer fired');
                await this.FordRequests.fetchVehicleData(false);
                await this.Tables.TableMainMenu.generateMainInfoTable(true);
            },
            true,
        );
    }
};
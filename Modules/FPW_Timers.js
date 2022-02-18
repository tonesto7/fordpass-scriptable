module.exports = class FPW_Timers {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.timerMap = {};
    }

    async getTimer(timerName) {
        if (await this.timerValid(timerName)) {
            return this.timerMap[timerName];
        }
        let timer = new Timer();
        this.timerMap[timerName] = timer;
        return this.timerMap[timerName];
    }

    async timerValid(timerName) {
        return this.timerMap[timerName] && this.timerMap[timerName] instanceof Timer ? true : false;
    }

    async stopTimer(timerName) {
        try {
            this.timerMap[timerName].invalidate();
        } catch (e) {
            // console.log(`stopTimer Error: Could Not Stop Timer | ${e}`);
        }
        delete this.timerMap[timerName];
        return;
    }

    async createTimer(name, interval, repeat = false, actions, clearExisting = false) {
        try {
            if (clearExisting && (await this.timerValid(name))) {
                await this.stopTimer(name);
            }
            const timer = await this.getTimer(name);
            if (timer && timer instanceof Timer && interval && actions) {
                timer.timeInterval = interval;
                timer.repeat = repeat;
                timer.schedule(actions());
            } else {
                console.log(`createTimer Error: Could Not Create Timer | Name: ${name} | Interval: ${interval} | Repeat: ${repeat} | Actions: ${actions}`);
            }
        } catch (e) {
            this.FPW.logError(`createTimer Error: Could Not Create Timer | ${e}`);
        }
    }

    async scheduleMainPageRefresh(timerName, interval, repeat = false, clearExisting = false) {
        // console.log(`scheduleMainPageRefresh(${timerName}, ${interval / 1000} seconds)`);
        if (clearExisting && (await this.timerValid(timerName))) {
            await this.stopTimer(timerName);
        }
        const timer = await this.getTimer(timerName);
        if (timer && timer instanceof Timer && interval) {
            timer.timeInterval = interval;
            timer.repeat = repeat;
            return timer.schedule(async() => {
                console.log(`(${timerName}) Refresh Timer Fired`);
                await this.FPW.FordAPI.fetchVehicleData(false);
                await this.FPW.App.createMainPage(true);
            });
        }
        return;
    }
};
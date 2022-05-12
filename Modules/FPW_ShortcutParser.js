module.exports = class FPW_ShortcutParser {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.voiceIntentTree = {
            requests: { prefixs: ['is', 'are'] },
            commands: { prefixs: ['stop', 'start'] },
        };
    }

    getModuleVer() {
        return '2022.05.12.0';
    }

    // [
    // ]

    async getAvailableRequests() {
        const vData = await this.FPW.FordAPI.fetchVehicleData(true);
        const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
        let cmds = [];
        let reqs = [];
        if (caps.length) {
            for (const [i, cap] of caps.entries()) {
                switch (cap) {
                    case 'REMOTE_START':
                        cmds.concat(['start', 'stop']);
                        break;
                    case 'REMOTE_PANIC_ALARM':
                        cmds.concat(['horn', 'panic']);
                        break;
                    case 'DOOR_LOCK_UNLOCK':
                        cmds.concat(['lock', 'unlock']);
                        break;
                    case 'GUARD_MODE':
                        cmds.concat(['guard', 'alarm']);
                        break;
                }
            }
        }

        return { cmds: cmds, reqs: reqs };
    }

    async parseIncomingSiriCommand(cmdStr) {
        let words = cmdStr.split(' ');
        let availableReqs = await this.getAvailableRequests();
        console.log(`availableReqs: ${JSON.stringify(availableReqs)}`);
        console.log(`parseIncomingSiriCommand: ${cmdStr}`);
        console.log(`words: ${JSON.stringify(words)}`);
        return `Siri Command Received ${cmdStr}`;
    }
};
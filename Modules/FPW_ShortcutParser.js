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
        return '2022.04.28.0';
    }

    // [
    //     'CEN_LAST_MILE',
    //     'CEN_OFFBOARD_SEARCH',
    //     'DISTANCE_TO_EMPTY_TCU',
    //     'DOOR_LOCK_UNLOCK',
    //     'EVCS_CHARGE_LOCATIONS_AND_CHARGE_TIMES',
    //     'EVCS_DEPARTURE_TIMES',
    //     'EVCS_NOTIFICATIONS_SETTINGS',
    //     'EVCS_STATION_FINDER',
    //     'EVCS_TRIP_AND_CHARGE_LOGS',
    //     'EVCS_TRIP_READY_NOTIFICATION',
    //     'EVCS_UTILITY_RATE_SERVICES',
    //     'EVCS_VEHICLE_STATUS_EXTENDED',
    //     'EV_FUEL',
    //     'EV_OFF_PLUG_PRECONDITIONING',
    //     'EV_SMART_CHARGING',
    //     'EV_TRIP_PLANNER',
    //     'EXTEND',
    //     'FRUNK',
    //     'FUEL_TCU',
    //     'GEO_FENCING',
    //     'GUARD_MODE',
    //     'ODOMETER_TCU',
    //     'OIL_LIFE_TCU',
    //     'PAAK',
    //     'POWER_LIFTGATE',
    //     'REMOTE_PANIC_ALARM',
    //     'REMOTE_START',
    //     'TPMS_TCU',
    //     'VEHICLE_HEALTH_REPORTING',
    //     'VEHICLE_LOCATOR',
    //     'VHA2.0_TCU',
    //     'WIFI_DATA_USAGE',
    //     'WIFI_HOTSPOT',
    //     'WIFI_SSID_PASSWORD';
    //     'CEN_LAST_MILE',
    //     'CEN_OFFBOARD_SEARCH',
    //     'CEN_SEND_TO_CAR',
    //     'DISTANCE_TO_EMPTY_TCU',
    //     'DOOR_LOCK_UNLOCK',
    //     'EXTEND',
    //     'FUEL_TCU',
    //     'GEO_FENCING',
    //     'GUARD_MODE',
    //     'ODOMETER_TCU',
    //     'OIL_LIFE',
    //     'OIL_LIFE_TCU',
    //     'POWER_LIFTGATE',
    //     'REMOTE_START',
    //     'SCHEDULED_START',
    //     'TPMS_TCU',
    //     'TRAILER_LIGHT',
    //     'VEHICLE_HEALTH_REPORTING',
    //     'VEHICLE_LOCATOR',
    //     'VHA2.0_TCU',
    //     'WIFI_DATA_USAGE',
    //     'WIFI_HOTSPOT',
    //     'WIFI_SSID_PASSWORD',
    //     'ZONE_LIGHTING_FOUR_ZONES',
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
module.exports = class FPW_FordCommands {
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

    vehicleCmdConfigs = (vin, param2 = undefined) => {
        const baseUrl = 'https://usapi.cv.ford.com/api';
        const guardUrl = 'https://api.mps.ford.com/api';
        let cmds = {
            lock: {
                desc: 'Lock Doors',
                cmds: [{
                    uri: `${baseUrl}/vehicles/${vin}/doors/lock`,
                    method: 'PUT',
                }, ],
            },
            unlock: {
                desc: 'Unlock Doors',
                cmds: [{
                    uri: `${baseUrl}/vehicles/${vin}/doors/lock`,
                    method: 'DELETE',
                }, ],
            },
            start: {
                desc: 'Remote Start',
                cmds: [{
                    uri: `${baseUrl}/vehicles/${vin}/engine/start`,
                    method: 'PUT',
                }, ],
            },
            stop: {
                desc: 'Remote Stop',
                cmds: [{
                    uri: `${baseUrl}/vehicles/${vin}/engine/start`,
                    method: 'DELETE',
                }, ],
            },
            horn_and_lights: {
                desc: 'Horn & Lights On',
                cmds: [{
                    uri: `${baseUrl}/vehicles/${vin}/panic/3`,
                    method: 'PUT',
                }, ],
            },
            guard_mode_on: {
                desc: 'Enable SecuriAlert',
                cmds: [{
                    uri: `${guardUrl}/guardmode/v1/${vin}/session`,
                    method: 'PUT',
                }, ],
            },
            guard_mode_off: {
                desc: 'Disable SecuriAlert',
                cmds: [{
                    uri: `${guardUrl}/guardmode/v1/${vin}/session`,
                    method: 'DELETE',
                }, ],
            },
            trailer_light_check_on: {
                desc: 'Trailer Light Check ON',
                cmds: [{
                    uri: `${baseUrl}/vehicles/${vin}/trailerlightcheckactivation`,
                    method: 'PUT',
                }, ],
            },
            trailer_light_check_off: {
                desc: 'Trailer Light Check OFF',
                cmds: [{
                    uri: `${baseUrl}/vehicles/${vin}/trailerlightcheckactivation`,
                    method: 'DELETE',
                }, ],
            },
            status: {
                desc: 'Refresh Vehicle Status',
                cmds: [{
                    uri: `${baseUrl}/vehicles/${vin}/status`,
                    method: 'PUT',
                }, ],
            },
        };
        ['all:0', 'front:1', 'rear:3', 'left:4', 'right:2'].forEach((zone) => {
            let [zoneName, zoneNum] = zone.split(':');
            cmds[`zone_lights_${zoneName}_on`] = {
                desc: `Turn On Zone Lighting (${zoneName.charAt(0).toUpperCase() + zoneName.slice(1)})`,
                cmds: [{
                        uri: `${baseUrl}/vehicles/${vin}/zonelightingactivation`,
                        method: 'PUT',
                    },
                    {
                        uri: `${baseUrl}/vehicles/${vin}/${zoneNum}/zonelighting`,
                        method: 'PUT',
                    },
                ],
            };
            cmds[`zone_lights_${zoneName}_off`] = {
                desc: `Turn Off Zone Lighting (${zoneName.charAt(0).toUpperCase() + zoneName.slice(1)})`,
                cmds: [{
                        uri: `${baseUrl}/vehicles/${vin}/zonelightingactivation`,
                        method: 'DELETE',
                    },
                    {
                        uri: `${baseUrl}/vehicles/${vin}/${zoneNum}/zonelighting`,
                        method: 'DELETE',
                    },
                ],
            };
        });
        // console.log(JSON.stringify(cmds, null, 2));
        return cmds;
    };

    async sendVehicleCmd(cmd_type = '', mainMenuRefresh = true) {
        let authMsg = await this.fordRequests.checkAuth('sendVehicleCmd(' + cmd_type + ')');
        if (authMsg) {
            console.log(`sendVehicleCmd(${cmd_type}): ${result}`);
            return;
        }
        let token = await this.kc.getSettingVal('fpToken2');
        let vin = await this.kc.getSettingVal('fpVin');
        let cmdCfgs = this.vehicleCmdConfigs(vin);
        let cmds = cmdCfgs[cmd_type].cmds;
        let cmdDesc = cmdCfgs[cmd_type].desc;
        let multiCmds = cmds.length > 1;
        // console.log(`multipleCmds: ${multiCmds}`);
        let wasError = false;
        let errMsg = undefined;
        let outMsg = { title: '', message: '' };

        for (const cmd in cmds) {
            let isLastCmd = !multiCmds || (multiCmds && cmds.length == parseInt(cmd) + 1);
            // console.log(`processing vehicle command (${cmd_type}) #${cmd} | Method: ${cmds[cmd].method} | URI: ${cmds[cmd].uri}`);
            let req = new Request(cmds[cmd].uri);
            req.headers = {
                Accept: '*/*',
                'Accept-Language': 'en-us',
                'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                'Application-Id': this.fordRequests.appIDs().NA,
                'auth-token': `${token}`,
            };
            req.method = cmds[cmd].method;
            req.timeoutInterval = 10;

            try {
                let data = await req.loadString();
                let cmdResp = req.response;
                // console.log(data);
                if (data == 'Access Denied') {
                    console.log('sendVehicleCmd: Auth Token Expired. Fetching new token and fetch raw data again');
                    let result = await this.fordRequests.fetchToken();
                    if (result && result == this.statics.textMap().errorMessages.invalidGrant) {
                        console.log(`sendVehicleCmd(${cmd_type}): ${result}`);
                        return result;
                    }
                    data = await req.loadString();
                }
                data = JSON.parse(data);

                if (cmdResp.statusCode) {
                    console.log(`sendVehicleCmd(${cmd_type}) Status Code (${cmdResp.statusCode})`);
                    if (cmdResp.statusCode !== 200) {
                        wasError = true;
                        if (widgetConfig.debugMode) {
                            console.log('Debug: Error while sending vehicle cmd');
                            console.log(JSON.stringify(data));
                        }
                        if (cmdResp.statusCode === 590) {
                            console.log('code 590');
                            console.log(`isLastCmd: ${isLastCmd}`);
                            outMsg = { title: `${cmdDesc} Command`, message: this.statics.textMap().errorMessages.cmd_err_590 };
                        } else {
                            errMsg = `Command Error: ${JSON.stringify(data)}`;
                            outMsg = { title: `${cmdDesc} Command`, message: `${this.statics.textMap().errorMessages.cmd_err}\n\Error: ${cmdResp.statusCode}` };
                        }
                    } else {
                        console.log('sendVehicleCmd Response: ' + JSON.stringify(data));
                        outMsg = { title: `${cmdDesc} Command`, message: this.statics.textMap().successMessages.cmd_success };
                    }
                }

                if (wasError) {
                    if (errMsg) {
                        console.log(`sendVehicleCmd(${cmd_type}) | Error: ${errMsg}`);
                    }
                    if (outMsg.message !== '') {
                        await this.alerts.showAlert(outMsg.title, outMsg.message);
                    }
                    return;
                } else {
                    if (isLastCmd) {
                        console.log(`sendVehicleCmd(${cmd_type}) | Sent Successfully`);
                        await this.alerts.showAlert(outMsg.title, outMsg.message);
                        await this.timers.createTimer(
                            'vehicleDataRefresh',
                            15000,
                            false,
                            async() => {
                                console.log('sendVehicleCmd: Refreshing Vehicle Data after 10 seconds');
                                await this.fordRequests.fetchVehicleData(false);
                                if (mainMenuRefresh) {
                                    console.log('sendVehicleCmd: Reloading Main Menu Content');
                                    await generateMainInfoTable(true);
                                }
                            },
                            true,
                        );
                    }
                }
            } catch (e) {
                console.log(`sendVehicleCmd Catch Error: ${e}`);
                return;
            }
        }
        return;
    }
};
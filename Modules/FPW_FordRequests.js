module.exports = class FPW_FordRequests {
    constructor(fpw) {
        this.fpw = fpw;
        this.SCRIPT_ID = fpw.SCRIPT_ID;
        this.SCRIPT_VERSION = fpw.SCRIPT_VERSION;
        this.SCRIPT_TS = fpw.SCRIPT_TS;
        this.widgetConfig = fpw.widgetConfig;
        this.kc = fpw.kc;
        this.utils = fpw.utils;
        this.statics = fpw.statics;
        this.files = fpw.files;
    }

    appIDs() {
        return {
            UK_Europe: '1E8C7794-FF5F-49BC-9596-A1E0C86C5B19',
            Australia: '5C80A6BB-CF0D-4A30-BDBF-FC804B5C1A98',
            NA: '71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592',
        };
    }

    async checkAuth(src = undefined) {
        let token = await this.kc.getKeychainValue('fpToken2');
        let expiresAt = await this.kc.getKeychainValue('fpTokenExpiresAt');
        let expired = expiresAt ? Date.now() >= Date.parse(expiresAt) : false;
        if (this.widgetConfig.debugMode) {
            console.log(`chechAuth(${src})`);
            console.log(`checkAuth | Token: ${token}`);
            console.log(`checkAuth | ExpiresAt: ${expiresAt}`);
            console.log(`checkAuth | Expired: ${expired}`);
        }
        let tok;
        let refresh;
        if (expired) {
            console.log('Token has expired... Refreshing Token...');
            refresh = await this.refreshToken();
        } else if (token === null || token === undefined || token === '' || expiresAt === null || expiresAt === undefined || expiresAt === '') {
            console.log('Token or Expiration State is Missing... Fetching Token...');
            tok = await this.fetchToken();
        }
        if ((tok || refresh) && (tok == this.statics.textMap().errorMessages.invalidGrant || tok == this.statics.textMap().errorMessages.noCredentials || refresh == this.statics.textMap().errorMessages.invalidGrant || refresh == this.statics.textMap().errorMessages.noCredentials)) {
            return tok;
        } else {
            return undefined;
        }
    }

    async fetchToken() {
        let username = await this.kc.getKeychainValue('fpUser');
        if (!username) {
            return this.statics.textMap().errorMessages.noCredentials;
        }
        let password = await this.kc.getKeychainValue('fpPass');
        if (!password) {
            return this.statics.textMap().errorMessages.noCredentials;
        }
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
            'Accept-Encoding': 'gzip, deflate, br',
            authorization: 'Basic ZWFpLWNsaWVudDo=',
        };

        try {
            let req1 = new Request('https://sso.ci.ford.com/oidc/endpoint/default/token');
            req1.headers = headers;
            req1.method = 'POST';
            req1.body = `client_id=9fb503e0-715b-47e8-adfd-ad4b7770f73b&grant_type=password&username=${username}&password=${encodeURIComponent(password)}`;
            req1.timeoutInterval = 10;

            let token1 = await req1.loadJSON();
            let resp1 = req1.response;
            if (this.widgetConfig.debugAuthMode) {
                console.log(`Token1 Req | Status: ${resp1.statusCode}) | Resp: ${JSON.stringify(token1)}`);
            }
            if (token1.error && token1.error == 'invalid_grant') {
                if (this.widgetConfig.debugMode) {
                    console.log('Debug: Error while receiving token1 data');
                    console.log(token1);
                }
                return this.statics.textMap().errorMessages.invalidGrant;
            }
            if (resp1.statusCode === 200) {
                let req2 = new Request(`https://api.mps.ford.com/api/oauth2/v1/token`);
                headers['content-type'] = 'application/json';
                headers['application-id'] = this.appIDs().NA;
                req2.headers = headers;
                req2.method = 'PUT';
                req2.body = JSON.stringify({ code: token1.access_token });
                req2.timeoutInterval = 10;

                let token2 = await req2.loadJSON();
                let resp2 = req2.response;
                if (this.widgetConfig.debugAuthMode) {
                    console.log(`Token2 Req | Status: ${resp2.statusCode}) | Resp: ${JSON.stringify(token2)}`);
                }
                if (token2.error && token2.error == 'invalid_grant') {
                    if (this.widgetConfig.debugMode) {
                        console.log('Debug: Error while receiving token2 data');
                        console.log(token2);
                    }
                    return this.statics.textMap().errorMessages.invalidGrant;
                }
                if (resp2.statusCode === 200) {
                    await this.kc.setKeychainValue('fpToken2', token2.access_token);
                    await this.kc.setKeychainValue('fpRefreshToken', token2.refresh_token);
                    await this.kc.setKeychainValue('fpTokenExpiresAt', (Date.now() + token2.expires_in).toString());
                    let token = await this.kc.getKeychainValue('fpToken2');
                    let expiresAt = await this.kc.getKeychainValue('fpTokenExpiresAt');
                    // console.log(`expiresAt: ${expiresAt}`);
                    return;
                }
            }
        } catch (e) {
            console.log(`fetchToken Error: ${e}`);
            if (e.error && e.error == 'invalid_grant') {
                return this.statics.textMap().errorMessages.invalidGrant;
            }
            throw e;
        }
    }

    async refreshToken() {
        try {
            const refreshToken = await this.kc.getKeychainValue('fpRefreshToken');

            let req = new Request(`https://api.mps.ford.com/api/oauth2/v1/refresh`);
            req.headers = {
                Accept: '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                'Application-Id': this.appIDs().NA,
            };
            req.timeoutInterval = 10;
            req.method = 'PUT';
            req.body = JSON.stringify({ refresh_token: refreshToken });

            let token = await req.loadJSON();
            let resp = req.response;
            if (this.widgetConfig.debugAuthMode) {
                console.log(`RefreshToken Req | Status: ${resp.statusCode}) | Resp: ${JSON.stringify(token)}`);
            }
            if (token.error && token.error == 'invalid_grant') {
                if (this.widgetConfig.debugMode) {
                    console.log('Debug: Error while receiving refreshing token');
                    console.log(token);
                }
                return this.statics.textMap().errorMessages.invalidGrant;
            }
            if (resp.statusCode === 200) {
                await this.kc.setKeychainValue('fpToken2', token.access_token);
                await this.kc.setKeychainValue('fpRefreshToken', token.refresh_token);
                await this.kc.setKeychainValue('fpTokenExpiresAt', (Date.now() + token.expires_in).toString());
                // console.log(`expiresAt: ${expiresAt}`);
                return;
            } else if (resp.statusCode === 401) {
                await this.fetchToken();
            }
        } catch (e) {
            console.log(`refreshMpsToken Error: ${e}`);
            if (e.error && e.error == 'invalid_grant') {
                return this.statics.textMap().errorMessages.invalidGrant;
            }
            throw e;
        }
    }

    async getVehicleStatus() {
        let vin = await this.kc.getKeychainValue('fpVin');
        if (!vin) {
            return this.statics.textMap().errorMessages.noVin;
        }
        return await this.makeFordRequest('getVehicleStatus', `https://usapi.cv.ford.com/api/vehicles/v4/${vin}/status`, 'GET', false);
    }

    async getVehicleInfo() {
        let vin = await this.kc.getKeychainValue('fpVin');
        if (!vin) {
            return this.statics.textMap().errorMessages.noVin;
        }
        return await this.makeFordRequest('getVehicleInfo', `https://usapi.cv.ford.com/api/users/vehicles/${vin}/detail?lrdt=01-01-1970%2000:00:00`, 'GET', false);
    }

    async getUserMessages() {
        let data = await this.makeFordRequest('getUserMessages', `https://api.mps.ford.com/api/messagecenter/v3/messages`, 'GET', false);
        return data && data.result && data.result.messages && data.result.messages.length ? data.result.messages : [];
    }

    async deleteUserMessages(msgIds = []) {
        let data = await this.makeFordRequest('deleteUserMessages', `https://api.mps.ford.com/api/messagecenter/v3/user/messages`, 'DELETE', false, undefined, { messageIds: msgIds });
        return data && data.result === 'Success' ? true : false;
    }

    async markMultipleUserMessagesRead(msgIds = []) {
        let data = await this.makeFordRequest('markUserMessagesRead', `https://api.mps.ford.com/api/messagecenter/v3/user/messages/read`, 'PUT', false, undefined, { messageIds: msgIds });
        return data && data.result === 'Success' ? true : false;
    }

    async markUserMessageRead(msgId) {
        let data = await this.makeFordRequest('markMultipleUserMessagesRead', `https://api.mps.ford.com/api/messagecenter/v3/user/content/${msgId}`, 'PUT', false);
        return data && data.result && data.result.messageId === msgId ? true : false;
    }

    async getVehicleAlerts() {
        let vin = await this.kc.getKeychainValue('fpVin');
        let token = await this.kc.getKeychainValue('fpToken2');
        let country = await this.kc.getKeychainValue('fpCountry');
        let lang = await this.kc.getKeychainValue('fpLanguage');
        if (!vin) {
            return this.statics.textMap().errorMessages.noVin;
        }
        let data = await this.makeFordRequest(
            'getVehicleAlerts',
            `https://api.mps.ford.com/api/expvehiclealerts/v2/details`,
            'POST',
            false, {
                'Content-Type': 'application/json',
                Accept: '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
                'Application-Id': this.appIDs().NA,
                'auth-token': `${token}`,
                countryCode: country,
                locale: lang,
            }, {
                VIN: vin,
                userAuthorization: 'AUTHORIZED',
                hmiPreferredLanguage: '',
                sdnLookup: 'VSDN',
                getDtcsViaApplink: 'NoDisplay',
                displayOTAStatusReport: 'Display',
            },
        );
        // console.log(`getVehicleAlerts: ${JSON.stringify(data)}`);
        return {
            vha: data && data.vehicleHealthAlerts && data.vehicleHealthAlerts.vehicleHealthAlertsDetails && data.vehicleHealthAlerts.vehicleHealthAlertsDetails.length ? data.vehicleHealthAlerts.vehicleHealthAlertsDetails : [],
            mmota: data && data.mmotaAlerts && data.mmotaAlerts.mmotaAlertsDetails && data.mmotaAlerts.mmotaAlertsDetails.length ? data.mmotaAlerts.mmotaAlertsDetails : [],
            summary: data && data.summary && data.summary.alertSummary && data.summary.alertSummary.length ? data.summary.alertSummary : [],
        };
    }

    async getVehicleCapabilities() {
        let vin = await this.kc.getKeychainValue('fpVin');
        if (!vin) {
            return this.statics.textMap().errorMessages.noVin;
        }
        let data = await this.makeFordRequest('getVehicleCapabilities', `https://api.mps.ford.com/api/capability/v1/vehicles/${vin}?lrdt=01-01-1970%2000:00:00`, 'GET', false);
        if (data && data.result && data.result.features && data.result.features.length > 0) {
            let caps = data.result.features
                .filter((cap) => {
                    return cap.state && cap.state.eligible === true;
                })
                .map((cap) => {
                    return cap.feature;
                });
            return caps;
        }
        return undefined;
    }

    async getVehicleOtaInfo() {
        let vin = await this.kc.getKeychainValue('fpVin');
        let token = await this.kc.getKeychainValue('fpToken2');
        let country = await this.kc.getKeychainValue('fpCountry');
        if (!vin) {
            return this.statics.textMap().errorMessages.noVin;
        }

        return await this.makeFordRequest('getVehicleOtaInfo', `https://www.digitalservices.ford.com/owner/api/v2/ota/status?country=${country.toLowerCase()}&vin=${vin}`, 'GET', false, {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
            'Application-Id': this.appIDs().NA,
            'auth-token': `${token}`,
            'Consumer-Key': `Z28tbmEtZm9yZA==`, // Base64 encoded version of "go-na-ford"
            Referer: 'https://ford.com',
            Origin: 'https://ford.com',
        });
    }

    async getVehicleManual() {
        let vin = await this.kc.getKeychainValue('fpVin');
        let token = await this.kc.getKeychainValue('fpToken2');
        const country = await this.kc.getKeychainValue('fpCountry');
        let lang = await this.kc.getKeychainValue('fpLanguage');
        if (!vin) {
            return this.statics.textMap().errorMessages.noVin;
        }

        return await this.makeFordRequest('getVehicleManual', `https://api.mps.ford.com/api/ownersmanual/v1/manuals/${vin}?countryCode=${country}&language=${lang}`, 'GET', false, {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
            'Application-Id': this.appIDs().NA,
            'auth-token': `${token}`,
            'Consumer-Key': `Z28tbmEtZm9yZA==`, // Base64 encoded version of "go-na-ford"
            Referer: 'https://ford.com',
            Origin: 'https://ford.com',
        });
    }

    async getVehicleRecalls() {
        const vin = await this.kc.getKeychainValue('fpVin');
        const token = await this.kc.getKeychainValue('fpToken2');
        const country = await this.kc.getKeychainValue('fpCountry');
        let lang = await this.kc.getKeychainValue('fpLanguage');
        if (!lang) {
            await this.queryFordPassPrefs(true);
            lang = await this.kc.getKeychainValue('fpLanguage');
        }
        lang = lang.split('-');
        if (!vin) {
            return this.statics.textMap().errorMessages.noVin;
        }
        let data = await this.makeFordRequest('getVehicleRecalls', `https://api.mps.ford.com/api/recall/v2/recalls?vin=${vin}&language=${lang[0].toUpperCase()}&region=${lang[1].toUpperCase()}&country=${country}`, 'GET', false);
        // console.log('recalls: ' + JSON.stringify(data));
        return data && data.value ? data.value : undefined;
    }

    async getFordpassRewardsInfo(program = 'F') {
        const country = await this.kc.getKeychainValue('fpCountry');
        let data = await this.makeFordRequest('getFordpassRewardsInfo', `https://api.mps.ford.com/api/rewards-account-info/v1/customer/points/totals?rewardProgram=${program}&programCountry=${country}`, 'GET', false);
        // console.log('fordpass rewards: ' + JSON.stringify(data));
        return data && data.pointsTotals && data.pointsTotals.F ? data.pointsTotals.F : undefined;
    }

    async getEvChargeStatus() {
        const vin = await this.kc.getKeychainValue('fpVin');
        if (!vin) {
            return this.statics.textMap().errorMessages.noVin;
        }
        return await this.makeFordRequest('getEvChargeStatus', `https://api.mps.ford.com/api/cevs/v1/chargestatus/retrieve`, 'POST', false, undefined, { vin: vin });
    }

    async getEvPlugStatus() {
        const token = await this.kc.getKeychainValue('fpToken2');
        const vin = await this.kc.getKeychainValue('fpVin');
        if (!vin) {
            return this.statics.textMap().errorMessages.noVin;
        }
        return await this.makeFordRequest('getEvPlugStatus', `https://api.mps.ford.com/api/vpoi/chargestations/v3/plugstatus`, 'GET', false, {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
            'Application-Id': this.appIDs().NA,
            'auth-token': `${token}`,
            vin: vin,
        });
    }

    async getEvChargerBalance() {
        const vin = await this.kc.getKeychainValue('fpVin');
        if (!vin) {
            return this.statics.textMap().errorMessages.noVin;
        }
        let data = await this.makeFordRequest('getEvChargeBalance', `https://api.mps.ford.com/api/usage-management/v1/usage/balance`, 'POST', false, undefined, { vin: vin });
        return data && data.usageBalanceList ? data.usageBalanceList : [];
    }

    async getSecuriAlertStatus() {
        const vin = await this.kc.getKeychainValue('fpVin');
        if (!vin) {
            return this.statics.textMap().errorMessages.noVin;
        }
        let data = await this.makeFordRequest('getSecuriAlertStatus', `https://api.mps.ford.com/api/guardmode/v1/${vin}/session`, 'GET', false);
        return data && data.session && data.session.gmStatus ? data.session.gmStatus : undefined;
        // console.log('getSecuriAlertStatus: ' + JSON.stringify(data));
    }

    async queryFordPassPrefs(force = false) {
        try {
            let dtNow = Date.now();
            let lastDt = await this.kc.getKeychainValue('fpLastPrefsQueryTs');
            let ok2Upd = lastDt && dtNow - Number(lastDt) > 1000 * 60 * 5;
            // console.log(`Last prefs query: ${lastDt} | Now: ${dtNow} | Diff: ${dtNow - Number(lastDt)} | Ok2Upd: ${ok2Upd}`);
            if (ok2Upd || lastDt === null || force) {
                await this.kc.setKeychainValue('fpLastPrefsQueryTs', dtNow.toString());
                console.log(ok2Upd ? `UserPrefs Expired - Refreshing from Ford API` : `UserPrefs Requested or Missing - Refreshing from Ford API`);

                let data = await this.makeFordRequest('queryFordPassPrefs', `https://api.mps.ford.com/api/users`, 'GET', false);
                // console.log('user data: ' + JSON.stringify(data));
                if (data && data.status === 200 && data.profile) {
                    try {
                        await this.kc.setKeychainValue('fpCountry', data.profile.country ? data.profile.country : 'USA');
                        await this.kc.setKeychainValue('fpLanguage', data.profile.preferredLanguage || Device.locale());
                        await this.kc.setKeychainValue('fpTz', data.profile.timeZone || CalendarEvent.timeZone);
                        await this.kc.setKeychainValue('fpDistanceUnits', data.profile.uomDistance === 2 ? 'km' : 'mi');
                        await this.kc.setKeychainValue('fpPressureUnits', data.profile.uomPressure ? data.profile.uomPressure : 'MPH');
                        console.log(`Saving User Preferences from Ford Account:`);
                        console.log(` - Country: ${data.profile.country ? data.profile.country : 'USA (Fallback)'}`);
                        console.log(` - Language: ${data.profile.preferredLanguage ? data.profile.preferredLanguage : Device.locale() + ' (Fallback)'}`);
                        console.log(` - DistanceUnit: ${data.profile.uomDistance === 2 ? 'km' : 'mi'}`);
                        console.log(` - PressureUnit: ${data.profile.uomPressure !== undefined && data.profile.uomPressure !== '' ? data.profile.uomPressure : 'PSI (Fallback)'}`);
                        return true;
                    } catch (e) {
                        console.log(`queryFordPassPrefs SET Error: ${e}`);
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return true;
            }
        } catch (e) {
            console.error(`queryFordPassPrefs Error: ${e}`);
            return false;
        }
    }

    // NOT WORKING YET (CORS ISSUE)
    async getEarlyAccessInfo() {
        const token = await this.kc.getKeychainValue('fpToken2');
        const vin = await this.kc.getKeychainValue('fpVin');
        let request = new Request(`https://fsm-service-fordbeta-prod.apps.pd01.useast.cf.ford.com/api/earlyAccess/eapMemberInfo`);
        request.headers = {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.48 Safari/537.36 Edg/98.0.1108.23',
            'Application-Id': '515d7c8a-8f55-49e9-991c-1800f5c20983',
            // Origin: 'https://www.earlyaccess.ford.com/',
            // Referer: 'https://www.earlyaccess.ford.com/',
            'auth-token': `${token}`,
        };
        request.method = 'GET';
        request.timeoutInterval = 20;
        let data = await request.loadString();

        console.log('getEarlyAccessInfo: ' + JSON.stringify(data));
    }

    async getAllUserData() {
        let data = await this.makeFordRequest('setUserPrefs', `https://api.mps.ford.com/api/users`, 'GET', false);
        // console.log('user data: ' + JSON.stringify(data));
        if (data && data.status === 200 && data.profile) {
            return data;
        }
        return undefined;
    }

    async makeFordRequest(desc, url, method, json = false, headerOverride = undefined, body = undefined) {
        let authMsg = await this.checkAuth('makeFordRequest(' + desc + ')');
        if (authMsg) {
            return authMsg;
        }
        let token = await this.kc.getKeychainValue('fpToken2');
        let vin = await this.kc.getKeychainValue('fpVin');
        if (!vin) {
            return this.statics.textMap().errorMessages.noVin;
        }
        const headers = headerOverride || {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
            'Application-Id': this.appIDs().NA,
            'auth-token': `${token}`,
        };

        let request = new Request(url);
        request.headers = headers;
        request.method = method;
        request.timeoutInterval = 20;
        if (body) {
            request.body = JSON.stringify(body);
        }
        try {
            let data = json ? await request.loadJSON() : await request.loadString();
            let resp = request.response;
            if (this.widgetConfig.debugMode) {
                console.log(`makeFordRequest Req | Status: ${resp.statusCode}) | Resp: ${data}`);
            }
            if (data == this.statics.textMap().errorMessages.accessDenied) {
                console.log(`makeFordRequest(${desc}): Auth Token Expired. Fetching New Token and Requesting Data Again!`);
                let result = await this.fetchToken();
                if (result && result == this.statics.textMap().errorMessages.invalidGrant) {
                    return result;
                }
                data = await this.makeFordRequest(desc, url, method, json, body);
            } else {
                data = json ? data : JSON.parse(data);
            }
            if (data.statusCode && data.statusCode !== 200) {
                return this.statics.textMap().errorMessages.connectionErrorOrVin;
            }
            return data;
        } catch (e) {
            console.log(`makeFordRequest | ${desc} | Error: ${e}`);
            return this.statics.textMap().errorMessages.unknownError;
        }
    }

    //from local store if last fetch is < x minutes, otherwise fetch from server
    async fetchVehicleData(loadLocal = false) {
        //Fetch data from local store
        if ((!this.widgetConfig.alwaysFetch && (await this.files.isLocalDataFreshEnough())) || loadLocal) {
            return await this.files.readLocalData();
        }

        //fetch data from server
        console.log('Fetching Vehicle Data from Ford Servers...');
        let statusData = await this.getVehicleStatus();

        // console.log(`statusData: ${JSON.stringify(statusData)}`);
        let vehicleData = new Object();
        vehicleData.SCRIPT_VERSION = this.SCRIPT_VERSION;
        vehicleData.SCRIPT_TS = this.SCRIPT_TS;
        if (statusData == this.statics.textMap().errorMessages.invalidGrant || statusData == this.statics.textMap().errorMessages.connectionErrorOrVin || statusData == this.statics.textMap().errorMessages.unknownError || statusData == this.statics.textMap().errorMessages.noVin || statusData == this.statics.textMap().errorMessages.noCredentials) {
            // console.log('fetchVehicleData | Error: ' + statusData);
            let localData = this.files.readLocalData();
            if (localData) {
                vehicleData = localData;
            }
            if (statusData == this.statics.textMap().errorMessages.invalidGrant) {
                console.log(`fetchVehicleData | Error: ${statusData} | Clearing Authentication from Keychain`);
                await this.kc.removeKeychainValue('fpPass');
                // await this.files.removeLocalData();
            }
            vehicleData.error = statusData;
            return vehicleData;
        }
        vehicleData.rawStatus = statusData;
        if (this.widgetConfig.logVehicleData) {
            console.log(`Status: ${JSON.stringify(statusData)}`);
        }

        // Pulls in info about the vehicle like brand, model, year, etc. (Used to help with getting vehicle image and name for the map)
        let infoData = await this.getVehicleInfo();
        // console.log(`infoData: ${JSON.stringify(infoData)}`);
        vehicleData.info = infoData;
        if (this.widgetConfig.logVehicleData) {
            console.log(`Info: ${JSON.stringify(infoData)}`);
        }

        // Pulls in a list of the vehicles capabilities like zone lighting, remote start, etc.
        let capData = await this.getVehicleCapabilities();
        // console.log(`capData: ${JSON.stringify(capData)}`);
        vehicleData.capabilities = capData;
        if (this.widgetConfig.logVehicleData) {
            console.log(`Capabilities: ${JSON.stringify(capData)}`);
        }

        vehicleData.messages = await this.getUserMessages();
        // console.log(`messagesData: ${JSON.stringify(vehicleData.messages)}`);

        vehicleData.alerts = await this.getVehicleAlerts();
        // console.log(`alerts: ${JSON.stringify(vehicleData.alerts)}`);

        let vehicleStatus = statusData.vehiclestatus;

        vehicleData.fetchTime = Date.now();

        //ev details
        vehicleData.evVehicle = vehicleData.capabilities.includes('EV_FUEL') || (vehicleStatus && vehicleStatus.batteryFillLevel && vehicleStatus.batteryFillLevel.value !== null);
        if (vehicleData.evVehicle) {
            vehicleData.evBatteryLevel = vehicleStatus.batteryFillLevel && vehicleStatus.batteryFillLevel.value ? Math.floor(vehicleStatus.batteryFillLevel.value) : null;
            vehicleData.evDistanceToEmpty = vehicleStatus.elVehDTE && vehicleStatus.elVehDTE.value ? vehicleStatus.elVehDTE.value : null;
            vehicleData.evChargeStatus = vehicleStatus.chargingStatus && vehicleStatus.chargingStatus.value ? vehicleStatus.chargingStatus.value : null;
            vehicleData.evPlugStatus = vehicleStatus.plugStatus && vehicleStatus.plugStatus.value ? vehicleStatus.plugStatus.value : null;
            vehicleData.evChargeStartTime = vehicleStatus.chargeStartTime && vehicleStatus.chargeStartTime.value ? vehicleStatus.chargeStartTime.value : null;
            vehicleData.evChargeStopTime = vehicleStatus.chargeEndTime && vehicleStatus.chargeEndTime.value ? vehicleStatus.chargeEndTime.value : null;

            // Gets the EV Charge Status from additional endpoint
            vehicleData.evChargeStatus2 = await this.getEvChargeStatus();
            // Gets EV Plug Status from special endpoint
            vehicleData.evPlugStatus2 = await this.getEvPlugStatus();
            // Get EV Charger Balance from special endpoint
            vehicleData.evChargerBalance = await this.getEvChargerBalance();
        }

        //odometer
        vehicleData.odometer = vehicleStatus.odometer && vehicleStatus.odometer.value ? vehicleStatus.odometer.value : undefined;

        //oil life
        vehicleData.oilLow = vehicleStatus.oil && vehicleStatus.oil.oilLife === 'STATUS_LOW';
        vehicleData.oilLife = vehicleStatus.oil && vehicleStatus.oil.oilLifeActual ? vehicleStatus.oil.oilLifeActual : null;

        //door lock status
        vehicleData.lockStatus = vehicleStatus.lockStatus && vehicleStatus.lockStatus.value ? vehicleStatus.lockStatus.value : undefined;

        //ignition status
        vehicleData.ignitionStatus = vehicleStatus.ignitionStatus ? vehicleStatus.ignitionStatus.value : 'Off';

        //zone-lighting status
        if (vehicleData.capabilities.includes('ZONE_LIGHTING_FOUR_ZONES') || vehicleData.capabilities.includes('ZONE_LIGHTING_TWO_ZONES')) {
            vehicleData.zoneLightingSupported = vehicleStatus.zoneLighting && vehicleStatus.zoneLighting.activationData && vehicleStatus.zoneLighting.activationData.value === undefined ? false : true;
            vehicleData.zoneLightingStatus = vehicleStatus.zoneLighting && vehicleStatus.zoneLighting.activationData && vehicleStatus.zoneLighting.activationData.value ? vehicleStatus.zoneLighting.activationData.value : 'Off';
        }

        // trailer light check status
        if (vehicleData.capabilities.includes('TRAILER_LIGHT')) {
            vehicleData.trailerLightCheckStatus = vehicleStatus.trailerLightCheck && vehicleStatus.trailerLightCheck.trailerLightCheckStatus && vehicleStatus.trailerLightCheck.trailerLightCheckStatus.value ? (vehicleStatus.trailerLightCheck.trailerLightCheckStatus.value === 'LIGHT_CHECK_STOPPED' ? 'Off' : 'On') : undefined;
        }

        // Remote Start status
        vehicleData.remoteStartStatus = {
            running: vehicleStatus.remoteStartStatus ? (vehicleStatus.remoteStartStatus.value === 0 ? false : true) : false,
            runningTs: vehicleStatus.remoteStartStatus ? vehicleStatus.remoteStartStatus.timestamp : undefined,
            runtime: vehicleStatus.remoteStart && vehicleStatus.remoteStart.remoteStartDuration ? vehicleStatus.remoteStart.remoteStartDuration : 0,
            runtimeLeft: vehicleStatus.remoteStart && vehicleStatus.remoteStart.remoteStartTime ? vehicleStatus.remoteStart.remoteStartTime : undefined,
        };
        // console.log(`Remote Start Status: ${JSON.stringify(vehicleStatus.remoteStart)}`);

        // Alarm status
        vehicleData.alarmStatus = vehicleStatus.alarm ? (vehicleStatus.alarm.value === 'SET' ? 'On' : 'Off') : 'Off';

        //Battery info
        vehicleData.batteryStatus = vehicleStatus.battery && vehicleStatus.battery.batteryHealth ? vehicleStatus.battery.batteryHealth.value : this.statics.textMap().UIValues.unknown;
        vehicleData.batteryLevel = vehicleStatus.battery && vehicleStatus.battery.batteryStatusActual ? vehicleStatus.battery.batteryStatusActual.value : undefined;

        // Whether Vehicle is in deep sleep mode (Battery Saver) | Supported Vehicles Only
        vehicleData.deepSleepMode = vehicleStatus.deepSleepInProgress && vehicleStatus.deepSleepInProgress.value ? vehicleStatus.deepSleepInProgress.value === true : false;

        // Whether Vehicle is currently installing and OTA update (OTA) | Supported Vehicles Only
        vehicleData.firmwareUpdating = vehicleStatus.firmwareUpgInProgress && vehicleStatus.firmwareUpgInProgress.value ? vehicleStatus.firmwareUpgInProgress.value === true : false;

        //distance to empty
        vehicleData.distanceToEmpty = vehicleStatus.fuel && vehicleStatus.fuel.distanceToEmpty ? vehicleStatus.fuel.distanceToEmpty : null;

        //fuel level
        vehicleData.fuelLevel = vehicleStatus.fuel && vehicleStatus.fuel.fuelLevel ? Math.floor(vehicleStatus.fuel.fuelLevel) : null;

        //position of car
        vehicleData.position = await this.utils.getPosition(vehicleStatus);
        vehicleData.latitude = parseFloat(vehicleStatus.gps.latitude);
        vehicleData.longitude = parseFloat(vehicleStatus.gps.longitude);

        // true means, that window is open
        let windows = vehicleStatus.windowPosition;
        //console.log("windows:", JSON.stringify(windows));
        vehicleData.statusWindows = {
            driverFront: windows && windows.driverWindowPosition ? !['Fully_Closed', 'Fully closed position', 'Undefined window position', 'Undefined'].includes(windows.driverWindowPosition.value) : false,
            passFront: windows && windows.passWindowPosition ? !['Fully_Closed', 'Fully closed position', 'Undefined window position', 'Undefined'].includes(windows.passWindowPosition.value) : false,
            driverRear: windows && windows.rearDriverWindowPos ? !['Fully_Closed', 'Fully closed position', 'Undefined window position', 'Undefined'].includes(windows.rearDriverWindowPos.value) : false,
            rightRear: windows && windows.rearPassWindowPos ? !['Fully_Closed', 'Fully closed position', 'Undefined window position', 'Undefined'].includes(windows.rearPassWindowPos.value) : false,
        };

        //true means, that door is open
        let doors = vehicleStatus.doorStatus;
        vehicleData.statusDoors = {
            driverFront: !(doors.driverDoor && doors.driverDoor.value == 'Closed'),
            passFront: !(doors.passengerDoor && doors.passengerDoor.value == 'Closed'),
        };
        if (doors.leftRearDoor && doors.leftRearDoor.value !== undefined) {
            vehicleData.statusDoors.leftRear = !(doors.leftRearDoor.value == 'Closed');
        }
        if (doors.rightRearDoor && doors.rightRearDoor.value !== undefined) {
            vehicleData.statusDoors.rightRear = !(doors.rightRearDoor.value == 'Closed');
        }
        if (doors.hoodDoor && doors.hoodDoor.value !== undefined) {
            vehicleData.statusDoors.hood = !(doors.hoodDoor.value == 'Closed');
        }
        if (doors.tailgateDoor && doors.tailgateDoor.value !== undefined) {
            vehicleData.statusDoors.tailgate = !(doors.tailgateDoor.value == 'Closed');
        }
        if (doors.innerTailgateDoor && doors.innerTailgateDoor.value !== undefined) {
            vehicleData.statusDoors.innerTailgate = !(doors.innerTailgateDoor.value == 'Closed');
        }

        //tire pressure
        let tpms = vehicleStatus.TPMS;
        vehicleData.tirePressure = {
            leftFront: await this.utils.pressureToFixed(tpms.leftFrontTirePressure.value, 0),
            rightFront: await this.utils.pressureToFixed(tpms.rightFrontTirePressure.value, 0),
            leftRear: await this.utils.pressureToFixed(tpms.outerLeftRearTirePressure.value, 0),
            rightRear: await this.utils.pressureToFixed(tpms.outerRightRearTirePressure.value, 0),
        };

        vehicleData.recallInfo = (await this.getVehicleRecalls()) || [];
        // console.log(`Recall Info: ${JSON.stringify(vehicleData.recallInfo)}`);

        vehicleData.fordpassRewardsInfo = await this.getFordpassRewardsInfo();
        // console.log(`Fordpass Rewards Info: ${JSON.stringify(vehicleData.fordpassRewardsInfo)}`);

        // vehicleData.earlyAccessProgramInfo = await this.getEarlyAccessInfo();

        vehicleData.lastRefresh = this.utils.convertFordDtToLocal(vehicleStatus.lastRefresh.includes('01-01-2018') ? vehicleStatus.lastModifiedDate : vehicleStatus.lastRefresh);
        vehicleData.lastRefreshElapsed = this.utils.timeDifference(this.utils.convertFordDtToLocal(vehicleStatus.lastRefresh.includes('01-01-2018') ? vehicleStatus.lastModifiedDate : vehicleStatus.lastRefresh));
        // console.log(`lastRefresh | raw: ${vehicleStatus.lastRefresh.includes('01-01-2018') ? vehicleStatus.lastModifiedDate : vehicleStatus.lastRefresh} | conv: ${vehicleData.lastRefresh.toLocaleString()}`);
        console.log(`Last Vehicle Checkin: ${vehicleData.lastRefreshElapsed}`);

        //save data to local store
        this.files.saveDataToLocal(vehicleData);
        // console.log(JSON.stringify(vehicleData));
        return vehicleData;
    }
};
module.exports = class FPW_FordAPIs {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.SCRIPT_VERSION = FPW.SCRIPT_VERSION;
        this.widgetConfig = FPW.widgetConfig;
    }

    getModuleVer() {
        return '2022.05.25.0';
    }

    appIDs() {
        return {
            UK_Europe: '1E8C7794-FF5F-49BC-9596-A1E0C86C5B19',
            Australia: '5C80A6BB-CF0D-4A30-BDBF-FC804B5C1A98',
            NA: '71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592',
            Web: 'b08429de-8440-478d-a323-7a1e05cc9844',
        };
    }

    async getAppID() {
        const appIds = this.appIDs();
        const region = await this.FPW.getRegion();
        const id = appIds[region] ? appIds[region] : appIds.NA;
        // console.log(`getAppID() | Region: ${region} | ID: ${id}`);
        return id;
    }

    async checkAuth(src = undefined) {
        const token = await this.FPW.getSettingVal('fpToken');
        const legacyToken = await this.FPW.getSettingVal('fpToken2');
        const expiresAt = await this.FPW.getSettingVal('fpTokenExpiresAt');
        const expired = expiresAt ? Date.now() >= Date.parse(expiresAt) : false;
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
        } else if (legacyToken || token === null || token === undefined || token === '' || expiresAt === null || expiresAt === undefined || expiresAt === '') {
            if (legacyToken) {
                console.log('Legacy Token found... Clearing and Forcing Fetch...');
                await this.clearTokenCache();
                await this.FPW.Files.removeFile('fp_vehicleData.json');
            } else {
                console.log('Token or Expiration State is Missing... Fetching Token...');
            }
            tok = await this.fetchToken();
        }
        if ((tok || refresh) && (tok == this.FPW.textMap().errorMessages.invalidGrant || tok == this.FPW.textMap().errorMessages.noCredentials || refresh == this.FPW.textMap().errorMessages.invalidGrant || refresh == this.FPW.textMap().errorMessages.noCredentials)) {
            return tok;
        } else {
            return undefined;
        }
    }

    async collectAllData(scrub = false) {
        let data = await this.fetchVehicleData(true);
        data.otaInfo = await this.getVehicleOtaInfo();
        data.userPrefs = {
            country: await this.FPW.getSettingVal('fpCountry'),
            timeZone: await this.FPW.getSettingVal('fpTz'),
            language: await this.FPW.getSettingVal('fpLanguage'),
            unitOfDistance: await this.FPW.getSettingVal('fpDistanceUnits'),
            unitOfPressure: await this.FPW.getSettingVal('fpPressureUnits'),
        };
        // data.userDetails = await FPW.FordAPI.getAllUserData();
        return scrub ? this.FPW.scrubPersonalData(data) : data;
    }

    async fetchToken() {
        // console.log('Fetching Token...');
        let username = await this.FPW.getSettingVal('fpUser');
        if (!username) {
            return this.FPW.textMap().errorMessages.noCredentials;
        }
        let password = await this.FPW.getSettingVal('fpPass');
        if (!password) {
            return this.FPW.textMap().errorMessages.noCredentials;
        }
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1333.0.4 Darwin/21.5.0',
            'Accept-Encoding': 'gzip, deflate, br',
            authorization: 'Basic ZWFpLWNsaWVudDo=',
        };

        try {
            let req1 = new Request('https://sso.ci.ford.com/oidc/endpoint/default/token');
            req1.headers = headers;
            req1.method = 'POST';
            req1.body = `client_id=9fb503e0-715b-47e8-adfd-ad4b7770f73b&grant_type=password&username=${username}&password=${encodeURIComponent(password)}`;
            req1.timeoutInterval = 15;

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
                return this.FPW.textMap().errorMessages.invalidGrant;
            }
            if (resp1.statusCode === 200) {
                let req2 = new Request(`https://api.mps.ford.com/api/token/v2/cat-with-ci-access-token`);
                headers['content-type'] = 'application/json';
                headers['application-id'] = await this.getAppID();
                req2.headers = headers;
                req2.method = 'POST';
                req2.body = JSON.stringify({ ciToken: token1.access_token });
                req2.timeoutInterval = 15;

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
                    return this.FPW.textMap().errorMessages.invalidGrant;
                }
                if (resp2.statusCode === 200) {
                    await this.FPW.setSettingVal('fpToken', token2.access_token);
                    await this.FPW.setSettingVal('fpRefreshToken', token2.refresh_token);
                    await this.FPW.setSettingVal('fpFordConsumerId', token2.ford_consumer_id);
                    await this.FPW.setSettingVal('fpTokenExpiresAt', (Date.now() + token2.expires_in).toString());
                    // let token = await this.FPW.getSettingVal('fpToken');
                    // console.log(`------- New Token Set: ${token} -------`);
                    // let expiresAt = await this.FPW.getSettingVal('fpTokenExpiresAt');
                    // console.log(`expiresAt: ${expiresAt}`);
                    return;
                }
            }
        } catch (e) {
            await this.FPW.logInfo(`fetchToken() Error: ${e}`, true);
            if (e.error && e.error == 'invalid_grant') {
                return this.FPW.textMap().errorMessages.invalidGrant;
            }
            throw e;
        }
    }

    async refreshToken() {
        // console.log('Refreshing Token...');
        try {
            const refreshToken = await this.FPW.getSettingVal('fpRefreshToken');
            let req = new Request(`https://api.mps.ford.com/api/token/v2/cat-with-refresh-token`);
            req.headers = {
                Accept: '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'FordPass/5 CFNetwork/1333.0.4 Darwin/21.5.0',
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                'Application-Id': await this.getAppID(),
            };
            req.timeoutInterval = 15;
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
                return this.FPW.textMap().errorMessages.invalidGrant;
            }
            if (resp.statusCode === 200) {
                await this.FPW.setSettingVal('fpToken', token.access_token);
                await this.FPW.setSettingVal('fpRefreshToken', token.refresh_token);
                await this.FPW.setSettingVal('fpFordConsumerId', token.ford_consumer_id);
                await this.FPW.setSettingVal('fpTokenExpiresAt', (Date.now() + token.expires_in).toString());
                // console.log(`expiresAt: ${expiresAt}`);
                return;
            } else if (resp.statusCode === 401) {
                await this.fetchToken();
            }
        } catch (e) {
            await this.FPW.logInfo(`refreshToken() Error: ${e}`, true);
            if (e.error && e.error == 'invalid_grant') {
                return this.FPW.textMap().errorMessages.invalidGrant;
            }
            throw e;
        }
    }

    async clearTokenCache() {
        const keys = ['fpToken', 'fpToken2', 'fpRefreshToken', 'fpFordConsumerId', 'fpTokenExpiresAt'];
        for (const key of keys) {
            await this.FPW.removeSettingVal(key);
        }
    }

    async getVehicleStatus() {
        const vin = await this.FPW.getSettingVal('fpVin');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        return await this.makeFordRequest('getVehicleStatus', `https://usapi.cv.ford.com/api/vehicles/v5/${vin}/status`, 'GET', false);
    }

    async getVehicleInfo() {
        const vin = await this.FPW.getSettingVal('fpVin');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        return await this.makeFordRequest('getVehicleInfo', `https://usapi.cv.ford.com/api/users/vehicles/${vin}/detail?lrdt=01-01-1970%2000:00:00`, 'GET', false);
    }

    async getUserMessages() {
        let data = await this.makeFordRequest('getUserMessages', `https://api.mps.ford.com/api/messagecenter/v3/messages`, 'GET', false);
        return data && data.result && data.result.messages && data.result.messages.length ? data.result.messages : [];
    }

    async getSyncVersion(brand) {
        const vin = await this.FPW.getSettingVal('fpVin');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        const token = await this.FPW.getSettingVal('fpToken');
        const lang = await this.FPW.getSettingVal('fpLanguage');
        const data = await this.makeFordRequest('getSyncVersion', `https://www.digitalservices.ford.com/owner/api/v2/sync/firmware-update?vin=${vin}&locale=${lang}&brand=${brand}`, 'POST', false, {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'auth-token': `${token}`,
            Referer: 'https://ford.com',
            Origin: 'https://ford.com',
        });
        // console.log(`getSyncVersion: ${JSON.stringify(data)}`);
        return data && data.sync && Object.keys(data.sync).length > 0 ? { syncVersion: data.sync.currentSyncVersion || undefined, lastUpdatedDate: data.sync.latestUpdateDate } : undefined;
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
        const vin = await this.FPW.getSettingVal('fpVin');
        const token = await this.FPW.getSettingVal('fpToken');
        const country = await this.FPW.getSettingVal('fpCountry');
        const lang = await this.FPW.getSettingVal('fpLanguage');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        let data = await this.makeFordRequest(
            'getVehicleAlerts',
            `https://api.mps.ford.com/api/expvehiclealerts/v2/details`,
            'POST',
            false, {
                'Content-Type': 'application/json',
                Accept: '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'FordPass/5 CFNetwork/1333.0.4 Darwin/21.5.0',
                'Application-Id': await this.getAppID(),
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

    async getAllVehicleDetails(tcuSupportOnly = false) {
        // console.log(`getAllVehicleDetails(${tcuSupportOnly})`);
        const vin = (await this.FPW.getSettingVal('fpVin')) || '';
        const token = await this.FPW.getSettingVal('fpToken');
        const country = await this.FPW.getSettingVal('fpCountry');
        const lang = await this.FPW.getSettingVal('fpLanguage');
        const data = await this.makeFordRequest(
            'getAllVehicleDetails',
            `https://api.mps.ford.com/api/expdashboard/v1/details`,
            'POST',
            false, {
                'Content-Type': 'application/json',
                Accept: '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'FordPass/5 CFNetwork/1333.0.4 Darwin/21.5.0',
                locale: lang,
                countryCode: country,
                'application-id': await this.getAppID(),
                'auth-token': token,
            }, {
                dashboardRefreshRequest: 'All',
                smsWakeUpVIN: vin,
            },
        );

        // console.log(JSON.stringify(data, null, 2));
        if (data && Object.keys(data).length > 0) {
            if (tcuSupportOnly) {
                // console.log(`vehicles: ${JSON.stringify(data.userVehicles.vehicleDetails, null, 2)}`);
                return data.userVehicles && data.userVehicles.vehicleDetails && data.userVehicles.vehicleDetails.length ? data.userVehicles.vehicleDetails.filter((v) => v.tcuEnabled === true).map((v) => v.VIN) : [];
            } else {
                const vehicle = data.userVehicles && data.userVehicles.vehicleDetails && data.userVehicles.vehicleDetails.length ? data.userVehicles.vehicleDetails.find((v) => v.VIN === vin) : undefined;
                const profile = data.vehicleProfile && data.vehicleProfile.length > 0 ? data.vehicleProfile.find((v) => v.VIN === vin) : undefined;
                let caps = data.vehicleCapabilities && data.vehicleCapabilities.length ? data.vehicleCapabilities.find((v) => v.VIN === vin) : undefined;
                let capsArr = [];
                if (caps && Object.keys(caps).length > 0) {
                    let nCaps = {};
                    for (let key in caps) {
                        if (caps[key] === 'NoDisplay') {
                            nCaps[key] = false;
                        } else if (caps[key] === 'Display') {
                            nCaps[key] = true;
                            capsArr.push(key);
                        } else {
                            if (nCaps[key] === 'On') {
                                capsArr.push(key);
                            }
                            nCaps[key] = caps[key];
                        }
                    }
                    caps = nCaps;
                }
                const out = {
                    nickName: vehicle && vehicle.nickName ? vehicle.nickName : undefined,
                    tcuEnabled: vehicle && vehicle.tcuEnabled ? vehicle.tcuEnabled : false,
                    profile: profile,
                    caps: caps,
                    capsArr: capsArr.sort(),
                };
                // console.log(`output: ${JSON.stringify(out, null, 2)}`);
                return out;
            }
        }
        return undefined;
    }

    async getVehicleOtaInfo() {
        const vin = await this.FPW.getSettingVal('fpVin');
        const token = await this.FPW.getSettingVal('fpToken');
        const country = await this.FPW.getSettingVal('fpCountry');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }

        return await this.makeFordRequest('getVehicleOtaInfo', `https://www.digitalservices.ford.com/owner/api/v2/ota/status?country=${country.toLowerCase()}&vin=${vin}`, 'GET', false, {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1333.0.4 Darwin/21.5.0',
            'Application-Id': await this.getAppID(),
            'auth-token': `${token}`,
            'Consumer-Key': `Z28tbmEtZm9yZA==`, // Base64 encoded version of "go-na-ford"
            Referer: 'https://ford.com',
            Origin: 'https://ford.com',
        });
    }

    async getVehiclesForUser() {
        try {
            const authMsg = await this.checkAuth(`getVehiclesForUser()`);
            if (authMsg) {
                return authMsg;
            }

            await this.queryFordPassPrefs(true);
            // const token = await this.FPW.getSettingVal('fpToken');
            const data = await this.makeFordRequest('getVehiclesForUser', `https://www.digitalservices.ford.com/fs/api/v2/profile`, 'GET', false, undefined);
            console.log(`userVehicles Count: (${data.value.vehicles.length})`);
            const supportedVehicles = await this.getAllVehicleDetails(true);
            console.log(`supportedVehicles: ${JSON.stringify(supportedVehicles, null, 2)}`);
            return data && data.value && data.value.vehicles && data.value.vehicles.length ? data.value.vehicles.filter((v) => supportedVehicles.includes(v.vin)) : [];
        } catch (e) {
            console.log(`getVehiclesForUser: ${e}`);
        }
    }

    async getVehicleManual() {
        let vin = await this.FPW.getSettingVal('fpVin');
        let token = await this.FPW.getSettingVal('fpToken');
        const country = await this.FPW.getSettingVal('fpCountry');
        let lang = await this.FPW.getSettingVal('fpLanguage');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        return await this.makeFordRequest('getVehicleManual', `https://api.mps.ford.com/api/ownersmanual/v1/manuals/${vin}?countryCode=${country}&language=${lang}`, 'GET', false, {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1333.0.4 Darwin/21.5.0',
            'Application-Id': await this.getAppID(),
            'auth-token': `${token}`,
            'Consumer-Key': `Z28tbmEtZm9yZA==`, // Base64 encoded version of "go-na-ford"
            Referer: 'https://ford.com',
            Origin: 'https://ford.com',
        });
    }

    async getVehicleRecalls() {
        const vin = await this.FPW.getSettingVal('fpVin');
        const token = await this.FPW.getSettingVal('fpToken');
        const country = await this.FPW.getSettingVal('fpCountry');
        let lang = await this.FPW.getSettingVal('fpLanguage');
        if (!lang) {
            await this.queryFordPassPrefs(true);
            lang = await this.FPW.getSettingVal('fpLanguage');
        }
        lang = lang.split('-');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        let data = await this.makeFordRequest('getVehicleRecalls', `https://api.mps.ford.com/api/recall/v2/recalls?vin=${vin}&language=${lang[0].toUpperCase()}&region=${lang[1].toUpperCase()}&country=${country}`, 'GET', false);
        // console.log('recalls: ' + JSON.stringify(data));
        return data && data.value ? data.value : undefined;
    }

    async getFordpassRewardsInfo(program = 'F') {
        const country = await this.FPW.getSettingVal('fpCountry');
        let data = await this.makeFordRequest('getFordpassRewardsInfo', `https://api.mps.ford.com/api/rewards-account-info/v1/customer/points/totals?rewardProgram=${program}&programCountry=${country}`, 'GET', false);
        // console.log('fordpass rewards: ' + JSON.stringify(data));
        return data && data.pointsTotals && data.pointsTotals.F ? data.pointsTotals.F : undefined;
    }

    async getEvChargeStatus() {
        const vin = await this.FPW.getSettingVal('fpVin');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        return await this.makeFordRequest('getEvChargeStatus', `https://api.mps.ford.com/api/cevs/v1/chargestatus/retrieve`, 'POST', false, undefined, { vin: vin });
    }

    async getEvPlugStatus() {
        const token = await this.FPW.getSettingVal('fpToken');
        const vin = await this.FPW.getSettingVal('fpVin');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        return await this.makeFordRequest('getEvPlugStatus', `https://api.mps.ford.com/api/vpoi/chargestations/v3/plugstatus`, 'GET', false, {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1333.0.4 Darwin/21.5.0',
            'Application-Id': await this.getAppID(),
            'auth-token': `${token}`,
            vin: vin,
        });
    }

    async getEvChargerBalance() {
        const vin = await this.FPW.getSettingVal('fpVin');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        let data = await this.makeFordRequest('getEvChargeBalance', `https://api.mps.ford.com/api/usage-management/v1/usage/balance`, 'POST', false, undefined, { vin: vin });
        return data && data.usageBalanceList ? data.usageBalanceList : [];
    }

    async getVehicleSubscriptions() {
        console.log('getVehicleSubscriptions');
        const lang = await this.FPW.getSettingVal('fpLanguage');
        const country = await this.FPW.getSettingVal('fpCountry');
        console.log(`lang: ${lang}`);
        const city = await this.FPW.getSettingVal('fpCity');
        const state = await this.FPW.getSettingVal('fpState');
        const zipCode = await this.FPW.getSettingVal('fpZipCode');
        let token = await this.FPW.getSettingVal('fpToken');
        const vin = await this.FPW.getSettingVal('fpVin');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        const data = await this.makeFordRequest(
            'getVehicleSubscriptions',
            'https://api.mps.ford.com/api/subscription-orchestration/v2/getSubscriptionSummaryByVin',
            'POST',
            true, {
                accept: 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                'Application-Id': this.appIDs().Web,
                'auth-token': `${token}`,
                Referer: 'https://www.subscriptions.ford.com',
                Origin: 'https://www.subscriptions.ford.com',
                //'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36 Edg/101.0.1210.32',
            }, { classification: 'FordPass', geoFilter: { countryCode: 'USA', state: 'MI', city: 'Ypsilanti', zipCode: '48197' }, language: 'en-US', vin: '1FTFW1E80MFA24380' },
        );

        console.log(data);
        return data;
        // return data && data.usageBalanceList ? data.usageBalanceList : [];
    }

    async getWarrantyInfo() {
        const vin = await this.FPW.getSettingVal('fpVin');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        const data = await this.makeFordRequest('getWarrantyInfo', `https://www.digitalservices.ford.com/owner/api/v2/vehicle/warranty?vin=${vin}`, 'GET', false, {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36 Edg/101.0.1210.32',
            'Consumer-Key': `Z28tbmEtZm9yZA==`, // Base64 encoded version of "go-na-ford"
            Referer: 'https://ford.com',
            Origin: 'https://ford.com',
        });
        // console.log('getWarrantyInfo: ' + JSON.stringify(data));
        return data && data.coverages && data.coverages.length > 0 ? data : undefined;
    }

    async getSecuriAlertStatus() {
        const vin = await this.FPW.getSettingVal('fpVin');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        let data = await this.makeFordRequest('getSecuriAlertStatus', `https://api.mps.ford.com/api/guardmode/v1/${vin}/session`, 'GET', false);
        return data && data.session && data.session.gmStatus ? data.session.gmStatus : undefined;
        // console.log('getSecuriAlertStatus: ' + JSON.stringify(data));
    }

    async queryFordPassPrefs(force = false) {
        try {
            const dtNow = Date.now();
            const lastDt = await this.FPW.getSettingVal('fpLastPrefsQueryTs');
            const ok2Upd = lastDt && dtNow - Number(lastDt) > 1000 * 60 * 5;
            // console.log(`Last prefs query: ${lastDt} | Now: ${dtNow} | Diff: ${dtNow - Number(lastDt)} | Ok2Upd: ${ok2Upd}`);
            if (ok2Upd || lastDt === null || force) {
                await this.FPW.setSettingVal('fpLastPrefsQueryTs', dtNow.toString());
                console.log(ok2Upd ? `UserPrefs Expired - Refreshing from Ford API` : `UserPrefs Requested or Missing - Refreshing from Ford API`);

                let data = await this.makeFordRequest('queryFordPassPrefs', `https://api.mps.ford.com/api/users`, 'GET', false);
                // console.log('user data: ' + JSON.stringify(data));
                if (data && data.status === 200 && data.profile) {
                    try {
                        await this.FPW.setSettingVal('fpCountry', data.profile.country ? data.profile.country : 'USA');
                        await this.FPW.setSettingVal('fpZipCode', data.profile.zip);
                        await this.FPW.setSettingVal('fpCity', data.profile.city);
                        await this.FPW.setSettingVal('fpState', data.profile.state);
                        await this.FPW.setSettingVal('fpLanguage', data.profile.preferredLanguage || Device.locale());
                        await this.FPW.setSettingVal('fpTz', data.profile.timeZone || CalendarEvent.timeZone);
                        await this.FPW.setSettingVal('fpDistanceUnits', data.profile.uomDistance === 2 ? 'km' : 'mi');
                        await this.FPW.setSettingVal('fpPressureUnits', data.profile.uomPressure ? data.profile.uomPressure : 'MPH');

                        console.log(`Saving User Preferences from Ford Account:`);
                        console.log(` - Country: ${data.profile.country ? data.profile.country : 'USA (Fallback)'}`);
                        console.log(` - City: ${data.profile.city}`);
                        console.log(` - State: ${data.profile.state}`);
                        console.log(` - ZipCode: ${data.profile.zip}`);
                        console.log(` - Country: ${data.profile.country ? data.profile.country : 'USA (Fallback)'}`);
                        console.log(` - Language: ${data.profile.preferredLanguage ? data.profile.preferredLanguage : Device.locale() + ' (Fallback)'}`);
                        console.log(` - DistanceUnit: ${data.profile.uomDistance === 2 ? 'km' : 'mi'}`);
                        console.log(` - PressureUnit: ${data.profile.uomPressure !== undefined && data.profile.uomPressure !== '' ? data.profile.uomPressure : 'PSI (Fallback)'}`);
                        return true;
                    } catch (e) {
                        console.log(`queryFordPassPrefs SET Error: ${e}`);
                        await this.FPW.logInfo(`queryFordPassPrefs() SET Error: ${e}`);
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return true;
            }
        } catch (e) {
            await this.FPW.logInfo(`queryFordPassPrefs() Error: ${e}`, true);
            return false;
        }
    }

    // NOT WORKING YET (CORS ISSUE)
    async getEarlyAccessInfo() {
        const token = await this.FPW.getSettingVal('fpToken');
        const vin = await this.FPW.getSettingVal('fpVin');
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
        const data = await this.makeFordRequest('setUserPrefs', `https://api.mps.ford.com/api/users`, 'GET', false);
        // console.log('user data: ' + JSON.stringify(data));
        if (data && data.status === 200 && data.profile) {
            return data;
        }
        return undefined;
    }

    async makeFordRequest(desc, url, method, json = false, headerOverride = undefined, body = undefined) {
        try {
            const authMsg = await this.checkAuth(`makeFordRequest(${desc})`);
            if (authMsg) {
                return authMsg;
            }
            const token = await this.FPW.getSettingVal('fpToken');
            const headers = headerOverride || {
                'Content-Type': 'application/json',
                Accept: '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'FordPass/5 CFNetwork/1333.0.4 Darwin/21.5.0',
                'Application-Id': await this.getAppID(),
                'auth-token': `${token}`,
                Referer: 'https://ford.com',
                Origin: 'https://ford.com',
            };

            let request = new Request(url);
            request.headers = headers;
            request.method = method;
            request.timeoutInterval = 20;
            if (body) {
                request.body = JSON.stringify(body);
                // console.log(`makeFordRequest body: ${JSON.stringify(request.body, null, 2)}`);
            }
            let data = json ? await request.loadJSON() : await request.loadString();
            let resp = request.response;
            if (this.widgetConfig.debugMode) {
                console.log(`makeFordRequest(${desc}) | Status: ${resp.statusCode}) | Resp: ${data}`);
            }
            // switch (desc) {
            //     case 'getVehiclesForUser':
            //     case 'getAllVehicleDetails':
            //         console.log(`makeFordRequest(${desc}) | Status: ${resp.statusCode}) | Resp: ${data}`);
            //         break;
            // }
            if (data == this.FPW.textMap().errorMessages.accessDenied) {
                console.log(`makeFordRequest(${desc}): Auth Token Expired. Fetching New Token and Requesting Data Again!`);
                let result = await this.fetchToken();
                if (result && result == this.FPW.textMap().errorMessages.invalidGrant) {
                    return result;
                }
                data = await this.makeFordRequest(desc, url, method, json, headerOverride, body);
            } else {
                data = json ? data : JSON.parse(data);
            }
            if (data.statusCode && (data.statusCode !== 200 || data.statusCode !== 207)) {
                return this.FPW.textMap().errorMessages.connectionErrorOrVin;
            }
            return data;
        } catch (e) {
            console.log(`makeFordRequest Error: ${e.message}`);
            await this.FPW.logInfo(`makeFordRequest(${desc}) Error: ${e}`, true);
            return this.FPW.textMap().errorMessages.unknownError;
        }
    }

    //from local store if last fetch is < x minutes, otherwise fetch from server
    async fetchVehicleData(loadLocal = false) {
        //Fetch data from local store
        // if ((!this.widgetConfig.alwaysFetch && (await this.FPW.Files.isLocalDataFreshEnough())) || loadLocal) {
        if (loadLocal) {
            let ld = await this.FPW.Files.readJsonFile('Vehicle Data');
            if (ld !== undefined || ld.info !== undefined || Object.keys(ld.info).length > 0) {
                return ld;
            }
        }

        //fetch data from server
        console.log(`Fetching Vehicle Data from Ford Servers...`);
        let statusData = await this.getVehicleStatus();

        // console.log(`statusData: ${JSON.stringify(statusData)}`);
        let vehicleData = new Object();
        vehicleData.SCRIPT_VERSION = this.SCRIPT_VERSION;
        // vehicleData.SCRIPT_TS = this.SCRIPT_TS;
        if (statusData == this.FPW.textMap().errorMessages.invalidGrant || statusData == this.FPW.textMap().errorMessages.connectionErrorOrVin || statusData == this.FPW.textMap().errorMessages.unknownError || statusData == this.FPW.textMap().errorMessages.noVin || statusData == this.FPW.textMap().errorMessages.noCredentials) {
            // console.log('fetchVehicleData | Error: ' + statusData);
            let localData = this.FPW.Files.readJsonFile('Vehicle Data');
            if (localData) {
                vehicleData = localData;
            }
            if (statusData == this.FPW.textMap().errorMessages.invalidGrant) {
                console.log(`fetchVehicleData | Error: ${statusData} | Clearing Authentication from Keychain`);
                await this.FPW.removeSettingVal('fpPass');
                // await this.FPW.Files.removeLocalData();
            }
            vehicleData.error = statusData;
            return vehicleData;
        }
        vehicleData.rawStatus = statusData.vehicleStatus;
        if (this.widgetConfig.logVehicleData) {
            console.log(`Status: ${JSON.stringify(statusData)}`);
        }

        // Pulls in info about the vehicle like brand, model, year, etc. (Used to help with getting vehicle image and name for the map)
        let infoData = await this.getVehicleInfo();
        // console.log(`infoData: ${JSON.stringify(infoData)}`);
        vehicleData.info = infoData.vehicle;
        if (this.widgetConfig.logVehicleData) {
            console.log(`Info: ${JSON.stringify(infoData)}`);
        }

        // Pulls in a list of the vehicles capabilities like zone lighting, remote start, etc.
        const vehicleDetails = await this.getAllVehicleDetails();
        // console.log(`vehicleDetails: ${JSON.stringify(vehicleDetails, null, 2)}`);

        vehicleData.details = vehicleDetails;
        vehicleData.capabilities = vehicleDetails.capsArr;
        if (this.widgetConfig.logVehicleData) {
            console.log(`Capabilities: ${JSON.stringify(vehicleData.capabilities, null, 2)}`);
        }

        if (vehicleData.capabilities.includes('guardMode')) {
            vehicleData.securiAlertStatus = await this.getSecuriAlertStatus();
            if (this.widgetConfig.logVehicleData) {
                console.log(`SecuriAlert Status: ${vehicleData.securiAlertStatus}`);
            }
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
        if (vehicleData.capabilities.includes('zoneLighting')) {
            vehicleData.zoneLightingSupported = vehicleStatus.zoneLighting && vehicleStatus.zoneLighting.activationData && vehicleStatus.zoneLighting.activationData.value === undefined ? false : true;
            vehicleData.zoneLightingStatus = vehicleStatus.zoneLighting && vehicleStatus.zoneLighting.activationData && vehicleStatus.zoneLighting.activationData.value ? vehicleStatus.zoneLighting.activationData.value : 'Off';
        }

        // trailer light check status
        if (vehicleData.capabilities.includes('trailerLightCheck')) {
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
        vehicleData.alarmStatus = vehicleStatus.alarm ? (vehicleStatus.alarm.value === 'SET' ? 'On' : 'Off') : undefined;

        //Battery info
        vehicleData.batteryStatus = vehicleStatus.battery && vehicleStatus.battery.batteryHealth ? vehicleStatus.battery.batteryHealth.value : this.FPW.textMap().UIValues.unknown;
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
        vehicleData.position = await this.FPW.getPosition(vehicleStatus);
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
            leftFront: tpms.leftFrontTirePressure ? await this.FPW.pressureToFixed(tpms.leftFrontTirePressure.value, 0) : undefined,
            rightFront: tpms.rightFrontTirePressure ? await this.FPW.pressureToFixed(tpms.rightFrontTirePressure.value, 0) : undefined,
            leftRear: tpms.outerLeftRearTirePressure ? await this.FPW.pressureToFixed(tpms.outerLeftRearTirePressure.value, 0) : undefined,
            rightRear: tpms.outerRightRearTirePressure ? await this.FPW.pressureToFixed(tpms.outerRightRearTirePressure.value, 0) : undefined,
            recommendedFront: tpms.recommendedFrontTirePressure && tpms.recommendedFrontTirePressure.value ? tpms.recommendedFrontTirePressure.value.toString() : undefined,
            recommendedRear: tpms.recommendedRearTirePressure && tpms.recommendedRearTirePressure.value ? tpms.recommendedRearTirePressure.value.toString() : undefined,
        };

        vehicleData.recallInfo = (await this.getVehicleRecalls()) || [];
        // console.log(`Recall Info: ${JSON.stringify(vehicleData.recallInfo)}`);

        vehicleData.fordpassRewardsInfo = await this.getFordpassRewardsInfo();
        // console.log(`Fordpass Rewards Info: ${JSON.stringify(vehicleData.fordpassRewardsInfo)}`);
        vehicleData.syncInfo = await this.getSyncVersion(vehicleData.info.brandCode);
        // console.log(`Sync Info: ${JSON.stringify(vehicleData.syncInfo)}`);

        // vehicleData.earlyAccessProgramInfo = await this.getEarlyAccessInfo();
        vehicleData.lastRefreshed = vehicleStatus.lastRefresh.includes('01-01-2018') ? vehicleStatus.lastModifiedDate : vehicleStatus.lastRefresh;
        // console.log(`lastRefreshed | raw: ${vehicleData.lastRefreshed} | conv: ${vehicleData.lastRefresh.toLocaleString()}`);
        console.log(`Last Vehicle Checkin: ${await this.FPW.getLastRefreshElapsedString(vehicleData)}`);

        if (this.widgetConfig.exportVehicleImagesToIcloud) {
            await this.FPW.Files.downloadAllVehicleImagesToIcloud(vehicleData);
        }

        // await this.getVehiclesForUser();

        // const subscriptions = await this.getVehicleSubscriptions();
        // console.log(`Subscriptions: ${JSON.stringify(subscriptions)}`);
        //save data to local store
        this.FPW.Files.saveJsonFile('Vehicle Data', vehicleData);
        // console.log(JSON.stringify(vehicleData));
        return vehicleData;
    }

    vehicleCmdConfigs = (vin, param2 = undefined) => {
        const baseUrl = 'https://usapi.cv.ford.com/api';
        const guardUrl = 'https://api.mps.ford.com/api';
        let cmds = {
            lock: {
                desc: 'Lock Doors',
                cmds: [{
                    uri: `${baseUrl}/vehicles/v5/${vin}/doors/lock`,
                    method: 'PUT',
                }, ],
            },
            unlock: {
                desc: 'Unlock Doors',
                cmds: [{
                    uri: `${baseUrl}/vehicles/v5/${vin}/doors/lock`,
                    method: 'DELETE',
                }, ],
            },
            start: {
                desc: 'Remote Start',
                cmds: [{
                    uri: `${baseUrl}/vehicles/v5/${vin}/engine/start`,
                    method: 'PUT',
                }, ],
            },
            stop: {
                desc: 'Remote Stop',
                cmds: [{
                    uri: `${baseUrl}/vehicles/v5/${vin}/engine/start`,
                    method: 'DELETE',
                }, ],
            },
            horn_and_lights: {
                desc: 'Horn & Lights On',
                cmds: [{
                    uri: `${baseUrl}/vehicles/v5/${vin}/panic/5`,
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
                    uri: `${baseUrl}/vehicles/v5/${vin}/status`,
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
        let authMsg = await this.checkAuth('sendVehicleCmd(' + cmd_type + ')');
        if (authMsg) {
            console.log(`sendVehicleCmd(${cmd_type}): ${result}`);
            return;
        }
        let token = await this.FPW.getSettingVal('fpToken');
        let vin = await this.FPW.getSettingVal('fpVin');
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
                'User-Agent': 'FordPass/5 CFNetwork/1333.0.4 Darwin/21.5.0',
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                'Application-Id': await this.getAppID(),
                'auth-token': `${token}`,
            };
            req.method = cmds[cmd].method;
            req.timeoutInterval = 15;

            try {
                let data = await req.loadString();
                let cmdResp = req.response;
                // console.log(data);
                if (data == 'Access Denied') {
                    console.log('sendVehicleCmd: Auth Token Expired. Fetching new token and fetch raw data again');
                    let result = await this.FPW.FordAPI.fetchToken();
                    if (result && result == this.FPW.textMap().errorMessages.invalidGrant) {
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
                        if (this.widgetConfig.debugMode) {
                            console.log('Debug: Error while sending vehicle cmd');
                            console.log(JSON.stringify(data));
                        }
                        if (cmdResp.statusCode === 590) {
                            console.log('code 590');
                            console.log(`isLastCmd: ${isLastCmd}`);
                            outMsg = { title: `${cmdDesc} Command`, message: this.FPW.textMap().errorMessages.cmd_err_590 };
                        } else {
                            errMsg = `Command Error: ${JSON.stringify(data)}`;
                            outMsg = { title: `${cmdDesc} Command`, message: `${this.FPW.textMap().errorMessages.cmd_err}\n\Error: ${cmdResp.statusCode}` };
                        }
                    } else {
                        console.log('sendVehicleCmd Response: ' + JSON.stringify(data));
                        outMsg = { title: `${cmdDesc} Command`, message: this.FPW.textMap().successMessages.cmd_success };
                    }
                }

                if (wasError) {
                    if (errMsg) {
                        console.log(`sendVehicleCmd(${cmd_type}) | Error: ${errMsg}`);
                        await this.FPW.logInfo(`sendVehicleCmd(${cmd_type}) | Error: ${errMsg}`, true);
                    }
                    if (outMsg.message !== '') {
                        await this.FPW.Alerts.showAlert(outMsg.title, outMsg.message);
                    }
                    return;
                } else {
                    if (isLastCmd) {
                        console.log(`sendVehicleCmd(${cmd_type}) | Sent Successfully`);
                        await this.FPW.Alerts.showAlert(outMsg.title, outMsg.message);
                        await this.FPW.Timers.scheduleMainPageRefresh('mainTableRefresh', 15000, false, true);
                    }
                }
            } catch (e) {
                await this.FPW.logInfo(`sendVehicleCmd() Catch Error: ${e}`, true);
                return;
            }
        }
        return;
    }
};
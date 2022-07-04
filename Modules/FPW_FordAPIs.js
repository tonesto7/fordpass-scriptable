module.exports = class FPW_FordAPIs {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.SCRIPT_VERSION = FPW.SCRIPT_VERSION;
        this.widgetConfig = FPW.widgetConfig;
        this.fpUserAgent = 'FordPass/5 CFNetwork/1378.1 Darwin/22.0.0';
        this.tokenRetryCnt = 0;
        this.isFetchingToken = false;
    }

    getModuleVer() {
        return '2022.07.04.0';
    }

    appIDs() {
        return {
            UK_Europe: '1E8C7794-FF5F-49BC-9596-A1E0C86C5B19',
            Australia: '5C80A6BB-CF0D-4A30-BDBF-FC804B5C1A98',
            NA: '71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592',
            Web: 'b08429de-8440-478d-a323-7a1e05cc9844',
        };
    }

    defaultHeaders = () => {
        return {
            'User-Agent': 'FordPass/5 CFNetwork/1333.0.4 Darwin/21.5.0',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
        };
    };

    async getCodeChallenge() {
        let request = new Request('https://fpw-pkce-svc.herokuapp.com/getchallenge');
        request.method = 'POST';
        request.headers = {
            'Content-Type': 'application/json',
        };
        const data = await request.loadJSON();
        return data;
    }

    getUrlParams(q) {
        let result = {};
        q.split('&').forEach(function (part) {
            var item = part.split('=');
            result[item[0]] = decodeURIComponent(item[1]);
        });
        return result;
    }

    findRegexMatch(regex, html) {
        const match = regex.exec(html);
        if (match) {
            return match[1];
        }
        return undefined;
    }

    async getAppID() {
        const appIds = this.appIDs();
        const region = await this.FPW.getRegion();
        const id = appIds[region] ? appIds[region] : appIds.NA;
        // console.log(`getAppID() | Region: ${region} | ID: ${id}`);
        return id;
    }

    async checkAuth(src = undefined) {
        // log('checkAuth() | src: ' + src);

        const noValue = (val) => {
            return val === null || val === undefined || val === '';
        };
        const token = await this.FPW.getSettingVal('fpToken');
        const refreshToken = await this.FPW.getSettingVal('fpRefreshToken');
        const expiresAt = await this.FPW.getSettingVal('fpTokenExpiresAt');
        const expired = noValue(expiresAt) === false ? Date.now() >= Date.parse(expiresAt) : false;
        const legacyToken = await this.FPW.getSettingVal('fpToken2');
        if (this.widgetConfig.debugMode) {
            console.log(`chechAuth(${src})`);
            console.log(`checkAuth | Token: ${token}`);
            console.log(`checkAuth | ExpiresAt: ${expiresAt}`);
            console.log(`checkAuth | Expired: ${expired}`);
        }
        let tok;
        let refresh;
        if (expired && refreshToken) {
            console.log('Token has expired... Refreshing Token...');
            refresh = await this.refreshToken();
        } else if (legacyToken || noValue(token) || noValue(expiresAt) || noValue(refreshToken)) {
            if (legacyToken) {
                console.log('Legacy Token found... Clearing and Forcing Fetch...');
                await this.clearTokenCache();
                await this.FPW.Files.removeFile('fp_vehicleData.json');
            } else {
                console.log('Token, RefreshToken, or Expiration State is Missing... Fetching NEW Token...');
            }
            tok = await this.fetchToken('checkAuth()');
        }
        if ((tok || refresh) && (tok == this.FPW.textMap().errorMessages.invalidGrant || tok == this.FPW.textMap().errorMessages.authFailed || tok == this.FPW.textMap().errorMessages.noCredentials || refresh == this.FPW.textMap().errorMessages.invalidGrant || refresh == this.FPW.textMap().errorMessages.noCredentials)) {
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

    async fetchJwtToken(src = undefined) {
        // console.log(`fetchJwtToken(${src})`);
        if (this.isFetchingToken) {
            console.log('fetchJwtToken() | Already fetching token...');
            return;
        }
        this.isFetchingToken = true;
        const that = this;
        const { code_challenge, code_verifier } = await this.getCodeChallenge();
        const redirect_uri = 'fordapp://userauthorized';
        const client_id = '9fb503e0-715b-47e8-adfd-ad4b7770f73b';
        // console.log(`fetchToken | code_challenge: ${code_challenge}`);
        // console.log(`fetchToken | code_verifier: ${code_verifier}`);

        const username = await this.FPW.getSettingVal('fpUser');
        if (!username) {
            return this.FPW.textMap().errorMessages.noCredentials;
        }
        const password = await this.FPW.getSettingVal('fpPass');
        if (!password) {
            return this.FPW.textMap().errorMessages.noCredentials;
        }

        async function clearCookies() {
            console.log('Clearing Session Cookies()');
            const wv = new WebView();
            // wv.present();
            await wv.loadURL(`https://www.ford.com/#$userSignOut`);
            await wv.waitForLoad();
            await wv.evaluateJavaScript(`(function(){document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";domain=." + location.host.split('.').slice(-2).join(".") +";path=/"); }); })();`);
            // console.log('clearCookies() | Success');
            return true;
        }

        async function auth_step1() {
            let nextUrl;
            let nextCookies;
            console.log('clearCookies: ' + (await clearCookies()));
            let request = new Request(`https://sso.ci.ford.com/v1.0/endpoint/default/authorize?redirect_uri=${redirect_uri}&client_id=${client_id}&response_type=code&state=&scope=openid&login_hint=%7B%22realm%22%20%3A%20%22cloudIdentityRealm%22%7D&code_challenge=${code_challenge}&code_challenge_method=S256`);
            request.method = 'GET';
            request.headers = {
                ...that.defaultHeaders(),
            };
            request.onRedirect = (req) => {
                // console.log(`fetchToken | Step 1 | Redirect: ${req.url}`);
                nextUrl = req.url;
            };
            try {
                const data = await request.load();
                const resp = request.response;
                // console.log(`statusCode1: ${resp.statusCode}`);
                // console.log('redireCnt1: ' + redirectCnt);
                // console.log(`resp1: ${JSON.stringify(resp, null, 2)}`);
                nextUrl = resp.headers['Location'];
                nextCookies = resp.headers['Set-Cookie'] ? resp.headers['Set-Cookie'] : resp.cookies;
                // console.log(`nextUrl1: ${nextUrl}`);
                // console.log('cookies1: ' + JSON.stringify(nextCookies));
                if (nextUrl && nextCookies) {
                    if (nextUrl.includes('code=') && nextUrl.includes('grant_id=')) {
                        const params = that.getUrlParams(nextUrl.split('?')[1]);
                        // console.log('params: ' + JSON.stringify(params));
                        const code = params['code'];
                        if (code) {
                            return await auth_step5(code, nextCookies);
                        }
                    }
                    if (nextUrl.includes('https://sso.ci.ford.com/idaas/mtfim/sps/idaas/login?client_id=')) {
                        return await auth_step2(nextUrl, nextCookies);
                    }
                }
                return that.FPW.textMap().errorMessages.authFailed;
            } catch (err) {
                console.log('auth_step1 | Error: ' + err.message);
                return that.FPW.textMap().errorMessages.authFailed;
            }
        }

        async function auth_step2(url, cookies) {
            let nextUrl;
            let nextCookies;
            let request = new Request(url);
            request.method = 'GET';
            request.headers = {
                ...that.defaultHeaders(),
                cookie: cookies,
            };
            request.onRedirect = function (req) {
                nextUrl = req.url;
            };
            try {
                const data = await request.load();
                const resp = await request.response;
                // console.log(`statusCode2: ${resp.statusCode}`);
                // console.log(`resp2: ${JSON.stringify(resp, null, 2)}`);
                nextUrl = resp.headers['Location'];
                nextCookies = resp.headers['Set-Cookie'] ? resp.headers['Set-Cookie'] : resp.cookies;
                // console.log(`nextUrl2: ${nextUrl}`);
                // console.log('cookies2: ' + JSON.stringify(nextCookies));
                if (nextUrl && nextUrl.includes('https://sso.ci.ford.com/authsvc/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&identity_source_id=') && nextCookies) {
                    return await auth_step3(nextUrl, nextCookies);
                }
            } catch (err) {
                console.log('auth_step2 | Error: ' + err.message);
                return that.FPW.textMap().errorMessages.authFailed;
            }
        }

        async function auth_step3(url, cookies) {
            let nextUrl;
            let nextCookies;
            let request = new Request(url);
            request.method = 'POST';
            request.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...that.defaultHeaders(),
                cookie: cookies,
            };
            request.onRedirect = function (req) {
                nextUrl = req.url;
                // return null;
            };

            request.body = `operation=verify&login-form-type=pwd&username=${username}&password=${password}`;
            try {
                await request.load();
                const resp = await request.response;
                // console.log(`statusCode3: ${resp.statusCode}`);
                // console.log(`resp: ${JSON.stringify(resp, null, 2)}`);
                nextCookies = resp.headers['Set-Cookie'] ? resp.headers['Set-Cookie'] : resp.cookies;
                // console.log(`nextUrl3: ${nextUrl}`);
                // console.log('cookies3: ' + JSON.stringify(nextCookies));
                if (nextUrl && nextUrl.includes('https://sso.ci.ford.com/oidc/endpoint/default/authorize?qsId=') && nextCookies) {
                    return await auth_step4(nextUrl, nextCookies);
                }
                return that.FPW.textMap().errorMessages.authFailed;
            } catch (err) {
                console.log('auth_step3 | Error: ' + err.message);
                await that.FPW.logInfo(`auth_step3() Error: ${err.message}`, true);
                return that.FPW.textMap().errorMessages.authFailed;
            }
        }

        async function auth_step4(url, cookies) {
            let nextUrl;
            let nextCookies;
            let request = new Request(url);
            request.method = 'GET';
            request.headers = {
                ...that.defaultHeaders(),
                cookie: cookies,
            };
            request.onRedirect = function (req) {
                nextUrl = req.url;
                // return null;
            };

            try {
                await request.load();
                const resp = await request.response;
                // console.log(`statusCode4: ${resp.statusCode}`);
                // console.log(`resp: ${JSON.stringify(resp, null, 2)}`);
                nextUrl = resp.headers['Location'];
                // console.log(`nextUrl4: ${nextUrl}`);
                const params = that.getUrlParams(nextUrl.split('?')[1]);
                // console.log('params: ' + JSON.stringify(params));
                const code = params['code'];
                const grantId = params['grant_id'];
                if (code) {
                    return await auth_step5(code, grantId);
                }
                return that.FPW.textMap().errorMessages.authFailed;
            } catch (err) {
                console.log('auth_step4 | Error: ' + err.message);
                await that.FPW.logInfo(`auth_step4() Error: ${err.message}`, true);
                return that.FPW.textMap().errorMessages.authFailed;
            }
        }

        async function auth_step5(code, grantId) {
            // console.log('auth_step5');
            let request = new Request('https://sso.ci.ford.com/oidc/endpoint/default/token');
            request.method = 'POST';
            request.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...that.defaultHeaders(),
            };
            request.body = `grant_type=authorization_code&code=${code}&grant_id=${grantId}&code_verifier=${code_verifier}&scope=openid&redirect_uri=${redirect_uri}&client_id=${client_id}&resource=`;

            try {
                let data = await request.loadJSON();
                // console.log(`auth_step5 data: ${JSON.stringify(data, null, 2)}`);
                const resp = await request.response;
                // console.log(`statusCode5: ${resp.statusCode}`);
                // console.log(`resp: ${JSON.stringify(resp, null, 2)}`);
                if (resp.statusCode === 200 && data.access_token) {
                    // console.log(`access_token: ${data.access_token}`);
                    return data.access_token;
                }
                return that.FPW.textMap().errorMessages.authFailed;
            } catch (err) {
                await that.FPW.logInfo(`auth_step5() Error: ${err.message}`, true);
                return that.FPW.textMap().errorMessages.authFailed;
            }
        }

        const result = await auth_step1();
        this.isFetchingToken = false;
        return result;
    }

    async fetchToken() {
        // console.log('Fetching Token...');
        if (this.tokenRetryCnt > 2) {
            this.tokenRetryCnt = 0;
            log('fetchToken() | Too many retries');
            return 'Error: Too many token retries';
        }
        this.tokenRetryCnt++;
        let username = await this.FPW.getSettingVal('fpUser');
        if (!username) {
            return this.FPW.textMap().errorMessages.noCredentials;
        }
        let password = await this.FPW.getSettingVal('fpPass');
        if (!password) {
            return this.FPW.textMap().errorMessages.noCredentials;
        }
        const jwtToken = await this.fetchJwtToken('fetchToken');
        // console.log(`jwt_token: ${jwtToken}`);

        if (jwtToken) {
            try {
                let req = new Request(`https://api.mps.ford.com/api/token/v2/cat-with-ci-access-token`);
                req.headers = {
                    'Content-Type': 'application/json',
                    Accept: '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'User-Agent': 'FordPass/5 CFNetwork/1333.0.4 Darwin/21.5.0',
                    'Accept-Encoding': 'gzip, deflate, br',
                    authorization: 'Basic ZWFpLWNsaWVudDo=',
                    'application-id': await this.getAppID(),
                };
                req.method = 'POST';
                req.body = JSON.stringify({ ciToken: jwtToken });
                req.timeoutInterval = 15;

                const token = await req.loadJSON();
                const resp = req.response;
                if (this.widgetConfig.debugAuthMode) {
                    console.log(`Token Req | Status: ${resp.statusCode}) | Resp: ${JSON.stringify(token, null, 2)}`);
                }
                if (token.error && token.error == 'invalid_grant') {
                    if (this.widgetConfig.debugMode) {
                        console.log('Debug: Error while receiving token2 data');
                        console.log(token);
                    }
                    return this.FPW.textMap().errorMessages.invalidGrant;
                }
                if (resp.statusCode === 200) {
                    await this.FPW.setSettingVal('fpToken', token.access_token);
                    await this.FPW.setSettingVal('fpRefreshToken', token.refresh_token);
                    await this.FPW.setSettingVal('fpFordConsumerId', token.ford_consumer_id);
                    await this.FPW.setSettingVal('fpTokenExpiresAt', (Date.now() + token.expires_in).toString());
                    // let token = await this.FPW.getSettingVal('fpToken');
                    // console.log(`------- New Token Set: ${token} -------`);
                    // let expiresAt = await this.FPW.getSettingVal('fpTokenExpiresAt');
                    // console.log(`expiresAt: ${expiresAt}`);
                    return;
                }
            } catch (e) {
                await this.FPW.logInfo(`fetchToken() Error: ${e}`, true);
                if (e.error && e.error == 'invalid_grant') {
                    return this.FPW.textMap().errorMessages.invalidGrant;
                }
                throw e;
            }
        }
    }

    async refreshToken() {
        // console.log('Refreshing Token...');
        if (this.tokenRetryCnt > 2) {
            this.tokenRetryCnt = 0;
            log('refreshToken() | Too many retries');
            return 'Error: Too many token retries';
        }
        this.tokenRetryCnt++;
        try {
            const refreshToken = await this.FPW.getSettingVal('fpRefreshToken');
            let req = new Request(`https://api.mps.ford.com/api/token/v2/cat-with-refresh-token`);
            req.headers = {
                Accept: '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': this.fpUserAgent,
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
                await this.fetchToken('refreshToken(401)');
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
        return await this.makeFordRequest('getVehicleStatus', `https://usapi.cv.ford.com/api/vehicles/v5/${vin}/status?lrdt=01-01-1970%2000:00:00`, 'GET', false);
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
            false,
            {
                'Content-Type': 'application/json',
                Accept: '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': this.fpUserAgent,
                'Application-Id': await this.getAppID(),
                'auth-token': `${token}`,
                countryCode: country,
                locale: lang,
            },
            {
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
            false,
            {
                'Content-Type': 'application/json',
                Accept: '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': this.fpUserAgent,
                locale: lang,
                countryCode: country,
                'application-id': await this.getAppID(),
                'auth-token': token,
            },
            {
                dashboardRefreshRequest: 'All',
                smsWakeUpVIN: vin,
            },
        );

        try {
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
                            } else if (caps[key] === 'Display' || caps[key] === 'On' || caps[key] === true || caps[key] === 'Available') {
                                nCaps[key] = true;
                                capsArr.push(key);
                            } else {
                                nCaps[key] = caps[key];
                            }
                        }
                        caps = nCaps;
                    }
                    let out = {
                        nickName: vehicle && vehicle.nickName ? vehicle.nickName : undefined,
                        tcuEnabled: vehicle && vehicle.tcuEnabled ? vehicle.tcuEnabled : false,
                        profile: profile,
                        caps: caps,
                        capsArr: capsArr.sort(),
                    };
                    ['profile', 'caps'].forEach((key) => {
                        if (out[key] && out[key].status) {
                            delete out[key].status;
                        }
                    });
                    // console.log(`output: ${JSON.stringify(out, null, 2)}`);
                    return out;
                }
            }
        } catch (e) {
            console.log(`getAllVehicleDetails: ${e.message}`);
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
            'User-Agent': this.fpUserAgent,
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
        const vin = await this.FPW.getSettingVal('fpVin');
        const token = await this.FPW.getSettingVal('fpToken');
        const country = await this.FPW.getSettingVal('fpCountry');
        const lang = await this.FPW.getSettingVal('fpLanguage');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        return await this.makeFordRequest('getVehicleManual', `https://api.mps.ford.com/api/ownersmanual/v1/manuals/${vin}?countryCode=${country}&language=${lang}`, 'GET', false, {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': this.fpUserAgent,
            'Application-Id': await this.getAppID(),
            'auth-token': `${token}`,
            'Consumer-Key': `Z28tbmEtZm9yZA==`, // Base64 encoded version of "go-na-ford"
            Referer: 'https://ford.com',
            Origin: 'https://ford.com',
        });
    }

    async getServiceHistory() {
        // NOT WORKING REQUIRES A JWT TOKEN
        const vin = await this.FPW.getSettingVal('fpVin');
        const token = await this.FPW.getSettingVal('fpToken');
        const country = await this.FPW.getSettingVal('fpCountry');
        const lang = await this.FPW.getSettingVal('fpLanguage');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        return await this.makeFordRequest('getServiceHistory', `https://www.digitalservices.ford.com/owner/api/v2/global/service-history?vin=${vin}&countryCode=${country}&languageCode=${lang}`, 'GET', false, {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36 Edg/101.0.1210.32',
            // 'Application-Id': await this.getAppID(),
            'auth-token': `${token}`,
            'Consumer-Key': `Z28tbmEtZm9yZA==`, // Base64 encoded version of "go-na-ford"
            Referer: 'https://ford.com',
            Origin: 'https://ford.com',
        });
    }

    async getWifiHotspotCmdId() {
        const vin = await this.FPW.getSettingVal('fpVin');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        const data = await this.makeFordRequest('getWifiHotspotData_id', `https://usapi.cv.ford.com/api/vehicles/v1/${vin}/getwifisettings`, 'GET', false);
        return data && data.commandId ? data.commandId : undefined;
    }

    async getWifiHotspotData() {
        const vin = await this.FPW.getSettingVal('fpVin');
        const token = await this.FPW.getSettingVal('fpToken');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }

        const resp1 = await this.makeFordRequest('getWifiHotspotData_id', `https://usapi.cv.ford.com/api/vehicles/v1/${vin}/getwifisettings`, 'GET', false);
        if (resp1 && resp1.commandId) {
            await this.FPW.delayExec(2000);
            const data = await this.makeFordRequest('getWifiHotspotData', `https://usapi.cv.ford.com/api/vehicles/v1/${vin}/getwifisettings/${resp1.commandId}`, 'GET', false);
            // console.log(`data: ${JSON.stringify(data, null, 2)}`);
            return data;
        }
        return undefined;
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
            'User-Agent': this.fpUserAgent,
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
            true,
            {
                accept: 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                'Application-Id': this.appIDs().Web,
                'auth-token': `${token}`,
                Referer: 'https://www.subscriptions.ford.com',
                Origin: 'https://www.subscriptions.ford.com',
                //'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36 Edg/101.0.1210.32',
            },
            { classification: 'FordPass', geoFilter: { countryCode: 'USA', state: 'MI', city: 'Ypsilanti', zipCode: '48197' }, language: 'en-US', vin: '1FTFW1E80MFA24380' },
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
                'User-Agent': this.fpUserAgent,
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

            if (data == this.FPW.textMap().errorMessages.accessDenied) {
                console.log(`makeFordRequest(${desc}): Access Denied. Fetching New Token and Requesting Data Again!`);
                const result = await this.fetchToken('makeFordRequest(AccessDenied)');
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
        delete vehicleData.details.capsArr;
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

        // wifiHotspot data (if available)
        // if (vehicleData.capabilities.includes('wifiHotspot')) {
        //     vehicleData.wifiHotspotDetails = await this.getWifiHotspotData();
        //     console.log(`wifiHotspotDetails: ${JSON.stringify(vehicleData.wifiHotspotDetails, null, 2)}`);
        // }

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
                cmds: [
                    {
                        uri: `${baseUrl}/vehicles/v5/${vin}/doors/lock`,
                        method: 'PUT',
                    },
                ],
            },
            unlock: {
                desc: 'Unlock Doors',
                cmds: [
                    {
                        uri: `${baseUrl}/vehicles/v5/${vin}/doors/lock`,
                        method: 'DELETE',
                    },
                ],
            },
            start: {
                desc: 'Remote Start',
                cmds: [
                    {
                        uri: `${baseUrl}/vehicles/v5/${vin}/engine/start`,
                        method: 'PUT',
                    },
                ],
            },
            stop: {
                desc: 'Remote Stop',
                cmds: [
                    {
                        uri: `${baseUrl}/vehicles/v5/${vin}/engine/start`,
                        method: 'DELETE',
                    },
                ],
            },
            horn_and_lights: {
                desc: 'Horn & Lights On',
                cmds: [
                    {
                        uri: `${baseUrl}/vehicles/v5/${vin}/panic/5`,
                        method: 'PUT',
                    },
                ],
            },
            guard_mode_on: {
                desc: 'Enable SecuriAlert',
                cmds: [
                    {
                        uri: `${guardUrl}/guardmode/v1/${vin}/session`,
                        method: 'PUT',
                    },
                ],
            },
            guard_mode_off: {
                desc: 'Disable SecuriAlert',
                cmds: [
                    {
                        uri: `${guardUrl}/guardmode/v1/${vin}/session`,
                        method: 'DELETE',
                    },
                ],
            },
            trailer_light_check_on: {
                desc: 'Trailer Light Check ON',
                cmds: [
                    {
                        uri: `${baseUrl}/vehicles/${vin}/trailerlightcheckactivation`,
                        method: 'PUT',
                    },
                ],
            },
            trailer_light_check_off: {
                desc: 'Trailer Light Check OFF',
                cmds: [
                    {
                        uri: `${baseUrl}/vehicles/${vin}/trailerlightcheckactivation`,
                        method: 'DELETE',
                    },
                ],
            },
            status: {
                desc: 'Refresh Vehicle Status',
                cmds: [
                    {
                        uri: `${baseUrl}/vehicles/v5/${vin}/status`,
                        method: 'PUT',
                    },
                ],
            },
            wakeup: {
                desc: 'Wakeup Vehicle',
                cmds: [
                    {
                        uri: `${baseUrl}/api/dashboard/v1/users/vehicles?language=EN&wakeupVin=${vin}&skipRecall=true&country=USA&region=US`,
                        method: 'GET',
                    },
                ],
            },
        };
        ['all:0', 'front:1', 'rear:3', 'left:4', 'right:2'].forEach((zone) => {
            let [zoneName, zoneNum] = zone.split(':');
            cmds[`zone_lights_${zoneName}_on`] = {
                desc: `Turn On Zone Lighting (${zoneName.charAt(0).toUpperCase() + zoneName.slice(1)})`,
                cmds: [
                    {
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
                cmds: [
                    {
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
                'User-Agent': this.fpUserAgent,
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
                    let result = await this.fetchToken('sendVehicleCmd(AccessDenied)'); //await this.FPW.FordAPI.fetchToken();
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

    /**
     * Secure Hash Algorithm (SHA256)
     * http://www.webtoolkit.info/
     * Original code by Angel Marin, Paul Johnston
     **/

    SHA256(s) {
        var chrsz = 8;
        var hexcase = 0;

        function safe_add(x, y) {
            var lsw = (x & 0xffff) + (y & 0xffff);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xffff);
        }

        function S(X, n) {
            return (X >>> n) | (X << (32 - n));
        }
        function R(X, n) {
            return X >>> n;
        }
        function Ch(x, y, z) {
            return (x & y) ^ (~x & z);
        }
        function Maj(x, y, z) {
            return (x & y) ^ (x & z) ^ (y & z);
        }
        function Sigma0256(x) {
            return S(x, 2) ^ S(x, 13) ^ S(x, 22);
        }
        function Sigma1256(x) {
            return S(x, 6) ^ S(x, 11) ^ S(x, 25);
        }
        function Gamma0256(x) {
            return S(x, 7) ^ S(x, 18) ^ R(x, 3);
        }
        function Gamma1256(x) {
            return S(x, 17) ^ S(x, 19) ^ R(x, 10);
        }

        function core_sha256(m, l) {
            var K = new Array(
                0x428a2f98,
                0x71374491,
                0xb5c0fbcf,
                0xe9b5dba5,
                0x3956c25b,
                0x59f111f1,
                0x923f82a4,
                0xab1c5ed5,
                0xd807aa98,
                0x12835b01,
                0x243185be,
                0x550c7dc3,
                0x72be5d74,
                0x80deb1fe,
                0x9bdc06a7,
                0xc19bf174,
                0xe49b69c1,
                0xefbe4786,
                0xfc19dc6,
                0x240ca1cc,
                0x2de92c6f,
                0x4a7484aa,
                0x5cb0a9dc,
                0x76f988da,
                0x983e5152,
                0xa831c66d,
                0xb00327c8,
                0xbf597fc7,
                0xc6e00bf3,
                0xd5a79147,
                0x6ca6351,
                0x14292967,
                0x27b70a85,
                0x2e1b2138,
                0x4d2c6dfc,
                0x53380d13,
                0x650a7354,
                0x766a0abb,
                0x81c2c92e,
                0x92722c85,
                0xa2bfe8a1,
                0xa81a664b,
                0xc24b8b70,
                0xc76c51a3,
                0xd192e819,
                0xd6990624,
                0xf40e3585,
                0x106aa070,
                0x19a4c116,
                0x1e376c08,
                0x2748774c,
                0x34b0bcb5,
                0x391c0cb3,
                0x4ed8aa4a,
                0x5b9cca4f,
                0x682e6ff3,
                0x748f82ee,
                0x78a5636f,
                0x84c87814,
                0x8cc70208,
                0x90befffa,
                0xa4506ceb,
                0xbef9a3f7,
                0xc67178f2,
            );
            var HASH = new Array(0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19);
            var W = new Array(64);
            var a, b, c, d, e, f, g, h, i, j;
            var T1, T2;

            m[l >> 5] |= 0x80 << (24 - (l % 32));
            m[(((l + 64) >> 9) << 4) + 15] = l;

            for (var i = 0; i < m.length; i += 16) {
                a = HASH[0];
                b = HASH[1];
                c = HASH[2];
                d = HASH[3];
                e = HASH[4];
                f = HASH[5];
                g = HASH[6];
                h = HASH[7];

                for (var j = 0; j < 64; j++) {
                    if (j < 16) W[j] = m[j + i];
                    else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

                    T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                    T2 = safe_add(Sigma0256(a), Maj(a, b, c));

                    h = g;
                    g = f;
                    f = e;
                    e = safe_add(d, T1);
                    d = c;
                    c = b;
                    b = a;
                    a = safe_add(T1, T2);
                }

                HASH[0] = safe_add(a, HASH[0]);
                HASH[1] = safe_add(b, HASH[1]);
                HASH[2] = safe_add(c, HASH[2]);
                HASH[3] = safe_add(d, HASH[3]);
                HASH[4] = safe_add(e, HASH[4]);
                HASH[5] = safe_add(f, HASH[5]);
                HASH[6] = safe_add(g, HASH[6]);
                HASH[7] = safe_add(h, HASH[7]);
            }
            return HASH;
        }

        function str2binb(str) {
            var bin = Array();
            var mask = (1 << chrsz) - 1;
            for (var i = 0; i < str.length * chrsz; i += chrsz) {
                bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - (i % 32));
            }
            return bin;
        }

        function Utf8Encode(string) {
            string = string.replace(/\r\n/g, '\n');
            var utftext = '';

            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if (c > 127 && c < 2048) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }

            return utftext;
        }

        function binb2hex(binarray) {
            var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
            var str = '';
            for (var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i >> 2] >> ((3 - (i % 4)) * 8 + 4)) & 0xf) + hex_tab.charAt((binarray[i >> 2] >> ((3 - (i % 4)) * 8)) & 0xf);
            }
            return str;
        }

        s = Utf8Encode(s);
        // return core_sha256(str2binb(s), s.length * chrsz);
        return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
    }
};

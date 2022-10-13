module.exports = class FPW_FordAPIs {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.SCRIPT_VERSION = FPW.SCRIPT_VERSION;
        this.widgetConfig = FPW.widgetConfig;
        this.fpUserAgent = 'FordPass/5 CFNetwork/1378.1 Darwin/22.0.0';
        this.fpPubUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/';
        this.tokenRetryCnt = 0;
        this.isFetchingToken = false;
    }

    getModuleVer() {
        return '2022.10.13.3';
    }

    appIDs() {
        return {
            UK_Europe: '1E8C7794-FF5F-49BC-9596-A1E0C86C5B19',
            Australia: '5C80A6BB-CF0D-4A30-BDBF-FC804B5C1A98',
            NA: '71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592',
            Web: 'b08429de-8440-478d-a323-7a1e05cc9844',
        };
    }

    getClientId = () => {
        return '9fb503e0-715b-47e8-adfd-ad4b7770f73b';
    };

    getRedirecUrl() {
        return 'fordapp://userauthorized';
    }

    defaultHeaders = () => {
        return {
            Accept: '*/*',
            'User-Agent': 'FordPass/5 CFNetwork/1333.0.4 Darwin/21.5.0',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
        };
    };

    async getCodeChallenge() {
        let request = new Request('https://fpw-pkce-svc-2.herokuapp.com/getchallenge');
        request.method = 'POST';
        request.headers = {
            'Content-Type': 'application/json',
        };
        const data = await request.loadJSON();
        return { code_challenge: data.code_challenge, code_verifier: data.code_verifier };
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

    async paramBodyBuilder(params) {
        let body = '';
        for (const key in params) {
            if (body.length) {
                body += '&';
            }
            body += key + '=' + params[key];
        }
        // console.log(`paramBodyBuilder() | Body: ${body}`);
        return body;
    }

    async getAppID() {
        const appIds = this.appIDs();
        const region = await this.FPW.getRegion();
        const id = appIds[region] ? appIds[region] : appIds.NA;
        // console.log(`getAppID() | Region: ${region} | ID: ${id}`);
        return id;
    }

    async checkAuth(src) {
        // log('checkAuth() | src: ' + src, !fpToken ? ' | PUBLIC' : '');
        const noValue = (val) => {
            return val === null || val === undefined || val === '';
        };
        const token = await this.FPW.getSettingVal('fpToken');
        const refreshToken = await this.FPW.getSettingVal('fpRefreshToken');
        const expiresAt = await this.FPW.getSettingVal('fpTokenExpiresAt');
        const expired = noValue(expiresAt) === false ? Date.now() >= Date.parse(expiresAt) : false;
        const legacyToken = await this.FPW.getSettingVal('fpToken2');
        // console.log(`checkAuth | Token: ${token}`);
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
                await this.FPW.clearAuthToken();
                await this.FPW.Files.removeFile('fp_vehicleData.json');
            } else {
                if (noValue(token)) {
                    console.log('No Token found... Forcing Token Fetch...');
                } else if (noValue(expiresAt)) {
                    console.log('No Token Expiration found... Forcing Token Fetch...');
                } else if (noValue(refreshToken)) {
                    console.log('No RefreshToken found... Forcing Token Fetch...');
                }
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
        let data = await this.fetchVehicleData(true, 'collectAllData()');
        // data.otaInfo = await this.getVehicleOtaInfo();
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

    // async clearCookies() {
    //     console.log('Clearing Session Cookies()');
    //     const wv = new WebView();
    //     // wv.present();
    //     await wv.loadURL(`https://www.ford.com/#$userSignOut`);
    //     await wv.waitForLoad();
    //     await wv.evaluateJavaScript(`
    //         (
    //             function(){
    //                 document.cookie.split(";").forEach((c) => {
    //                         document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=." + location.host.split('.').slice(-2).join(".") +";path=/");
    //                         // console.log('Clearing Cookie: ' + c);
    //                 });
    //                 localStorage.clear()
    //                 sessionStorage.clear()
    //                 console.log('cookies: ' + document.cookie);
    //             }
    //         )();`);
    //     // console.log('clearCookies() | Success');
    //     return true;
    // }

    async fetchToken(src = null) {
        console.log('Fetching Token...', src);

        if (this.tokenRetryCnt > 2) {
            this.tokenRetryCnt = 0;
            log(`fetchToken(${src}) | Too many retries`);
            return 'Error: Too many token retries';
        }
        this.tokenRetryCnt++;

        if (this.isFetchingToken) {
            console.log(`fetchToken(${src}) | Already fetching token...`);
            return;
        }
        this.isFetchingToken = true;
        const username = await this.FPW.getSettingVal('fpUser');
        if (!username) {
            return this.FPW.textMap().errorMessages.noCredentials;
        }
        const password = await this.FPW.getSettingVal('fpPass');
        if (!password) {
            return this.FPW.textMap().errorMessages.noCredentials;
        }

        const pkce = await this.getCodeChallenge();
        const startUrl = `https://sso.ci.ford.com/v1.0/endpoint/default/authorize?redirect_uri=${this.getRedirecUrl()}&response_type=code&scope=openid&max_age=3600&client_id=${this.getClientId()}&code_challenge=${pkce.code_challenge}%3D&code_challenge_method=S256`;
        const authSession = await this.initializeWebSession(startUrl)
            .then(async (authSession) => {
                console.log(`Web Session Initialized...`);
                if (authSession && authSession.code && authSession.grantId) {
                    console.log(`Web Session Signed In Send Code and GrantId...`);
                    return authSession;
                } else {
                    return await this.attemptLogin(authSession.url, username, password, authSession.cookies).then(async (loginSession) => {
                        return await this.fetchAuthorizationCode(loginSession.url, loginSession.cookies).then((authCodeSession) => {
                            return authCodeSession;
                        });
                    });
                }
            })
            .catch((err) => {
                throw err;
            });
        if (authSession && authSession.code && authSession.grantId) {
            // console.log(`authCodeSession: ${JSON.stringify(authSession)}`);
            await this.requestAccessToken(`grant_type=authorization_code&code=${authSession.code}&grant_id=${authSession.grantId}&code_verifier=${pkce.code_verifier}&scope=openid&redirect_uri=${this.getRedirecUrl()}&client_id=${this.getClientId()}`)
                .then(async (token) => {
                    this.isFetchingToken = false;
                    return token;
                })
                .catch((err) => {
                    this.isFetchingToken = false;
                    throw err;
                });
        } else {
            this.isFetchingToken = false;
            throw new Error('No Auth Code or Grant ID');
        }
    }

    async initializeWebSession(startUrl) {
        // console.log(`initializeWebSession() | ${startUrl}`);
        const request = new Request(startUrl);
        let newUrl;
        request.method = 'GET';
        request.headers = {
            ...this.defaultHeaders(),
            Accept: 'text/html; charset=utf-8',
        };
        request.onRedirect = (req) => {
            // console.log(req.url);
            newUrl = req.url;
            if (req.url.startsWith('https://sso.ci.ford.com/authsvc/mtfim/sps/authsvc') || req.url.startsWith('fordapp://userauthorized')) {
                return null;
            } else {
                return req;
            }
        };

        try {
            const data = await request.loadString();
            // console.log(`initializeWebSession: ${data.toString()}`);
            const resp = await request.response;
            const statusCode = resp.statusCode;
            const nextCookies = resp.headers['Set-Cookie'] ? resp.headers['Set-Cookie'] : resp.cookies;
            console.log(`initializeWebSession status: ${statusCode}`);
            if (statusCode === 200) {
                const fndUrl = this.findRegexMatch(/data-ibm-login-url="(.*)" /gm, data);
                newUrl = fndUrl ? 'https://sso.ci.ford.com' + fndUrl : '';
                if (newUrl && newUrl.length >= 30) {
                    return { url: newUrl, cookies: nextCookies };
                }
                throw new Error('Could not find auth URL');
            } else if (statusCode === 302) {
                // console.log(`302 Redirect URL | ${newUrl}`);
                if (newUrl && newUrl.includes('code=') && newUrl.includes('grant_id=')) {
                    // console.log('initializeWebSession | found code and grant_id in authURL');
                    const params = this.getUrlParams(newUrl.split('?')[1]);
                    // console.log('params: ' + JSON.stringify(params));
                    return { url: newUrl, code: params.code, grantId: params.grant_id };
                } else {
                    // console.log('initializeWebSession | did not find code and grant_id in authURL');
                    return { url: newUrl, cookies: nextCookies };
                }
            }
            throw new Error('Initialize WebSession: Unhandled success status code');
        } catch (err) {
            console.log(`initializeWebSession error: ${err.message}`, err);
            throw err;
        }
    }

    async attemptLogin(url, username, password, cookies) {
        // console.log(`Attempting Login... ${url}`);
        const request = new Request(url);
        request.method = 'POST';
        request.headers = {
            ...this.defaultHeaders(),
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: cookies,
        };
        request.body = `operation=verify&login-form-type=pwd&username=${username}&password=${password}`;
        // console.log(`attemptLogin() | Request Body: ${request.body}`);
        request.onRedirect = (req) => {
            // console.log(req);
        };
        try {
            const data = await request.load();
            // console.log(`attemptLogin data: ${JSON.stringify(data)}`);
            const resp = await request.response;
            console.log(`attemptLogin status: ${resp.statusCode}`);
            if (resp.statusCode === 302 && resp.headers['Location']) {
                const nextCookies = resp.headers['Set-Cookie'] ? resp.headers['Set-Cookie'] : resp.cookies;
                return { url: resp.headers['Location'], cookies: nextCookies };
            }
            throw new Error('Attempt Login: Unhandled success status code');
        } catch (err) {
            // console.log('attemptLogin error: ' + err.message);
            throw new Error('Attempt Login: Unhandled Error Code');
        }
    }

    async fetchAuthorizationCode(url, client, cookies) {
        // console.log(`Fetching Authorization Code... ${url}`);
        const request = new Request(url);
        request.method = 'GET';
        request.headers = {
            ...this.defaultHeaders(),
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: cookies,
        };
        request.onRedirect = (req) => {
            // return req.url;
        };
        try {
            const data = await request.loadString();
            // console.log('fetchAuthorizationCode:', data.toString());
            const resp = await request.response;
            console.log(`fetchAuthorizationCode status: ${resp.statusCode}`);
            if (resp.statusCode === 302 && resp.headers['Location']) {
                // console.log(`fetchAuthorizationCode nextUrl | ${resp.headers['Location']}`);
                const code = this.findRegexMatch(/code=(.*)&/gm, resp.headers['Location']);
                const grantId = this.findRegexMatch(/&grant_id=(.*)/gm, resp.headers['Location']);
                // console.log(`code: ${code}`);
                // console.log(`grantId: ${grantId}`);
                if (code && grantId) return { code, grantId };
                throw new Error('Fetch Authorization Code: Missing Code or Grant ID');
            }
            throw new Error('Fetch Authorization Code: Unhandled Error Code');
        } catch (err) {
            console.log('fetchAuthorizationCode error: ', err);
            throw new Error('Fetch Authorization Code: Unhandled Error Code');
        }
    }

    async requestAccessToken(data) {
        // console.log(`Requesting Access Token...`);
        const req1 = new Request(`https://sso.ci.ford.com/v1.0/endpoint/default/token`);
        req1.method = 'POST';
        req1.headers = {
            ...this.defaultHeaders(),
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        req1.body = data;
        req1.timeoutInterval = 15;
        // console.log(`requestAccessToken() | Request Body: ${JSON.stringify(req1.body)}`);
        try {
            const token1 = await req1.loadJSON();
            // console.log(`accessToken1 data: ${JSON.stringify(token1)}`);
            const resp1 = await req1.response;
            // console.log(`accessToken1 status: ${resp1.statusCode}`);

            if (resp1.statusCode === 200 && token1 && token1.access_token) {
                // console.log('accestToken1: ', JSON.stringify(token1.access_token));
                const req2 = new Request('https://api.mps.ford.com/api/token/v2/cat-with-ci-access-token');
                req2.method = 'POST';
                req2.headers = {
                    ...this.defaultHeaders(),
                    'Content-Type': 'application/json',
                    'Application-Id': this.appIDs().NA,
                };
                req2.body = JSON.stringify({ ciToken: token1.access_token });
                req2.timeoutInterval = 15;
                try {
                    const data2 = await req2.loadJSON();
                    // console.log(`accestToken2 data: ${JSON.stringify(data2)}`);
                    const resp2 = await req2.response;
                    // console.log(`accessToken2 status: ${resp2.statusCode}`);
                    if (resp2.statusCode === 200 && data2 && data2.access_token) {
                        await this.FPW.setSettingVal('fpToken', data2.access_token);
                        await this.FPW.setSettingVal('fpRefreshToken', data2.refresh_token);
                        await this.FPW.setSettingVal('fpFordConsumerId', data2.ford_consumer_id);
                        await this.FPW.setSettingVal('fpTokenExpiresAt', (Date.now() + data2.expires_in).toString());
                        console.log('Successfully retrieved access token');
                        return data2.access_token;
                    } else {
                        throw new Error('Request Access Token 2: Unhandled Error Code');
                    }
                } catch (err) {
                    throw new Error('Request Access Token 2: Unhandled Error Code | ' + err.message);
                }
            } else {
                throw new Error('Access Token was not returned');
            }
        } catch (err) {
            throw new Error(`requestAccessToken ${err.message}`);
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
        // const token = await this.FPW.getSettingVal('fpPubToken');
        const lang = await this.FPW.getSettingVal('fpLanguage');
        const data = await this.makeFordRequest('getSyncVersion', `https://www.digitalservices.ford.com/owner/api/v2/sync/firmware-update?vin=${vin}&locale=${lang}&brand=${brand}`, 'POST', false, {
            'sec-ch-ua': '"Microsoft Edge";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
            Accept: 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.53',
            Origin: 'https://www.ford.com',
            Referer: 'https://www.ford.com/',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
        });
        console.log(`getSyncVersion: ${JSON.stringify(data)}`);
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

    async getAllVehicleDetails() {
        // console.log(`getAllVehicleDetails()`);
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
        } catch (e) {
            console.log(`getAllVehicleDetails: ${e.message}`);
        }
        return undefined;
    }

    async getVehicleOtaInfo() {
        const vin = await this.FPW.getSettingVal('fpVin');
        const token = await this.FPW.getSettingVal('fpPubToken');
        // console.log(token);
        const country = await this.FPW.getSettingVal('fpCountry');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }

        return await this.makeFordRequest('getVehicleOtaInfo', `https://www.digitalservices.ford.com/owner/api/v2/ota/status?country=${country.toLowerCase()}&vin=${vin}`, 'GET', false, {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.53',
            Accept: 'application/json, text/plain, */*',
            'Consumer-Key': 'Z28tbmEtZm9yZA==',
            'Auth-Token': `${token}`,
            Origin: 'https://www.ford.com',
            Referer: 'https://www.ford.com/',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
        });
    }

    async getVehiclesForUser() {
        try {
            const authMsg = await this.checkAuth(`getVehiclesForUser()`);
            if (authMsg) {
                return authMsg;
            }
            const prefs = await this.queryFordPassPrefs(true);
            if (!prefs) {
                throw new Error('No prefs found');
            }
            const token = await this.FPW.getSettingVal('fpToken');
            const country = await this.FPW.getSettingVal('fpCountry');
            const lang = await this.FPW.getSettingVal('fpLanguage');
            // console.log(`getVehiclesForUser() | token | ${token}`);
            // console.log(`getVehiclesForUser() | country | ${country}`);
            // console.log(`getVehiclesForUser() | lang | ${lang}`);
            const data = await this.makeFordRequest(
                'getVehiclesForUser',
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
                    'Application-Id': '71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592',
                    'auth-token': token,
                },
                {
                    dashboardRefreshRequest: 'All',
                    smsWakeUpVIN: '',
                },
            );
            // console.log(`getVehiclesForUser: ${JSON.stringify(data, null, 2)}`);
            let vehicles = [];
            if (data && data.userVehicles && data.userVehicles.vehicleDetails && data.userVehicles.vehicleDetails.length > 0) {
                const supportedVins = data.userVehicles && data.userVehicles.vehicleDetails && data.userVehicles.vehicleDetails.length ? data.userVehicles.vehicleDetails.filter((v) => v.tcuEnabled === true) : [];
                for (const [i, v] of supportedVins.entries()) {
                    const fnd = data.vehicleProfile.find((vp) => vp.VIN === v.VIN);
                    if (fnd) {
                        vehicles.push({
                            vin: v.VIN,
                            nickName: v.nickName,
                            modelName: fnd.make + ' ' + fnd.model,
                            modelYear: fnd.year,
                        });
                    }
                }
            }

            // console.log(`getVehiclesForUser: ${JSON.stringify(vehicles, null, 2)}`);
            console.log(`userVehicles Count: (${vehicles.length})`);
            return vehicles;
        } catch (e) {
            console.log(`getVehiclesForUser: ${e}`);
            return [];
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
        const token = await this.FPW.getSettingVal('fpPubToken');
        const country = await this.FPW.getSettingVal('fpCountry');
        const lang = await this.FPW.getSettingVal('fpLanguage');
        if (!vin) {
            return this.FPW.textMap().errorMessages.noVin;
        }
        return await this.makeFordRequest('getServiceHistory', `https://www.digitalservices.ford.com/owner/api/v2/global/service-history?vin=${vin}&countryCode=${country}&languageCode=${lang}`, 'GET', false, {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': this.fpPubUserAgent,
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
            'User-Agent': this.fpPubUserAgent,
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
            // const settingTest = ['fpLanguage', 'fpCountry', 'fpCity', 'fpState', 'fpZipCode', 'fpDistanceUnits', 'fpPressureUnits'];
            // const settingMissing = settingTest.find((s) => !(await this.FPW.getSettingVal(s)));
            const ok2Upd = lastDt && dtNow - Number(lastDt) > 1000 * 60 * 5;
            // console.log(`Last prefs query: ${lastDt} | Now: ${dtNow} | Diff: ${dtNow - Number(lastDt)} | Ok2Upd: ${ok2Upd}`);
            if (ok2Upd || lastDt === null || force) {
                await this.FPW.setSettingVal('fpLastPrefsQueryTs', dtNow.toString());
                console.log(ok2Upd ? `UserPrefs Expired - Refreshing from Ford API` : `UserPrefs Requested or Missing - Refreshing from Ford API`);

                const data = await this.makeFordRequest('queryFordPassPrefs', `https://api.mps.ford.com/api/users`, 'GET', false);
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
            'User-Agent': this.fpPubUserAgent,
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

    async makeFordRequest(desc, url, method, json = false, customHeaders = undefined, body = undefined) {
        const funcDesc = `makeFordRequest(${desc})`;
        try {
            const authMsg = await this.checkAuth(`${funcDesc}`);
            if (authMsg) {
                return authMsg;
            }
            const token = await this.FPW.getSettingVal('fpToken');
            const headers = customHeaders
                ? customHeaders
                : {
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
                console.log(`${funcDesc} | Status: ${resp.statusCode}) | Resp: ${data}`);
            }

            if (data == this.FPW.textMap().errorMessages.accessDenied) {
                console.log(`${funcDesc}: Access Denied. Fetching New Token and Requesting Data Again!`);
                const result = await this.fetchToken(`${funcDesc}(AccessDenied)`);
                if (result && result == this.FPW.textMap().errorMessages.invalidGrant) {
                    return result;
                }
                data = await this.makeFordRequest(desc, url, method, json, customHeaders, body);
            } else {
                data = json ? data : JSON.parse(data);
            }
            if (data.statusCode && (data.statusCode !== 200 || data.statusCode !== 207)) {
                console.log(`${funcDesc} | Status: (${resp.statusCode}) | Resp: ${JSON.stringify(data)}`);
                return this.FPW.textMap().errorMessages.connectionErrorOrVin;
            }
            return data;
        } catch (e) {
            console.log(`${funcDesc} Error: ${e.message}`);
            await this.FPW.logInfo(`${funcDesc} Error: ${e}`, true);
            return this.FPW.textMap().errorMessages.unknownError;
        }
    }

    async checkFetchLocalDataOk() {
        try {
            const now = Date.now();
            const lastTs = await this.FPW.getSettingVal('fpLastFetchTs');
            // console.log(`checkFetchLocalDataOk() | Last Fetch: ${lastTs} | Now: ${now}`);
            if (!lastTs) {
                console.log(`fetchVehicleData() | Missing Fetch Timestamp | Fetching Data Now!`);
                return false;
            } else {
                const secElap = (now - parseInt(lastTs)) / 1000;
                const reqWait = this.widgetConfig.vehDataRefreshWait ? this.widgetConfig.vehDataRefreshWait : 300;
                console.log(`fetchVehicleData() | RequiredWait: ${reqWait} seconds | Last Fetch: ${secElap} seconds`);
                return secElap > reqWait ? false : true;
            }
        } catch (e) {
            // console.log(`checkFetchLocalDataOk() Error: ${e}`);
            return true;
        }
    }

    async fetchVehicleData(loadLocal = false, src = null) {
        const fetchStart = Date.now();
        if (!loadLocal) {
            const tooSoon = await this.checkFetchLocalDataOk();
            console.log(`fetchVehicleData() | OkToUseLocalData:: ${tooSoon}`);
            loadLocal = tooSoon;
        }

        if (loadLocal) {
            let ld = await this.FPW.Files.readJsonFile('Vehicle Data');
            if (ld !== undefined || ld.info !== undefined || Object.keys(ld.info).length > 0) {
                const fetchEnd = Date.now();
                if (this.widgetConfig.showFetchDataLog) console.log(`Fetch Vehicle Data | Src: ${src} | Load Local | Process Time: ${(fetchEnd - fetchStart) / 1000}sec`);
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
            const fetchEnd = Date.now();
            if (this.widgetConfig.showFetchDataLog) console.log(`Fetch Vehicle Data | Src: ${src} | Auth Error Load Local | Process Time: ${(fetchEnd - fetchStart) / 1000}sec`);
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
        // vehicleData.syncInfo = await this.getSyncVersion(vehicleData.info.brandCode);
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
        const fetchEnd = Date.now();
        this.FPW.setSettingVal('fpLastFetchTs', `${fetchEnd}`);
        if (this.widgetConfig.showFetchDataLog) console.log(`Fetch Vehicle Data | Src: ${src} | Process Time: ${(fetchEnd - fetchStart) / 1000}sec`);
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
        const authMsg = await this.checkAuth('sendVehicleCmd(' + cmd_type + ')');
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
                    let result = await this.fetchToken(true, 'sendVehicleCmd(AccessDenied)'); //await this.FPW.FordAPI.fetchToken();
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

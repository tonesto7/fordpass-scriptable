//This module was downloaded using FordWidgetTool.

module.exports = class FPW_Utils {
    constructor(fpw) {
        // console.log(`FPW_Utils.js: constructor()`);
        this.fpw = fpw;
        this.statics = fpw.statics;
        this.widgetConfig = fpw.widgetConfig;
    }

    runScript(name) {
        let callback = new CallbackURL('scriptable:///run');
        callback.addParameter('scriptName', name);
        callback.open();
    }

    openScriptable() {
        let callback = new CallbackURL('scriptable:///');
        callback.open();
    }

    async getReleaseNotes(url, locale) {
        console.log(`getReleaseNotes | Url: ${url} | Locale: ${locale}`);
        let req = new Request(url);
        req.method = 'GET';
        req.headers = {
            'Content-Type': 'plain/text',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
        };
        req.timeoutInterval = 10;
        let data = await req.loadString();
        let cmdResp = req.response;
        try {
            if (cmdResp.statusCode === 200 && data) {
                let json = JSON.parse(data);
                // console.log(JSON.stringify(json));
                let rTextFnd = json.filter((r) => r.LanguageCodeMobileApp && r.LanguageCodeMobileApp === locale);
                // console.log(`rTextFnd: ${JSON.stringify(rTextFnd)}`);
                if (rTextFnd && rTextFnd[0] && rTextFnd[0].Text) {
                    // console.log(rTextFnd[0].Text);
                    return rTextFnd[0].Text;
                }
            }
        } catch (e) {
            console.error(`getReleaseNotes Error: Could Not Load Release Notes. ${e}`);
        }
        return undefined;
    }

    async getLatestScriptVersion() {
        let req = new Request(`https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/latest.json`);
        req.headers = {
            'Content-Type': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
        };
        req.method = 'GET';
        req.timeoutInterval = 10;
        try {
            let ver = await req.loadJSON();
            return ver && ver.version ? ver.version.replace('v', '') : undefined;
        } catch (e) {
            console.log(`getLatestScriptVersion Error: Could Not Load Version File | ${e}`);
        }
    }

    async createEmailObject(data, attachJson = false) {
        let email = new Mail();
        const vehType = data.info && data.info.vehicle && data.info.vehicle.vehicleType ? data.info.vehicle.vehicleType : undefined;
        const vehVin = data.info && data.info.vehicle && data.info.vehicle.vin ? data.info.vehicle.vin : undefined;
        email.subject = `${vehType || 'FordPass'} Vehicle Data`;
        email.toRecipients = ['purer_06_fidget@icloud.com']; // This is my anonymous email address provided by Apple,
        email.body = attachJson ? 'Vehicle data is attached file' : JSON.stringify(data, null, 4);
        email.isBodyHTML = true;
        let fm = FileManager.local();
        let dir = fm.documentsDirectory();
        let path = fm.joinPath(dir, vehType ? `${vehType.replace(/\s/g, '_')}${vehVin ? '_' + vehVin : '_export'}.json` : `vehicleDataExport.json`);
        if (attachJson) {
            // Creates temporary JSON file and attaches it to the email
            if (await fm.fileExists(path)) {
                await fm.remove(path); //removes existing file if it exists
            }
            await fm.writeString(path, JSON.stringify(data));
            await email.addFileAttachment(path);
        }
        await email.send();
        await fm.remove(path);
    }

    async getPosition(data) {
        let loc = await Location.reverseGeocode(parseFloat(data.gps.latitude), parseFloat(data.gps.longitude));
        return `${loc[0].postalAddress.street}, ${loc[0].postalAddress.city}`;
    }

    getTirePressureStyle(pressure, unit, wSize = 'medium') {
        const styles = {
            normTxt: { font: Font.mediumSystemFont(this.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color(this.statics.colorMap.textColor2) },
            statLow: { font: Font.heavySystemFont(this.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF6700') },
            statCrit: { font: Font.heavySystemFont(this.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color('#DE1738') },
            offset: 10,
        };
        let p = parseFloat(pressure);
        if (p) {
            let low = this.widgetConfig.tirePressureThresholds.low;
            let crit = this.widgetConfig.tirePressureThresholds.critical;
            switch (unit) {
                case 'kPa':
                    low = this.widgetConfig.tirePressureThresholds.low / 0.145377;
                    crit = this.widgetConfig.tirePressureThresholds.critical / 0.145377;
                    break;
                case 'bar':
                    low = this.widgetConfig.tirePressureThresholds.low / 14.5377;
                    crit = this.widgetConfig.tirePressureThresholds.critical / 14.5377;
                    break;
            }
            if (p >= 0 && p > crit && p < low) {
                // console.log(`Tire Pressure Low(${low}) | Pressure ${p} | Func: (${p >= 0 && p > crit && p < low})`);
                return styles.statLow;
            } else if (p >= 0 && p < crit) {
                // console.log(`Tire Pressure Critical(${crit}) | Pressure ${p} | Func: (${p < crit && p >= 0})`);
                return styles.statCrit;
            } else {
                // console.log(`Tire Pressure | Pressure ${p}`);
                return styles.normTxt;
            }
        }
        // console.log(`Tire Pressure | Pressure ${p}`);
        return styles.normTxt;
    }

    convertFordDtToLocal(src) {
        try {
            let dtp = new Date(Date.parse(src.replace(/-/g, '/')));
            let dto = new Date(dtp.getTime() - dtp.getTimezoneOffset() * 60 * 1000);
            return dto;
        } catch (e) {
            console.log(`convertFordDtToLocal Error: ${e}`);
        }
    }

    timeDifference(prevTime, asObj = false) {
        const now = new Date().getTime();
        const min = 60 * 1000;
        const hour = min * 60;
        const day = hour * 24;
        const month = day * 30;
        const year = day * 365;
        const elap = now - prevTime;

        if (elap < min) {
            let d = Math.round(elap / 1000);
            return `${d} ${this.statics.textMap().UIValues.second}${d > 1 ? this.statics.textMap().UIValues.plural : ''} ${this.statics.textMap().UIValues.subsequentAdverb}`;
        } else if (elap < hour) {
            let d = Math.round(elap / min);
            return `${d} ${this.statics.textMap().UIValues.minute}${d > 1 ? this.statics.textMap().UIValues.plural : ''} ${this.statics.textMap().UIValues.subsequentAdverb}`;
        } else if (elap < day) {
            let d = Math.round(elap / hour);
            return `${d} ${this.statics.textMap().UIValues.hour}${d > 1 ? this.statics.textMap().UIValues.plural : ''} ${this.statics.textMap().UIValues.subsequentAdverb}`;
        } else if (elap < month) {
            let d = Math.round(elap / day);
            return `${d} ${this.statics.textMap().UIValues.day}${d > 1 ? this.statics.textMap().UIValues.plural : ''} ${this.statics.textMap().UIValues.subsequentAdverb}`;
        } else if (elap < year) {
            let d = Math.round(elap / month);
            return `${d} ${this.statics.textMap().UIValues.month}${d > 1 ? this.statics.textMap().UIValues.plural : ''} ${this.statics.textMap().UIValues.subsequentAdverb}`;
        } else {
            let d = Math.round(elap / year);
            return `${d} ${this.statics.textMap().UIValues.year}${d > 1 ? this.statics.textMap().UIValues.plural : ''} ${this.statics.textMap().UIValues.subsequentAdverb}`;
        }
    }

    getElapsedMinutes(prevTime) {
        const now = new Date().getTime();
        const min = 60 * 1000;
        const hour = min * 60;
        const elap = now - prevTime;
        if (elap < min) {
            let d = Math.round(elap / 1000);
            return 0;
        } else if (elap < hour) {
            return Math.round(elap / min);
        }
        return 60;
    }

    async pressureToFixed(pressure, digits) {
        // console.log(`pressureToFixed(${pressure}, ${digits})`);
        try {
            let unit = await this.fpw.kc.getSettingVal('fpPressureUnits');
            switch (unit) {
                case 'PSI':
                    return pressure ? (pressure * 0.1450377).toFixed(digits) : -1;
                case 'BAR':
                    return pressure ? (parseFloat(pressure) / 100).toFixed(digits) : -1;
                default:
                    //KPA
                    return pressure || -1;
            }
        } catch (e) {
            console.error(`pressureToFixed Error: ${e}`);
        }
    }

    hasLowerCase(str) {
        return str.toUpperCase() != str;
    }

    scrubPersonalData(data) {
        function scrubInfo(obj, id) {
            function scrub(type, str) {
                switch (type) {
                    case 'vin':
                    case 'relevantVin':
                        return str.substring(0, str.length - 4) + 'XXXX';
                    case 'position':
                    case 'address1':
                    case 'streetAddress':
                        return '1234 Someplace Drive';
                    case 'zipCode':
                    case 'postalCode':
                        return '12345';
                    case 'city':
                        return 'Some City';
                    case 'state':
                        return 'SW';
                    case 'country':
                        return 'UNK';
                    case 'licenseplate':
                        return 'ABC1234';
                    case 'latitude':
                        return 42.123456;
                    case 'longitude':
                        return -89.123456;
                }
            }
            Object.keys(obj).forEach((key) => {
                if (key === id) {
                    obj[key] = scrub(id, obj[key]);
                } else if (obj[key] !== null && typeof obj[key] === 'object') {
                    scrubInfo(obj[key], id);
                }
            });
            return obj;
        }
        let out = data;
        const keys = ['vin', 'relevantVin', 'position', 'streetAddress', 'address1', 'postalCode', 'zipCode', 'city', 'state', 'licenseplate', 'country', 'latitude', 'longitude'];
        for (const [i, key] of keys.entries()) {
            out = scrubInfo(data, key);
        }
        return out;
    }

    inputTest(val) {
        return val !== '' && val !== null && val !== undefined;
    }

    capitalizeStr(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Shamelessly borrowed from WidgetMarkup.js by @rafaelgandi
    _getObjectClass(obj) {
        // See: https://stackoverflow.com/a/12730085
        if (obj && obj.constructor && obj.constructor.toString) {
            let arr = obj.constructor.toString().match(/function\s*(\w+)/);
            if (arr && arr.length == 2) {
                return arr[1];
            }
        }
        return undefined;
    }

    _mapMethodsAndCall(inst, options) {
        Object.keys(options).forEach((key) => {
            if (key.indexOf('*') !== -1) {
                key = key.replace('*', '');
                if (!(key in inst)) {
                    throw new Error(`Method "${key}()" is not applicable to instance of ${this._getObjectClass(inst)}`);
                }
                if (Array.isArray(options['*' + key])) {
                    inst[key](...options['*' + key]);
                } else {
                    inst[key](options[key]);
                }
            } else {
                if (!(key in inst)) {
                    throw new Error(`Property "${key}" is not applicable to instance of ${this._getObjectClass(inst)}`);
                }
                inst[key] = options[key];
            }
        });
        return inst;
    }

    isNewerVersion(oldVer, newVer) {
        try {
            const oldParts = oldVer.split('.');
            const newParts = newVer.split('.');
            for (var i = 0; i < newParts.length; i++) {
                const a = ~~newParts[i]; // parse int
                const b = ~~oldParts[i]; // parse int
                if (a > b) return true;
                if (a < b) return false;
            }
        } catch (e) {
            console.error(`isNewerVersion Error: ${e}`);
        }
        return false;
    }
};
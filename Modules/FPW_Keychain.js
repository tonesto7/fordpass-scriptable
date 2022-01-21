//This module was downloaded using FordWidgetTool.

module.exports = class FPW_Keychain {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
    }

    //********************************************************************************************************************************
    //*                                             START FILE/KEYCHAIN MANAGEMENT FUNCTIONS
    //********************************************************************************************************************************

    async vinCheck(vin, setup = false) {
        vin = vin || (await this.getSettingVal('fpVin'));
        let vinLen = vin && vin.length === 17;
        let vinChar = vin && vin.match(/^[a-zA-Z0-9]+$/);
        let msgs = [];
        if (vin) {
            if (setup && !vinLen) {
                msgs.push('VIN Number is not 17 characters long!');
            }
            if (setup && !vinChar) {
                msgs.push('VIN Number contains invalid characters!\nOnly A-Z, 0-9 are allowed!');
            }
            if (msgs.length > 0) {
                console.log(`VIN Format Issues (${msgs.length}) | Current VIN: ${vin} | Errors: ${msgs.join('\n')}`);
                if (!config.runsInWidget) {
                    //Added this to prevent the Alerts not supported in widgets error
                    // await this.FPW.Alerts.showAlert('VIN Validation Error', msgs.join('\n'));
                }
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    async useMetricUnits() {
        return (await this.getSettingVal('fpDistanceUnits')) !== 'mi';
    }

    async getMapProvider() {
        return (await this.getSettingVal('fpMapProvider')) || 'apple';
    }

    async setMapProvider(value) {
        await this.setSettingVal('fpMapProvider', value);
    }

    async toggleMapProvider() {
        await this.setMapProvider((await this.getMapProvider()) === 'google' ? 'apple' : 'google');
    }

    async getSettingVal(key) {
        key = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `${key}_${this.SCRIPT_ID}` : key;
        try {
            if (await Keychain.contains(key)) {
                return await Keychain.get(key);
            }
        } catch (e) {
            console.log(`getSettingVal(${key}) Error: ${e}`);
            this.FPW.files.appendToLogFile(`getSettingVal(${key}) Error: ${e}`);
        }
        return null;
    }

    async setSettingVal(key, value) {
        if (key && value) {
            key = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `${key}_${this.SCRIPT_ID}` : key;
            await Keychain.set(key, value);
        }
    }

    async getWidgetStyle() {
        return (await this.getSettingVal('fpWidgetStyle')) || 'detailed';
    }

    async setWidgetStyle(style) {
        return await this.setSettingVal('fpWidgetStyle', style);
    }

    hasSettingVal(key) {
        return Keychain.contains(key);
    }

    async removeSettingVal(key) {
        key = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `${key}_${this.SCRIPT_ID}` : key;
        if (await Keychain.contains(key)) {
            await Keychain.remove(key);
        }
    }

    // async  performKeychainMigration() {
    //     let kcKeys = ['fpUser', 'fpPass', 'fpToken2', 'fpVin', 'fpMapProvider', 'fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpSpeedUnits'];
    //     for (const key in kcKeys) {
    //         // if (Keychain.contains())
    //     }
    // }

    prefKeys() {
        return {
            core: ['fpUser', 'fpPass', 'fpToken2', 'fpVin', 'fpMapProvider', 'fpCountry', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits'], // 'fpDeviceLanguage'
            user: ['fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits'],
        };
    }

    async requiredPrefsOk(keys) {
        let missingKeys = [];
        for (const key in keys) {
            let val = await this.getSettingVal(keys[key]);
            if (val === null || val === '' || val === undefined) {
                missingKeys.push(keys[key]);
            }
        }

        if (missingKeys.length > 0) {
            console.log('Required Prefs Missing: ' + missingKeys);
            return false;
        } else {
            return true;
        }
    }

    async clearSettings() {
        console.log('Info: Clearing All Widget Settings from Keychain');
        const keys = ['fpToken', 'fpToken2', 'fpUsername', 'fpUser', 'fpPass', 'fpPassword', 'fpVin', 'fpUseMetricUnits', 'fpUsePsi', 'fpVehicleType', 'fpMapProvider', 'fpCat1Token', 'fpTokenExpiresAt', 'fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits', 'fpSpeedUnits', 'fpScriptVersion'];
        for (const key in keys) {
            await this.removeSettingVal(keys[key]);
        }
    }
};
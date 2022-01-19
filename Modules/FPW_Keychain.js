module.exports = class FPW_Keychain {
    constructor(fpw) {
        this.fpw = fpw;
        this.SCRIPT_ID = fpw.SCRIPT_ID;
        this.widgetConfig = fpw.widgetConfig;
    }

    //********************************************************************************************************************************
    //*                                             START FILE/KEYCHAIN MANAGEMENT FUNCTIONS
    //********************************************************************************************************************************

    async vinFix() {
        let vin = await this.getKeychainValue('fpVin');
        if (vin && this.fpw.utils.hasLowerCase(vin)) {
            console.log('VIN Validation Error: Your saved VIN number has lowercase letters.\nUpdating your saved value for you!');
            await this.setKeychainValue('fpVin', vin.toUpperCase());
        }
    }

    async vinCheck(vin, setup = false) {
        vin = vin || (await this.getKeychainValue('fpVin'));
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
                    await this.fpw.alerts.showAlert('VIN Validation Error', msgs.join('\n'));
                }
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    async useMetricUnits() {
        return (await this.getKeychainValue('fpDistanceUnits')) !== 'mi';
    }

    async getMapProvider() {
        return (await this.getKeychainValue('fpMapProvider')) || 'apple';
    }

    async setMapProvider(value) {
        await this.setKeychainValue('fpMapProvider', value);
    }

    async toggleMapProvider() {
        await this.setMapProvider((await this.getMapProvider()) === 'google' ? 'apple' : 'google');
    }

    async getKeychainValue(key) {
        key = this.fpw.SCRIPT_ID !== null && this.fpw.SCRIPT_ID !== undefined && this.fpw.SCRIPT_ID > 0 ? `${key}_${this.fpw.SCRIPT_ID}` : key;
        try {
            if (await Keychain.contains(key)) {
                return await Keychain.get(key);
            }
        } catch (e) {
            console.log(`getKeychainValue(${key}) Error: ${e}`);
        }
        return null;
    }

    async setKeychainValue(key, value) {
        if (key && value) {
            key = this.fpw.SCRIPT_ID !== null && this.fpw.SCRIPT_ID !== undefined && this.fpw.SCRIPT_ID > 0 ? `${key}_${this.fpw.SCRIPT_ID}` : key;
            await Keychain.set(key, value);
        }
    }

    async getWidgetStyle() {
        return (await this.getKeychainValue('fpWidgetStyle')) || 'detailed';
    }

    async setWidgetStyle(style) {
        return await this.setKeychainValue('fpWidgetStyle', style);
    }

    hasKeychainValue(key) {
        return Keychain.contains(key);
    }

    async removeKeychainValue(key) {
        key = this.fpw.SCRIPT_ID !== null && this.fpw.SCRIPT_ID !== undefined && this.fpw.SCRIPT_ID > 0 ? `${key}_${this.fpw.SCRIPT_ID}` : key;
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
            let val = await this.getKeychainValue(keys[key]);
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

    async clearKeychain() {
        console.log('Info: Clearing All Widget Data from Keychain');
        const keys = ['fpToken', 'fpToken2', 'fpUsername', 'fpUser', 'fpPass', 'fpPassword', 'fpVin', 'fpUseMetricUnits', 'fpUsePsi', 'fpVehicleType', 'fpMapProvider', 'fpCat1Token', 'fpTokenExpiresAt', 'fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits', 'fpSpeedUnits', 'fpScriptVersion'];
        for (const key in keys) {
            await this.removeKeychainValue(keys[key]);
        }
    }
};
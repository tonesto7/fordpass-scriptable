module.exports = class FPW_Menus {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
    }

    getModuleVer() {
        return '2022.04.28.0';
    }

    async requiredPrefsMenu(user = null, pass = null, vin = null) {
        try {
            user = user || (await this.FPW.getSettingVal('fpUser'));
            pass = pass || (await this.FPW.getSettingVal('fpPass'));
            vin = vin || (await this.FPW.getSettingVal('fpVin'));

            let mapProvider = await this.FPW.getMapProvider();
            const widgetStyle = await this.FPW.getWidgetStyle();
            const colorMode = await this.FPW.getColorMode();
            let prefsMenu = new Alert();
            prefsMenu.title = 'Required Settings Missing';
            prefsMenu.message = 'Please enter you FordPass Credentials and Vehicle VIN.\n\nTap a setting to toggle change\nPress Done to Save.';

            prefsMenu.addTextField('FordPass Email', user || '');
            prefsMenu.addSecureTextField('FordPass Password', pass || '');
            prefsMenu.addTextField('Vehicle VIN', vin || '');

            prefsMenu.addAction(`Widget Style: ${this.FPW.capitalizeStr(widgetStyle)}`);
            prefsMenu.addAction(`Widget Color: ${this.FPW.capitalizeStr(colorMode)}`);
            prefsMenu.addAction(`Map Provider: ${mapProvider === 'apple' ? 'Apple' : 'Google'}`); //0
            prefsMenu.addAction('View Documentation'); //1
            prefsMenu.addAction('Watch Setup Video'); //2

            prefsMenu.addAction('Save'); //3
            prefsMenu.addCancelAction('Cancel'); //4

            const devCreds = await this.FPW.Files.loadLocalDevCredentials();
            // console.log(JSON.stringify(devCreds));

            let respInd = await prefsMenu.presentAlert();
            user = prefsMenu.textFieldValue(0);
            pass = prefsMenu.textFieldValue(1);
            vin = prefsMenu.textFieldValue(2);
            switch (respInd) {
                case 0:
                    console.log(`(Required Prefs Menu) Widget Style pressed`);
                    await this.FPW.App.createWidgetStylePage();
                    return await this.requiredPrefsMenu(user, pass, vin);
                case 1:
                    console.log('(Required Prefs Menu) Widget Style pressed');
                    await this.menuBuilderByType('color_mode', true);
                    return await this.requiredPrefsMenu(user, pass, vin);
                case 2:
                    console.log('(Required Prefs Menu) Map Provider pressed');
                    await this.FPW.toggleMapProvider();
                    return await this.requiredPrefsMenu(user, pass, vin);
                case 3:
                    console.log('(Required Prefs Menu) View Documentation pressed');
                    await Safari.openInApp(this.FPW.textMap().about.documentationUrl);
                    return await this.requiredPrefsMenu(user, pass, vin);
                case 4:
                    console.log('(Required Prefs Menu) View Help Videos pressed');
                    await Safari.openInApp(this.FPW.textMap().about.helpVideos.setup.url);
                    return await this.requiredPrefsMenu(user, pass, vin);
                case 5:
                    console.log('(Required Prefs Menu) Done was pressed');
                    user = devCreds && devCreds.user ? devCreds.user : prefsMenu.textFieldValue(0);
                    pass = devCreds && devCreds.password ? devCreds.password : prefsMenu.textFieldValue(1);
                    vin = devCreds && devCreds.vin ? devCreds.vin : prefsMenu.textFieldValue(2);
                    console.log(`${user} ${pass} ${vin}`);

                    if (this.FPW.inputTest(user) && this.FPW.inputTest(pass) && this.FPW.inputTest(vin)) {
                        await this.FPW.setSettingVal('fpUser', user);
                        await this.FPW.setSettingVal('fpPass', pass);
                        await this.FPW.setSettingVal('fpMapProvider', mapProvider);
                        let vinChk = await this.FPW.vinCheck(vin, true);
                        console.log(`VIN Number Ok: ${vinChk}`);
                        if (vinChk) {
                            await this.FPW.setSettingVal('fpVin', vin.toUpperCase());
                            // await this.FPW.FordAPI.checkAuth();
                            // await this.FPW.FordAPI.queryFordPassPrefs(true);
                            return true;
                        } else {
                            // await requiredPrefsMenu();
                            // await prepWidget();
                            return undefined;
                        }
                    } else {
                        // await prepWidget();
                        return undefined;
                    }
                    break;
                case 6:
                    return false;
            }
        } catch (err) {
            this.FPW.logError(`(Required Prefs Menu) Error: ${err}`);
            throw err;
        }
    }

    async menuBuilderByType(type, prefsMenu = false) {
        try {
            const vehicleData = await this.FPW.FordAPI.fetchVehicleData(true);
            const caps = vehicleData.capabilities && vehicleData.capabilities.length ? vehicleData.capabilities : undefined;

            const typeDesc = this.FPW.capitalizeStr(type);
            let title = undefined;
            let message = undefined;
            let items = [];

            switch (type) {
                case 'main':
                    title = `Widget Menu`;
                    message = `Widget Version: (${this.FPW.SCRIPT_VERSION})`.trim();
                    items = [{
                            title: 'View Widget',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) View Widget was pressed`);
                                this.menuBuilderByType('widgetView');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Request Refresh',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Refresh was pressed`);
                                if (await this.FPW.Alerts.showYesNoPrompt('Vehicle Data Refresh', "Are you sure you want to send a wake request to the vehicle to refresh it's data?\n\nThis is not an instant thing and sometimes takes minutes to wake the vehicle...")) {
                                    await this.FPW.FordAPI.sendVehicleCmd('status');
                                }
                            },
                            destructive: true,
                            show: true,
                        },
                        {
                            title: 'Widget Appearance',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Widget Appearance was pressed`);
                                this.menuBuilderByType('widget_settings');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Notifications',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Notifications was pressed`);
                                this.menuBuilderByType('notifications');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Settings',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Settings was pressed`);
                                this.menuBuilderByType('settings');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Help & Info',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Help & Info was pressed`);
                                await this.menuBuilderByType('helpInfo');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Close',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Close was pressed`);
                            },
                            destructive: false,
                            show: true,
                        },
                    ];
                    break;

                case 'helpInfo':
                    const vinGuideUrl = vehicleData.info && vehicleData.info.modelYear ? this.FPW.getVinGuideUrl(vehicleData.info.modelYear) : undefined;
                    // console.log(vehicleData.info.modelYear);
                    // console.log(`VIN Guide URL: ${vinGuideUrl}`);
                    title = `Help & About`;
                    items = [{
                            title: 'Recent Changes',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) About was pressed`);
                                await this.FPW.App.createRecentChangesPage();
                                this.menuBuilderByType('helpInfo');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'View Documentation',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Small Widget was pressed`);
                                await Safari.openInApp(this.FPW.textMap().about.documentationUrl);
                                this.menuBuilderByType('helpInfo');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Report Issues',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Report Issues was pressed`);
                                await Safari.openInApp(this.FPW.textMap().about.issuesUrl);
                                this.menuBuilderByType('helpInfo');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Donate',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Donate was pressed`);
                                await Safari.open(this.FPW.textMap().about.donationUrl);
                                this.menuBuilderByType('helpInfo');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Diagnostics',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Diagnostics was pressed`);
                                await this.menuBuilderByType('diagnostics');
                            },
                            destructive: false,
                            show: false,
                        },
                        {
                            title: `${vehicleData.info && vehicleData.info.modelYear ? vehicleData.info.modelYear : ''} VIN Guide`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) VIN Guide was pressed`);
                                await Safari.openInApp(vinGuideUrl);
                                this.menuBuilderByType('helpInfo');
                            },
                            destructive: false,
                            show: vehicleData.info && vehicleData.info.modelYear && vinGuideUrl ? true : false,
                        },
                        {
                            title: `Update Widget Tool to Latest`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Update Widget Tool pressed`);
                                await this.FPW.downloadLatestWidgetTool();
                                await this.FPW.Alerts.showAlert('WidgetTool Updater', 'WidgetTool has been updated to the latest version.');
                                this.menuBuilderByType('helpInfo');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `Update Widget to Latest Code`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Update Widget pressed`);
                                await this.FPW.updateThisScript();
                                await this.FPW.Alerts.showAlert('Widget Updater', 'Widget Code has been updated to the latest version.');
                                this.menuBuilderByType('helpInfo');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Back',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Back was pressed`);
                                this.menuBuilderByType('main');
                            },
                            destructive: false,
                            show: true,
                        },
                    ];

                    break;
                case 'widgetView':
                    title = 'View Widget';
                    items = [{
                            title: 'Small (Light)',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Small Light Widget was pressed`);
                                const w = await this.FPW.generateWidget('smallLight', vehicleData);
                                await w.presentSmall();
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Small (Dark)',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Small Dark Widget was pressed`);
                                const w = await this.FPW.generateWidget('smallDark', vehicleData);
                                await w.presentSmall();
                            },
                            destructive: false,
                            show: true,
                        },

                        {
                            title: 'Medium (Light)',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Medium Light Widget was pressed`);
                                const w = await this.FPW.generateWidget('mediumLight', vehicleData);
                                await w.presentMedium();
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Medium (Dark)',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Medium Dark Widget was pressed`);
                                const w = await this.FPW.generateWidget('mediumDark', vehicleData);
                                await w.presentMedium();
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Large (Light)',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Large Widget was pressed`);
                                const w = await this.FPW.generateWidget('largeLight', vehicleData);
                                await w.presentLarge();
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Large (Dark)',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Large Dark Widget was pressed`);
                                const w = await this.FPW.generateWidget('largeDark', vehicleData);
                                await w.presentLarge();
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Extra-Large',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Extra-Large Widget was pressed`);
                                const w = await this.FPW.generateWidget('extraLarge', vehicleData);
                                await w.presentExtraLarge();
                            },
                            destructive: false,
                            show: this.FPW.isPad,
                        },
                        {
                            title: 'Back',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Back was pressed`);
                                this.menuBuilderByType('main');
                            },
                            destructive: false,
                            show: true,
                        },
                    ];
                    break;

                case 'diagnostics':
                    title = 'Diagnostics Menu';
                    items = [{
                            title: 'Copy All Data to Clipboard',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Copy Data was pressed`);
                                let data = await this.FPW.FordAPI.collectAllData(true);
                                await Pasteboard.copyString(JSON.stringify(data, null, 4));
                                await this.FPW.Alerts.showAlert('Debug Menu', 'Vehicle Data Copied to Clipboard');
                                // this.menuBuilderByType('diagnostics');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Send Data to Developer',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Email Vehicle Data was pressed`);
                                let data = await this.FPW.FordAPI.collectAllData(true);
                                await this.FPW.createVehicleDataEmail(data, true);
                                // this.menuBuilderByType('diagnostics');
                            },
                            destructive: true,
                            show: true,
                        },
                        {
                            title: 'Send Widget Logs to Developer',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Email Logs was pressed`);
                                await this.FPW.createLogEmail();
                                this.menuBuilderByType('diagnostics');
                            },
                            destructive: false,
                            show: false,
                        },
                        {
                            title: 'Back',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Back was pressed`);
                                // this.menuBuilderByType('main');
                            },
                            destructive: false,
                            show: true,
                        },
                    ];
                    break;

                case 'reset':
                    title = 'Reset Data Menu';
                    items = [{
                            title: 'Clear Cached Images',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Clear Images was pressed`);
                                await this.FPW.Files.clearImageCache();
                                await this.FPW.Alerts.showAlert('Widget Reset Menu', 'Saved Images Cleared\n\nPlease run the script again to reload them all.');
                                this.menuBuilderByType('main');
                            },
                            destructive: true,
                            show: true,
                        },
                        {
                            title: 'Clear Cached Files/Images',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Clear Files/Images was pressed`);
                                await this.FPW.Files.clearFileManager();
                                await this.FPW.Alerts.showAlert('Widget Reset Menu', 'Saved Files and Images Cleared\n\nPlease run the script again to reload them all.');
                                this.menuBuilderByType('main');
                            },
                            destructive: true,
                            show: true,
                        },
                        {
                            title: 'Clear Login Info',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Clear Login Info was pressed`);
                                if (await this.FPW.Alerts.showYesNoPrompt('Clear Login & Settings', 'Are you sure you want to reset your login details and settings?\n\nThis will require you to enter your login info again?')) {
                                    await this.FPW.clearSettings();
                                    await this.FPW.Alerts.showAlert('Widget Reset Menu', 'Saved Settings Cleared\n\nPlease close out the menus and restart the script again to re-initialize the widget.');
                                    this.menuBuilderByType('main');
                                } else {
                                    this.menuBuilderByType('reset');
                                }
                            },
                            destructive: true,
                            show: true,
                        },
                        {
                            title: 'Reset Everything',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Reset Everything was pressed`);
                                if (await this.FPW.Alerts.showYesNoPrompt('Reset Everything', "Are you sure you want to reset the widget?\n\nThis will reset the widget back to it's default state?")) {
                                    await this.FPW.clearSettings();
                                    await this.FPW.Files.clearFileManager();
                                    await this.FPW.Alerts.showAlert('Widget Reset Menu', 'All Files, Settings, and Login Info Cleared\n\nClose out the menus and restart the app.');
                                    this.menuBuilderByType('main');
                                } else {
                                    this.menuBuilderByType('reset');
                                }
                            },
                            destructive: true,
                            show: true,
                        },
                        {
                            title: 'Back',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Back was pressed`);
                                this.menuBuilderByType('main');
                            },
                            destructive: false,
                            show: true,
                        },
                    ];
                    break;

                case 'color_mode':
                    title = 'Widget Color Mode';
                    items = [{
                            title: `System`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Dark Mode pressed`);
                                await this.FPW.setUIColorMode('system');
                                if (!prefsMenu) {
                                    this.menuBuilderByType('widget_settings');
                                }
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `Light`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Dark Mode pressed`);
                                await this.FPW.setUIColorMode('light');
                                if (!prefsMenu) {
                                    this.menuBuilderByType('widget_settings');
                                }
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `Dark`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Dark Mode pressed`);
                                await this.FPW.setUIColorMode('dark');
                                if (!prefsMenu) {
                                    this.menuBuilderByType('widget_settings');
                                }
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `Back`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Back pressed`);
                                if (!prefsMenu) {
                                    this.menuBuilderByType('widget_settings');
                                }
                            },
                            destructive: false,
                            show: true,
                        },
                    ];
                    break;

                case 'export_images':
                    title = 'Widget Settings';
                    items = [{
                        title: `Style: ${this.FPW.capitalizeStr(widgetStyle)}`,
                        action: async() => {
                            console.log(`(${typeDesc} Menu) Style pressed`);
                            await this.FPW.App.createWidgetStylePage();
                            if (!prefsMenu) {
                                this.menuBuilderByType('widget_settings');
                            }
                        },
                        destructive: false,
                        show: true,
                    }, ];
                    break;

                case 'widget_settings':
                    const widgetStyle = await this.FPW.getWidgetStyle();
                    const colorMode = await this.FPW.getColorMode();
                    title = 'Widget Settings';
                    items = [{
                            title: `Style: ${this.FPW.capitalizeStr(widgetStyle)}`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Style pressed`);
                                await this.FPW.App.createWidgetStylePage();
                                if (!prefsMenu) {
                                    this.menuBuilderByType('widget_settings');
                                }
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `Color Mode: ${this.FPW.capitalizeStr(colorMode)}`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Color Mode pressed`);
                                await this.menuBuilderByType('color_mode');
                                // this.menuBuilderByType('widget_settings');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Back',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Close was pressed`);
                                if (!prefsMenu) {
                                    this.menuBuilderByType('main');
                                }
                            },
                            destructive: false,
                            show: true,
                        },
                    ];
                    break;
                case 'notifications':
                    title = 'Notification Settings';
                    message = 'Update Notifications: Once every 24H.\nDeepSleep: Once every 6H\nOTA Updates: Once every 24H';
                    items = [{
                            title: `Script Updates: ${(await this.FPW.getShowNotificationType('scriptUpdate')) === false ? 'Off' : 'On'}`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Update Notification Toggle pressed`);
                                await this.FPW.toggleNotificationType('scriptUpdate');
                                this.menuBuilderByType('notifications');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `OTA Updates: ${(await this.FPW.getShowNotificationType('otaUpdate')) === false ? 'Off' : 'On'}`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) OTA Update Toggle pressed`);
                                await this.FPW.toggleNotificationType('otaUpdate');
                                this.menuBuilderByType('notifications');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `Deep Sleep: ${(await this.FPW.getShowNotificationType('deepSleep')) === false ? 'Off' : 'On'}`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Deep Sleep Toggle pressed`);
                                await this.FPW.toggleNotificationType('deepSleep');
                                this.menuBuilderByType('notifications');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `Low Tires: ${(await this.FPW.getShowNotificationType('tireLow')) === false ? 'Off' : 'On'}`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Low Tire Toggle pressed`);
                                await this.FPW.toggleNotificationType('tireLow');
                                this.menuBuilderByType('notifications');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `EV Charging Paused: ${(await this.FPW.getShowNotificationType('evChargingPaused')) === false ? 'Off' : 'On'}`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) EV Charging Paused Toggle pressed`);
                                await this.FPW.toggleNotificationType('evChargingPaused');
                                this.menuBuilderByType('notifications');
                            },
                            destructive: false,
                            show: caps && caps.includes('EV_SMART_CHARGING'),
                        },
                        // {
                        //     title: `Oil Low: ${(await this.FPW.getShowNotificationType('oilLow')) === false ? 'Off' : 'On'}`,
                        //     action: async() => {
                        //         console.log(`(${typeDesc} Menu) Oil Low Toggle pressed`);
                        //         await this.FPW.toggleNotificationType('oilLow');
                        //         this.menuBuilderByType('notifications');
                        //     },
                        //     destructive: false,
                        //     show: true,
                        // },
                        {
                            title: `12V Battery Low: ${(await this.FPW.getShowNotificationType('lvBatteryLow')) === false ? 'Off' : 'On'}`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) 12V Battery Low Toggle pressed`);
                                await this.FPW.toggleNotificationType('lvBatteryLow');
                                this.menuBuilderByType('notifications');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `Back`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Back was pressed`);
                                this.menuBuilderByType('main');
                            },
                            destructive: false,
                            show: true,
                        },
                    ];
                    break;
                case 'settings':
                    let mapProvider = await this.FPW.getMapProvider();
                    let storageLocation = await this.FPW.getStorageLocation();
                    title = 'Widget Settings';
                    items = [{
                            title: `Map Provider: ${mapProvider === 'apple' ? 'Apple' : 'Google'}`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Map Provider pressed`);
                                await this.FPW.toggleMapProvider();
                                this.menuBuilderByType('settings');
                            },
                            destructive: false,
                            show: true,
                        },

                        {
                            title: `Move Widget & Modules to: ${storageLocation === 'local' ? 'iCloud' : 'Local'}`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Storage Location pressed`);
                                await this.FPW.moveStorageLocation();
                                this.menuBuilderByType('settings');
                            },
                            destructive: false,
                            show: false,
                        },

                        {
                            title: 'Reset Login/File Options',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Clear All Data was pressed`);
                                this.menuBuilderByType('reset');
                                // menuBuilderByType('settings');
                            },
                            destructive: true,
                            show: true,
                        },
                        {
                            title: 'View Scriptable Settings',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) View Scriptable Settings was pressed`);
                                await Safari.open(URLScheme.forOpeningScriptSettings());
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `Back`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Back was pressed`);
                                this.menuBuilderByType('main');
                            },
                            destructive: false,
                            show: true,
                        },
                    ];
                    break;
            }
            if (title.length > 0 && items.length > 0) {
                let menuItems = items.filter((item) => item.show === true);
                // console.log(`subcontrol menuItems(${menuItems.length}): ${JSON.stringify(menuItems)}`);
                const subMenu = new Alert();
                subMenu.title = title;
                subMenu.message = message;
                menuItems.forEach((item, ind) => {
                    if (item.destructive) {
                        subMenu.addDestructiveAction(item.title);
                    } else {
                        subMenu.addAction(item.title);
                    }
                });
                const respInd = await subMenu.presentSheet();
                if (respInd !== null) {
                    const menuItem = menuItems[respInd];
                    // console.log(`(Sub Control Menu) Selected: ${JSON.stringify(menuItem)}`);
                    menuItem.action();
                }
            }
        } catch (err) {
            this.FPW.logError(`(${typeDesc} Menu) Error: ${err}`);
        }
    }
    async imageExportMenu(img, fileName = '') {
        const subMenu = new Alert();
        subMenu.title = 'Image Exporter';
        subMenu.message = '';
        subMenu.addAction('Save to Photos');
        subMenu.addAction('Export to File');
        subMenu.addAction('Cancel');
        const respInd = await subMenu.presentSheet();
        if (respInd !== null) {
            switch (respInd) {
                case 0:
                    Photos.save(img);
                    await this.FPW.Alerts.showAlert('Photo Saved to Libray', 'Your Image should now appear in Photo Library.');
                    break;
                case 1:
                    await DocumentPicker.exportImage(img, fileName);
                    break;
                case 2:
                    // returnFunction();
                    break;
            }
        }
    }
};
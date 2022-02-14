module.exports = class FPW_Menus {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
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
                    user = prefsMenu.textFieldValue(0);
                    pass = prefsMenu.textFieldValue(1);
                    vin = prefsMenu.textFieldValue(2);
                    // console.log(`${user} ${pass} ${vin}`);

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
            // const caps = vehicleData.capabilities && vehicleData.capabilities.length ? vehicleData.capabilities : undefined;
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
                                // const w = await generateWidget('medium', fordData);
                                // await w.presentMedium();
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
                            title: 'Small',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Small Widget was pressed`);
                                const w = await this.FPW.generateWidget('small', vehicleData);
                                await w.presentSmall();
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Medium',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Medium Widget was pressed`);
                                const w = await this.FPW.generateWidget('medium', vehicleData);
                                await w.presentMedium();
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Large',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Large Widget was pressed`);
                                const w = await this.FPW.generateWidget('large', vehicleData);
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
                            title: 'View OTA API Info',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) View OTA Info was pressed`);
                                let data = await this.FPW.FordAPI.getVehicleOtaInfo();
                                await this.FPW.App.showDataWebView('OTA Info Page', 'OTA Raw Data', data, 'OTA');
                                this.menuBuilderByType('diagnostics');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'View All Data',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) View All Data was pressed`);
                                let data = await this.FPW.FordAPI.collectAllData(false);
                                await this.FPW.App.showDataWebView('Vehicle Data Output', 'All Vehicle Data Collected', data);
                                this.menuBuilderByType('diagnostics');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: 'Copy All Data to Clipboard',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Copy Data was pressed`);
                                let data = await this.FPW.FordAPI.collectAllData(true);
                                await Pasteboard.copyString(JSON.stringify(data, null, 4));
                                await this.FPW.Alerts.showAlert('Debug Menu', 'Vehicle Data Copied to Clipboard');
                                this.menuBuilderByType('diagnostics');
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
                                this.menuBuilderByType('diagnostics');
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

                case 'reset':
                    title = 'Reset Data Menu';
                    items = [{
                            title: 'Clear Cached Files/Images',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Clear Files/Images was pressed`);
                                await this.FPW.Files.clearFileManager();
                                await this.FPW.Alerts.showAlert('Widget Reset Menu', 'Saved Files and Images Cleared\n\nPlease run the script again to reload them all.');
                                this.menuBuilderByType('main');
                                // this.quit();
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
                    message = 'Update Notifications: Once per 24H.\n\nVehicle Alerts: Once every 6H';
                    items = [{
                            title: `Script Updates: ${(await this.FPW.getShowUpdNotifications()) === false ? 'Off' : 'On'}`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Update Notification Toggle pressed`);
                                await this.FPW.toggleShowUpdNotifications();
                                this.menuBuilderByType('notifications');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `Vehicle Alerts: ${(await this.FPW.getShowAlertNotifications()) === false ? 'Off' : 'On'}`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Alert Notification Toggle pressed`);
                                await this.FPW.toggleShowAlertNotifications();
                                this.menuBuilderByType('notifications');
                            },
                            destructive: false,
                            show: true,
                        },
                        {
                            title: `Back`,
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Back was pressed`);
                                this.menuBuilderByType('settings');
                            },
                            destructive: false,
                            show: true,
                        },
                    ];
                    break;
                case 'settings':
                    let mapProvider = await this.FPW.getMapProvider();
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
                            title: 'Notifications',
                            action: async() => {
                                console.log(`(${typeDesc} Menu) Notifications was pressed`);
                                this.menuBuilderByType('notifications');
                            },
                            destructive: false,
                            show: true,
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
};
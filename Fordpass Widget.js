// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
/**************
 * Permission to use, copy, modify, and/or distribute this software for any purpose without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER
 * IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
 * OF THIS SOFTWARE.
 *
 *
 * This is a widget for the iOS/iPad/MacOS app named Scriptable https://scriptable.app/ created by Anthony Santilli (https://github.com/tonesto7)
 *
 * Fuel pump Icon made by Kiranshastry from www.flaticon.com
 *
 * Based off the work of others:
 *  - The original Fordpass Scriptable script by Damian Schablowsky  <dschablowsky.dev@gmail.com> (https://github.com/dschablowsky/FordPassWidget)
 *  - Api Logic based on ffpass from https://github.com/d4v3y0rk - thanks a lot for the work!
 *  - WidgetMarkup.js by @rafaelgandi (https://github.com/rafaelgandi/WidgetMarkup-Scriptable)
 *
 *
 * IMPORTANT NOTE: This widget will only work with vehicles that show up in the FordPassFordPass app!
 */

/**************
Changelog:
    v1.0.0:
        - Newly Remastered version of Damians Scriptable widget with a new look and feel
    v1.0.1:
        - Added remote start to ignition status and remote stop to running status
    v1.0.2:
        - Merged in changes from @yuxinli915 pull request
        - Added an vehicle selector to allow quick selection of vehicle icon and name
    v1.0.3:
        - Removed the need to store your login and vehicle info in the script. You will now be prompted for it when the script runs. and it will be stored securely in the apple keychain.
            If you ever need to clear it then just tap on the widget and select settings from the menu and select clear all data. On the next run it prompt you to enter the info again.
        - More code cleanup and added some comments
        - dynamic menu items now show up based on the vehicle capabilities (only filters out zone lighting if it is not supported... for now)
        - Moved widget settings to a settings menu so you no longer need to edit the file
    v1.0.4: 
        - Fixed bugs for the first time run
        - Updated the list of selectable vehicle types.
    v1.0.5: 
        - Fixed bugs with tire pressure showing as an object instead of a number
    v1.0.6: 
        - Fixes for invalid vehicle types
    v1.1.0: 
        - Fixes for login failures.
        - Pulls in your vehicle image from ford.
        - pulls in vehicle capabilties from ford.
        - Many other improvements to support future features.
    v1.1.1: 
        - Added screen size detection to adjust the font size on smaller devices.

**************/
const WIDGET_VERSION = '1.1.1';
//****************************************************************************************************************
//* This widget should work with most vehicles that are supported in the FordPass app!
//****************************************************************************************************************

//******************************************************************
//* Customize Widget Options
//******************************************************************
console.log(Device.screenResolution());
const screenSize = Device.screenResolution().width < 1200 ? 'small' : 'default';

const widgetConfig = {
    debugMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    refreshInterval: 5, // allow data to refresh every (xx) minutes
    useIndicators: true, // indicators for fuel bar
    unitOfLength: (await useMetricUnits()) ? 'km' : 'mi', // unit of length
    distanceMultiplier: (await useMetricUnits()) ? 1 : 0.621371, // distance multiplier
    largeWidget: false, // uses large widget layout, if false, medium layout is used
    alwaysFetch: true, // always fetch data from FordPass, even if it is not needed
    /**
     * Only use the options below if you are experiencing problems. Set them back to false once everything is working.
     * Otherwise the token and the pictures are newly fetched everytime the script is executed.
     */
    clearKeychainOnNextRun: false, // false or true
    clearFileManagerOnNextRun: false, // false or true
};

//******************************************************************
//* Edit these values to accomodate your langauge or prefrerences
//******************************************************************
const textValues = {
    elemHeaders: {
        fuelTank: 'Fuel',
        odometer: 'Mileage',
        oil: 'Oil Life',
        windows: 'Windows',
        doors: 'Doors',
        position: 'Location',
        tirePressure: `Tires (${(await usePsiUnit()) ? 'psi' : 'kPa'})`,
        lockStatus: 'Locks',
        lock: 'Lock',
        unlock: 'Unlock',
        ignitionStatus: 'Ignition',
        batteryStatus: 'Battery',
        remoteStart: 'Remote Start',
    },
    UIValues: {
        closed: 'Closed',
        open: 'Open',
        unknown: 'Unknown',
        greaterOneDay: '> 1 Day',
        smallerOneMinute: '< 1 Min Ago',
        minute: 'Minute',
        hour: 'Hour',
        perYear: 'p.a.',
        plural: 's', // 's' in english
        precedingAdverb: '', // used in german language, for english let it empty
        subsequentAdverb: 'ago', // used in english language ('ago'), for german let it empty
    },
    errorMessages: {
        invalidGrant: 'Incorrect Login Data',
        connectionErrorOrVin: 'Incorrect VIN Number',
        unknownError: 'Unknown Error',
        noData: 'No Data',
        noCredentials: 'Missing Login Credentials',
        noVin: 'VIN Missing',
        cmd_err_590: 'Command Failed!\n\nVehicle failed to start. You must start from inside your vehicle after two consecutive remote start events. ',
        cmd_err: `There was an error sending the command to the vehicle!\n`,
    },
    successMessages: {
        locks_cmd_title: 'Lock Command',
        locked_msg: 'Vehicle Received Lock Command Successfully',
        unlocked_msg: 'Vehicle Received Unlock Command Successfully',
        cmd_success: `Vehicle Received Command Successfully`,
    },
};

//***************************************************************************
//* Customize the Appearance of widget elements when in dark or light mode
//***************************************************************************

const isDarkMode = Device.isUsingDarkAppearance();
const runtimeData = {
    textColor1: isDarkMode ? 'EDEDED' : '000000', // Header Text Color
    textColor2: isDarkMode ? 'EDEDED' : '000000', // Value Text Color
    backColor: isDarkMode ? '111111' : 'FFFFFF', // Background Color'
    backColorGrad: isDarkMode ? ['141414', '13233F'] : ['BCBBBB', 'DDDDDD'], // Background Color Gradient
    fuelIcon: isDarkMode ? 'gas-station_dark.png' : 'gas-station_light.png', // Image for gas station
    lockStatus: isDarkMode ? 'lock_dark.png' : 'lock_light.png', // Image Used for Lock Icon
    lockIcon: isDarkMode ? 'lock_dark.png' : 'lock_light.png', // Image Used for Lock Icon
    tirePressure: isDarkMode ? 'tire_dark.png' : 'tire_light.png', // Image for tire pressure
    unlockIcon: isDarkMode ? 'unlock_dark.png' : 'unlock_light.png', // Image Used for UnLock Icon
    batteryStatus: isDarkMode ? 'battery_dark.png' : 'battery_light.png', // Image Used for Battery Icon
    doors: isDarkMode ? 'door_dark.png' : 'door_light.png', // Image Used for Door Lock Icon
    windows: isDarkMode ? 'window_dark.png' : 'window_light.png', // Image Used for Window Icon
    oil: isDarkMode ? 'oil_dark.png' : 'oil_light.png', // Image Used for Oil Icon
    ignitionStatus: isDarkMode ? 'key_dark.png' : 'key_light.png', // Image Used for Ignition Icon
    keyIcon: isDarkMode ? 'key_dark.png' : 'key_light.png', // Image Used for Key Icon
    position: isDarkMode ? 'location_dark.png' : 'location_light.png', // Image Used for Location Icon
};

const closedSymbol = '✓';
const openSymbol = '✗';

/*
 * Change titleFontSize to 9 and detailFontSizeMedium to 10 for smaller displays, e.g. iPhone SE 2
 */
const sizes = {
    default: {
        titleFontSize: 10,
        detailFontSizeSmall: 10,
        detailFontSizeMedium: 11,
        detailFontSizeBig: 19,
        barWidth: 80,
        barHeight: 10,
    },
    small: {
        titleFontSize: 9,
        detailFontSizeSmall: 8,
        detailFontSizeMedium: 9,
        detailFontSizeBig: 19,
        barWidth: 80,
        barHeight: 10,
    },
};

//******************************************************************************
//* Main Widget Code - ONLY make changes if you know what you are doing!!
//******************************************************************************

// console.log(`ScriptURL: ${URLScheme.forRunningScript()}`);
// console.log(`Script QueryParams: ${args.queryParameter}`);
// console.log(`Script WidgetParams: ${args.widgetParameter}`);
let widget = await createWidget();
if (widget === null) {
    return;
}
widget.setPadding(10, 5, 5, 5);

if (config.runsInWidget) {
    Script.setWidget(widget);
}
// Show alert with current data (if running script in app)
else if (config.runsInApp || config.runsFromHomeScreen) {
    createMainMenu();
} else {
    if (widgetConfig.largeWidget) {
        await widget.presentLarge();
    } else {
        await widget.presentMedium();
    }
}
Script.complete();

//*****************************************************************************************************************************
//*                                              START WIDGET UI ELEMENT FUNCTIONS
//*****************************************************************************************************************************

async function getMainMenuItems() {
    const vehicleData = await fetchVehicleData(true);
    const caps = vehicleData.capabilities && vehicleData.capabilities.length ? vehicleData.capabilities : undefined;
    return [{
            title: 'View Widget',
            action: async() => {
                console.log('(Main Menu) View Widget was pressed');
                await widget.presentMedium();
            },
            destructive: false,
            show: true,
        },
        {
            title: 'Lock Vehicle',
            action: async() => {
                console.log('(Main Menu) Lock was pressed');
                await sendLockCmd();
            },
            destructive: false,
            show: true,
        },
        {
            title: 'Unlock Vehicle',
            action: async() => {
                console.log('(Main Menu) Unlock was pressed');
                await sendUnlockCmd();
            },
            destructive: true,
            show: true,
        },
        {
            title: 'Remote Start (Stop)',
            action: async() => {
                console.log('(Main Menu) Stop was pressed');
                await sendStopCmd();
            },
            destructive: false,
            show: true,
        },
        {
            title: 'Remote Start (Run)',
            action: async() => {
                console.log('(Main Menu) Start was pressed');
                await sendStartCmd();
            },
            destructive: true,
            show: true,
        },
        {
            title: 'Advanced Controls',
            action: async() => {
                console.log('(Main Menu) Advanced Control was pressed');
                await subControlMenu('advancedControl');
            },
            destructive: false,
            show: caps && caps.length && (caps.includes('ZONE_LIGHTING_FOUR_ZONES') || caps.includes('ZONE_LIGHTING_TWO_ZONES') || caps.includes('GUARD_MODE') || caps.includes('TRAILER_LIGHT')),
        },
        {
            title: 'Widget Settings',
            action: async() => {
                console.log('(Main Menu) Widget Settings was pressed');
                createSettingMenu();
            },
            destructive: false,
            show: true,
        },
        {
            title: 'Done',
            action: async() => {
                console.log('(Main Menu) Done was pressed');
            },
            destructive: false,
            show: true,
        },
    ];
}

async function subControlMenu(type) {
    const vehicleData = await fetchVehicleData(true);
    const caps = vehicleData.capabilities && vehicleData.capabilities.length ? vehicleData.capabilities : undefined;
    let title = '';
    let items = [];
    let message = '';
    switch (type) {
        case 'advancedControl':
            title = 'Advanced Controls';
            items = [{
                    title: 'ZoneLighting Control',
                    action: async() => {
                        console.log('(Advanced Controls Menu) Zone Lighting was pressed');
                        await subControlMenu('zoneLighting');
                    },
                    destructive: false,
                    show: caps && caps.length && (caps.includes('ZONE_LIGHTING_FOUR_ZONES') || caps.includes('ZONE_LIGHTING_TWO_ZONES')),
                },
                {
                    title: 'SecuriAlert Control',
                    action: async() => {
                        console.log('(Advanced Controls Menu) SecuriAlert was pressed');
                        await subControlMenu('securiAlert');
                    },
                    destructive: false,
                    show: false, //caps && caps.length && caps.includes('GUARD_MODE'),
                },
                {
                    title: 'Trail Light Check Control',
                    action: async() => {
                        console.log('(Advanced Controls Menu) Trailer Light Check was pressed');
                        await subControlMenu('trailerLightCheck');
                    },
                    destructive: false,
                    show: caps && caps.length && caps.includes('TRAILER_LIGHT'),
                },
                {
                    title: 'Abort',
                    action: async() => {
                        console.log('(Advanced Controls Menu) Done was pressed');
                        getMainMenuItems();
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;
        case 'zoneLighting':
            title = 'Zone Lighting Control';
            message = '';
            items = [{
                    title: 'Turn On All ZoneLighting',
                    action: async() => {
                        console.log('(Zone Lighting Menu) Zone Lighting On was pressed');
                        await sendZoneLightsAllOnCmd();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Turn Off All ZoneLighting',
                    action: async() => {
                        console.log('(Zone Lighting Menu) Zone Lighting Off was pressed');
                        await sendZoneLightsAllOffCmd();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Abort',
                    action: async() => {
                        console.log('(Zone Lighting Menu) Done was pressed');
                        getMainMenuItems();
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;
        case 'securiAlert':
            title = 'SecuriAlert Control';
            message = '';
            items = [{
                    title: 'Disable SecuriAlert',
                    action: async() => {
                        console.log('(SecuriAlert Menu) SecuriAlert Off was pressed');
                        await sendGuardModeOffCmd();
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Enable SecuriAlert',
                    action: async() => {
                        console.log('(SecuriAlert Menu) securiAlert On was pressed');
                        await sendGuardModeOnCmd();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Abort',
                    action: async() => {
                        console.log('(SecuriAlert Menu) SecuriAlert Done was pressed');
                        getMainMenuItems();
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;
        case 'trailerLightCheck':
            title = 'Trailer Lighting Check Control';
            message = '';
            items = [{
                    title: 'Turn On Trailer Light Check',
                    action: async() => {
                        console.log('(Trailer Light Menu) Trailer Light Check On was pressed');
                        await sendTrailerLightCheckOnCmd();
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Turn Off Trailer Light Check',
                    action: async() => {
                        console.log('(Trailer Light Menu) Trailer Light Check Off was pressed');
                        await sendTrailerLightCheckOffCmd();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Abort',
                    action: async() => {
                        console.log('(Trailer Light Menu) Done was pressed');
                        getMainMenuItems();
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;
    }
    if (title.length > 0 && items.length > 0) {
        let menuItems = items.filter((item) => item.show === true);
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
            const menuItem = items[respInd];
            // console.log(`(Sub Control Menu) Selected: ${JSON.stringify(menuItem)}`);
            menuItem.action();
        }
    }
}

async function createMainMenu() {
    const mainMenu = new Alert();
    mainMenu.title = `FordPass Actions`;

    let menuItems = (await getMainMenuItems()).filter((item) => item.show === true);
    // console.log(`Menu Items: (${menuItems.length}) ${JSON.stringify(menuItems)}`);
    menuItems.forEach((item, ind) => {
        if (item.destructive) {
            mainMenu.addDestructiveAction(item.title);
        } else {
            mainMenu.addAction(item.title);
        }
    });
    const respInd = await mainMenu.presentSheet();
    if (respInd !== null) {
        const menuItem = menuItems[respInd];
        // console.log(`(Main Menu) Selected: ${JSON.stringify(menuItem)}`);
        menuItem.action();
    }
}

async function createSettingMenu() {
    const settingMenu = new Alert();
    settingMenu.title = `FordPass Widget Settings`;
    // settingMenu.message = 'These settings allow you to configure FordPass Widget.';

    settingMenu.addAction(`Widget Version: ${WIDGET_VERSION}`); //0
    let useMetric = await useMetricUnits();
    settingMenu.addAction(`Measurement Units: ${useMetric ? 'Metric' : 'Imperial'}`); //1

    let psi = await usePsiUnit();
    settingMenu.addAction(`Pressure Units: ${psi ? 'psi' : 'kPa'}`); //2

    let mapProvider = await getMapProvider();
    settingMenu.addAction(`Map Provider: ${mapProvider === 'apple' ? 'Apple' : 'Google'}`); //3

    settingMenu.addDestructiveAction('Clear All Saved Data'); //4

    settingMenu.addAction('Done'); //5

    const respInd = await settingMenu.presentSheet();

    switch (respInd) {
        case 0:
            console.log('(Setting Menu) Widget Version was pressed');
            createSettingMenu();
            break;
        case 1:
            console.log('(Setting Menu) Measurement Units pressed');
            await toggleUseMetricUnits();
            createSettingMenu();
            break;
        case 2:
            console.log('(Setting Menu) Pressure Units pressed');
            await toggleUsePsiUnits();
            createSettingMenu();
            break;
        case 3:
            console.log('(Setting Menu) Map Provider pressed');
            await toggleMapProvider();
            createSettingMenu();
            break;
        case 4:
            console.log('(Setting Menu) Clear All Data was pressed');
            await clearKeychain();
            await clearFileManager();
            // createSettingMenu();
            break;
        case 5:
            console.log('(Setting Menu) Done was pressed');
            break;
    }
}

function inputTest(val) {
    return val !== '' && val !== null && val !== undefined;
}

async function requiredPrefsMenu() {
    try {
        let user = await getKeychainValue('fpUser');
        let pass = await getKeychainValue('fpPass');
        let vin = await getKeychainValue('fpVin');
        let useMetric = await useMetricUnits();
        let psi = await usePsiUnit();
        let mapProvider = await getMapProvider();

        let prefsMenu = new Alert();
        prefsMenu.title = 'Required Settings Missing';
        prefsMenu.message = 'Please enter you FordPass Credentials and Vehicle VIN.\n\nTap a setting to toggle change\nPress Done to Save.';

        prefsMenu.addTextField('FordPass Email', user || '');
        prefsMenu.addSecureTextField('FordPass Password', pass || '');
        prefsMenu.addTextField('Vehicle VIN', vin || '');

        prefsMenu.addAction(`Measurement Units: ${useMetric ? 'Metric' : 'Imperial'}`); //0

        prefsMenu.addAction(`Pressure Units: ${psi ? 'psi' : 'kPa'}`); //1

        prefsMenu.addAction(`Map Provider: ${mapProvider === 'apple' ? 'Apple' : 'Google'}`); //2

        prefsMenu.addAction('Save'); //3
        prefsMenu.addCancelAction('Cancel'); //4

        let respInd = await prefsMenu.presentAlert();
        switch (respInd) {
            case 0:
                console.log('(Config Menu) Measurement Units pressed');
                await toggleUseMetricUnits();
                requiredPrefsMenu();
                break;
            case 1:
                console.log('(Config Menu) Pressure Units pressed');
                await toggleUsePsiUnits();
                requiredPrefsMenu();
                break;
            case 2:
                console.log('(Config Menu) Map Provider pressed');
                await toggleMapProvider();
                requiredPrefsMenu();
                break;
            case 3:
                console.log('(Config Menu) Done was pressed');
                user = prefsMenu.textFieldValue(0);
                pass = prefsMenu.textFieldValue(1);
                vin = prefsMenu.textFieldValue(2);
                // console.log(`${user} ${pass} ${vin}`);
                if (inputTest(user) && inputTest(pass) && inputTest(vin)) {
                    await setKeychainValue('fpUser', user);
                    await setKeychainValue('fpPass', pass);
                    await setKeychainValue('fpVin', vin);
                    // console.log(`metric: ${useMetric ? 'true' : 'false'} | map: ${mapProvider}`);
                    await setKeychainValue('fpUseMetricUnits', useMetric ? 'true' : 'false');
                    await setKeychainValue('fpUsePsi', psi ? 'true' : 'false');
                    await setKeychainValue('fpMapProvider', mapProvider);
                    return true;
                } else {
                    requiredPrefsMenu();
                }
                break;
            case 4:
                return false;
        }
    } catch (err) {
        console.log(`(Required Prefs Menu) Error: ${err}`);
        throw err;
    }
}

async function createWidget() {
    if (widgetConfig.debugMode) {
        console.log('widgetConfig | DEBUG:');
        for (const k in widgetConfig) {
            console.log(`${k}: ${widgetConfig[k]}`);
        }
    }
    if (widgetConfig.clearKeychainOnNextRun) {
        await clearKeychain();
    }
    if (widgetConfig.clearFileManagerOnNextRun) {
        await clearFileManager();
    }
    let reqOk = await requiredPrefsOk();
    // console.log(`reqOk: ${ukcOk}`);
    if (!reqOk) {
        let prompt = await requiredPrefsMenu();
        if (!prompt) {
            console.log('Login, VIN, or Prefs not set... User cancelled!!!');
            return null;
        }
    }

    let vehicleData = await fetchVehicleData();
    // console.log(`vehicleData: ${JSON.stringify(vehicleData)}`);
    // Defines the Widget Object
    const widget = new ListWidget();
    widget.backgroundGradient = getBgGradient();

    let mainStack = widget.addStack();
    mainStack.layoutVertically();
    mainStack.setPadding(0, 5, 0, 5);

    let contentStack = mainStack.addStack();
    contentStack.layoutHorizontally();

    //*****************
    //* First column
    //*****************
    let mainCol1 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

    // Vehicle Logo
    let vehicleLogoRow = await createRow(mainCol1, { '*centerAlignContent': null });
    let vehicleLogo = vehicleData.info !== undefined && vehicleData.info.vehicle !== undefined ? await createImage(vehicleLogoRow, await getVehicleImage(vehicleData.info.vehicle.modelYear), { imageSize: new Size(85, 45), '*centerAlignImage': null }) : null;
    mainCol1.addSpacer(5);

    // Creates the Fuel Info Elements
    await createFuelElement(mainCol1, vehicleData);

    // Creates the Mileage Info Elements
    await createMileageElement(mainCol1, vehicleData);

    // Creates Battery Level Elements
    await createBatteryElement(mainCol1, vehicleData);

    // Creates Oil Life Elements
    await createOilElement(mainCol1, vehicleData);

    contentStack.addSpacer();

    //*****************************
    //* Large Card Column 1 Row 1
    //*****************************
    if (widgetConfig.largeWidget) {
        mainCol1.addSpacer(40);

        // Element 7
    }

    //************************
    //* Second column
    //************************
    let mainCol2 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

    // Creates the Lock Status Elements
    await createLockStatusElement(mainCol2, vehicleData);

    // Creates the Door Status Elements
    await createDoorElement(mainCol2, vehicleData);

    // Create Tire Pressure Elements
    await createTireElement(mainCol2, vehicleData);

    mainCol2.addSpacer();

    //*****************************
    //* Large Card Column 2 Row 1
    //*****************************
    if (widgetConfig.largeWidget) {
        // Element 11
    }

    contentStack.addSpacer();

    //****************
    //* Third column
    //****************
    let mainCol3 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

    // Creates the Ignition Status Elements
    await createIgnitionStatusElement(mainCol3, vehicleData);

    // Creates the Door Status Elements
    await createWindowElement(mainCol3, vehicleData);

    // Creates the Vehicle Location Element
    await createPositionElement(mainCol3, vehicleData);

    mainCol3.addSpacer();

    contentStack.addSpacer();

    //**********************
    //* Refresh and error
    //*********************
    let infoStack = await createRow(mainStack, { '*layoutHorizontally': null });

    // Creates the Refresh Label to show when the data was last updated from Ford
    let refreshTime = vehicleData.fetchTime ? calculateTimeDifference(vehicleData.fetchTime) : textValues.UIValues.unknown;
    let refreshLabel = await createText(infoStack, refreshTime, { font: Font.mediumSystemFont(sizes[screenSize].detailFontSizeSmall), textColor: Color.lightGray() });

    // Creates Elements to display any errors in red at the bottom of the widget
    infoStack.addSpacer(10);
    let errorMsg = vehicleData.error ? 'Error: ' + vehicleData.error : '';
    let errorLabel = await createText(infoStack, errorMsg, { font: Font.mediumSystemFont(sizes[screenSize].detailFontSizeSmall), textColor: Color.red() });

    return widget;
}

function getBgGradient() {
    let grad = new LinearGradient();
    grad.locations = [0, 1];
    grad.colors = [new Color(runtimeData.backColorGrad[0]), new Color(runtimeData.backColorGrad[1])];
    return grad;
}

async function createColumn(srcField, styles = {}) {
    let col = srcField.addStack();
    col.layoutVertically();
    if (styles && Object.keys(styles).length > 0) {
        _mapMethodsAndCall(col, styles);
    }

    return col;
}

async function createRow(srcField, styles = {}) {
    let row = srcField.addStack();
    row.layoutHorizontally();
    if (styles && Object.keys(styles).length > 0) {
        _mapMethodsAndCall(row, styles);
    }

    return row;
}

async function createText(srcField, text, styles = {}) {
    let txt = srcField.addText(text);
    if (styles && Object.keys(styles).length > 0) {
        _mapMethodsAndCall(txt, styles);
    }
    return txt;
}

async function createImage(srcField, image, styles = {}) {
    let _img = srcField.addImage(image);
    if (styles && Object.keys(styles).length > 0) {
        _mapMethodsAndCall(_img, styles);
    }
    return _img;
}

async function createTitle(headerField, element, icon = undefined) {
    let ico = icon || runtimeData[element];
    if (ico !== undefined) {
        headerField.layoutHorizontally();
        let imgFile = await getImage(ico.toString());
        let titleImg = await createImage(headerField, imgFile, { imageSize: new Size(11, 11) });
        headerField.addSpacer(2);
    }
    let txt = await createText(headerField, textValues.elemHeaders[element] + ':', { font: Font.boldSystemFont(sizes[screenSize].titleFontSize), textColor: new Color(runtimeData.textColor1) });
    // return headerField;
}

async function createProgressBar(percent) {
    let fuelLevel = percent > 100 ? 100 : percent;
    const bar = new DrawContext();
    bar.size = new Size(sizes[screenSize].barWidth, sizes[screenSize].barHeight + 3);
    bar.opaque = false;
    bar.respectScreenScale = true;
    // Background
    const path = new Path();
    path.addRoundedRect(new Rect(0, 0, sizes[screenSize].barWidth, sizes[screenSize].barHeight), 3, 2);
    bar.addPath(path);
    bar.setFillColor(Color.lightGray());
    bar.fillPath();
    // Fuel
    const fuel = new Path();
    fuel.addRoundedRect(new Rect(0, 0, (sizes[screenSize].barWidth * fuelLevel) / 100, sizes[screenSize].barHeight), 3, 2);
    bar.addPath(fuel);
    bar.setFillColor(new Color('2f78dd'));
    bar.fillPath();
    if (widgetConfig.useIndicators) {
        const fuel25Indicator = new Path();
        fuel25Indicator.addRoundedRect(new Rect(sizes[screenSize].barWidth * 0.25, 1, 2, sizes[screenSize].barHeight - 2), 3, 2);
        bar.addPath(fuel25Indicator);
        bar.setFillColor(Color.black());
        bar.fillPath();
        const fuel50Indicator = new Path();
        fuel50Indicator.addRoundedRect(new Rect(sizes[screenSize].barWidth * 0.5, 1, 2, sizes[screenSize].barHeight - 2), 3, 2);
        bar.addPath(fuel50Indicator);
        bar.setFillColor(Color.black());
        bar.fillPath();
        const fuel75Indicator = new Path();
        fuel75Indicator.addRoundedRect(new Rect(sizes[screenSize].barWidth * 0.75, 1, 2, sizes[screenSize].barHeight - 2), 3, 2);
        bar.addPath(fuel75Indicator);
        bar.setFillColor(Color.black());
        bar.fillPath();
    }
    return await bar.getImage();
}

async function createFuelElement(srcField, vehicleData) {
    // Fuel tank header
    let fuelHeaderRow = await createRow(srcField);
    let fuelHeadericon = await createImage(fuelHeaderRow, await getImage(runtimeData.fuelIcon), { imageSize: new Size(11, 11) });
    fuelHeaderRow.addSpacer(3);
    // console.log(`fuelLevel: ${vehicleData.fuelLevel}`);
    let lvlTxt = vehicleData.fuelLevel ? (vehicleData.fuelLevel > 100 ? 100 : vehicleData.fuelLevel) : 50;
    let fuelHeadertext = await createText(fuelHeaderRow, textValues.elemHeaders['fuelTank'], { font: Font.boldSystemFont(sizes[screenSize].titleFontSize), textColor: new Color(runtimeData.textColor1) });
    let fuelHeadertext2 = await createText(fuelHeaderRow, ' (' + lvlTxt + '%):', { font: Font.regularSystemFont(sizes[screenSize].detailFontSizeSmall), textColor: new Color(runtimeData.textColor1) });
    srcField.addSpacer(3);

    // Fuel Level Bar
    let fuelBarCol = await createColumn(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
    let fuelBarRow = await createRow(fuelBarCol, { '*setPadding': [0, 0, 0, 0] });
    let fuelBarImg = await createImage(fuelBarRow, await createProgressBar(vehicleData.fuelLevel ? vehicleData.fuelLevel : 50), { '*centerAlignImage': null, imageSize: new Size(sizes[screenSize].barWidth, sizes[screenSize].barHeight + 3) });

    // Fuel Distance to Empty
    let fuelBarTextRow = await createRow(fuelBarCol, { '*centerAlignContent': null, '*topAlignContent': null });
    let dteInfo = vehicleData.distanceToEmpty ? `    ${Math.floor(vehicleData.distanceToEmpty * widgetConfig.distanceMultiplier)}${widgetConfig.unitOfLength} to E` : textValues.errorMessages.noData;
    let fuelDteRowTxt = await createText(fuelBarTextRow, dteInfo, { '*centerAlignText': null, font: Font.regularSystemFont(sizes[screenSize].detailFontSizeSmall), textColor: new Color(runtimeData.textColor2), lineLimit: 1 });

    srcField.addSpacer(3);
}

async function createMileageElement(srcField, vehicleData) {
    let elem = await createRow(srcField, { '*layoutHorizontally': null });
    await createTitle(elem, 'odometer');
    elem.addSpacer(2);
    let value = vehicleData.odometer ? `${Math.floor(vehicleData.odometer * widgetConfig.distanceMultiplier)}${widgetConfig.unitOfLength}` : textValues.errorMessages.noData;
    // console.log(`odometer: ${value}`);
    let txt = await createText(elem, value, { font: Font.regularSystemFont(sizes[screenSize].detailFontSizeSmall), textColor: new Color(runtimeData.textColor2) });
    srcField.addSpacer(3);
}

async function createBatteryElement(srcField, vehicleData) {
    let elem = await createRow(srcField, { '*layoutHorizontally': null });
    await createTitle(elem, 'batteryStatus');
    elem.addSpacer(2);
    let value = vehicleData.batteryLevel ? `${vehicleData.batteryLevel}V` : 'N/A';
    // console.log(`batteryLevel: ${value}`);
    let txt = await createText(elem, value, { font: Font.regularSystemFont(sizes[screenSize].detailFontSizeSmall), textColor: new Color(runtimeData.textColor2) });
    srcField.addSpacer(3);
}

async function createOilElement(srcField, vehicleData) {
    let elem = await createRow(srcField, { '*layoutHorizontally': null });
    await createTitle(elem, 'oil');
    elem.addSpacer(2);
    let value = vehicleData.oilLife ? `${vehicleData.oilLife}%` : textValues.errorMessages.noData;
    // console.log(`oilLife: ${value}`);
    let txt = await createText(elem, value, { font: Font.regularSystemFont(sizes[screenSize].detailFontSizeSmall), textColor: new Color(runtimeData.textColor2) });
    srcField.addSpacer(3);
}

async function createDoorElement(srcField, vehicleData, countOnly = false) {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(sizes[screenSize].detailFontSizeMedium), textColor: new Color(runtimeData.textColor2) },
        statOpen: { font: Font.heavySystemFont(sizes[screenSize].detailFontSizeMedium), textColor: new Color('FF5733') },
        statClosed: { font: Font.heavySystemFont(sizes[screenSize].detailFontSizeMedium), textColor: new Color('#5A65C0') },
        offset: 10,
    };

    let offset = styles.offset;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'doors');

    // Creates the first row of status elements for LF and RF
    let dataRow1Fld = await createRow(srcField);

    if (countOnly) {
        let value = textValues.errorMessages.noData;
        let countOpenDoors;
        if (vehicleData.statusDoors) {
            countOpenDoors = Object.values(vehicleData.statusDoors).filter((door) => door === true).length;
            value = countOpenDoors == 0 ? textValues.UIValues.closed : `${countOpenDoors} ${textValues.UIValues.open}`;
        }
        let cntOpenTxt = await createText(dataRow1Fld, value, styles.normTxt);
    } else {
        let row1LfTxt1 = await createText(dataRow1Fld, 'LF (', styles.normTxt);
        let row1LfStatTxt = await createText(dataRow1Fld, vehicleData.statusDoors['leftFront'] ? openSymbol : closedSymbol, vehicleData.statusDoors['leftFront'] ? styles.statOpen : styles.statClosed);
        let row1LfTxt2 = await createText(dataRow1Fld, ')' + ' | ', styles.normTxt);
        let row1RfTxt1 = await createText(dataRow1Fld, 'RF (', styles.normTxt);
        let row1RfStatTxt = await createText(dataRow1Fld, vehicleData.statusDoors['rightFront'] ? openSymbol : closedSymbol, vehicleData.statusDoors['rightFront'] ? styles.statOpen : styles.statClosed);
        let row1RfTxt2 = await createText(dataRow1Fld, ')', styles.normTxt);

        // Creates the second row of status elements for LR and RR
        let dataRow2Fld = await createRow(srcField);
        let row2RfTxt1 = await createText(dataRow2Fld, 'LR (', styles.normTxt);
        let row2RfStatTxt = await createText(dataRow2Fld, vehicleData.statusDoors['leftRear'] ? openSymbol : closedSymbol, vehicleData.statusDoors['leftRear'] ? styles.statOpen : styles.statClosed);
        let row2RfTxt2 = await createText(dataRow2Fld, ')' + ' | ', styles.normTxt);
        let row2RrTxt1 = await createText(dataRow2Fld, 'RR (', styles.normTxt);
        let row2RrStatTxt = await createText(dataRow2Fld, vehicleData.statusDoors['rightRear'] ? openSymbol : closedSymbol, vehicleData.statusDoors['rightRear'] ? styles.statOpen : styles.statClosed);
        let row2RrTxt2 = await createText(dataRow2Fld, ')', styles.normTxt);

        // Creates the third row of status elements for the tailgate (if equipped)
        if (vehicleData.statusDoors['tailgate'] !== undefined) {
            let dataRow3Fld = await createRow(srcField);
            let row3TgTxt1 = await createText(dataRow3Fld, '       TG (', styles.normTxt);
            let row3TgStatTxt = await createText(dataRow3Fld, vehicleData.statusDoors['tailgate'] ? openSymbol : closedSymbol, vehicleData.statusDoors['tailgate'] ? styles.statOpen : styles.statClosed);
            let row3TgTxt2 = await createText(dataRow3Fld, ')', styles.normTxt);
            offset = offset - 5;
        }
    }
    srcField.addSpacer(offset);
}

async function createWindowElement(srcField, vehicleData, countOnly = false) {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(sizes[screenSize].detailFontSizeMedium), textColor: new Color(runtimeData.textColor2) },
        statOpen: { font: Font.heavySystemFont(sizes[screenSize].detailFontSizeMedium), textColor: new Color('FF5733') },
        statClosed: { font: Font.heavySystemFont(sizes[screenSize].detailFontSizeMedium), textColor: new Color('#5A65C0') },
        offset: 10,
    };

    let offset = styles.offset;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'windows');

    // Creates the first row of status elements for LF and RF
    let dataRow1Fld = await createRow(srcField);
    if (countOnly) {
        let value = textValues.errorMessages.noData;
        let countOpenWindows;
        if (vehicleData.statusWindows) {
            countOpenWindows = Object.values(vehicleData.statusWindows).filter((window) => window === true).length;
            value = countOpenWindows == 0 ? textValues.UIValues.closed : `${countOpenWindows} ${textValues.UIValues.open}`;
        }
        let cntOpenTxt = await createText(dataRow1Fld, value, styles.normTxt);
    } else {
        let row1LfTxt1 = await createText(dataRow1Fld, 'LF (', styles.normTxt);
        let row1LfStatTxt = await createText(dataRow1Fld, vehicleData.statusWindows['leftFront'] ? openSymbol : closedSymbol, vehicleData.statusWindows['leftFront'] ? styles.statOpen : styles.statClosed);
        let row1LfTxt2 = await createText(dataRow1Fld, ')' + ' | ', styles.normTxt);
        let row1RfTxt1 = await createText(dataRow1Fld, 'RF (', styles.normTxt);
        let row1RfStatTxt = await createText(dataRow1Fld, vehicleData.statusWindows['rightFront'] ? openSymbol : closedSymbol, vehicleData.statusWindows['rightFront'] ? styles.statOpen : styles.statClosed);
        let row1RfTxt2 = await createText(dataRow1Fld, ')', styles.normTxt);

        // Creates the second row of status elements for LR and RR
        let dataRow2Fld = await createRow(srcField);
        let row2RfTxt1 = await createText(dataRow2Fld, 'LR (', styles.normTxt);
        let row2RfStatTxt = await createText(dataRow2Fld, vehicleData.statusWindows['leftRear'] ? openSymbol : closedSymbol, vehicleData.statusWindows['leftRear'] ? styles.statOpen : styles.statClosed);
        let row2RfTxt2 = await createText(dataRow2Fld, ')' + ' | ', styles.normTxt);
        let row2RrTxt1 = await createText(dataRow2Fld, 'RR (', styles.normTxt);
        let row2RrStatTxt = await createText(dataRow2Fld, vehicleData.statusWindows['rightRear'] ? openSymbol : closedSymbol, vehicleData.statusWindows['rightRear'] ? styles.statOpen : styles.statClosed);
        let row2RrTxt2 = await createText(dataRow2Fld, ')', styles.normTxt);

        if (vehicleData.statusDoors['tailgate'] !== undefined) {
            offset = offset + 10;
        }
    }
    srcField.addSpacer(offset);
}

async function createTireElement(srcField, vehicleData) {
    let offset = 0;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'tirePressure');

    let dataFld = await createRow(srcField);
    let value = `${vehicleData.tirePressure['leftFront']} | ${vehicleData.tirePressure['rightFront']}\n${vehicleData.tirePressure['leftRear']} | ${vehicleData.tirePressure['rightRear']}`;
    let txt = await createText(dataFld, value, { font: new Font('Menlo-Regular', sizes[screenSize].detailFontSizeMedium), textColor: new Color(runtimeData.textColor2), lineLimit: 2 });
    srcField.addSpacer(offset);
}

async function createPositionElement(srcField, vehicleData) {
    let offset = 0;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'position');

    let dataFld = await createRow(srcField);
    let url = (await getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vehicleData.latitude},${vehicleData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vehicleData.info.vehicle.nickName)}&ll=${vehicleData.latitude},${vehicleData.longitude}`;
    let value = vehicleData.position ? `${vehicleData.position}` : textValues.errorMessages.noData;
    let text = await createText(dataFld, value, { url: url, font: Font.mediumSystemFont(sizes[screenSize].detailFontSizeMedium), textColor: new Color(runtimeData.textColor2), lineLimit: 2, minimumScaleFactor: 0.7 });
    srcField.addSpacer(offset);
}

async function createLockStatusElement(srcField, vehicleData) {
    const styles = {
        statOpen: { font: Font.mediumSystemFont(sizes[screenSize].detailFontSizeMedium), textColor: new Color('#FF5733'), lineLimit: 1 },
        statClosed: { font: Font.mediumSystemFont(sizes[screenSize].detailFontSizeMedium), textColor: new Color('#5A65C0'), lineLimit: 1 },
    };
    let offset = 10;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'lockStatus');
    titleFld.addSpacer(2);
    let dataFld = await createRow(srcField);
    let value = vehicleData.lockStatus ? vehicleData.lockStatus : textValues.errorMessages.noData;
    let text = await createText(dataFld, value, vehicleData.lockStatus !== undefined && vehicleData.lockStatus === 'LOCKED' ? styles.statClosed : styles.statOpen);
    srcField.addSpacer(offset);
}

async function createIgnitionStatusElement(srcField, vehicleData) {
    const styles = {
        statOn: { font: Font.mediumSystemFont(sizes[screenSize].detailFontSizeMedium), textColor: new Color('#FF5733') },
        statOff: { font: Font.mediumSystemFont(sizes[screenSize].detailFontSizeMedium), textColor: new Color('#5A65C0') },
    };
    let remStartOn = vehicleData.remoteStartStatus && vehicleData.remoteStartStatus.running ? true : false;
    let status = '';
    if (remStartOn) {
        status = `Remote Start (ON)`;
    } else if (vehicleData.ignitionStatus != undefined) {
        status = vehicleData.ignitionStatus.toUpperCase();
    } else {
        textValues.errorMessages.noData;
    }
    let offset = 10;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'ignitionStatus');
    titleFld.addSpacer(2);
    let dataFld = await createRow(srcField);
    let text = await createText(dataFld, status, (vehicleData.ignitionStatus !== undefined && vehicleData.ignitionStatus === 'On') || remStartOn ? styles.statOn : styles.statOff);
    srcField.addSpacer(offset);
}

//***************************************************END WIDGET ELEMENT FUNCTIONS********************************************************
//***************************************************************************************************************************************

//*****************************************************************************************************************************
//*                                                  START FORDPASS API FUNCTIONS
//*****************************************************************************************************************************

async function fetchToken() {
    let username = await getKeychainValue('fpUser');
    if (!username) {
        return textValues.errorMessages.noCredentials;
    }
    let password = await getKeychainValue('fpPass');
    if (!password) {
        return textValues.errorMessages.noCredentials;
    }

    let req = new Request('https://fcis.ice.ibmcloud.com/v1.0/endpoint/default/token');
    req.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
        'Accept-Encoding': 'gzip, deflate, br',
    };
    req.method = 'POST';
    req.body = `client_id=9fb503e0-715b-47e8-adfd-ad4b7770f73b&grant_type=password&username=${username}&password=${password}`;

    try {
        let token = await req.loadJSON();
        if (token.error && token.error == 'invalid_grant') {
            if (widgetConfig.debugMode) {
                console.log('Debug: Error while receiving auth data');
                console.log(token);
            }
            return textValues.errorMessages.invalidGrant;
        }
        if (widgetConfig.debugMode) {
            console.log('Debug: Received auth data from ford server');
            console.log(token);
        }
        await setKeychainValue('fpToken', token.access_token);
    } catch (e) {
        console.log(`Error: ${e}`);
        if (e.error && e.error == 'invalid_grant') {
            return textValues.errorMessages.invalidGrant;
        }
        throw e;
    }
}

async function getVehicleStatus() {
    let vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues.errorMessages.noVin;
    }
    return await makeFordRequest('getVehicleStatus', `https://usapi.cv.ford.com/api/vehicles/v4/${vin}/status`, 'GET', false);
}

async function getVehicleInfo() {
    let vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues.errorMessages.noVin;
    }
    return await makeFordRequest('getVehicleInfo', `https://usapi.cv.ford.com/api/users/vehicles/${vin}/detail?lrdt=01-01-1970%2000:00:00`, 'GET', false);
}

async function getVehicleCapabilities() {
    let vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues.errorMessages.noVin;
    }
    let data = await makeFordRequest('getVehicleCapabilities', `https://api.mps.ford.com/api/capability/v1/vehicles/${vin}`, 'GET', false);
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

async function getVehicleOtaInfo(brand, locale = 'en-US') {
    let token = await getKeychainValue('fpToken');
    let vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues.errorMessages.noVin;
    }
    return await makeFordRequest('getVehicleOtaInfo', `https://www.digitalservices.ford.com/owner/api/v2/sync/firmware-update?vin=${vin}&locale=${locale.toLowerCase()}&brand=${brand.toLowerCase()}`, 'POST', false);
}

async function makeFordRequest(desc, url, method, json = false, headerOverride = undefined, body = undefined) {
    if (!(await hasKeychainValue('fpToken'))) {
        //Code is executed on first run
        let result = await fetchToken();
        if (result && result == textValues.errorMessages.invalidGrant) {
            return result;
        }
        if (result && result == textValues.errorMessages.noCredentials) {
            return result;
        }
    }
    let token = await getKeychainValue('fpToken');
    let vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues.errorMessages.noVin;
    }
    const headers = headerOverride || {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
        'Application-Id': '71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592',
        'auth-token': `${token}`,
    };

    let request = new Request(url);
    request.headers = headers;
    request.method = method;
    if (body) {
        request.body = JSON.stringify(body);
    }
    try {
        let data = json ? await request.loadJSON() : await request.loadString();
        if (data == 'Access Denied') {
            console.log(`makeFordRequest(${desc}): Auth Token Expired. Fetching New Token and Requesting Data Again!`);
            // await removeKeychainValue('fpToken');
            let result = await fetchToken();
            if (result && result == textValues.errorMessages.invalidGrant) {
                return result;
            }
            data = await makeFordRequest(desc, url, method, json, body);
        } else {
            data = json ? data : JSON.parse(data);
        }
        if (data.status && data.status !== 200) {
            return textValues.errorMessages.connectionErrorOrVin;
        }
        return data;
    } catch (e) {
        console.log(`makeFordRequest | ${desc} | Error: ${e}`);
        return textValues.errorMessages.unknownError;
    }
}

async function showAlert(title, message) {
    let alert = new Alert();
    alert.title = title;
    alert.message = message;
    alert.addAction('OK');
    const respInd = await alert.presentAlert();
    // console.log(`showAlert Response: ${respInd}`);
    switch (respInd) {
        case 0:
            // console.log(`${title} alert was cleared...`);
            return true;
    }
}

const vehicleCmdConfigs = (vin) => {
    const baseUrl = 'https://usapi.cv.ford.com/api';
    const guardUrl = 'https://api.mps.ford.com/api';
    return {
        lock: {
            desc: 'Lock Vehicle',
            cmd: 'sendLockCmd',
            cmds: [{
                uri: `${baseUrl}/vehicles/${vin}/doors/lock`,
                method: 'PUT',
            }, ],
        },
        unlock: {
            desc: 'Unlock Vehicle',
            cmd: 'sendUnlockCmd',
            cmds: [{
                uri: `${baseUrl}/vehicles/${vin}/doors/lock`,
                method: 'DELETE',
            }, ],
        },
        start: {
            desc: 'Remote Start Vehicle',
            cmd: 'sendStartCmd',
            cmds: [{
                uri: `${baseUrl}/vehicles/${vin}/engine/start`,
                method: 'PUT',
            }, ],
        },
        stop: {
            desc: 'Remote Stop Vehicle',
            cmd: 'sendStopCmd',
            cmds: [{
                uri: `${baseUrl}/vehicles/${vin}/engine/start`,
                method: 'DELETE',
            }, ],
        },
        zone_lights_off: {
            desc: 'Zone Off Zone Lighting (All Lights)',
            cmd: 'sendZoneLightsOffCmd',
            cmds: [{
                    uri: `${baseUrl}/vehicles/${vin}/zonelightingactivation`,
                    method: 'DELETE',
                },
                {
                    uri: `${baseUrl}/vehicles/${vin}/0/zonelighting`,
                    method: 'DELETE',
                },
            ],
        },
        zone_lights_on: {
            desc: 'Turn On Zone Lighting (All Lights)',
            cmd: 'sendZoneLightsOnCmd',
            cmds: [{
                    uri: `${baseUrl}/vehicles/${vin}/zonelightingactivation`,
                    method: 'PUT',
                },
                {
                    uri: `${baseUrl}/vehicles/${vin}/0/zonelighting`,
                    method: 'PUT',
                },
            ],
        },
        guard_mode_on: {
            desc: 'Enable SecuriAlert',
            cmd: 'sendGuardModeOnCmd',
            cmds: [{
                uri: `${guardUrl}/guardmode/v1/${vin}/session`,
                method: 'PUT',
            }, ],
        },
        guard_mode_off: {
            desc: 'Disable SecuriAlert',
            cmd: 'sendGuardModeOffCmd',
            cmds: [{
                uri: `${guardUrl}/guardmode/v1/${vin}/session`,
                method: 'DELETE',
            }, ],
        },
        trailer_light_check_on: {
            desc: 'Trailer Light Check ON',
            cmd: 'sendTrailLightCheckOnCmd',
            cmds: [{
                uri: `${baseUrl}/vehicles/${vin}/trailerlightcheckactivation`,
                method: 'PUT',
            }, ],
        },
        trailer_light_check_off: {
            desc: 'Trailer Light Check OFF',
            cmd: 'sendTrailLightCheckOffCmd',
            cmds: [{
                uri: `${baseUrl}/vehicles/${vin}/trailerlightcheckactivation`,
                method: 'DELETE',
            }, ],
        },
        status: {
            desc: 'Refresh Vehicle Status',
            cmd: 'sendStatusCmd',
            cmds: [{
                uri: `${baseUrl}/vehicles/${vin}/status`,
                method: 'PUT',
            }, ],
        },
    };
};

async function sendVehicleCmd(cmd_type = '') {
    if (!(await hasKeychainValue('fpToken'))) {
        //Code is executed on first run
        let result = await fetchToken();
        if (result && result == textValues.errorMessages.invalidGrant) {
            console.log(`sendVehicleCmd(${cmd_type}): ${result}`);
            return;
        }
        if (result && result == textValues.errorMessages.noCredentials) {
            console.log(`sendVehicleCmd(${cmd_type}): ${result}`);
            return;
        }
    }
    let token = await getKeychainValue('fpToken');
    let vin = await getKeychainValue('fpVin');
    let cmdCfgs = vehicleCmdConfigs(vin);
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
            'User-Agent': 'FordPass/4 CFNetwork/1312 Darwin/21.0.0',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/json',
            'Application-Id': '71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592',
            'auth-token': `${token}`,
        };
        req.method = cmds[cmd].method;

        try {
            let data = await req.loadString();
            // console.log(data);
            if (data == 'Access Denied') {
                console.log('sendVehicleCmd: Auth Token Expired. Fetching new token and fetch raw data again');
                let result = await fetchToken();
                if (result && result == textValues.errorMessages.invalidGrant) {
                    console.log(`sendVehicleCmd(${cmd_type}): ${result}`);
                    return;
                }
                data = await req.loadString();
            }
            data = JSON.parse(data);

            // console.log(JSON.stringify(data));

            if (data.status) {
                console.log(`sendVehicleCmd(${cmd_type}) Status Code (${data.status})`);
                if (data.status !== 200) {
                    wasError = true;
                    if (widgetConfig.debugMode) {
                        console.log('Debug: Error while receiving vehicle data');
                        console.log(data);
                    }
                    if (data.status === 590) {
                        console.log('code 590');
                        console.log(`isLastCmd: ${isLastCmd}`);
                        outMsg = { title: `${cmdDesc} Command`, message: textValues.errorMessages.cmd_err_590 };
                    } else {
                        errMsg = `Command Error: ${JSON.stringify(data)}`;
                        outMsg = { title: `${cmdDesc} Command`, message: `${textValues.errorMessages.cmd_err}\n\Error: ${data.status}` };
                    }
                } else {
                    outMsg = { title: `${cmdDesc} Command`, message: textValues.successMessages.cmd_success };
                }
            }

            if (wasError) {
                if (errMsg) {
                    console.log(`sendVehicleCmd(${cmd_type}) Error: ${errMsg}`);
                }
                if (outMsg.message !== '') {
                    await showAlert(outMsg.title, outMsg.message);
                }
                return;
            } else {
                if (isLastCmd) {
                    console.log(`sendVehicleCmd(${cmd_type}) Success`);
                    await showAlert(outMsg.title, outMsg.message);
                }
            }
        } catch (e) {
            console.log(`sendVehicleCmd Catch Error: ${e}`);
            return;
        }
    }
    return;
}

async function sendLockCmd() {
    await sendVehicleCmd('lock');
}

async function sendUnlockCmd() {
    await sendVehicleCmd('unlock');
}

async function sendStartCmd() {
    await sendVehicleCmd('start');
}

async function sendStopCmd() {
    await sendVehicleCmd('stop');
}

async function sendStatusCmd() {
    await sendVehicleCmd('status');
}

async function sendGuardModeOnCmd() {
    await sendVehicleCmd('guard_mode_on');
}

async function sendGuardModeOffCmd() {
    await sendVehicleCmd('guard_mode_off');
}

async function sendZoneLightsAllOnCmd() {
    await sendVehicleCmd('zone_lights_on');
}

async function sendZoneLightsAllOffCmd() {
    await sendVehicleCmd('zone_lights_off');
}

async function sendTrailerLightCheckOnCmd() {
    await sendVehicleCmd('trailer_light_check_on');
}

async function sendTrailerLightCheckOffCmd() {
    await sendVehicleCmd('trailer_light_check_off');
}

async function getKeychainValue(cred) {
    try {
        if (await Keychain.contains(cred)) {
            return await Keychain.get(cred);
        }
    } catch (e) {
        console.log(`getKeychainValue(${cred}) Error: ${e}`);
    }
    return null;
}

async function setKeychainValue(key, value) {
    await Keychain.set(key, value);
}

function hasKeychainValue(key) {
    return Keychain.contains(key);
}

async function removeKeychainValue(key) {
    if (await Keychain.contains(key)) {
        await Keychain.remove(key);
    }
}

async function requiredPrefsOk() {
    let user = (await getKeychainValue('fpUser')) === null || (await getKeychainValue('fpUser')) === '' || (await getKeychainValue('fpUser')) === undefined;
    let pass = (await getKeychainValue('fpPass')) === null || (await getKeychainValue('fpPass')) === '' || (await getKeychainValue('fpPass')) === undefined;
    let vin = (await getKeychainValue('fpVin')) === null || (await getKeychainValue('fpVin')) === '' || (await getKeychainValue('fpVin')) === undefined;
    let metric = (await getKeychainValue('fpUseMetricUnits')) === null || (await getKeychainValue('fpUseMetricUnits')) === '' || (await getKeychainValue('fpUseMetricUnits')) === undefined;
    let psi = (await getKeychainValue('fpUsePsi')) === null || (await getKeychainValue('fpUsePsi')) === '' || (await getKeychainValue('fpUsePsi')) === undefined;
    let map = (await getKeychainValue('fpMapProvider')) === null || (await getKeychainValue('fpMapProvider')) === '' || (await getKeychainValue('fpMapProvider')) === undefined;
    let missing = user || pass || vin || metric || psi || map;
    // console.log(`requiredPrefsOk: ${!missing}`);
    return !missing;
}

function clearKeychain() {
    console.log('Info: Clearing Authentication from Keychain');
    ['fpToken', 'fpUsername', 'fpUser', 'fpPass', 'fpPassword', 'fpVin', 'fpUseMetricUnits', 'fpUsePsi', 'fpVehicleType', 'fpMapProvider'].forEach(async(key) => {
        await removeKeychainValue(key);
    });
}

//from local store if last fetch is < x minutes, otherwise fetch from server
async function fetchVehicleData(loadLocal = false) {
    //Fetch data from local store
    if ((!widgetConfig.alwaysFetch && isLocalDataFreshEnough()) || loadLocal) {
        return readLocalData();
    }

    //fetch data from server
    console.log('fetchVehicleData: Fetching Vehicle Data from Ford Servers...');
    let statusData = await getVehicleStatus();

    // console.log(`statusData: ${JSON.stringify(statusData)}`);
    let vehicleData = new Object();
    if (statusData == textValues.errorMessages.invalidGrant || statusData == textValues.errorMessages.connectionErrorOrVin || statusData == textValues.errorMessages.unknownError || statusData == textValues.errorMessages.noVin || statusData == textValues.errorMessages.noCredentials) {
        // console.log('fetchVehicleData | Error: ' + statusData);
        let localData = readLocalData();
        if (localData) {
            vehicleData = localData;
        }
        if (statusData == textValues.errorMessages.invalidGrant) {
            console.log(`fetchVehicleData | Error: ${statusData} | Clearing Authentication from Keychain`);
            await removeKeychainValue('fpPass');
            // await removeLocalData();
        }
        vehicleData.error = statusData;
        return vehicleData;
    }

    let infoData = await getVehicleInfo();
    // console.log(`infoData: ${JSON.stringify(infoData)}`);
    vehicleData.info = infoData;

    let capData = await getVehicleCapabilities();
    // console.log(`capData: ${JSON.stringify(capData)}`);
    vehicleData.capabilities = capData;

    // if (infoData && infoData.vehicle && infoData.vehicle.brandCode) {
    //     let otaData = await getVehicleOtaInfo(infoData.vehicle.brandCode);
    //     console.log(`otaData: ${JSON.stringify(otaData)}`);
    //     vehicleData.otaInfo = otaData;
    // }
    // console.log(JSON.stringify(vehicleData));

    let vehicleStatus = statusData.vehiclestatus;

    vehicleData.fetchTime = Date.now();

    //odometer
    vehicleData.odometer = vehicleStatus.odometer.value;

    //oil life
    vehicleData.oilLife = vehicleStatus.oil.oilLifeActual;

    //door lock status
    vehicleData.lockStatus = vehicleStatus.lockStatus.value;

    //ignition status
    vehicleData.ignitionStatus = vehicleStatus.ignitionStatus ? vehicleStatus.ignitionStatus.value : 'Off';

    //zone-lighting status
    vehicleData.zoneLightingSupported = vehicleStatus.zoneLighting && vehicleStatus.zoneLighting.activationData && vehicleStatus.zoneLighting.activationData.value === undefined ? false : true;
    vehicleData.zoneLightsStatus = vehicleStatus.zoneLighting && vehicleStatus.zoneLighting.activationData && vehicleStatus.zoneLighting.activationData.value ? vehicleStatus.zoneLighting.activationData.value : 'Off';

    // Remote Start status
    vehicleData.remoteStartStatus = {
        running: vehicleStatus.remoteStartStatus ? (vehicleStatus.remoteStartStatus.value === 0 ? false : true) : false,
        duration: vehicleStatus.remoteStart && vehicleStatus.remoteStart.remoteStartDuration ? vehicleStatus.remoteStart.remoteStartDuration.value : 0,
    };
    // console.log(`Remote Start Status: ${JSON.stringify(vehicleStatus.remoteStart)}`);

    // Alarm status
    vehicleData.alarmStatus = vehicleStatus.alarm ? (vehicleStatus.alarm.value === 'SET' ? 'On' : 'Off') : 'Off';

    //Battery info
    vehicleData.batteryStatus = vehicleStatus.battery && vehicleStatus.battery.batteryHealth ? vehicleStatus.battery.batteryHealth.value : textValues.UIValues.unknown;
    vehicleData.batteryLevel = vehicleStatus.battery && vehicleStatus.battery.batteryStatusActual ? vehicleStatus.battery.batteryStatusActual.value : textValues.UIValues.unknown;

    // Whether Vehicle is in deep sleep mode (Battery Saver) | Supported Vehicles Only
    vehicleData.deepSleepMode = vehicleStatus.deepSleepInProgess ? vehicleStatus.deepSleepInProgess.value === 'true' : undefined;

    // Whether Vehicle is currently installing and OTA update (OTA) | Supported Vehicles Only
    vehicleData.firmwareUpdating = vehicleStatus.firmwareUpgInProgress ? vehicleStatus.firmwareUpgInProgress.value === 'true' : undefined;

    //distance to empty
    vehicleData.distanceToEmpty = vehicleStatus.fuel.distanceToEmpty;

    //fuel level
    vehicleData.fuelLevel = Math.floor(vehicleStatus.fuel.fuelLevel);

    //position of car
    vehicleData.position = await getPosition(vehicleStatus);
    vehicleData.latitude = parseFloat(vehicleStatus.gps.latitude);
    vehicleData.longitude = parseFloat(vehicleStatus.gps.longitude);

    // true means, that window is open
    let windows = vehicleStatus.windowPosition;
    //console.log("windows:", JSON.stringify(windows));
    vehicleData.statusWindows = {
        leftFront: !['Fully_Closed', 'Fully closed position', 'Undefined window position'].includes(windows.driverWindowPosition.value),
        rightFront: !['Fully_Closed', 'Fully closed position', 'Undefined window position'].includes(windows.passWindowPosition.value),
        leftRear: !['Fully_Closed', 'Fully closed position', 'Undefined window position'].includes(windows.rearDriverWindowPos.value),
        rightRear: !['Fully_Closed', 'Fully closed position', 'Undefined window position'].includes(windows.rearPassWindowPos.value),
    };

    //true means, that door is open
    let doors = vehicleStatus.doorStatus;
    vehicleData.statusDoors = {
        leftFront: !(doors.driverDoor.value == 'Closed'),
        rightFront: !(doors.passengerDoor.value == 'Closed'),
        leftRear: !(doors.leftRearDoor.value == 'Closed'),
        rightRear: !(doors.rightRearDoor.value == 'Closed'),
    };
    if (doors.hoodDoor && doors.hoodDoor.value !== undefined) {
        vehicleData.statusDoors.hood = !(doors.hoodDoor.value == 'Closed');
    }
    if (doors.tailgateDoor && doors.tailgateDoor.value !== undefined) {
        vehicleData.statusDoors.tailgate = !(doors.tailgateDoor.value == 'Closed');
    }

    //tire pressure
    let tpms = vehicleStatus.TPMS;
    vehicleData.tirePressure = {
        leftFront: await pressureToFixed(tpms.leftFrontTirePressure.value, 1),
        rightFront: await pressureToFixed(tpms.rightFrontTirePressure.value, 1),
        leftRear: await pressureToFixed(tpms.outerLeftRearTirePressure.value, 1),
        rightRear: await pressureToFixed(tpms.outerRightRearTirePressure.value, 1),
    };
    // console.log(JSON.stringify(vehicleData))

    //save data to local store
    saveDataToLocal(vehicleData);

    return vehicleData;
}

//******************************************** END FORDPASS API FUNCTIONS *********************************************************
//*********************************************************************************************************************************

//********************************************************************************************************************************
//*                                             START FILE/KEYCHAIN MANAGEMENT FUNCTIONS
//********************************************************************************************************************************

async function useMetricUnits() {
    return (await getKeychainValue('fpUseMetricUnits')) === 'true';
}

async function setUseMetricUnits(value) {
    await setKeychainValue('fpUseMetricUnits', value.toString());
}

async function toggleUseMetricUnits() {
    setUseMetricUnits((await useMetricUnits()) ? 'false' : 'true');
}

async function usePsiUnit() {
    return (await getKeychainValue('fpUsePsi')) !== 'false';
}

async function setUsePsiUnit(value) {
    await setKeychainValue('fpUsePsi', value.toString());
}

async function toggleUsePsiUnits() {
    setUsePsiUnit((await usePsiUnit()) ? 'false' : 'true');
}

async function getMapProvider() {
    return (await getKeychainValue('fpMapProvider')) || 'apple';
}

async function setMapProvider(value) {
    await setKeychainValue('fpMapProvider', value);
}

async function toggleMapProvider() {
    await setMapProvider((await getMapProvider()) === 'google' ? 'apple' : 'google');
}

// get images from local filestore or download them once
async function getImage(image) {
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    let path = fm.joinPath(dir, image);
    if (fm.fileExists(path)) {
        return fm.readImage(path);
    } else {
        // download once
        let repoPath = 'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/icons/';
        let imageUrl;
        switch (image) {
            case 'gas-station_light.png':
                imageUrl = 'https://i.imgur.com/gfGcVmg.png';
                break;
            case 'gas-station_dark.png':
                imageUrl = 'https://i.imgur.com/hgYWYC0.png';
                break;
            default:
                imageUrl = 'https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/icons/' + image;
                // console.log(`FP: Sorry, couldn't find a url for ${image}.`);
        }
        let iconImage = await loadImage(imageUrl);
        fm.writeImage(path, iconImage);
        return iconImage;
    }
}

async function getVehicleImage(modelYear) {
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    let path = fm.joinPath(dir, 'vehicle.png');
    if (fm.fileExists(path)) {
        return fm.readImage(path);
    } else {
        let vin = await getKeychainValue('fpVin');
        let token = await getKeychainValue('fpToken');
        // console.log(`modelYear: ${modelYear}`);
        let req = new Request(`https://www.digitalservices.ford.com/fs/api/v2/vehicles/image/full?vin=${vin}&year=${modelYear}&countryCode=USA&angle=4`);
        req.headers = {
            'Content-Type': 'application/json',
            Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
            'Accept-Encoding': 'gzip, deflate, br',
            'auth-token': `${token}`,
        };
        req.method = 'GET';
        try {
            let img = await req.loadImage();
            fm.writeImage(path, img);
            return img;
        } catch (e) {
            console.log(`getVehicleImage Error: Could Not Load Vehicle Image. ${e}`);
        }
    }
}

async function loadImage(imgUrl) {
    try {
        const req = new Request(imgUrl);
        return await req.loadImage();
    } catch (e) {
        console.log(`loadImage Error: Could Not Load Image from ${imgUrl}.`);
        return undefined;
    }
}

function saveDataToLocal(data) {
    console.log('FileManager: Saving New Vehicle Data to Local Storage...');
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    let path = fm.joinPath(dir, 'fp_vehicleData.json');
    if (fm.fileExists(path)) {
        fm.remove(path);
    } //clean old data
    fm.writeString(path, JSON.stringify(data));
}

function readLocalData() {
    console.log('FileManager: Retrieving Vehicle Data from Local Storage...');
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    let path = fm.joinPath(dir, 'fp_vehicleData.json');
    if (fm.fileExists(path)) {
        let localData = fm.readString(path);
        return JSON.parse(localData);
    }
    return null;
}

async function removeLocalData(filename) {
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    let path = fm.joinPath(dir, filename);
    if (fm.fileExists(path)) {
        await fm.remove(path);
    }
}

function isLocalDataFreshEnough() {
    let localData = readLocalData();
    if (localData && Date.now() - localData.fetchTime < 60000 * widgetConfig.refreshInterval) {
        return true;
    } else {
        return false;
    }
}

async function clearFileManager() {
    console.log('Info: Clearing All Files from Local Directory');
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    fm.listContents(dir).forEach(async(file) => {
        await removeLocalData(file);
    });
}

//************************************************** END FILE MANAGEMENT FUNCTIONS************************************************
//********************************************************************************************************************************

//********************************************************************************************************************************
// ***********************************************START UTILITY FUNCTIONS ********************************************************
//********************************************************************************************************************************

async function getPosition(data) {
    let loc = await Location.reverseGeocode(parseFloat(data.gps.latitude), parseFloat(data.gps.longitude));
    return `${loc[0].postalAddress.street}, ${loc[0].postalAddress.city}`;
}

function calculateTimeDifference(oldTime) {
    let newTime = Date.now();
    let diffMs = newTime - oldTime;
    if (Math.floor(diffMs / 86400000) >= 1) {
        return textValues.UIValues.greaterOneDay;
    }
    if (Math.floor((diffMs % 86400000) / 3600000) >= 1) {
        let diff = Math.floor((diffMs % 86400000) / 3600000);
        return `${textValues.UIValues.precedingAdverb} ${diff} ${textValues.UIValues.hour}${diff == 1 ? '' : textValues.UIValues.plural} ${textValues.UIValues.subsequentAdverb}`;
    }
    if (Math.round(((diffMs % 86400000) % 3600000) / 60000) >= 1) {
        let diff = Math.round(((diffMs % 86400000) % 3600000) / 60000);
        return `${textValues.UIValues.precedingAdverb} ${diff} ${textValues.UIValues.minute}${diff == 1 ? '' : textValues.UIValues.plural} ${textValues.UIValues.subsequentAdverb}`;
    }
    return textValues.UIValues.smallerOneMinute;
}

async function pressureToFixed(pressure, digits) {
    if (!(await usePsiUnit()) || (await useMetricUnits())) {
        return pressure || -1;
    } else {
        return pressure ? (pressure * 0.145).toFixed(digits) : -1;
    }
}

// Shamelessly borrowed from WidgetMarkup.js by @rafaelgandi
function _getObjectClass(obj) {
    // See: https://stackoverflow.com/a/12730085
    if (obj && obj.constructor && obj.constructor.toString) {
        let arr = obj.constructor.toString().match(/function\s*(\w+)/);
        if (arr && arr.length == 2) {
            return arr[1];
        }
    }
    return undefined;
}

function _mapMethodsAndCall(inst, options) {
    Object.keys(options).forEach((key) => {
        if (key.indexOf('*') !== -1) {
            key = key.replace('*', '');
            if (!(key in inst)) {
                throw new Error(`Method "${key}()" is not applicable to instance of ${_getObjectClass(inst)}`);
            }
            if (Array.isArray(options['*' + key])) {
                inst[key](...options['*' + key]);
            } else {
                inst[key](options[key]);
            }
        } else {
            if (!(key in inst)) {
                throw new Error(`Property "${key}" is not applicable to instance of ${_getObjectClass(inst)}`);
            }
            inst[key] = options[key];
        }
    });
    return inst;
}

//************************************************* END UTILITY FUNCTIONS ********************************************************
//********************************************************************************************************************************
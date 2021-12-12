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

**************/
const WIDGET_VERSION = '1.0.6';
//****************************************************************************************************************
//* This widget should work with most vehicles that are supported in the FordPass app!
//****************************************************************************************************************

//******************************************************************
//* Customize Widget Options
//******************************************************************
const widgetConfig = {
    debugMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    refreshInterval: 5, // allow data to refresh every (xx) minutes
    useIndicators: true, // indicators for fuel bar
    unitOfLength: (await useMetricUnits()) ? 'km' : 'mi', // unit of length
    distanceMultiplier: (await useMetricUnits()) ? 1 : 0.621371, // distance multiplier
    unitOfPressure: 'psi', // unit of pressure, default from ford is kpa
    largeWidget: false, // uses large widget layout, if false, medium layout is used
    storeCredentialsInKeychain: true, // securely store credentials in ios keychain
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
        tirePressure: 'Tires (psi)',
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
    titleFontSize: 10,
    detailFontSizeSmall: 10,
    detailFontSizeMedium: 11,
    detailFontSizeBig: 19,
    barWidth: 80,
    barHeight: 10,
};

//******************************************************************************
//* Main Widget Code - ONLY make changes if you know what you are doing!!
//******************************************************************************

console.log(`ScriptURL: ${URLScheme.forRunningScript()}`);
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
    const vehicleData = await fetchCarData();
    return [
        {
            title: 'View Widget',
            action: async () => {
                console.log('(Main Menu) View Widget was pressed');
                await widget.presentMedium();
            },
            destructive: false,
            show: true,
        },
        {
            title: 'Lock Vehicle',
            action: async () => {
                console.log('(Main Menu) Lock was pressed');
                await sendLockCmd();
            },
            destructive: false,
            show: true,
        },
        {
            title: 'Unlock Vehicle',
            action: async () => {
                console.log('(Main Menu) Unlock was pressed');
                await sendUnlockCmd();
            },
            destructive: true,
            show: true,
        },
        {
            title: 'Remote Start (Stop)',
            action: async () => {
                console.log('(Main Menu) Stop was pressed');
                await sendStopCmd();
            },
            destructive: false,
            show: true,
        },
        {
            title: 'Remote Start (Run)',
            action: async () => {
                console.log('(Main Menu) Start was pressed');
                await sendStartCmd();
            },
            destructive: true,
            show: true,
        },
        {
            title: 'Turn On All ZoneLighting',
            action: async () => {
                console.log('(Main Menu) Zone Lighting On was pressed');
                await sendZoneLightsAllOnCmd();
            },
            destructive: false,
            show: vehicleData.zoneLightingSupported === true,
        },
        {
            title: 'Turn Off All ZoneLighting',
            action: async () => {
                console.log('(Main Menu) Zone Lighting Off was pressed');
                await sendZoneLightsAllOffCmd();
            },
            destructive: false,
            show: vehicleData.zoneLightingSupported === true,
        },
        {
            title: 'Disable SecuriAlert',
            action: async () => {
                console.log('(Main Menu) SecuriAlert Off was pressed');
                await sendGuardModeOffCmd();
            },
            destructive: true,
            show: vehicleData.securiAlertSupported === true,
        },
        {
            title: 'Enable SecuriAlert',
            action: async () => {
                console.log('(Main Menu) SecuriAlert On was pressed');
                await sendGuardModeOnCmd();
            },
            destructive: false,
            show: vehicleData.securiAlertSupported === true,
        },
        {
            title: 'Widget Settings',
            action: async () => {
                console.log('(Main Menu) Widget Settings was pressed');
                createSettingMenu();
            },
            destructive: false,
            show: true,
        },
        {
            title: 'Done',
            action: async () => {
                console.log('(Main Menu) Done was pressed');
            },
            destructive: false,
            show: true,
        },
    ];
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
    const respIndex = await mainMenu.presentSheet();
    if (respIndex !== null) {
        const menuItem = menuItems[respIndex];
        console.log(`(Main Menu) Selected: ${JSON.stringify(menuItem)}`);
        menuItem.action();
    }
}

async function createSettingMenu() {
    const settingMenu = new Alert();
    settingMenu.title = `FordPass Widget Settings`;
    // settingMenu.message = 'These settings allow you to configure FordPass Widget.';

    settingMenu.addAction(`Widget Version: ${WIDGET_VERSION}`); //0
    let useMetric = (await useMetricUnits()) ? 'Metric' : 'Imperial';
    settingMenu.addAction(`Measurement Units: ${useMetric.toUpperCase()}`); //1

    let mapProvider = await getMapProvider();
    settingMenu.addAction(`Map Provider: ${mapProvider.toUpperCase()}`); //2

    settingMenu.addDestructiveAction('Clear All Saved Data'); //3

    settingMenu.addAction('Done'); //4

    const respIndex = await settingMenu.presentSheet();

    switch (respIndex) {
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
            console.log('(Setting Menu) Map Provider pressed');
            await toggleMapProvider();
            createSettingMenu();
            break;
        case 3:
            console.log('(Setting Menu) Clear All Data was pressed');
            await clearKeychain();
            await clearFileManager();
            createSettingMenu();
            break;
        case 4:
            console.log('(Setting Menu) Done was pressed');
            break;
    }
}

async function newConfigMenu() {
    const configMenu = new Alert();
    configMenu.title = `Widget Settings Missing`;
    configMenu.message = 'Tap the setting to toggle a change and press Done.';
    let useMetric = await useMetricUnits();
    configMenu.addAction(`Measurement Units: ${(useMetric ? 'Metric' : 'Imperial').toUpperCase()}`); //0
    let mapProvider = await getMapProvider();
    configMenu.addAction(`Map Provider: ${mapProvider.toUpperCase()}`); //1
    configMenu.addAction('Done'); //2

    const respIndex = await configMenu.presentSheet();

    switch (respIndex) {
        case 0:
            console.log('(Config Menu) Measurement Units pressed');
            await toggleUseMetricUnits();
            createSettingMenu();
            break;
        case 1:
            console.log('(Config Menu) Map Provider pressed');
            await toggleMapProvider();
            createSettingMenu();
            break;
        case 2:
            console.log('(Config Menu) Done was pressed');
            console.log(`metric: ${useMetric ? 'true' : 'false'} | map: ${mapProvider}`);
            await setKeychainValue('fpUseMetricUnits', useMetric ? 'true' : 'false');
            await setKeychainValue('fpMapProvider', mapProvider);
            break;
    }
}

function inputTest(val) {
    return val !== '' && val !== null && val !== undefined;
}

async function getLoginAndVin() {
    let user = await getKeychainValue('fpUser');
    let pass = await getKeychainValue('fpPass');
    let vin = await getKeychainValue('fpVin');
    let prompt = new Alert();
    prompt.title = 'Required Data Missing';
    prompt.message = 'Please enter you FordPass Credentials and Vehicle VIN.';
    prompt.addTextField('FordPass Email', user || '');
    prompt.addSecureTextField('FordPass Password', pass || '');
    prompt.addTextField('Vehicle VIN', vin || '');
    prompt.addAction('Save');
    prompt.addCancelAction('Cancel');
    let result = await prompt.presentAlert();
    if (0 == result) {
        user = prompt.textFieldValue(0);
        pass = prompt.textFieldValue(1);
        vin = prompt.textFieldValue(2);
        // console.log(`${user} ${pass} ${vin}`);
        if (inputTest(user) && inputTest(pass) && inputTest(vin)) {
            await setKeychainValue('fpUser', user);
            await setKeychainValue('fpPass', pass);
            await setKeychainValue('fpVin', vin);
            return true;
        }
    } else {
        return false;
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
    let ukcOk = await userKeychainOk();
    // console.log(`ukcOk: ${ukcOk}`);
    if (!ukcOk) {
        let prompt = await getLoginAndVin();
        if (!prompt) {
            console.log('Login and VIN not set... User cancelled!!!');
            return null;
        }
    }
    // Shows the config options menu if any aren't defined
    if (!(await prefsKeychainOk())) {
        await newConfigMenu();
    }

    let carData = await fetchCarData();
    // console.log(`carData: ${JSON.stringify(carData)}`);

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
    let vehicleLogo = await createImage(vehicleLogoRow, await getVehicleImage(carData.vehicleInfo.vehicle.modelYear), { imageSize: new Size(85, 45), '*centerAlignImage': null });
    mainCol1.addSpacer(5);

    // Creates the Fuel Info Elements
    await createFuelElement(mainCol1, carData);

    // Creates the Mileage Info Elements
    await createMileageElement(mainCol1, carData);

    // Creates Battery Level Elements
    await createBatteryElement(mainCol1, carData);

    // Creates Oil Life Elements
    await createOilElement(mainCol1, carData);

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
    await createLockStatusElement(mainCol2, carData);

    // Creates the Door Status Elements
    await createDoorElement(mainCol2, carData);

    // Create Tire Pressure Elements
    await createTireElement(mainCol2, carData);

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
    await createIgnitionStatusElement(mainCol3, carData);

    // Creates the Door Status Elements
    await createWindowElement(mainCol3, carData);

    // Creates the Vehicle Location Element
    await createPositionElement(mainCol3, carData);

    mainCol3.addSpacer();

    contentStack.addSpacer();

    //**********************
    //* Refresh and error
    //*********************
    let infoStack = await createRow(mainStack, { '*layoutHorizontally': null });

    // Creates the Refresh Label to show when the data was last updated from Ford
    let refreshTime = carData.fetchTime ? calculateTimeDifference(carData.fetchTime) : textValues.UIValues.unknown;
    let refreshLabel = await createText(infoStack, refreshTime, { font: Font.mediumSystemFont(sizes.detailFontSizeSmall), textColor: Color.lightGray() });

    // Creates Elements to display any errors in red at the bottom of the widget
    infoStack.addSpacer(10);
    let errorMsg = carData.error ? 'Error: ' + carData.error : '';
    let errorLabel = await createText(infoStack, errorMsg, { font: Font.mediumSystemFont(sizes.detailFontSizeSmall), textColor: Color.red() });

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
    let txt = await createText(headerField, textValues.elemHeaders[element] + ':', { font: Font.boldSystemFont(sizes.titleFontSize), textColor: new Color(runtimeData.textColor1) });
    // return headerField;
}

async function createProgressBar(percent) {
    let fuelLevel = percent > 100 ? 100 : percent;
    const bar = new DrawContext();
    bar.size = new Size(sizes.barWidth, sizes.barHeight + 3);
    bar.opaque = false;
    bar.respectScreenScale = true;
    // Background
    const path = new Path();
    path.addRoundedRect(new Rect(0, 0, sizes.barWidth, sizes.barHeight), 3, 2);
    bar.addPath(path);
    bar.setFillColor(Color.lightGray());
    bar.fillPath();
    // Fuel
    const fuel = new Path();
    fuel.addRoundedRect(new Rect(0, 0, (sizes.barWidth * fuelLevel) / 100, sizes.barHeight), 3, 2);
    bar.addPath(fuel);
    bar.setFillColor(new Color('2f78dd'));
    bar.fillPath();
    if (widgetConfig.useIndicators) {
        const fuel25Indicator = new Path();
        fuel25Indicator.addRoundedRect(new Rect(sizes.barWidth * 0.25, 1, 2, sizes.barHeight - 2), 3, 2);
        bar.addPath(fuel25Indicator);
        bar.setFillColor(Color.black());
        bar.fillPath();
        const fuel50Indicator = new Path();
        fuel50Indicator.addRoundedRect(new Rect(sizes.barWidth * 0.5, 1, 2, sizes.barHeight - 2), 3, 2);
        bar.addPath(fuel50Indicator);
        bar.setFillColor(Color.black());
        bar.fillPath();
        const fuel75Indicator = new Path();
        fuel75Indicator.addRoundedRect(new Rect(sizes.barWidth * 0.75, 1, 2, sizes.barHeight - 2), 3, 2);
        bar.addPath(fuel75Indicator);
        bar.setFillColor(Color.black());
        bar.fillPath();
    }
    return await bar.getImage();
}

async function createFuelElement(srcField, carData) {
    // Fuel tank header
    let fuelHeaderRow = await createRow(srcField);
    let fuelHeadericon = await createImage(fuelHeaderRow, await getImage(runtimeData.fuelIcon), { imageSize: new Size(11, 11) });
    fuelHeaderRow.addSpacer(3);
    // console.log(`fuelLevel: ${carData.fuelLevel}`);
    let lvlTxt = carData.fuelLevel ? (carData.fuelLevel > 100 ? 100 : carData.fuelLevel) : 50;
    let fuelHeadertext = await createText(fuelHeaderRow, textValues.elemHeaders['fuelTank'], { font: Font.boldSystemFont(sizes.titleFontSize), textColor: new Color(runtimeData.textColor1) });
    let fuelHeadertext2 = await createText(fuelHeaderRow, ' (' + lvlTxt + '%):', { font: Font.regularSystemFont(sizes.detailFontSizeSmall), textColor: new Color(runtimeData.textColor1) });
    srcField.addSpacer(3);

    // Fuel Level Bar
    let fuelBarCol = await createColumn(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
    let fuelBarRow = await createRow(fuelBarCol, { '*setPadding': [0, 0, 0, 0] });
    let fuelBarImg = await createImage(fuelBarRow, await createProgressBar(carData.fuelLevel ? carData.fuelLevel : 50), { '*centerAlignImage': null, imageSize: new Size(sizes.barWidth, sizes.barHeight + 3) });

    // Fuel Distance to Empty
    let fuelBarTextRow = await createRow(fuelBarCol, { '*centerAlignContent': null, '*topAlignContent': null });
    let dteInfo = carData.distanceToEmpty ? `    ${Math.floor(carData.distanceToEmpty * widgetConfig.distanceMultiplier)}${widgetConfig.unitOfLength} to E` : textValues.errorMessages.noData;
    let fuelDteRowTxt = await createText(fuelBarTextRow, dteInfo, { '*centerAlignText': null, font: Font.regularSystemFont(sizes.detailFontSizeSmall), textColor: new Color(runtimeData.textColor2), lineLimit: 1 });

    srcField.addSpacer(3);
}

async function createMileageElement(srcField, carData) {
    let elem = await createRow(srcField, { '*layoutHorizontally': null });
    await createTitle(elem, 'odometer');
    elem.addSpacer(2);
    let value = carData.odometer ? `${Math.floor(carData.odometer * widgetConfig.distanceMultiplier)}${widgetConfig.unitOfLength}` : textValues.errorMessages.noData;
    // console.log(`odometer: ${value}`);
    let txt = await createText(elem, value, { font: Font.regularSystemFont(sizes.detailFontSizeSmall), textColor: new Color(runtimeData.textColor2) });
    srcField.addSpacer(3);
}

async function createBatteryElement(srcField, carData) {
    let elem = await createRow(srcField, { '*layoutHorizontally': null });
    await createTitle(elem, 'batteryStatus');
    elem.addSpacer(2);
    let value = carData.batteryLevel ? `${carData.batteryLevel}V` : 'N/A';
    // console.log(`batteryLevel: ${value}`);
    let txt = await createText(elem, value, { font: Font.regularSystemFont(sizes.detailFontSizeSmall), textColor: new Color(runtimeData.textColor2) });
    srcField.addSpacer(3);
}

async function createOilElement(srcField, carData) {
    let elem = await createRow(srcField, { '*layoutHorizontally': null });
    await createTitle(elem, 'oil');
    elem.addSpacer(2);
    let value = carData.oilLife ? `${carData.oilLife}%` : textValues.errorMessages.noData;
    // console.log(`oilLife: ${value}`);
    let txt = await createText(elem, value, { font: Font.regularSystemFont(sizes.detailFontSizeSmall), textColor: new Color(runtimeData.textColor2) });
    srcField.addSpacer(3);
}

async function createDoorElement(srcField, carData, countOnly = false) {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color(runtimeData.textColor2) },
        statOpen: { font: Font.heavySystemFont(sizes.detailFontSizeMedium), textColor: new Color('FF5733') },
        statClosed: { font: Font.heavySystemFont(sizes.detailFontSizeMedium), textColor: new Color('#5A65C0') },
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
        if (carData.statusDoors) {
            countOpenDoors = Object.values(carData.statusDoors).filter((door) => door === true).length;
            value = countOpenDoors == 0 ? textValues.UIValues.closed : `${countOpenDoors} ${textValues.UIValues.open}`;
        }
        let cntOpenTxt = await createText(dataRow1Fld, value, styles.normTxt);
    } else {
        let row1LfTxt1 = await createText(dataRow1Fld, 'LF (', styles.normTxt);
        let row1LfStatTxt = await createText(dataRow1Fld, carData.statusDoors['leftFront'] ? openSymbol : closedSymbol, carData.statusDoors['leftFront'] ? styles.statOpen : styles.statClosed);
        let row1LfTxt2 = await createText(dataRow1Fld, ')' + ' | ', styles.normTxt);
        let row1RfTxt1 = await createText(dataRow1Fld, 'RF (', styles.normTxt);
        let row1RfStatTxt = await createText(dataRow1Fld, carData.statusDoors['rightFront'] ? openSymbol : closedSymbol, carData.statusDoors['rightFront'] ? styles.statOpen : styles.statClosed);
        let row1RfTxt2 = await createText(dataRow1Fld, ')', styles.normTxt);

        // Creates the second row of status elements for LR and RR
        let dataRow2Fld = await createRow(srcField);
        let row2RfTxt1 = await createText(dataRow2Fld, 'LR (', styles.normTxt);
        let row2RfStatTxt = await createText(dataRow2Fld, carData.statusDoors['leftRear'] ? openSymbol : closedSymbol, carData.statusDoors['leftRear'] ? styles.statOpen : styles.statClosed);
        let row2RfTxt2 = await createText(dataRow2Fld, ')' + ' | ', styles.normTxt);
        let row2RrTxt1 = await createText(dataRow2Fld, 'RR (', styles.normTxt);
        let row2RrStatTxt = await createText(dataRow2Fld, carData.statusDoors['rightRear'] ? openSymbol : closedSymbol, carData.statusDoors['rightRear'] ? styles.statOpen : styles.statClosed);
        let row2RrTxt2 = await createText(dataRow2Fld, ')', styles.normTxt);

        // Creates the third row of status elements for the tailgate (if equipped)
        if (carData.statusDoors['tailgate'] !== undefined) {
            let dataRow3Fld = await createRow(srcField);
            let row3TgTxt1 = await createText(dataRow3Fld, '       TG (', styles.normTxt);
            let row3TgStatTxt = await createText(dataRow3Fld, carData.statusDoors['tailgate'] ? openSymbol : closedSymbol, carData.statusDoors['tailgate'] ? styles.statOpen : styles.statClosed);
            let row3TgTxt2 = await createText(dataRow3Fld, ')', styles.normTxt);
            offset = offset - 5;
        }
    }
    srcField.addSpacer(offset);
}

async function createWindowElement(srcField, carData, countOnly = false) {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color(runtimeData.textColor2) },
        statOpen: { font: Font.heavySystemFont(sizes.detailFontSizeMedium), textColor: new Color('FF5733') },
        statClosed: { font: Font.heavySystemFont(sizes.detailFontSizeMedium), textColor: new Color('#5A65C0') },
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
        if (carData.statusWindows) {
            countOpenWindows = Object.values(carData.statusWindows).filter((window) => window === true).length;
            value = countOpenWindows == 0 ? textValues.UIValues.closed : `${countOpenWindows} ${textValues.UIValues.open}`;
        }
        let cntOpenTxt = await createText(dataRow1Fld, value, styles.normTxt);
    } else {
        let row1LfTxt1 = await createText(dataRow1Fld, 'LF (', styles.normTxt);
        let row1LfStatTxt = await createText(dataRow1Fld, carData.statusWindows['leftFront'] ? openSymbol : closedSymbol, carData.statusWindows['leftFront'] ? styles.statOpen : styles.statClosed);
        let row1LfTxt2 = await createText(dataRow1Fld, ')' + ' | ', styles.normTxt);
        let row1RfTxt1 = await createText(dataRow1Fld, 'RF (', styles.normTxt);
        let row1RfStatTxt = await createText(dataRow1Fld, carData.statusWindows['rightFront'] ? openSymbol : closedSymbol, carData.statusWindows['rightFront'] ? styles.statOpen : styles.statClosed);
        let row1RfTxt2 = await createText(dataRow1Fld, ')', styles.normTxt);

        // Creates the second row of status elements for LR and RR
        let dataRow2Fld = await createRow(srcField);
        let row2RfTxt1 = await createText(dataRow2Fld, 'LR (', styles.normTxt);
        let row2RfStatTxt = await createText(dataRow2Fld, carData.statusWindows['leftRear'] ? openSymbol : closedSymbol, carData.statusWindows['leftRear'] ? styles.statOpen : styles.statClosed);
        let row2RfTxt2 = await createText(dataRow2Fld, ')' + ' | ', styles.normTxt);
        let row2RrTxt1 = await createText(dataRow2Fld, 'RR (', styles.normTxt);
        let row2RrStatTxt = await createText(dataRow2Fld, carData.statusWindows['rightRear'] ? openSymbol : closedSymbol, carData.statusWindows['rightRear'] ? styles.statOpen : styles.statClosed);
        let row2RrTxt2 = await createText(dataRow2Fld, ')', styles.normTxt);

        if (carData.statusDoors['tailgate'] !== undefined) {
            offset = offset + 10;
        }
    }
    srcField.addSpacer(offset);
}

async function createTireElement(srcField, carData) {
    let offset = 0;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'tirePressure');

    let dataFld = await createRow(srcField);
    let value = `${carData.tirePressure['leftFront']} | ${carData.tirePressure['rightFront']}\n${carData.tirePressure['leftRear']} | ${carData.tirePressure['rightRear']}`;
    let txt = await createText(dataFld, value, { font: new Font('Menlo-Regular', sizes.detailFontSizeMedium), textColor: new Color(runtimeData.textColor2), lineLimit: 2 });
    srcField.addSpacer(offset);
}

async function createPositionElement(srcField, carData) {
    let offset = 0;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'position');

    let dataFld = await createRow(srcField);
    let url = (await getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${carData.latitude},${carData.longitude}` : `http://maps.apple.com/?q=${encodeURI(carData.vehicleInfo.vehicle.nickName)}&ll=${carData.latitude},${carData.longitude}`;
    let value = carData.position ? `${carData.position}` : textValues.errorMessages.noData;
    let text = await createText(dataFld, value, { url: url, font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color(runtimeData.textColor2), lineLimit: 2, minimumScaleFactor: 0.7 });
    srcField.addSpacer(offset);
}

async function createLockStatusElement(srcField, carData) {
    const styles = {
        statOpen: { font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color('#FF5733'), lineLimit: 1 },
        statClosed: { font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color('#5A65C0'), lineLimit: 1 },
    };
    let offset = 10;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'lockStatus');
    titleFld.addSpacer(2);
    let dataFld = await createRow(srcField);
    let value = carData.lockStatus ? carData.lockStatus : textValues.errorMessages.noData;
    let text = await createText(dataFld, value, carData.lockStatus !== undefined && carData.lockStatus === 'LOCKED' ? styles.statClosed : styles.statOpen);
    srcField.addSpacer(offset);
}

async function createIgnitionStatusElement(srcField, carData) {
    const styles = {
        statOn: { font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color('#FF5733') },
        statOff: { font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color('#5A65C0') },
    };
    let remStartOn = carData.remoteStartStatus && carData.remoteStartStatus.running ? true : false;
    let status = '';
    if (remStartOn) {
        status = `Remote Start (ON)`;
    } else if (carData.ignitionStatus != undefined) {
        status = carData.ignitionStatus.toUpperCase();
    } else {
        textValues.errorMessages.noData;
    }
    let offset = 10;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'ignitionStatus');
    titleFld.addSpacer(2);
    let dataFld = await createRow(srcField);
    let text = await createText(dataFld, status, (carData.ignitionStatus !== undefined && carData.ignitionStatus === 'On') || remStartOn ? styles.statOn : styles.statOff);
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
        'Accept-Language': 'en-us',
        'User-Agent': 'fordpass-na/353 CFNetwork/1121.2.2 Darwin/19.3.0',
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

async function getVehicleData() {
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
    const headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'Accept-Language': 'en-us',
        'User-Agent': 'fordpass-na/353 CFNetwork/1121.2.2 Darwin/19.3.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Application-Id': '71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592',
        'auth-token': `${token}`,
    };
    let req = new Request(`https://usapi.cv.ford.com/api/vehicles/v4/${vin}/status`);
    req.headers = headers;
    req.method = 'GET';
    let req2 = new Request(`https://usapi.cv.ford.com/api/users/vehicles/${vin}/detail?lrdt=01-01-1970%2000:00:00`);
    req2.headers = headers;
    req2.method = 'GET';
    try {
        let data = await req.loadString();
        if (widgetConfig.debugMode) {
            console.log('Debug: Received vehicle data from ford server');
            console.log(data);
        }
        if (data == 'Access Denied') {
            console.log('getVehicleData: Auth Token Expired. Fetching new token and fetch raw data again');
            // await removeKeychainValue('fpToken');
            let result = await fetchToken();
            if (result && result == textValues.errorMessages.invalidGrant) {
                return result;
            }
            data = await getVehicleData();
        } else {
            data = JSON.parse(data);
        }
        if (data.status && data.status != 200) {
            if (widgetConfig.debugMode) {
                console.log('Debug: Error while receiving vehicle data');
                console.log(data);
            }
            return textValues.errorMessages.connectionErrorOrVin;
        }
        let infoData = await req2.loadString();
        // console.log(`info ${infoData.status}: ${JSON.stringify(JSON.parse(infoData))}`);
        data.vehicleInfo = JSON.parse(infoData);
        return data;
    } catch (e) {
        console.log(`Error: ${e}`);
        return textValues.errorMessages.unknownError;
    }
}

async function showAlert(title, message) {
    let alert = new Alert();
    alert.title = title;
    alert.message = message;
    alert.addAction('OK');
    const respIndex = await alert.presentAlert();
    console.log(`showAlert Response: ${respIndex}`);
    switch (respIndex) {
        case 0:
            console.log(`${title} alert was cleared...`);
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
            cmds: [
                {
                    uri: `${baseUrl}/vehicles/${vin}/doors/lock`,
                    method: 'PUT',
                },
            ],
        },
        unlock: {
            desc: 'Unlock Vehicle',
            cmd: 'sendUnlockCmd',
            cmds: [
                {
                    uri: `${baseUrl}/vehicles/${vin}/doors/lock`,
                    method: 'DELETE',
                },
            ],
        },
        start: {
            desc: 'Start Vehicle',
            cmd: 'sendStartCmd',
            cmds: [
                {
                    uri: `${baseUrl}/vehicles/${vin}/engine/start`,
                    method: 'PUT',
                },
            ],
        },
        stop: {
            desc: 'Stop Vehicle',
            cmd: 'sendStopCmd',
            cmds: [
                {
                    uri: `${baseUrl}/vehicles/${vin}/engine/start`,
                    method: 'DELETE',
                },
            ],
        },
        zone_lights_off: {
            desc: 'Zone Off Zone Lighting (All Lights)',
            cmd: 'sendZoneLightsOffCmd',
            cmds: [
                {
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
            cmds: [
                {
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
            desc: 'Turn On SecuriAlert',
            cmd: 'sendGuardModeOnCmd',
            cmds: [
                {
                    uri: `${guardUrl}/guardmode/v1/${vin}/session`,
                    method: 'PUT',
                },
            ],
        },
        guard_mode_off: {
            desc: 'Turn Off SecuriAlert',
            cmd: 'sendGuardModeOffCmd',
            cmds: [
                {
                    uri: `${guardUrl}/guardmode/v1/${vin}/session`,
                    method: 'DELETE',
                },
            ],
        },
        status: {
            desc: 'Refresh Vehicle Status',
            cmd: 'sendStatusCmd',
            cmds: [
                {
                    uri: `${baseUrl}/vehicles/${vin}/status`,
                    method: 'PUT',
                },
            ],
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

            if (data.status) {
                console.log(`sendVehicleCmd(${cmd_type}) Status Code (${data.status})`);
                if (data.status != 200) {
                    wasError = true;
                    if (widgetConfig.debugMode) {
                        console.log('Debug: Error while receiving vehicle data');
                        console.log(data);
                    }
                    if (data.status == 590) {
                        console.log('code 590');
                        console.log(`isLastCmd: ${isLastCmd}`);
                        outMsg = { title: `${cmd_type.toUpperCase()} Command`, message: textValues.errorMessages.cmd_err_590 };
                    } else {
                        errMsg = `Command Error: ${JSON.stringify(data)}`;
                        outMsg = { title: `${cmd_type.toUpperCase()} Command`, message: `${textValues.errorMessages.cmd_err}\n\Error: ${data.status}` };
                    }
                } else {
                    outMsg = { title: `${cmd_type.toUpperCase()} Command`, message: textValues.successMessages.cmd_success };
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

async function userKeychainOk() {
    let user = (await getKeychainValue('fpUser')) === null || (await getKeychainValue('fpUser')) === '' || (await getKeychainValue('fpUser')) === undefined;
    let pass = (await getKeychainValue('fpPass')) === null || (await getKeychainValue('fpPass')) === '' || (await getKeychainValue('fpPass')) === undefined;
    let vin = (await getKeychainValue('fpVin')) === null || (await getKeychainValue('fpVin')) === '' || (await getKeychainValue('fpVin')) === undefined;
    let missing = user || pass || vin;
    // console.log(`userKeychainOk: ${!missing}`);
    return !missing;
    // let missing = ["fpUser", "fpPass", "fpVin"].filter(async(key) => {
    //     let value = await getKeychainValue(key);
    //     console.log(`${key}: ${value}`);
    //     return value === null || value !== undefined || value !== "";
    // });
    // console.log(`userKeychainOk: (${missing.length}) ${missing.toString()}`);
    // return missing.length === 0;
}

async function prefsKeychainOk() {
    let metric = (await getKeychainValue('fpUseMetricUnits')) === null || (await getKeychainValue('fpUseMetricUnits')) === '' || (await getKeychainValue('fpUseMetricUnits')) === undefined;
    let vt = (await getKeychainValue('fpVehicleType')) === null || (await getKeychainValue('fpVehicleType')) === '' || (await getKeychainValue('fpVehicleType')) === undefined;
    let map = (await getKeychainValue('fpMapProvider')) === null || (await getKeychainValue('fpMapProvider')) === '' || (await getKeychainValue('fpMapProvider')) === undefined;
    let missing = metric || vt || map;
    // console.log(`userKeychainOk: ${!missing}`);
    return !missing;
    // let missing = [];
    // ["fpUseMetricUnits", "fpVehicleType", "fpMapProvider"].forEach(async(key) => {
    //     if (!((await hasKeychainValue(key)) && (await getKeychainValue(key)) !== null && (await getKeychainValue(key)) !== undefined && (await getKeychainValue(key)) !== "")) {
    //         missing.push(key);
    //     }
    // });
    // console.log(`prefsKeychainOk: ${missing.toString()}`);
    // return missing.length === 0;
}

function clearKeychain() {
    console.log('Info: Clearing Authentication from Keychain');
    ['fpToken', 'fpUsername', 'fpUser', 'fpPass', 'fpPassword', 'fpVin', 'fpUseMetricUnits', 'fpVehicleType', 'fpMapProvider'].forEach(async (key) => {
        await removeKeychainValue(key);
    });
}

//from local store if last fetch is < x minutes, otherwise fetch from server
async function fetchCarData() {
    //fetch local data
    if (!widgetConfig.alwaysFetch && isLocalDataFreshEnough()) {
        return readLocalData();
    }

    //fetch data from server
    console.log('fetchCarData: Fetching Vehicle Data from Ford Servers...');
    let rawData = await getVehicleData();

    // console.log(`rawData: ${JSON.stringify(rawData)}`);
    let carData = new Object();
    if (rawData == textValues.errorMessages.invalidGrant || rawData == textValues.errorMessages.connectionErrorOrVin || rawData == textValues.errorMessages.unknownError || rawData == textValues.errorMessages.noVin || rawData == textValues.errorMessages.noCredentials) {
        console.log('Error: ' + rawData);
        let localData = readLocalData();
        if (widgetConfig.debugMode) {
            console.log('Debug: Try to read local data after error');
            console.log(localData);
        }
        if (localData) {
            carData = localData;
        }
        carData.error = rawData;
        return carData;
    }

    carData.vehicleInfo = rawData.vehicleInfo;
    // console.log(carData);

    let vehicleStatus = rawData.vehiclestatus;

    carData.fetchTime = Date.now();

    //odometer
    carData.odometer = vehicleStatus.odometer.value;

    //oil life
    carData.oilLife = vehicleStatus.oil.oilLifeActual;

    //door lock status
    carData.lockStatus = vehicleStatus.lockStatus.value;

    //ignition status
    carData.ignitionStatus = vehicleStatus.ignitionStatus ? vehicleStatus.ignitionStatus.value : 'Off';

    //zone-lighting status
    carData.zoneLightingSupported = vehicleStatus.zoneLighting && vehicleStatus.zoneLighting.activationData && vehicleStatus.zoneLighting.activationData.value === undefined ? false : true;
    carData.zoneLightsStatus = vehicleStatus.zoneLighting && vehicleStatus.zoneLighting.activationData && vehicleStatus.zoneLighting.activationData.value ? vehicleStatus.zoneLighting.activationData.value : 'Off';

    // Remote Start status
    carData.remoteStartStatus = {
        running: vehicleStatus.remoteStartStatus ? (vehicleStatus.remoteStartStatus.value === 0 ? false : true) : false,
        duration: vehicleStatus.remoteStart && vehicleStatus.remoteStart.remoteStartDuration ? vehicleStatus.remoteStart.remoteStartDuration.value : 0,
    };
    console.log(`Remote Start Status: ${JSON.stringify(vehicleStatus.remoteStart)}`);

    // Alarm status
    carData.alarmStatus = vehicleStatus.alarm ? (vehicleStatus.alarm.value === 'SET' ? 'On' : 'Off') : 'Off';

    //Battery info
    carData.batteryStatus = vehicleStatus.battery && vehicleStatus.battery.batteryHealth ? vehicleStatus.battery.batteryHealth.value : textValues.UIValues.unknown;
    carData.batteryLevel = vehicleStatus.battery && vehicleStatus.battery.batteryStatusActual ? vehicleStatus.battery.batteryStatusActual.value : textValues.UIValues.unknown;

    // Whether Vehicle is in deep sleep mode (Battery Saver) | Supported Vehicles Only
    carData.deepSleepMode = vehicleStatus.deepSleepInProgess ? vehicleStatus.deepSleepInProgess.value === 'true' : undefined;

    // Whether Vehicle is currently installing and OTA update (OTA) | Supported Vehicles Only
    carData.firmwareUpdating = vehicleStatus.firmwareUpgInProgress ? vehicleStatus.firmwareUpgInProgress.value === 'true' : undefined;

    //distance to empty
    carData.distanceToEmpty = vehicleStatus.fuel.distanceToEmpty;

    //fuel level
    carData.fuelLevel = Math.floor(vehicleStatus.fuel.fuelLevel);

    //position of car
    carData.position = await getPosition(vehicleStatus);
    carData.latitude = parseFloat(vehicleStatus.gps.latitude);
    carData.longitude = parseFloat(vehicleStatus.gps.longitude);

    // true means, that window is open
    let windows = vehicleStatus.windowPosition;
    //console.log("windows:", JSON.stringify(windows));
    carData.statusWindows = {
        leftFront: !['Fully_Closed', 'Fully closed position', 'Undefined window position'].includes(windows.driverWindowPosition.value),
        rightFront: !['Fully_Closed', 'Fully closed position', 'Undefined window position'].includes(windows.passWindowPosition.value),
        leftRear: !['Fully_Closed', 'Fully closed position', 'Undefined window position'].includes(windows.rearDriverWindowPos.value),
        rightRear: !['Fully_Closed', 'Fully closed position', 'Undefined window position'].includes(windows.rearPassWindowPos.value),
    };

    //true means, that door is open
    let doors = vehicleStatus.doorStatus;
    carData.statusDoors = {
        leftFront: !(doors.driverDoor.value == 'Closed'),
        rightFront: !(doors.passengerDoor.value == 'Closed'),
        leftRear: !(doors.leftRearDoor.value == 'Closed'),
        rightRear: !(doors.rightRearDoor.value == 'Closed'),
    };
    if (doors.hoodDoor && doors.hoodDoor.value !== undefined) {
        carData.statusDoors.hood = !(doors.hoodDoor.value == 'Closed');
    }
    if (doors.tailgateDoor && doors.tailgateDoor.value !== undefined) {
        carData.statusDoors.tailgate = !(doors.tailgateDoor.value == 'Closed');
    }

    //tire pressure
    let tpms = vehicleStatus.TPMS;
    carData.tirePressure = {
        leftFront: await pressureToFixed(tpms.leftFrontTirePressure.value, 1),
        rightFront: await pressureToFixed(tpms.rightFrontTirePressure.value, 1),
        leftRear: await pressureToFixed(tpms.outerLeftRearTirePressure.value, 1),
        rightRear: await pressureToFixed(tpms.outerRightRearTirePressure.value, 1),
    };
    // console.log(JSON.stringify(carData))

    //save data to local store
    saveDataToLocal(carData);

    return carData;
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
        console.log(`modelYear: ${modelYear}`);
        let req = new Request(`https://www.digitalservices.ford.com/fs/api/v2/vehicles/image/full?vin=${vin}&year=${modelYear}&countryCode=USA&angle=4`);
        req.headers = {
            'Content-Type': 'application/json',
            Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'fordpass-na/353 CFNetwork/1121.2.2 Darwin/19.3.0',
            'Accept-Encoding': 'gzip, deflate, br',
            // 'Application-Id': '71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592',
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
    let path = fm.joinPath(dir, 'fp_carData.json');
    if (fm.fileExists(path)) {
        fm.remove(path);
    } //clean old data
    fm.writeString(path, JSON.stringify(data));
}

function readLocalData() {
    console.log('FileManager: Retrieving Vehicle Data from Local Storage...');
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    let path = fm.joinPath(dir, 'fp_carData.json');
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
    fm.listContents(dir).forEach(async (file) => {
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
    if (widgetConfig.unitOfPressure != 'psi' || (await useMetricUnits())) {
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

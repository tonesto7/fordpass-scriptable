// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// always-run-in-app: true; icon-color: blue;
// icon-glyph: car;

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
 * This is a widget for the iOS/iPad/MacOS app named Scriptable https://scriptable.app/ created by tonesto7 (https://github.com/tonesto7)
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
        - Initial support of Electric Vehicles (battery charge, and range)
        - Added screen size detection to adjust the font size on iphones with smaller displays. (Will be used later to fine tune the padding of the widget).
        - Added a version check to show you on the widget and main menu if there is a new version available.
        - Low Voltage Battery Text now shows up as a red when it is low.
        - Status Text is displays at the bottom of the widget. When vehicle is in deep sleep mode, firmware update is in progress, or the vehicle is in a low voltage battery state, the status text will be displayed.
        - Fixed bug in using metric and defining psi tire pressure
        - Tweak the padding of the widget to make it more consistent.
        - Fixed tire pressure font so it matches the rest of the widget.
    v1.2.0: 
        - Added support for advanced commands like securialert, and likely any future commands.
        - Updated navigation labels and menus so that you can go back to previous menus instead of exiting each time
        - Refactored the entire authentication mechinism to get the new token required for more advanced commands and data
        - Added a debug menu under the widget settings menu.  It will allow you to save all vehicle data to your device clipboard for easy sharing with me or others.
        - Added a rough OTA API page under the debug menu as well.
        - Added a rough Vehicle Data page under the debug menu as well.
        - Lot's of fixes
    v1.2.1: 
        - Tweaked the way door status is handled.  Hopefully eliminating some errors and removing read door entries on 2-door vehicles.
        - Fixed some bugs in the debug menu
    v1.2.2: 
        - Added in a personal data scrubber to remove personal data from the data shown in the debug menu.  Cleans VIN, address, long & lat position.
    v1.2.3:
        - Added in a placeholder image for vehicles that don't have an image.
        - Fixed a bug for the using psi tire pressure and metric units.
        - Automatically determine measurement units like distance, pressure, and locale from your Ford account. This should allow support for users outside north america.
        - Added Light/Dark mode to ota and vehicle data pages.
    v1.3.0:
        - Modified the VIN field to store VIN as an uppercase string.
        - Added additional VIN format validations to setup prompt (Makes sure it's the right length and doesn't have any special characters).
        - Fixes and additional error handling for reported issues in the forums.
        - Modified the widget timestamp to reflect the last time the vehicle checked in and matches the last communication in the FordPass App (It's more descriptive now as well)
        - Added the ability to hardcode an id into the script to allow for multiple instances for multiple vehicles. See the SCRIPT_ID in the script header (Not fully tested).
        - Reworked the way all the window, door, and tire details are generated.  They should now be laid out symmetrically.
        - Tire pressure numbers will change color based on different pressures states for low or critical. (see the widgetConfig.tirePressureThresholds parameter in the script header to define custom values)
        - Restructured the bottom of the widget to display events like low battery, deep sleep, firmware update, and any other errors.  (It's also on a different line than the timestamp now).
        - Updated the widget generation logic to support the different iOS widget layouts [small, medium, large, extraLarge] (Actually layout changes coming soon).
        - Started working on the small widget layout working (needs a lot more work)
    v1.3.1:
        - Fixes for Oil Life showing no data.
        - Fixes for timestamp offset.
        - Shows warning for Low Oil Life and low oil.
        - Fixed issue with advanced control menu going to wrong sections when only certain items were shown due to the vehicle capabilities.a
        - Fixed the Alerts not allowed in widget error (this is really shown because the saved VIN is invalid)
        - Fixed repeated login prompt because of the deviceLanguage variable missing from the setUserPrefs call.  Removed the requirement as it's not being used right now 
    v1.3.2:
        - Fixed issues with distance and pressure units not matching those set in Fordpass app settings. (Only refreshes when values are missing and every 5 minutes)
        - Fixed vehicle image when multiple versions of the script are selected.
        - Fixed status message left offset when there were any messages.
        - Fixed some unhandled variables errors.
        - Updated the WebView titles to remind users that their personal info (VIN, address, position, etc) has been scrubbed from the data they are viewing.
    v1.3.3:
        - Fix for some vehicles reporting rear windows with a status of undefined and showing open in the widget.
        - Fix for some vehicles not having the windows status for front windows.
        - Mores fixes to handle undefined values in the vehicle data.
    v1.4.0:
        - Fixed local vehicle data file to support multiple instances.
        - Fixed data scrubber to scrub out relevantVin keys.
        - Removed the low oil life warning for now.
        - Menu optimization to reduce the number of menu items. Lock and remote start are now submenus and they are officially only shown to supported vehicles.
        - Added Horn/Lights control to the main menu for supported vehicles.
        - Fixed a lot of the text and image alignment in the widget.
        - Reworked the small widget to not show text on labels with icons.
        - Added door and window status to small widget
    v1.5.0:
        - Modified the fuel/battery bar to show the icon and percentage in the bar. The bar is now green when vehicle is EV, and red when below 10% and yellow below 20%;
        - Removed vehicle odometer from the widget UI to save space (moved it to the dashboard menu section)
        - Modified the margins of the widget to be more consistent and be better on small screens and widgets.
        - Renamed debug menu to advanced info menu.
        - Added new option to advanced info menu to allow emailing your anonymous vehicle data to me 
            (Because this is email I will see your address, but you can choose to setup a private email using icloud hide email feature)(Either way i will never share or use your email for anything)
        
        
// Todo: 
    - add runtime remaining to remote start output
    - add deep sleep and firmware updates to alerts section of the dashboard menu
    - detail zone lighting items enabled when enabled
    - add charge scheduling to dashboard menu
    - use OTA info to show when an update is available or pending.
    - add other vehicle status info (tire, oil, battery) to the dashboard
    

        
**************/

const SCRIPT_VERSION = '1.5.0';
const SCRIPT_TS = '2022-01-11 19:00:00';
const SCRIPT_ID = 0; // Edit this is you want to use more than one instance of the widget. Any value will work as long as it is a number and  unique.
const LATEST_VERSION = await getLatestScriptVersion();
const updateAvailable = isNewerVersion(SCRIPT_VERSION, LATEST_VERSION);
console.log(`Script Version: ${SCRIPT_VERSION} | Update Available: ${updateAvailable} | Latest Version: ${LATEST_VERSION}`);
//************************************************************************* */
//*                  Device Detail Functions
//************************************************************************* */
const screenSize = Device.screenResolution();
const isSmallDisplay = screenSize.width < 1200 === true;
const darkMode = Device.isUsingDarkAppearance();
const runningWidgetSize = config.widgetFamily;
const isPhone = Device.isPhone();
const isPad = Device.isPad();
// console.log('---------------DEVICE INFO ----------------');
console.log(`OSDarkMode: ${darkMode}`);
// console.log(`IsSmallDisplay: ${isSmallDisplay}`);
// console.log(`ScreenSize: Width: ${screenSize.width} | Height: ${screenSize.height}`);
// console.log(`Device Info | Model: ${Device.model()} | OSVersion: ${Device.systemVersion()}`);
// let keychainMigration = await performKeychainMigration()
//******************************************************************
//* Customize Widget Options
//******************************************************************
const widgetConfig = {
    debugMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    debugAuthMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    logVehicleData: false, // Logs the vehicle data to the console (Used to help end users easily debug their vehicle data and share with develop)
    screenShotMode: false, // Places a dummy address in the widget for anonymous screenshots.
    refreshInterval: 5, // allow data to refresh every (xx) minutes
    alwaysFetch: true, // always fetch data from FordPass, even if it is not needed
    tirePressureThresholds: {
        // Tire Pressure Thresholds in PSI
        low: 27,
        critical: 20,
    },
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
const textValues = (str) => {
    return {
        symbols: {
            closed: '✓',
            open: '✗',
            closed2: '🟢',
            open2: '🟠',
        },
        // Widget Title
        elemHeaders: {
            fuelTank: 'Fuel',
            odometer: '',
            oil: 'Oil Life',
            windows: 'Windows',
            doors: 'Doors',
            position: 'Location',
            tirePressure: `Tires (${str})`,
            lockStatus: 'Locks',
            lock: 'Lock',
            unlock: 'Unlock',
            ignitionStatus: 'Ignition',
            batteryStatus: 'Battery',
            evChargeStatus: 'Charger',
            remoteStart: 'Remote Start',
        },
        UIValues: {
            closed: 'Closed',
            open: 'Open',
            unknown: 'Unknown',
            second: 'Second',
            minute: 'Minute',
            hour: 'Hour',
            day: 'Day',
            month: 'Month',
            year: 'Year',
            perYear: 'p.a.',
            plural: 's', // 's' in english
            precedingAdverb: '', // used in german language, for english let it empty
            subsequentAdverb: 'ago', // used in english language ('ago'), for german let it empty
        },
        errorMessages: {
            invalidGrant: 'Incorrect Login Data',
            connectionErrorOrVin: 'Incorrect VIN Number',
            unknownError: 'Unknown Error',
            noMessages: 'No Messages',
            accessDenied: 'Access Denied',
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
};

//***************************************************************************
//* Customize the Appearance of widget elements when in dark or light mode
//***************************************************************************

const runtimeData = {
    textColor1: darkMode ? '#EDEDED' : '#000000', // Header Text Color
    textColor2: darkMode ? '#EDEDED' : '#000000', // Value Text Color
    textBlack: '#000000',
    textWhite: '#EDEDED',
    backColor: darkMode ? '#111111' : '#FFFFFF', // Background Color'
    backColorGrad: darkMode ? ['#141414', '#13233F'] : ['#BCBBBB', '#DDDDDD'], // Background Color Gradient
    fuelIcon: darkMode ? 'gas-station_dark.png' : 'gas-station_light.png', // Image for gas station
    lockStatus: darkMode ? 'lock_dark.png' : 'lock_light.png', // Image Used for Lock Icon
    lockIcon: darkMode ? 'lock_dark.png' : 'lock_light.png', // Image Used for Lock Icon
    tirePressure: darkMode ? 'tire_dark.png' : 'tire_light.png', // Image for tire pressure
    unlockIcon: darkMode ? 'unlock_dark.png' : 'unlock_light.png', // Image Used for UnLock Icon
    batteryStatus: darkMode ? 'battery_dark.png' : 'battery_light.png', // Image Used for Battery Icon
    doors: darkMode ? 'door_dark.png' : 'door_light.png', // Image Used for Door Lock Icon
    windows: darkMode ? 'window_dark.png' : 'window_light.png', // Image Used for Window Icon
    oil: darkMode ? 'oil_dark.png' : 'oil_light.png', // Image Used for Oil Icon
    ignitionStatus: darkMode ? 'key_dark.png' : 'key_light.png', // Image Used for Ignition Icon
    keyIcon: darkMode ? 'key_dark.png' : 'key_light.png', // Image Used for Key Icon
    position: darkMode ? 'location_dark.png' : 'location_light.png', // Image Used for Location Icon
    evBatteryStatus: darkMode ? 'ev_battery_dark.png' : 'ev_battery_light.png', // Image Used for EV Battery Icon
    evChargeStatus: darkMode ? 'ev_plug_dark.png' : 'ev_plug_light.png', // Image Used for EV Plug Icon
};

const sizeMap = {
    small: {
        titleFontSize: isSmallDisplay ? 9 : 9,
        fontSizeSmall: isSmallDisplay ? 8 : 8,
        fontSizeMedium: isSmallDisplay ? 9 : 9,
        fontSizeBig: isSmallDisplay ? 12 : 12,
        barGauge: {
            w: isSmallDisplay ? 65 : 65,
            h: isSmallDisplay ? 15 : 17,
            fs: isSmallDisplay ? 8 : 10,
        },
        logoSize: {
            w: isSmallDisplay ? 65 : 65,
            h: isSmallDisplay ? 35 : 35,
        },
        iconSize: {
            w: isSmallDisplay ? 11 : 11,
            h: isSmallDisplay ? 11 : 11,
        },
    },
    medium: {
        titleFontSize: isSmallDisplay ? 9 : 10,
        fontSizeSmall: isSmallDisplay ? 8 : 10,
        fontSizeMedium: isSmallDisplay ? 9 : 11,
        fontSizeBig: isSmallDisplay ? 12 : 12,
        barGauge: {
            w: isSmallDisplay ? 80 : 80,
            h: isSmallDisplay ? 15 : 17,
            fs: isSmallDisplay ? 8 : 10,
        },
        logoSize: {
            w: isSmallDisplay ? 85 : 85,
            h: isSmallDisplay ? 45 : 45,
        },
        iconSize: {
            w: isSmallDisplay ? 11 : 11,
            h: isSmallDisplay ? 11 : 11,
        },
    },
    large: {
        titleFontSize: isSmallDisplay ? 9 : 10,
        fontSizeSmall: isSmallDisplay ? 8 : 10,
        fontSizeMedium: isSmallDisplay ? 9 : 11,
        fontSizeBig: isSmallDisplay ? 12 : 12,
        barGauge: {
            w: isSmallDisplay ? 80 : 80,
            h: isSmallDisplay ? 15 : 17,
            fs: isSmallDisplay ? 8 : 10,
        },
        logoSize: {
            w: isSmallDisplay ? 85 : 85,
            h: isSmallDisplay ? 45 : 45,
        },
        iconSize: {
            w: isSmallDisplay ? 11 : 11,
            h: isSmallDisplay ? 11 : 11,
        },
    },
    extraLarge: {
        titleFontSize: 10,
        fontSizeSmall: 10,
        fontSizeMedium: 11,
        fontSizeBig: 12,
        barGauge: {
            w: isSmallDisplay ? 80 : 80,
            h: isSmallDisplay ? 15 : 17,
            fs: isSmallDisplay ? 8 : 10,
        },
        logoSize: {
            w: 85,
            h: 45,
        },
        iconSize: {
            w: 11,
            h: 11,
        },
    },
};

//******************************************************************************
//* Main Widget Code - ONLY make changes if you know what you are doing!!
//******************************************************************************

// console.log(`ScriptURL: ${URLScheme.forRunningScript()}`);
// console.log(`Script QueryParams: ${args.queryParameter}`);
// console.log(`Script WidgetParams: ${args.widgetParameter}`);

async function prepWidget() {
    if (widgetConfig.clearKeychainOnNextRun) {
        await clearKeychain();
    }
    if (widgetConfig.clearFileManagerOnNextRun) {
        await clearFileManager();
    }
    await vinFix();
    let reqOk = await requiredPrefsOk(prefKeys().core);
    // console.log(`reqOk: ${reqOk}`);
    if (!reqOk) {
        let prompt = await requiredPrefsMenu();
        console.log(`Prefs Menu Prompt Result: ${prompt}`);
        if (!prompt) {
            console.log('Login, VIN, or Prefs not set... User cancelled!!!');
            return null;
        }
    }
    await queryFordPassPrefs(false);

    let vehicleData = await fetchVehicleData();
    // console.log(`vehicleData: ${JSON.stringify(vehicleData)}`);
    return vehicleData;
}

async function generateWidget(size, data) {
    let w = null;
    switch (size) {
        case 'small':
            w = await createSmallWidget(data);
            break;
        case 'large':
            w = await createLargeWidget(data);
            break;
        case 'extraLarge':
            w = await createExtraLargeWidget(data);
            break;
        default:
            w = await createMediumWidget(data);
            break;
    }
    if (w === null) {
        return;
    }
    Script.setWidget(w);
    w.setPadding(0, 5, 0, 1);

    w.refreshAfterDate = new Date(Date.now() + 1000 * 300); // Update the widget every 5 minutes from last run (this is not always accurate and there can be a swing of 1-5 minutes)
    return w;
}

let fordData = await prepWidget();
if (fordData === null) return;

if (config.runsInWidget) {
    await generateWidget(runningWidgetSize, fordData);
} else if (config.runsInApp || config.runsFromHomeScreen) {
    // Show alert with current data (if running script in app)
    if (args.shortcutParameter) {
        await showAlert('shortcutParameter: ', JSON.stringify(args.shortcutParameter));
        await Speech.speak(`Siri Command Received ${args.shortcutParameter}`);
        // Create a parser function...
    } else {
        // createMainMenu();
        generateMainInfoTable();
    }
} else if (config.runsWithSiri || config.runsInActionExtension) {
    // console.log('runsWithSiri: ' + config.runsWithSiri);
    // console.log('runsInActionExtension: ' + config.runsInActionExtension);
} else {
    await generateWidget(runningWidgetSize, fordData);
}
Script.complete();

//*****************************************************************************************************************************
//*                                              START WIDGET UI ELEMENT FUNCTIONS
//*****************************************************************************************************************************

async function createSmallWidget(vData) {
    let vehicleData = vData;
    const wSize = 'small';
    // Defines the Widget Object
    const widget = new ListWidget();
    widget.backgroundGradient = getBgGradient();

    try {
        let mainStack = widget.addStack();
        mainStack.layoutVertically();
        mainStack.setPadding(0, 0, 0, 0);

        let contentStack = mainStack.addStack();
        contentStack.layoutHorizontally();

        //*****************
        //* First column
        //*****************
        let mainCol1 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Vehicle Logo, Odometer, Fuel/Battery and Distance Info Elements
        await createVehicleInfoElements(mainCol1, vehicleData, wSize);

        // Creates Low-Voltage Battery Voltage Elements
        await createBatteryElement(mainCol1, vehicleData, wSize);

        // Creates Oil Life Elements
        if (!vehicleData.evVehicle) {
            await createOilElement(mainCol1, vehicleData, wSize);
        } else {
            // Creates EV Plug Elements
            await createEvChargeElement(mainCol1, vehicleData, wSize);
        }

        contentStack.addSpacer();

        //************************
        //* Second column
        //************************
        let mainCol2 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Lock Status Elements
        await createLockStatusElement(mainCol2, vehicleData, wSize);

        // Creates the Ignition Status Elements
        await createIgnitionStatusElement(mainCol2, vehicleData, wSize);

        // Creates the Door Status Elements
        await createDoorElement(mainCol2, vehicleData, true, wSize);

        // Creates the Door Status Elements
        await createWindowElement(mainCol2, vehicleData, true, wSize);

        // mainCol2.addSpacer(0);

        contentStack.addSpacer();

        //**********************
        //* Refresh and error
        //*********************
        let statusRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
        await createStatusElement(statusRow, vehicleData, wSize);

        // This is the row displaying the time elapsed since last vehicle checkin.
        let timestampRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        await createTimeStampElement(timestampRow, vehicleData, wSize);
    } catch (e) {
        console.error(`createSmallWidget Error ${e}`);
    }
    return widget;
}

async function createMediumWidget(vData) {
    let vehicleData = vData;
    const wSize = 'medium';
    // Defines the Widget Object
    const widget = new ListWidget();
    widget.backgroundGradient = getBgGradient();
    try {
        let mainStack = widget.addStack();
        mainStack.layoutVertically();
        mainStack.setPadding(0, 0, 0, 0);

        let contentStack = mainStack.addStack();
        contentStack.layoutHorizontally();

        //*****************
        //* First column
        //*****************
        let mainCol1 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Odometer, Fuel/Battery and Distance Info Elements
        await createVehicleInfoElements(mainCol1, vehicleData, wSize);

        // Creates Low-Voltage Battery Voltage Elements
        await createBatteryElement(mainCol1, vehicleData, wSize);

        // Creates Oil Life Elements
        if (!vehicleData.evVehicle) {
            await createOilElement(mainCol1, vehicleData, wSize);
        } else {
            // Creates EV Plug Elements
            await createEvChargeElement(mainCol1, vehicleData, wSize);
        }

        contentStack.addSpacer();

        //************************
        //* Second column
        //************************
        let mainCol2 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Lock Status Elements
        await createLockStatusElement(mainCol2, vehicleData, wSize);

        // Creates the Door Status Elements
        await createDoorElement(mainCol2, vehicleData, false, wSize);

        // Create Tire Pressure Elements
        await createTireElement(mainCol2, vehicleData, wSize);

        // mainCol2.addSpacer(0);

        contentStack.addSpacer();

        //****************
        //* Third column
        //****************
        let mainCol3 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Ignition Status Elements
        await createIgnitionStatusElement(mainCol3, vehicleData, wSize);

        // Creates the Door Status Elements
        await createWindowElement(mainCol3, vehicleData, false, wSize);

        // Creates the Vehicle Location Element
        await createPositionElement(mainCol3, vehicleData, wSize);

        // mainCol3.addSpacer();

        contentStack.addSpacer();

        //**********************
        //* Refresh and error
        //*********************

        let statusRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
        await createStatusElement(statusRow, vehicleData, wSize);

        // This is the row displaying the time elapsed since last vehicle checkin.
        let timestampRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        await createTimeStampElement(timestampRow, vehicleData, wSize);
    } catch (e) {
        console.error(`createMediumWidget Error ${e}`);
    }
    return widget;
}

async function createLargeWidget(vData) {
    let vehicleData = vData;
    const wSize = 'large';
    // Defines the Widget Object
    const widget = new ListWidget();
    widget.backgroundGradient = getBgGradient();
    try {
        let mainStack = widget.addStack();
        mainStack.layoutVertically();
        mainStack.setPadding(0, 0, 0, 0);

        let contentStack = mainStack.addStack();
        contentStack.layoutHorizontally();

        //*****************
        //* First column
        //*****************
        let mainCol1 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Odometer, Fuel/Battery and Distance Info Elements
        await createVehicleInfoElements(mainCol1, vehicleData, wSize);

        // Creates Low-Voltage Battery Voltage Elements
        await createBatteryElement(mainCol1, vehicleData, wSize);

        // Creates Oil Life Elements
        if (!vehicleData.evVehicle) {
            await createOilElement(mainCol1, vehicleData, wSize);
        } else {
            // Creates EV Plug Elements
            await createEvChargeElement(mainCol1, vehicleData, wSize);
        }

        contentStack.addSpacer();

        //************************
        //* Second column
        //************************
        let mainCol2 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Lock Status Elements
        await createLockStatusElement(mainCol2, vehicleData, wSize);

        // Creates the Door Status Elements
        await createDoorElement(mainCol2, vehicleData, false, wSize);

        // Create Tire Pressure Elements
        await createTireElement(mainCol2, vehicleData, wSize);

        // mainCol2.addSpacer(0);

        contentStack.addSpacer();

        //****************
        //* Third column
        //****************
        let mainCol3 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Ignition Status Elements
        await createIgnitionStatusElement(mainCol3, vehicleData, wSize);

        // Creates the Door Status Elements
        await createWindowElement(mainCol3, vehicleData, false, wSize);

        // Creates the Vehicle Location Element
        await createPositionElement(mainCol3, vehicleData, wSize);

        // mainCol3.addSpacer();

        contentStack.addSpacer();

        //**********************
        //* Refresh and error
        //*********************

        let statusRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
        await createStatusElement(statusRow, vehicleData, wSize);

        // This is the row displaying the time elapsed since last vehicle checkin.
        let timestampRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        await createTimeStampElement(timestampRow, vehicleData, wSize);
    } catch (e) {
        console.error(`createLargeWidget Error ${e}`);
    }
    return widget;
}

async function createExtraLargeWidget(vData) {
    let vehicleData = vData;
    const wSize = 'extraLarge';
    // Defines the Widget Object
    const widget = new ListWidget();
    widget.backgroundGradient = getBgGradient();
    try {
        let mainStack = widget.addStack();
        mainStack.layoutVertically();
        mainStack.setPadding(0, 0, 0, 0);

        let contentStack = mainStack.addStack();
        contentStack.layoutHorizontally();

        //*****************
        //* First column
        //*****************
        let mainCol1 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Odometer, Fuel/Battery and Distance Info Elements
        await createVehicleInfoElements(mainCol1, vehicleData, wSize);

        // Creates Low-Voltage Battery Voltage Elements
        await createBatteryElement(mainCol1, vehicleData, wSize);

        // Creates Oil Life Elements
        if (!vehicleData.evVehicle) {
            await createOilElement(mainCol1, vehicleData, wSize);
        } else {
            // Creates EV Plug Elements
            await createEvChargeElement(mainCol1, vehicleData, wSize);
        }

        contentStack.addSpacer();

        //************************
        //* Second column
        //************************
        let mainCol2 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Lock Status Elements
        await createLockStatusElement(mainCol2, vehicleData, wSize);

        // Creates the Door Status Elements
        await createDoorElement(mainCol2, vehicleData, false, wSize);

        // Create Tire Pressure Elements
        await createTireElement(mainCol2, vehicleData, wSize);

        // mainCol2.addSpacer(0);

        contentStack.addSpacer();

        //****************
        //* Third column
        //****************
        let mainCol3 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Ignition Status Elements
        await createIgnitionStatusElement(mainCol3, vehicleData, wSize);

        // Creates the Door Status Elements
        await createWindowElement(mainCol3, vehicleData, false, wSize);

        // Creates the Vehicle Location Element
        await createPositionElement(mainCol3, vehicleData, wSize);

        // mainCol3.addSpacer();

        contentStack.addSpacer();

        //**********************
        //* Refresh and error
        //*********************

        let statusRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
        await createStatusElement(statusRow, vehicleData, wSize);

        // This is the row displaying the time elapsed since last vehicle checkin.
        let timestampRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        await createTimeStampElement(timestampRow, vehicleData, wSize);
    } catch (e) {
        console.error(`createExtraLargeWidget Error ${e}`);
    }
    return widget;
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

async function showPrompt(alertTitle, AlertMsg, okTitle, okRed = false) {
    let prompt = new Alert();
    prompt.title = alertTitle;
    prompt.message = AlertMsg;
    if (okRed) {
        prompt.addDestructiveAction(okTitle);
    } else {
        prompt.addAction(okTitle);
    }
    prompt.addAction('Cancel');
    const respInd = await prompt.presentAlert();
    // console.log(`showAlert Response: ${respInd}`);
    switch (respInd) {
        case 0:
            return true;
        case 1:
            return false;
    }
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

async function createTitle(headerField, titleText, wSize = 'medium', hideTitleForSmall = false) {
    let titleParams = titleText.split('||');
    let icon = runtimeData[titleParams[0]];
    let titleStack = await headerField.addStack({ '*centerAlignContent': null });
    if (icon !== undefined) {
        titleStack.layoutHorizontally();
        let imgFile = await getImage(icon.toString());
        await createImage(titleStack, imgFile, { imageSize: new Size(sizeMap[wSize].iconSize.w, sizeMap[wSize].iconSize.h) });
    }
    // console.log(`titleParams(${titleText}): ${titleParams}`);
    if (titleText && titleText.length && !hideTitleForSmall) {
        titleStack.addSpacer(2);
        let title = titleParams.length > 1 ? textValues(titleParams[1]).elemHeaders[titleParams[0]] : textValues().elemHeaders[titleParams[0]];
        await createText(titleStack, title + ':', { font: Font.boldSystemFont(sizeMap[wSize].titleFontSize), textColor: new Color(runtimeData.textColor1), lineLimit: 1 });
    }
}

async function createProgressBar(percent, vData, wSize = 'medium') {
    // percent = 12;
    const isEV = vData.evVehicle === true;
    let fuelLevel = percent > 100 ? 100 : percent;
    const barWidth = sizeMap[wSize].barGauge.w;
    const context = new DrawContext();
    context.size = new Size(barWidth, sizeMap[wSize].barGauge.h + 3);
    context.opaque = false;
    context.respectScreenScale = true;

    // Bar Background Gradient
    const lvlBgPath = new Path();
    lvlBgPath.addRoundedRect(new Rect(0, 0, barWidth, sizeMap[wSize].barGauge.h), 3, 2);
    context.addPath(lvlBgPath);
    context.setFillColor(Color.lightGray());
    context.fillPath();

    // Bar Level Background
    const lvlBarPath = new Path();
    lvlBarPath.addRoundedRect(new Rect(0, 0, (barWidth * fuelLevel) / 100, sizeMap[wSize].barGauge.h), 3, 2);
    context.addPath(lvlBarPath);
    let barColor = isEV ? '#94ef4a' : '#619ded';
    if (percent >= 0 && percent <= 10) {
        barColor = '#FF6700';
    } else if (percent > 10 && percent <= 20) {
        barColor = '#FFCD00';
    }
    context.setFillColor(new Color(barColor));
    context.fillPath();

    let xPos = barWidth / 2 - 20;
    context.setFont(Font.mediumSystemFont(sizeMap[wSize].barGauge.fs));
    context.setTextColor(Color.black());

    // if (fuelLevel > 75) {
    //     context.setTextColor(Color.white());
    // }
    const icon = isEV ? String.fromCodePoint('0x1F50B') : '\u26FD';
    context.drawTextInRect(`${icon} ${fuelLevel}%`, new Rect(xPos, sizeMap[wSize].barGauge.h / sizeMap[wSize].barGauge.fs, sizeMap[wSize].barGauge.w, sizeMap[wSize].barGauge.h));
    context.setTextAlignedCenter();
    return await context.getImage();
}

async function createVehicleInfoElements(srcField, vehicleData, wSize = 'medium') {
    try {
        const isEV = vehicleData.evVehicle === true;
        let lvlValue = !isEV ? (vehicleData.fuelLevel ? vehicleData.fuelLevel : 0) : vehicleData.evBatteryLevel ? vehicleData.evBatteryLevel : 0;
        let dteValue = !isEV ? (vehicleData.distanceToEmpty ? vehicleData.distanceToEmpty : null) : vehicleData.evDistanceToEmpty ? vehicleData.evDistanceToEmpty : null;
        let dtePostfix = isEV ? 'Range' : 'to E';
        let distanceMultiplier = (await useMetricUnits()) ? 1 : 0.621371; // distance multiplier
        let distanceUnit = (await useMetricUnits()) ? 'km' : 'mi'; // unit of length
        // console.log('isEV: ' + isEV);
        // console.log(`fuelLevel: ${vehicleData.fuelLevel}`);
        // console.log(`distanceToEmpty: ${vehicleData.distanceToEmpty}`);
        // console.log(`evBatteryLevel: ${vehicleData.evBatteryLevel}`);
        // console.log('evDistanceToEmpty: ' + vehicleData.evDistanceToEmpty);
        // console.log(`lvlValue: ${lvlValue}`);
        // console.log(`dteValue: ${dteValue}`);

        // Fuel/Battery Section
        let elemCol = await createColumn(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

        // Vehicle Logo
        let logoRow = await createRow(elemCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        if (vehicleData.info !== undefined && vehicleData.info.vehicle !== undefined) {
            await createImage(logoRow, await getVehicleImage(vehicleData.info.vehicle.modelYear), { imageSize: new Size(sizeMap[wSize].logoSize.w, sizeMap[wSize].logoSize.h), '*centerAlignImage': null });
            elemCol.addSpacer(3);
        }

        // Odometer Row
        // let odomRow = await createRow(elemCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null, '*topAlignContent': null });
        // let odomVal = vehicleData.odometer ? `${Math.round(vehicleData.odometer * distanceMultiplier)} ${distanceUnit}` : textValues().errorMessages.noData;
        // await createText(odomRow, odomVal, { '*centerAlignText': null, font: Font.regularSystemFont(sizeMap[wSize].fontSizeSmall), textColor: new Color(runtimeData.textColor2), lineLimit: 1 });
        // elemCol.addSpacer(2);

        // Fuel/Battery Level BAR
        let barRow = await createRow(elemCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        await createImage(barRow, await createProgressBar(lvlValue ? lvlValue : 50, vehicleData, wSize), { '*centerAlignImage': null, imageSize: new Size(sizeMap[wSize].barGauge.w, sizeMap[wSize].barGauge.h + 3) });

        // Distance to Empty
        let dteRow = await createRow(elemCol, { '*centerAlignContent': null, '*topAlignContent': null });
        let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : textValues().errorMessages.noData;
        await createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.regularSystemFont(sizeMap[wSize].fontSizeSmall), textColor: new Color(runtimeData.textColor2), lineLimit: 1 });
        srcField.addSpacer(3);
    } catch (e) {
        console.error(`createVehicleInfoElements error ${e}`);
    }
}

async function createBatteryElement(srcField, vehicleData, wSize = 'medium') {
    try {
        let elem = await createRow(srcField, { '*layoutHorizontally': null, '*bottomAlignContent': null });
        await createTitle(elem, 'batteryStatus', wSize, isSmallDisplay || wSize === 'small');
        elem.addSpacer(2);
        let value = vehicleData.batteryLevel ? `${vehicleData.batteryLevel}V` : 'N/A';
        // console.log(`batteryLevel: ${value}`);
        let lowBattery = vehicleData.batteryStatus === 'STATUS_LOW' ? true : false;
        await createText(elem, value, { font: Font.regularSystemFont(sizeMap[wSize].fontSizeSmall), textColor: lowBattery ? Color.red() : new Color(runtimeData.textColor2), lineLimit: 1 });
        srcField.addSpacer(3);
    } catch (e) {
        console.error(`createBatteryElement error ${e}`);
    }
}

async function createOilElement(srcField, vData, wSize = 'medium') {
    const styles = {
        normal: { font: Font.regularSystemFont(sizeMap[wSize].fontSizeSmall), textColor: new Color(runtimeData.textColor2), lineLimit: 1 },
        warning: { font: Font.regularSystemFont(sizeMap[wSize].fontSizeSmall), textColor: new Color('#FF6700'), lineLimit: 1 },
        critical: { font: Font.regularSystemFont(sizeMap[wSize].fontSizeSmall), textColor: new Color('#DE1738'), lineLimit: 1 },
    };
    let elem = await createRow(srcField, { '*layoutHorizontally': null, '*bottomAlignContent': null });
    await createTitle(elem, 'oil', wSize, isSmallDisplay || wSize === 'small');
    elem.addSpacer(2);
    let txtStyle = styles.normal;
    if (vData.oilLife && vData.oilLife >= 0 && vData.oilLife <= 25) {
        txtStyle = styles.warning;
    }
    // console.log(`oilLife: ${vData.oilLife}`);
    let text = vData.oilLife ? `${vData.oilLife}%` : textValues().errorMessages.noData;
    await createText(elem, text, txtStyle);
    srcField.addSpacer(3);
}

async function createEvChargeElement(srcField, vehicleData, wSize = 'medium') {
    let elem = await createRow(srcField, { '*layoutHorizontally': null });
    await createTitle(elem, 'evChargeStatus', wSize, isSmallDisplay || wSize === 'small');
    elem.addSpacer(2);
    let value = vehicleData.evChargeStatus ? `${vehicleData.evChargeStatus}` : textValues().errorMessages.noData;
    // console.log(`battery charge: ${value}`);
    await createText(elem, value, { font: Font.regularSystemFont(sizeMap[wSize].fontSizeSmall), textColor: new Color(runtimeData.textColor2), lineLimit: 1 });
    srcField.addSpacer(3);
}

async function createDoorElement(srcField, vData, countOnly = false, wSize = 'medium') {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color(runtimeData.textColor2), lineLimit: 1 },
        statOpen: { font: Font.heavySystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF5733'), lineLimit: 1 },
        statClosed: { font: Font.heavySystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color('#5A65C0'), lineLimit: 1 },
        offset: 5,
    };

    let offset = styles.offset;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'doors', wSize);

    // Creates the first row of status elements for LF and RF
    let dataRow1Fld = await createRow(srcField);

    if (countOnly) {
        let value = textValues().errorMessages.noData;
        // let allDoorsCnt = Object.values(vData.statusDoors).filter((door) => door !== null).length;
        let countOpen;
        if (vData.statusDoors) {
            countOpen = Object.values(vData.statusDoors).filter((door) => door === true).length;
            value = countOpen == 0 ? textValues().UIValues.closed : `${countOpen} ${textValues().UIValues.open}`;
        }
        await createText(dataRow1Fld, value, countOpen > 0 ? styles.statOpen : styles.statClosed);
    } else {
        let col1 = await createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
        let col1row1 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
        await createText(col1row1, 'LF (', styles.normTxt);
        await createText(col1row1, vData.statusDoors.leftFront ? textValues().symbols.open : textValues().symbols.closed, vData.statusDoors.leftFront ? styles.statOpen : styles.statClosed);
        await createText(col1row1, ')', styles.normTxt);

        let col2 = await createColumn(dataRow1Fld, { '*setPadding': [0, 3, 0, 3] });
        let col2row1 = await createRow(col2, { '*setPadding': [0, 0, 0, 0] });
        await createText(col2row1, '|', styles.normTxt);

        let col3 = await createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
        let col3row1 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
        await createText(col3row1, 'RF (', styles.normTxt);
        await createText(col3row1, vData.statusDoors.rightFront ? textValues().symbols.open : textValues().symbols.closed, vData.statusDoors.rightFront ? styles.statOpen : styles.statClosed);
        await createText(col3row1, ')', styles.normTxt);

        // Creates the second row of status elements for LR and RR
        if (vData.statusDoors.leftRear !== null && vData.statusDoors.rightRear !== null) {
            let col1row2 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await createText(col1row2, `LR (`, styles.normTxt);
            await createText(col1row2, vData.statusDoors.leftRear ? textValues().symbols.open : textValues().symbols.closed, vData.statusDoors.leftRear ? styles.statOpen : styles.statClosed);
            await createText(col1row2, ')', styles.normTxt);

            let col2row2 = await createRow(col2, {});
            await createText(col2row2, '|', styles.normTxt);

            let col3row2 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await createText(col3row2, `RR (`, styles.normTxt);
            await createText(col3row2, vData.statusDoors.rightRear ? textValues().symbols.open : textValues().symbols.closed, vData.statusDoors.rightRear ? styles.statOpen : styles.statClosed);
            await createText(col3row2, ')', styles.normTxt);
        }

        async function getHoodStatusElem(stkElem, data, center = false) {
            await createText(stkElem, `${center ? '       ' : ''}HD (`, styles.normTxt);
            await createText(stkElem, data.statusDoors.hood ? textValues().symbols.open : textValues().symbols.closed, vData.statusDoors.hood ? styles.statOpen : styles.statClosed);
            await createText(stkElem, ')', styles.normTxt);
        }
        async function getTailgateStatusElem(stkElem, data, center = false) {
            await createText(stkElem, `${center ? '       ' : ''}TG (`, styles.normTxt);
            await createText(stkElem, data.statusDoors.tailgate ? textValues().symbols.open : textValues().symbols.closed, vData.statusDoors.tailgate ? styles.statOpen : styles.statClosed);
            await createText(stkElem, ')', styles.normTxt);
        }

        // Creates the third row of status elements for the tailgate and/or hood (if equipped)
        let hasHood = vData.statusDoors.hood !== null;
        let hasTailgate = vData.statusDoors.tailgate !== null;
        if (hasHood || hasTailgate) {
            if (hasHood && hasTailgate) {
                let col1row3 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
                await getHoodStatusElem(col1row3, vData);

                let col2row3 = await createRow(col2, {});
                await createText(col2row3, '|', styles.normTxt);

                let col3row3 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
                await getTailgateStatusElem(col3row3, vData);
            } else {
                if (hasHood && !hasTailgate) {
                    let dataRow3Fld = await createRow(srcField);
                    await getHoodStatusElem(dataRow3Fld, vData, true);
                } else if (hasTailgate && !hasHood) {
                    let dataRow3Fld = await createRow(srcField, {});
                    await getTailgateStatusElem(dataRow3Fld, vData, true);
                }
            }
        }
    }
    srcField.addSpacer(offset);
}

async function createWindowElement(srcField, vData, countOnly = false, wSize = 'medium') {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color(runtimeData.textColor2) },
        statOpen: { font: Font.heavySystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF5733') },
        statClosed: { font: Font.heavySystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color('#5A65C0') },
        offset: 10,
    };

    let offset = styles.offset;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'windows', wSize);

    // Creates the first row of status elements for LF and RF
    let dataRow1Fld = await createRow(srcField);
    if (countOnly) {
        let value = textValues().errorMessages.noData;
        let countOpen;
        if (vData.statusWindows) {
            countOpen = Object.values(vData.statusWindows).filter((window) => window === true).length;
            value = countOpen == 0 ? textValues().UIValues.closed : `${countOpenWindows} ${textValues().UIValues.open}`;
        }
        await createText(dataRow1Fld, value, countOpen > 0 ? styles.statOpen : styles.statClosed);
    } else {
        let col1 = await createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
        let col1row1 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
        await createText(col1row1, 'LF (', styles.normTxt);
        await createText(col1row1, vData.statusWindows['leftFront'] ? textValues().symbols.open : textValues().symbols.closed, vData.statusWindows['leftFront'] ? styles.statOpen : styles.statClosed);
        await createText(col1row1, ')', styles.normTxt);

        let col2 = await createColumn(dataRow1Fld, { '*setPadding': [0, 3, 0, 3] });
        let col2row1 = await createRow(col2, { '*setPadding': [0, 0, 0, 0] });
        await createText(col2row1, '|', styles.normTxt);

        let col3 = await createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
        let col3row1 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
        await createText(col3row1, 'RF (', styles.normTxt);
        await createText(col3row1, vData.statusWindows['rightFront'] ? textValues().symbols.open : textValues().symbols.closed, vData.statusWindows['rightFront'] ? styles.statOpen : styles.statClosed);
        await createText(col3row1, ')', styles.normTxt);

        // Creates the second row of status elements for LR and RR
        if (vData.statusWindows.leftRear !== null && vData.statusWindows.rightRear !== null) {
            let col1row2 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await createText(col1row2, `LR (`, styles.normTxt);
            await createText(col1row2, vData.statusWindows.leftRear ? textValues().symbols.open : textValues().symbols.closed, vData.statusWindows.leftRear ? styles.statOpen : styles.statClosed);
            await createText(col1row2, ')', styles.normTxt);

            let col2row2 = await createRow(col2, {});
            await createText(col2row2, '|', styles.normTxt);

            let col3row2 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await createText(col3row2, `RR (`, styles.normTxt);
            await createText(col3row2, vData.statusWindows.rightRear ? textValues().symbols.open : textValues().symbols.closed, vData.statusWindows.rightRear ? styles.statOpen : styles.statClosed);
            await createText(col3row2, ')', styles.normTxt);
        }

        if (vData.statusDoors['tailgate'] !== undefined || vData.statusDoors['hood'] !== undefined) {
            offset = offset + 10;
        }
    }
    srcField.addSpacer(offset);
}

async function createTireElement(srcField, vData, wSize = 'medium') {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color(runtimeData.textColor2) },
    };
    let offset = 0;
    let titleFld = await createRow(srcField);
    let pressureUnits = await getKeychainValue('fpPressureUnits');
    let unitTxt = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
    await createTitle(titleFld, `tirePressure||${unitTxt}`, wSize);

    let dataFld = await createRow(srcField);
    // Row 1 - Tire Pressure Left Front amd Right Front
    let col1 = await createColumn(dataFld, { '*setPadding': [0, 0, 0, 0] });
    let col1row1 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
    await createText(col1row1, vData.tirePressure.leftFront, getTirePressureStyle(vData.tirePressure.leftFront, unitTxt));
    let col2 = await createColumn(dataFld, { '*setPadding': [0, 3, 0, 3] });
    let col2row1 = await createRow(col2, { '*setPadding': [0, 0, 0, 0] });
    await createText(col2row1, '|', styles.normTxt);
    let col3 = await createColumn(dataFld, { '*setPadding': [0, 0, 0, 0] });
    let col3row1 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
    await createText(col3row1, vData.tirePressure.rightFront, getTirePressureStyle(vData.tirePressure.rightFront, unitTxt));

    // Row 2 - Tire Pressure Left Rear amd Right Rear
    let col1row2 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
    await createText(col1row2, vData.tirePressure.leftRear, getTirePressureStyle(vData.tirePressure.leftRear, unitTxt));
    let col2row2 = await createRow(col2, { '*setPadding': [0, 0, 0, 0] });
    await createText(col2row2, '|', styles.normTxt);
    let col3row2 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
    await createText(col3row2, vData.tirePressure.rightRear, getTirePressureStyle(vData.tirePressure.rightRear, unitTxt));

    srcField.addSpacer(offset);
}

async function createPositionElement(srcField, vehicleData, wSize = 'medium') {
    let offset = 0;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'position', wSize);

    let dataFld = await createRow(srcField);
    let url = (await getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vehicleData.latitude},${vehicleData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vehicleData.info.vehicle.nickName)}&ll=${vehicleData.latitude},${vehicleData.longitude}`;
    let value = vehicleData.position ? (widgetConfig.screenShotMode ? '1234 Someplace Drive, Somewhere' : `${vehicleData.position}`) : textValues().errorMessages.noData;
    await createText(dataFld, value, { url: url, font: Font.mediumSystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color(runtimeData.textColor2), lineLimit: 2, minimumScaleFactor: 0.7 });
    srcField.addSpacer(offset);
}

async function createLockStatusElement(srcField, vehicleData, wSize = 'medium') {
    const styles = {
        unlocked: { font: Font.heavySystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF5733'), lineLimit: 1 },
        locked: { font: Font.heavySystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color('#5A65C0'), lineLimit: 1 },
    };
    let offset = 2;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'lockStatus', wSize);
    titleFld.addSpacer(2);
    let dataFld = await createRow(srcField);
    let value = vehicleData.lockStatus ? vehicleData.lockStatus.toLowerCase().charAt(0).toUpperCase() + vehicleData.lockStatus.toLowerCase().slice(1) : textValues().errorMessages.noData;
    await createText(dataFld, value, vehicleData.lockStatus !== undefined && vehicleData.lockStatus === 'LOCKED' ? styles.locked : styles.unlocked);
    srcField.addSpacer(offset);
}

async function createIgnitionStatusElement(srcField, vehicleData, wSize = 'medium') {
    const styles = {
        on: { font: Font.heavySystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF5733') },
        off: { font: Font.heavySystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color('#5A65C0') },
    };
    let remStartOn = vehicleData.remoteStartStatus && vehicleData.remoteStartStatus.running ? true : false;
    let status = '';
    if (remStartOn) {
        status = `Remote Start (ON)`;
    } else if (vehicleData.ignitionStatus !== undefined) {
        status = vehicleData.ignitionStatus.charAt(0).toUpperCase() + vehicleData.ignitionStatus.slice(1); //vehicleData.ignitionStatus.toUpperCase();
    } else {
        textValues().errorMessages.noData;
    }
    let offset = 2;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'ignitionStatus', wSize);
    titleFld.addSpacer(2);
    let dataFld = await createRow(srcField);
    await createText(dataFld, status, vehicleData.ignitionStatus !== undefined && (vehicleData.ignitionStatus === 'On' || vehicleData.ignitionStatus === 'Run' || remStartOn) ? styles.on : styles.off);
    srcField.addSpacer(offset);
}

async function createTimeStampElement(stk, vehicleData, wSize = 'medium') {
    // stk.setPadding(topOffset, leftOffset, bottomOffset, rightOffset);
    // Creates the Refresh Label to show when the data was last updated from Ford
    let refreshTime = vehicleData.lastRefreshElapsed ? vehicleData.lastRefreshElapsed : textValues().UIValues.unknown;
    await createText(stk, 'Updated: ' + refreshTime, { font: Font.mediumSystemFont(8), textColor: Color.lightGray(), lineLimit: 1 });
    return stk;
}

async function hasStatusMsg(vData) {
    return vData.error || (!vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') || vData.deepSleepMode || vData.firmwareUpdating || updateAvailable; //|| (!vData.evVehicle && vData.oilLow)
}

async function createStatusElement(stk, vData, maxMsgs = 2, wSize = 'medium') {
    let cnt = 0;
    // Creates Elements to display any errors in red at the bottom of the widget
    if (vData.error) {
        // stk.addSpacer(5);
        await createText(stk, vData.error ? 'Error: ' + vData.error : '', { font: Font.mediumSystemFont(sizeMap[wSize].fontSizeSmall), textColor: Color.red() });
    } else {
        if (cnt < maxMsgs && !vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') {
            stk.addSpacer(cnt > 0 ? 5 : 0);
            await createText(stk, `\u2022 12V Battery Low`, { font: Font.mediumSystemFont(sizeMap[wSize].fontSizeSmall), textColor: Color.red(), lineLimit: 1 });
            cnt++;
        }
        // if (cnt < maxMsgs && !vData.evVehicle && vData.oilLow) {
        //     stk.addSpacer(cnt > 0 ? 5 : 0);
        //     await createText(stk, `\u2022 Oil Reporting Low`, { font: Font.mediumSystemFont(sizeMap[wSize].fontSizeSmall), textColor: Color.red(), lineLimit: 1 });
        //     cnt++;
        // }
        if (cnt < maxMsgs && vData.deepSleepMode) {
            stk.addSpacer(cnt > 0 ? 5 : 0);
            await createText(stk, `\u2022 Deep Sleep Mode`, { font: Font.mediumSystemFont(sizeMap[wSize].fontSizeSmall), textColor: Color.orange(), lineLimit: 1 });
            cnt++;
        }
        if (cnt < maxMsgs && vData.firmwareUpdating) {
            stk.addSpacer(cnt > 0 ? 5 : 0);
            await createText(stk, `\u2022 Firmware Updating`, { font: Font.mediumSystemFont(sizeMap[wSize].fontSizeSmall), textColor: Color.green(), lineLimit: 1 });
            cnt++;
        }
        if (cnt < maxMsgs && updateAvailable) {
            stk.addSpacer(cnt > 0 ? 5 : 0);
            await createText(stk, `\u2022 Script Update: v${LATEST_VERSION}`, { font: Font.mediumSystemFont(sizeMap[wSize].fontSizeSmall), textColor: Color.orange(), lineLimit: 1 });
            cnt++;
        }
    }
    if (!hasStatusMsg()) {
        await createText(stk, `     `, { font: Font.mediumSystemFont(sizeMap[wSize].fontSizeSmall), textColor: new Color(runtimeData.textColor2), lineLimit: 1 });
    }
    return stk;
}

//***************************************************END WIDGET ELEMENT FUNCTIONS********************************************************
//***************************************************************************************************************************************

async function menuBuilderByType(type) {
    const vehicleData = await fetchVehicleData(true);
    const caps = vehicleData.capabilities && vehicleData.capabilities.length ? vehicleData.capabilities : undefined;
    let title = '';
    let items = [];
    let message = '';
    switch (type) {
        case 'mainMenu':
            let refreshTime = vehicleData.lastRefreshElapsed ? vehicleData.lastRefreshElapsed : textValues().UIValues.unknown;
            title = `Widget Menu`;
            message = `Widget Version: (${SCRIPT_VERSION})\nVehicle Updated: (${refreshTime})`.trim();
            items = [{
                    title: `New Script Available: (v${LATEST_VERSION})`,
                    action: async() => {
                        console.log('(Main Menu) New Version was pressed');
                        menuBuilderByType('mainMenu');
                    },
                    destructive: true,
                    show: updateAvailable,
                },
                {
                    title: `View Recall(s): ${vehicleData.recallInfo[0].recalls.length || 0}`,
                    action: async() => {
                        console.log('(Main Menu) View Recalls was pressed');
                        generateRecallsTable(vehicleData);
                    },
                    destructive: false,
                    show: vehicleData.recallInfo && vehicleData.recallInfo.length > 0 && vehicleData.recallInfo[0].recalls && vehicleData.recallInfo[0].recalls.length > 0,
                },
                {
                    title: 'View Widget',
                    action: async() => {
                        console.log('(Main Menu) View Widget was pressed');
                        menuBuilderByType('widgetView');
                        // const w = await generateWidget('medium', fordData);
                        // await w.presentMedium();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Request Vehicle Refresh',
                    action: async() => {
                        console.log('(Main Menu) Refresh was pressed');
                        await sendVehicleCmd('status');
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Advanced Info',
                    action: async() => {
                        console.log('(Main Menu) Advanced Info was pressed');
                        menuBuilderByType('advanceInfoMenu');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Widget Settings',
                    action: async() => {
                        console.log('(Main Menu) Widget Settings was pressed');
                        menuBuilderByType('settingsMenu');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Close',
                    action: async() => {
                        console.log('(Main Menu) Close was pressed');
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
                        console.log('(Widget View Menu) Small Widget was pressed');
                        const w = await generateWidget('small', fordData);
                        await w.presentSmall();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Medium',
                    action: async() => {
                        console.log('(Widget View Menu) Medium Widget was pressed');
                        const w = await generateWidget('medium', fordData);
                        await w.presentMedium();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Large',
                    action: async() => {
                        console.log('(Widget View Menu) Large Widget was pressed');
                        const w = await generateWidget('large', fordData);
                        await w.presentLarge();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Extra-Large',
                    action: async() => {
                        console.log('(Widget View Menu) Extra-Large Widget was pressed');
                        const w = await generateWidget('extraLarge', fordData);
                        await w.presentExtraLarge();
                    },
                    destructive: false,
                    show: Device.isPad(),
                },
                {
                    title: 'Back',
                    action: async() => {
                        console.log('(Widget View Menu) Back was pressed');
                        menuBuilderByType('mainMenu');
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;

        case 'advanceInfoMenu':
            title = 'Advanced Info Menu';
            items = [{
                    title: 'Copy Vehicle Data to Clipboard',
                    action: async() => {
                        console.log('(Debug Menu) Copy Data was pressed');
                        let data = await fetchVehicleData(true);
                        data = scrubPersonalData(data);
                        await Pasteboard.copyString(JSON.stringify(data, null, 4));
                        await showAlert('Debug Menu', 'Vehicle Data Copied to Clipboard');
                        menuBuilderByType('advanceInfoMenu');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'View OTA API Info',
                    action: async() => {
                        console.log('(Debug Menu) OTA Info was pressed');
                        let data = await getVehicleOtaInfo();
                        await showDataWebView('OTA Info Page', 'OTA Raw Data', data, 'OTA');
                        await menuBuilderByType('advanceInfoMenu');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'View Vehicle Data Output',
                    action: async() => {
                        console.log('(Debug Menu) Vehicle Data was pressed');
                        let data = await fetchVehicleData(true);
                        data.userPrefs = {
                            country: await getKeychainValue('fpCountry'),
                            timeZone: await getKeychainValue('fpTz'),
                            language: await getKeychainValue('fpLanguage'),
                            unitOfDistance: await getKeychainValue('fpDistanceUnits'),
                            unitOfPressure: await getKeychainValue('fpPressureUnits'),
                        };
                        data.ota = await getVehicleOtaInfo();
                        await showDataWebView('Vehicle Data Output', 'All Vehicle Data Collected', data);
                        await menuBuilderByType('advanceInfoMenu');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Email Vehicle Data to Developer',
                    action: async() => {
                        console.log('(Debug Menu) Email Vehicle Data was pressed');
                        let data = await fetchVehicleData(true);
                        data.otaInfo = await getVehicleOtaInfo();
                        data = scrubPersonalData(data);
                        data.userPrefs = {
                            country: await getKeychainValue('fpCountry'),
                            timeZone: await getKeychainValue('fpTz'),
                            language: await getKeychainValue('fpLanguage'),
                            unitOfDistance: await getKeychainValue('fpDistanceUnits'),
                            unitOfPressure: await getKeychainValue('fpPressureUnits'),
                        };
                        // data.userDetails = await getAllUserData();
                        data.SCRIPT_VERSION = SCRIPT_VERSION;
                        data.SCRIPT_TS = SCRIPT_TS;
                        await createEmailObject(data, true);
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Back',
                    action: async() => {
                        console.log('(Debug Menu) Back was pressed');
                        menuBuilderByType('mainMenu');
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;
        case 'resetDataMenu':
            title = 'Reset Data Menu';
            items = [{
                    title: 'Clear Cached Files',
                    action: async() => {
                        console.log('(Reset Menu) Clear Files was pressed');
                        await clearFileManager();
                        menuBuilderByType('resetDataMenu');
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Clear Saved Settings',
                    action: async() => {
                        console.log('(Reset Menu) Clear Settings was pressed');
                        await clearKeychain();
                        await showAlert('Widget Reset Menu', 'Saved Settings Cleared\n\nPlease run the script again to re-initialize the app.');
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Reset Everything',
                    action: async() => {
                        console.log('(Reset Menu) Reset All was pressed');
                        await clearKeychain();
                        await showAlert('Widget Reset  Menu', 'All Files and Settings Cleared\n\nPlease run the script again to re-initialize the app.');
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Back',
                    action: async() => {
                        console.log('(Reset Menu) Back was pressed');
                        menuBuilderByType('mainMenu');
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;
        case 'settingsMenu':
            let mapProvider = await getMapProvider();
            title = 'Widget Settings';
            items = [{
                    title: `Map Provider: ${mapProvider === 'apple' ? 'Apple' : 'Google'}`,
                    action: async() => {
                        console.log('(Setting Menu) Map Provider pressed');
                        await toggleMapProvider();
                        menuBuilderByType('settingsMenu');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Reset Menu',
                    action: async() => {
                        console.log('(Setting Menu) Clear All Data was pressed');
                        await menuBuilderByType('resetDataMenu');
                        // menuBuilderByType('settingsMenu');
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: `Back`,
                    action: async() => {
                        console.log('(Setting Menu) Back was pressed');
                        menuBuilderByType('mainMenu');
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
}

async function requiredPrefsMenu() {
    try {
        let user = await getKeychainValue('fpUser');
        let pass = await getKeychainValue('fpPass');
        let vin = await getKeychainValue('fpVin');
        let mapProvider = await getMapProvider();

        let prefsMenu = new Alert();
        prefsMenu.title = 'Required Settings Missing';
        prefsMenu.message = 'Please enter you FordPass Credentials and Vehicle VIN.\n\nTap a setting to toggle change\nPress Done to Save.';

        prefsMenu.addTextField('FordPass Email', user || '');
        prefsMenu.addSecureTextField('FordPass Password', pass || '');
        prefsMenu.addTextField('Vehicle VIN', vin || '');

        prefsMenu.addAction(`Map Provider: ${mapProvider === 'apple' ? 'Apple' : 'Google'}`); //0

        prefsMenu.addAction('Save'); //1
        prefsMenu.addCancelAction('Cancel'); //2

        let respInd = await prefsMenu.presentAlert();
        switch (respInd) {
            case 0:
                console.log('(Required Prefs Menu) Map Provider pressed');
                await toggleMapProvider();
                requiredPrefsMenu();
                break;
            case 1:
                console.log('(Required Prefs Menu) Done was pressed');
                user = prefsMenu.textFieldValue(0);
                pass = prefsMenu.textFieldValue(1);
                vin = prefsMenu.textFieldValue(2);
                // console.log(`${user} ${pass} ${vin}`);

                if (inputTest(user) && inputTest(pass) && inputTest(vin)) {
                    await setKeychainValue('fpUser', user);
                    await setKeychainValue('fpPass', pass);
                    await setKeychainValue('fpMapProvider', mapProvider);
                    let vinChk = await vinCheck(vin, true);
                    console.log(`VIN Number Ok: ${vinChk}`);
                    if (vinChk) {
                        await setKeychainValue('fpVin', vin.toUpperCase());
                        await queryFordPassPrefs(true);
                        return true;
                    } else {
                        // await requiredPrefsMenu();
                        await prepWidget();
                    }
                } else {
                    await prepWidget();
                }
                break;
            case 2:
                return false;
        }
    } catch (err) {
        console.log(`(Required Prefs Menu) Error: ${err}`);
        throw err;
    }
}

async function generateMainInfoTable() {
    const vehicleData = await fetchVehicleData(true);
    const caps = vehicleData.capabilities && vehicleData.capabilities.length ? vehicleData.capabilities : undefined;
    const distanceMultiplier = (await useMetricUnits()) ? 1 : 0.621371; // distance multiplier
    const distanceUnit = (await useMetricUnits()) ? 'km' : 'mi'; // unit of length

    let ignStatus = '';
    if (vehicleData.remoteStartStatus && vehicleData.remoteStartStatus.running ? true : false) {
        ignStatus = `Remote Start (ON)`;
    } else if (vehicleData.ignitionStatus !== undefined) {
        ignStatus = vehicleData.ignitionStatus.charAt(0).toUpperCase() + vehicleData.ignitionStatus.slice(1);
    } else {
        textValues().errorMessages.noData;
    }

    const odometerVal = vehicleData.odometer ? `${Math.round(vehicleData.odometer * distanceMultiplier)} ${distanceUnit}` : textValues().errorMessages.noData;
    const msgs = vehicleData.messages && vehicleData.messages.length ? vehicleData.messages : [];
    const msgsUnread = msgs && msgs.length ? msgs.filter((msg) => msg.isRead === false) : [];
    const headerColor = '#13233F';

    let tableRows = [];

    try {
        // Header Section - Row 1: vehicle messages, vehicle type, vehicle alerts
        tableRows.push(
            await createTableRow(
                [
                    await createImageCell(await getFPImage(`ic_message_center_notification_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 3 }),
                    await createButtonCell(msgs.length ? `Messages: ${msgs.length}` : '', {
                        align: 'left',
                        widthWeight: 27,
                        onTap: async() => {
                            console.log('(Dashboard Menu) View Messages was pressed');
                            await generateMessagesTable(vehicleData, false);
                        },
                    }),

                    await createTextCell(vehicleData.info.vehicle.vehicleType, undefined, { align: 'center', widthWeight: 40, dismissOnTap: false, titleColor: new Color(runtimeData.textWhite), subtitleColor: new Color('#5A65C0'), titleFont: Font.title2(), subtitleFont: Font.subheadline() }),
                    await createButtonCell('Menu', {
                        align: 'right',
                        widthWeight: 30,
                        dismissOnTap: false,
                        onTap: async() => {
                            console.log(`(Dashboard Menu) Menu Button was pressed`);
                            menuBuilderByType('mainMenu');
                        },
                    }),
                ], {
                    backgroundColor: new Color(headerColor),
                    height: 30,
                    isHeader: true,
                    dismissOnSelect: false,
                },
            ),
        );

        // Header Section - Row 2: Displays the Vehicle Image
        tableRows.push(await createTableRow([await createImageCell(await getVehicleImage(vehicleData.info.vehicle.modelYear, false, 1), { align: 'center', widthWeight: 1 })], { backgroundColor: new Color(headerColor), height: 70, dismissOnSelect: false }));

        // Header Section - Row 3: Shows vehicle odometer and vehicle recalls button
        tableRows.push(
            await createTableRow([await createTextCell('', undefined, { align: 'left', widthWeight: 30 }), await createTextCell(odometerVal, undefined, { align: 'center', widthWeight: 40, titleColor: new Color(runtimeData.textWhite), titleFont: Font.body() }), await createTextCell('', undefined, { align: 'right', widthWeight: 30 })], {
                backgroundColor: new Color(headerColor),
                height: 20,
                dismissOnSelect: false,
            }),
        );

        // "summary": [
        //     { "alertType": "VHA", "alertDescription": "Low Washer Fluid", "alertIdentifier": "E19-374-43", "urgency": "L", "colorCode": "A", "iconName": "ic_washer_fluid", "alertPriority": 1 },
        //     { "alertType": "MMOTA", "alertDescription": "UPDATE SUCCESSFUL", "alertIdentifier": "MMOTA_UPDATE_SUCCESSFUL", "urgency": null, "colorCode": "G", "iconName": "ic_mmota_alert_update_successful", "alertPriority": 2 }
        // ]

        vehicleData.firmwareUpdating = true;
        vehicleData.deepSleepMode = true;

        // Vehicle Alerts Section - Creates rows for each summary alert
        if ((vehicleData.alerts && vehicleData.alerts.summary && vehicleData.alerts.summary.length) || vehicleData.firmwareUpdating || vehicleData.deepSleepMode) {
            let alertsSummary = vehicleData.alerts && vehicleData.alerts.summary && vehicleData.alerts.summary.length ? vehicleData.alerts.summary : [];

            if (vehicleData.deepSleepMode) {
                alertsSummary.push({ alertType: 'VHA', alertDescription: 'Deep Sleep Active - Low Battery', urgency: 'L', colorCode: 'R', iconName: 'ic_software_updates', alertPriority: 1, noButton: true });
            }
            if (vehicleData.firmwareUpdating) {
                alertsSummary.push({ alertType: 'VHA', alertDescription: 'Firmware Update in Progress', urgency: 'L', colorCode: 'G', iconName: 'ic_software_updates', alertPriority: 1, noButton: true });
            }

            // Creates the Vehicle Alerts Title Row
            tableRows.push(await createTableRow([await createTextCell(`${alertsSummary.length} Vehicle Alert(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 40, isHeader: true, dismissOnSelect: false }));
            // Creates a single row for each alert in the top 10 of alerts.summary array
            for (const [i, alert] of alertsSummary.entries()) {
                if (i >= 10) {
                    break;
                }
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell(alert.alertDescription, getAlertDescByType(alert.alertType), { align: 'left', widthWeight: 93, titleColor: new Color(getAlertColorByCode(alert.colorCode)), titleFont: Font.body(), subtitleColor: new Color(runtimeData.textColor1), subtitleFont: Font.regularSystemFont(9) }),
                        ], {
                            height: 44,
                            dismissOnSelect: false,
                            onSelect: alert.noButton === undefined || alert.noButton === false ?
                                async() => {
                                    console.log('(Dashboard Menu) Alert Item row was pressed');
                                    // await showAlert('Alert Item', `Alert Type: ${alert.alertType}`);
                                    await generateAlertsTable(vehicleData);
                                } :
                                undefined,
                        },
                    ),
                );
            }
        }

        // Unread Messages Section - Displays a count of unread messages and a button to view all messages
        if (msgsUnread.length) {
            tableRows.push(await createTableRow([await createTextCell('Unread Messages', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 40, isHeader: true, dismissOnSelect: false }));

            tableRows.push(
                await createTableRow(
                    [
                        await createImageCell(await getFPImage(`ic_message_center_notification_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                        await createTextCell(`Unread Message(s)`, undefined, { align: 'left', widthWeight: 78, titleColor: new Color(runtimeData.textColor1), titleFont: Font.body() }),
                        await createButtonCell('View', {
                            align: 'right',
                            widthWeight: 15,
                            onTap: async() => {
                                console.log('(Dashboard Menu) View Unread Messages was pressed');
                                await generateMessagesTable(vehicleData, true);
                            },
                        }),
                    ], { height: 44, dismissOnSelect: false },
                ),
            );
        }

        // Vehicle Controls Section - Remote Start and Door Locks
        if (caps && caps.length && (caps.includes('DOOR_LOCK_UNLOCK') || caps.includes('REMOTE_START'))) {
            // Creates the Vehicle Controls Header Text
            tableRows.push(await createTableRow([await createTextCell('Vehicle Controls', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 40, isHeader: true, dismissOnSelect: false }));

            // Generates the Lock Control Row
            if (caps.includes('DOOR_LOCK_UNLOCK')) {
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`${vehicleData.lockStatus === 'LOCKED' ? 'unlock_icon' : 'lock_icon'}_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell('Locks', vehicleData.lockStatus === 'LOCKED' ? 'Locked' : 'Unlocked', { align: 'left', widthWeight: 63, titleColor: new Color(runtimeData.textColor1), subtitleColor: new Color(vehicleData.lockStatus === 'LOCKED' ? '#5A65C0' : '#FF5733'), titleFont: Font.title3(), subtitleFont: Font.headline() }),
                            await createButtonCell('Unlock', {
                                align: 'center',
                                widthWeight: 15,
                                onTap: async() => {
                                    console.log('(Dashboard Menu) Lock was pressed');
                                    await sendVehicleCmd('unlock');
                                },
                            }),
                            await createButtonCell('Lock', {
                                align: 'center',
                                widthWeight: 15,
                                onTap: async() => {
                                    console.log('(Dashboard Menu) Lock was pressed');
                                    await sendVehicleCmd('lock');
                                },
                            }),
                        ], { height: 44, dismissOnSelect: false },
                    ),
                );
            }

            // Generates the Remote Start Control Row
            if (caps.includes('REMOTE_START')) {
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`ic_paak_key_settings_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell('Ignition', ignStatus, { align: 'left', widthWeight: 63, titleColor: new Color(runtimeData.textColor1), subtitleColor: new Color(ignStatus === 'Off' ? '#5A65C0' : '#FF5733'), titleFont: Font.title3(), subtitleFont: Font.headline() }),
                            await createButtonCell('Stop', {
                                align: 'center',
                                widthWeight: 15,
                                onTap: async() => {
                                    console.log('(Dashboard Menu) Stop was pressed');
                                    await sendVehicleCmd('stop');
                                },
                            }),
                            await createButtonCell('Start', {
                                align: 'center',
                                widthWeight: 15,
                                onTap: async() => {
                                    console.log('(Dashboard Menu) Start was pressed');
                                    await sendVehicleCmd('start');
                                },
                            }),
                        ], { height: 44, dismissOnSelect: false },
                    ),
                );
            }

            // Generates the Horn/Lights Control Row
            if (caps.includes('REMOTE_PANIC_ALARM')) {
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`res_0x7f080088_ic_control_lights_and_horn_active__0_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell('Sound Horn/Lights', undefined, { align: 'left', widthWeight: 78, titleColor: new Color(runtimeData.textColor1), subtitleColor: new Color(ignStatus === 'Off' ? '#5A65C0' : '#FF5733'), titleFont: Font.title3(), subtitleFont: Font.headline() }),

                            await createButtonCell('Start', {
                                align: 'center',
                                widthWeight: 15,
                                onTap: async() => {
                                    console.log('(Dashboard Menu) Horn/Lights was pressed');
                                    await sendVehicleCmd('horn_and_lights');
                                },
                            }),
                        ], { height: 44, dismissOnSelect: false },
                    ),
                );
            }
        }

        // Advanced Controls Section - Zone Lighting, SecuriAlert, Trailer Lights (if available)
        if (caps && caps.length && (caps.includes('ZONE_LIGHTING_FOUR_ZONES') || caps.includes('ZONE_LIGHTING_TWO_ZONES' || caps.includes('GUARD_MODE') || caps.includes('TRAILER_LIGHT')))) {
            // Creates the Advanced Controls Header Text
            tableRows.push(await createTableRow([await createTextCell('Advanced Controls', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 40, isHeader: true, dismissOnSelect: false }));

            // Generates the SecuriAlert Control Row
            if (caps.includes('GUARD_MODE')) {
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`ic_guard_mode_vd_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell('SecuriAlert', vehicleData.alarmStatus, { align: 'left', widthWeight: 63, titleColor: new Color(runtimeData.textColor1), subtitleColor: new Color(vehicleData.alarmStatus === 'On' ? '#FF5733' : '#5A65C0'), titleFont: Font.title3(), subtitleFont: Font.headline() }),
                            await createButtonCell('Enable', {
                                align: 'center',
                                widthWeight: 15,
                                onTap: async() => {
                                    console.log('(Dashboard Menu) SecuriAlert Enable was pressed');
                                    await sendVehicleCmd('guard_mode_on');
                                },
                            }),
                            await createButtonCell('Disable', {
                                align: 'center',
                                widthWeight: 15,
                                onTap: async() => {
                                    console.log('(Dashboard Menu) SecuriAlert Disable was pressed');
                                    await sendVehicleCmd('guard_mode_off');
                                },
                            }),
                        ], { height: 44, dismissOnSelect: false },
                    ),
                );
            }

            // Generates the Zone Lighting Control Row
            if (caps.includes('ZONE_LIGHTING_FOUR_ZONES') || caps.includes('ZONE_LIGHTING_TWO_ZONES')) {
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`ic_zone_lighting_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell('Zone Lighting', vehicleData.zoneLightingStatus, { align: 'left', widthWeight: 63, titleColor: new Color(runtimeData.textColor1), subtitleColor: new Color(vehicleData.zoneLightingStatus === 'On' ? '#FF5733' : '#5A65C0'), titleFont: Font.title3(), subtitleFont: Font.headline() }),
                            await createButtonCell('Enable', {
                                align: 'center',
                                widthWeight: 15,
                                onTap: async() => {
                                    console.log('(Dashboard Menu) Zone Lighting Enable was pressed');
                                    await sendVehicleCmd('zone_lights_on');
                                },
                            }),
                            await createButtonCell('Disable', {
                                align: 'center',
                                widthWeight: 15,
                                onTap: async() => {
                                    console.log('(Dashboard Menu) Zone Lighting Disable was pressed');
                                    await sendVehicleCmd('zone_lights_off');
                                },
                            }),
                        ], { height: 44, dismissOnSelect: false },
                    ),
                );
            }

            // Generates the Trailer Light Check Control Row
            if (caps.includes('TRAILER_LIGHT')) {
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`ic_trailer_light_check_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell('Trailer Light Check', vehicleData.trailerLightCheckStatus, { align: 'left', widthWeight: 63, titleColor: new Color(runtimeData.textColor1), subtitleColor: new Color(vehicleData.trailerLightCheckStatus === 'On' ? '#FF5733' : '#5A65C0'), titleFont: Font.title3(), subtitleFont: Font.headline() }),
                            await createButtonCell('Start', {
                                align: 'center',
                                widthWeight: 15,
                                onTap: async() => {
                                    console.log('(Dashboard Menu) Trailer Light Check Start was pressed');
                                    await sendVehicleCmd('trailer_light_check_on');
                                },
                            }),
                            await createButtonCell('Stop', {
                                align: 'center',
                                widthWeight: 15,
                                onTap: async() => {
                                    console.log('(Dashboard Menu) Trailer Light Check Stop was pressed');
                                    await sendVehicleCmd('trailer_light_check_off');
                                },
                            }),
                        ], { height: 44, dismissOnSelect: false },
                    ),
                );
            }
        }
    } catch (err) {
        console.error(`Error in generateMainInfoTable: ${err}`);
    }

    await buildTableMenu(tableRows, true, false);
}

async function generateAlertsTable(vehicleData) {
    let vhaAlerts = vehicleData.alerts && vehicleData.alerts.vha && vehicleData.alerts.vha.length ? vehicleData.alerts.vha : [];
    let otaAlerts = vehicleData.alerts && vehicleData.alerts.mmota && vehicleData.alerts.mmota.length ? vehicleData.alerts.mmota : [];

    let tableRows = [];
    if (vhaAlerts.length > 0) {
        tableRows.push(await createTableRow([await createTextCell(`Vehicle Health Alert(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 40, isHeader: true, dismissOnSelect: false }));
        for (const [i, alert] of vhaAlerts.entries()) {
            let alertCells = [];
            let dtTS = alert.eventTimeStamp ? convertFordDtToLocal(alert.eventTimeStamp) : undefined;
            alertCells.push(await createImageCell(await getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 10 }));
            alertCells.push(await createTextCell(alert.activeAlertBody.headline || textValues().errorMessages.noData, undefined, { align: 'left', widthWeight: 60, titleColor: new Color(getAlertColorByCode(alert.colorCode)), titleFont: Font.body(), subtitleColor: new Color(runtimeData.textColor1), subtitleFont: Font.regularSystemFont(7) }));
            alertCells.push(await createTextCell(dtTS ? timeDifference(dtTS) : '', undefined, { align: 'right', widthWeight: 30, titleColor: new Color(runtimeData.textColor1), titleFont: Font.regularSystemFont(9) }));
            tableRows.push(await createTableRow(alertCells, { height: 40, dismissOnSelect: false }));
        }
    }

    if (otaAlerts.length > 0) {
        tableRows.push(await createTableRow([await createTextCell(`OTA Update Alert(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 40, isHeader: true, dismissOnSelect: false }));
        for (const [i, alert] of otaAlerts.entries()) {
            let dtTS = alert.vehicleDate && alert.vehicleTime ? convertFordDtToLocal(`${alert.vehicleDate} ${alert.vehicleTime}`) : undefined;
            let timeDiff = dtTS ? timeDifference(dtTS) : '';
            // let dtTS = alert.dateTimeStamp ? convertFordDtToLocal(alert.dateTimeStamp) : undefined;
            let title = alert.alertIdentifier ? alert.alertIdentifier.replace('MMOTA_', '').split('_').join(' ') : undefined;
            let alertCells = [];

            let releaseNotes;
            if (alert.releaseNotesUrl) {
                let locale = (await getKeychainValue('fpLanguage')) || Device.locale().replace('_', '-');
                releaseNotes = await getReleaseNotes(alert.releaseNotesUrl, locale);
            }
            alertCells.push(await createImageCell(await getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 10 }));
            alertCells.push(await createTextCell(title, releaseNotes, { align: 'left', widthWeight: 60, titleColor: new Color(getAlertColorByCode(alert.colorCode)), titleFont: Font.body() }));
            alertCells.push(await createTextCell(timeDiff, undefined, { align: 'right', widthWeight: 30, titleColor: new Color(runtimeData.textColor1), titleFont: Font.regularSystemFont(9) }));
            tableRows.push(await createTableRow(alertCells, { height: 500, dismissOnSelect: false }));
        }
    }

    await buildTableMenu(tableRows, true, false);
}

async function generateRecallsTable(vehicleData) {
    try {
        let recalls = vehicleData.recallInfo && vehicleData.recallInfo.length && vehicleData.recallInfo[0].recalls && vehicleData.recallInfo[0].recalls.length > 0 ? vehicleData.recallInfo[0].recalls : [];
        let tableRows = [];

        if (recalls.length > 0) {
            tableRows.push(await createTableRow([await createTextCell(`Vehicle Recall(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 40, isHeader: true, dismissOnSelect: false }));
            for (const [i, recall] of recalls.entries()) {
                let dtTS = recall.nhtsaInfo && recall.nhtsaInfo.recallDate ? new Date(Date.parse(recall.nhtsaInfo.recallDate)) : undefined;
                let dateStr = dtTS ? dtTS.toLocaleDateString() : undefined;
                let timeDiff = dtTS ? timeDifference(dtTS) : '';
                let timestamp = `${dateStr ? ' - ' + dateStr : ''}${timeDiff ? ' (' + timeDiff + ')' : ''}`;
                let recallType = recall.type ? `${recall.type}` : '';
                let recallId = recall.id ? `${recallType.length ? '\n' : ''}Recall ID: ${recall.id}` : '';
                let titleSub = `${recallType}${recallId}${timestamp}`;

                // Creates Recall Header Rows
                tableRows.push(await createTableRow([await createTextCell('', undefined, { align: 'center', widthWeight: 1 })], { backgroundColor: new Color('#E96C00'), height: 10, dismissOnSelect: false }));
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`ic_recall_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 6 }),

                            await createTextCell(recall.title, titleSub, {
                                align: 'left',
                                widthWeight: 94,
                                titleColor: new Color(runtimeData.textColor1),
                                titleFont: Font.headline(),
                                subtitleColor: new Color(runtimeData.textColor1),
                                subtitleFont: Font.regularSystemFont(10),
                            }),
                        ], { height: 50, dismissOnSelect: false },
                    ),
                );

                // Creates Recall Safety Description Row
                if (recall.nhtsaInfo && recall.nhtsaInfo.safetyDescription) {
                    tableRows.push(
                        await createTableRow([await createTextCell('Safety Description', recall.nhtsaInfo.safetyDescription, { align: 'left', widthWeight: 100, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title3(), subtitleColor: Color.lightGray(), subtitleFont: Font.mediumSystemFont(11) })], {
                            height: getRowHeightByTxtLength(recall.nhtsaInfo.safetyDescription),
                            dismissOnSelect: false,
                        }),
                    );
                }
                // Creates Recall Remedy Program Row
                if (recall.nhtsaInfo && recall.nhtsaInfo.remedyProgram) {
                    tableRows.push(
                        await createTableRow([await createTextCell('Remedy Program', recall.nhtsaInfo.remedyProgram, { align: 'left', widthWeight: 100, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title3(), subtitleColor: Color.lightGray(), subtitleFont: Font.mediumSystemFont(11) })], {
                            height: getRowHeightByTxtLength(recall.nhtsaInfo.remedyProgram),
                            dismissOnSelect: false,
                        }),
                    );
                }
                // Creates Recall Manufacturer Notes Row
                if (recall.nhtsaInfo && recall.nhtsaInfo.manufacturerNotes) {
                    tableRows.push(
                        await createTableRow([await createTextCell('Manufacturer Notes', recall.nhtsaInfo.manufacturerNotes, { align: 'left', widthWeight: 100, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title3(), subtitleColor: Color.lightGray(), subtitleFont: Font.mediumSystemFont(11) })], {
                            height: getRowHeightByTxtLength(recall.nhtsaInfo.manufacturerNotes),
                            dismissOnSelect: false,
                        }),
                    );
                }
                // Creates a blank row
                tableRows.push(await createTableRow([await createTextCell('', undefined, { align: 'left', widthWeight: 30 })]));
            }
        } else {
            tableRows.push(
                await createTableRow(
                    [
                        await createTextCell('', undefined, { align: 'left', widthWeight: 20 }),
                        await createTextCell(`${recalls.length} Recalls(s)`, undefined, { align: 'center', widthWeight: 60, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() }),
                        await createTextCell('', undefined, { align: 'right', widthWeight: 20 }),
                    ], { height: 44, dismissOnSelect: false },
                ),
            );

            tableRows.push(await createTableRow([await createTextCell(textValues().errorMessages.noMessages, undefined, { align: 'left', widthWeight: 1, titleColor: new Color(runtimeData.textColor1), titleFont: Font.body() })], { height: 44, dismissOnSelect: false }));
        }

        await buildTableMenu(tableRows, false, false);
    } catch (err) {
        console.log(`error in generateRecallsTable: ${err}`);
    }
}

async function generateMessagesTable(vehicleData, unreadOnly = false) {
    try {
        let msgs = vehicleData.messages && vehicleData.messages && vehicleData.messages && vehicleData.messages.length ? vehicleData.messages : messageTest || [];
        msgs = unreadOnly ? msgs.filter((msg) => msg.isRead === false) : msgs;

        let tableRows = [];

        if (msgs.length > 0) {
            tableRows.push(
                await createTableRow(
                    [
                        await createTextCell('', undefined, { align: 'left', widthWeight: 20 }),
                        await createTextCell(`${msgs.length} Messages(s)`, undefined, { align: 'center', widthWeight: 60, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() }),
                        await createTextCell('...', undefined, { align: 'right', widthWeight: 20, dismissOnTap: false, titleColor: Color.purple(), titleFont: Font.title2() }),
                    ], {
                        height: 40,
                        dismissOnSelect: true,
                        onSelect: async() => {
                            console.log(`(Messages Table) All Message Options was pressed`);
                            let msgIds = msgs.map((msg) => msg.messageId);
                            showActionPrompt(
                                'All Message Options',
                                undefined, [{
                                        title: 'Mark All Read',
                                        action: async() => {
                                            console.log(`(Messages Table) Mark All Messages Read was pressed`);
                                            // let ok = await showPrompt(`All Message Options`, `Are you sure you want to mark all messages as read?\n\nMessage List will reload after data is refeshed`, `Mark (${msgIds.length}) Read`, true);
                                            // if (ok) {
                                            console.log(`(Messages Table) Marking ${msgIds.length} Messages as Read`);
                                            if (await markMultipleUserMessagesRead(msgIds)) {
                                                console.log(`(Messages Table) Marked (${msgIds.length}) Messages as Read Successfully`);
                                                showAlert('Marked Messages as Read Successfully', 'Message List will reload after data is refeshed');
                                                await generateMessagesTable(await fetchVehicleData(false), unreadOnly);
                                            }
                                            // }
                                        },
                                        destructive: false,
                                        show: true,
                                    },
                                    {
                                        title: 'Delete All',
                                        action: async() => {
                                            console.log(`(Messages Table) Delete All Messages was pressed`);
                                            let ok = await showPrompt('Delete All Messages', 'Are you sure you want to delete all messages?\n\nMessage List will reload after data is refeshed', `Delete (${msgIds.length}) Messages`, true);
                                            if (ok) {
                                                console.log(`(Messages Table) Deleting ${msgIds.length} Messages`);
                                                if (await deleteUserMessages([msg.messageId])) {
                                                    console.log(`(Messages Table) Deleted (${msgIds.length}) Messages Successfully`);
                                                    showAlert('Deleted Messages Successfully', 'Message List will reload after data is refeshed');
                                                    await generateMessagesTable(await fetchVehicleData(false), unreadOnly);
                                                }
                                            }
                                        },
                                        destructive: true,
                                        show: true,
                                    },
                                ],
                                true,
                                async() => {
                                    generateMessagesTable(vehicleData, unreadOnly);
                                },
                            );
                        },
                    },
                ),
            );

            for (const [i, msg] of msgs.entries()) {
                let dtTS = msg.createdDate ? convertFordDtToLocal(msg.createdDate) : undefined;
                let timeDiff = dtTS ? timeDifference(dtTS) : '';
                let timeSubtitle = `${dtTS ? dtTS.toLocaleString() : ''}${timeDiff ? ` (${timeDiff})` : ''}`;
                // console.log(`(Messages Table) Message ${msg.messageId} created at ${timeSubtitle}`);
                // Creates Message Header Row
                tableRows.push(await createTableRow([await createTextCell('', undefined, { align: 'center', widthWeight: 1 })], { backgroundColor: msg.isRead === false ? new Color('#008200') : Color.darkGray(), height: 10, dismissOnSelect: false }));
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`ic_message_center_notification_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 10 }),
                            await createTextCell(getMessageDescByType(msg.messageType), undefined, { align: 'left', widthWeight: 50, titleColor: new Color(runtimeData.textColor1), titleFont: Font.body() }),
                            await createTextCell(msg.isRead === false ? 'Unread' : 'Read', undefined, { align: 'right', widthWeight: 20, titleColor: msg.isRead === false ? new Color('#008200') : Color.darkGray(), titleFont: Font.body() }),
                            await createTextCell('...', undefined, { align: 'right', widthWeight: 20, dismissOnTap: false, titleColor: Color.purple(), titleFont: Font.title2() }),
                        ],
                        {
                            height: 40,
                            dismissOnSelect: true,
                            onSelect: async () => {
                                console.log(`(Messages Table) Message Options button was pressed for ${msg.messageId}`);
                                showActionPrompt(
                                    'Message Options',
                                    undefined,
                                    [
                                        {
                                            title: 'Mark as Read',
                                            action: async () => {
                                                // console.log(`(Messages Table) Mark Message Read for ${msg.messageId} was pressed`);
                                                // let ok = await showPrompt(`Message Options`, `Are you sure you want to mark this message as read?\n\nMessage List will reload after data is refeshed`, `Mark Read`, true);
                                                // if (ok) {
                                                console.log(`(Messages Table) Marking Message with ID: ${msg.messageId} as Read...`);
                                                if (await markMultipleUserMessagesRead([msg.messageId])) {
                                                    console.log(`(Messages Table) Message (${msg.messageId}) marked read successfully`);
                                                    showAlert('Message marked read successfully', 'Message List will reload after data is refeshed');
                                                    await generateMessagesTable(await fetchVehicleData(false), unreadOnly);
                                                }
                                                // }
                                            },
                                            destructive: false,
                                            show: true,
                                        },
                                        {
                                            title: 'Delete Message',
                                            action: async () => {
                                                console.log(`(Messages Table) Delete Message ${msg.messageId} was pressed`);
                                                let ok = await showPrompt('Delete Message', 'Are you sure you want to delete this message?\n\nMessage List will reload after data is refeshed', 'Delete', true);
                                                if (ok) {
                                                    console.log(`(Messages Table) Delete Confirmed for Message ID: ${msg.messageId}`);
                                                    if (await deleteUserMessages([msg.messageId])) {
                                                        console.log(`(Messages Table) Message ${msg.messageId} deleted successfully`);
                                                        showAlert('Message deleted successfully', 'Message List will reload after data is refeshed');
                                                        await generateMessagesTable(await fetchVehicleData(false), unreadOnly);
                                                    } else {
                                                        await generateMessagesTable(vehicleData, unreadOnly);
                                                    }
                                                }
                                            },
                                            destructive: true,
                                            show: true,
                                        },
                                    ],
                                    true,
                                    async () => {
                                        await generateMessagesTable(vehicleData, unreadOnly);
                                    },
                                );
                            },
                        },
                    ),
                );

                // Creates Message Subject Row
                tableRows.push(
                    await createTableRow([await createTextCell(msg.messageSubject, timeSubtitle, { align: 'left', widthWeight: 100, titleColor: new Color(runtimeData.textColor1), titleFont: Font.headline(), subtitleColor: Color.lightGray(), subtitleFont: Font.mediumSystemFont(11) })], {
                        height: 44,
                        dismissOnSelect: false,
                    }),
                );

                // Creates Message Subject and Body Row
                tableRows.push(await createTableRow([await createTextCell(msg.messageBody, undefined, { align: 'left', widthWeight: 100, titleColor: new Color(runtimeData.textColor1), titleFont: Font.body() })], { height: getRowHeightByTxtLength(msg.messageBody), dismissOnSelect: false }));
            }
        } else {
            tableRows.push(
                await createTableRow(
                    [
                        await createTextCell('', undefined, { align: 'left', widthWeight: 20 }),
                        await createTextCell(`${msgs.length} Messages(s)`, undefined, { align: 'center', widthWeight: 60, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() }),
                        await createTextCell('', undefined, { align: 'right', widthWeight: 20 }),
                    ],
                    { height: 44, dismissOnSelect: false },
                ),
            );
            tableRows.push(await createTableRow([await createTextCell(textValues().errorMessages.noMessages, undefined, { align: 'left', widthWeight: 1, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title3() })], { height: 44, dismissOnSelect: false }));
        }

        await buildTableMenu(tableRows, false, false);
    } catch (e) {
        console.error(`generateMessagesTable() error: ${e}`);
    }
}

//*****************************************************************************************************************************
//*                                              START TABLE HELPER FUNCTIONS
//*****************************************************************************************************************************

async function buildTableMenu(rows, showSeparators = false, fullscreen = false) {
    // Builds the table object
    let table = new UITable();
    table.showSeparators = showSeparators;
    rows.forEach(async (row) => {
        // adds the rows and cells to the table
        table.addRow(row);
    });
    table.present(fullscreen);
}

async function createTableRow(cells, options) {
    let row = new UITableRow();
    cells.forEach((cell) => {
        if (cell) {
            row.addCell(cell);
        }
    });
    row = await applyTableOptions(row, options);
    return row;
}

async function createTextCell(title, subtitle, options) {
    try {
        let cell = UITableCell.text(title || '', subtitle || '');
        if (options) {
            cell = await applyTableOptions(cell, options);
        }
        return cell;
    } catch (err) {
        console.error(`Error creating text cell: ${err}`);
    }
}

async function createImageCell(image, options) {
    try {
        let cell = UITableCell.image(image);
        if (options) {
            cell = await applyTableOptions(cell, options);
        }
        return cell;
    } catch (err) {
        console.error(`Error creating image cell: ${err}`);
    }
}

async function createButtonCell(title, options) {
    try {
        let cell = UITableCell.button(title || '');
        if (options) {
            cell = await applyTableOptions(cell, options);
        }
        return cell;
    } catch (err) {
        console.error(`Error creating button cell: ${err}`);
    }
}

function applyTableOptions(src, options) {
    try {
        if (options) {
            for (const [key, value] of Object.entries(options)) {
                // console.log(key, value);
                if (value !== undefined) {
                    if (key === 'align') {
                        src[`${value}Aligned`]();
                    } else {
                        src[key] = value;
                    }
                }
            }
        }
    } catch (err) {
        console.error(`Error applying options: ${err}`);
    }
    return src;
}

function getAlertColorByCode(code) {
    switch (code) {
        case 'A':
            return '#E96C00';
        case 'G':
            return '#008200';
        case 'R':
            return '#FF0000';
        default:
            return runtimeData.textColor1;
    }
}

function getAlertDescByType(type) {
    switch (type) {
        case 'VHA':
            return 'Vehicle Health';
        case 'MMOTA':
            return 'OTA Update';
        default:
            return '';
    }
}

function getMessageDescByType(type) {
    switch (type) {
        case 'GENERAL':
            return 'General';
        case 'EXTERNALNOTIFICATIONREQUEST':
            return 'External';
        default:
            return '';
    }
}

function getRowHeightByTxtLength(txt) {
    let result = txt && txt.length ? (txt.length / 75).toFixed(0) * 35 : 0;
    // console.log(`txt length: ${txt.length} - result: ${result}`);
    return result < 44 ? 44 : result;
}

async function showActionPrompt(title = undefined, msg = undefined, menuItems, showCancel = false, cancelFunc = undefined) {
    let prompt = new Alert();
    prompt.title = title;
    prompt.message = msg;
    menuItems.forEach((item, ind) => {
        if (item.destructive) {
            prompt.addDestructiveAction(item.title);
        } else {
            prompt.addAction(item.title);
        }
    });
    if (showCancel) {
        prompt.addAction('Cancel');
    }

    const respInd = await prompt.presentAlert();
    // console.log(`showAlert Response: ${respInd}`);
    if (respInd !== null) {
        const menuItem = menuItems[respInd];
        if (respInd > menuItems.length - 1) {
            console.log('Cancelled');
            if (cancelFunc) {
                await cancelFunc();
            }
        } else {
            if (menuItem.action) {
                await menuItem.action();
            }
        }
    }
}

//*****************************************************END TABLE HELPER FUNCTIONS********************************************************
//***************************************************************************************************************************************

async function showDataWebView(title, heading, data, type = undefined) {
    // console.log(`showDataWebView(${title}, ${heading}, ${data})`);
    let otaHTML = '';
    try {
        data = scrubPersonalData(data);
        if (type === 'OTA') {
            if (data.fuseResponse && data.fuseResponse.fuseResponseList && data.fuseResponse.fuseResponseList.length) {
                otaHTML += `<h3>OTA Details</h3>`;

                data.fuseResponse.fuseResponseList.forEach((fuse, ind) => {
                    otaHTML += `<ul>`;
                    otaHTML += `<li>CorrelationID: ${fuse.oemCorrelationId || textValues().errorMessages.noData}</li>`;
                    otaHTML += `<li>Created: ${fuse.deploymentCreationDate || textValues().errorMessages.noData}</li>`;
                    otaHTML += `<li>Expiration: ${fuse.deploymentExpirationTime || textValues().errorMessages.noData}</li>`;
                    otaHTML += `<li>Priority: ${fuse.communicationPriority || textValues().errorMessages.noData}</li>`;
                    otaHTML += `<li>Type: ${fuse.type || textValues().errorMessages.noData}</li>`;
                    otaHTML += `<li>Trigger: ${fuse.triggerType || textValues().errorMessages.noData}</li>`;
                    otaHTML += `<li>Inhibit Required: ${fuse.inhibitRequired}</li>`;
                    otaHTML += `<li>Environment: ${fuse.tmcEnvironment || textValues().errorMessages.noData}</li>`;
                    if (fuse.latestStatus) {
                        otaHTML += `<li>Latest Status:`;
                        otaHTML += `    <ul>`;
                        otaHTML += `        <li>Status: ${fuse.latestStatus.aggregateStatus || textValues().errorMessages.noData}</li>`;
                        otaHTML += `        <li>Details: ${fuse.latestStatus.detailedStatus || textValues().errorMessages.noData}</li>`;
                        otaHTML += `        <li>DateTime: ${fuse.latestStatus.dateTimestamp || textValues().errorMessages.noData}</li>`;
                        otaHTML += `    </ul>`;
                        otaHTML += `</li>`;
                    }
                    if (fuse.packageUpdateDetails) {
                        otaHTML += `<li>Package Details:`;
                        otaHTML += `    <ul>`;
                        otaHTML += `        <li>WiFi Required: ${fuse.packageUpdateDetails.wifiRequired}</li>`;
                        otaHTML += `        <li>Priority: ${fuse.packageUpdateDetails.packagePriority || textValues().errorMessages.noData}</li>`;
                        otaHTML += `        <li>FailedResponse: ${fuse.packageUpdateDetails.failedOnResponse || textValues().errorMessages.noData}</li>`;
                        otaHTML += `        <li>DisplayTime: ${fuse.packageUpdateDetails.updateDisplayTime || textValues().errorMessages.noData}</li>`;
                        otaHTML += `        <li>ReleaseNotes:`;
                        otaHTML += `            <ul>`;
                        otaHTML += `                 <li>${data.fuseResponse.languageText.Text || textValues().errorMessages.noData}</li>`;
                        otaHTML += `            </ul>`;
                        otaHTML += `        </li>`;
                        otaHTML += `    </ul>`;
                        otaHTML += `</li>`;
                    }
                    otaHTML += `</ul>`;
                    otaHTML += `<hr>`;
                });
            }
        }

        // console.log('showDataWebView() | DarkMode: ' + Device.isUsingDarkAppearance());
        const bgColor = darkMode ? '#242424' : 'white';
        const fontColor = darkMode ? '#ffffff' : '#242425';
        const wv = new WebView();
        let html = `
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;"/>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" rel="stylesheet" />
            <link href="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/3.10.1/mdb.min.css" rel="stylesheet"/>
            <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/default.min.css">
            
            <title>${title}</title>
            <style>
                body { font-family: -apple-system; background-color: ${bgColor}; color: ${fontColor}; font-size: 0.8rem;}
            </style>
            
        </head>
        
        <body>
            <div class="mx-2">
                ${otaHTML}
            </div>
            <div class="mx-2">
                <h3>${heading}</h3>
                <p style="color: orange;">(Personal Data Removed)</p>
            </div>
            <div class="ml-3" id="wrapper">
                <pre>${JSON.stringify(data, null, 4)}</pre>
            </div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/3.10.1/mdb.min.js"></script>
        </body>
        
        </html>  
    `;
        await wv.loadHTML(html);
        await wv.waitForLoad();
        // let result = await wv.evaluateJavaScript(`hljs.highlightAll();`, true);
        await wv.present(true);
    } catch (e) {
        console.log(e);
    }
}

//*****************************************************************************************************************************
//*                                                  START FORDPASS API FUNCTIONS
//*****************************************************************************************************************************

function appIDs() {
    return {
        UK_Europe: '1E8C7794-FF5F-49BC-9596-A1E0C86C5B19',
        Australia: '5C80A6BB-CF0D-4A30-BDBF-FC804B5C1A98',
        NA: '71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592',
    };
}

async function checkAuth(src = undefined) {
    let token = await getKeychainValue('fpToken2');
    let expiresAt = await getKeychainValue('fpTokenExpiresAt');
    let expired = expiresAt ? Date.now() >= Date.parse(expiresAt) : false;
    if (widgetConfig.debugMode) {
        console.log(`chechAuth(${src})`);
        console.log(`checkAuth | Token: ${token}`);
        console.log(`checkAuth | ExpiresAt: ${expiresAt}`);
        console.log(`checkAuth | Expired: ${expired}`);
    }
    let tok;
    let refresh;
    if (expired) {
        console.log('Token has expired... Refreshing Token...');
        refresh = await refreshToken();
    } else if (token === null || token === undefined || token === '' || expiresAt === null || expiresAt === undefined || expiresAt === '') {
        console.log('Token or Expiration State is Missing... Fetching Token...');
        tok = await fetchToken();
    }
    if ((tok || refresh) && (tok == textValues().errorMessages.invalidGrant || tok == textValues().errorMessages.noCredentials || refresh == textValues().errorMessages.invalidGrant || refresh == textValues().errorMessages.noCredentials)) {
        return tok;
    }
    return;
}

async function fetchToken() {
    let username = await getKeychainValue('fpUser');
    if (!username) {
        return textValues().errorMessages.noCredentials;
    }
    let password = await getKeychainValue('fpPass');
    if (!password) {
        return textValues().errorMessages.noCredentials;
    }
    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
        'Accept-Encoding': 'gzip, deflate, br',
        authorization: 'Basic ZWFpLWNsaWVudDo=',
    };

    try {
        let req1 = new Request('https://sso.ci.ford.com/oidc/endpoint/default/token');
        req1.headers = headers;
        req1.method = 'POST';
        req1.body = `client_id=9fb503e0-715b-47e8-adfd-ad4b7770f73b&grant_type=password&username=${username}&password=${encodeURIComponent(password)}`;
        req1.timeoutInterval = 10;

        let token1 = await req1.loadJSON();
        let resp1 = req1.response;
        if (widgetConfig.debugAuthMode) {
            console.log(`Token1 Req | Status: ${resp1.statusCode}) | Resp: ${JSON.stringify(token1)}`);
        }
        if (token1.error && token1.error == 'invalid_grant') {
            if (widgetConfig.debugMode) {
                console.log('Debug: Error while receiving token1 data');
                console.log(token1);
            }
            return textValues().errorMessages.invalidGrant;
        }
        if (resp1.statusCode === 200) {
            let req2 = new Request(`https://api.mps.ford.com/api/oauth2/v1/token`);
            headers['content-type'] = 'application/json';
            headers['application-id'] = appIDs().NA;
            req2.headers = headers;
            req2.method = 'PUT';
            req2.body = JSON.stringify({ code: token1.access_token });
            req2.timeoutInterval = 10;

            let token2 = await req2.loadJSON();
            let resp2 = req2.response;
            if (widgetConfig.debugAuthMode) {
                console.log(`Token2 Req | Status: ${resp2.statusCode}) | Resp: ${JSON.stringify(token2)}`);
            }
            if (token2.error && token2.error == 'invalid_grant') {
                if (widgetConfig.debugMode) {
                    console.log('Debug: Error while receiving token2 data');
                    console.log(token2);
                }
                return textValues().errorMessages.invalidGrant;
            }
            if (resp2.statusCode === 200) {
                await setKeychainValue('fpToken2', token2.access_token);
                await setKeychainValue('fpRefreshToken', token2.refresh_token);
                await setKeychainValue('fpTokenExpiresAt', (Date.now() + token2.expires_in).toString());
                let token = await getKeychainValue('fpToken2');
                let expiresAt = await getKeychainValue('fpTokenExpiresAt');
                // console.log(`expiresAt: ${expiresAt}`);
                return;
            }
        }
    } catch (e) {
        console.log(`fetchToken Error: ${e}`);
        if (e.error && e.error == 'invalid_grant') {
            return textValues().errorMessages.invalidGrant;
        }
        throw e;
    }
}

async function refreshToken() {
    try {
        const refreshToken = await getKeychainValue('fpRefreshToken');

        let req = new Request(`https://api.mps.ford.com/api/oauth2/v1/refresh`);
        req.headers = {
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/json',
            'Application-Id': appIDs().NA,
        };
        req.timeoutInterval = 10;
        req.method = 'PUT';
        req.body = JSON.stringify({ refresh_token: refreshToken });

        let token = await req.loadJSON();
        let resp = req.response;
        if (widgetConfig.debugAuthMode) {
            console.log(`RefreshToken Req | Status: ${resp.statusCode}) | Resp: ${JSON.stringify(token)}`);
        }
        if (token.error && token.error == 'invalid_grant') {
            if (widgetConfig.debugMode) {
                console.log('Debug: Error while receiving refreshing token');
                console.log(token);
            }
            return textValues().errorMessages.invalidGrant;
        }
        if (resp.statusCode === 200) {
            await setKeychainValue('fpToken2', token.access_token);
            await setKeychainValue('fpRefreshToken', token.refresh_token);
            await setKeychainValue('fpTokenExpiresAt', (Date.now() + token.expires_in).toString());
            // console.log(`expiresAt: ${expiresAt}`);
            return;
        } else if (resp.statusCode === 401) {
            await fetchToken();
        }
    } catch (e) {
        console.log(`refreshMpsToken Error: ${e}`);
        if (e.error && e.error == 'invalid_grant') {
            return textValues().errorMessages.invalidGrant;
        }
        throw e;
    }
}

async function getVehicleStatus() {
    let vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues().errorMessages.noVin;
    }
    return await makeFordRequest('getVehicleStatus', `https://usapi.cv.ford.com/api/vehicles/v4/${vin}/status`, 'GET', false);
}

async function getVehicleInfo() {
    let vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues().errorMessages.noVin;
    }
    return await makeFordRequest('getVehicleInfo', `https://usapi.cv.ford.com/api/users/vehicles/${vin}/detail?lrdt=01-01-1970%2000:00:00`, 'GET', false);
}

async function getUserMessages() {
    let data = await makeFordRequest('getUserMessages', `https://api.mps.ford.com/api/messagecenter/v3/messages`, 'GET', false);
    return data && data.result && data.result.messages && data.result.messages.length ? data.result.messages : [];
}

async function deleteUserMessages(msgIds = []) {
    let data = await makeFordRequest('deleteUserMessages', `https://api.mps.ford.com/api/messagecenter/v3/user/messages`, 'DELETE', false, undefined, { messageIds: msgIds });
    return data && data.result === 'Success' ? true : false;
}

async function markMultipleUserMessagesRead(msgIds = []) {
    let data = await makeFordRequest('markUserMessagesRead', `https://api.mps.ford.com/api/messagecenter/v3/user/messages/read`, 'PUT', false, undefined, { messageIds: msgIds });
    return data && data.result === 'Success' ? true : false;
}

async function markUserMessageRead(msgId) {
    let data = await makeFordRequest('markMultipleUserMessagesRead', `https://api.mps.ford.com/api/messagecenter/v3/user/content/${msgId}`, 'PUT', false);
    return data && data.result && data.result.messageId === msgId ? true : false;
}

async function getVehicleAlerts() {
    let vin = await getKeychainValue('fpVin');
    let token = await getKeychainValue('fpToken2');
    let country = await getKeychainValue('fpCountry');
    let lang = await getKeychainValue('fpLanguage');
    if (!vin) {
        return textValues().errorMessages.noVin;
    }
    let data = await makeFordRequest(
        'getVehicleAlerts',
        `https://api.mps.ford.com/api/expvehiclealerts/v2/details`,
        'POST',
        false,
        {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
            'Application-Id': appIDs().NA,
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

async function getVehicleCapabilities() {
    let vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues().errorMessages.noVin;
    }
    let data = await makeFordRequest('getVehicleCapabilities', `https://api.mps.ford.com/api/capability/v1/vehicles/${vin}?lrdt=01-01-1970%2000:00:00`, 'GET', false);
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

async function getVehicleOtaInfo() {
    let vin = await getKeychainValue('fpVin');
    let token = await getKeychainValue('fpToken2');
    let country = await getKeychainValue('fpCountry');
    if (!vin) {
        return textValues().errorMessages.noVin;
    }

    return await makeFordRequest('getVehicleOtaInfo', `https://www.digitalservices.ford.com/owner/api/v2/ota/status?country=${country.toLowerCase()}&vin=${vin}`, 'GET', false, {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
        'Application-Id': appIDs().NA,
        'auth-token': `${token}`,
        'Consumer-Key': `Z28tbmEtZm9yZA==`, // Base64 encoded version of "go-na-ford"
        Referer: 'https://ford.com',
        Origin: 'https://ford.com',
    });
}

async function getVehicleManual() {
    let vin = await getKeychainValue('fpVin');
    let token = await getKeychainValue('fpToken2');
    const country = await getKeychainValue('fpCountry');
    let lang = await getKeychainValue('fpLanguage');
    if (!vin) {
        return textValues().errorMessages.noVin;
    }

    return await makeFordRequest('getVehicleManual', `https://api.mps.ford.com/api/ownersmanual/v1/manuals/${vin}?countryCode=${country}&language=${lang}`, 'GET', false, {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
        'Application-Id': appIDs().NA,
        'auth-token': `${token}`,
        'Consumer-Key': `Z28tbmEtZm9yZA==`, // Base64 encoded version of "go-na-ford"
        Referer: 'https://ford.com',
        Origin: 'https://ford.com',
    });
}

async function getVehicleRecalls() {
    const vin = await getKeychainValue('fpVin');
    const token = await getKeychainValue('fpToken2');
    const country = await getKeychainValue('fpCountry');
    let lang = await getKeychainValue('fpLanguage');
    lang = lang.split('-');
    if (!vin) {
        return textValues().errorMessages.noVin;
    }
    let data = await makeFordRequest('getVehicleRecalls', `https://api.mps.ford.com/api/recall/v2/recalls?vin=${vin}&language=${lang[0].toUpperCase()}&region=${lang[1].toUpperCase()}&country=${country}`, 'GET', false);
    // console.log('recalls: ' + JSON.stringify(data));
    return data && data.value ? data.value : undefined;
}

async function getFordpassRewardsInfo(program = 'F') {
    const country = await getKeychainValue('fpCountry');
    let data = await makeFordRequest('getFordpassRewardsInfo', `https://api.mps.ford.com/api/rewards-account-info/v1/customer/points/totals?rewardProgram=${program}&programCountry=${country}`, 'GET', false);
    // console.log('fordpass rewards: ' + JSON.stringify(data));
    return data && data.pointsTotals && data.pointsTotals.F ? data.pointsTotals.F : undefined;
}

async function getEvChargeStatus() {
    const vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues().errorMessages.noVin;
    }
    return await makeFordRequest('getEvChargeStatus', `https://api.mps.ford.com/api/cevs/v1/chargestatus/retrieve`, 'POST', false, undefined, { vin: vin });
}

async function getEvPlugStatus() {
    const token = await getKeychainValue('fpToken2');
    const vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues().errorMessages.noVin;
    }
    return await makeFordRequest('getEvPlugStatus', `https://api.mps.ford.com/api/vpoi/chargestations/v3/plugstatus`, 'GET', false, {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
        'Application-Id': appIDs().NA,
        'auth-token': `${token}`,
        vin: vin,
    });
}

async function getEvChargerBalance() {
    const vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues().errorMessages.noVin;
    }
    let data = await makeFordRequest('getEvChargeBalance', `https://api.mps.ford.com/api/usage-management/v1/usage/balance`, 'POST', false, undefined, { vin: vin });
    return data && data.usageBalanceList ? data.usageBalanceList : [];
}

async function getSecuriAlertStatus() {
    const vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues().errorMessages.noVin;
    }
    let data = await makeFordRequest('getSecuriAlertStatus', `https://api.mps.ford.com/api/guardmode/v1/${vin}/session`, 'GET', false);
    return data && data.session && data.session.gmStatus ? data.session.gmStatus : undefined;
    // console.log('getSecuriAlertStatus: ' + JSON.stringify(data));
}

async function queryFordPassPrefs(force = false) {
    try {
        let dtNow = Date.now();
        let lastDt = await getKeychainValue('fpLastPrefsQueryTs');
        let ok2Upd = lastDt && dtNow - Number(lastDt) > 1000 * 60 * 5;
        // console.log(`Last prefs query: ${lastDt} | Now: ${dtNow} | Diff: ${dtNow - Number(lastDt)} | Ok2Upd: ${ok2Upd}`);
        if (ok2Upd || lastDt === null || force) {
            await setKeychainValue('fpLastPrefsQueryTs', dtNow.toString());
            console.log(ok2Upd ? `UserPrefs Expired - Refreshing from Ford API` : `UserPrefs Requested or Missing - Refreshing from Ford API`);

            let data = await makeFordRequest('queryFordPassPrefs', `https://api.mps.ford.com/api/users`, 'GET', false);
            // console.log('user data: ' + JSON.stringify(data));
            if (data && data.status === 200 && data.profile) {
                try {
                    await setKeychainValue('fpCountry', data.profile.country ? data.profile.country : 'USA');
                    await setKeychainValue('fpLanguage', data.profile.preferredLanguage || Device.locale());
                    await setKeychainValue('fpTz', data.profile.timeZone || CalendarEvent.timeZone);
                    await setKeychainValue('fpDistanceUnits', data.profile.uomDistance === 2 ? 'km' : 'mi');
                    await setKeychainValue('fpPressureUnits', data.profile.uomPressure ? data.profile.uomPressure : 'MPH');
                    console.log(`Saving User Preferences from Ford Account:`);
                    console.log(` - Country: ${data.profile.country ? data.profile.country : 'USA (Fallback)'}`);
                    console.log(` - Language: ${data.profile.preferredLanguage ? data.profile.preferredLanguage : Device.locale() + ' (Fallback)'}`);
                    console.log(` - DistanceUnit: ${data.profile.uomDistance === 2 ? 'km' : 'mi'}`);
                    console.log(` - PressureUnit: ${data.profile.uomPressure !== undefined && data.profile.uomPressure !== '' ? data.profile.uomPressure : 'PSI (Fallback)'}`);
                } catch (e) {
                    console.log(`setUserPrefs Error: ${e}`);
                }
                return true;
            }
            return false;
        }
    } catch (e) {
        console.error(e);
    }
}

async function getAllUserData() {
    let data = await makeFordRequest('setUserPrefs', `https://api.mps.ford.com/api/users`, 'GET', false);
    // console.log('user data: ' + JSON.stringify(data));
    if (data && data.status === 200 && data.profile) {
        return data;
    }
    return undefined;
}

async function makeFordRequest(desc, url, method, json = false, headerOverride = undefined, body = undefined) {
    let authMsg = await checkAuth('makeFordRequest(' + desc + ')');
    if (authMsg) {
        return authMsg;
    }
    let token = await getKeychainValue('fpToken2');
    let vin = await getKeychainValue('fpVin');
    if (!vin) {
        return textValues().errorMessages.noVin;
    }
    const headers = headerOverride || {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
        'Application-Id': appIDs().NA,
        'auth-token': `${token}`,
    };

    let request = new Request(url);
    request.headers = headers;
    request.method = method;
    request.timeoutInterval = 20;
    if (body) {
        request.body = JSON.stringify(body);
    }
    try {
        let data = json ? await request.loadJSON() : await request.loadString();
        let resp = request.response;
        // if (widgetConfig.debugMode) {
        // console.log(`makeFordRequest Req | Status: ${resp.statusCode}) | Resp: ${data}`);
        // }
        if (data == textValues().errorMessages.accessDenied) {
            console.log(`makeFordRequest(${desc}): Auth Token Expired. Fetching New Token and Requesting Data Again!`);
            let result = await fetchToken();
            if (result && result == textValues().errorMessages.invalidGrant) {
                return result;
            }
            data = await makeFordRequest(desc, url, method, json, body);
        } else {
            data = json ? data : JSON.parse(data);
        }
        if (data.statusCode && data.statusCode !== 200) {
            return textValues().errorMessages.connectionErrorOrVin;
        }
        return data;
    } catch (e) {
        console.log(`makeFordRequest | ${desc} | Error: ${e}`);
        return textValues().errorMessages.unknownError;
    }
}

const vehicleCmdConfigs = (vin) => {
    const baseUrl = 'https://usapi.cv.ford.com/api';
    const guardUrl = 'https://api.mps.ford.com/api';
    return {
        lock: {
            desc: 'Lock Doors',
            cmds: [
                {
                    uri: `${baseUrl}/vehicles/${vin}/doors/lock`,
                    method: 'PUT',
                },
            ],
        },
        unlock: {
            desc: 'Unlock Doors',
            cmds: [
                {
                    uri: `${baseUrl}/vehicles/${vin}/doors/lock`,
                    method: 'DELETE',
                },
            ],
        },
        start: {
            desc: 'Remote Start',
            cmds: [
                {
                    uri: `${baseUrl}/vehicles/${vin}/engine/start`,
                    method: 'PUT',
                },
            ],
        },
        stop: {
            desc: 'Remote Stop',
            cmds: [
                {
                    uri: `${baseUrl}/vehicles/${vin}/engine/start`,
                    method: 'DELETE',
                },
            ],
        },
        horn_and_lights: {
            desc: 'Horn & Lights On',
            cmds: [
                {
                    uri: `${baseUrl}/vehicles/${vin}/panic/3`,
                    method: 'PUT',
                },
            ],
        },
        zone_lights_off: {
            desc: 'Zone Off Zone Lighting (All Lights)',
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
                    uri: `${baseUrl}/vehicles/${vin}/status`,
                    method: 'PUT',
                },
            ],
        },
    };
};

async function sendVehicleCmd(cmd_type = '') {
    let authMsg = await checkAuth('sendVehicleCmd(' + cmd_type + ')');
    if (authMsg) {
        console.log(`sendVehicleCmd(${cmd_type}): ${result}`);
        return;
    }
    let token = await getKeychainValue('fpToken2');
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
            'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/json',
            'Application-Id': appIDs().NA,
            'auth-token': `${token}`,
        };
        req.method = cmds[cmd].method;
        req.timeoutInterval = 10;

        try {
            let data = await req.loadString();
            let cmdResp = req.response;
            // console.log(data);
            if (data == 'Access Denied') {
                console.log('sendVehicleCmd: Auth Token Expired. Fetching new token and fetch raw data again');
                let result = await fetchToken();
                if (result && result == textValues().errorMessages.invalidGrant) {
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
                    if (widgetConfig.debugMode) {
                        console.log('Debug: Error while sending vehicle cmd');
                        console.log(JSON.stringify(data));
                    }
                    if (cmdResp.statusCode === 590) {
                        console.log('code 590');
                        console.log(`isLastCmd: ${isLastCmd}`);
                        outMsg = { title: `${cmdDesc} Command`, message: textValues().errorMessages.cmd_err_590 };
                    } else {
                        errMsg = `Command Error: ${JSON.stringify(data)}`;
                        outMsg = { title: `${cmdDesc} Command`, message: `${textValues().errorMessages.cmd_err}\n\Error: ${cmdResp.statusCode}` };
                    }
                } else {
                    console.log('sendVehicleCmd Response: ' + JSON.stringify(data));
                    outMsg = { title: `${cmdDesc} Command`, message: textValues().successMessages.cmd_success };
                }
            }

            if (wasError) {
                if (errMsg) {
                    console.log(`sendVehicleCmd(${cmd_type}) | Error: ${errMsg}`);
                }
                if (outMsg.message !== '') {
                    await showAlert(outMsg.title, outMsg.message);
                }
                return;
            } else {
                if (isLastCmd) {
                    console.log(`sendVehicleCmd(${cmd_type}) | Sent Successfully`);
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
    if (statusData == textValues().errorMessages.invalidGrant || statusData == textValues().errorMessages.connectionErrorOrVin || statusData == textValues().errorMessages.unknownError || statusData == textValues().errorMessages.noVin || statusData == textValues().errorMessages.noCredentials) {
        // console.log('fetchVehicleData | Error: ' + statusData);
        let localData = readLocalData();
        if (localData) {
            vehicleData = localData;
        }
        if (statusData == textValues().errorMessages.invalidGrant) {
            console.log(`fetchVehicleData | Error: ${statusData} | Clearing Authentication from Keychain`);
            await removeKeychainValue('fpPass');
            // await removeLocalData();
        }
        vehicleData.error = statusData;
        return vehicleData;
    }
    vehicleData.rawStatus = statusData;
    if (widgetConfig.logVehicleData) {
        console.log(`Status: ${JSON.stringify(statusData)}`);
    }

    // Pulls in info about the vehicle like brand, model, year, etc. (Used to help with getting vehicle image and name for the map)
    let infoData = await getVehicleInfo();
    // console.log(`infoData: ${JSON.stringify(infoData)}`);
    vehicleData.info = infoData;
    if (widgetConfig.logVehicleData) {
        console.log(`Info: ${JSON.stringify(infoData)}`);
    }

    // Pulls in a list of the vehicles capabilities like zone lighting, remote start, etc.
    let capData = await getVehicleCapabilities();
    // console.log(`capData: ${JSON.stringify(capData)}`);
    vehicleData.capabilities = capData;
    if (widgetConfig.logVehicleData) {
        console.log(`Capabilities: ${JSON.stringify(capData)}`);
    }

    vehicleData.messages = await getUserMessages();
    // console.log(`messagesData: ${JSON.stringify(vehicleData.messages)}`);

    vehicleData.alerts = await getVehicleAlerts();
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
        vehicleData.evChargeStatus2 = await getEvChargeStatus();
        // Gets EV Plug Status from special endpoint
        vehicleData.evPlugStatus2 = await getEvPlugStatus();
        // Get EV Charger Balance from special endpoint
        vehicleData.evChargerBalance = await getEvChargerBalance();
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
    if (vehicleData.capabilities.includes('ZONE_LIGHTING_FOUR_ZONES') || vehicleData.capabilities.includes('ZONE_LIGHTING_TWO_ZONES')) {
        vehicleData.zoneLightingSupported = vehicleStatus.zoneLighting && vehicleStatus.zoneLighting.activationData && vehicleStatus.zoneLighting.activationData.value === undefined ? false : true;
        vehicleData.zoneLightingStatus = vehicleStatus.zoneLighting && vehicleStatus.zoneLighting.activationData && vehicleStatus.zoneLighting.activationData.value ? vehicleStatus.zoneLighting.activationData.value : 'Off';
    }

    // trailer light check status
    if (vehicleData.capabilities.includes('TRAILER_LIGHT')) {
        vehicleData.trailerLightCheckStatus = vehicleStatus.trailerLightCheck && vehicleStatus.trailerLightCheck.trailerLightCheckStatus && vehicleStatus.trailerLightCheck.trailerLightCheckStatus.value ? (vehicleStatus.trailerLightCheck.trailerLightCheckStatus.value === 'LIGHT_CHECK_STOPPED' ? 'Off' : 'On') : undefined;
    }

    // Remote Start status
    vehicleData.remoteStartStatus = {
        running: vehicleStatus.remoteStartStatus ? (vehicleStatus.remoteStartStatus.value === 0 ? false : true) : false,
        duration: vehicleStatus.remoteStart && vehicleStatus.remoteStart.remoteStartDuration ? vehicleStatus.remoteStart.remoteStartDuration.value : 0,
    };
    // console.log(`Remote Start Status: ${JSON.stringify(vehicleStatus.remoteStart)}`);

    // Alarm status
    vehicleData.alarmStatus = vehicleStatus.alarm ? (vehicleStatus.alarm.value === 'SET' ? 'On' : 'Off') : 'Off';

    //Battery info
    vehicleData.batteryStatus = vehicleStatus.battery && vehicleStatus.battery.batteryHealth ? vehicleStatus.battery.batteryHealth.value : textValues().UIValues.unknown;
    vehicleData.batteryLevel = vehicleStatus.battery && vehicleStatus.battery.batteryStatusActual ? vehicleStatus.battery.batteryStatusActual.value : undefined;

    // Whether Vehicle is in deep sleep mode (Battery Saver) | Supported Vehicles Only
    vehicleData.deepSleepMode = vehicleStatus.deepSleepInProgess ? vehicleStatus.deepSleepInProgess.value === 'true' : undefined;

    // Whether Vehicle is currently installing and OTA update (OTA) | Supported Vehicles Only
    vehicleData.firmwareUpdating = vehicleStatus.firmwareUpgInProgress ? vehicleStatus.firmwareUpgInProgress.value === 'true' : undefined;

    //distance to empty
    vehicleData.distanceToEmpty = vehicleStatus.fuel && vehicleStatus.fuel.distanceToEmpty ? vehicleStatus.fuel.distanceToEmpty : null;

    //fuel level
    vehicleData.fuelLevel = vehicleStatus.fuel && vehicleStatus.fuel.fuelLevel ? Math.floor(vehicleStatus.fuel.fuelLevel) : null;

    //position of car
    vehicleData.position = await getPosition(vehicleStatus);
    vehicleData.latitude = parseFloat(vehicleStatus.gps.latitude);
    vehicleData.longitude = parseFloat(vehicleStatus.gps.longitude);

    // true means, that window is open
    let windows = vehicleStatus.windowPosition;
    //console.log("windows:", JSON.stringify(windows));
    vehicleData.statusWindows = {
        leftFront: windows && windows.driverWindowPosition ? !['Fully_Closed', 'Fully closed position', 'Undefined window position', 'Undefined'].includes(windows.driverWindowPosition.value) : false,
        rightFront: windows && windows.passWindowPosition ? !['Fully_Closed', 'Fully closed position', 'Undefined window position', 'Undefined'].includes(windows.passWindowPosition.value) : false,
        leftRear: windows && windows.rearDriverWindowPos ? !['Fully_Closed', 'Fully closed position', 'Undefined window position', 'Undefined'].includes(windows.rearDriverWindowPos.value) : false,
        rightRear: windows && windows.rearPassWindowPos ? !['Fully_Closed', 'Fully closed position', 'Undefined window position', 'Undefined'].includes(windows.rearPassWindowPos.value) : false,
    };

    //true means, that door is open
    let doors = vehicleStatus.doorStatus;
    vehicleData.statusDoors = {
        leftFront: !(doors.driverDoor && doors.driverDoor.value == 'Closed'),
        rightFront: !(doors.passengerDoor && doors.passengerDoor.value == 'Closed'),
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
        leftFront: await pressureToFixed(tpms.leftFrontTirePressure.value, 0),
        rightFront: await pressureToFixed(tpms.rightFrontTirePressure.value, 0),
        leftRear: await pressureToFixed(tpms.outerLeftRearTirePressure.value, 0),
        rightRear: await pressureToFixed(tpms.outerRightRearTirePressure.value, 0),
    };

    vehicleData.recallInfo = (await getVehicleRecalls()) || [];
    // console.log(`Recall Info: ${JSON.stringify(vehicleData.recallInfo)}`);

    vehicleData.fordpassRewardsInfo = await getFordpassRewardsInfo();
    // console.log(`Fordpass Rewards Info: ${JSON.stringify(vehicleData.fordpassRewardsInfo)}`);

    vehicleData.lastRefresh = convertFordDtToLocal(vehicleStatus.lastRefresh.includes('01-01-2018') ? vehicleStatus.lastModifiedDate : vehicleStatus.lastRefresh);
    vehicleData.lastRefreshElapsed = timeDifference(convertFordDtToLocal(vehicleStatus.lastRefresh.includes('01-01-2018') ? vehicleStatus.lastModifiedDate : vehicleStatus.lastRefresh));
    console.log(`lastRefresh | raw: ${vehicleStatus.lastRefresh.includes('01-01-2018') ? vehicleStatus.lastModifiedDate : vehicleStatus.lastRefresh} | conv: ${vehicleData.lastRefresh.toLocaleString()}`);
    console.log(`timeSince: ${vehicleData.lastRefreshElapsed}`);

    // console.log(JSON.stringify(vehicleData));

    //save data to local store
    saveDataToLocal(vehicleData);

    return vehicleData;
}

//******************************************** END FORDPASS API FUNCTIONS *********************************************************
//*********************************************************************************************************************************

//********************************************************************************************************************************
//*                                             START FILE/KEYCHAIN MANAGEMENT FUNCTIONS
//********************************************************************************************************************************

async function vinFix() {
    vin = await getKeychainValue('fpVin');
    if (vin && hasLowerCase(vin)) {
        console.log('VIN Validation Error: Your saved VIN number has lowercase letters.\nUpdating your saved value for you!');
        await setKeychainValue('fpVin', vin.toUpperCase());
    }
}

async function vinCheck(vin, setup = false) {
    vin = vin || (await getKeychainValue('fpVin'));
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
                await showAlert('VIN Validation Error', msgs.join('\n'));
            }
            return false;
        } else {
            return true;
        }
    }
    return false;
}

async function useMetricUnits() {
    return (await getKeychainValue('fpDistanceUnits')) !== 'mi';
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

async function getKeychainValue(key) {
    key = SCRIPT_ID !== null && SCRIPT_ID !== undefined && SCRIPT_ID > 0 ? `${key}_${SCRIPT_ID}` : key;
    try {
        if (await Keychain.contains(key)) {
            return await Keychain.get(key);
        }
    } catch (e) {
        console.log(`getKeychainValue(${key}) Error: ${e}`);
    }
    return null;
}

async function setKeychainValue(key, value) {
    if (key && value) {
        key = SCRIPT_ID !== null && SCRIPT_ID !== undefined && SCRIPT_ID > 0 ? `${key}_${SCRIPT_ID}` : key;
        await Keychain.set(key, value);
    }
}

function hasKeychainValue(key) {
    return Keychain.contains(key);
}

async function removeKeychainValue(key) {
    key = SCRIPT_ID !== null && SCRIPT_ID !== undefined && SCRIPT_ID > 0 ? `${key}_${SCRIPT_ID}` : key;
    if (await Keychain.contains(key)) {
        await Keychain.remove(key);
    }
}

function prefKeys() {
    return {
        core: ['fpUser', 'fpPass', 'fpToken2', 'fpVin', 'fpMapProvider', 'fpCountry', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits'], // 'fpDeviceLanguage'
        user: ['fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits'],
    };
}

async function requiredPrefsOk(keys) {
    let missingKeys = [];
    for (const key in keys) {
        let val = await getKeychainValue(keys[key]);
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

async function clearKeychain() {
    console.log('Info: Clearing All Widget Data from Keychain');
    const keys = ['fpToken', 'fpToken2', 'fpUsername', 'fpUser', 'fpPass', 'fpPassword', 'fpVin', 'fpUseMetricUnits', 'fpUsePsi', 'fpVehicleType', 'fpMapProvider', 'fpCat1Token', 'fpTokenExpiresAt', 'fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits', 'fpSpeedUnits'];
    for (const key in keys) {
        await removeKeychainValue(keys[key]);
    }
}

// async function performKeychainMigration() {
//     let kcKeys = ['fpUser', 'fpPass', 'fpToken2', 'fpVin', 'fpMapProvider', 'fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpSpeedUnits'];
//     for (const key in kcKeys) {
//         // if (Keychain.contains())
//     }
// }

async function getFPImage(image, asData = false) {
    return await getImage(image, 'FP_Icons', asData);
}

// get images from local filestore or download them once
async function getImage(image, subPath = '', asData = false) {
    try {
        let fm = FileManager.local();
        let dir = fm.documentsDirectory();
        let path = fm.joinPath(dir, image);
        let imageUrl = `https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/icons/${subPath.length ? subPath + '/' : ''}${image}`;
        if (await fm.fileExists(path)) {
            if (asData) {
                return await fm.read(path);
            } else {
                return await fm.readImage(path);
            }
        } else {
            // download image and save to local device
            switch (image) {
                case 'gas-station_light.png':
                    imageUrl = 'https://i.imgur.com/gfGcVmg.png';
                    break;
                case 'gas-station_dark.png':
                    imageUrl = 'https://i.imgur.com/hgYWYC0.png';
                    break;
            }
            console.log('ImageUrl: ' + imageUrl);
            let iconImage = await loadImage(imageUrl);
            await fm.writeImage(path, iconImage);
            return iconImage;
        }
    } catch (e) {
        console.log(`getImage(${image}) Error: ${e}`);
        return null;
    }
}

async function getVehicleImage(modelYear, cloudStore = false, angle = 4, asData = false) {
    let fm = cloudStore ? FileManager.iCloud() : FileManager.local();
    let dir = fm.documentsDirectory();
    let fileName = SCRIPT_ID !== null && SCRIPT_ID !== undefined && SCRIPT_ID > 0 ? `vehicle-${angle}_${SCRIPT_ID}.png` : `vehicle-${angle}.png`;
    let path = fm.joinPath(dir, fileName);
    if (await fm.fileExists(path)) {
        if (asData) {
            return await fm.read(path);
        } else {
            return await fm.readImage(path);
        }
    } else {
        let vin = await getKeychainValue('fpVin');
        let token = await getKeychainValue('fpToken2');
        let country = await getKeychainValue('fpCountry');
        console.log(`vehicleImage | VIN: ${vin} | country: ${country}`);
        let req = new Request(`https://www.digitalservices.ford.com/fs/api/v2/vehicles/image/full?vin=${vin}&year=${modelYear}&countryCode=${country}&angle=${angle}`);
        req.headers = {
            'Content-Type': 'application/json',
            Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
            'Accept-Encoding': 'gzip, deflate, br',
            'auth-token': `${token}`,
            Origin: 'https://www.ford.com',
            Referer: 'https://www.ford.com',
        };
        req.method = 'GET';
        req.timeoutInterval = 10;
        try {
            let img = await req.loadImage();
            let resp = req.response;
            // console.log(`vehicleImage Resp: ${resp.statusCode}`);
            if (resp.statusCode === 200) {
                await fm.writeImage(path, img);
                return img;
            } else {
                return await getImage('placeholder.png');
            }
        } catch (e) {
            console.error(`getVehicleImage Error: Could Not Load Vehicle Image. ${e}`);
            return await getImage('placeholder.png');
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
    let fileName = SCRIPT_ID !== null && SCRIPT_ID !== undefined && SCRIPT_ID > 0 ? `$fp_vehicleData_${SCRIPT_ID}.json` : 'fp_vehicleData.json';
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    let path = fm.joinPath(dir, fileName);
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

async function getReleaseNotes(url, locale) {
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
    return undefined;
}

async function getLatestScriptVersion() {
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

async function createEmailObject(data, attachJson = false) {
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
        if (fm.fileExists(path)) {
            await fm.remove(path); //removes existing file if it exists
        }
        await fm.writeString(path, JSON.stringify(data));
        await email.addFileAttachment(path);
    }
    await email.send();
    await fm.remove(path);
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

function getTirePressureStyle(pressure, unit, wSize = 'medium') {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color(runtimeData.textColor2) },
        statLow: { font: Font.heavySystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF6700') },
        statCrit: { font: Font.heavySystemFont(sizeMap[wSize].fontSizeMedium), textColor: new Color('#DE1738') },
        offset: 10,
    };
    let p = parseFloat(pressure);
    if (p) {
        let low = widgetConfig.tirePressureThresholds.low;
        let crit = widgetConfig.tirePressureThresholds.critical;
        switch (unit) {
            case 'kPa':
                low = widgetConfig.tirePressureThresholds.low / 0.145377;
                crit = widgetConfig.tirePressureThresholds.critical / 0.145377;
                break;
            case 'bar':
                low = widgetConfig.tirePressureThresholds.low / 14.5377;
                crit = widgetConfig.tirePressureThresholds.critical / 14.5377;
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

function convertFordDtToLocal(src) {
    try {
        let dtp = new Date(Date.parse(src.replace(/-/g, '/')));
        let dto = new Date(dtp.getTime() - dtp.getTimezoneOffset() * 60 * 1000);
        return dto;
    } catch (e) {
        console.log(`convertFordDtToLocal Error: ${e}`);
    }
}

function timeDifference(prevTime) {
    const now = new Date().getTime();
    const min = 60 * 1000;
    const hour = min * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = day * 365;
    const elap = now - prevTime;

    if (elap < min) {
        let d = Math.round(elap / 1000);
        return `${d} ${textValues().UIValues.second}${d > 1 ? textValues().UIValues.plural : ''} ${textValues().UIValues.subsequentAdverb}`;
    } else if (elap < hour) {
        let d = Math.round(elap / min);
        return `${d} ${textValues().UIValues.minute}${d > 1 ? textValues().UIValues.plural : ''} ${textValues().UIValues.subsequentAdverb}`;
    } else if (elap < day) {
        let d = Math.round(elap / hour);
        return `${d} ${textValues().UIValues.hour}${d > 1 ? textValues().UIValues.plural : ''} ${textValues().UIValues.subsequentAdverb}`;
    } else if (elap < month) {
        let d = Math.round(elap / day);
        return `${d} ${textValues().UIValues.day}${d > 1 ? textValues().UIValues.plural : ''} ${textValues().UIValues.subsequentAdverb}`;
    } else if (elap < year) {
        let d = Math.round(elap / month);
        return `${d} ${textValues().UIValues.month}${d > 1 ? textValues().UIValues.plural : ''} ${textValues().UIValues.subsequentAdverb}`;
    } else {
        let d = Math.round(elap / year);
        return `${d} ${textValues().UIValues.year}${d > 1 ? textValues().UIValues.plural : ''} ${textValues().UIValues.subsequentAdverb}`;
    }
}

async function pressureToFixed(pressure, digits) {
    // console.log(`pressureToFixed(${pressure}, ${digits})`);
    try {
        let unit = await getKeychainValue('fpPressureUnits');
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

function hasLowerCase(str) {
    return str.toUpperCase() != str;
}

function scrubPersonalData(data) {
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

function inputTest(val) {
    return val !== '' && val !== null && val !== undefined;
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

function isNewerVersion(oldVer, newVer) {
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

//************************************************* END UTILITY FUNCTIONS ********************************************************
//********************************************************************************************************************************

// const messageTest = {}
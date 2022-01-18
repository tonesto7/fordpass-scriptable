// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: car;
// This script was downloaded using FordWidgetTool.
// hash: 898792870;

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
    v2.0.0:
        - Modified the fuel/battery bar to show the icon and percentage in the bar. The bar is now green when vehicle is EV, and red when below 10% and yellow below 20%;
        - Removed vehicle odometer from the widget UI to save space (moved it to the dashboard menu section)
        - Modified the margins of the widget to be more consistent and be better on small screens and small widgets.
        - Renamed debug menu to advanced info menu.
        - Added new option to advanced info menu to allow emailing your anonymous vehicle data to me 
            (Because this is email I will see your address, but you can choose to setup a private email using icloud hide email feature)(Either way i will never share or use your email for anything)
        
// Todo: This Release (v2.0.0)) 
    - use OTA info to show when an update is available or pending.
    - move OTA info to table view.
    - Show notifications for specific events or errors (like low battery, low oil, ota updates)
    - add actionable notifications for items like doors still unlocked after a certain time or low battery offer remote star... etc
    - Create widgets with less details and larger image.

// Todo: Next Release (Post 2.0.x)
- setup up daily schedule that makes sure the doors are locked at certain time of day (maybe).
    - add support for other languages
    - add charge scheduling to dashboard menu
    - add support for right hand drive (driver side windows, and doors etc.)
    - add option to define dark or light mode (this might not work because the UI is driven based on OS theme)
    - add voice interface using siri shortcut
        * generate list of actionable commands based on capability
        * generate list of request command info available (are the doors locked, is the vehicle on, current fuel level, etc)
        * handle context and tense of command
    
**************/

const changelog = {
    '2.0.0': {
        added: [
            'All new menu that functions like an app interface',
            'Added new option to advanced info menu to allow emailing your anonymous vehicle data to me (Because this is email I will see your address, but you can choose to setup a private email using icloud hide email feature)(Either way i will never share or use your email for anything).',
            'Script changes are show in a window when new versions are released.',
        ],
        fixed: ['Modified the margins of the widget to be more consistent and be better on small screens and small widgets.', 'Vehicle images should now load correctly.'],
        removed: ['Removed vehicle odometer from the widget UI to save space (moved it to the dashboard menu section).'],
        updated: ['Modified the fuel/battery bar to show the icon and percentage in the bar. The bar is now green when vehicle is EV, and red when below 10% and yellow below 20%.', 'Renamed debug menu to advanced info menu.'],
    },
};

const SCRIPT_VERSION = '2.0.0';
const SCRIPT_TS = '2022/01/18   , 6:00 pm';
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
// console.log(`OSDarkMode: ${darkMode}`);
// console.log(`IsSmallDisplay: ${isSmallDisplay}`);
// console.log(`ScreenSize: Width: ${screenSize.width} | Height: ${screenSize.height}`);
// console.log(`Device Info | Model: ${Device.model()} | OSVersion: ${Device.systemVersion()}`);

//******************************************************************
//* Customize Widget Options
//******************************************************************
const widgetConfig = {
    debugMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    debugAuthMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    logVehicleData: false, // Logs the vehicle data to the console (Used to help end users easily debug their vehicle data and share with develop)
    screenShotMode: true, // Places a dummy address in the widget for anonymous screenshots.
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
    showTestUIStuff: false,
};

//******************************************************************
//* Edit these values to accomodate your langauge or prefrerences
//******************************************************************
const textValues = (str) => {
    return {
        symbols: {
            closed: '✓',
            open: '✗',
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
        about: {
            author: 'Anthony S.',
            authorGithub: 'https://github.com/tonesto7',
            desc: "This is a custom widget for Ford's Vehicle Connect app.\n\nIt is a work in progress and is not yet complete.\n\nIf you have any questions or comments, please contact me at",
            email: 'purer_06_fidget@icloud.com',
            donationsDesc: 'If you like this widget, please consider making a donation to the author.\n\nYou can do so by clicking the button below.',
            donationUrl: 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HWBN4LB9NMHZ4',
            documentationUrl: 'https://github.com/tonesto7/fordpass-scriptable#readme',
            issuesUrl: 'https://github.com/tonesto7/fordpass-scriptable/issues',
            helpVideos: {
                setup: {
                    title: 'Setup the Widget',
                    url: 'https://tonesto7.github.io/fordpass-scriptable/videos/setup_demo.mp4',
                },
            },
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

// Table Map Object - Used to map the data to the table
let tableMap = {};
let timerMap = {};

if (config.runsInWidget) {
    await generateWidget(runningWidgetSize, fordData);
} else if (config.runsInApp || config.runsFromHomeScreen) {
    // Show alert with current data (if running script in app)
    if (args.shortcutParameter) {
        // await showAlert('shortcutParameter: ', JSON.stringify(args.shortcutParameter));
        // Create a parser function...
        await Speech.speak(await parseIncomingSiriCommand(args.shortcutParameter));
    } else {
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

async function createNotification(title, subtitle, body, options = {}) {
    let notif = new Notification();
    notif.title = title;
    notif.subtitle = subtitle;
    notif.body = body;
    if (options && Object.keys(options).length > 0) {
        // Options:
        // - identifier: string
        // - threadIdentifier: string // Identifier for grouping the notification.
        // - sound: 'default', 'accept', 'alert', 'complete', 'event', 'failure', 'piano_error', 'piano_success', 'popup'
        // - openUrl: 'url'
        // - badge: 'number'
        // - userInfo: {string: any} // Store any custom information for the notification. This can be accessed from the Notification.opened property
        // - nextTriggerDate: Date // Returns The date and time when the notification will be triggered.
        // - scriptName: string // The name of the script to be executed when the notification is tapped.
        // - actions: [{title: string, url: string}] // An array of actions for the notification.
        // - addAction(title: string, url: string, destructive: bool) // Add an action button to the notification. (max 10 actions)
        // - current() // Notification a script is running in.
        // - setTriggerDate(date: Date) // Set the date and time when the notification will be triggered.
        // - setDailyTrigger(hour: number, minute: number, repeats: bool) // Set the time of day when the notification will be triggered.
        // - setWeeklyTrigger(weekday: number, hour: number, minute: number, repeats: bool) // Set the day of the week and time of day when the notification will be triggered.
        for (const [key, value] of Object.entries(options)) {
            // console.log(key, value);
            if (value !== undefined) {
                switch (key) {
                    case 'addAction':
                        if (value.length > 0) {
                            for (const [i, action] of value.entries()) {
                                if (i < 10) {
                                    notif.addAction(action.title, action.url);
                                }
                            }
                        }
                        break;
                    case 'setTriggerDate':
                        if (value instanceof Date) {
                            notif.setTriggerDate(value);
                        }
                        break;
                    case 'setDailyTrigger':
                        if (value && value.hour && value.minute) {
                            notif.setDailyTrigger(value.hour, value.minute, value.repeats === true);
                        }
                        break;
                    case 'setWeeklyTrigger':
                        if (value && value.weekday && value.hour && value.minute) {
                            notif.setWeeklyTrigger(value.weekday, value.hour, value.minute, value.repeats === true);
                        }
                        break;
                    default:
                        notif[key] = value;
                        break;
                }
            }
        }
    }
    await notif.schedule();
}

async function getPendingNotification() {
    return Notification.allPending();
}

async function getDeliveredNotification() {
    return Notification.allDelivered();
}

async function removePendingNotification(identifier) {
    return await Notification.removePending(identifier);
}

async function removeAllPendingNotification() {
    return await Notification.removeAllPending();
}

async function removeAllDeliveredNotification() {
    return await Notification.removeAllDelivered();
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
    let fillLevel = percent > 100 ? 100 : percent;
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
    lvlBarPath.addRoundedRect(new Rect(0, 0, (barWidth * fillLevel) / 100, sizeMap[wSize].barGauge.h), 3, 2);
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

    // if (fillLevel > 75) {
    //     context.setTextColor(Color.white());
    // }
    const icon = isEV ? String.fromCodePoint('0x1F50B') : '\u26FD';
    const lvlStr = fillLevel < 0 || fillLevel > 100 ? '--' : `${fillLevel}%`;
    context.drawTextInRect(`${icon} ${lvlStr}`, new Rect(xPos, sizeMap[wSize].barGauge.h / sizeMap[wSize].barGauge.fs, sizeMap[wSize].barGauge.w, sizeMap[wSize].barGauge.h));
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
        await createText(col1row1, vData.statusDoors.driverFront ? textValues().symbols.open : textValues().symbols.closed, vData.statusDoors.driverFront ? styles.statOpen : styles.statClosed);
        await createText(col1row1, ')', styles.normTxt);

        let col2 = await createColumn(dataRow1Fld, { '*setPadding': [0, 3, 0, 3] });
        let col2row1 = await createRow(col2, { '*setPadding': [0, 0, 0, 0] });
        await createText(col2row1, '|', styles.normTxt);

        let col3 = await createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
        let col3row1 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
        await createText(col3row1, 'RF (', styles.normTxt);
        await createText(col3row1, vData.statusDoors.passFront ? textValues().symbols.open : textValues().symbols.closed, vData.statusDoors.passFront ? styles.statOpen : styles.statClosed);
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

function getOpenItems(items) {
    let openItems = [];
    if (items && items.length) {
        Object.entries(doors)
            .filter(([_, v]) => v)
            .map(([k, _]) => k)
            .forEach((k) => {
                switch (k) {
                    case 'driverFront':
                        openItems.push('DF');
                        break;
                    case 'passFront':
                        openItems.push('PF');
                        break;
                    case 'leftRear':
                        openItems.push('LR');
                        break;
                    case 'rightRear':
                        openItems.push('RR');
                        break;
                    case 'hood':
                        openItems.push('HD');
                        break;
                    case 'tailgate':
                        openItems.push('TG');
                        break;
                    case 'innerTailgate':
                        openItems.push('ITG');
                        break;
                }
            });
    }
    return openItems;
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
        await createText(col1row1, vData.statusWindows.driverFront ? textValues().symbols.open : textValues().symbols.closed, vData.statusWindows['driverFront'] ? styles.statOpen : styles.statClosed);
        await createText(col1row1, ')', styles.normTxt);

        let col2 = await createColumn(dataRow1Fld, { '*setPadding': [0, 3, 0, 3] });
        let col2row1 = await createRow(col2, { '*setPadding': [0, 0, 0, 0] });
        await createText(col2row1, '|', styles.normTxt);

        let col3 = await createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
        let col3row1 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
        await createText(col3row1, 'RF (', styles.normTxt);
        await createText(col3row1, vData.statusWindows['passFront'] ? textValues().symbols.open : textValues().symbols.closed, vData.statusWindows['passFront'] ? styles.statOpen : styles.statClosed);
        await createText(col3row1, ')', styles.normTxt);

        // Creates the second row of status elements for LR and RR
        if (vData.statusWindows.driverRear !== null && vData.statusWindows.passRear !== null) {
            let col1row2 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await createText(col1row2, `LR (`, styles.normTxt);
            await createText(col1row2, vData.statusWindows.driverRear ? textValues().symbols.open : textValues().symbols.closed, vData.statusWindows.driverRear ? styles.statOpen : styles.statClosed);
            await createText(col1row2, ')', styles.normTxt);

            let col2row2 = await createRow(col2, {});
            await createText(col2row2, '|', styles.normTxt);

            let col3row2 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await createText(col3row2, `RR (`, styles.normTxt);
            await createText(col3row2, vData.statusWindows.passRear ? textValues().symbols.open : textValues().symbols.closed, vData.statusWindows.passRear ? styles.statOpen : styles.statClosed);
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

async function collectAllData(scrub = false) {
    let data = await fetchVehicleData(true);
    data.otaInfo = await getVehicleOtaInfo();
    data.userPrefs = {
        country: await getKeychainValue('fpCountry'),
        timeZone: await getKeychainValue('fpTz'),
        language: await getKeychainValue('fpLanguage'),
        unitOfDistance: await getKeychainValue('fpDistanceUnits'),
        unitOfPressure: await getKeychainValue('fpPressureUnits'),
    };
    // data.userDetails = await getAllUserData();
    return scrub ? scrubPersonalData(data) : data;
}

async function menuBuilderByType(type) {
    const vehicleData = await fetchVehicleData(true);
    // const caps = vehicleData.capabilities && vehicleData.capabilities.length ? vehicleData.capabilities : undefined;
    const typeDesc = capitalizeStr(type);
    let title = undefined;
    let message = undefined;
    let items = [];

    switch (type) {
        case 'main':
            title = `Widget Menu`;
            message = `Widget Version: (${SCRIPT_VERSION})`.trim();
            items = [
                {
                    title: 'View Widget',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) View Widget was pressed`);
                        menuBuilderByType('widgetView');
                        // const w = await generateWidget('medium', fordData);
                        // await w.presentMedium();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Request Refresh',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Refresh was pressed`);
                        if (await showYesNoPrompt('Vehicle Data Refresh', "Are you sure you want to send a wake request to the vehicle to refresh it's data?\n\nThis is not an instant thing and sometimes takes minutes to wake the vehicle...")) {
                            await sendVehicleCmd('status');
                        }
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Settings',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Settings was pressed`);
                        menuBuilderByType('settings');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Help & Info',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Help & Info was pressed`);
                        await menuBuilderByType('helpInfo');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Close',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Close was pressed`);
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;

        case 'helpInfo':
            title = `Help & About`;
            items = [
                {
                    title: 'Recent Changes',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) About was pressed`);
                        await generateRecentChangesTable();
                        menuBuilderByType('helpInfo');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'View Documentation',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Small Widget was pressed`);
                        await Safari.openInApp(textValues().about.documentationUrl);
                        menuBuilderByType('helpInfo');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Report Issues',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Report Issues was pressed`);
                        await Safari.openInApp(textValues().about.issuesUrl);
                        menuBuilderByType('helpInfo');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Donate',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Donate was pressed`);
                        await Safari.open(textValues().about.donationUrl);
                        menuBuilderByType('helpInfo');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Diagnostics',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Diagnostics was pressed`);
                        await menuBuilderByType('diagnostics');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Back',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Back was pressed`);
                        menuBuilderByType('main');
                    },
                    destructive: false,
                    show: true,
                },
            ];

            break;
        case 'widgetView':
            title = 'View Widget';
            items = [
                {
                    title: 'Small',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Small Widget was pressed`);
                        const w = await generateWidget('small', fordData);
                        await w.presentSmall();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Medium',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Medium Widget was pressed`);
                        const w = await generateWidget('medium', fordData);
                        await w.presentMedium();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Large',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Large Widget was pressed`);
                        const w = await generateWidget('large', fordData);
                        await w.presentLarge();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Extra-Large',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Extra-Large Widget was pressed`);
                        const w = await generateWidget('extraLarge', fordData);
                        await w.presentExtraLarge();
                    },
                    destructive: false,
                    show: Device.isPad(),
                },
                {
                    title: 'Back',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Back was pressed`);
                        menuBuilderByType('main');
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;

        case 'diagnostics':
            title = 'Diagnostics Menu';
            items = [
                {
                    title: 'View OTA API Info',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) View OTA Info was pressed`);
                        let data = await getVehicleOtaInfo();
                        await showDataWebView('OTA Info Page', 'OTA Raw Data', data, 'OTA');
                        menuBuilderByType('diagnostics');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'View All Data',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) View All Data was pressed`);
                        let data = await collectAllData(false);
                        await showDataWebView('Vehicle Data Output', 'All Vehicle Data Collected', data);
                        menuBuilderByType('diagnostics');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Copy All Data to Clipboard',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Copy Data was pressed`);
                        let data = await collectAllData(true);
                        await Pasteboard.copyString(JSON.stringify(data, null, 4));
                        await showAlert('Debug Menu', 'Vehicle Data Copied to Clipboard');
                        menuBuilderByType('diagnostics');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Send Data to Developer',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Email Vehicle Data was pressed`);
                        let data = await collectAllData(true);
                        await createEmailObject(data, true);
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Back',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Back was pressed`);
                        menuBuilderByType('main');
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;
        case 'reset':
            title = 'Reset Data Menu';
            items = [
                {
                    title: 'Clear Cached Files/Images',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Clear Files/Images was pressed`);
                        await clearFileManager();
                        await showAlert('Widget Reset Menu', 'Saved Files and Images Cleared\n\nPlease run the script again to reload them all.');
                        // menuBuilderByType('reset');
                        this.close();
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Clear Login Info',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Clear Login Info was pressed`);
                        if (await showYesNoPrompt('Clear Login & Settings', 'Are you sure you want to reset your login details and settings?\n\nThis will require you to enter your login info again?')) {
                            await clearKeychain();
                            await showAlert('Widget Reset Menu', 'Saved Settings Cleared\n\nPlease run the script again to re-initialize the widget.');
                            this.close();
                        } else {
                            menuBuilderByType('reset');
                        }
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Reset Everything',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Reset Everything was pressed`);
                        if (await showYesNoPrompt('Reset Everything', "Are you sure you want to reset the widget?\n\nThis will reset the widget back to it's default state?")) {
                            await clearKeychain();
                            await clearFileManager();
                            await showAlert('Widget Reset Menu', 'All Files, Settings, and Login Info Cleared\n\nPlease run the script again to re-initialize the app.');
                            this.close();
                        } else {
                            menuBuilderByType('reset');
                        }
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Back',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Back was pressed`);
                        menuBuilderByType('main');
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;
        case 'settings':
            let mapProvider = await getMapProvider();
            let widgetStyle = await getWidgetStyle();
            title = 'Widget Settings';
            items = [
                {
                    title: `Map Provider: ${mapProvider === 'apple' ? 'Apple' : 'Google'}`,
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Map Provider pressed`);
                        await toggleMapProvider();
                        menuBuilderByType('settings');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: `Widget Style: ${capitalizeStr(widgetStyle)}`,
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Widget Style pressed`);
                        await widgetStyleSelector('medium');
                        menuBuilderByType('settings');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Reset Login/File Options',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Clear All Data was pressed`);
                        menuBuilderByType('reset');
                        // menuBuilderByType('settings');
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'View Scriptable Settings',
                    action: async () => {
                        console.log(`(${typeDesc} Menu) View Scriptable Settings was pressed`);
                        await Safari.open(URLScheme.forOpeningScriptSettings());
                    },
                    destructive: false,
                    show: true,
                },

                {
                    title: `Back`,
                    action: async () => {
                        console.log(`(${typeDesc} Menu) Back was pressed`);
                        menuBuilderByType('main');
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
        prefsMenu.addAction('View Documentation'); //1
        prefsMenu.addAction('Watch Setup Video'); //2

        prefsMenu.addAction('Save'); //3
        prefsMenu.addCancelAction('Cancel'); //4

        let respInd = await prefsMenu.presentAlert();
        switch (respInd) {
            case 0:
                console.log('(Required Prefs Menu) Map Provider pressed');
                await toggleMapProvider();
                requiredPrefsMenu();
                break;
            case 1:
                console.log('(Required Prefs Menu) View Documentation pressed');
                await Safari.openInApp(textValues().about.documentationUrl);
                requiredPrefsMenu();
                break;
            case 2:
                console.log('(Required Prefs Menu) Map Provider pressed');
                await Safari.openInApp(textValues().about.helpVideos.setup.url);
                requiredPrefsMenu();
                break;
            case 3:
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
            case 4:
                return false;
        }
    } catch (err) {
        console.log(`(Required Prefs Menu) Error: ${err}`);
        throw err;
    }
}

async function scheduleMainTableRefresh(interval) {
    await createTimer(
        'mainTableRefresh',
        interval,
        false,
        async () => {
            console.log('(Main Table) Refresh Timer Fired');
            await fetchVehicleData(false);
            await generateMainInfoTable(true);
        },
        false,
    );
}

async function createRemoteStartStatusTimer() {
    console.log('createRemoteStartStatusTimer');
    await createTimer(
        'remoteStartStatus',
        60000,
        false,
        async () => {
            console.log('(Remote Start Status) Timer fired');
            await fetchVehicleData(false);
            await generateMainInfoTable(true);
        },
        true,
    );
}

async function generateMainInfoTable(update = false) {
    const vData = await fetchVehicleData(true);
    const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
    const isEV = vData.evVehicle === true;
    const pressureUnits = await getKeychainValue('fpPressureUnits');
    const distanceMultiplier = (await useMetricUnits()) ? 1 : 0.621371; // distance multiplier
    const distanceUnit = (await useMetricUnits()) ? 'km' : 'mi'; // unit of length
    const tireUnit = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
    const dtePostfix = isEV ? 'Range' : 'to E';

    let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
    let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;
    let dteString = dteValue ? `${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : textValues().errorMessages.noData;

    let ignStatus = '';
    if (vData.remoteStartStatus && vData.remoteStartStatus.running ? true : false) {
        ignStatus = `Remote Start (ON)` + (vData.remoteStartStatus.runtimeLeft && vData.remoteStartStatus.runtime ? `\n(${vData.remoteStartStatus.runtimeLeft} of ${vData.remoteStartStatus.runtime} minutes remain)` : '');
        createRemoteStartStatusTimer();
    } else {
        stopTimer('remoteStartStatus');
        ignStatus = vData.ignitionStatus !== undefined ? vData.ignitionStatus.charAt(0).toUpperCase() + vData.ignitionStatus.slice(1) : textValues().errorMessages.noData;
    }
    let refreshTime = vData.lastRefreshElapsed ? vData.lastRefreshElapsed : textValues().UIValues.unknown;
    const odometerVal = vData.odometer ? `${Math.round(vData.odometer * distanceMultiplier)} ${distanceUnit}` : textValues().errorMessages.noData;
    const msgs = vData.messages && vData.messages.length ? vData.messages : [];
    const recalls = vData.recallInfo && vData.recallInfo.length && vData.recallInfo[0].recalls && vData.recallInfo[0].recalls.length > 0 ? vData.recallInfo[0].recalls : [];
    const msgsUnread = msgs && msgs.length ? msgs.filter((msg) => msg.isRead === false) : [];
    const headerColor = '#13233F';
    const titleBgColor = darkMode ? '#444141' : '#F5F5F5';

    let tableRows = [];

    try {
        // Header Section - Row 1: vehicle messages, vehicle type, vehicle alerts
        tableRows.push(
            await createTableRow(
                [
                    await createImageCell(await getFPImage(`ic_message_center_notification_dark.png`), { align: 'left', widthWeight: 3 }),
                    await createButtonCell(msgs.length ? `${msgs.length}` : '', {
                        align: 'left',
                        widthWeight: 27,
                        onTap: async () => {
                            console.log('(Dashboard) View Messages was pressed');
                            await generateMessagesTable(vData, false);
                        },
                    }),

                    await createTextCell(vData.info.vehicle.vehicleType, odometerVal, { align: 'center', widthWeight: 40, dismissOnTap: false, titleColor: new Color(runtimeData.textWhite), subtitleColor: Color.lightGray(), titleFont: Font.title3(), subtitleFont: Font.footnote() }),
                    await createButtonCell('Menu', {
                        align: 'right',
                        widthWeight: 30,
                        dismissOnTap: false,
                        onTap: async () => {
                            console.log(`(Dashboard) Menu Button was pressed`);
                            menuBuilderByType('main');
                        },
                    }),
                ],
                {
                    backgroundColor: new Color(headerColor),
                    height: 40,
                    isHeader: true,
                    dismissOnSelect: false,
                },
            ),
        );

        // Header Section - Row 2: Shows tire pressure label and unit
        tableRows.push(
            await createTableRow(
                [await createTextCell('', undefined, { align: 'center', widthWeight: 30 }), await createTextCell(undefined, `Tires: (${tireUnit})`, { align: 'center', widthWeight: 40, subtitleColor: new Color(runtimeData.textWhite), subtitleFont: Font.subheadline() }), await createTextCell('', undefined, { align: 'center', widthWeight: 30 })],
                {
                    backgroundColor: new Color(headerColor),
                    height: 20,
                    dismissOnSelect: false,
                },
            ),
        );

        // Header Section - Row 3: Displays the Vehicle Image in center and doors on the left and windows on the right
        const openDoors = getOpenItems(vData.statusDoors); //['LF', 'RR', 'HD'];
        const openWindows = getOpenItems(vData.statusWindows); //['LF', 'RR', 'HD'];
        // console.log(`openDoors: ${JSON.stringify(openDoors)}`);
        // console.log(`openWindows: ${JSON.stringify(openWindows)}`);
        tableRows.push(
            await createTableRow(
                [
                    // Door Status Cells
                    await createImageCell(await getImage(`door_dark_menu.png`), { align: 'center', widthWeight: 5 }),
                    await createTextCell('Doors', openDoors.length ? openDoors.join(', ') : 'Closed', { align: 'left', widthWeight: 25, dismissOnTap: false, titleColor: new Color(runtimeData.textWhite), titleFont: Font.headline(), subtitleColor: new Color(openDoors.length ? '#FF5733' : '#5A65C0'), subtitleFont: Font.subheadline() }),
                    await createTextCell(`LF: ${vData.tirePressure.leftFront}\n\n\n\nRF: ${vData.tirePressure.leftRear}`, undefined, { align: 'right', widthWeight: 10, titleColor: new Color(runtimeData.textWhite), titleFont: Font.mediumSystemFont(9) }),
                    await createImageCell(await getVehicleImage(vData.info.vehicle.modelYear, false, 1), { align: 'center', widthWeight: 20 }),
                    await createTextCell(`LR: ${vData.tirePressure.rightFront}\n\n\n\nRR: ${vData.tirePressure.rightRear}`, undefined, { align: 'left', widthWeight: 10, titleColor: new Color(runtimeData.textWhite), titleFont: Font.mediumSystemFont(9) }),
                    // Window Status Cells
                    await createTextCell('Windows', openWindows.length ? openWindows.join(', ') : 'Closed', {
                        align: 'right',
                        widthWeight: 25,
                        dismissOnTap: false,
                        titleColor: new Color(runtimeData.textWhite),
                        titleFont: Font.headline(),
                        subtitleColor: new Color(openWindows.length ? '#FF5733' : '#5A65C0'),
                        subtitleFont: Font.subheadline(),
                    }),
                    await createImageCell(await getImage(`window_dark_menu.png`), { align: 'center', widthWeight: 5 }),
                ],
                {
                    backgroundColor: new Color(headerColor),
                    height: 100,
                    cellSpacing: 0,
                    dismissOnSelect: false,
                },
            ),
        );

        // Header Section - Row 4: Shows fuel/EV battery level and range
        tableRows.push(
            await createTableRow(
                [
                    await createImageCell(isEV ? await getImage(`ev_battery_dark_menu.png`) : await getFPImage(`ic_gauge_fuel_dark.png`), { align: 'center', widthWeight: 5 }),
                    await createTextCell(`${isEV ? 'Charge' : 'Fuel'}: ${lvlValue < 0 || lvlValue > 100 ? '--' : lvlValue + '%'}`, dteString, { align: 'left', widthWeight: 45, titleColor: new Color(runtimeData.textWhite), titleFont: Font.headline(), subtitleColor: Color.lightGray(), subtitleFont: Font.subheadline() }),
                    await createTextCell('', undefined, { align: 'center', widthWeight: 50 }),
                ],
                {
                    backgroundColor: new Color(headerColor),
                    height: 40,
                    dismissOnSelect: false,
                },
            ),
        );

        // Header Section - Row 5: Shows vehicle checkin timestamp
        tableRows.push(
            await createTableRow(
                [
                    // await createTextCell('', undefined, { align: 'center', widthWeight: 20 }),
                    await createTextCell('Last Checkin: ' + refreshTime, undefined, { align: 'center', widthWeight: 100, titleColor: new Color(runtimeData.textWhite), titleFont: Font.regularSystemFont(9) }),
                    // await createTextCell('', undefined, { align: 'center', widthWeight: 20 }),
                ],
                {
                    backgroundColor: new Color(headerColor),
                    height: 20,
                    dismissOnSelect: false,
                },
            ),
        );

        let update = false;
        if (widgetConfig.showTestUIStuff) {
            vData.alerts = {
                vha: [
                    {
                        alertIdentifier: 'E19-374-43',
                        activityId: '91760a25-5e8a-48f8-9f10-41392781e0d7',
                        eventTimeStamp: '1/6/2022 12:3:4 AM',
                        colorCode: 'A',
                        iconName: 'ic_washer_fluid',
                        activeAlertBody: {
                            headline: 'Low Washer Fluid',
                            formattedBody:
                                "<div class='accordion' id='SymptomHeader'><h2 class='toggle'><b>What Is Happening?</b></h2><div class='content' id='SymptomHeaderDesc'><p>Low windshield washer fluid.</p></div><h2 class='toggle' id='CustomerActionHeader'><b>What Should I Do?</b></h2><div class='content' id='CustomerActionHeaderDesc'><p>Check the windshield washer reservoir. Add washer fluid as needed.</p></div></div>",
                            wilcode: '600E19',
                            dtccode: '',
                        },
                        hmiAlertBody: null,
                    },
                ],
                mmota: [
                    {
                        alertIdentifier: 'MMOTA_UPDATE_SUCCESSFUL',
                        inhibitRequired: false,
                        dateTimeStamp: '1641426296850',
                        releaseNotesUrl: 'http://vehicleupdates.files.ford.com/release-notes/custom-release-note-1634252934280-a3b8e883-d3aa-44fc-8419-4f0d6c78e185',
                        colorCode: 'G',
                        iconName: 'ic_mmota_alert_update_successful',
                        scheduleRequired: false,
                        wifiRequired: false,
                        consentRequired: false,
                        vehicleTime: '23:44',
                        vehicleDate: '2022-01-05',
                        updateDisplayTime: null,
                    },
                ],
                summary: [
                    { alertType: 'VHA', alertDescription: 'Low Washer Fluid', alertIdentifier: 'E19-374-43', urgency: 'L', colorCode: 'A', iconName: 'ic_washer_fluid', alertPriority: 1 },
                    { alertType: 'MMOTA', alertDescription: 'UPDATE SUCCESSFUL', alertIdentifier: 'MMOTA_UPDATE_SUCCESSFUL', urgency: null, colorCode: 'G', iconName: 'ic_mmota_alert_update_successful', alertPriority: 2 },
                ],
            };

            vData.firmwareUpdating = true;
            vData.deepSleepMode = true;
            update = true;
        }

        // Script Update Available Row
        if (update || updateAvailable) {
            tableRows.push(
                await createTableRow([await createTextCell(`New Widget Update Available (v${LATEST_VERSION})`, 'Tap here to update', { align: 'center', widthWeight: 100, titleColor: new Color('#b605fc'), titleFont: Font.subheadline(), subtitleColor: new Color(runtimeData.textColor1), subtitleFont: Font.regularSystemFont(9) })], {
                    height: 40,
                    dismissOnSelect: false,
                    onSelect: async () => {
                        console.log('(Main Menu) Update Widget was pressed');
                        let callback = new CallbackURL('scriptable:///run');
                        callback.addParameter('scriptName', 'FordWidgetTool');
                        callback.open();
                    },
                }),
            );
        }

        // Vehicle Recalls Section - Creates rows for each summary recall
        if (recalls && recalls.length) {
            // Creates the Vehicle Recalls Title Row
            tableRows.push(await createTableRow([await createTextCell(`Recall(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 30, isHeader: true, dismissOnSelect: false, backgroundColor: new Color(titleBgColor) }));
            // Creates a single row for each recall in the top 10 of recalls array
            for (const [i, recall] of recalls.entries()) {
                if (i >= 10) {
                    break;
                }
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`ic_recall_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell(recall.title, recall.type + '\n' + recall.id, { align: 'left', widthWeight: 93, titleColor: new Color('#E96C00'), titleFont: Font.body(), subtitleColor: new Color(runtimeData.textColor1), subtitleFont: Font.regularSystemFont(9) }),
                        ],
                        {
                            height: 44,
                            dismissOnSelect: false,
                            cellSpacing: 5,
                            onSelect: async () => {
                                console.log('(Dashboard) Recall Item row was pressed');
                                await generateRecallsTable(vData);
                            },
                        },
                    ),
                );
            }
        }

        // Vehicle Alerts Section - Creates rows for each summary alert
        if ((vData.alerts && vData.alerts.summary && vData.alerts.summary.length) || vData.firmwareUpdating || vData.deepSleepMode) {
            let alertsSummary = vData.alerts && vData.alerts.summary && vData.alerts.summary.length ? vData.alerts.summary : [];

            if (vData.deepSleepMode) {
                alertsSummary.push({ alertType: 'VHA', alertDescription: 'Deep Sleep Active - Low Battery', urgency: 'L', colorCode: 'R', iconName: 'battery_12v', alertPriority: 1, noButton: true });
            }
            if (vData.firmwareUpdating) {
                alertsSummary.push({ alertType: 'MMOTA', alertDescription: 'Firmware Update in Progress', urgency: 'L', colorCode: 'G', iconName: 'ic_software_updates', alertPriority: 1, noButton: true });
            }

            // Creates the Vehicle Alerts Title Row
            tableRows.push(await createTableRow([await createTextCell(`Vehicle Alert(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 30, isHeader: true, dismissOnSelect: false, backgroundColor: new Color(titleBgColor) }));
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
                        ],
                        {
                            height: 44,
                            dismissOnSelect: false,
                            cellSpacing: 5,
                            onSelect:
                                alert.noButton === undefined || alert.noButton === false
                                    ? async () => {
                                          console.log('(Dashboard) Alert Item row was pressed');
                                          // await showAlert('Alert Item', `Alert Type: ${alert.alertType}`);
                                          await generateAlertsTable(vData);
                                      }
                                    : undefined,
                        },
                    ),
                );
            }
        }

        // Unread Messages Section - Displays a count of unread messages and a button to view all messages
        if (msgsUnread.length) {
            tableRows.push(await createTableRow([await createTextCell('Unread Messages', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 30, isHeader: true, dismissOnSelect: false, backgroundColor: new Color(titleBgColor) }));

            tableRows.push(
                await createTableRow(
                    [
                        await createImageCell(await getFPImage(`ic_message_center_notification_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                        await createTextCell(`Unread Message${msgsUnread.length > 1 ? 's' : ''}: (${msgsUnread.length})`, undefined, { align: 'left', widthWeight: 76, titleColor: new Color(runtimeData.textColor1), titleFont: Font.body(), subtitleColor: new Color(runtimeData.textColor1), subtitleFont: Font.regularSystemFont(9) }),
                        await createButtonCell('View', {
                            align: 'center',
                            widthWeight: 17,
                            onTap: async () => {
                                console.log('(Dashboard) View Unread Messages was pressed');
                                await generateMessagesTable(vData, true);
                            },
                        }),
                    ],
                    {
                        height: 44,
                        dismissOnSelect: false,
                        cellSpacing: 5,
                        onSelect: async () => {
                            console.log('(Dashboard) View Unread Messages was pressed');
                            await generateMessagesTable(vData, true);
                        },
                    },
                ),
            );
        }

        // Vehicle Controls Section - Remote Start, Door Locks, and Horn/Lights
        if (caps && caps.length && (caps.includes('DOOR_LOCK_UNLOCK') || caps.includes('REMOTE_START') || caps.includes('REMOTE_PANIC_ALARM'))) {
            // Creates the Status & Remote Controls Header Row
            tableRows.push(await createTableRow([await createTextCell('Remote Controls', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 30, isHeader: true, dismissOnSelect: false, backgroundColor: new Color(titleBgColor) }));

            // Generates the Lock Control Row
            if (caps.includes('DOOR_LOCK_UNLOCK')) {
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`${vData.lockStatus === 'LOCKED' ? 'lock_icon' : 'unlock_icon'}_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell('Locks', vData.lockStatus === 'LOCKED' ? 'Locked' : 'Unlocked', { align: 'left', widthWeight: 59, titleColor: new Color(runtimeData.textColor1), subtitleColor: new Color(vData.lockStatus === 'LOCKED' ? '#5A65C0' : '#FF5733'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),
                            await createButtonCell('Unlock', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async () => {
                                    console.log('(Dashboard) Lock was pressed');
                                    if (await showYesNoPrompt('Locks', 'Are you sure you want to unlock the vehicle?')) {
                                        await sendVehicleCmd('unlock');
                                    }
                                },
                            }),
                            await createButtonCell('Lock', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async () => {
                                    console.log('(Dashboard) Lock was pressed');
                                    await sendVehicleCmd('lock');
                                },
                            }),
                        ],
                        { height: 44, cellSpacing: 5, dismissOnSelect: false },
                    ),
                );
            }

            // Generates the Remote Start Control Row
            if (caps.includes('REMOTE_START')) {
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`ic_paak_key_settings_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell('Ignition', ignStatus, { align: 'left', widthWeight: 59, titleColor: new Color(runtimeData.textColor1), subtitleColor: new Color(ignStatus === 'Off' ? '#5A65C0' : '#FF5733'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),
                            await createButtonCell('Stop', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async () => {
                                    console.log('(Dashboard) Stop was pressed');
                                    await sendVehicleCmd('stop');
                                },
                            }),
                            await createButtonCell('Start', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async () => {
                                    console.log('(Dashboard) Start was pressed');
                                    if (await showYesNoPrompt('Remote Start', 'Are you sure you want to start the vehicle?')) {
                                        await sendVehicleCmd('start');
                                    }
                                },
                            }),
                        ],
                        { height: ignStatus.length > 17 ? 64 : 44, cellSpacing: 5, dismissOnSelect: false },
                    ),
                );
            }

            // Generates the Horn/Lights Control Row
            if (caps.includes('REMOTE_PANIC_ALARM')) {
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`res_0x7f080088_ic_control_lights_and_horn_active__0_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell('Sound Horn/Lights', undefined, { align: 'left', widthWeight: 76, titleColor: new Color(runtimeData.textColor1), subtitleColor: new Color(ignStatus === 'Off' ? '#5A65C0' : '#FF5733'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),

                            await createButtonCell('Start', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async () => {
                                    console.log('(Dashboard) Horn/Lights was pressed');
                                    if (await showYesNoPrompt('Horn/Lights', 'Are you sure you want to sound horn and light ?')) {
                                        await sendVehicleCmd('horn_and_lights');
                                    }
                                },
                            }),
                        ],
                        { height: 44, cellSpacing: 5, dismissOnSelect: false },
                    ),
                );
            }
        }

        // Advanced Controls Section - Zone Lighting, SecuriAlert, Trailer Lights (if available)
        if (caps.includes('ZONE_LIGHTING_FOUR_ZONES') || caps.includes('ZONE_LIGHTING_TWO_ZONES' || caps.includes('GUARD_MODE') || caps.includes('TRAILER_LIGHT'))) {
            // Creates the Advanced Controls Header Text
            tableRows.push(await createTableRow([await createTextCell('Advanced Controls', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 30, isHeader: true, dismissOnSelect: false, backgroundColor: new Color(titleBgColor) }));

            // Generates the SecuriAlert Control Row
            if (caps.includes('GUARD_MODE')) {
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`ic_guard_mode_vd_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell('SecuriAlert', vData.alarmStatus, { align: 'left', widthWeight: 59, titleColor: new Color(runtimeData.textColor1), subtitleColor: new Color(vData.alarmStatus === 'On' ? '#FF5733' : '#5A65C0'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),
                            await createButtonCell('Enable', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async () => {
                                    console.log('(Dashboard) SecuriAlert Enable was pressed');
                                    await sendVehicleCmd('guard_mode_on');
                                },
                            }),
                            await createButtonCell('Disable', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async () => {
                                    console.log('(Dashboard) SecuriAlert Disable was pressed');
                                    if (await showYesNoPrompt('SecuriAlert', 'Are you sure you want to disable SecuriAlert?')) {
                                        await sendVehicleCmd('guard_mode_off');
                                    }
                                },
                            }),
                        ],
                        { height: 44, cellSpacing: 5, dismissOnSelect: false },
                    ),
                );
            }

            // Generates the Zone Lighting Control Row
            if (caps.includes('ZONE_LIGHTING_FOUR_ZONES') || caps.includes('ZONE_LIGHTING_TWO_ZONES')) {
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`ic_zone_lighting_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell('Zone Lighting', vData.zoneLightingStatus, { align: 'left', widthWeight: 59, titleColor: new Color(runtimeData.textColor1), subtitleColor: new Color(vData.zoneLightingStatus === 'On' ? '#FF5733' : '#5A65C0'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),
                            await createButtonCell('Enable', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async () => {
                                    console.log('(Dashboard) Zone Lighting On Button was pressed');
                                    showActionPrompt(
                                        'Zone Lighting On Menu',
                                        undefined,
                                        [
                                            {
                                                title: 'Front Zone',
                                                action: async () => {
                                                    console.log(`(Dashboard) Zone Front On was pressed`);
                                                    await sendVehicleCmd('zone_lights_front_on');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'Rear Zone',
                                                action: async () => {
                                                    console.log(`(Dashboard) Zone Rear On was pressed`);
                                                    await sendVehicleCmd('zone_lights_rear_on');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'Left Zone',
                                                action: async () => {
                                                    console.log(`(Dashboard) Zone Left On was pressed`);
                                                    await sendVehicleCmd('zone_lights_left_on');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'Right Zone',
                                                action: async () => {
                                                    console.log(`(Dashboard) Zone Right On was pressed`);
                                                    await sendVehicleCmd('zone_lights_right_on');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'All Zones',
                                                action: async () => {
                                                    console.log(`(Dashboard) Zone All On was pressed`);
                                                    await sendVehicleCmd('zone_lights_all_on');
                                                },
                                                destructive: false,
                                                show: true,
                                            },
                                        ],
                                        true,
                                    );
                                },
                            }),
                            await createButtonCell('Disable', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async () => {
                                    console.log('(Dashboard) Zone Lighting Off Button was pressed');
                                    showActionPrompt(
                                        'Zone Lighting Off',
                                        undefined,
                                        [
                                            {
                                                title: 'Front Zone',
                                                action: async () => {
                                                    console.log(`(Dashboard) Zone Front Off was pressed`);
                                                    await sendVehicleCmd('zone_lights_front_off');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'Rear Zone',
                                                action: async () => {
                                                    console.log(`(Dashboard) Zone Rear Off was pressed`);
                                                    await sendVehicleCmd('zone_lights_rear_off');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'Left Zone',
                                                action: async () => {
                                                    console.log(`(Dashboard) Zone Left Off was pressed`);
                                                    await sendVehicleCmd('zone_lights_left_off');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'Right Zone',
                                                action: async () => {
                                                    console.log(`(Dashboard) Zone Right Off was pressed`);
                                                    await sendVehicleCmd('zone_lights_right_off');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'All Zones',
                                                action: async () => {
                                                    console.log(`(Dashboard) Zone All Off was pressed`);
                                                    await sendVehicleCmd('zone_lights_all_off');
                                                },
                                                destructive: false,
                                                show: true,
                                            },
                                        ],
                                        true,
                                    );
                                },
                            }),
                        ],
                        { height: 44, cellSpacing: 5, dismissOnSelect: false },
                    ),
                );
            }

            // Generates the Trailer Light Check Control Row
            if (caps.includes('TRAILER_LIGHT')) {
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`ic_trailer_light_check_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await createTextCell('Trailer Light Check', vData.trailerLightCheckStatus, { align: 'left', widthWeight: 59, titleColor: new Color(runtimeData.textColor1), subtitleColor: new Color(vData.trailerLightCheckStatus === 'On' ? '#FF5733' : '#5A65C0'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),
                            await createButtonCell('Start', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async () => {
                                    console.log('(Dashboard) Trailer Light Check Start was pressed');
                                    if (await showYesNoPrompt('Trailer Light Check', 'Are you sure want to start the trailer light check process?')) {
                                        await sendVehicleCmd('trailer_light_check_on');
                                    }
                                },
                            }),
                            await createButtonCell('Stop', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async () => {
                                    console.log('(Dashboard) Trailer Light Check Stop was pressed');
                                    await sendVehicleCmd('trailer_light_check_off');
                                },
                            }),
                        ],
                        { height: 44, cellSpacing: 5, dismissOnSelect: false },
                    ),
                );
            }
        }
    } catch (err) {
        console.error(`Error in generateMainInfoTable: ${err}`);
    }

    await generateTableMenu('main', tableRows, false, isPhone, update);
    if (!update) {
        let lastVersion = await getKeychainValue('fpScriptVersion');
        if (lastVersion !== SCRIPT_VERSION) {
            await generateRecentChangesTable();
            await setKeychainValue('fpScriptVersion', SCRIPT_VERSION);
        }
    }
}

async function generateAlertsTable(vData) {
    let vhaAlerts = vData.alerts && vData.alerts.vha && vData.alerts.vha.length ? vData.alerts.vha : [];
    let otaAlerts = vData.alerts && vData.alerts.mmota && vData.alerts.mmota.length ? vData.alerts.mmota : [];

    let tableRows = [];
    if (vhaAlerts.length > 0) {
        tableRows.push(await createTableRow([await createTextCell(`Vehicle Health Alert(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 20, isHeader: true, dismissOnSelect: false }));
        for (const [i, alert] of vhaAlerts.entries()) {
            let dtTS = alert.eventTimeStamp ? convertFordDtToLocal(alert.eventTimeStamp) : undefined;
            tableRows.push(
                await createTableRow(
                    [
                        await createImageCell(await getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 7 }),
                        await createTextCell(alert.activeAlertBody.headline || textValues().errorMessages.noData, dtTS ? timeDifference(dtTS) : '', {
                            align: 'left',
                            widthWeight: 93,
                            titleColor: new Color(getAlertColorByCode(alert.colorCode)),
                            titleFont: Font.headline(),
                            subtitleColor: Color.darkGray(),
                            subtitleFont: Font.regularSystemFont(9),
                        }),
                    ],
                    { height: 40, dismissOnSelect: false },
                ),
            );
        }
    }

    if (otaAlerts.length > 0) {
        tableRows.push(await createTableRow([await createTextCell('', undefined, { align: 'center', widthWeight: 100 })], { height: 20, dismissOnSelect: false }));
        tableRows.push(await createTableRow([await createTextCell(`OTA Update Alerts`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() })], { height: 20, isHeader: true, dismissOnSelect: false }));
        for (const [i, alert] of otaAlerts.entries()) {
            let dtTS = alert.vehicleDate && alert.vehicleTime ? convertFordDtToLocal(`${alert.vehicleDate} ${alert.vehicleTime}`) : undefined;
            let timeDiff = dtTS ? timeDifference(dtTS) : '';
            let title = alert.alertIdentifier ? alert.alertIdentifier.replace('MMOTA_', '').split('_').join(' ') : undefined;

            let releaseNotes;
            if (alert.releaseNotesUrl) {
                let locale = (await getKeychainValue('fpLanguage')) || Device.locale().replace('_', '-');
                releaseNotes = await getReleaseNotes(alert.releaseNotesUrl, locale);
            }
            tableRows.push(
                await createTableRow(
                    [
                        await createImageCell(await getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 7 }),
                        await createTextCell(title, timeDiff, { align: 'left', widthWeight: 93, titleColor: new Color(getAlertColorByCode(alert.colorCode)), titleFont: Font.headline(), subtitleColor: Color.darkGray(), subtitleFont: Font.regularSystemFont(9) }),
                    ],
                    { height: 44, dismissOnSelect: false },
                ),
            );

            tableRows.push(await createTableRow([await createTextCell(releaseNotes, undefined, { align: 'left', widthWeight: 100, titleColor: new Color(runtimeData.textColor1), titleFont: Font.regularSystemFont(12) })], { height: getRowHeightByTxtLength(releaseNotes), dismissOnSelect: false }));
        }
    }

    await generateTableMenu('alerts', tableRows, false, false);
}

async function generateRecallsTable(vData) {
    try {
        let recalls = vData.recallInfo && vData.recallInfo.length && vData.recallInfo[0].recalls && vData.recallInfo[0].recalls.length > 0 ? vData.recallInfo[0].recalls : [];
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
                        ],
                        { height: 50, dismissOnSelect: false },
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
                    ],
                    { height: 44, dismissOnSelect: false },
                ),
            );

            tableRows.push(await createTableRow([await createTextCell(textValues().errorMessages.noMessages, undefined, { align: 'left', widthWeight: 1, titleColor: new Color(runtimeData.textColor1), titleFont: Font.body() })], { height: 44, dismissOnSelect: false }));
        }

        await generateTableMenu('recalls', tableRows, false, false);
    } catch (err) {
        console.log(`error in generateRecallsTable: ${err}`);
    }
}

async function generateMessagesTable(vData, unreadOnly = false, update = false) {
    try {
        let msgs = vData.messages && vData.messages && vData.messages && vData.messages.length ? vData.messages : messageTest || [];
        msgs = unreadOnly ? msgs.filter((msg) => msg.isRead === false) : msgs;

        let tableRows = [];

        if (msgs.length > 0) {
            tableRows.push(
                await createTableRow(
                    [
                        await createTextCell('', undefined, { align: 'left', widthWeight: 20 }),
                        await createTextCell(`${msgs.length} Messages(s)`, undefined, { align: 'center', widthWeight: 60, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title2() }),
                        await createTextCell('All', undefined, { align: 'right', widthWeight: 20, dismissOnTap: false, titleColor: Color.purple(), titleFont: Font.title2() }),
                    ],
                    {
                        height: 40,
                        dismissOnSelect: false,
                        onSelect: async () => {
                            console.log(`(Messages Table) All Message Options was pressed`);
                            let msgIds = msgs.map((msg) => msg.messageId);
                            showActionPrompt(
                                'All Message Options',
                                undefined,
                                [
                                    {
                                        title: 'Mark All Read',
                                        action: async () => {
                                            console.log(`(Messages Table) Mark All Messages Read was pressed`);
                                            let ok = await showPrompt(`All Message Options`, `Are you sure you want to mark all messages as read?`, `Mark (${msgIds.length}) Read`, true);
                                            if (ok) {
                                                console.log(`(Messages Table) Marking ${msgIds.length} Messages as Read`);
                                                if (await markMultipleUserMessagesRead(msgIds)) {
                                                    console.log(`(Messages Table) Marked (${msgIds.length}) Messages as Read Successfully`);
                                                    showAlert('Marked Messages as Read Successfully', 'Message List will reload after data is refeshed');
                                                    await generateMessagesTable(await fetchVehicleData(false), unreadOnly, true);
                                                    generateMainInfoTable(true);
                                                }
                                            }
                                        },
                                        destructive: false,
                                        show: true,
                                    },
                                    {
                                        title: 'Delete All',
                                        action: async () => {
                                            console.log(`(Messages Table) Delete All Messages was pressed`);
                                            let ok = await showPrompt('Delete All Messages', 'Are you sure you want to delete all messages?', `Delete (${msgIds.length}) Messages`, true);
                                            if (ok) {
                                                console.log(`(Messages Table) Deleting ${msgIds.length} Messages`);
                                                if (await deleteUserMessages([msg.messageId])) {
                                                    console.log(`(Messages Table) Deleted (${msgIds.length}) Messages Successfully`);
                                                    showAlert('Deleted Messages Successfully', 'Message List will reload after data is refeshed');
                                                    await generateMessagesTable(await fetchVehicleData(false), unreadOnly, true);
                                                    generateMainInfoTable(true);
                                                }
                                            }
                                        },
                                        destructive: true,
                                        show: true,
                                    },
                                ],
                                true,
                                async () => {
                                    generateMessagesTable(vData, unreadOnly);
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

                // Creates Message Header Row
                tableRows.push(await createTableRow([await createTextCell('', undefined, { align: 'center', widthWeight: 1 })], { backgroundColor: msg.isRead === false ? new Color('#008200') : Color.darkGray(), height: 10, dismissOnSelect: false }));
                tableRows.push(
                    await createTableRow(
                        [
                            await createImageCell(await getFPImage(`ic_message_center_notification_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 10 }),
                            await createTextCell(getMessageDescByType(msg.messageType), undefined, { align: 'left', widthWeight: 55, titleColor: new Color(runtimeData.textColor1), titleFont: Font.body() }),
                            await createTextCell(msg.isRead === false ? 'Unread' : 'Read', undefined, { align: 'right', widthWeight: 25, titleColor: msg.isRead === false ? new Color('#008200') : Color.darkGray(), titleFont: Font.body() }),
                            await createTextCell('...', undefined, { align: 'right', widthWeight: 10, dismissOnTap: false, titleColor: Color.purple(), titleFont: Font.title2() }),
                        ],
                        {
                            height: 40,
                            dismissOnSelect: false,
                            onSelect: async () => {
                                console.log(`(Messages Table) Message Options button was pressed for ${msg.messageId}`);
                                showActionPrompt(
                                    'Message Options',
                                    undefined,
                                    [
                                        {
                                            title: 'Mark as Read',
                                            action: async () => {
                                                console.log(`(Messages Table) Marking Message with ID: ${msg.messageId} as Read...`);
                                                if (await markMultipleUserMessagesRead([msg.messageId])) {
                                                    console.log(`(Messages Table) Message (${msg.messageId}) marked read successfully`);
                                                    showAlert('Message marked read successfully', 'Message List will reload after data is refeshed');
                                                    await generateMessagesTable(await fetchVehicleData(false), unreadOnly, true);
                                                    generateMainInfoTable(true);
                                                }
                                            },
                                            destructive: false,
                                            show: true,
                                        },
                                        {
                                            title: 'Delete Message',
                                            action: async () => {
                                                console.log(`(Messages Table) Delete Message ${msg.messageId} was pressed`);
                                                let ok = await showPrompt('Delete Message', 'Are you sure you want to delete this message?', 'Delete', true);
                                                if (ok) {
                                                    console.log(`(Messages Table) Delete Confirmed for Message ID: ${msg.messageId}`);
                                                    if (await deleteUserMessages([msg.messageId])) {
                                                        console.log(`(Messages Table) Message ${msg.messageId} deleted successfully`);
                                                        showAlert('Message deleted successfully', 'Message List will reload after data is refeshed');
                                                        await generateMessagesTable(await fetchVehicleData(false), unreadOnly, true);
                                                        generateMainInfoTable(true);
                                                        up;
                                                    } else {
                                                        await generateMessagesTable(vData, unreadOnly);
                                                    }
                                                }
                                            },
                                            destructive: true,
                                            show: true,
                                        },
                                    ],
                                    true,
                                    async () => {
                                        await generateMessagesTable(vData, unreadOnly);
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
        await generateTableMenu('messages', tableRows, false, isPhone, update);
    } catch (e) {
        console.error(`generateMessagesTable() error: ${e}`);
    }
}

function getChangeLabelColorAndNameByType(type) {
    switch (type) {
        case 'added':
            return { name: 'Added', color: new Color('#008200') };
        case 'updated':
            return { name: 'Updated', color: new Color('#FF6700') };
        case 'removed':
            return { name: 'Removed', color: new Color('#FF0000') };
        case 'fixed':
            return { name: 'Fixed', color: new Color('#b605fc') };
        default:
            return { name: '', color: new Color(runtimeData.textColor1) };
    }
}

async function generateRecentChangesTable() {
    let changes = changelog[SCRIPT_VERSION];
    let tableRows = [];
    if (changes && (changes.updated.length || changes.added.length || changes.removed.length || changes.fixed.length)) {
        let verTs = new Date(Date.parse(SCRIPT_TS));
        tableRows.push(
            await createTableRow([await createTextCell(`${SCRIPT_VERSION} Changes`, undefined, { align: 'center', widthWeight: 100, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title1() })], {
                height: 50,
                isHeader: true,
                dismissOnSelect: false,
            }),
        );
        for (const [i, type] of ['added', 'fixed', 'updated', 'removed'].entries()) {
            if (changes[type].length) {
                console.log(`(Whats New Table) ${type} changes: ${changes[type].length}`);
                let { name, color } = getChangeLabelColorAndNameByType(type);
                tableRows.push(
                    await createTableRow([await createTextCell(`${name}`, undefined, { align: 'left', widthWeight: 100, titleColor: color, titleFont: Font.title2() })], {
                        height: 30,
                        dismissOnSelect: false,
                    }),
                );
                for (const [index, change] of changes[type].entries()) {
                    console.log(`(Whats New Table) ${type} change: ${change}`);
                    let rowH = Math.ceil(change.length / 70) * (65 / 2);
                    tableRows.push(
                        await createTableRow([await createTextCell(`\u2022 ${change}`, undefined, { align: 'left', widthWeight: 100, titleColor: new Color(runtimeData.textColor1), titleFont: Font.body() })], {
                            height: rowH < 40 ? 40 : rowH,
                            dismissOnSelect: false,
                        }),
                    );
                }
            }
        }
    } else {
        tableRows.push(await createTableRow([await createTextCell('No Change info found for the current version...', undefined, { align: 'left', widthWeight: 1, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title3() })], { height: 44, dismissOnSelect: false }));
    }

    await generateTableMenu('recentChanges', tableRows, false, false);
}

async function widgetStyleSelector() {
    let widgetStyle = await getWidgetStyle();
    // console.log(`(Widget Style Selector) Current widget style: ${widgetStyle} | Size: ${size}`);
    let tableRows = [];
    tableRows.push(
        await createTableRow(
            [await createTextCell(`Widget Styles`, `This page will show an example of each widget size and type\nTap on type to set it.`, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title1(), subtitleColor: Color.lightGray(), subtitleFont: Font.mediumSystemFont(11) })],
            {
                height: 70,
                dismissOnSelect: false,
            },
        ),
    );
    for (const [i, size] of ['small', 'medium'].entries()) {
        tableRows.push(
            await createTableRow([await createTextCell(`${capitalizeStr(size)}`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.title3() })], {
                height: 30,
                isHeader: true,
                dismissOnSelect: false,
            }),
        );
        for (const [i, style] of ['simple', 'detailed'].entries()) {
            // console.log(`Style: ${style} | Image: ${size}_${style}.png`);
            tableRows.push(
                await createTableRow(
                    [
                        await createTextCell(`(${capitalizeStr(style)})`, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false, titleColor: new Color(runtimeData.textColor1), titleFont: Font.subheadline() }),
                        await createImageCell(await getImage(`${size}_${style}.png`), { align: 'center', widthWeight: 60 }),
                        await createTextCell(``, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false }),
                    ],
                    {
                        height: 150,
                        dismissOnSelect: true,
                        backgroundColor: widgetStyle === style ? Color.lightGray() : undefined,
                        onSelect: async () => {
                            console.log(`Setting WidgetStyle to ${style}`);
                            await setWidgetStyle(style);
                            await widgetStyleSelector(size);
                        },
                    },
                ),
            );
        }
        tableRows.push(
            await createTableRow([await createTextCell(``, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false })], {
                height: 30,
                dismissOnSelect: false,
            }),
        );
    }

    await generateTableMenu('widgetStyles', tableRows, false, false);
}

//*****************************************************************************************************************************
//*                                              START TABLE HELPER FUNCTIONS
//*****************************************************************************************************************************

async function getTable(tableName) {
    if (await tableExists(tableName)) {
        return tableMap[tableName];
    }
    tableMap[tableName] = new UITable();
    return tableMap[tableName];
}

async function removeTable(tableName) {
    if (await tableExists(tableName)) {
        delete tableMap[tableName];
    }
    return;
}

async function tableExists(tableName) {
    return tableMap[tableName] !== undefined && tableMap[tableName] instanceof Object;
}

async function generateTableMenu(tableName, rows, showSeparators = false, fullscreen = false, update = false) {
    try {
        const exists = await tableExists(tableName);
        let table = await getTable(tableName);
        if (exists) {
            await table.removeAllRows();
        }
        // console.log(`${exists ? 'Updating' : 'Creating'} ${tableName} Table and ${update ? 'Reloading' : 'Presenting'}`);
        table.showSeparators = showSeparators;
        rows.forEach(async (row) => {
            await table.addRow(row);
        });
        if (update) {
            await table.reload();
        } else {
            await table.present(fullscreen);
        }
    } catch (e) {
        console.error(`generateTableMenu() error: ${e}`);
    }
}

async function reloadTable(tableName) {
    let table = await getTable(tableName);
    await table.reload();
}

async function showTable(tableName, fullscreen = false) {
    let table = await getTable(tableName);
    await table.present(fullscreen);
}

async function clearTable() {
    let table = await getTable(tableName);
    await table.removeAllRows();
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

// async function getRowHeightByTxtLength(txt, lineLength = 75, lineHeight = 35, minHeight = 44) {
//     let result = txt && txt.length ? (txt.length / lineLength).toFixed(0) * lineHeight : 0;
//     result = result < minHeight ? minHeight : result;
//     // console.log(`${txt} | Length: ${txt.length} | Desired Height: ${result}`);
//     return result;
// }

function getRowHeightByTxtLength(txt) {
    let result = txt && txt.length ? (txt.length / 75).toFixed(0) * 35 : 0;
    // console.log(`txt length: ${txt.length} - result: ${result}`);
    return result < 44 ? 44 : result;
}

async function showYesNoPrompt(title = undefined, msg = undefined) {
    let prompt = new Alert();
    prompt.title = title;
    prompt.message = msg;
    prompt.addDestructiveAction('Yes');
    prompt.addAction('No');
    const respInd = await prompt.presentAlert();
    switch (respInd) {
        case 0:
            return true;
        case 1:
            return false;
    }
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

const vehicleCmdConfigs = (vin, param2 = undefined) => {
    const baseUrl = 'https://usapi.cv.ford.com/api';
    const guardUrl = 'https://api.mps.ford.com/api';
    let cmds = {
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

async function sendVehicleCmd(cmd_type = '', mainMenuRefresh = true) {
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
                    await createTimer(
                        'vehicleDataRefresh',
                        15000,
                        false,
                        async () => {
                            console.log('sendVehicleCmd: Refreshing Vehicle Data after 10 seconds');
                            await fetchVehicleData(false);
                            if (mainMenuRefresh) {
                                console.log('sendVehicleCmd: Reloading Main Menu Content');
                                await generateMainInfoTable(true);
                            }
                        },
                        true,
                    );
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
    console.log('Fetching Vehicle Data from Ford Servers...');
    let statusData = await getVehicleStatus();

    // console.log(`statusData: ${JSON.stringify(statusData)}`);
    let vehicleData = new Object();
    vehicleData.SCRIPT_VERSION = SCRIPT_VERSION;
    vehicleData.SCRIPT_TS = SCRIPT_TS;
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
        runningTs: vehicleStatus.remoteStartStatus ? vehicleStatus.remoteStartStatus.timestamp : undefined,
        runtime: vehicleStatus.remoteStart && vehicleStatus.remoteStart.remoteStartDuration ? vehicleStatus.remoteStart.remoteStartDuration : 0,
        runtimeLeft: vehicleStatus.remoteStart && vehicleStatus.remoteStart.remoteStartTime ? vehicleStatus.remoteStart.remoteStartTime : undefined,
    };
    // console.log(`Remote Start Status: ${JSON.stringify(vehicleStatus.remoteStart)}`);

    // Alarm status
    vehicleData.alarmStatus = vehicleStatus.alarm ? (vehicleStatus.alarm.value === 'SET' ? 'On' : 'Off') : 'Off';

    //Battery info
    vehicleData.batteryStatus = vehicleStatus.battery && vehicleStatus.battery.batteryHealth ? vehicleStatus.battery.batteryHealth.value : textValues().UIValues.unknown;
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
    vehicleData.position = await getPosition(vehicleStatus);
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
    // console.log(`lastRefresh | raw: ${vehicleStatus.lastRefresh.includes('01-01-2018') ? vehicleStatus.lastModifiedDate : vehicleStatus.lastRefresh} | conv: ${vehicleData.lastRefresh.toLocaleString()}`);
    console.log(`Last Vehicle Checkin: ${vehicleData.lastRefreshElapsed}`);

    // await getVehicleImage(vehicleData.info.vehicle.modelYear, true, 1);
    // await getVehicleImage(vehicleData.info.vehicle.modelYear, true, 2);
    // await getVehicleImage(vehicleData.info.vehicle.modelYear, true, 3);
    // await getVehicleImage(vehicleData.info.vehicle.modelYear, true, 4);
    // await getVehicleImage(vehicleData.info.vehicle.modelYear, true, 5);

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

async function getWidgetStyle() {
    return (await getKeychainValue('fpWidgetStyle')) || 'detailed';
}

async function setWidgetStyle(style) {
    return await setKeychainValue('fpWidgetStyle', style);
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
    const keys = ['fpToken', 'fpToken2', 'fpUsername', 'fpUser', 'fpPass', 'fpPassword', 'fpVin', 'fpUseMetricUnits', 'fpUsePsi', 'fpVehicleType', 'fpMapProvider', 'fpCat1Token', 'fpTokenExpiresAt', 'fpCountry', 'fpDeviceLanguage', 'fpLanguage', 'fpTz', 'fpPressureUnits', 'fpDistanceUnits', 'fpSpeedUnits', 'fpScriptVersion'];
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
    console.log('FileManager: Saving Vehicle Data to Local Storage...');
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    let fileName = SCRIPT_ID !== null && SCRIPT_ID !== undefined && SCRIPT_ID > 0 ? `$fp_vehicleData_${SCRIPT_ID}.json` : 'fp_vehicleData.json';
    let path = fm.joinPath(dir, fileName);
    if (fm.fileExists(path)) {
        fm.remove(path);
    } //clean old data
    fm.writeString(path, JSON.stringify(data));
}

function readLocalData() {
    console.log('FileManager: Retrieving Vehicle Data from Local Cache...');
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
    console.log('FileManager: Clearing All Files from Local Cache...');
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

async function getTimer(timerName) {
    if (timerMap[timerName]) {
        return timerMap[timerName];
    }
    let timer = Timer;
    timerMap[timerName] = timer;
    return timerMap[timerName];
}

async function stopTimer(timerName) {
    try {
        timerMap[timerName].invalidate();
    } catch (e) {
        // console.log(`stopTimer Error: Could Not Stop Timer | ${e}`);
    }
    delete timerMap[timerName];
}

async function createTimer(name, interval, repeat = false, actions, clearExisting = false) {
    if (clearExisting && timerMap[name]) {
        await stopTimer(name);
    }
    let timer = await getTimer(name);
    if (timer && interval && actions) {
        timer.schedule(10000, repeat, actions);
    } else {
        console.log(`createTimer Error: Could Not Create Timer | Name: ${name} | Interval: ${interval} | Repeat: ${repeat} | Actions: ${actions}`);
    }
}

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

function timeDifference(prevTime, asObj = false) {
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

function getElapsedMinutes(prevTime) {
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

function capitalizeStr(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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

// [
//     'CEN_LAST_MILE',
//     'CEN_OFFBOARD_SEARCH',
//     'DISTANCE_TO_EMPTY_TCU',
//     'DOOR_LOCK_UNLOCK',
//     'EVCS_CHARGE_LOCATIONS_AND_CHARGE_TIMES',
//     'EVCS_DEPARTURE_TIMES',
//     'EVCS_NOTIFICATIONS_SETTINGS',
//     'EVCS_STATION_FINDER',
//     'EVCS_TRIP_AND_CHARGE_LOGS',
//     'EVCS_TRIP_READY_NOTIFICATION',
//     'EVCS_UTILITY_RATE_SERVICES',
//     'EVCS_VEHICLE_STATUS_EXTENDED',
//     'EV_FUEL',
//     'EV_OFF_PLUG_PRECONDITIONING',
//     'EV_SMART_CHARGING',
//     'EV_TRIP_PLANNER',
//     'EXTEND',
//     'FRUNK',
//     'FUEL_TCU',
//     'GEO_FENCING',
//     'GUARD_MODE',
//     'ODOMETER_TCU',
//     'OIL_LIFE_TCU',
//     'PAAK',
//     'POWER_LIFTGATE',
//     'REMOTE_PANIC_ALARM',
//     'REMOTE_START',
//     'TPMS_TCU',
//     'VEHICLE_HEALTH_REPORTING',
//     'VEHICLE_LOCATOR',
//     'VHA2.0_TCU',
//     'WIFI_DATA_USAGE',
//     'WIFI_HOTSPOT',
//     'WIFI_SSID_PASSWORD';
//     'CEN_LAST_MILE',
//     'CEN_OFFBOARD_SEARCH',
//     'CEN_SEND_TO_CAR',
//     'DISTANCE_TO_EMPTY_TCU',
//     'DOOR_LOCK_UNLOCK',
//     'EXTEND',
//     'FUEL_TCU',
//     'GEO_FENCING',
//     'GUARD_MODE',
//     'ODOMETER_TCU',
//     'OIL_LIFE',
//     'OIL_LIFE_TCU',
//     'POWER_LIFTGATE',
//     'REMOTE_START',
//     'SCHEDULED_START',
//     'TPMS_TCU',
//     'TRAILER_LIGHT',
//     'VEHICLE_HEALTH_REPORTING',
//     'VEHICLE_LOCATOR',
//     'VHA2.0_TCU',
//     'WIFI_DATA_USAGE',
//     'WIFI_HOTSPOT',
//     'WIFI_SSID_PASSWORD',
//     'ZONE_LIGHTING_FOUR_ZONES',
// ]

const voiceIntentTree = {
    requests: { prefixs: ['is', 'are'] },
    commands: { prefixs: ['stop', 'start'] },
};

async function getAvailableRequests() {
    const vData = await fetchVehicleData(true);
    const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
    let cmds = [];
    let reqs = [];
    if (caps.length) {
        for (const [i, cap] of caps.entries()) {
            switch (cap) {
                case 'REMOTE_START':
                    cmds.concat(['start', 'stop']);
                    break;
                case 'REMOTE_PANIC_ALARM':
                    cmds.concat(['horn', 'panic']);
                    break;
                case 'DOOR_LOCK_UNLOCK':
                    cmds.concat(['lock', 'unlock']);
                    break;
                case 'GUARD_MODE':
                    cmds.concat(['guard', 'alarm']);
                    break;
            }
        }
    }

    return { cmds: cmds, reqs: reqs };
}

async function parseIncomingSiriCommand(cmdStr) {
    let words = cmdStr.split(' ');
    let availableReqs = await getAvailableRequests();
    console.log(`availableReqs: ${JSON.stringify(availableReqs)}`);
    console.log(`parseIncomingSiriCommand: ${cmdStr}`);
    console.log(`words: ${JSON.stringify(words)}`);
    return `Siri Command Received ${cmdStr}`;
}

//************************************************* END UTILITY FUNCTIONS ********************************************************
//********************************************************************************************************************************

// const messageTest = {}

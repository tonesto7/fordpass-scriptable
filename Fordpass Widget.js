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


**************/
const WIDGET_VERSION = "1.0.0";
//****************************************************************************************************************
//* Login data for account. It is only working with FordPass credentials and when your car has a FordPass modem!
//* Check your car configuration. It is not sufficient if your FordPass app shows some data (odometer or oil).
//****************************************************************************************************************
const userData = {
    fpUsername: "YOUR_FP_EMAIL_HERE",
    fpPassword: "FP_PASSWORD_HERE",
    fpVin: "VEHICLE_VIN",
    vehicleName: "Ford F-150", // Name of vehicle in Map
    useMetric: false, // This will define whether the widget uses us or non-US text and units
    mapProvider: "apple", // or 'google'
};

//******************************************************************
//* Customize Widget Options
//******************************************************************
const widgetConfig = {
    debugMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    refreshInterval: 5, // allow data to refresh every (xx) minutes
    useIndicators: true, // indicators for fuel bar
    unitOfLength: userData.useMetric ? "km" : "mi", // unit of length
    distanceMultiplier: userData.useMetric ? 1 : 0.621371, // distance multiplier
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
        fuelTank: "Fuel",
        odometer: "Miles",
        odometerLease: "Mileage",
        oil: "Oil Life",
        windows: "Windows",
        doors: "Doors",
        position: "Location",
        tirePressure: "Tires (psi)",
        lockStatus: "Locks",
        lock: "Lock",
        unlock: "Unlock",
        ignitionStatus: "Ignition",
        batteryStatus: "Battery",
        remoteStart: "Remote Start",
    },
    UIValues: {
        closed: "Closed",
        open: "Open",
        unknown: "Unknown",
        greaterOneDay: "> 1 Day",
        smallerOneMinute: "< 1 Min Ago",
        minute: "Minute",
        hour: "Hour",
        perYear: "p.a.",
        plural: "s", // 's' in english
        precedingAdverb: "", // used in german language, for english let it empty
        subsequentAdverb: "ago", // used in english language ('ago'), for german let it empty
    },
    errorMessages: {
        invalidGrant: "Incorrect Login Data",
        connectionErrorOrVin: "Incorrect VIN Number",
        unknownError: "Unknown Error",
        noData: "No Data",
        noCredentials: "Missing Login Credentials",
        noVin: "VIN Missing",
    },
    successMessages: {
        locks_cmd_title: "Lock Command",
        locked_msg: "Vehicle Received Lock Command Successfully",
        unlocked_msg: "Vehicle Received Unlock Command Successfully",
    },
};

//***************************************************************************
//* Customize the Appearance of widget elements when in dark or light mode
//***************************************************************************

const isDarkMode = Device.isUsingDarkAppearance();
const runtimeData = {
    vehicleIcon: "F150_2021.png",
    textColor1: isDarkMode ? "EDEDED" : "000000", // Header Text Color
    textColor2: isDarkMode ? "EDEDED" : "000000", // Value Text Color
    backColor: isDarkMode ? "111111" : "FFFFFF", // Background Color'
    backColorGrad: isDarkMode ? ["141414", "13233F"] : ["BCBBBB", "DDDDDD"], // Background Color Gradient
    fuelIcon: isDarkMode ? "gas-station_dark.png" : "gas-station_light.png", // Image for gas station
    lockStatus: isDarkMode ? "lock_dark.png" : "lock_light.png", // Image Used for Lock Icon
    lockIcon: isDarkMode ? "lock_dark.png" : "lock_light.png", // Image Used for Lock Icon
    tirePressure: isDarkMode ? "tire_dark.png" : "tire_light.png", // Image for tire pressure
    unlockIcon: isDarkMode ? "unlock_dark.png" : "unlock_light.png", // Image Used for UnLock Icon
    batteryStatus: isDarkMode ? "battery_dark.png" : "battery_light.png", // Image Used for Battery Icon
    doors: isDarkMode ? "door_dark.png" : "door_light.png", // Image Used for Door Lock Icon
    windows: isDarkMode ? "window_dark.png" : "window_light.png", // Image Used for Window Icon
    oil: isDarkMode ? "oil_dark.png" : "oil_light.png", // Image Used for Oil Icon
    ignitionStatus: isDarkMode ? "key_dark.png" : "key_light.png", // Image Used for Ignition Icon
    keyIcon: isDarkMode ? "key_dark.png" : "key_light.png", // Image Used for Key Icon
    position: isDarkMode ? "location_dark.png" : "location_light.png", // Image Used for Location Icon
};

const closedSymbol = "✓";
const openSymbol = "✗";

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
widget.setPadding(10, 5, 5, 5);

if (config.runsInWidget) {
    Script.setWidget(widget);
}
// Show alert with current data (if running script in app)
else if (config.runsInApp || config.runsFromHomeScreen) {
    // createTableMenu();
    createMenu();
} else {
    if (widgetConfig.largeWidget) {
        await widget.presentLarge();
    } else {
        await widget.presentMedium();
    }
}

/*
if (config.runsInWidget) {
    Script.setWidget(widget);
} else {
    if (widgetConfig.largeWidget) {
        await widget.presentLarge();
    } else {
        await widget.presentMedium();
    }
}
*/
Script.complete();

//*****************************************************************************************************************************
//*                                              START WIDGET UI ELEMENT FUNCTIONS
//*****************************************************************************************************************************

async function createMenu() {
    const alert = new Alert();
    alert.title = `FordPass Actions`;

    alert.addAction("View Widget"); //0

    alert.addAction("Lock Vehicle"); //1
    alert.addDestructiveAction("Unlock Vehicle"); //2

    alert.addAction("Remote Start (Stop)"); //3
    alert.addDestructiveAction("Remote Start (Run)"); //4

    alert.addAction("Turn On All ZoneLighting"); //5
    alert.addAction("Turn Off All ZoneLighting"); //6

    // alert.addDestructiveAction("Disable SecuriAlert"); //7
    // alert.addAction("Enable SecuriAlert"); //8

    alert.addAction("Update Vehicle Status"); //7

    alert.addAction("Cancel"); //8

    alert.addAction("Test Alerts"); //9

    const respIndex = await alert.presentSheet();

    switch (respIndex) {
        case 0:
            console.log("View Widget was pressed");
            await widget.presentMedium();
            break;
        case 1:
            console.log("Lock was pressed");
            await sendLockCmd();
            break;
        case 2:
            console.log("Unlock was pressed");
            await sendUnlockCmd();
            break;
        case 3:
            console.log("Stop was pressed");
            await sendStopCmd();
            break;
        case 4:
            console.log("Start was pressed");
            await sendStartCmd();
            break;
        case 5:
            console.log("Zone Lighting On was pressed");
            await sendZoneLightsAllOnCmd();
            break;
        case 6:
            console.log("Zone Lighting Off was pressed");
            await sendZoneLightsAllOffCmd();
            break;
            // case 7:
            //     console.log("Disable SecuriAlert was pressed");
            //     await sendGuardModeOffCmd();
            //     break;
            // case 8:
            //     console.log("Enable SecuriAlert was pressed");
            //     await sendGuardModeOnCmd();
            //     break;
        case 7:
            console.log("Update Vehicle Status was pressed");
            await sendStatusCmd();
            break;
        case 8:
            console.log("Cancel was pressed");
            break;
        case 9:
            console.log("Test Alerts was pressed");
            await showAlert(`TEST Command`, `Vehicle Received Command Successfully`);
            break;
    }
}

// function createTableMenu() {
//     let table = new UITable();
//     let data = [
//         ["foo", "bar", "baz"],
//         ["asdf", "quz", "42"],
//         [123, 567, "add"],
//     ];

//     let row, cell;
//     let first = true;
//     for (const drow of data) {
//         // drow = data row
//         // create a new row
//         row = new UITableRow();
//         // immediately add it to the table to not forget that part
//         table.addRow(row);
//         if (first) {
//             // set the first row to have bold text
//             row.isHeader = true;
//             first = false;
//         }
//         for (const [i, dcell] of drow.entries()) {
//             // the last cell should contain a button
//             if (i === 2) {
//                 // cast dcell to a string, otherwise we will get an error like "Expected value of type UITableCell but got value of type null."
//                 cell = row.addButton("" + dcell);
//                 // even though the next line is not needed because it is the default setting, I like to do it anyway to be more specific of what is going on
//                 cell.dismissOnTap = false;
//                 // register our callback function
//                 cell.onTap = () => {
//                     // create a simple alert to have some user feedback on button tap
//                     // let alert = new Alert();
//                     // alert.message = dcell;
//                     // alert.present();
//                     // no need to add buttons, they will be added automatically
//                     // no need to await it, because we don't need anything from the user
//                 };
//             } else {
//                 // cast dcell to a string, otherwise we will get an error like "Expected value of type UITableCell but got value of type null."
//                 cell = row.addText("" + dcell);
//             }
//             cell.centerAligned();
//         }
//     }
//     table.present();
// }

async function createWidget() {
    if (widgetConfig.debugMode) {
        console.log("widgetConfig | DEBUG:");
        for (const k in widgetConfig) {
            console.log(`${k}: ${widgetConfig[k]}`);
        }
    }
    if (widgetConfig.clearKeychainOnNextRun) {
        clearKeychain();
    }
    if (widgetConfig.clearFileManagerOnNextRun) {
        clearFileManager();
    }

    let carData = await fetchCarData();

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
    let mainCol1 = await createColumn(contentStack, { "*setPadding": [0, 0, 0, 0] });

    // Vehicle Logo
    let vehicleLogoRow = await createRow(mainCol1, { "*centerAlignContent": null });
    let vehicleLogo = await createImage(vehicleLogoRow, await getImage(runtimeData.vehicleIcon), { imageSize: new Size(85, 45), "*centerAlignImage": null });
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
    let mainCol2 = await createColumn(contentStack, { "*setPadding": [0, 0, 0, 0] });

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
    let mainCol3 = await createColumn(contentStack, { "*setPadding": [0, 0, 0, 0] });

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
    let infoStack = await createRow(mainStack, { "*layoutHorizontally": null });

    // Creates the Refresh Label to show when the data was last updated from Ford
    let refreshTime = carData.fetchTime ? calculateTimeDifference(carData.fetchTime) : textValues.UIValues.unknown;
    let refreshLabel = await createText(infoStack, refreshTime, { font: Font.mediumSystemFont(sizes.detailFontSizeSmall), textColor: Color.lightGray() });

    // Creates Elements to display any errors in red at the bottom of the widget
    infoStack.addSpacer(10);
    let errorMsg = carData.error ? "Error: " + carData.error : "";
    let errorLabel = await createText(infoStack, errorMsg, { font: Font.mediumSystemFont(sizes.detailFontSizeSmall), textColor: Color.red() });

    return widget;
}

async function presentMenu(indies, issues) {
    let alert = new Alert();
    alert.title = issues[0].title;
    alert.message = "";
    alert.addAction("View Small Widget");
    alert.addAction("View Medium Widget");
    alert.addAction("View Large Widget");
    alert.addAction("Open Website");
    alert.addCancelAction("Cancel");
    let idx = await alert.presentSheet();
    if (idx == 0) {
        let widget = await createSmallWidget(indies, issues);
        await widget.presentSmall();
    } else if (idx == 1) {
        let widget = await createMediumWidget(indies, issues);
        await widget.presentMedium();
    } else if (idx == 2) {
        let widget = await createMediumWidget(indies, issues);
        await widget.presentLarge();
    } else if (idx == 3) {
        Safari.open(issues[0].url);
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

async function createTitle(headerField, element, icon = undefined) {
    let ico = icon || runtimeData[element];
    if (ico !== undefined) {
        headerField.layoutHorizontally();
        let imgFile = await getImage(ico.toString());
        let titleImg = await createImage(headerField, imgFile, { imageSize: new Size(11, 11) });
        headerField.addSpacer(2);
    }
    let txt = await createText(headerField, textValues.elemHeaders[element] + ":", { font: Font.boldSystemFont(sizes.titleFontSize), textColor: new Color(runtimeData.textColor1) });
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
    bar.setFillColor(new Color("2f78dd"));
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
    let fuelHeadertext = await createText(fuelHeaderRow, textValues.elemHeaders["fuelTank"], { font: Font.boldSystemFont(sizes.titleFontSize), textColor: new Color(runtimeData.textColor1) });
    let fuelHeadertext2 = await createText(fuelHeaderRow, " (" + lvlTxt + "%):", { font: Font.regularSystemFont(sizes.detailFontSizeSmall), textColor: new Color(runtimeData.textColor1) });
    srcField.addSpacer(3);

    // Fuel Level Bar
    let fuelBarCol = await createColumn(srcField, { "*setPadding": [0, 0, 0, 0], "*centerAlignContent": null });
    let fuelBarRow = await createRow(fuelBarCol, { "*setPadding": [0, 0, 0, 0] });
    let fuelBarImg = await createImage(fuelBarRow, await createProgressBar(carData.fuelLevel ? carData.fuelLevel : 50), { "*centerAlignImage": null, imageSize: new Size(sizes.barWidth, sizes.barHeight + 3) });

    // Fuel Distance to Empty
    let fuelBarTextRow = await createRow(fuelBarCol, { "*centerAlignContent": null, "*topAlignContent": null });
    let dteInfo = carData.distanceToEmpty ? `    ${Math.floor(carData.distanceToEmpty * widgetConfig.distanceMultiplier)}${widgetConfig.unitOfLength} to E` : textValues.errorMessages.noData;
    let fuelDteRowTxt = await createText(fuelBarTextRow, dteInfo, { "*centerAlignText": null, font: Font.regularSystemFont(sizes.detailFontSizeSmall), textColor: new Color(runtimeData.textColor2), lineLimit: 1 });

    srcField.addSpacer(3);
}

async function createMileageElement(srcField, carData) {
    let elem = await createRow(srcField, { "*layoutHorizontally": null });
    await createTitle(elem, "odometer");
    elem.addSpacer(2);
    let value = carData.odometer ? `${Math.floor(carData.odometer * widgetConfig.distanceMultiplier)}${widgetConfig.unitOfLength}` : textValues.errorMessages.noData;
    // console.log(`odometer: ${value}`);
    let txt = await createText(elem, value, { font: Font.regularSystemFont(sizes.detailFontSizeSmall), textColor: new Color(runtimeData.textColor2) });
    srcField.addSpacer(3);
}

async function createBatteryElement(srcField, carData) {
    let elem = await createRow(srcField, { "*layoutHorizontally": null });
    await createTitle(elem, "batteryStatus");
    elem.addSpacer(2);
    let value = carData.batteryLevel ? `${carData.batteryLevel}V` : "N/A";
    // console.log(`batteryLevel: ${value}`);
    let txt = await createText(elem, value, { font: Font.regularSystemFont(sizes.detailFontSizeSmall), textColor: new Color(runtimeData.textColor2) });
    srcField.addSpacer(3);
}

async function createOilElement(srcField, carData) {
    let elem = await createRow(srcField, { "*layoutHorizontally": null });
    await createTitle(elem, "oil");
    elem.addSpacer(2);
    let value = carData.oilLife ? `${carData.oilLife}%` : textValues.errorMessages.noData;
    // console.log(`oilLife: ${value}`);
    let txt = await createText(elem, value, { font: Font.regularSystemFont(sizes.detailFontSizeSmall), textColor: new Color(runtimeData.textColor2) });
    srcField.addSpacer(3);
}

async function createDoorElement(srcField, carData, countOnly = false) {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color(runtimeData.textColor2) },
        statOpen: { font: Font.heavySystemFont(sizes.detailFontSizeMedium), textColor: new Color("FF5733") },
        statClosed: { font: Font.heavySystemFont(sizes.detailFontSizeMedium), textColor: new Color("#5A65C0") },
        offset: 10,
    };

    let offset = styles.offset;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, "doors");

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
        let row1LfTxt1 = await createText(dataRow1Fld, "LF (", styles.normTxt);
        let row1LfStatTxt = await createText(dataRow1Fld, carData.statusDoors["leftFront"] ? openSymbol : closedSymbol, carData.statusDoors["leftFront"] ? styles.statOpen : styles.statClosed);
        let row1LfTxt2 = await createText(dataRow1Fld, ")" + " | ", styles.normTxt);
        let row1RfTxt1 = await createText(dataRow1Fld, "RF (", styles.normTxt);
        let row1RfStatTxt = await createText(dataRow1Fld, carData.statusDoors["rightFront"] ? openSymbol : closedSymbol, carData.statusDoors["rightFront"] ? styles.statOpen : styles.statClosed);
        let row1RfTxt2 = await createText(dataRow1Fld, ")", styles.normTxt);

        // Creates the second row of status elements for LR and RR
        let dataRow2Fld = await createRow(srcField);
        let row2RfTxt1 = await createText(dataRow2Fld, "LR (", styles.normTxt);
        let row2RfStatTxt = await createText(dataRow2Fld, carData.statusDoors["leftRear"] ? openSymbol : closedSymbol, carData.statusDoors["leftRear"] ? styles.statOpen : styles.statClosed);
        let row2RfTxt2 = await createText(dataRow2Fld, ")" + " | ", styles.normTxt);
        let row2RrTxt1 = await createText(dataRow2Fld, "RR (", styles.normTxt);
        let row2RrStatTxt = await createText(dataRow2Fld, carData.statusDoors["rightRear"] ? openSymbol : closedSymbol, carData.statusDoors["rightRear"] ? styles.statOpen : styles.statClosed);
        let row2RrTxt2 = await createText(dataRow2Fld, ")", styles.normTxt);

        // Creates the third row of status elements for the tailgate (if equipped)
        if (carData.statusDoors["tailgate"] !== undefined) {
            let dataRow3Fld = await createRow(srcField);
            let row3TgTxt1 = await createText(dataRow3Fld, "       TG (", styles.normTxt);
            let row3TgStatTxt = await createText(dataRow3Fld, carData.statusDoors["tailgate"] ? openSymbol : closedSymbol, carData.statusDoors["tailgate"] ? styles.statOpen : styles.statClosed);
            let row3TgTxt2 = await createText(dataRow3Fld, ")", styles.normTxt);
            offset = offset - 5;
        }
    }
    srcField.addSpacer(offset);
}

async function createWindowElement(srcField, carData, countOnly = false) {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color(runtimeData.textColor2) },
        statOpen: { font: Font.heavySystemFont(sizes.detailFontSizeMedium), textColor: new Color("FF5733") },
        statClosed: { font: Font.heavySystemFont(sizes.detailFontSizeMedium), textColor: new Color("#5A65C0") },
        offset: 10,
    };

    let offset = styles.offset;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, "windows");

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
        let row1LfTxt1 = await createText(dataRow1Fld, "LF (", styles.normTxt);
        let row1LfStatTxt = await createText(dataRow1Fld, carData.statusWindows["leftFront"] ? openSymbol : closedSymbol, carData.statusWindows["leftFront"] ? styles.statOpen : styles.statClosed);
        let row1LfTxt2 = await createText(dataRow1Fld, ")" + " | ", styles.normTxt);
        let row1RfTxt1 = await createText(dataRow1Fld, "RF (", styles.normTxt);
        let row1RfStatTxt = await createText(dataRow1Fld, carData.statusWindows["rightFront"] ? openSymbol : closedSymbol, carData.statusWindows["rightFront"] ? styles.statOpen : styles.statClosed);
        let row1RfTxt2 = await createText(dataRow1Fld, ")", styles.normTxt);

        // Creates the second row of status elements for LR and RR
        let dataRow2Fld = await createRow(srcField);
        let row2RfTxt1 = await createText(dataRow2Fld, "LR (", styles.normTxt);
        let row2RfStatTxt = await createText(dataRow2Fld, carData.statusWindows["leftRear"] ? openSymbol : closedSymbol, carData.statusWindows["leftRear"] ? styles.statOpen : styles.statClosed);
        let row2RfTxt2 = await createText(dataRow2Fld, ")" + " | ", styles.normTxt);
        let row2RrTxt1 = await createText(dataRow2Fld, "RR (", styles.normTxt);
        let row2RrStatTxt = await createText(dataRow2Fld, carData.statusWindows["rightRear"] ? openSymbol : closedSymbol, carData.statusWindows["rightRear"] ? styles.statOpen : styles.statClosed);
        let row2RrTxt2 = await createText(dataRow2Fld, ")", styles.normTxt);

        if (carData.statusDoors["tailgate"] !== undefined) {
            offset = offset + 10;
        }
    }
    srcField.addSpacer(offset);
}

async function createTireElement(srcField, carData) {
    let offset = 0;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, "tirePressure");

    let dataFld = await createRow(srcField);
    let value = `${carData.tirePressure["leftFront"]} | ${carData.tirePressure["rightFront"]}\n${carData.tirePressure["leftRear"]} | ${carData.tirePressure["rightRear"]}`;
    let txt = await createText(dataFld, value, { font: new Font("Menlo-Regular", sizes.detailFontSizeMedium), textColor: new Color(runtimeData.textColor2), lineLimit: 2 });
    srcField.addSpacer(offset);
}

async function createPositionElement(srcField, carData) {
    let offset = 0;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, "position");

    let dataFld = await createRow(srcField);
    let url = userData.mapProvider == "google" ? `https://www.google.com/maps/search/?api=1&query=${carData.latitude},${carData.longitude}` : `http://maps.apple.com/?q=${encodeURI(userData.vehicleName)}&ll=${carData.latitude},${carData.longitude}`;
    let value = carData.position ? `${carData.position}` : textValues.errorMessages.noData;
    let text = await createText(dataFld, value, { url: url, font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color(runtimeData.textColor2), lineLimit: 2, minimumScaleFactor: 0.7 });
    srcField.addSpacer(offset);
}

async function createLockStatusElement(srcField, carData) {
    const styles = {
        statOpen: { font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color("#FF5733"), lineLimit: 1 },
        statClosed: { font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color("#5A65C0"), lineLimit: 1 },
    };
    let offset = 10;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, "lockStatus");
    titleFld.addSpacer(2);
    let dataFld = await createRow(srcField);
    let value = carData.lockStatus ? carData.lockStatus : textValues.errorMessages.noData;
    let text = await createText(dataFld, value, carData.lockStatus !== undefined && carData.lockStatus === "LOCKED" ? styles.statClosed : styles.statOpen);
    srcField.addSpacer(offset);
}

async function createIgnitionStatusElement(srcField, carData) {
    const styles = {
        statOn: { font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color("#FF5733") },
        statOff: { font: Font.mediumSystemFont(sizes.detailFontSizeMedium), textColor: new Color("#5A65C0") },
    };
    let offset = 10;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, "ignitionStatus");
    titleFld.addSpacer(2);
    let dataFld = await createRow(srcField);
    let value = carData.ignitionStatus ? carData.ignitionStatus.toUpperCase() : textValues.errorMessages.noData;
    let text = await createText(dataFld, value, carData.ignitionStatus !== undefined && carData.ignitionStatus !== "Off" ? styles.statOn : styles.statOff);
    srcField.addSpacer(offset);
}

//***************************************************END WIDGET ELEMENT FUNCTIONS********************************************************
//***************************************************************************************************************************************

//*****************************************************************************************************************************
//*                                                  START FORDPASS API FUNCTIONS
//*****************************************************************************************************************************

async function fetchToken() {
    let username = checkUserData("fpUsername");
    if (!username) {
        return textValues.errorMessages.noCredentials;
    }
    let password = checkUserData("fpPassword");
    if (!password) {
        return textValues.errorMessages.noCredentials;
    }

    let req = new Request("https://fcis.ice.ibmcloud.com/v1.0/endpoint/default/token");
    req.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*",
        "Accept-Language": "en-us",
        "User-Agent": "fordpass-na/353 CFNetwork/1121.2.2 Darwin/19.3.0",
        "Accept-Encoding": "gzip, deflate, br",
    };
    req.method = "POST";
    req.body = `client_id=9fb503e0-715b-47e8-adfd-ad4b7770f73b&grant_type=password&username=${username}&password=${password}`;

    try {
        let token = await req.loadJSON();
        if (token.error && token.error == "invalid_grant") {
            if (widgetConfig.debugMode) {
                console.log("Debug: Error while receiving auth data");
                console.log(token);
            }
            return textValues.errorMessages.invalidGrant;
        }
        if (widgetConfig.debugMode) {
            console.log("Debug: Received auth data from ford server");
            console.log(token);
        }
        Keychain.set("fpToken", token.access_token);
    } catch (e) {
        console.log(`Error: ${e}`);
        if (e.error && e.error == "invalid_grant") {
            return textValues.errorMessages.invalidGrant;
        }
        throw e;
    }
}

async function fetchRawData() {
    if (!Keychain.contains("fpToken")) {
        //Code is executed on first run
        let result = await fetchToken();
        if (result && result == textValues.errorMessages.invalidGrant) {
            return result;
        }
        if (result && result == textValues.errorMessages.noCredentials) {
            return result;
        }
    }
    let token = Keychain.get("fpToken");
    let vin = checkUserData("fpVin");
    if (!vin) {
        return textValues.errorMessages.noVin;
    }
    let req = new Request(`https://usapi.cv.ford.com/api/vehicles/v4/${vin}/status`);
    req.headers = {
        "Content-Type": "application/json",
        Accept: "*/*",
        "Accept-Language": "en-us",
        "User-Agent": "fordpass-na/353 CFNetwork/1121.2.2 Darwin/19.3.0",
        "Accept-Encoding": "gzip, deflate, br",
        "Application-Id": "71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592",
        "auth-token": `${token}`,
    };
    req.method = "GET";
    try {
        let data = await req.loadString();
        if (widgetConfig.debugMode) {
            console.log("Debug: Received vehicle data from ford server");
            console.log(data);
        }
        if (data == "Access Denied") {
            console.log("fetchRawData: Auth Token Expired. Fetching new token and fetch raw data again");
            let result = await fetchToken();
            if (result && result == textValues.errorMessages.invalidGrant) {
                return result;
            }
            data = await fetchRawData();
        } else {
            data = JSON.parse(data);
        }
        if (data.status && data.status != 200) {
            if (widgetConfig.debugMode) {
                console.log("Debug: Error while receiving vehicle data");
                console.log(data);
            }
            return textValues.errorMessages.connectionErrorOrVin;
        }
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
    alert.addAction("OK");
    const respIndex = await alert.presentAlert();
    console.log(`showAlert Response: ${respIndex}`);
    switch (respIndex) {
        case 0:
            console.log(`${title} alert was cleared...`);
            return true;
    }
}

const vehicleCmdConfigs = (vin) => {
    const baseUrl = "https://usapi.cv.ford.com/api";
    const guardUrl = "https://api.mps.ford.com/api";
    return {
        lock: {
            desc: "Lock Vehicle",
            cmd: "sendLockCmd",
            cmds: [{
                uri: `${baseUrl}/vehicles/${vin}/doors/lock`,
                method: "PUT",
            }, ],
        },
        unlock: {
            desc: "Unlock Vehicle",
            cmd: "sendUnlockCmd",
            cmds: [{
                uri: `${baseUrl}/vehicles/${vin}/doors/lock`,
                method: "DELETE",
            }, ],
        },
        start: {
            desc: "Start Vehicle",
            cmd: "sendStartCmd",
            cmds: [{
                uri: `${baseUrl}/vehicles/${vin}/engine/start`,
                method: "PUT",
            }, ],
        },
        stop: {
            desc: "Stop Vehicle",
            cmd: "sendStopCmd",
            cmds: [{
                uri: `${baseUrl}/vehicles/${vin}/engine/start`,
                method: "DELETE",
            }, ],
        },
        zone_lights_off: {
            desc: "Zone Off Zone Lighting (All Lights)",
            cmd: "sendZoneLightsOffCmd",
            cmds: [{
                    uri: `${baseUrl}/vehicles/${vin}/zonelightingactivation`,
                    method: "DELETE",
                },
                {
                    uri: `${baseUrl}/vehicles/${vin}/0/zonelighting`,
                    method: "DELETE",
                },
            ],
        },
        zone_lights_on: {
            desc: "Turn On Zone Lighting (All Lights)",
            cmd: "sendZoneLightsOnCmd",
            cmds: [{
                    uri: `${baseUrl}/vehicles/${vin}/zonelightingactivation`,
                    method: "PUT",
                },
                {
                    uri: `${baseUrl}/vehicles/${vin}/0/zonelighting`,
                    method: "PUT",
                },
            ],
        },
        guard_mode_on: {
            desc: "Turn On SecuriAlert",
            cmd: "sendGuardModeOnCmd",
            cmds: [{
                uri: `${guardUrl}/guardmode/v1/${vin}/session`,
                method: "PUT",
            }, ],
        },
        guard_mode_off: {
            desc: "Turn Off SecuriAlert",
            cmd: "sendGuardModeOffCmd",
            cmds: [{
                uri: `${guardUrl}/guardmode/v1/${vin}/session`,
                method: "DELETE",
            }, ],
        },
        status: {
            desc: "Refresh Vehicle Status",
            cmd: "sendStatusCmd",
            cmds: [{
                uri: `${baseUrl}/vehicles/${vin}/status`,
                method: "PUT",
            }, ],
        },
    };
};

async function sendVehicleCmd(cmd_type = "") {
    if (!Keychain.contains("fpToken")) {
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
    let token = Keychain.get("fpToken");
    let vin = checkUserData("fpVin");
    let cmdCfgs = vehicleCmdConfigs(vin);
    let cmds = cmdCfgs[cmd_type].cmds;
    let multiCmds = cmds.length > 1;
    // console.log(`multipleCmds: ${multiCmds}`);
    let wasError = false;
    let errMsg = undefined;
    let outMsg = { title: "", message: "" };

    for (const cmd in cmds) {
        let isLastCmd = !multiCmds || (multiCmds && cmds.length == parseInt(cmd) + 1);
        // console.log(`processing vehicle command (${cmd_type}) #${cmd} | Method: ${cmds[cmd].method} | URI: ${cmds[cmd].uri}`);
        let req = new Request(cmds[cmd].uri);
        req.headers = {
            Accept: "*/*",
            "Accept-Language": "en-us",
            "User-Agent": "FordPass/4 CFNetwork/1312 Darwin/21.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/json",
            "Application-Id": "71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592",
            "auth-token": `${token}`,
        };
        req.method = cmds[cmd].method;

        try {
            let data = await req.loadString();
            // console.log(data);
            if (data == "Access Denied") {
                console.log("sendVehicleCmd: Auth Token Expired. Fetching new token and fetch raw data again");
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
                        console.log("Debug: Error while receiving vehicle data");
                        console.log(data);
                    }
                    if (data.status == 590) {
                        outMsg = { title: `${cmd_type.toUpperCase()} Command`, message: `Command Failed!\n\nPlease Start the Vehicle Before Running this Command Again` };
                    } else {
                        errMsg = `Command Error: ${JSON.stringify(data)}`;
                        outMsg = { title: `${cmd_type.toUpperCase()} Command`, message: `There was an error sending the command to the vehicle!\n\Error: ${data.status}` };
                    }
                } else {
                    outMsg = { title: `${cmd_type.toUpperCase()} Command`, message: `Vehicle Received Command Successfully` };
                }
            }

            if (wasError) {
                if (errMsg) {
                    console.log(`sendVehicleCmd(${cmd_type}) Error: ${errMsg}`);
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
    await sendVehicleCmd("lock");
}

async function sendUnlockCmd() {
    await sendVehicleCmd("unlock");
}

async function sendStartCmd() {
    await sendVehicleCmd("start");
}

async function sendStopCmd() {
    await sendVehicleCmd("stop");
}

async function sendStatusCmd() {
    await sendVehicleCmd("status");
}

async function sendGuardModeOnCmd() {
    await sendVehicleCmd("guard_mode_on");
}

async function sendGuardModeOffCmd() {
    await sendVehicleCmd("guard_mode_off");
}

async function sendZoneLightsAllOnCmd() {
    await sendVehicleCmd("zone_lights_on");
}

async function sendZoneLightsAllOffCmd() {
    await sendVehicleCmd("zone_lights_off");
}

function checkUserData(cred) {
    if (widgetConfig.storeCredentialsInKeychain) {
        if (userData[cred] != "") {
            Keychain.set(cred, userData[cred]);
        }
        if (Keychain.contains(cred)) {
            return Keychain.get(cred);
        }
    } else if (!widgetConfig.storeCredentialsInKeychain && userData[cred] != "") {
        return userData[cred];
    }
    return null; //no stored credentials
}

//from local store if last fetch is < x minutes, otherwise fetch from server
async function fetchCarData() {
    //fetch local data
    if (!widgetConfig.alwaysFetch && isLocalDataFreshEnough()) {
        return readLocalData();
    }

    //fetch data from server
    console.log("fetchCarData: Fetching Vehicle Data from Ford Servers...");
    let rawData = await fetchRawData();
    // console.log(rawData);
    let carData = new Object();
    if (rawData == textValues.errorMessages.invalidGrant || rawData == textValues.errorMessages.connectionErrorOrVin || rawData == textValues.errorMessages.unknownError || rawData == textValues.errorMessages.noVin || rawData == textValues.errorMessages.noCredentials) {
        console.log("Error: " + rawData);
        let localData = readLocalData();
        if (widgetConfig.debugMode) {
            console.log("Debug: Try to read local data after error");
            console.log(localData);
        }
        if (localData) {
            carData = localData;
        }
        carData.error = rawData;
        return carData;
    }

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
    carData.ignitionStatus = vehicleStatus.ignitionStatus ? vehicleStatus.ignitionStatus.value : "Off";

    // Remote Start status
    carData.remoteStartStatus = {
        running: vehicleStatus.remoteStartStatus ? (vehicleStatus.remoteStartStatus.value === 0 ? "Off" : "On") : "Off",
        duration: vehicleStatus.remoteStart && vehicleStatus.remoteStart.remoteStartDuration ? vehicleStatus.remoteStart.remoteStartDuration.value : 0,
    };

    // Alarm status
    carData.alarmStatus = vehicleStatus.alarm ? (vehicleStatus.alarm.value === "SET" ? "On" : "Off") : "Off";

    //Battery info
    carData.batteryStatus = vehicleStatus.battery && vehicleStatus.battery.batteryHealth ? vehicleStatus.battery.batteryHealth.value : textValues.UIValues.unknown;
    carData.batteryLevel = vehicleStatus.battery && vehicleStatus.battery.batteryStatusActual ? vehicleStatus.battery.batteryStatusActual.value : textValues.UIValues.unknown;

    // Whether Vehicle is in deep sleep mode (Battery Saver) | Supported Vehicles Only
    carData.deepSleepMode = vehicleStatus.deepSleepInProgess ? vehicleStatus.deepSleepInProgess.value === "true" : undefined;

    // Whether Vehicle is currently installing and OTA update (OTA) | Supported Vehicles Only
    carData.firmwareUpdating = vehicleStatus.firmwareUpgInProgress ? vehicleStatus.firmwareUpgInProgress.value === "true" : undefined;

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
        leftFront: !["Fully_Closed", "Fully closed position", "Undefined window position"].includes(windows.driverWindowPosition.value),
        rightFront: !["Fully_Closed", "Fully closed position", "Undefined window position"].includes(windows.passWindowPosition.value),
        leftRear: !["Fully_Closed", "Fully closed position", "Undefined window position"].includes(windows.rearDriverWindowPos.value),
        rightRear: !["Fully_Closed", "Fully closed position", "Undefined window position"].includes(windows.rearPassWindowPos.value),
    };

    //true means, that door is open
    let doors = vehicleStatus.doorStatus;
    carData.statusDoors = {
        leftFront: !(doors.driverDoor.value == "Closed"),
        rightFront: !(doors.passengerDoor.value == "Closed"),
        leftRear: !(doors.leftRearDoor.value == "Closed"),
        rightRear: !(doors.rightRearDoor.value == "Closed"),
    };
    if (doors.hoodDoor && doors.hoodDoor.value !== undefined) {
        carData.statusDoors.hood = !(doors.hoodDoor.value == "Closed");
    }
    if (doors.tailgateDoor && doors.tailgateDoor.value !== undefined) {
        carData.statusDoors.tailgate = !(doors.tailgateDoor.value == "Closed");
    }

    //tire pressure
    let tpms = vehicleStatus.TPMS;
    carData.tirePressure = {
        leftFront: pressureToFixed(tpms.leftFrontTirePressure.value, 1),
        rightFront: pressureToFixed(tpms.rightFrontTirePressure.value, 1),
        leftRear: pressureToFixed(tpms.outerLeftRearTirePressure.value, 1),
        rightRear: pressureToFixed(tpms.outerRightRearTirePressure.value, 1),
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
// get images from local filestore or download them once
async function getImage(image) {
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    let path = fm.joinPath(dir, image);
    if (fm.fileExists(path)) {
        return fm.readImage(path);
    } else {
        // download once
        let repoPath = "https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/icons/";
        let imageUrl;
        switch (image) {
            case "gas-station_light.png":
                imageUrl = "https://i.imgur.com/gfGcVmg.png";
                break;
            case "gas-station_dark.png":
                imageUrl = "https://i.imgur.com/hgYWYC0.png";
                break;
            default:
                imageUrl = "https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/icons/" + image;
                // console.log(`FP: Sorry, couldn't find a url for ${image}.`);
        }
        let iconImage = await loadImage(imageUrl);
        fm.writeImage(path, iconImage);
        return iconImage;
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
    console.log("FileManager: Saving New Vehicle Data to Local Storage...");
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    let path = fm.joinPath(dir, "fp_carData.json");
    if (fm.fileExists(path)) {
        fm.remove(path);
    } //clean old data
    fm.writeString(path, JSON.stringify(data));
}

function readLocalData() {
    console.log("FileManager: Retrieving Vehicle Data from Local Storage...");
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    let path = fm.joinPath(dir, "fp_carData.json");
    if (fm.fileExists(path)) {
        let localData = fm.readString(path);
        return JSON.parse(localData);
    }
    return null;
}

function removeLocalData(filename) {
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    let path = fm.joinPath(dir, filename);
    if (fm.fileExists(path)) {
        fm.remove(path);
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

function clearKeychain() {
    console.log("Info: Clearing Authentication from Keychain");
    if (Keychain.contains("fpToken")) {
        Keychain.remove("fpToken");
    }
    if (Keychain.contains("fpUsername")) {
        Keychain.remove("fpUsername");
    }
    if (Keychain.contains("fpPassword")) {
        Keychain.remove("fpPassword");
    }
    if (Keychain.contains("fpVin")) {
        Keychain.remove("fpVin");
    }
}

function clearFileManager() {
    console.log("Info: Clearing All Files from Local Directory");
    let fm = FileManager.local();
    let dir = fm.documentsDirectory();
    fm.listContents(dir).forEach((file) => {
        removeLocalData(file);
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
        return `${textValues.UIValues.precedingAdverb} ${diff} ${textValues.UIValues.hour}${diff == 1 ? "" : textValues.UIValues.plural} ${textValues.UIValues.subsequentAdverb}`;
    }
    if (Math.round(((diffMs % 86400000) % 3600000) / 60000) >= 1) {
        let diff = Math.round(((diffMs % 86400000) % 3600000) / 60000);
        return `${textValues.UIValues.precedingAdverb} ${diff} ${textValues.UIValues.minute}${diff == 1 ? "" : textValues.UIValues.plural} ${textValues.UIValues.subsequentAdverb}`;
    }
    return textValues.UIValues.smallerOneMinute;
}

function calculateDurationLeasing() {
    let lsd = new Date(userData.leaseStartDate);
    let duration = lsb ? (Date.now() - dls.getTime()) / (1000 * 60 * 60 * 24) : null;
    console.log((Date.now() - dls.getTime()) / (1000 * 60 * 60 * 24));
    return duration;
}

function pressureToFixed(pressure, digits) {
    if (userData.useMetric) {
        return pressure ? pressure.toFixed(digits) : -1;
    } else {
        return pressure ? (pressure * 0.15).toFixed(digits) : -1;
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
        if (key.indexOf("*") !== -1) {
            key = key.replace("*", "");
            if (!(key in inst)) {
                throw new Error(`Method "${key}()" is not applicable to instance of ${_getObjectClass(inst)}`);
            }
            if (Array.isArray(options["*" + key])) {
                inst[key](...options["*" + key]);
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

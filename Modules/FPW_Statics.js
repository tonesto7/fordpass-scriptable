//************************************************************************* */
//*                  Device Detail Functions
//************************************************************************* */
const screenSize = Device.screenResolution();
const isSmallDisplay = screenSize.width < 1200 === true;
const darkMode = Device.isUsingDarkAppearance();
const runningWidgetSize = config.widgetFamily;
const isPhone = Device.isPhone();
const isPad = Device.isPad();

//******************************************************************
//* Edit these values to accomodate your langauge or prefrerences
//******************************************************************
const textMap = (str) => {
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

const colorMap = {
    textColor1: darkMode ? '#EDEDED' : '#000000', // Header Text Color
    textColor2: darkMode ? '#EDEDED' : '#000000', // Value Text Color
    textBlack: '#000000',
    textWhite: '#EDEDED',
    backColor: darkMode ? '#111111' : '#FFFFFF', // Background Color'
    backColorGrad: darkMode ? ['#141414', '#13233F'] : ['#BCBBBB', '#DDDDDD'], // Background Color Gradient}
};

function getBgGradient() {
    let grad = new LinearGradient();
    grad.locations = [0, 1];
    grad.colors = [new Color(colorMap.backColorGrad[0]), new Color(colorMap.backColorGrad[1])];
    return grad;
}

const iconMap = {
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
module.exports = { sizeMap: sizeMap, iconMap: iconMap, colorMap: colorMap, textMap: textMap, getBgGradient: getBgGradient, isSmallDisplay: isSmallDisplay, darkMode: darkMode, isPhone: isPhone, isPad: isPad, runningWidgetSize: runningWidgetSize };
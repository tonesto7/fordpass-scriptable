const darkMode = Device.isUsingDarkAppearance();

const fontSizes = {
    medium: 10,
    title1: 24,
    title2: 22,
    title3: 20,
    body: 10,
    body2: 11,
    body3: 13,
    footnote: 14,
    headline: 15,
    headline2: 17,
    subheadline: 13,
};

module.exports = class FPW_App {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.tableMap = {};
        this.mainPageFirstLoad = true;
    }

    async getTable(tableName) {
        if (await this.tableExists(tableName)) {
            return this.tableMap[tableName];
        }
        this.tableMap[tableName] = new UITable();
        return this.tableMap[tableName];
    }

    async removeTable(tableName) {
        if (await this.tableExists(tableName)) {
            delete this.tableMap[tableName];
        }
        return;
    }

    async tableExists(tableName) {
        return this.tableMap[tableName] !== undefined && this.tableMap[tableName] instanceof UITable;
    }

    async generateTableMenu(tableName, rows, showSeparators = false, fullscreen = false, update = false) {
        // console.log(`generateTableMenu() called for ${tableName} | ${rows.length} rows | ${showSeparators} | ${fullscreen} | ${update}`);
        try {
            const exists = await this.tableExists(tableName);
            let table = await this.getTable(tableName);
            if (exists) {
                await table.removeAllRows();
            }
            // console.log(`${exists ? 'Updating' : 'Creating'} ${tableName} Table and ${update ? 'Reloading' : 'Presenting'}`);
            table.showSeparators = showSeparators;
            rows.forEach(async(row) => {
                await table.addRow(row);
            });
            if (update) {
                await table.reload();
            } else {
                await table.present(fullscreen);
            }
        } catch (e) {
            this.FPW.logError(`generateTableMenu() error: ${e}`);
        }
    }

    async reloadTable(tableName) {
        let table = await this.getTable(tableName);
        await table.reload();
    }

    async showTable(tableName, fullscreen = false) {
        let table = await this.getTable(tableName);
        await table.present(fullscreen);
    }

    async clearTable() {
        let table = await this.getTable(tableName);
        await table.removeAllRows();
    }

    async createTableRow(cells, options) {
        let row = new UITableRow();
        try {
            cells.forEach((cell) => {
                if (cell) {
                    row.addCell(cell);
                }
            });
            row = await this.applyTableOptions(row, options);
        } catch (err) {
            this.FPW.logError(`createTableRow() error: ${err}`);
        }
        return row;
    }

    async createTextCell(title, subtitle, options) {
        try {
            let cell = UITableCell.text(title || '', subtitle || '');
            if (options) {
                cell = await this.applyTableOptions(cell, options);
            }
            return cell;
        } catch (err) {
            this.FPW.logError(`Error creating text cell: ${err}`);
        }
    }

    async createImageCell(image, options) {
        try {
            let cell = UITableCell.image(image);
            if (options) {
                cell = await this.applyTableOptions(cell, options);
            }
            return cell;
        } catch (err) {
            this.FPW.logError(`Error creating image cell: ${err}`);
        }
    }

    async createButtonCell(title, options) {
        try {
            let cell = UITableCell.button(title || '');
            if (options) {
                cell = await this.applyTableOptions(cell, options);
            }
            return cell;
        } catch (err) {
            this.FPW.logError(`Error creating button cell: ${err}`);
        }
    }

    applyTableOptions(src, options) {
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
            this.FPW.logError(`Error applying options: ${err}`);
        }
        return src;
    }

    getAlertColorByCode(code) {
        switch (code) {
            case 'A':
                return '#E96C00';
            case 'G':
                return '#008200';
            case 'R':
                return '#FF0000';
            default:
                return this.FPW.colorMap.textColor1;
        }
    }

    getChangeLabelColorAndNameByType(type) {
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
                return { name: '', color: this.FPW.colorMap.normalText };
        }
    }

    getAlertDescByType(type) {
        switch (type) {
            case 'VHA':
                return 'Vehicle Health';
            case 'MMOTA':
                return 'OTA Update';
            default:
                return '';
        }
    }

    getMessageDescByType(type) {
        switch (type) {
            case 'GENERAL':
                return 'General';
            case 'EXTERNALNOTIFICATIONREQUEST':
                return 'External';
            default:
                return '';
        }
    }

    // async  getRowHeightByTxtLength(txt, lineLength = 75, lineHeight = 35, minHeight = 44) {
    //     let result = txt && txt.length ? (txt.length / lineLength).toFixed(0) * lineHeight : 0;
    //     result = result < minHeight ? minHeight : result;
    //     // console.log(`${txt} | Length: ${txt.length} | Desired Height: ${result}`);
    //     return result;
    // }

    getRowHeightByTxtLength(txt) {
        let result = txt && txt.length ? (txt.length / 75).toFixed(0) * 35 : 0;
        // console.log(`txt length: ${txt.length} - result: ${result}`);
        return result < 44 ? 44 : result;
    }

    async dataValueToString(dataValue) {
        let result = '';
        if (dataValue === undefined || dataValue === null) {
            result = this.FPW.textMap().errorMessages.noData;
        } else if (dataValue instanceof boolean) {
            result = dataValue ? 'True' : 'False';
        } else {
            result = dataValue.toString();
        }
        console.log(`result: ${result}`);
        return result;
    }

    async showDataWebView(title, heading, data, type = undefined) {
        console.log(`showDataWebView(${title}, ${heading}, ${type})`); //, ${JSON.stringify(data)})`);
        let HTML = '';
        try {
            data = this.FPW.scrubPersonalData(data);
            switch (type) {
                case 'OTA':
                    try {
                        if (data.tappsResponse) {
                            HTML += `<h3>OTA Status & Vehicle Schedule Settings</h3>`;
                            HTML += `<ul>`;
                            HTML += `<li>Vehicle Inhibit Status: ${data.tappsResponse.vehicleInhibitStatus || this.FPW.textMap().errorMessages.noData}</li>`;
                            if (data.tappsResponse.lifeCycleModeStatus) {
                                HTML += '<li>Life Cycle Mode Status:</li>';
                                HTML += '<ul>';
                                for (const [i, key] of Object.keys(data.tappsResponse.lifeCycleModeStatus).entries()) {
                                    const val = data.tappsResponse.lifeCycleModeStatus[key];
                                    if (val !== null || val !== undefined || val !== '') {
                                        HTML += `<li>${this.FPW.decamelize(key, '', true)}: ${val}</li>`;
                                    }
                                }
                                HTML += '</ul>';
                            }
                            if (data.tappsResponse.asuActivationSchedule) {
                                HTML += '<li>OTA Activation Schedule:</li>';
                                HTML += '<ul>';
                                for (const [i, key] of Object.keys(data.tappsResponse.asuActivationSchedule).entries()) {
                                    const val = data.tappsResponse.asuActivationSchedule[key];
                                    if (val !== null || val !== undefined || val !== '') {
                                        HTML += `<li>${this.FPW.decamelize(key, '', true)}: ${val instanceof Array ? val.join(', ') : val}</li>`;
                                    }
                                }
                                HTML += '</ul>';
                            }
                            if (data.tappsResponse.asuSettingsStatus) {
                                HTML += '<li>OTA Setting Status:</li>';
                                HTML += '<ul>';
                                for (const [i, key] of Object.keys(data.tappsResponse.asuSettingsStatus).entries()) {
                                    const val = data.tappsResponse.asuSettingsStatus[key];
                                    if (val !== null || val !== undefined || val !== '') {
                                        HTML += `<li>${this.FPW.decamelize(key, '', true)}: ${val instanceof Array ? val.join(', ') : val}</li>`;
                                    }
                                }
                                HTML += '</ul>';
                            }
                            HTML += `<li>UpdatePendingState: ${data.tappsResponse.updatePendingState || this.FPW.textMap().errorMessages.noData}</li>`;
                            HTML += `<li>OtaAlertStatus: ${data.tappsResponse.otaAlertStatus || this.FPW.textMap().errorMessages.noData}</li>`;
                            HTML += `</ul>`;
                        }

                        if (data.fuseResponse && data.fuseResponse.fuseResponseList && data.fuseResponse.fuseResponseList.length) {
                            HTML += `<h3>OTA Deployments</h3>`;
                            let that = this;
                            for (const [i, fuse] of data.fuseResponse.fuseResponseList.entries()) {
                                if (fuse && Object.keys(fuse).length) {
                                    HTML += `<ul>`;
                                    HTML += `<li>CorrelationID: ${fuse.oemCorrelationId || this.FPW.textMap().errorMessages.noData}</li>`;
                                    HTML += `<li>Created: ${fuse.deploymentCreationDate || this.FPW.textMap().errorMessages.noData}</li>`;
                                    HTML += `<li>Expiration: ${fuse.deploymentExpirationTime || this.FPW.textMap().errorMessages.noData}</li>`;
                                    HTML += `<li>Priority: ${fuse.communicationPriority || this.FPW.textMap().errorMessages.noData}</li>`;
                                    HTML += `<li>Type: ${fuse.type || this.FPW.textMap().errorMessages.noData}</li>`;
                                    HTML += `<li>Trigger: ${fuse.triggerType || this.FPW.textMap().errorMessages.noData}</li>`;
                                    HTML += `<li>Inhibit Required: ${fuse.inhibitRequired || this.FPW.textMap().errorMessages.noData}</li>`;
                                    HTML += `<li>Environment: ${fuse.tmcEnvironment || this.FPW.textMap().errorMessages.noData}</li>`;
                                    if (fuse.latestStatus) {
                                        HTML += `<li>Latest Status:</li>`;
                                        HTML += `<ul>`;
                                        HTML += `    <li>Status: ${fuse.latestStatus.aggregateStatus || this.FPW.textMap().errorMessages.noData}</li>`;
                                        HTML += `    <li>Details: ${fuse.latestStatus.detailedStatus || this.FPW.textMap().errorMessages.noData}</li>`;
                                        HTML += `    <li>DateTime: ${fuse.latestStatus.dateTimestamp || this.FPW.textMap().errorMessages.noData}</li>`;
                                        HTML += `</ul>`;
                                    }
                                    if (fuse.packageUpdateDetails) {
                                        HTML += `<li>Package Details:</li>`;
                                        HTML += `<ul>`;
                                        HTML += `    <li>WiFiRequired: ${fuse.packageUpdateDetails.wifiRequired || this.FPW.textMap().errorMessages.noData}</li>`;
                                        HTML += `    <li>Priority: ${fuse.packageUpdateDetails.packagePriority || this.FPW.textMap().errorMessages.noData}</li>`;
                                        HTML += `    <li>FailedResponse: ${fuse.packageUpdateDetails.failedOnResponse || this.FPW.textMap().errorMessages.noData}</li>`;
                                        HTML += `    <li>DisplayTime: ${fuse.packageUpdateDetails.updateDisplayTime || this.FPW.textMap().errorMessages.noData}</li>`;
                                        HTML += `    <li>ReleaseNotes:`;
                                        HTML += `    <br>`;
                                        HTML += `    ${data.fuseResponse.languageText.Text || this.FPW.textMap().errorMessages.noData}</li>`;
                                        HTML += `</ul>`;
                                    }
                                    HTML += `</ul>`;
                                } else {
                                    HTML += `<p>${'No Data'}</p>`;
                                }
                            }
                        }

                        HTML += `<hr>`;
                    } catch (err) {
                        // console.log(`showDataWebView(${title}, ${heading}, ${data}) error: ${err}`);
                        HTML = `<h3>OTA Details</h3>`;
                        HTML += `<H5 style="Color: red;">Error Message</h5>`;
                        HTML += `<p style="Color: red;">${err}</p>`;
                    }
                    break;

                case 'vehicleData':
                    try {
                        HTML = this.outputObjToHtml(data, 'Vehicle Data');
                    } catch (err) {
                        console.log(`showDataWebView(${title}, ${heading}, ${data}) error: ${err}`);
                        HTML = `<h3>${title}</h3>`;
                        HTML += `<H5 style="Color: red;">Error Message</h5>`;
                        HTML += `<p style="Color: red;">${err}</p>`;
                    }
                    break;
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
                        li { padding: 0; margin: 0;}
                    </style>
                    
                </head>
                
                <body>
                    <div class="mx-2">
                        ${HTML}
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
            this.FPW.logError(`showDataWebView() | Error: ${e}`);
        }
    }

    outputObjToStr(obj, str = '', curTabSpc = '') {
        const tabSpc = '    ';
        const isObject = (value) => {
            return !!(value && typeof value === 'object' && !Array.isArray(value));
        };
        const isArray = (value) => {
            return !!(value && typeof value === 'object' && Array.isArray(value));
        };
        const isStrNumBoolNull = (value) => {
            return !!(value === null || (value && (typeof value === 'string' || isNaN(value) === false || typeof value === 'boolean')));
        };

        if (isObject(obj)) {
            const objKeys = Object.keys(obj).sort();

            if (objKeys.length) {
                for (const i in objKeys) {
                    const key = objKeys[i];
                    const value = obj[key];
                    // console.log(`${key}: ${typeof value}`)
                    if (isStrNumBoolNull(value)) {
                        str += `${curTabSpc}${key}: ${value}\n`;
                    } else if (typeof value === 'object') {
                        str += `${curTabSpc}${key}:\n`;
                        if (isArray(value)) {
                            for (let i = 0; i < value.length; i++) {
                                if (isObject(value[i]) || isArray(value[i])) {
                                    str = this.outputObjToStr(value[i], str, curTabSpc + tabSpc);
                                } else {
                                    str += `${curTabSpc + tabSpc}${value[i]}\n`;
                                }
                            }
                        } else {
                            str = this.outputObjToStr(value, str, curTabSpc + tabSpc);
                        }
                    }
                }
            }
        } else {
            console.log(`outputObjToStr | Input is NOT an Object | ${obj}`);
        }
        return str;
    }

    outputObjToHtml(obj, title = undefined, html = '', curTabSpc = '') {
        const tabSpc = '    ';
        const isObject = (value) => {
            return !!(value && typeof value === 'object' && !Array.isArray(value));
        };
        const isArray = (value) => {
            return !!(value && typeof value === 'object' && Array.isArray(value));
        };
        const isStrNumBoolNull = (value) => {
            return !!(value === null || (value && (typeof value === 'string' || isNaN(value) === false || typeof value === 'boolean')));
        };

        if (title !== undefined && title !== '') {
            html += `<h3>${title}</h3>`;
        }
        if (isObject(obj)) {
            const objKeys = Object.keys(obj).sort();
            // console.log(`keys: ${objKeys}`);
            if (objKeys.length) {
                html += `<ul>`;
                for (const i in objKeys) {
                    const key = objKeys[i];
                    const value = obj[key];
                    // console.log(`${key}: ${typeof value}`)

                    if (isStrNumBoolNull(value)) {
                        html += `<li>${key}: ${value}</li>`;
                    } else if (typeof value === 'object') {
                        html += `<li>${key}:</li>`;
                        if (isArray(value)) {
                            html += `<ul>`;
                            for (let i = 0; i < value.length; i++) {
                                if (isObject(value[i]) || isArray(value[i])) {
                                    html = this.outputObjToHtml(value[i], undefined, html, curTabSpc + tabSpc);
                                } else {
                                    html += `<li>${value[i]}</li>`;
                                }
                            }
                            html += `</ul>`;
                        } else {
                            html = this.outputObjToHtml(value, undefined, html, curTabSpc + tabSpc);
                        }
                    }
                }
                html += `</ul>`;
            }
        } else {
            console.log(`outputObjToHtml | Input is NOT an Object | ${obj}`);
        }
        return html;
    }

    async createMainPage(update = false, widgetCmd = undefined) {
        try {
            const vData = await this.FPW.FordAPI.fetchVehicleData(true);
            const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
            const isEV = vData.evVehicle === true;
            const pressureUnits = await this.FPW.getSettingVal('fpPressureUnits');
            const distanceMultiplier = (await this.FPW.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
            const distanceUnit = (await this.FPW.useMetricUnits()) ? 'km' : 'mi'; // unit of length
            const tireUnit = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
            const dtePostfix = isEV ? 'Range' : 'to E';

            let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
            let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;
            let dteString = dteValue ? `${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.FPW.textMap().errorMessages.noData;

            const lvbBatteryLow = vData.evVehicle !== true && vData.batteryStatus === 'STATUS_LOW';
            let ignStatus = '';
            if (vData.remoteStartStatus && vData.remoteStartStatus.running ? true : false) {
                ignStatus = `Remote Start (ON)` + (vData.remoteStartStatus.runtimeLeft && vData.remoteStartStatus.runtime ? `\n(${vData.remoteStartStatus.runtimeLeft} of ${vData.remoteStartStatus.runtime} minutes remain)` : '');
            } else {
                ignStatus = vData.ignitionStatus !== undefined ? vData.ignitionStatus.charAt(0).toUpperCase() + vData.ignitionStatus.slice(1) : this.FPW.textMap().errorMessages.noData;
            }
            let refreshTime = (await this.FPW.getLastRefreshElapsedString(vData)) || this.textMap.UIValues.unknown;
            const odometerVal = vData.odometer ? `${Math.round(vData.odometer * distanceMultiplier)} ${distanceUnit}` : this.FPW.textMap().errorMessages.noData;
            const msgs = vData.messages && vData.messages.length ? vData.messages : [];
            const recalls = vData.recallInfo && vData.recallInfo.length && vData.recallInfo[0].recalls && vData.recallInfo[0].recalls.length > 0 ? vData.recallInfo[0].recalls : [];
            const msgsUnread = msgs && msgs.length ? msgs.filter((msg) => msg.isRead === false) : [];
            const headerColor = '#13233F';
            const titleBgColor = darkMode ? '#444141' : '#F5F5F5';

            const showTestUIStuff = this.FPW.widgetConfig.showTestUIStuff === true;
            let updateAvailable = this.FPW.getStateVal('updateAvailable') === true;

            let tableRows = [];

            // Header Section - Row 1: vehicle messages, vehicle type, vehicle alerts
            tableRows.push(
                await this.createTableRow(
                    [
                        await this.createImageCell(await this.FPW.Files.getFPImage(`ic_message_center_notification_dark.png`), { align: 'left', widthWeight: 3 }),
                        await this.createButtonCell(`${msgs.length || 0}`, {
                            align: 'left',
                            widthWeight: 27,
                            onTap: async() => {
                                console.log('(Dashboard) View Messages was pressed');
                                await this.createMessagesPage(vData, false);
                            },
                        }),

                        await this.createTextCell(vData.info.vehicle.vehicleType, odometerVal, {
                            align: 'center',
                            widthWeight: 40,
                            dismissOnTap: false,
                            titleColor: this.FPW.colorMap.text.dark,
                            subtitleColor: Color.lightGray(),
                            titleFont: Font.boldRoundedSystemFont(fontSizes.title3),
                            subtitleFont: Font.thinSystemFont(fontSizes.footnote),
                        }),
                        await this.createButtonCell('Menu', {
                            align: 'right',
                            widthWeight: 30,
                            dismissOnTap: false,
                            onTap: async() => {
                                console.log(`(Dashboard) Menu Button was pressed`);
                                this.FPW.Menus.menuBuilderByType('main');
                            },
                        }),
                    ], {
                        backgroundColor: new Color(headerColor),
                        height: 40,
                        isHeader: true,
                        dismissOnSelect: false,
                    },
                ),
            );

            // Header Section - Row 2: Shows tire pressure label and unit
            tableRows.push(
                await this.createTableRow(
                    [
                        await this.createTextCell('', undefined, { align: 'center', widthWeight: 25 }),
                        await this.createTextCell(undefined, `Tires: (${tireUnit})`, { align: 'center', widthWeight: 50, subtitleColor: this.FPW.colorMap.text.dark, subtitleFont: Font.semiboldSystemFont(fontSizes.body2) }),
                        await this.createTextCell('', undefined, { align: 'center', widthWeight: 25 }),
                    ], {
                        backgroundColor: new Color(headerColor),
                        height: 15,
                        dismissOnSelect: false,
                    },
                ),
            );

            // Header Section - Row 3: Displays the Vehicle Image in center and doors on the left and windows on the right
            const openDoors = await this.FPW.getOpenItems('doors', vData.statusDoors); //['LF', 'RF', 'LR', 'RR', 'HD'];
            const openWindows = await this.FPW.getOpenItems('windows', vData.statusWindows); //['LF', 'RF', 'LR', 'RR', 'HD'];
            // console.log(`openDoors: ${JSON.stringify(openDoors)}`);
            // console.log(`openWindows: ${JSON.stringify(openWindows)}`);
            tableRows.push(
                await this.createTableRow(
                    [
                        // Door Status Cells
                        await this.createImageCell(await this.FPW.Files.getImage(`door_dark_menu.png`), { align: 'center', widthWeight: 5 }),
                        await this.createTextCell('Doors', openDoors.length ? openDoors.join(', ') : 'Closed', {
                            align: 'left',
                            widthWeight: 20,
                            dismissOnTap: false,
                            titleColor: this.FPW.colorMap.text.dark,
                            titleFont: Font.semiboldSystemFont(fontSizes.headline),
                            subtitleColor: new Color(openDoors.length ? '#FF5733' : '#5A65C0'),
                            subtitleFont: Font.mediumSystemFont(fontSizes.subheadline),
                        }),
                        await this.createTextCell(`LF: ${vData.tirePressure.leftFront}\n\n\n\nRF: ${vData.tirePressure.leftRear}`, undefined, { align: 'right', widthWeight: 10, titleColor: this.FPW.colorMap.text.dark, titleFont: Font.mediumSystemFont(fontSizes.medium) }),
                        await this.createImageCell(await this.FPW.Files.getVehicleImage(vData.info.vehicle.modelYear, false, 1), { align: 'center', widthWeight: 30 }),
                        await this.createTextCell(`LR: ${vData.tirePressure.rightFront}\n\n\n\nRR: ${vData.tirePressure.rightRear}`, undefined, { align: 'left', widthWeight: 10, titleColor: this.FPW.colorMap.text.dark, titleFont: Font.mediumSystemFont(fontSizes.medium) }),
                        // Window Status Cells
                        await this.createTextCell('Windows', openWindows.length ? openWindows.join(', ') : 'Closed', {
                            align: 'right',
                            widthWeight: 20,
                            dismissOnTap: false,
                            titleColor: this.FPW.colorMap.text.dark,
                            titleFont: Font.semiboldSystemFont(fontSizes.headline),
                            subtitleColor: new Color(openWindows.length ? '#FF5733' : '#5A65C0'),
                            subtitleFont: Font.mediumSystemFont(fontSizes.subheadline),
                        }),
                        await this.createImageCell(await this.FPW.Files.getImage(`window_dark_menu.png`), { align: 'center', widthWeight: 5 }),
                    ], {
                        backgroundColor: new Color(headerColor),
                        height: 110,
                        cellSpacing: 0,
                        dismissOnSelect: false,
                    },
                ),
            );

            // Header Section - Row 4: Shows fuel/EV battery level and range
            let row4Items = [
                await this.createImageCell(isEV ? await this.FPW.Files.getImage(`ev_battery_dark_menu.png`) : await this.FPW.Files.getFPImage(`ic_gauge_fuel_dark.png`), { align: 'center', widthWeight: 5 }),
                await this.createTextCell(`${isEV ? 'Charge' : 'Fuel'}: ${lvlValue < 0 || lvlValue > 100 ? '--' : lvlValue + '%'}`, dteString, {
                    align: 'left',
                    widthWeight: 30,
                    titleColor: this.FPW.colorMap.text.dark,
                    titleFont: Font.semiboldSystemFont(fontSizes.headline),
                    subtitleColor: Color.lightGray(),
                    subtitleFont: Font.mediumSystemFont(fontSizes.subheadline),
                }),
            ];
            if (vData.fordpassRewardsInfo && vData.fordpassRewardsInfo.points) {
                row4Items.push(
                    await this.createTextCell('FordPass Rewards', `${vData.fordpassRewardsInfo.points}`, {
                        align: 'center',
                        widthWeight: 40,
                        dismissOnTap: false,
                        titleColor: this.FPW.colorMap.text.dark,
                        titleFont: Font.semiboldSystemFont(fontSizes.headline),
                        subtitleColor: this.FPW.colorMap.closedColor,
                        subtitleFont: Font.mediumSystemFont(fontSizes.subheadline),
                    }),
                );
            } else {
                row4Items.push(await this.createTextCell('', undefined, { align: 'center', widthWeight: 40 }));
            }

            if (vData.alarmStatus && vData.alarmStatus.length) {
                row4Items.push(
                    await this.createTextCell('Alarm', vData.alarmStatus && vData.alarmStatus === 'On' ? 'Active' : 'Inactive', {
                        align: 'right',
                        widthWeight: 30,
                        dismissOnTap: false,
                        titleColor: this.FPW.colorMap.text.dark,
                        titleFont: Font.semiboldSystemFont(fontSizes.headline),
                        subtitleColor: new Color(vData.alarmStatus === 'On' ? '#FF5733' : '#5A65C0'),
                        subtitleFont: Font.mediumSystemFont(fontSizes.subheadline),
                    }),
                    await this.createImageCell(await this.FPW.Files.getImage(`alarm_dark_menu.png`), { align: 'center', widthWeight: 5 }),
                );
            } else {
                row4Items.push(await this.createTextCell('', undefined, { align: 'center', widthWeight: 35 }));
            }
            tableRows.push(
                await this.createTableRow(row4Items, {
                    backgroundColor: new Color(headerColor),
                    height: 40,
                    dismissOnSelect: false,
                }),
            );

            // Header Section - Row 5: Padding Row
            tableRows.push(
                await this.createTableRow([await this.createTextCell('', undefined, { align: 'center', widthWeight: 100 })], {
                    backgroundColor: new Color(headerColor),
                    height: 20,
                    dismissOnSelect: false,
                }),
            );
            // Header Section - Row 6: Shows vehicle checkin timestamp
            tableRows.push(
                await this.createTableRow(
                    [
                        // await this.createTextCell('', undefined, { align: 'center', widthWeight: 20 }),
                        await this.createTextCell('Last Checkin: ' + refreshTime, undefined, { align: 'center', widthWeight: 100, titleColor: this.FPW.colorMap.text.dark, titleFont: Font.regularSystemFont(9) }),
                        // await this.createTextCell('', undefined, { align: 'center', widthWeight: 20 }),
                    ], {
                        backgroundColor: new Color(headerColor),
                        height: 20,
                        dismissOnSelect: false,
                    },
                ),
            );

            // console.log(`showTestUIStuff: ${showTestUIStuff}`);
            if (showTestUIStuff) {
                updateAvailable = true;
                vData.alerts = {
                    vha: [{
                        alertIdentifier: 'E19-374-43',
                        activityId: '91760a25-5e8a-48f8-9f10-41392781e0d7',
                        eventTimeStamp: '1/6/2022 12:3:4 AM',
                        colorCode: 'A',
                        iconName: 'ic_washer_fluid',
                        activeAlertBody: {
                            headline: 'Low Washer Fluid',
                            formattedBody: "<div class='accordion' id='SymptomHeader'><h2 class='toggle'><b>What Is Happening?</b></h2><div class='content' id='SymptomHeaderDesc'><p>Low windshield washer fluid.</p></div><h2 class='toggle' id='CustomerActionHeader'><b>What Should I Do?</b></h2><div class='content' id='CustomerActionHeaderDesc'><p>Check the windshield washer reservoir. Add washer fluid as needed.</p></div></div>",
                            wilcode: '600E19',
                            dtccode: '',
                        },
                        hmiAlertBody: null,
                    }, ],
                    mmota: [{
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
                    }, ],
                    summary: [
                        { alertType: 'VHA', alertDescription: 'Low Washer Fluid', alertIdentifier: 'E19-374-43', urgency: 'L', colorCode: 'A', iconName: 'ic_washer_fluid', alertPriority: 1 },
                        { alertType: 'MMOTA', alertDescription: 'UPDATE SUCCESSFUL', alertIdentifier: 'MMOTA_UPDATE_SUCCESSFUL', urgency: null, colorCode: 'G', iconName: 'ic_mmota_alert_update_successful', alertPriority: 2 },
                    ],
                };

                vData.firmwareUpdating = true;
                vData.deepSleepMode = true;
                updateAvailable = true;
            }

            // Script Update Available Row
            if (updateAvailable) {
                tableRows.push(
                    await this.createTableRow(
                        [
                            await this.createTextCell(`New Widget Update Available (v${this.FPW.getStateVal('LATEST_VERSION')})`, 'Tap here to update', {
                                align: 'center',
                                widthWeight: 100,
                                titleColor: new Color('#b605fc'),
                                titleFont: Font.semiboldSystemFont(fontSizes.subheadline),
                                subtitleColor: this.FPW.colorMap.normalText,
                                subtitleFont: Font.regularSystemFont(11),
                            }),
                        ], {
                            height: 40,
                            dismissOnSelect: true,
                            onSelect: async() => {
                                console.log('(Main Menu) Update Widget was pressed');
                                this.FPW.runScript('FordWidgetTool');
                            },
                        },
                    ),
                );
            }

            // Vehicle Recalls Section - Creates rows for each summary recall
            if (recalls && recalls.length) {
                // Creates the Vehicle Recalls Title Row
                tableRows.push(
                    await this.createTableRow(
                        [
                            await this.createTextCell(`Recall(s)`, undefined, {
                                align: 'center',
                                widthWeight: 1,
                                dismissOnTap: false,
                                titleColor: this.FPW.colorMap.normalText,
                                titleFont: Font.regularRoundedSystemFont(fontSizes.title3),
                            }),
                        ], {
                            height: 25,
                            isHeader: true,
                            dismissOnSelect: false,
                            backgroundColor: new Color(titleBgColor),
                        },
                    ),
                );
                // Creates a single row for each recall in the top 10 of recalls array
                for (const [i, recall] of recalls.entries()) {
                    if (i >= 10) {
                        break;
                    }
                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getFPImage(`ic_recall_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.createTextCell(recall.title, `${recall.type}\n(ID: ${recall.id})`, { align: 'left', widthWeight: 93, titleColor: new Color('#E96C00'), titleFont: Font.mediumSystemFont(fontSizes.headline), subtitleColor: this.FPW.colorMap.normalText, subtitleFont: Font.regularSystemFont(10) }),
                            ], {
                                height: recall.id && recall.id.length ? 60 : 44,
                                dismissOnSelect: false,
                                cellSpacing: 5,
                                onSelect: async() => {
                                    console.log('(Dashboard) Recall Item row was pressed');
                                    await this.createRecallPage(vData);
                                },
                            },
                        ),
                    );
                }
            }

            // Vehicle Alerts Section - Creates rows for each summary alert
            if ((vData.alerts && vData.alerts.summary && vData.alerts.summary.length) || vData.firmwareUpdating || vData.deepSleepMode || lvbBatteryLow) {
                let alertsSummary = vData.alerts && vData.alerts.summary && vData.alerts.summary.length ? vData.alerts.summary : [];

                if (vData.deepSleepMode) {
                    alertsSummary.push({ alertType: 'VHA', alertDescription: 'Deep Sleep Active - Low Battery', urgency: 'L', colorCode: 'R', iconName: 'battery_12v', alertPriority: 1, noButton: true });
                }
                if (lvbBatteryLow) {
                    alertsSummary.push({ alertType: 'VHA', alertDescription: '12V Battery Low', urgency: 'L', colorCode: 'R', iconName: 'battery_12v', alertPriority: 1, noButton: true });
                }
                if (vData.firmwareUpdating) {
                    alertsSummary.push({ alertType: 'MMOTA', alertDescription: 'Firmware Update in Progress', urgency: 'L', colorCode: 'G', iconName: 'ic_software_updates', alertPriority: 1, noButton: true });
                }

                // Creates the Vehicle Alerts Title Row
                tableRows.push(
                    await this.createTableRow([await this.createTextCell(`Vehicle Alert(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title3) })], {
                        height: 25,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );
                // Creates a single row for each alert in the top 10 of alerts.summary array
                for (const [i, alert] of alertsSummary.entries()) {
                    if (i >= 10) {
                        break;
                    }
                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.createTextCell(alert.alertDescription, this.getAlertDescByType(alert.alertType), {
                                    align: 'left',
                                    widthWeight: 93,
                                    titleColor: new Color(this.getAlertColorByCode(alert.colorCode)),
                                    titleFont: Font.mediumSystemFont(fontSizes.headline),
                                    subtitleColor: this.FPW.colorMap.normalText,
                                    subtitleFont: Font.regularSystemFont(10),
                                }),
                            ], {
                                height: 44,
                                dismissOnSelect: false,
                                cellSpacing: 5,
                                onSelect: alert.noButton === undefined || alert.noButton === false ?
                                    async() => {
                                        console.log('(Dashboard) Alert Item row was pressed');
                                        // await this.FPW.Alerts.showAlert('Alert Item', `Alert Type: ${alert.alertType}`);
                                        await this.createAlertsPage(vData);
                                    } :
                                    undefined,
                            },
                        ),
                    );
                }
            }

            // Unread Messages Section - Displays a count of unread messages and a button to view all messages
            if (msgsUnread.length) {
                tableRows.push(
                    await this.createTableRow([await this.createTextCell('Unread Messages', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title3) })], {
                        height: 25,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );

                tableRows.push(
                    await this.createTableRow(
                        [
                            await this.createImageCell(await this.FPW.Files.getFPImage(`ic_message_center_notification_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await this.createTextCell(`Unread Message${msgsUnread.length > 1 ? 's' : ''}: (${msgsUnread.length})`, undefined, {
                                align: 'left',
                                widthWeight: 76,
                                titleColor: this.FPW.colorMap.normalText,
                                titleFont: Font.body(),
                                subtitleColor: this.FPW.colorMap.normalText,
                                subtitleFont: Font.regularSystemFont(9),
                            }),
                            await this.createButtonCell('View', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) View Unread Messages was pressed');
                                    await this.createMessagesPage(vData, true);
                                },
                            }),
                        ], {
                            height: 44,
                            dismissOnSelect: false,
                            cellSpacing: 5,
                            onSelect: async() => {
                                console.log('(Dashboard) View Unread Messages was pressed');
                                await this.createMessagesPage(vData, true);
                            },
                        },
                    ),
                );
            }

            // Vehicle Controls Section - Remote Start, Door Locks, and Horn/Lights
            if (caps && caps.length && (caps.includes('DOOR_LOCK_UNLOCK') || caps.includes('REMOTE_START') || caps.includes('REMOTE_PANIC_ALARM'))) {
                // Creates the Status & Remote Controls Header Row
                tableRows.push(
                    await this.createTableRow([await this.createTextCell('Remote Controls', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title3) })], {
                        height: 25,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );

                // Generates the Lock Control Row
                if (caps.includes('DOOR_LOCK_UNLOCK')) {
                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getFPImage(`${vData.lockStatus === 'LOCKED' ? 'lock_icon' : 'unlock_icon'}_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.createTextCell('Locks', vData.lockStatus === 'LOCKED' ? 'Locked' : 'Unlocked', {
                                    align: 'left',
                                    widthWeight: 59,
                                    titleColor: this.FPW.colorMap.normalText,
                                    subtitleColor: new Color(vData.lockStatus === 'LOCKED' ? '#5A65C0' : '#FF5733'),
                                    titleFont: Font.mediumSystemFont(fontSizes.headline),
                                    subtitleFont: Font.mediumSystemFont(fontSizes.subheadline),
                                }),
                                await this.createButtonCell('Unlock', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Unlock was pressed');
                                        if (await this.FPW.Alerts.showYesNoPrompt('Locks', 'Are you sure you want to unlock the vehicle?')) {
                                            await this.FPW.FordAPI.sendVehicleCmd('unlock');
                                        }
                                    },
                                }),
                                await this.createButtonCell('Lock', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Lock was pressed');
                                        await this.FPW.FordAPI.sendVehicleCmd('lock');
                                    },
                                }),
                            ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                        ),
                    );
                }

                // Generates the Remote Start Control Row
                if (caps.includes('REMOTE_START')) {
                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getFPImage(`ic_paak_key_settings_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.createTextCell('Ignition', ignStatus, {
                                    align: 'left',
                                    widthWeight: 59,
                                    titleColor: this.FPW.colorMap.normalText,
                                    subtitleColor: new Color(ignStatus === 'Off' ? '#5A65C0' : '#FF5733'),
                                    titleFont: Font.mediumSystemFont(fontSizes.headline),
                                    subtitleFont: Font.mediumSystemFont(fontSizes.subheadline),
                                }),
                                await this.createButtonCell('Stop', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Stop was pressed');
                                        await this.FPW.FordAPI.sendVehicleCmd('stop');
                                    },
                                }),
                                await this.createButtonCell('Start', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Start was pressed');
                                        if (await this.FPW.Alerts.showYesNoPrompt('Remote Start', 'Are you sure you want to start the vehicle?')) {
                                            await this.FPW.FordAPI.sendVehicleCmd('start');
                                        }
                                    },
                                }),
                            ], { height: ignStatus.length > 17 ? 64 : 44, cellSpacing: 5, dismissOnSelect: false },
                        ),
                    );
                }

                // Generates the Horn/Lights Control Row
                if (caps.includes('REMOTE_PANIC_ALARM')) {
                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getFPImage(`res_0x7f080088_ic_control_lights_and_horn_active__0_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.createTextCell('Sound Horn/Lights', undefined, {
                                    align: 'left',
                                    widthWeight: 76,
                                    titleColor: this.FPW.colorMap.normalText,
                                    subtitleColor: new Color(ignStatus === 'Off' ? '#5A65C0' : '#FF5733'),
                                    titleFont: Font.mediumSystemFont(fontSizes.headline),
                                    subtitleFont: Font.mediumSystemFont(fontSizes.subheadline),
                                }),

                                await this.createButtonCell('Start', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Horn/Lights was pressed');
                                        if (await this.FPW.Alerts.showYesNoPrompt('Horn/Lights', 'Your Horn and Lights will activate for a few seconds.  Are you sure you want to proceed?')) {
                                            await this.FPW.FordAPI.sendVehicleCmd('horn_and_lights');
                                        }
                                    },
                                }),
                            ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                        ),
                    );
                }
            }

            // Advanced Controls Section - Zone Lighting, SecuriAlert, Trailer Lights(if available)
            if (caps.includes('ZONE_LIGHTING_FOUR_ZONES') || caps.includes('ZONE_LIGHTING_TWO_ZONES' || caps.includes('GUARD_MODE') || caps.includes('TRAILER_LIGHT'))) {
                // Creates the Advanced Controls Header Text
                tableRows.push(
                    await this.createTableRow([await this.createTextCell('Advanced Controls', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title3) })], {
                        height: 25,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );

                // Generates the SecuriAlert Control Row
                if (caps.includes('GUARD_MODE')) {
                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getFPImage(`ic_guard_mode_vd_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.createTextCell('SecuriAlert', vData.securiAlertStatus === 'enable' ? 'On' : 'Off', {
                                    align: 'left',
                                    widthWeight: 59,
                                    titleColor: this.FPW.colorMap.normalText,
                                    subtitleColor: new Color(vData.securiAlertStatus === 'enable' ? '#FF5733' : '#5A65C0'),
                                    titleFont: Font.mediumSystemFont(fontSizes.headline),
                                    subtitleFont: Font.mediumSystemFont(fontSizes.subheadline),
                                }),
                                await this.createButtonCell('Enable', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) SecuriAlert Enable was pressed');
                                        await this.FPW.FordAPI.sendVehicleCmd('guard_mode_on');
                                    },
                                }),
                                await this.createButtonCell('Disable', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) SecuriAlert Disable was pressed');
                                        if (await this.FPW.Alerts.showYesNoPrompt('SecuriAlert', 'Are you sure you want to disable SecuriAlert?')) {
                                            await this.FPW.FordAPI.sendVehicleCmd('guard_mode_off');
                                        }
                                    },
                                }),
                            ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                        ),
                    );
                }

                // Generates the Zone Lighting Control Row
                if (caps.includes('ZONE_LIGHTING_FOUR_ZONES') || caps.includes('ZONE_LIGHTING_TWO_ZONES')) {
                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getFPImage(`ic_zone_lighting_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.createTextCell('Zone Lighting', vData.zoneLightingStatus, {
                                    align: 'left',
                                    widthWeight: 59,
                                    titleColor: this.FPW.colorMap.normalText,
                                    subtitleColor: new Color(vData.zoneLightingStatus === 'On' ? '#FF5733' : '#5A65C0'),
                                    titleFont: Font.mediumSystemFont(fontSizes.headline),
                                    subtitleFont: Font.mediumSystemFont(fontSizes.subheadline),
                                }),
                                await this.createButtonCell('Enable', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Zone Lighting On Button was pressed');
                                        await this.FPW.Alerts.showActionPrompt(
                                            'Zone Lighting On Menu',
                                            undefined, [{
                                                    title: 'Front Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Front On was pressed`);
                                                        await this.FPW.FordAPI.sendVehicleCmd('zone_lights_front_on');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'Rear Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Rear On was pressed`);
                                                        await this.FPW.FordAPI.sendVehicleCmd('zone_lights_rear_on');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'Left Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Left On was pressed`);
                                                        await this.FPW.FordAPI.sendVehicleCmd('zone_lights_left_on');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'Right Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Right On was pressed`);
                                                        await this.FPW.FordAPI.sendVehicleCmd('zone_lights_right_on');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'All Zones',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone All On was pressed`);
                                                        await this.FPW.FordAPI.sendVehicleCmd('zone_lights_all_on');
                                                    },
                                                    destructive: false,
                                                    show: true,
                                                },
                                            ],
                                            true,
                                        );
                                    },
                                }),
                                await this.createButtonCell('Disable', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Zone Lighting Off Button was pressed');
                                        await this.FPW.Alerts.showActionPrompt(
                                            'Zone Lighting Off',
                                            undefined, [{
                                                    title: 'Front Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Front Off was pressed`);
                                                        await this.FPW.FordAPI.sendVehicleCmd('zone_lights_front_off');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'Rear Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Rear Off was pressed`);
                                                        await this.FPW.FordAPI.sendVehicleCmd('zone_lights_rear_off');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'Left Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Left Off was pressed`);
                                                        await this.FPW.FordAPI.sendVehicleCmd('zone_lights_left_off');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'Right Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Right Off was pressed`);
                                                        await this.FPW.FordAPI.sendVehicleCmd('zone_lights_right_off');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'All Zones',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone All Off was pressed`);
                                                        await this.FPW.FordAPI.sendVehicleCmd('zone_lights_all_off');
                                                    },
                                                    destructive: false,
                                                    show: true,
                                                },
                                            ],
                                            true,
                                        );
                                    },
                                }),
                            ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                        ),
                    );
                }

                // Generates the Trailer Light Check Control Row
                if (caps.includes('TRAILER_LIGHT')) {
                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getFPImage(`ic_trailer_light_check_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.createTextCell('Trailer Light Check', vData.trailerLightCheckStatus, {
                                    align: 'left',
                                    widthWeight: 59,
                                    titleColor: this.FPW.colorMap.normalText,
                                    subtitleColor: new Color(vData.trailerLightCheckStatus === 'On' ? '#FF5733' : '#5A65C0'),
                                    titleFont: Font.mediumSystemFont(fontSizes.headline),
                                    subtitleFont: Font.mediumSystemFont(fontSizes.subheadline),
                                }),
                                await this.createButtonCell('Start', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Trailer Light Check Start was pressed');
                                        if (await this.FPW.Alerts.showYesNoPrompt('Trailer Light Check', 'Are you sure want to start the trailer light check process?')) {
                                            await this.FPW.FordAPI.sendVehicleCmd('trailer_light_check_on');
                                        }
                                    },
                                }),
                                await this.createButtonCell('Stop', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Trailer Light Check Stop was pressed');
                                        await this.FPW.FordAPI.sendVehicleCmd('trailer_light_check_off');
                                    },
                                }),
                            ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                        ),
                    );
                }
            }

            tableRows.push(
                // await this.createTableRow([
                //     await this.createTextCell('', undefined, {
                //         align: 'center',
                //         widthWeight: 100,
                //     }),
                // ]),
                await this.createTableRow([
                    await this.createTextCell('Last Refreshed:', new Date().toLocaleString(), {
                        align: 'center',
                        widthWeight: 100,
                        titleColor: this.FPW.colorMap.normalText,
                        subtitleColor: this.FPW.colorMap.normalText,
                        titleFont: Font.mediumSystemFont(fontSizes.body2),
                        subtitleFont: Font.mediumSystemFont(fontSizes.body),
                    }),
                ]),
            );

            tableRows.push(
                await this.createTableRow(
                    [
                        await this.createTextCell(`Advanced Info`, 'Tap to view', {
                            align: 'center',
                            widthWeight: 100,
                            titleColor: this.FPW.colorMap.normalText,
                            titleFont: Font.semiboldSystemFont(fontSizes.subheadline),
                            subtitleColor: this.FPW.colorMap.normalText,
                            subtitleFont: Font.regularSystemFont(11),
                        }),
                    ], {
                        height: 40,
                        dismissOnSelect: false,
                        onSelect: async() => {
                            console.log('(Main Menu) Advanced Info Page was pressed');
                            this.createAdvancedInfoPage();
                        },
                    },
                ),
            );

            if (!update) {
                let lastVersion = await this.FPW.getSettingVal('fpScriptVersion');
                let reqOk = await this.FPW.requiredPrefsOk(this.FPW.prefKeys().core);
                // console.log(`(Dashboard) Last Version: ${lastVersion}`);
                if (reqOk && lastVersion !== this.FPW.SCRIPT_VERSION) {
                    let changes = this.FPW.changelogs[this.SCRIPT_VERSION];
                    if (changes && changes.clearImgCache) {
                        await this.FPW.Files.clearImageCache();
                    }
                    this.createRecentChangesPage();
                    await this.FPW.setSettingVal('fpScriptVersion', this.FPW.SCRIPT_VERSION);
                }
            }
            if (widgetCmd) {
                // await this.FPW.Alerts.showAlert('Widget Command', `Widget Command: ${widgetCmd}`);
                await this.processWidgetCommands(widgetCmd);
            }

            if (this.mainPageFirstLoad) {
                this.mainPageFirstLoad = false;
                await this.FPW.Timers.scheduleMainPageRefresh('mainTableRefresh', 1000, false, true);
            } else {
                // Refreshes the page every 30 seconds
                await this.FPW.Timers.scheduleMainPageRefresh('mainTableRefresh', 30000, false, true);
            }

            await this.generateTableMenu('main', tableRows, false, Device.isPhone() || (!Device.isPhone() && !Device.isPad()), update);
        } catch (err) {
            await this.FPW.logError(`createMainPage() Error: ${err}`);
        }
    }

    async processWidgetCommands(cmd) {
        switch (cmd) {
            case 'lock_command':
                await this.FPW.Alerts.showActionPrompt(
                    'Locks',
                    'Are you sure you want to unlock the vehicle?', [{
                            title: 'Unlock',
                            action: async() => {
                                console.log('(WidgetCommand) Unlock was pressed');
                                await this.FPW.FordAPI.sendVehicleCmd('unlock');
                            },
                            destructive: true,
                            show: true,
                        },
                        {
                            title: 'Lock',
                            action: async() => {
                                console.log('(WidgetCommand) Lock was pressed');
                                await this.FPW.FordAPI.sendVehicleCmd('lock');
                            },
                            destructive: false,
                            show: true,
                        },
                    ],
                    true,
                );
                break;

            case 'start_command':
                await this.FPW.Alerts.showActionPrompt(
                    'Remote Start',
                    'Are you sure you want to start the vehicle?', [{
                            title: 'Start',
                            action: async() => {
                                console.log('(WidgetCommand) Start was pressed');
                                await this.FPW.FordAPI.sendVehicleCmd('start');
                            },
                            destructive: true,
                            show: true,
                        },
                        {
                            title: 'Stop',
                            action: async() => {
                                console.log('(WidgetCommand) Stop was pressed');
                                await this.FPW.FordAPI.sendVehicleCmd('stop');
                            },
                            destructive: false,
                            show: true,
                        },
                    ],
                    true,
                );
                break;
            case 'request_refresh':
                await this.FPW.Alerts.showActionPrompt(
                    'Vehicle Data Refresh',
                    "Are you sure you want to send a wake request to the vehicle to refresh it's data?\n\nThis is not an instant thing and sometimes takes minutes to wake the vehicle...", [{
                        title: 'Refresh',
                        action: async() => {
                            console.log(`(WidgetCommand) Refresh was pressed`);
                            await this.FPW.FordAPI.sendVehicleCmd('status');
                        },
                        destructive: true,
                        show: true,
                    }, ],
                    true,
                );
        }
    }

    async createMessagesPage(vData, unreadOnly = false, update = false) {
        try {
            let msgs = vData.messages && vData.messages && vData.messages && vData.messages.length ? vData.messages : [];
            msgs = unreadOnly ? msgs.filter((msg) => msg.isRead === false) : msgs;

            let tableRows = [];

            if (msgs.length > 0) {
                tableRows.push(
                    await this.createTableRow(
                        [
                            await this.createTextCell('', undefined, { align: 'left', widthWeight: 20 }),
                            await this.createTextCell(`${msgs.length} Messages(s)`, undefined, { align: 'center', widthWeight: 60, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title2) }),
                            await this.createTextCell('All', undefined, { align: 'right', widthWeight: 20, dismissOnTap: false, titleColor: Color.purple(), titleFont: Font.regularRoundedSystemFont(fontSizes.title3) }),
                        ], {
                            height: 40,
                            dismissOnSelect: false,
                            onSelect: async() => {
                                console.log(`(Messages Table) All Message Options was pressed`);
                                let msgIds = msgs.map((msg) => msg.messageId);
                                await this.FPW.Alerts.showActionPrompt(
                                    'All Message Options',
                                    undefined, [{
                                            title: 'Mark All Read',
                                            action: async() => {
                                                console.log(`(Messages Table) Mark All Messages Read was pressed`);
                                                let ok = await this.FPW.Alerts.showPrompt(`All Message Options`, `Are you sure you want to mark all messages as read?`, `Mark (${msgIds.length}) Read`, true);
                                                if (ok) {
                                                    console.log(`(Messages Table) Marking ${msgIds.length} Messages as Read`);
                                                    if (await this.FPW.FordAPI.markMultipleUserMessagesRead(msgIds)) {
                                                        console.log(`(Messages Table) Marked (${msgIds.length}) Messages as Read Successfully`);
                                                        this.FPW.Alerts.showAlert('Marked Messages as Read Successfully', 'Message List will reload after data is refeshed');
                                                        await this.createMessagesPage(await this.FPW.FordAPI.fetchVehicleData(false), unreadOnly, true);
                                                        this.createMainPage(true);
                                                    }
                                                }
                                            },
                                            destructive: false,
                                            show: true,
                                        },
                                        {
                                            title: 'Delete All',
                                            action: async() => {
                                                console.log(`(Messages Table) Delete All Messages was pressed`);
                                                let ok = await this.FPW.Alerts.showPrompt('Delete All Messages', 'Are you sure you want to delete all messages?', `Delete (${msgIds.length}) Messages`, true);
                                                if (ok) {
                                                    console.log(`(Messages Table) Deleting ${msgIds.length} Messages`);
                                                    if (await this.FPW.FordAPI.deleteUserMessages(msgIds)) {
                                                        console.log(`(Messages Table) Deleted (${msgIds.length}) Messages Successfully`);
                                                        this.FPW.Alerts.showAlert('Deleted Messages Successfully', 'Message List will reload after data is refeshed');
                                                        await this.createMessagesPage(await this.FPW.FordAPI.fetchVehicleData(false), unreadOnly, true);
                                                        this.createMainPage(true);
                                                    }
                                                }
                                            },
                                            destructive: true,
                                            show: true,
                                        },
                                    ],
                                    true,
                                    async() => {
                                        this.createMessagesPage(vData, unreadOnly);
                                    },
                                );
                            },
                        },
                    ),
                );

                for (const [i, msg] of msgs.entries()) {
                    let dtTS = msg.createdDate ? this.FPW.convertFordDtToLocal(msg.createdDate) : undefined;
                    let timeDiff = dtTS ? this.FPW.timeDifference(dtTS) : '';
                    let timeSubtitle = `${dtTS ? dtTS.toLocaleString() : ''}${timeDiff ? ' (' + timeDiff + ')' : ''}`;

                    // Creates Message Header Row
                    tableRows.push(await this.createTableRow([await this.createTextCell('', undefined, { align: 'center', widthWeight: 1 })], { backgroundColor: msg.isRead === false ? new Color('#008200') : Color.darkGray(), height: 10, dismissOnSelect: false }));
                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getFPImage(`ic_message_center_notification_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 10 }),
                                await this.createTextCell(this.getMessageDescByType(msg.messageType), undefined, { align: 'left', widthWeight: 55, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularSystemFont(fontSizes.headline) }),
                                await this.createTextCell(msg.isRead === false ? 'Unread' : 'Read', undefined, { align: 'right', widthWeight: 25, titleColor: msg.isRead === false ? new Color('#008200') : Color.darkGray(), titleFont: Font.regularRoundedSystemFont(fontSizes.headline) }),
                                await this.createTextCell('...', undefined, { align: 'right', widthWeight: 10, dismissOnTap: false, titleColor: Color.purple(), titleFont: Font.mediumRoundedSystemFont(fontSizes.headline) }),
                            ], {
                                height: 40,
                                dismissOnSelect: false,
                                onSelect: async() => {
                                    console.log(`(Messages Table) Message Options button was pressed for ${msg.messageId}`);
                                    await this.FPW.Alerts.showActionPrompt(
                                        'Message Options',
                                        undefined, [{
                                                title: 'Mark as Read',
                                                action: async() => {
                                                    console.log(`(Messages Table) Marking Message with ID: ${msg.messageId} as Read...`);
                                                    if (await this.FPW.FordAPI.markMultipleUserMessagesRead([msg.messageId])) {
                                                        console.log(`(Messages Table) Message (${msg.messageId}) marked read successfully`);
                                                        this.FPW.Alerts.showAlert('Message marked read successfully', 'Message List will reload after data is refeshed');
                                                        await this.createMessagesPage(await this.FPW.FordAPI.fetchVehicleData(false), unreadOnly, true);
                                                        this.createMainPage(true);
                                                    }
                                                },
                                                destructive: false,
                                                show: true,
                                            },
                                            {
                                                title: 'Delete Message',
                                                action: async() => {
                                                    console.log(`(Messages Table) Delete Message ${msg.messageId} was pressed`);
                                                    let ok = await this.FPW.Alerts.showPrompt('Delete Message', 'Are you sure you want to delete this message?', 'Delete', true);
                                                    if (ok) {
                                                        console.log(`(Messages Table) Delete Confirmed for Message ID: ${msg.messageId}`);
                                                        if (await this.FPW.FordAPI.deleteUserMessages([msg.messageId])) {
                                                            console.log(`(Messages Table) Message ${msg.messageId} deleted successfully`);
                                                            this.FPW.Alerts.showAlert('Message deleted successfully', 'Message List will reload after data is refeshed');
                                                            await this.createMessagesPage(await this.FPW.FordAPI.fetchVehicleData(false), unreadOnly, true);
                                                            this.createMainPage(true);
                                                            up;
                                                        } else {
                                                            await this.createMessagesPage(vData, unreadOnly);
                                                        }
                                                    }
                                                },
                                                destructive: true,
                                                show: true,
                                            },
                                        ],
                                        true,
                                        async() => {
                                            await this.createMessagesPage(vData, unreadOnly);
                                        },
                                    );
                                },
                            },
                        ),
                    );

                    // Creates Message Subject Row
                    tableRows.push(
                        await this.createTableRow([await this.createTextCell(msg.messageSubject, timeSubtitle, { align: 'left', widthWeight: 100, titleColor: this.FPW.colorMap.normalText, titleFont: Font.mediumSystemFont(fontSizes.headline), subtitleColor: Color.lightGray(), subtitleFont: Font.regularSystemFont(fontSizes.body) })], {
                            height: 44,
                            dismissOnSelect: false,
                        }),
                    );

                    // Creates Message Subject and Body Row
                    tableRows.push(
                        await this.createTableRow([await this.createTextCell(msg.messageBody, undefined, { align: 'left', widthWeight: 100, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularSystemFont(fontSizes.body2) })], {
                            height: this.getRowHeightByTxtLength(msg.messageBody) + 10,
                            dismissOnSelect: false,
                        }),
                    );
                }
            } else {
                tableRows.push(
                    await this.createTableRow(
                        [
                            await this.createTextCell('', undefined, { align: 'left', widthWeight: 20 }),
                            await this.createTextCell(`${msgs.length} Messages(s)`, undefined, { align: 'center', widthWeight: 60, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title2) }),
                            await this.createTextCell('', undefined, { align: 'right', widthWeight: 20 }),
                        ], { height: 44, dismissOnSelect: false },
                    ),
                );
                tableRows.push(await this.createTableRow([await this.createTextCell('', undefined, { align: 'center', widthWeight: 1 })], { backgroundColor: Color.darkGray(), height: 10, dismissOnSelect: false }));
                tableRows.push(await this.createTableRow([await this.createTextCell(this.FPW.textMap().appMessages[unreadOnly ? 'noUnreadMessages' : 'noMessages'], undefined, { align: 'left', widthWeight: 1, titleColor: this.FPW.colorMap.normalText, titleFont: Font.mediumSystemFont(fontSizes.headline) })], { height: 44, dismissOnSelect: false }));
            }
            await this.generateTableMenu('messages', tableRows, false, false, update);
        } catch (e) {
            this.FPW.logError(`createMessagesPage() error: ${e}`);
        }
    }

    async createAlertsPage(vData) {
        try {
            let vhaAlerts = vData.alerts && vData.alerts.vha && vData.alerts.vha.length ? vData.alerts.vha : [];
            let otaAlerts = vData.alerts && vData.alerts.mmota && vData.alerts.mmota.length ? vData.alerts.mmota : [];

            let tableRows = [];
            if (vhaAlerts.length > 0) {
                tableRows.push(
                    await this.createTableRow([await this.createTextCell(`Vehicle Health Alert(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title3) })], {
                        height: 20,
                        isHeader: true,
                        dismissOnSelect: false,
                    }),
                );
                for (const [i, alert] of vhaAlerts.entries()) {
                    let dtTS = alert.eventTimeStamp ? this.FPW.convertFordDtToLocal(alert.eventTimeStamp) : undefined;
                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 7 }),
                                await this.createTextCell(alert.activeAlertBody.headline || this.FPW.textMap().errorMessages.noData, dtTS ? this.FPW.timeDifference(dtTS) : '', {
                                    align: 'left',
                                    widthWeight: 93,
                                    titleColor: new Color(this.getAlertColorByCode(alert.colorCode)),
                                    titleFont: Font.mediumSystemFont(fontSizes.headline),
                                    subtitleColor: Color.darkGray(),
                                    subtitleFont: Font.regularSystemFont(fontSizes.body2),
                                }),
                            ], { height: 40, dismissOnSelect: false },
                        ),
                    );
                }
            }

            if (otaAlerts.length > 0) {
                tableRows.push(await this.createTableRow([await this.createTextCell('', undefined, { align: 'center', widthWeight: 100 })], { height: 20, dismissOnSelect: false }));
                tableRows.push(await this.createTableRow([await this.createTextCell(`OTA Update Alerts`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title3) })], { height: 20, isHeader: true, dismissOnSelect: false }));
                for (const [i, alert] of otaAlerts.entries()) {
                    let dtTS = alert.vehicleDate && alert.vehicleTime ? this.FPW.convertFordDtToLocal(`${alert.vehicleDate} ${alert.vehicleTime}`) : undefined;
                    let timeDiff = dtTS ? this.FPW.timeDifference(dtTS) : '';
                    let title = alert.alertIdentifier ? alert.alertIdentifier.replace('MMOTA_', '').split('_').join(' ') : undefined;

                    let releaseNotes;
                    if (alert.releaseNotesUrl) {
                        let locale = (await this.FPW.getSettingVal('fpLanguage')) || Device.locale().replace('_', '-');
                        releaseNotes = await this.FPW.getReleaseNotes(alert.releaseNotesUrl, locale);
                    }
                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 7 }),
                                await this.createTextCell(title, timeDiff, { align: 'left', widthWeight: 93, titleColor: new Color(this.getAlertColorByCode(alert.colorCode)), titleFont: Font.mediumSystemFont(fontSizes.headline), subtitleColor: Color.darkGray(), subtitleFont: Font.regularSystemFont(fontSizes.body2) }),
                            ], { height: 44, dismissOnSelect: false },
                        ),
                    );

                    tableRows.push(
                        await this.createTableRow([await this.createTextCell(releaseNotes, undefined, { align: 'left', widthWeight: 100, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularSystemFont(fontSizes.body3) })], {
                            height: this.getRowHeightByTxtLength(releaseNotes) + 20,
                            dismissOnSelect: false,
                        }),
                    );
                }
            }

            await this.generateTableMenu('alerts', tableRows, false, false);
        } catch (e) {
            this.FPW.logError(`createAlertsPage() Error: ${e}`);
        }
    }

    async createRecentChangesPage() {
        const titleBgColor = darkMode ? '#444141' : '#F5F5F5';
        try {
            let tableRows = [];
            let changes = this.FPW.changelogs; //[this.SCRIPT_VERSION];
            if (Object.keys(changes).length > 0) {
                let versions = Object.keys(changes);
                for (const version in versions) {
                    let release = changes[versions[version]];

                    if (release && (release.updated.length || release.added.length || release.removed.length || release.fixed.length)) {
                        // let verTs = new Date(Date.parse(this.SCRIPT_TS));
                        tableRows.push(
                            await this.createTableRow(
                                [
                                    await this.createTextCell(`Release Notes`, `v${versions[version]}`, {
                                        align: 'center',
                                        widthWeight: 100,
                                        dismissOnTap: false,
                                        titleColor: this.FPW.colorMap.normalText,
                                        titleFont: Font.regularRoundedSystemFont(fontSizes.title3),
                                        subTitleFont: Font.mediumRoundedSystemFont(fontSizes.headline2),
                                        subTitleColor: this.FPW.colorMap.normalText,
                                    }),
                                ], {
                                    height: 50,
                                    isHeader: true,
                                    dismissOnSelect: false,
                                    backgroundColor: new Color(titleBgColor),
                                },
                            ),
                        );
                        for (const [i, type] of['added', 'fixed', 'updated', 'removed'].entries()) {
                            if (release[type].length) {
                                // console.log(`(RecentChanges Table) ${type} changes: ${release[type].length}`);
                                let { name, color } = this.getChangeLabelColorAndNameByType(type);
                                tableRows.push(
                                    await this.createTableRow([await this.createTextCell(`${name}`, undefined, { align: 'left', widthWeight: 100, titleColor: color, titleFont: Font.mediumRoundedSystemFont(fontSizes.headline2) })], {
                                        height: 30,
                                        dismissOnSelect: false,
                                    }),
                                );
                                for (const [index, change] of release[type].entries()) {
                                    // console.log(`(RecentChanges Table) ${type} change: ${change}`);
                                    let rowH = Math.ceil(change.length / 70) * (55 / 2);
                                    tableRows.push(
                                        await this.createTableRow([await this.createTextCell(`\u2022 ${change}`, undefined, { align: 'left', widthWeight: 100, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularSystemFont(fontSizes.body3) })], {
                                            height: rowH < 40 ? 40 : rowH,
                                            dismissOnSelect: false,
                                        }),
                                    );
                                }
                            }
                        }
                    } else {
                        tableRows.push(
                            await this.createTableRow(
                                [
                                    await this.createTextCell(`Release Notes`, `v${versions[version]}`, {
                                        align: 'center',
                                        widthWeight: 100,
                                        dismissOnTap: false,
                                        titleColor: this.FPW.colorMap.normalText,
                                        titleFont: Font.regularRoundedSystemFont(fontSizes.title3),
                                        subTitleFont: Font.mediumRoundedSystemFont(fontSizes.headline2),
                                        subTitleColor: this.FPW.colorMap.normalText,
                                    }),
                                ], {
                                    height: 50,
                                    isHeader: true,
                                    dismissOnSelect: false,
                                    backgroundColor: new Color(titleBgColor),
                                },
                            ),
                        );
                        tableRows.push(await this.createTableRow([await this.createTextCell('No Change info found for the current version...', undefined, { align: 'left', widthWeight: 1, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularSystemFont(fontSizes.body3) })], { height: 44, dismissOnSelect: false }));
                    }
                }
            } else {
                tableRows.push(
                    await this.createTableRow([await this.createTextCell(`Recent Changes`, undefined, { align: 'center', widthWeight: 100, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title3) })], {
                        height: 50,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );
                tableRows.push(await this.createTableRow([await this.createTextCell('No Change info found for the current version...', undefined, { align: 'left', widthWeight: 1, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularSystemFont(fontSizes.body3) })], { height: 44, dismissOnSelect: false }));
            }

            await this.generateTableMenu('recentChanges', tableRows, false, false);
        } catch (error) {
            await this.FPW.logError(`(RecentChanges Table) ${error}`);
        }
    }

    async createRecallPage(vData) {
        try {
            let recalls = vData.recallInfo && vData.recallInfo.length && vData.recallInfo[0].recalls && vData.recallInfo[0].recalls.length > 0 ? vData.recallInfo[0].recalls : [];
            let tableRows = [];

            if (recalls.length > 0) {
                tableRows.push(await this.createTableRow([await this.createTextCell(`Vehicle Recall(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title2) })], { height: 40, isHeader: true, dismissOnSelect: false }));
                for (const [i, recall] of recalls.entries()) {
                    let dtTS = recall.nhtsaInfo && recall.nhtsaInfo.recallDate ? new Date(Date.parse(recall.nhtsaInfo.recallDate)) : undefined;
                    let dateStr = dtTS ? dtTS.toLocaleDateString() : undefined;
                    let timeDiff = dtTS ? this.FPW.timeDifference(dtTS) : '';
                    let timestamp = `${dateStr ? ' - ' + dateStr : ''}${timeDiff ? ' (' + timeDiff + ')' : ''}`;
                    let recallType = recall.type ? `${recall.type}` : '';
                    let recallId = recall.id ? `${recallType.length ? '\n' : ''}Recall ID: ${recall.id}` : '';
                    let titleSub = `${recallType}${recallId}${timestamp}`;

                    // Creates Recall Header Rows
                    tableRows.push(await this.createTableRow([await this.createTextCell('', undefined, { align: 'center', widthWeight: 1 })], { backgroundColor: new Color('#E96C00'), height: 10, dismissOnSelect: false }));
                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getFPImage(`ic_recall_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 6 }),

                                await this.createTextCell(recall.title, titleSub, {
                                    align: 'left',
                                    widthWeight: 94,
                                    titleColor: this.FPW.colorMap.normalText,
                                    titleFont: Font.mediumSystemFont(fontSizes.headline2),
                                    subtitleColor: this.FPW.colorMap.normalText,
                                    subtitleFont: Font.regularSystemFont(fontSizes.body2),
                                }),
                            ], { height: 50, dismissOnSelect: false },
                        ),
                    );

                    // Creates Recall Safety Description Row
                    if (recall.nhtsaInfo && recall.nhtsaInfo.safetyDescription) {
                        tableRows.push(
                            await this.createTableRow(
                                [
                                    await this.createTextCell('Safety Description', recall.nhtsaInfo.safetyDescription, {
                                        align: 'left',
                                        widthWeight: 100,
                                        titleColor: this.FPW.colorMap.normalText,
                                        titleFont: Font.regularSystemFont(fontSizes.headline2),
                                        subtitleColor: Color.lightGray(),
                                        subtitleFont: Font.regularSystemFont(fontSizes.body2),
                                    }),
                                ], {
                                    height: this.getRowHeightByTxtLength(recall.nhtsaInfo.safetyDescription),
                                    dismissOnSelect: false,
                                },
                            ),
                        );
                    }
                    // Creates Recall Remedy Program Row
                    if (recall.nhtsaInfo && recall.nhtsaInfo.remedyProgram) {
                        tableRows.push(
                            await this.createTableRow(
                                [await this.createTextCell('Remedy Program', recall.nhtsaInfo.remedyProgram, { align: 'left', widthWeight: 100, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularSystemFont(fontSizes.headline2), subtitleColor: Color.lightGray(), subtitleFont: Font.regularSystemFont(fontSizes.body2) })], {
                                    height: this.getRowHeightByTxtLength(recall.nhtsaInfo.remedyProgram),
                                    dismissOnSelect: false,
                                },
                            ),
                        );
                    }
                    // Creates Recall Manufacturer Notes Row
                    if (recall.nhtsaInfo && recall.nhtsaInfo.manufacturerNotes) {
                        tableRows.push(
                            await this.createTableRow(
                                [
                                    await this.createTextCell('Manufacturer Notes', recall.nhtsaInfo.manufacturerNotes, {
                                        align: 'left',
                                        widthWeight: 100,
                                        titleColor: this.FPW.colorMap.normalText,
                                        titleFont: Font.regularSystemFont(fontSizes.headline2),
                                        subtitleColor: Color.lightGray(),
                                        subtitleFont: Font.regularSystemFont(fontSizes.body2),
                                    }),
                                ], {
                                    height: this.getRowHeightByTxtLength(recall.nhtsaInfo.manufacturerNotes),
                                    dismissOnSelect: false,
                                },
                            ),
                        );
                    }
                    // Creates a blank row
                    tableRows.push(await this.createTableRow([await this.createTextCell('', undefined, { align: 'left', widthWeight: 30 })]));
                }
            } else {
                tableRows.push(
                    await this.createTableRow(
                        [
                            await this.createTextCell('', undefined, { align: 'left', widthWeight: 20 }),
                            await this.createTextCell(`${recalls.length} Recalls(s)`, undefined, { align: 'center', widthWeight: 60, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title2) }),
                            await this.createTextCell('', undefined, { align: 'right', widthWeight: 20 }),
                        ], { height: 44, dismissOnSelect: false },
                    ),
                );

                tableRows.push(await this.createTableRow([await this.createTextCell(this.FPW.textMap().appMessages.noRecalls, undefined, { align: 'left', widthWeight: 1, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularSystemFont(fontSizes.body2) })], { height: 44, dismissOnSelect: false }));
            }

            await this.generateTableMenu('recalls', tableRows, false, false);
        } catch (err) {
            this.FPW.logError(`createRecallPage() Error: ${err}`);
        }
    }

    async createWidgetStylePage() {
        try {
            let widgetStyle = await this.FPW.getWidgetStyle();
            // console.log(`(Widget Style Selector) Current widget style: ${widgetStyle} | Size: ${size}`);
            let tableRows = [];
            let systemMode = this.FPW.darkMode ? 'Dark' : 'Light';
            tableRows.push(
                await this.createTableRow(
                    [
                        await this.createTextCell(`Default Widget Style`, `This page shows an example of the different sizes, types and colors\nTap on type to set it as the default for any widgets used. \nYou can manually set each widget using the edit widget from the homescreen and defining the necessary parameter.`, {
                            align: 'center',
                            widthWeight: 1,
                            dismissOnTap: false,
                            titleColor: this.FPW.colorMap.normalText,
                            titleFont: Font.regularRoundedSystemFont(fontSizes.title1),
                            subtitleColor: Color.lightGray(),
                            subtitleFont: Font.mediumSystemFont(fontSizes.body2),
                        }),
                    ], {
                        height: 100,
                        dismissOnSelect: false,
                    },
                ),
            );
            for (const [i, size] of['small', 'medium', 'large'].entries()) {
                tableRows.push(
                    await this.createTableRow([await this.createTextCell(`${this.FPW.capitalizeStr(size)}`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title3) })], {
                        height: 30,
                        isHeader: true,
                        dismissOnSelect: false,
                    }),
                );
                for (const [i, style] of['simple', 'detailed'].entries()) {
                    if (!(size === 'large' && style === 'simple')) {
                        let h = 150;
                        switch (size) {
                            case 'small':
                                h = 150;
                                break;
                            case 'medium':
                                h = 150;
                                break;
                            case 'large':
                                h = 300;
                                break;
                        }
                        tableRows.push(
                            await this.createTableRow(
                                [
                                    await this.createTextCell(`${this.FPW.capitalizeStr(style)}`, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.mediumSystemFont(fontSizes.headline2) }),
                                    await this.createImageCell(await this.FPW.Files.getImage(`${size}${this.FPW.capitalizeStr(style)}Light.png`), { align: 'center', widthWeight: 60 }),
                                    await this.createTextCell(``, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false }),
                                ], {
                                    height: h,
                                    dismissOnSelect: true,
                                    backgroundColor: widgetStyle === style ? Color.lightGray() : undefined,
                                    onSelect: async() => {
                                        console.log(`Setting WidgetStyle to ${style}`);
                                        await this.FPW.setWidgetStyle(style);
                                        this.widgetStyleSelector(size);
                                    },
                                },
                            ),
                        );
                    }
                    // }
                }
                tableRows.push(
                    await this.createTableRow([await this.createTextCell(``, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false })], {
                        height: 30,
                        dismissOnSelect: false,
                    }),
                );
            }

            await this.generateTableMenu('widgetStyles', tableRows, false, false);
        } catch (error) {
            console.error(`createWidgetStylePage() Error: ${error}`);
        }
    }

    async createVehicleImagesPage() {
        try {
            const vData = await this.FPW.FordAPI.fetchVehicleData(true);
            // console.log(`(Widget Style Selector) Current widget style: ${widgetStyle} | Size: ${size}`);
            let tableRows = [];
            tableRows.push(
                await this.createTableRow(
                    [
                        await this.createTextCell(`Available Vehicle Images`, `This page shows any of the images available for your VIN number.\n\nTapping on an image will present the Files app to save the image.`, {
                            align: 'center',
                            widthWeight: 1,
                            dismissOnTap: false,
                            titleColor: this.FPW.colorMap.normalText,
                            titleFont: Font.regularRoundedSystemFont(fontSizes.title1),
                            subtitleColor: Color.lightGray(),
                            subtitleFont: Font.mediumSystemFont(fontSizes.body2),
                        }),
                    ], {
                        height: 50,
                        dismissOnSelect: false,
                    },
                ),
            );
            for (const [i, angle] of[1, 2, 3, 4, 5].entries()) {
                const vehicleImg = await this.FPW.Files.getVehicleImage(vData.info.vehicle.modelYear, false, angle, false, true);
                tableRows.push(
                    await this.createTableRow(
                        [
                            await this.createTextCell(`Angle ${angle}`, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.mediumSystemFont(fontSizes.headline2) }),
                            await this.createImageCell(vehicleImg, { align: 'center', widthWeight: 60 }),
                            await this.createTextCell(``, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false }),
                        ], {
                            height: 150,
                            dismissOnSelect: false,
                            onSelect: async() => {
                                console.log('(Advanced Info) Vehicle Data was pressed');
                                this.FPW.Menus.imageExportMenu(vehicleImg, `vehicle_image_angle_${angle}.png`);
                            },
                        },
                    ),
                );
            }

            await this.generateTableMenu('vehicleImages', tableRows, false, false);
        } catch (error) {
            console.error(`createVehicleImagesPage() Error: ${error}`);
        }
    }

    async createAdvancedInfoPage() {
        const titleBgColor = darkMode ? '#444141' : '#F5F5F5';
        const headerColor = '#13233F';
        try {
            let tableRows = [];
            const vData = await this.FPW.FordAPI.fetchVehicleData(true);
            const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
            tableRows.push(
                await this.createTableRow(
                    [
                        await this.createTextCell('', undefined, { align: 'left', widthWeight: 25 }),

                        await this.createTextCell('Advanced Info', undefined, {
                            align: 'center',
                            widthWeight: 50,
                            dismissOnTap: false,
                            titleColor: this.FPW.colorMap.normalText,
                            // subtitleColor: Color.lightGray(),
                            titleFont: Font.boldRoundedSystemFont(fontSizes.title3),
                            // subtitleFont: Font.thinSystemFont(fontSizes.footnote),
                        }),
                        await this.createButtonCell('Diagnostics', {
                            align: 'right',
                            widthWeight: 25,
                            dismissOnTap: false,
                            onTap: async() => {
                                console.log(`(Dashboard) Menu Button was pressed`);
                                this.FPW.Menus.menuBuilderByType('diagnostics');
                            },
                        }),
                    ], {
                        height: 50,
                        isHeader: true,
                        dismissOnSelect: false,
                    },
                ),
            );

            if (vData !== undefined) {
                // console.log(JSON.stringify(vData, null, 2));
                // console.log(`Sync: ${Object.keys(vData.syncInfo).length}`);

                if (vData['syncInfo'] && Object.keys(vData['syncInfo']).length && vData['syncInfo'].syncVersion) {
                    tableRows.push(
                        await this.createTableRow([await this.createTextCell('SYNC Info', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.headline) })], {
                            height: 25,
                            isHeader: true,
                            dismissOnSelect: false,
                            backgroundColor: new Color(titleBgColor),
                        }),
                    );

                    tableRows.push(
                        await this.createTableRow(
                            [
                                await this.createImageCell(await this.FPW.Files.getImage(`info_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.createTextCell(`Version: ${vData.syncInfo.syncVersion}`, `Last Updated: ${vData.syncInfo.lastUpdatedDate}`, {
                                    align: 'left',
                                    widthWeight: 93,
                                    titleColor: this.FPW.colorMap.normalText,
                                    titleFont: Font.semiboldSystemFont(fontSizes.subheadline),
                                    subtitleColor: this.FPW.colorMap.normalText,
                                    subtitleFont: Font.regularSystemFont(11),
                                }),
                            ], {
                                height: 60,
                                dismissOnSelect: false,
                            },
                        ),
                    );
                }
                tableRows.push(
                    await this.createTableRow([await this.createTextCell('Vehicle Data Info', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.headline) })], {
                        height: 25,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );
                tableRows.push(
                    await this.createTableRow(
                        [
                            await this.createImageCell(await this.FPW.Files.getImage(`notepad_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await this.createTextCell(`View All Widget Data`, 'Tap to view', {
                                align: 'left',
                                widthWeight: 93,
                                titleColor: this.FPW.colorMap.normalText,
                                titleFont: Font.semiboldSystemFont(fontSizes.subheadline),
                                subtitleColor: this.FPW.colorMap.normalText,
                                subtitleFont: Font.regularSystemFont(11),
                            }),
                        ], {
                            height: 60,
                            dismissOnSelect: false,
                            onSelect: async() => {
                                console.log('(Advanced Info) Vehicle Data was pressed');
                                await this.showDataWebView('Vehicle Data Page', 'Raw Data', vData, 'vehicleData');
                                // await this.showDataWebView('Vehicle Data Output', 'All Vehicle Data Collected', vData);
                            },
                        },
                    ),
                );
                tableRows.push(
                    await this.createTableRow([await this.createTextCell('Over-The-Air Update Info', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.headline) })], {
                        height: 25,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );
                tableRows.push(
                    await this.createTableRow(
                        [
                            await this.createImageCell(await this.FPW.Files.getImage(`ota_info_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await this.createTextCell(`View OTA Update Info`, 'Tap to view', {
                                align: 'left',
                                widthWeight: 93,
                                titleColor: this.FPW.colorMap.normalText,
                                titleFont: Font.semiboldSystemFont(fontSizes.subheadline),
                                subtitleColor: this.FPW.colorMap.normalText,
                                subtitleFont: Font.regularSystemFont(11),
                            }),
                        ], {
                            height: 60,
                            dismissOnSelect: false,
                            onSelect: async() => {
                                console.log('(Advanced Info) OTA Info was pressed');
                                let data = await this.FPW.FordAPI.getVehicleOtaInfo();
                                await this.showDataWebView('OTA Info Page', 'OTA Raw Data', data, 'OTA');
                            },
                        },
                    ),
                );

                tableRows.push(
                    await this.createTableRow([await this.createTextCell('Vehicle Module Info', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.headline) })], {
                        height: 25,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );

                tableRows.push(
                    await this.createTableRow(
                        [
                            await this.createImageCell(await this.FPW.Files.getImage(`module_info_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await this.createTextCell(`View Module Info`, 'Tap to view', {
                                align: 'left',
                                widthWeight: 93,
                                titleColor: this.FPW.colorMap.normalText,
                                titleFont: Font.semiboldSystemFont(fontSizes.subheadline),
                                subtitleColor: this.FPW.colorMap.normalText,
                                subtitleFont: Font.regularSystemFont(11),
                            }),
                        ], {
                            height: 60,
                            dismissOnSelect: false,
                            onSelect: async() => {
                                console.log('(Advanced Info) AsBuilt was pressed');
                                await this.createAsBuiltPage();
                            },
                        },
                    ),
                );

                tableRows.push(
                    await this.createTableRow([await this.createTextCell('Vehicle Image Viewer', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.headline) })], {
                        height: 25,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );
                tableRows.push(
                    await this.createTableRow(
                        [
                            await this.createImageCell(await this.FPW.Files.getImage(`view_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await this.createTextCell(`View Vehicle Images`, 'Tap to view', {
                                align: 'left',
                                widthWeight: 93,
                                titleColor: this.FPW.colorMap.normalText,
                                titleFont: Font.semiboldSystemFont(fontSizes.subheadline),
                                subtitleColor: this.FPW.colorMap.normalText,
                                subtitleFont: Font.regularSystemFont(11),
                            }),
                        ], {
                            height: 60,
                            dismissOnSelect: false,
                            onSelect: async() => {
                                console.log('(Advanced Info) View Vehicle Images was pressed');
                                await this.createVehicleImagesPage();
                            },
                        },
                    ),
                );
            }

            await this.generateTableMenu('advancedInfo', tableRows, true, false);
        } catch (error) {
            await this.FPW.logError(`(createAdvancedInfoPage Table) ${error}`);
        }
    }

    async createCaptchaPage(img) {
        try {
            let tableRows = [];
            tableRows.push(
                await this.createTableRow(
                    [
                        await this.createTextCell(`AsBuilt Captcha Image`, `Remember this code\nOnce you close this page you will see a prompt to enter the code to download the data`, {
                            align: 'center',
                            widthWeight: 1,
                            dismissOnTap: false,
                            titleColor: this.FPW.colorMap.normalText,
                            titleFont: Font.regularRoundedSystemFont(fontSizes.title1),
                            subtitleColor: Color.lightGray(),
                            subtitleFont: Font.mediumSystemFont(fontSizes.headline2),
                        }),
                    ], {
                        height: 70,
                        dismissOnSelect: false,
                    },
                ),
            );

            tableRows.push(
                await this.createTableRow([await this.createTextCell(``, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false }), await this.createImageCell(img, { align: 'center', widthWeight: 60 }), await this.createTextCell(``, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false })], {
                    height: 150,
                    dismissOnSelect: false,
                }),
            );

            await this.generateTableMenu('captchaPage', tableRows, false, false);
        } catch (error) {
            console.error(`createCaptchaPage() Error: ${error}`);
        }
    }

    async createAsBuiltPage(update = false) {
        const titleBgColor = darkMode ? '#444141' : '#F5F5F5';
        const headerColor = Color.darkGray(); //new Color('#13233F');
        try {
            const vin = await this.FPW.getSettingVal('fpVin');
            let tableRows = [];

            const asbInfo = await this.FPW.Files.getFileInfo(`${vin}.json`, true);
            const lastModDt = asbInfo && asbInfo.modified ? new Date(asbInfo.modified).toLocaleString() : undefined;

            // console.log(`(createAsBuiltPage) asbInfo: ${JSON.stringify(asbInfo)}`);
            console.log(`AsBuilt File Modified: ${lastModDt}`);
            tableRows.push(
                await this.createTableRow(
                    [
                        await this.createButtonCell(lastModDt ? 'Delete Data' : '', {
                            align: 'left',
                            widthWeight: 25,
                            dismissOnTap: false,
                            onTap: async() => {
                                console.log(`(Dashboard) Remove Module Data Button was pressed`);
                                await this.FPW.Files.removeLocalData(`${vin}.json`, true);
                                // await this.FPW.Alerts.showAlert('Removed Successfully', 'Local AsBuilt File Removed');
                                this.createAsBuiltPage(true);
                            },
                        }),
                        await this.createTextCell('Vehicle Module Info', undefined, {
                            align: 'center',
                            widthWeight: 50,
                            dismissOnTap: false,
                            titleColor: this.FPW.colorMap.text.dark,
                            subtitleColor: Color.lightGray(),
                            titleFont: Font.boldRoundedSystemFont(18),
                            subtitleFont: Font.thinSystemFont(fontSizes.footnote),
                        }),
                        await this.createButtonCell(lastModDt ? 'Reload Data' : 'Get Data', {
                            align: 'right',
                            widthWeight: 25,
                            dismissOnTap: false,
                            onTap: async() => {
                                console.log(`(Dashboard) Get Module Data Button was pressed`);
                                await this.FPW.AsBuilt.getAsBuiltFile(vin);
                                this.createAsBuiltPage(true);
                            },
                        }),
                    ], {
                        backgroundColor: headerColor,
                        height: 50,
                        isHeader: true,
                        dismissOnSelect: false,
                    },
                ),
            );

            tableRows.push(
                await this.createTableRow(
                    [
                        await this.createTextCell('', undefined, { align: 'left', widthWeight: 25 }),
                        await this.createTextCell(lastModDt ? 'Last Downloaded' : '', lastModDt ? lastModDt : undefined, {
                            align: 'center',
                            widthWeight: 50,
                            dismissOnTap: false,
                            titleColor: this.FPW.colorMap.text.dark,
                            subtitleColor: this.FPW.colorMap.text.dark,
                            titleFont: Font.boldRoundedSystemFont(fontSizes.subheadline),
                            subtitleFont: Font.thinSystemFont(fontSizes.body),
                        }),
                        await this.createTextCell('', undefined, { align: 'left', widthWeight: 25 }),
                    ], {
                        backgroundColor: headerColor,
                        height: 50,
                        isHeader: true,
                        dismissOnSelect: false,
                    },
                ),
            );

            let asbData = await this.FPW.Files.readJsonFile('Vehicle Modules Info', `${vin}`, true);
            if (asbData) {
                const modCount = asbData && asbData.AS_BUILT_DATA && asbData.AS_BUILT_DATA.VEHICLE && asbData.AS_BUILT_DATA.VEHICLE.NODEID ? asbData.AS_BUILT_DATA.VEHICLE.NODEID.length : 0;
                // console.log(JSON.stringify(asbData.AS_BUILT_DATA.VEHICLE.NODEID));
                tableRows.push(
                    await this.createTableRow([await this.createTextCell(`Vehicle Modules (${modCount})`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.headline) })], {
                        height: 25,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );
                if (modCount > 0) {
                    async function groupAsbuiltDataByModule(data) {
                        const grpData = {};
                        for (const i in data) {
                            const addr = data[i]['@LABEL'].slice(0, 3);
                            if (!grpData[addr]) {
                                grpData[addr] = [];
                            }
                            grpData[addr].push(data[i]);
                        }
                        return grpData;
                    }
                    const asBuiltByModule = await groupAsbuiltDataByModule(asbData.AS_BUILT_DATA.VEHICLE.BCE_MODULE.DATA);
                    console.log(`asBuiltByModule: ${Object.keys(asBuiltByModule).length}`);
                    for (const [i, module] of asbData.AS_BUILT_DATA.VEHICLE.NODEID.entries()) {
                        // console.log(module);
                        const modAddr = module['#text'];
                        const mData = {
                            addr: modAddr,
                            updatable: module && modAddr ? this.FPW.AsBuilt.moduleInfo(modAddr).updatable : false,
                            label: module && modAddr ? this.FPW.AsBuilt.moduleInfo(modAddr).desc : 'Unknown Module',
                            nodeData: module,
                            asbuiltData: asBuiltByModule[modAddr] || undefined,
                        };
                        // console.log(`Module (${mData.addr}) | ${mData.info.desc}`);
                        tableRows.push(
                            await this.createTableRow(
                                [
                                    await this.createTextCell(`${mData.label}`, `Tap to view`, {
                                        align: 'left',
                                        widthWeight: 100,
                                        titleColor: this.FPW.colorMap.normalText,
                                        titleFont: Font.semiboldSystemFont(fontSizes.subheadline),
                                        subtitleColor: this.FPW.colorMap.normalText,
                                        subtitleFont: Font.regularSystemFont(11),
                                    }),
                                ], {
                                    height: 50,
                                    dismissOnSelect: false,
                                    onSelect: async() => {
                                        console.log(`(AsBuilt Info) View Module (${mData.label}) was pressed`);
                                        await this.createModuleInfoPage(mData);
                                    },
                                },
                            ),
                        );
                    }
                }
            } else {
                tableRows.push(
                    await this.createTableRow(
                        [
                            await this.createTextCell('No Module Data Found', 'This info needs to be downloaded from Ford before it can be displayed\nPress the Get Data Button to start the download process.', {
                                align: 'left',
                                widthWeight: 1,
                                titleColor: this.FPW.colorMap.normalText,
                                titleFont: Font.systemFont(fontSizes.headline2),
                                subtitleColor: this.FPW.colorMap.lightText,
                                subtitleFont: Font.regularSystemFont(fontSizes.subheadline),
                            }),
                        ], { height: 80, dismissOnSelect: false },
                    ),
                    await this.createTableRow(
                        [
                            await this.createTextCell('Important Notice', "Please don't abuse this tool by reloading your AsBuilt data from Ford dozens of times a day.", {
                                align: 'left',
                                widthWeight: 1,
                                titleColor: this.FPW.colorMap.normalText,
                                titleFont: Font.systemFont(fontSizes.headline2),
                                subtitleColor: this.FPW.colorMap.lightText,
                                subtitleFont: Font.regularSystemFont(fontSizes.subheadline),
                            }),
                        ], { height: 80, dismissOnSelect: false },
                    ),
                );
            }

            await this.generateTableMenu('asBuiltPage', tableRows, true, false, update);
        } catch (error) {
            console.error(`createAsBuiltPage() Error: ${error}`);
        }
    }

    async createModuleInfoPage(moduleData = undefined) {
        const titleBgColor = darkMode ? '#444141' : '#F5F5F5';
        const headerColor = Color.darkGray(); //new Color('#13233F');
        try {
            let tableRows = [];
            tableRows.push(
                await this.createTableRow(
                    [
                        await this.createTextCell(`${moduleData.label}`, `Network Address: ${moduleData.addr}`, {
                            align: 'center',
                            widthWeight: 100,
                            dismissOnTap: false,
                            titleColor: this.FPW.colorMap.text.dark,
                            subtitleColor: this.FPW.colorMap.text.dark,
                            titleFont: Font.boldRoundedSystemFont(fontSizes.title3),
                            subtitleFont: Font.thinSystemFont(fontSizes.footnote),
                        }),
                    ], {
                        backgroundColor: headerColor,
                        height: 60,
                        isHeader: true,
                        dismissOnSelect: false,
                    },
                ),
            );

            if (moduleData && moduleData.nodeData) {
                tableRows.push(
                    await this.createTableRow([await this.createTextCell(`Module Info`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.headline) })], {
                        height: 25,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );
                // console.log(`NodeData: ${Object.keys(moduleData.nodeData).length}`);
                if (Object.keys(moduleData.nodeData).length > 0) {
                    for (const i in moduleData.nodeData) {
                        if (!['#text', 'F106'].includes(i)) {
                            // console.log(`Node: ${i}`);
                            const nodeDesc = this.FPW.AsBuilt.nodeDesc[i] || 'Unknown Node';

                            tableRows.push(
                                await this.createTableRow(
                                    [
                                        await this.createTextCell(`(${i}): ${nodeDesc}`, `${moduleData.nodeData[i]}`, {
                                            align: 'left',
                                            widthWeight: 100,
                                            titleColor: this.FPW.colorMap.normalText,
                                            titleFont: Font.semiboldSystemFont(fontSizes.headline),
                                            subtitleColor: this.FPW.colorMap.normalText,
                                            subtitleFont: Font.regularSystemFont(fontSizes.subheadline),
                                        }),
                                    ], {
                                        height: 60,
                                        dismissOnSelect: false,
                                    },
                                ),
                            );
                        }
                    }
                }
            } else {
                tableRows.push(await this.createTableRow([await this.createTextCell('No Module Node Data Found... Press the Get AsBuilt Button to refresh the data', undefined, { align: 'left', widthWeight: 1, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularSystemFont(fontSizes.body2) })], { height: 44, dismissOnSelect: false }));
            }

            if (moduleData && moduleData.asbuiltData) {
                tableRows.push(
                    await this.createTableRow([await this.createTextCell(`AsBuilt Data`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.headline) })], {
                        height: 25,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );
                // console.log(`AbData: ${Object.keys(moduleData.asbuiltData).length}`);
                if (Object.keys(moduleData.asbuiltData).length > 0) {
                    for (const i in moduleData.asbuiltData) {
                        // console.log(`${i}: ${JSON.stringify(moduleData.asbuiltData[i])}`);
                        let blks = moduleData.asbuiltData[i].CODE.filter((c) => c !== null);
                        // console.log(`blks: ${JSON.stringify(blks)}`);
                        const blkCnt = blks.length;
                        // console.log(`BlkCnt: ${blkCnt}`);
                        const firstColWidth = 25;
                        let columns = [
                            await this.createTextCell(`${moduleData.asbuiltData[i]['@LABEL']}`, undefined, {
                                align: 'left',
                                widthWeight: firstColWidth,
                                titleColor: this.FPW.colorMap.normalText,
                                titleFont: Font.semiboldSystemFont(fontSizes.headline),
                            }),
                        ];

                        if (blkCnt > 0) {
                            let rowWidth = firstColWidth;
                            for (const [i, blk] of blks.entries()) {
                                rowWidth = rowWidth + 15;
                                columns.push(
                                    await this.createTextCell(`Block ${i + 1}`, blk, {
                                        align: 'center',
                                        widthWeight: 15,
                                        titleColor: this.FPW.colorMap.normalText,
                                        titleFont: Font.systemFont(fontSizes.body2),
                                        subtitleColor: this.FPW.colorMap.normalText,
                                        subtitleFont: Font.regularSystemFont(fontSizes.headline),
                                    }),
                                );
                            }
                            if (rowWidth < 100) {
                                columns.push(await this.createTextCell('', undefined, { align: 'center', widthWeight: 100 - rowWidth }));
                            }
                        }

                        tableRows.push(
                            await this.createTableRow(columns, {
                                height: 60,
                                dismissOnSelect: false,
                            }),
                        );
                    }
                }
            } else {
                console.log(`No AsBuilt Data for Module: ${moduleData.label} | ${moduleData.addr}`);
            }

            await this.generateTableMenu('moduleInfoPage', tableRows, true, false);
        } catch (error) {
            console.error(`createModuleInfoPage() Error: ${error}`);
        }
    }
};
//This module was downloaded using FordWidgetTool.

module.exports = class FPW_Tables_MainPage {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.Kc = FPW.Kc;
        this.FordRequests = FPW.FordRequests;
        this.FordCommands = FPW.FordCommands;
        this.Alerts = FPW.Alerts;
        this.Utils = FPW.Utils;
        this.Timers = FPW.Timers;
        this.Tables = FPW.Tables;
    }

    async createMainPage(update = false) {
        const vData = await this.FordRequests.fetchVehicleData(true);
        const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
        const isEV = vData.evVehicle === true;
        const pressureUnits = await this.Kc.getSettingVal('fpPressureUnits');
        const distanceMultiplier = (await this.Kc.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
        const distanceUnit = (await this.Kc.useMetricUnits()) ? 'km' : 'mi'; // unit of length
        const tireUnit = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
        const dtePostfix = isEV ? 'Range' : 'to E';

        let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
        let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;
        let dteString = dteValue ? `${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.FPW.textMap().errorMessages.noData;

        let ignStatus = '';
        if (vData.remoteStartStatus && vData.remoteStartStatus.running ? true : false) {
            ignStatus = `Remote Start (ON)` + (vData.remoteStartStatus.runtimeLeft && vData.remoteStartStatus.runtime ? `\n(${vData.remoteStartStatus.runtimeLeft} of ${vData.remoteStartStatus.runtime} minutes remain)` : '');
            createRemoteStartStatusTimer();
        } else {
            this.Timers.stopTimer('remoteStartStatus');
            ignStatus = vData.ignitionStatus !== undefined ? vData.ignitionStatus.charAt(0).toUpperCase() + vData.ignitionStatus.slice(1) : this.FPW.textMap().errorMessages.noData;
        }
        let refreshTime = vData.lastRefreshElapsed ? vData.lastRefreshElapsed : this.FPW.textMap().UIValues.unknown;
        const odometerVal = vData.odometer ? `${Math.round(vData.odometer * distanceMultiplier)} ${distanceUnit}` : this.FPW.textMap().errorMessages.noData;
        const msgs = vData.messages && vData.messages.length ? vData.messages : [];
        const recalls = vData.recallInfo && vData.recallInfo.length && vData.recallInfo[0].recalls && vData.recallInfo[0].recalls.length > 0 ? vData.recallInfo[0].recalls : [];
        const msgsUnread = msgs && msgs.length ? msgs.filter((msg) => msg.isRead === false) : [];
        const //This module was downloaded using FordWidgetTool.

            Color = '#13233F';
        const titleBgColor = darkMode ? '#444141' : '#F5F5F5';

        let tableRows = [];

        try {
            // Header Section - Row 1: vehicle messages, vehicle type, vehicle alerts
            tableRows.push(
                await this.Tables.createTableRow(
                    [
                        await this.Tables.createImageCell(await this.Files.getFPImage(`ic_message_center_notification_dark.png`), { align: 'left', widthWeight: 3 }),
                        await this.Tables.createButtonCell(msgs.length ? `${msgs.length}` : '', {
                            align: 'left',
                            widthWeight: 27,
                            onTap: async() => {
                                console.log('(Dashboard) View Messages was pressed');
                                await this.Tables.MessagePage.createMessagesPage(vData, false);
                            },
                        }),

                        await this.Tables.createTextCell(vData.info.vehicle.vehicleType, odometerVal, { align: 'center', widthWeight: 40, dismissOnTap: false, titleColor: new Color(this.FPW.colorMap.textWhite), subtitleColor: Color.lightGray(), titleFont: Font.title3(), subtitleFont: Font.footnote() }),
                        await this.Tables.createButtonCell('Menu', {
                            align: 'right',
                            widthWeight: 30,
                            dismissOnTap: false,
                            onTap: async() => {
                                console.log(`(Dashboard) Menu Button was pressed`);
                                this.Tables.menuBuilderByType('main');
                            },
                        }),
                    ], {
                        backgroundColor: new Color(Color), //This module was downloaded using FordWidgetTool.
                        height: 40,
                        isHeader: true,
                        dismissOnSelect: false,
                    },
                ),
            );

            // Header Section - Row 2: Shows tire pressure label and unit
            tableRows.push(
                await this.Tables.createTableRow(
                    [
                        await this.Tables.createTextCell('', undefined, { align: 'center', widthWeight: 30 }),
                        await this.Tables.createTextCell(undefined, `Tires: (${tireUnit})`, { align: 'center', widthWeight: 40, subtitleColor: new Color(this.FPW.colorMap.textWhite), subtitleFont: Font.subheadline() }),
                        await this.Tables.createTextCell('', undefined, { align: 'center', widthWeight: 30 }),
                    ], {
                        backgroundColor: new Color(Color), //This module was downloaded using FordWidgetTool.
                        height: 20,
                        dismissOnSelect: false,
                    },
                ),
            );

            // Header Section - Row 3: Displays the Vehicle Image in center and doors on the left and windows on the right
            const openDoors = this.Widgets.getOpenItems(vData.statusDoors); //['LF', 'RR', 'HD'];
            const openWindows = this.Widgets.getOpenItems(vData.statusWindows); //['LF', 'RR', 'HD'];
            // console.log(`openDoors: ${JSON.stringify(openDoors)}`);
            // console.log(`openWindows: ${JSON.stringify(openWindows)}`);
            tableRows.push(
                await this.Tables.createTableRow(
                    [
                        // Door Status Cells
                        await this.Tables.createImageCell(await this.Files.getImage(`door_dark_menu.png`), { align: 'center', widthWeight: 5 }),
                        await this.Tables.createTextCell('Doors', openDoors.length ? openDoors.join(', ') : 'Closed', {
                            align: 'left',
                            widthWeight: 25,
                            dismissOnTap: false,
                            titleColor: new Color(this.FPW.colorMap.textWhite),
                            titleFont: Font.headline(),
                            subtitleColor: new Color(openDoors.length ? '#FF5733' : '#5A65C0'),
                            subtitleFont: Font.subheadline(),
                        }),
                        await this.Tables.createTextCell(`LF: ${vData.tirePressure.leftFront}\n\n\n\nRF: ${vData.tirePressure.leftRear}`, undefined, { align: 'right', widthWeight: 10, titleColor: new Color(this.FPW.colorMap.textWhite), titleFont: Font.mediumSystemFont(9) }),
                        await this.Tables.createImageCell(await this.Files.getVehicleImage(vData.info.vehicle.modelYear, false, 1), { align: 'center', widthWeight: 20 }),
                        await this.Tables.createTextCell(`LR: ${vData.tirePressure.rightFront}\n\n\n\nRR: ${vData.tirePressure.rightRear}`, undefined, { align: 'left', widthWeight: 10, titleColor: new Color(this.FPW.colorMap.textWhite), titleFont: Font.mediumSystemFont(9) }),
                        // Window Status Cells
                        await this.Tables.createTextCell('Windows', openWindows.length ? openWindows.join(', ') : 'Closed', {
                            align: 'right',
                            widthWeight: 25,
                            dismissOnTap: false,
                            titleColor: new Color(this.FPW.colorMap.textWhite),
                            titleFont: Font.headline(),
                            subtitleColor: new Color(openWindows.length ? '#FF5733' : '#5A65C0'),
                            subtitleFont: Font.subheadline(),
                        }),
                        await this.Tables.createImageCell(await this.Files.getImage(`window_dark_menu.png`), { align: 'center', widthWeight: 5 }),
                    ], {
                        backgroundColor: new Color(Color), //This module was downloaded using FordWidgetTool.
                        height: 100,
                        cellSpacing: 0,
                        dismissOnSelect: false,
                    },
                ),
            );

            // Header Section - Row 4: Shows fuel/EV battery level and range
            tableRows.push(
                await this.Tables.createTableRow(
                    [
                        await this.Tables.createImageCell(isEV ? await this.Files.getImage(`ev_battery_dark_menu.png`) : await this.Files.getFPImage(`ic_gauge_fuel_dark.png`), { align: 'center', widthWeight: 5 }),
                        await this.Tables.createTextCell(`${isEV ? 'Charge' : 'Fuel'}: ${lvlValue < 0 || lvlValue > 100 ? '--' : lvlValue + '%'}`, dteString, { align: 'left', widthWeight: 45, titleColor: new Color(this.FPW.colorMap.textWhite), titleFont: Font.headline(), subtitleColor: Color.lightGray(), subtitleFont: Font.subheadline() }),
                        await this.Tables.createTextCell('', undefined, { align: 'center', widthWeight: 50 }),
                    ], {
                        backgroundColor: new Color(Color), //This module was downloaded using FordWidgetTool.
                        height: 40,
                        dismissOnSelect: false,
                    },
                ),
            );

            // Header Section - Row 5: Shows vehicle checkin timestamp
            tableRows.push(
                await this.Tables.createTableRow(
                    [
                        // await this.Tables.createTextCell('', undefined, { align: 'center', widthWeight: 20 }),
                        await this.Tables.createTextCell('Last Checkin: ' + refreshTime, undefined, { align: 'center', widthWeight: 100, titleColor: new Color(this.FPW.colorMap.textWhite), titleFont: Font.regularSystemFont(9) }),
                        // await this.Tables.createTextCell('', undefined, { align: 'center', widthWeight: 20 }),
                    ], {
                        backgroundColor: new Color(Color), //This module was downloaded using FordWidgetTool.
                        height: 20,
                        dismissOnSelect: false,
                    },
                ),
            );

            let update = false;
            if (widgetConfig.showTestUIStuff) {
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
                update = true;
            }

            // Script Update Available Row
            if (update || updateAvailable) {
                tableRows.push(
                    await this.Tables.createTableRow(
                        [await this.Tables.createTextCell(`New Widget Update Available (v${LATEST_VERSION})`, 'Tap here to update', { align: 'center', widthWeight: 100, titleColor: new Color('#b605fc'), titleFont: Font.subheadline(), subtitleColor: new Color(this.FPW.colorMap.textColor1), subtitleFont: Font.regularSystemFont(9) })], {
                            height: 40,
                            dismissOnSelect: false,
                            onSelect: async() => {
                                console.log('(Main Menu) Update Widget was pressed');
                                let callback = new CallbackURL('scriptable:///run');
                                callback.addParameter('scriptName', 'FordWidgetTool');
                                callback.open();
                            },
                        },
                    ),
                );
            }

            // Vehicle Recalls Section - Creates rows for each summary recall
            if (recalls && recalls.length) {
                // Creates the Vehicle Recalls Title Row
                tableRows.push(
                    await this.Tables.createTableRow([await this.Tables.createTextCell(`Recall(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.title2() })], {
                        height: 30,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );
                // Creates a single row for each recall in the top 10 of recalls array
                for (const [i, recall] of recalls.entries()) {
                    if (i >= 10) {
                        break;
                    }
                    tableRows.push(
                        await this.Tables.createTableRow(
                            [
                                await this.Tables.createImageCell(await this.Files.getFPImage(`ic_recall_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.Tables.createTextCell(recall.title, recall.type + '\n' + recall.id, { align: 'left', widthWeight: 93, titleColor: new Color('#E96C00'), titleFont: Font.body(), subtitleColor: new Color(this.FPW.colorMap.textColor1), subtitleFont: Font.regularSystemFont(9) }),
                            ], {
                                height: 44,
                                dismissOnSelect: false,
                                cellSpacing: 5,
                                onSelect: async() => {
                                    console.log('(Dashboard) Recall Item row was pressed');
                                    await this.Tables.RecallPage.createRecallPage(vData);
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
                tableRows.push(
                    await this.Tables.createTableRow([await this.Tables.createTextCell(`Vehicle Alert(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.title2() })], {
                        height: 30,
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
                        await this.Tables.createTableRow(
                            [
                                await this.Tables.createImageCell(await this.Files.getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.Tables.createTextCell(alert.alertDescription, this.Tables.getAlertDescByType(alert.alertType), {
                                    align: 'left',
                                    widthWeight: 93,
                                    titleColor: new Color(this.Tables.getAlertColorByCode(alert.colorCode)),
                                    titleFont: Font.body(),
                                    subtitleColor: new Color(this.FPW.colorMap.textColor1),
                                    subtitleFont: Font.regularSystemFont(9),
                                }),
                            ], {
                                height: 44,
                                dismissOnSelect: false,
                                cellSpacing: 5,
                                onSelect: alert.noButton === undefined || alert.noButton === false ?
                                    async() => {
                                        console.log('(Dashboard) Alert Item row was pressed');
                                        // await this.Alerts.showAlert('Alert Item', `Alert Type: ${alert.alertType}`);
                                        await this.Tables.AlertPage.createAlertsPage(vData);
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
                    await this.Tables.createTableRow([await this.Tables.createTextCell('Unread Messages', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.title2() })], {
                        height: 30,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );

                tableRows.push(
                    await this.Tables.createTableRow(
                        [
                            await this.Tables.createImageCell(await this.Files.getFPImage(`ic_message_center_notification_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await this.Tables.createTextCell(`Unread Message${msgsUnread.length > 1 ? 's' : ''}: (${msgsUnread.length})`, undefined, {
                                align: 'left',
                                widthWeight: 76,
                                titleColor: new Color(this.FPW.colorMap.textColor1),
                                titleFont: Font.body(),
                                subtitleColor: new Color(this.FPW.colorMap.textColor1),
                                subtitleFont: Font.regularSystemFont(9),
                            }),
                            await this.Tables.createButtonCell('View', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) View Unread Messages was pressed');
                                    await this.Tables.MessagePage.createMessagesPage(vData, true);
                                },
                            }),
                        ], {
                            height: 44,
                            dismissOnSelect: false,
                            cellSpacing: 5,
                            onSelect: async() => {
                                console.log('(Dashboard) View Unread Messages was pressed');
                                await this.Tables.MessagePage.createMessagesPage(vData, true);
                            },
                        },
                    ),
                );
            }

            // Vehicle Controls Section - Remote Start, Door Locks, and Horn/Lights
            if (caps && caps.length && (caps.includes('DOOR_LOCK_UNLOCK') || caps.includes('REMOTE_START') || caps.includes('REMOTE_PANIC_ALARM'))) {
                // Creates the Status & Remote Controls Header Row
                tableRows.push(
                    await this.Tables.createTableRow([await this.Tables.createTextCell('Remote Controls', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.title2() })], {
                        height: 30,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );

                // Generates the Lock Control Row
                if (caps.includes('DOOR_LOCK_UNLOCK')) {
                    tableRows.push(
                        await this.Tables.createTableRow(
                            [
                                await this.Tables.createImageCell(await this.Files.getFPImage(`${vData.lockStatus === 'LOCKED' ? 'lock_icon' : 'unlock_icon'}_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.Tables.createTextCell('Locks', vData.lockStatus === 'LOCKED' ? 'Locked' : 'Unlocked', {
                                    align: 'left',
                                    widthWeight: 59,
                                    titleColor: new Color(this.FPW.colorMap.textColor1),
                                    subtitleColor: new Color(vData.lockStatus === 'LOCKED' ? '#5A65C0' : '#FF5733'),
                                    titleFont: Font.headline(),
                                    subtitleFont: Font.subheadline(),
                                }),
                                await this.Tables.createButtonCell('Unlock', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Lock was pressed');
                                        if (await this.Alerts.showYesNoPrompt('Locks', 'Are you sure you want to unlock the vehicle?')) {
                                            await this.FordCommands.sendVehicleCmd('unlock');
                                        }
                                    },
                                }),
                                await this.Tables.createButtonCell('Lock', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Lock was pressed');
                                        await this.FordCommands.sendVehicleCmd('lock');
                                    },
                                }),
                            ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                        ),
                    );
                }

                // Generates the Remote Start Control Row
                if (caps.includes('REMOTE_START')) {
                    tableRows.push(
                        await this.Tables.createTableRow(
                            [
                                await this.Tables.createImageCell(await this.Files.getFPImage(`ic_paak_key_settings_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.Tables.createTextCell('Ignition', ignStatus, { align: 'left', widthWeight: 59, titleColor: new Color(this.FPW.colorMap.textColor1), subtitleColor: new Color(ignStatus === 'Off' ? '#5A65C0' : '#FF5733'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),
                                await this.Tables.createButtonCell('Stop', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Stop was pressed');
                                        await this.FordCommands.sendVehicleCmd('stop');
                                    },
                                }),
                                await this.Tables.createButtonCell('Start', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Start was pressed');
                                        if (await this.Alerts.showYesNoPrompt('Remote Start', 'Are you sure you want to start the vehicle?')) {
                                            await this.FordCommands.sendVehicleCmd('start');
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
                        await this.Tables.createTableRow(
                            [
                                await this.Tables.createImageCell(await this.Files.getFPImage(`res_0x7f080088_ic_control_lights_and_horn_active__0_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.Tables.createTextCell('Sound Horn/Lights', undefined, { align: 'left', widthWeight: 76, titleColor: new Color(this.FPW.colorMap.textColor1), subtitleColor: new Color(ignStatus === 'Off' ? '#5A65C0' : '#FF5733'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),

                                await this.Tables.createButtonCell('Start', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Horn/Lights was pressed');
                                        if (await this.Alerts.showYesNoPrompt('Horn/Lights', 'Are you sure you want to sound horn and light ?')) {
                                            await this.FordCommands.sendVehicleCmd('horn_and_lights');
                                        }
                                    },
                                }),
                            ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                        ),
                    );
                }
            }

            // Advanced Controls Section - Zone Lighting, SecuriAlert, Trailer Lights (if available)
            if (caps.includes('ZONE_LIGHTING_FOUR_ZONES') || caps.includes('ZONE_LIGHTING_TWO_ZONES' || caps.includes('GUARD_MODE') || caps.includes('TRAILER_LIGHT'))) {
                // Creates the Advanced Controls Header Text
                tableRows.push(
                    await this.Tables.createTableRow([await this.Tables.createTextCell('Advanced Controls', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.title2() })], {
                        height: 30,
                        isHeader: true,
                        dismissOnSelect: false,
                        backgroundColor: new Color(titleBgColor),
                    }),
                );

                // Generates the SecuriAlert Control Row
                if (caps.includes('GUARD_MODE')) {
                    tableRows.push(
                        await this.Tables.createTableRow(
                            [
                                await this.Tables.createImageCell(await this.Files.getFPImage(`ic_guard_mode_vd_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.Tables.createTextCell('SecuriAlert', vData.alarmStatus, { align: 'left', widthWeight: 59, titleColor: new Color(this.FPW.colorMap.textColor1), subtitleColor: new Color(vData.alarmStatus === 'On' ? '#FF5733' : '#5A65C0'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),
                                await this.Tables.createButtonCell('Enable', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) SecuriAlert Enable was pressed');
                                        await this.FordCommands.sendVehicleCmd('guard_mode_on');
                                    },
                                }),
                                await this.Tables.createButtonCell('Disable', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) SecuriAlert Disable was pressed');
                                        if (await this.Alerts.showYesNoPrompt('SecuriAlert', 'Are you sure you want to disable SecuriAlert?')) {
                                            await this.FordCommands.sendVehicleCmd('guard_mode_off');
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
                        await this.Tables.createTableRow(
                            [
                                await this.Tables.createImageCell(await this.Files.getFPImage(`ic_zone_lighting_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.Tables.createTextCell('Zone Lighting', vData.zoneLightingStatus, { align: 'left', widthWeight: 59, titleColor: new Color(this.FPW.colorMap.textColor1), subtitleColor: new Color(vData.zoneLightingStatus === 'On' ? '#FF5733' : '#5A65C0'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),
                                await this.Tables.createButtonCell('Enable', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Zone Lighting On Button was pressed');
                                        await this.Alerts.showActionPrompt(
                                            'Zone Lighting On Menu',
                                            undefined, [{
                                                    title: 'Front Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Front On was pressed`);
                                                        await this.FordCommands.sendVehicleCmd('zone_lights_front_on');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'Rear Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Rear On was pressed`);
                                                        await this.FordCommands.sendVehicleCmd('zone_lights_rear_on');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'Left Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Left On was pressed`);
                                                        await this.FordCommands.sendVehicleCmd('zone_lights_left_on');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'Right Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Right On was pressed`);
                                                        await this.FordCommands.sendVehicleCmd('zone_lights_right_on');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'All Zones',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone All On was pressed`);
                                                        await this.FordCommands.sendVehicleCmd('zone_lights_all_on');
                                                    },
                                                    destructive: false,
                                                    show: true,
                                                },
                                            ],
                                            true,
                                        );
                                    },
                                }),
                                await this.Tables.createButtonCell('Disable', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Zone Lighting Off Button was pressed');
                                        await this.Alerts.showActionPrompt(
                                            'Zone Lighting Off',
                                            undefined, [{
                                                    title: 'Front Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Front Off was pressed`);
                                                        await this.FordCommands.sendVehicleCmd('zone_lights_front_off');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'Rear Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Rear Off was pressed`);
                                                        await this.FordCommands.sendVehicleCmd('zone_lights_rear_off');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'Left Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Left Off was pressed`);
                                                        await this.FordCommands.sendVehicleCmd('zone_lights_left_off');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'Right Zone',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone Right Off was pressed`);
                                                        await this.FordCommands.sendVehicleCmd('zone_lights_right_off');
                                                    },
                                                    destructive: false,
                                                    show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                                },
                                                {
                                                    title: 'All Zones',
                                                    action: async() => {
                                                        console.log(`(Dashboard) Zone All Off was pressed`);
                                                        await this.FordCommands.sendVehicleCmd('zone_lights_all_off');
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
                        await this.Tables.createTableRow(
                            [
                                await this.Tables.createImageCell(await this.Files.getFPImage(`ic_trailer_light_check_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                                await this.Tables.createTextCell('Trailer Light Check', vData.trailerLightCheckStatus, {
                                    align: 'left',
                                    widthWeight: 59,
                                    titleColor: new Color(this.FPW.colorMap.textColor1),
                                    subtitleColor: new Color(vData.trailerLightCheckStatus === 'On' ? '#FF5733' : '#5A65C0'),
                                    titleFont: Font.headline(),
                                    subtitleFont: Font.subheadline(),
                                }),
                                await this.Tables.createButtonCell('Start', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Trailer Light Check Start was pressed');
                                        if (await this.Alerts.showYesNoPrompt('Trailer Light Check', 'Are you sure want to start the trailer light check process?')) {
                                            await this.FordCommands.sendVehicleCmd('trailer_light_check_on');
                                        }
                                    },
                                }),
                                await this.Tables.createButtonCell('Stop', {
                                    align: 'center',
                                    widthWeight: 17,
                                    onTap: async() => {
                                        console.log('(Dashboard) Trailer Light Check Stop was pressed');
                                        await this.FordCommands.sendVehicleCmd('trailer_light_check_off');
                                    },
                                }),
                            ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                        ),
                    );
                }
            }
        } catch (err) {
            console.error(`createMainPage() Error: ${err}`);
            this.Files.appendToLogFile(`createMainPage() Error: ${err}`);
        }

        await this.Tables.generateTableMenu('main', tableRows, false, this.isPhone, update);
        if (!update) {
            let lastVersion = await this.Kc.getSettingVal('fpScriptVersion');
            let reqOk = await this.Kc.requiredPrefsOk(this.Kc.prefKeys().core);
            // console.log(`(Dashboard) Last Version: ${lastVersion}`);
            if (reqOk && lastVersion !== SCRIPT_VERSION) {
                this.Tables.ChangesPage.createRecentChangesPage();
                await this.Kc.setSettingVal('fpScriptVersion', SCRIPT_VERSION);
            }
        }
    }
};
const fm = FileManager.iCloud();
const FPW_WidgetHelpers = importModule(fm.joinPath(fm.documentsDirectory(), 'FPWModules') + '/FPW_Widgets_Helpers.js');

module.exports = class FPW_Widgets_Medium {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.WidgetHelpers = new FPW_WidgetHelpers(FPW);
        this.textMap = FPW.textMap();
        this.iconMap = FPW.iconMap;
        this.colorMap = FPW.colorMap;
        this.widgetSize = this.FPW.DeviceSize[`${this.FPW.screenSize.width / this.FPW.deviceScale}x${this.FPW.screenSize.height / this.FPW.deviceScale}`] || this.FPW.DeviceSize['375x812'];
    }

    async createWidget(vData, style = undefined) {
        const wStyle = await this.FPW.getWidgetStyle();
        style = style || wStyle;
        switch (style) {
            case 'simple':
                return await this.simpleWidget(vData);
            default:
                return await this.detailedWidget(vData);
        }
    }

    async simpleWidget(vData) {
        console.log(`simpleWidget(medium) called...`);
        const wSize = 'medium';

        // Defines the Widget Object
        const widget = new ListWidget();

        widget.backgroundGradient = this.FPW.getBgGradient();
        try {
            const { width, height } = this.widgetSize[wSize];
            let paddingTop = Math.round(height * 0.05);
            // let paddingTop = 5;
            let paddingLeft = Math.round(width * 0.03);
            // let paddingLeft = 4;
            console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            widget.setPadding(paddingTop, paddingLeft, 0, 0);
            vData.deepSleepMode = true;
            vData.firmwareUpdating = true;
            const hasStatusMsg = await this.WidgetHelpers.hasStatusMsg(vData);
            const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
            //************************
            //* TOP ROW CONTAINER
            //************************
            // let topRowContainer = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, 0, 0, 0], '*topAlignContent': null });

            let bodyContainer = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, 0, 0, 0], '*topAlignContent': null });
            // ****************************************
            // * LEFT BODY COLUMN CONTAINER
            // ****************************************
            let leftContainer = await this.WidgetHelpers.createColumn(bodyContainer, { '*setPadding': [0, 0, 0, 0] });
            leftContainer.addSpacer();
            // Vehicle Title
            const vehicleNameContainer = await this.WidgetHelpers.createRow(leftContainer, { '*setPadding': [paddingTop, paddingLeft, 0, 0] });
            let vehicleNameStr = vData.info.vehicle.vehicleType || '';

            let vehicleNameSize = 24;
            if (vehicleNameStr.length >= 10) {
                vehicleNameSize = vehicleNameSize - Math.round(vehicleNameStr.length / 4);
            }
            await this.WidgetHelpers.createText(vehicleNameContainer, vehicleNameStr, { font: Font.semiboldSystemFont(vehicleNameSize), textColor: this.colorMap.normalText, '*rightAlignText': null });
            vehicleNameContainer.addSpacer();
            // Range and Odometer
            let miContainer = await this.WidgetHelpers.createRow(leftContainer, { '*setPadding': [0, paddingLeft, 0, 0], '*bottomAlignContent': null });

            try {
                const { isEV, lvlValue, dteValue, odometerVal, dtePostfix, distanceMultiplier, distanceUnit, dteInfo } = await this.WidgetHelpers.getRangeData(vData);

                // DTE Text
                await this.WidgetHelpers.createText(miContainer, `${dteInfo}`, { font: Font.systemFont(16), textColor: this.colorMap.normalText, textOpacity: 0.7 });

                let levelContainer = await this.WidgetHelpers.createRow(miContainer, {});
                // DTE + Level Separator
                await this.WidgetHelpers.createText(levelContainer, ' / ', { font: Font.systemFont(14), textColor: this.colorMap.lighterText, textOpacity: 0.6 });
                // Level Text
                await this.WidgetHelpers.createText(levelContainer, `${lvlValue}%`, { font: Font.systemFont(16), textColor: this.colorMap.normalText, textOpacity: 0.6 });

                // leftContainer.addSpacer();
                let mileageContainer = await this.WidgetHelpers.createRow(leftContainer, { '*setPadding': [0, paddingLeft, 0, 0] });

                // Odometer Text
                await this.WidgetHelpers.createText(mileageContainer, `Odometer: ${odometerVal}`, { font: Font.systemFont(10), textColor: this.colorMap.normalText, textOpacity: 0.7 });
            } catch (e) {
                console.error(e.message);
                miContainer.addText('Error Getting Range Data');
            }

            // Vehicle Location Row
            const locationContainer = await this.WidgetHelpers.createRow(leftContainer, { '*setPadding': [10, paddingLeft, 0, 0], '*topAlignContent': null });
            let url = (await this.FPW.getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vData.latitude},${vData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vData.info.vehicle.nickName)}&ll=${vData.latitude},${vData.longitude}`;
            let locationStr = vData.position ? (this.widgetConfig.screenShotMode ? '1234 Someplace Drive, Somewhere' : `${vData.position}`) : this.textMap.errorMessages.noData;
            await this.WidgetHelpers.createText(locationContainer, locationStr, { url: url, font: Font.body(), textColor: this.colorMap.normalText, lineLimit: 2, minimumScaleFactor: 0.7, textOpacity: 0.9 });

            leftContainer.addSpacer();

            //***********************************
            //* RIGHT BODY CONTAINER
            //***********************************

            const rightContainer = await this.WidgetHelpers.createColumn(bodyContainer, { '*setPadding': [0, 0, 0, 0] });
            rightContainer.addSpacer();

            // Vehicle Image Container
            let imgWidth = Math.round(width * 0.5);
            let imgHeight = Math.round(height * 0.5);
            const carImageContainer = await this.WidgetHelpers.createRow(rightContainer, { '*setPadding': [paddingTop, 0, 0, 0], '*centerAlignContent': null });
            carImageContainer.addSpacer();
            await this.WidgetHelpers.createImage(carImageContainer, await this.FPW.Files.getVehicleImage(vData.info.vehicle.modelYear, false, 1), { /*imageSize: new Size(imgWidth, imgHeight),*/ '*rightAlignImage': null, resizable: true });
            carImageContainer.addSpacer();
            const doorWindStatusContainer = await this.WidgetHelpers.createRow(rightContainer, { '*setPadding': [0, 0, 0, 0] });
            doorWindStatusContainer.addSpacer();
            await this.createDoorWindowText(doorWindStatusContainer, vData);
            doorWindStatusContainer.addSpacer();

            rightContainer.addSpacer();

            //*****************************
            //* COMMAND BUTTONS CONTAINER
            //*****************************
            const controlsContainer = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, 0, 0, 0] });
            controlsContainer.addSpacer();
            await this.WidgetHelpers.createWidgetButtonRow(controlsContainer, vData, width, 40, 24);
            controlsContainer.addSpacer();

            //**************************
            //* BOTTOM ROW CONTAINER
            //**************************
            // if (hasStatusMsg) {
            //     let statusRow = await this.WidgetHelpers.createRow(widget, { '*setPadding': [3, 0, 3, 0], '*centerAlignContent': null, size: new Size(Math.round(width * 1), Math.round(height * 0.1)) });
            //     await this.WidgetHelpers.createStatusElement(statusRow, vData, 2, wSize);
            //     statusRow.addSpacer();
            // }

            // Displays the Last Vehicle Checkin Time Elapsed...
            let timestampRow = await this.WidgetHelpers.createRow(widget, { '*setPadding': [3, 0, 5, paddingLeft], '*bottomAlignContent': null });
            await this.WidgetHelpers.createTimeStampElement(timestampRow, vData, 'center', 8);

            // ***************** RIGHT BODY CONTAINER END *****************
        } catch (e) {
            this.FPW.logger(`simpleWidget(medium) Error: ${e}`, true);
        }
        return widget;
    }

    async detailedWidget(vData) {
        const wSize = 'medium';

        // Defines the Widget Object
        const widget = new ListWidget();

        widget.backgroundGradient = this.FPW.getBgGradient();
        try {
            const { width, height } = this.widgetSize[wSize];
            let paddingTop = Math.round(height * 0.08);
            // let paddingTop = 6;
            let paddingLeft = Math.round(width * 0.09);
            // let paddingLeft = 6;
            console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            widget.setPadding(0, 0, 0, 0);
            vData.deepSleepMode = true;
            vData.firmwareUpdating = true;
            const hasStatusMsg = await this.WidgetHelpers.hasStatusMsg(vData);
            //_______________________________
            //|         |         |         |
            //|         |         |         |
            //|         |         |         |
            //|_________|_________|_________|
            //|                             |
            //-------------------------------

            let topContainer = await this.WidgetHelpers.createRow(widget, { '*setPadding': [paddingTop, paddingLeft, 0, 0] /*, size: new Size(Math.round(width * 1), Math.round(height * 0.85))*/ });
            //*****************
            //* First column
            //*****************
            let mainCol1 = await this.WidgetHelpers.createColumn(topContainer, { '*setPadding': [0, 0, 0, 0] /*, size: new Size(Math.round(width * 0.333), Math.round(height * 1))*/ });

            // Vehicle Image Container
            let imgWidth = Math.round(width * 0.33);
            let imgHeight = Math.round(height * 0.3);
            await this.WidgetHelpers.createVehicleImageElement(mainCol1, vData, this.FPW.sizeMap[wSize].logoSize.w, this.FPW.sizeMap[wSize].logoSize.h + 10);

            // Creates the Odometer, Fuel/Battery and Distance Info Elements
            await this.createFuelRangeElements(mainCol1, vData, wSize);

            // Creates Low-Voltage Battery Voltage Elements
            await this.createBatteryElement(mainCol1, vData, wSize);

            // Creates Oil Life Elements
            if (!vData.evVehicle) {
                await this.createOilElement(mainCol1, vData, wSize);
            } else {
                // Creates EV Plug Elements
                await this.createEvChargeElement(mainCol1, vData, wSize);
            }
            mainCol1.addSpacer();

            //************************
            //* Second column
            //************************
            let mainCol2 = await this.WidgetHelpers.createColumn(topContainer, { '*setPadding': [0, 0, 0, 0] /*, size: new Size(Math.round(width * 0.333), Math.round(height * 1))*/ });

            // Creates the Lock Status Elements
            await this.createLockStatusElement(mainCol2, vData, wSize);

            // Creates the Door Status Elements
            await this.WidgetHelpers.createDoorElement(mainCol2, vData, wSize, 'left');

            // Create Tire Pressure Elements
            await this.WidgetHelpers.createTireElement(mainCol2, vData, wSize, 'left');
            mainCol2.addSpacer(0);

            //****************
            //* Third column
            //****************
            let mainCol3 = await this.WidgetHelpers.createColumn(topContainer, { '*setPadding': [0, 0, 0, 0] /*, size: new Size(Math.round(width * 0.333), Math.round(height * 1))*/ });

            // Creates the Ignition Status Elements
            await this.createIgnitionStatusElement(mainCol3, vData, wSize);

            // Creates the Door Status Elements
            await this.WidgetHelpers.createWindowElement(mainCol3, vData, wSize, 'left');

            // Creates the Vehicle Location Element
            await this.createPositionElement(mainCol3, vData, wSize);
            mainCol3.addSpacer();

            widget.addSpacer();
            //**********************
            //* Refresh and error
            //*********************
            const bottomContainer = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, 0, 0, 0], '*bottomAlignContent': null });
            let bottomCol = await this.WidgetHelpers.createColumn(bottomContainer, { '*setPadding': [0, 0, 0, 0] });
            if (hasStatusMsg) {
                let statusRow = await this.WidgetHelpers.createRow(bottomCol, { '*setPadding': [3, 0, 3, 0], '*centerAlignContent': null });
                await this.WidgetHelpers.createStatusElement(statusRow, vData, 2, wSize);
                statusRow.addSpacer(); // Pushes Status Message to the left
            }

            // Displays the Last Vehicle Checkin Time Elapsed...
            let timestampRow = await this.WidgetHelpers.createRow(bottomCol, { '*setPadding': [3, 0, 3, 0] });
            await this.WidgetHelpers.createTimeStampElement(timestampRow, vData, 'center', 8);
        } catch (e) {
            this.FPW.logger(`detailedWidget(medium) Error: ${e}`, true);
        }
        return widget;
    }

    async createDoorWindowText(srcField, vData) {
        try {
            const styles = {
                open: { font: Font.semiboldSystemFont(10), textColor: this.colorMap.openColor, lineLimit: 2 },
                closed: { font: Font.systemFont(10), textColor: this.colorMap.lighterText, textOpacity: 0.5, lineLimit: 2 },
            };
            let container = await this.WidgetHelpers.createRow(srcField, { '*setPadding': [0, 0, 0, 0] });
            // container.addSpacer();
            let doorsOpen = await this.FPW.getOpenItems('createDoorWindowText', vData.statusDoors); //['LF', 'RR', 'HD'];
            let hoodOpen = false;
            let tailgateOpen = false;
            if (doorsOpen.includes('HD')) {
                hoodOpen = true;
                delete doorsOpen['HD'];
            }
            if (doorsOpen.includes('TG') || doorsOpen.includes('ITG')) {
                tailgateOpen = true;
                delete doorsOpen['TG'];
                delete doorsOpen['ITG'];
            }

            let windowsOpen = await this.FPW.getOpenItems('createDoorWindowText', vData.statusWindows);
            let openStatus = 'All Doors and Windows Closed';
            if (Object.keys(doorsOpen).length > 0 || Object.keys(windowsOpen).length > 0) {
                openStatus = doorsOpen.length ? `${doorsOpen.length} Doors Open` : 'All Doors Closed, ';
                openStatus += hoodOpen ? `Hood Open, ${tailgateOpen ? '' : 'and '}` : '';
                openStatus += tailgateOpen ? `Tailgate Open, and ` : '';
                openStatus += windowsOpen.length ? `${windowsOpen.length} Windows Open` : 'All Windows Closed';
            }
            // console.log(`openStatus: ${openStatus}`);
            const alertStatus = Object.keys(doorsOpen).length > 0 || Object.keys(windowsOpen).length > 0 || hoodOpen || tailgateOpen;
            await this.WidgetHelpers.createText(container, openStatus, alertStatus ? styles.open : styles.closed);
            // container.addSpacer();
        } catch (err) {
            this.FPW.logError(`createDoorWindowText(medium) ${err}`);
        }
        return srcField;
    }

    async createRangeElements(srcField, vData, wSize = 'medium') {
        try {
            const isEV = vData.evVehicle === true;
            let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
            let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;
            let dtePostfix = isEV ? 'Range' : 'to E';
            let distanceMultiplier = (await this.FPW.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
            let distanceUnit = (await this.FPW.useMetricUnits()) ? 'km' : 'mi'; // unit of length

            // Fuel/Battery Section
            let elemCol = await this.WidgetHelpers.createColumn(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

            // Fuel/Battery Level BAR
            let barRow = await this.WidgetHelpers.createRow(elemCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            await this.WidgetHelpers.createImage(barRow, await this.WidgetHelpers.createProgressBar(lvlValue ? lvlValue : 50, vData, wSize), { '*centerAlignImage': null, imageSize: new Size(this.FPW.sizeMap[wSize].barGauge.w, this.FPW.sizeMap[wSize].barGauge.h + 3) });

            // Distance/Range to Empty
            let dteRow = await this.WidgetHelpers.createRow(elemCol, { '*centerAlignContent': null, '*topAlignContent': null });
            let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.textMap.errorMessages.noData;
            await this.WidgetHelpers.createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: this.colorMap.normalText, lineLimit: 1 });
            srcField.addSpacer(3);
        } catch (e) {
            this.FPW.logger(`createRangeElements() Error: ${e}`, true);
        }
    }

    async createFuelRangeElements(srcField, vData, wSize = 'medium') {
        try {
            const isEV = vData.evVehicle === true;
            let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
            let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;
            let dtePostfix = isEV ? 'Range' : 'to E';
            let distanceMultiplier = (await this.FPW.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
            let distanceUnit = (await this.FPW.useMetricUnits()) ? 'km' : 'mi'; // unit of length
            // console.log('isEV: ' + isEV);
            // console.log(`fuelLevel: ${vData.fuelLevel}`);
            // console.log(`distanceToEmpty: ${vData.distanceToEmpty}`);
            // console.log(`evBatteryLevel: ${vData.evBatteryLevel}`);
            // console.log('evDistanceToEmpty: ' + vData.evDistanceToEmpty);
            // console.log(`lvlValue: ${lvlValue}`);
            // console.log(`dteValue: ${dteValue}`);

            // Fuel/Battery Section
            let elemCol = await this.WidgetHelpers.createColumn(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

            // Fuel/Battery Level BAR
            let barRow = await this.WidgetHelpers.createRow(elemCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            await this.WidgetHelpers.createImage(barRow, await this.WidgetHelpers.createProgressBar(lvlValue ? lvlValue : 50, vData, wSize), { '*centerAlignImage': null, imageSize: new Size(this.FPW.sizeMap[wSize].barGauge.w, this.FPW.sizeMap[wSize].barGauge.h + 3) });

            // Distance to Empty
            let dteRow = await this.WidgetHelpers.createRow(elemCol, { '*centerAlignContent': null, '*topAlignContent': null });
            let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.textMap.errorMessages.noData;
            await this.WidgetHelpers.createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: this.colorMap.normalText, lineLimit: 1 });
            srcField.addSpacer(3);
        } catch (e) {
            this.FPW.logger(`createFuelRangeElements() Error: ${e}`, true);
        }
    }

    async createBatteryElement(srcField, vData, wSize = 'medium') {
        try {
            let elem = await this.WidgetHelpers.createRow(srcField, { '*layoutHorizontally': null, '*bottomAlignContent': null });
            await this.WidgetHelpers.createTitle(elem, 'batteryStatus', wSize, true, this.FPW.isSmallDisplay || wSize === 'small');
            elem.addSpacer(2);
            let value = vData.batteryLevel ? `${vData.batteryLevel}V` : 'N/A';
            // console.log(`batteryLevel: ${value}`);
            let lowBattery = vData.batteryStatus === 'STATUS_LOW' ? true : false;
            await this.WidgetHelpers.createText(elem, value, { font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: lowBattery ? Color.red() : this.colorMap.normalText, lineLimit: 1 });
            srcField.addSpacer(3);
        } catch (e) {
            this.FPW.logger(`createBatteryElement() Error: ${e}`, true);
        }
    }

    async createOilElement(srcField, vData, wSize = 'medium') {
        try {
            const styles = {
                normal: { font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: this.colorMap.normalText, lineLimit: 1 },
                warning: { font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: this.colorMap.orangeColor, lineLimit: 1 },
                critical: { font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: this.colorMap.redColor, lineLimit: 1 },
            };
            let elem = await this.WidgetHelpers.createRow(srcField, { '*layoutHorizontally': null, '*bottomAlignContent': null });
            await this.WidgetHelpers.createTitle(elem, 'oil', wSize, true, this.FPW.isSmallDisplay || wSize === 'small');
            elem.addSpacer(2);
            let txtStyle = styles.normal;
            if (vData.oilLife && vData.oilLife >= 0 && vData.oilLife <= 25) {
                txtStyle = styles.warning;
            }
            // console.log(`oilLife: ${vData.oilLife}`);
            let text = vData.oilLife ? `${vData.oilLife}%` : this.textMap.errorMessages.noData;
            await this.WidgetHelpers.createText(elem, text, txtStyle);
            srcField.addSpacer(3);
        } catch (e) {
            this.FPW.logger(`createOilElement() Error: ${e}`, true);
        }
    }

    async createEvChargeElement(srcField, vData, wSize = 'medium') {
        try {
            let elem = await this.WidgetHelpers.createRow(srcField, { '*layoutHorizontally': null });
            await this.WidgetHelpers.createTitle(elem, 'evChargeStatus', wSize, true, this.FPW.isSmallDisplay || wSize === 'small');
            elem.addSpacer(2);
            let value = vData.evChargeStatus ? `${vData.evChargeStatus}` : this.textMap.errorMessages.noData;
            // console.log(`battery charge: ${value}`);
            await this.WidgetHelpers.createText(elem, value, { font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: this.colorMap.normalText, lineLimit: 1 });
            srcField.addSpacer(3);
        } catch (e) {
            this.FPW.logger(`createEvChargeElement() Error: ${e}`, true);
        }
    }

    // async createDoorElement(srcStack, vData, wSize = 'medium', position = 'center') {
    //     const styles = {
    //         normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText, lineLimit: 2 },
    //         open: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 2 },
    //         closed: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 2 },
    //         offset: 5,
    //     };

    //     let titleRow = await this.WidgetHelpers.createRow(srcStack, { '*centerAlignContent': null });
    //     if (position == 'center' || position == 'right') {
    //         titleRow.addSpacer();
    //     }
    //     await this.WidgetHelpers.createTitle(titleRow, 'doors', wSize, false);
    //     if (position == 'center' || position == 'left') {
    //         titleRow.addSpacer();
    //     }
    //     let valueRow = await this.WidgetHelpers.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
    //     const openDoors = await this.FPW.getOpenItems('createDoorElement2', vData.statusDoors); //['LF', 'RR', 'HD'];
    //     let value = openDoors.length ? openDoors.join(', ') : 'All Closed';
    //     if (position == 'center' || position == 'right') {
    //         valueRow.addSpacer();
    //     }
    //     await this.WidgetHelpers.createText(valueRow, value, openDoors.length > 0 ? styles.open : styles.closed);
    //     if (position == 'center' || position == 'left') {
    //         valueRow.addSpacer();
    //     }
    // }

    // async createWindowElement(srcStack, vData, wSize = 'medium', position = 'center') {
    //     const styles = {
    //         normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText, lineLimit: 2 },
    //         open: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 2 },
    //         closed: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 2 },
    //         offset: 5,
    //     };

    //     let titleRow = await this.WidgetHelpers.createRow(srcStack, { '*centerAlignContent': null });
    //     if (position == 'center' || position == 'right') {
    //         titleRow.addSpacer();
    //     }
    //     await this.WidgetHelpers.createTitle(titleRow, 'windows', wSize, false);
    //     if (position == 'center' || position == 'left') {
    //         titleRow.addSpacer();
    //     }
    //     let valueRow = await this.WidgetHelpers.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
    //     const openWindows = await this.FPW.getOpenItems('createWindowElement2', vData.statusDoors); //['LF', 'RR', 'HD'];
    //     let value = openWindows.length ? openWindows.join(', ') : 'All Closed';
    //     if (position == 'center' || position == 'right') {
    //         valueRow.addSpacer();
    //     }
    //     await this.WidgetHelpers.createText(valueRow, value, openWindows.length > 0 ? styles.open : styles.closed);
    //     if (position == 'center' || position == 'left') {
    //         valueRow.addSpacer();
    //     }
    // }

    // async createDoorElement(srcField, vData, countOnly = false, wSize = 'medium') {
    //     try {
    //         let that = this;
    //         const styles = {
    //             normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText, lineLimit: 1 },
    //             open: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 1 },
    //             closed: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 1 },
    //             offset: 5,
    //         };

    //         let offset = styles.offset;
    //         let titleFld = await this.WidgetHelpers.createRow(srcField);
    //         await this.WidgetHelpers.createTitle(titleFld, 'doors', wSize);

    //         // Creates the first row of status elements for LF and RF
    //         let dataRow1Fld = await this.WidgetHelpers.createRow(srcField);

    //         if (countOnly) {
    //             let value = this.textMap.errorMessages.noData;
    //             // let allDoorsCnt = Object.values(vData.statusDoors).filter((door) => door !== null).length;
    //             let countOpen;
    //             if (vData.statusDoors) {
    //                 countOpen = Object.values(vData.statusDoors).filter((door) => door === true).length;
    //                 value = countOpen == 0 ? this.textMap.UIValues.closed : `${countOpen} ${this.textMap.UIValues.open}`;
    //             }
    //             await this.WidgetHelpers.createText(dataRow1Fld, value, countOpen > 0 ? styles.open : styles.closed);
    //         } else {
    //             let col1 = await this.WidgetHelpers.createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
    //             let col1row1 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
    //             await this.WidgetHelpers.createText(col1row1, 'LF (', styles.normTxt);
    //             await this.WidgetHelpers.createText(col1row1, vData.statusDoors.driverFront ? this.textMap.symbols.open : this.textMap.symbols.closed, vData.statusDoors.driverFront ? styles.open : styles.closed);
    //             await this.WidgetHelpers.createText(col1row1, ')', styles.normTxt);

    //             let col2 = await this.WidgetHelpers.createColumn(dataRow1Fld, { '*setPadding': [0, 3, 0, 3] });
    //             let col2row1 = await this.WidgetHelpers.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
    //             await this.WidgetHelpers.createText(col2row1, '|', styles.normTxt);

    //             let col3 = await this.WidgetHelpers.createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
    //             let col3row1 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
    //             await this.WidgetHelpers.createText(col3row1, 'RF (', styles.normTxt);
    //             await this.WidgetHelpers.createText(col3row1, vData.statusDoors.passFront ? this.textMap.symbols.open : this.textMap.symbols.closed, vData.statusDoors.passFront ? styles.open : styles.closed);
    //             await this.WidgetHelpers.createText(col3row1, ')', styles.normTxt);

    //             // Creates the second row of status elements for LR and RR
    //             if (vData.statusDoors.leftRear !== null && vData.statusDoors.rightRear !== null) {
    //                 let col1row2 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
    //                 await this.WidgetHelpers.createText(col1row2, `LR (`, styles.normTxt);
    //                 await this.WidgetHelpers.createText(col1row2, vData.statusDoors.leftRear ? this.textMap.symbols.open : this.textMap.symbols.closed, vData.statusDoors.leftRear ? styles.open : styles.closed);
    //                 await this.WidgetHelpers.createText(col1row2, ')', styles.normTxt);

    //                 let col2row2 = await this.WidgetHelpers.createRow(col2, {});
    //                 await this.WidgetHelpers.createText(col2row2, '|', styles.normTxt);

    //                 let col3row2 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
    //                 await this.WidgetHelpers.createText(col3row2, `RR (`, styles.normTxt);
    //                 await this.WidgetHelpers.createText(col3row2, vData.statusDoors.rightRear ? this.textMap.symbols.open : this.textMap.symbols.closed, vData.statusDoors.rightRear ? styles.open : styles.closed);
    //                 await this.WidgetHelpers.createText(col3row2, ')', styles.normTxt);
    //             }

    //             let that = this;
    //             async function getHoodStatusElem(stkElem, data, center = false) {
    //                 try {
    //                     await that.WidgetHelpers.createText(stkElem, `${center ? '       ' : ''}HD (`, styles.normTxt);
    //                     await that.WidgetHelpers.createText(stkElem, data.statusDoors.hood ? that.textMap.symbols.open : that.textMap.symbols.closed, vData.statusDoors.hood ? styles.open : styles.closed);
    //                     await that.WidgetHelpers.createText(stkElem, ')', styles.normTxt);
    //                 } catch (e) {
    //                     that.FPW.logger(`getHoodStatusElem() Error: ${e}`, true);
    //                 }
    //             }
    //             async function getTailgateStatusElem(stkElem, data, center = false) {
    //                 try {
    //                     await that.WidgetHelpers.createText(stkElem, `${center ? '       ' : ''}TG (`, styles.normTxt);
    //                     await that.WidgetHelpers.createText(stkElem, data.statusDoors.tailgate ? that.textMap.symbols.open : that.textMap.symbols.closed, vData.statusDoors.tailgate ? styles.open : styles.closed);
    //                     await that.WidgetHelpers.createText(stkElem, ')', styles.normTxt);
    //                 } catch (e) {
    //                     that.FPW.logger(`getTailgateStatusElem() Error: ${e}`, true);
    //                 }
    //             }

    //             // Creates the third row of status elements for the tailgate and/or hood (if equipped)
    //             let hasHood = vData.statusDoors.hood !== null;
    //             let hasTailgate = vData.statusDoors.tailgate !== null;

    //             if (hasHood || hasTailgate) {
    //                 if (hasHood && hasTailgate) {
    //                     let col1row3 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
    //                     await getHoodStatusElem(col1row3, vData);

    //                     let col2row3 = await this.WidgetHelpers.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
    //                     await this.WidgetHelpers.createText(col2row3, '|', styles.normTxt);

    //                     let col3row3 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
    //                     await getTailgateStatusElem(col3row3, vData);
    //                 } else {
    //                     if (hasHood && !hasTailgate) {
    //                         let dataRow3Fld = await this.WidgetHelpers.createRow(srcField);
    //                         await getHoodStatusElem(dataRow3Fld, vData, true);
    //                     } else if (hasTailgate && !hasHood) {
    //                         let dataRow3Fld = await this.WidgetHelpers.createRow(srcField, {});
    //                         await getTailgateStatusElem(dataRow3Fld, vData, true);
    //                     }
    //                 }
    //             }
    //         }
    //         srcField.addSpacer(offset);
    //     } catch (err) {
    //         this.FPW.logError(`createDoorElement(medium) Error: ${err}`);
    //     }
    // }

    // async createWindowElement(srcField, vData, countOnly = false, wSize = 'medium') {
    //     try {
    //         const styles = {
    //             normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText },
    //             open: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.openColor },
    //             closed: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.closedColor },
    //             offset: 10,
    //         };

    //         let offset = styles.offset;
    //         let titleFld = await this.WidgetHelpers.createRow(srcField);
    //         await this.WidgetHelpers.createTitle(titleFld, 'windows', wSize);

    //         // Creates the first row of status elements for LF and RF
    //         let dataRow1Fld = await this.WidgetHelpers.createRow(srcField);
    //         if (countOnly) {
    //             let value = this.textMap.errorMessages.noData;
    //             let countOpen;
    //             if (vData.statusWindows) {
    //                 countOpen = Object.values(vData.statusWindows).filter((window) => window === true).length;
    //                 value = countOpen == 0 ? this.textMap.UIValues.closed : `${countOpenWindows} ${this.textMap.UIValues.open}`;
    //             }
    //             await this.WidgetHelpers.createText(dataRow1Fld, value, countOpen > 0 ? styles.open : styles.closed);
    //         } else {
    //             let col1 = await this.WidgetHelpers.createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
    //             let col1row1 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
    //             await this.WidgetHelpers.createText(col1row1, 'LF (', styles.normTxt);
    //             await this.WidgetHelpers.createText(col1row1, vData.statusWindows.driverFront ? this.textMap.symbols.open : this.textMap.symbols.closed, vData.statusWindows['driverFront'] ? styles.open : styles.closed);
    //             await this.WidgetHelpers.createText(col1row1, ')', styles.normTxt);

    //             let col2 = await this.WidgetHelpers.createColumn(dataRow1Fld, { '*setPadding': [0, 3, 0, 3] });
    //             let col2row1 = await this.WidgetHelpers.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
    //             await this.WidgetHelpers.createText(col2row1, '|', styles.normTxt);

    //             let col3 = await this.WidgetHelpers.createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
    //             let col3row1 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
    //             await this.WidgetHelpers.createText(col3row1, 'RF (', styles.normTxt);
    //             await this.WidgetHelpers.createText(col3row1, vData.statusWindows['passFront'] ? this.textMap.symbols.open : this.textMap.symbols.closed, vData.statusWindows['passFront'] ? styles.open : styles.closed);
    //             await this.WidgetHelpers.createText(col3row1, ')', styles.normTxt);

    //             // Creates the second row of status elements for LR and RR
    //             if (vData.statusWindows.driverRear !== null && vData.statusWindows.passRear !== null) {
    //                 let col1row2 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
    //                 await this.WidgetHelpers.createText(col1row2, `LR (`, styles.normTxt);
    //                 await this.WidgetHelpers.createText(col1row2, vData.statusWindows.driverRear ? this.textMap.symbols.open : this.textMap.symbols.closed, vData.statusWindows.driverRear ? styles.open : styles.closed);
    //                 await this.WidgetHelpers.createText(col1row2, ')', styles.normTxt);

    //                 let col2row2 = await this.WidgetHelpers.createRow(col2, {});
    //                 await this.WidgetHelpers.createText(col2row2, '|', styles.normTxt);

    //                 let col3row2 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
    //                 await this.WidgetHelpers.createText(col3row2, `RR (`, styles.normTxt);
    //                 await this.WidgetHelpers.createText(col3row2, vData.statusWindows.passRear ? this.textMap.symbols.open : this.textMap.symbols.closed, vData.statusWindows.passRear ? styles.open : styles.closed);
    //                 await this.WidgetHelpers.createText(col3row2, ')', styles.normTxt);
    //             }

    //             if (vData.statusDoors['tailgate'] !== undefined || vData.statusDoors['hood'] !== undefined) {
    //                 offset = offset + 10;
    //             }
    //         }
    //         srcField.addSpacer(offset);
    //     } catch (e) {
    //         this.FPW.logger(`createWindowElement() Error: ${e}`, true);
    //     }
    // }

    async createTireElement(srcField, vData, wSize = 'medium') {
        try {
            const styles = {
                normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText },
            };
            let offset = 0;
            let titleFld = await this.WidgetHelpers.createRow(srcField);
            let pressureUnits = await this.FPW.getSettingVal('fpPressureUnits');
            let unitTxt = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
            await this.WidgetHelpers.createTitle(titleFld, `tirePressure||${unitTxt}`, wSize, false);

            let dataFld = await this.WidgetHelpers.createRow(srcField);
            // Row 1 - Tire Pressure Left Front amd Right Front
            let col1 = await this.WidgetHelpers.createColumn(dataFld, { '*setPadding': [0, 0, 0, 0] });
            let col1row1 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await this.WidgetHelpers.createText(col1row1, vData.tirePressure.leftFront, this.WidgetHelpers.getTirePressureStyle(vData.tirePressure.leftFront, unitTxt, wSize));
            let col2 = await this.WidgetHelpers.createColumn(dataFld, { '*setPadding': [0, 3, 0, 3] });
            let col2row1 = await this.WidgetHelpers.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
            await this.WidgetHelpers.createText(col2row1, '|', styles.normTxt);
            let col3 = await this.WidgetHelpers.createColumn(dataFld, { '*setPadding': [0, 0, 0, 0] });
            let col3row1 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await this.WidgetHelpers.createText(col3row1, vData.tirePressure.rightFront, this.WidgetHelpers.getTirePressureStyle(vData.tirePressure.rightFront, unitTxt, wSize));

            // Row 2 - Tire Pressure Left Rear amd Right Rear
            let col1row2 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await this.WidgetHelpers.createText(col1row2, vData.tirePressure.leftRear, this.WidgetHelpers.getTirePressureStyle(vData.tirePressure.leftRear, unitTxt, wSize));
            let col2row2 = await this.WidgetHelpers.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
            await this.WidgetHelpers.createText(col2row2, '|', styles.normTxt);
            let col3row2 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await this.WidgetHelpers.createText(col3row2, vData.tirePressure.rightRear, this.WidgetHelpers.getTirePressureStyle(vData.tirePressure.rightRear, unitTxt, wSize));

            srcField.addSpacer(offset);
        } catch (e) {
            this.FPW.logger(`createTireElement() Error: ${e}`, true);
        }
    }

    async createPositionElement(srcField, vData, wSize = 'medium') {
        try {
            let offset = 0;
            let titleFld = await this.WidgetHelpers.createRow(srcField);
            await this.WidgetHelpers.createTitle(titleFld, 'position', wSize, false);

            let dataFld = await this.WidgetHelpers.createRow(srcField);
            let url = (await this.FPW.getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vData.latitude},${vData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vData.info.vehicle.nickName)}&ll=${vData.latitude},${vData.longitude}`;
            let value = vData.position ? (this.widgetConfig.screenShotMode ? '1234 Someplace Drive, Somewhere' : `${vData.position}`) : this.textMap.errorMessages.noData;
            await this.WidgetHelpers.createText(dataFld, value, { url: url, font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText, lineLimit: 2, minimumScaleFactor: 0.7 });
            srcField.addSpacer(offset);
        } catch (e) {
            this.FPW.logger(`createPositionElement() Error: ${e}`, true);
        }
    }

    async createLockStatusElement(srcField, vData, wSize = 'medium') {
        try {
            const styles = {
                unlocked: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 1 },
                locked: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 1 },
            };
            let offset = 2;
            let titleFld = await this.WidgetHelpers.createRow(srcField);
            await this.WidgetHelpers.createTitle(titleFld, 'lockStatus', wSize, false);
            titleFld.addSpacer(2);
            let dataFld = await this.WidgetHelpers.createRow(srcField);
            let value = vData.lockStatus ? vData.lockStatus.toLowerCase().charAt(0).toUpperCase() + vData.lockStatus.toLowerCase().slice(1) : this.textMap.errorMessages.noData;
            await this.WidgetHelpers.createText(dataFld, value, vData.lockStatus !== undefined && vData.lockStatus === 'LOCKED' ? styles.locked : styles.unlocked);
            srcField.addSpacer(offset);
        } catch (e) {
            this.FPW.logger(`createLockStatusElement() Error: ${e}`, true);
        }
    }

    async createIgnitionStatusElement(srcField, vData, wSize = 'medium') {
        try {
            const styles = {
                on: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.openColor },
                off: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.closedColor },
            };
            let remStartOn = vData.remoteStartStatus && vData.remoteStartStatus.running ? true : false;
            let status = '';
            if (remStartOn) {
                status = `Remote Start (ON)`;
            } else if (vData.ignitionStatus !== undefined) {
                status = vData.ignitionStatus.charAt(0).toUpperCase() + vData.ignitionStatus.slice(1); //vData.ignitionStatus.toUpperCase();
            } else {
                this.textMap.errorMessages.noData;
            }
            let offset = 2;
            let titleFld = await this.WidgetHelpers.createRow(srcField);
            await this.WidgetHelpers.createTitle(titleFld, 'ignitionStatus', wSize, false);
            titleFld.addSpacer(2);
            let dataFld = await this.WidgetHelpers.createRow(srcField);
            await this.WidgetHelpers.createText(dataFld, status, vData.ignitionStatus !== undefined && (vData.ignitionStatus === 'On' || vData.ignitionStatus === 'Run' || remStartOn) ? styles.on : styles.off);
            srcField.addSpacer(offset);
        } catch (e) {
            this.FPW.logger(`createIgnitionStatusElement() Error: ${e}`, true);
        }
    }

    // async createColumn(srcField, styles = {}) {
    //     try {
    //         let col = srcField.addStack();
    //         col.layoutVertically();
    //         if (styles && Object.keys(styles).length > 0) {
    //             this.FPW._mapMethodsAndCall(col, styles);
    //         }
    //         return col;
    //     } catch (e) {
    //         this.FPW.logError(`createColumn Error: ${e}`);
    //     }
    // }

    // async createRow(srcField, styles = {}) {
    //     try {
    //         let row = srcField.addStack();
    //         row.layoutHorizontally();
    //         if (styles && Object.keys(styles).length > 0) {
    //             this.FPW._mapMethodsAndCall(row, styles);
    //         }
    //         return row;
    //     } catch (e) {
    //         this.FPW.logError(`createRow Error: ${e}`);
    //         return null;
    //     }
    // }

    // async createText(srcField, text, styles = {}) {
    //     let txt = srcField.addText(text);
    //     if (styles && Object.keys(styles).length > 0) {
    //         this.FPW._mapMethodsAndCall(txt, styles);
    //     }
    //     return txt;
    // }

    // async createImage(srcField, image, styles = {}) {
    //     let _img = srcField.addImage(image);
    //     if (styles && Object.keys(styles).length > 0) {
    //         this.FPW._mapMethodsAndCall(_img, styles);
    //     }
    //     return _img;
    // }

    // async createTitle(srcElem, titleText, wSize = 'medium', colon = true, hideTitleForSmall = false) {
    //     let titleParams = titleText.split('||');
    //     let icon = this.iconMap[titleParams[0]];
    //     let titleStack = await this.WidgetHelpers.createRow(srcElem, { '*centerAlignContent': null });
    //     if (icon !== undefined) {
    //         let imgFile = await this.FPW.Files.getImage(icon.toString());
    //         await this.WidgetHelpers.createImage(titleStack, imgFile, { imageSize: new Size(this.FPW.sizeMap[wSize].iconSize.w, this.FPW.sizeMap[wSize].iconSize.h), resizable: true });
    //     }
    //     // console.log(`titleParams(${titleText}): ${titleParams}`);
    //     if (titleText && titleText.length && !hideTitleForSmall) {
    //         titleStack.addSpacer(2);
    //         let title = titleParams.length > 1 ? this.FPW.textMap(titleParams[1]).elemHeaders[titleParams[0]] : this.textMap.elemHeaders[titleParams[0]];
    //         await this.WidgetHelpers.createText(titleStack, `${title}${colon ? ':' : ''}`, { font: Font.boldSystemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.colorMap.normalText, lineLimit: 1 });
    //     }
    // }

    // async createProgressBar(percent, vData, wSize = 'medium') {
    //     // percent = 12;
    //     const isEV = vData.evVehicle === true;
    //     let fillLevel = percent > 100 ? 100 : percent;
    //     const barWidth = this.FPW.sizeMap[wSize].barGauge.w;
    //     const context = new DrawContext();
    //     context.size = new Size(barWidth, this.FPW.sizeMap[wSize].barGauge.h + 3);
    //     context.opaque = false;
    //     context.respectScreenScale = true;

    //     // Bar Background Gradient
    //     const lvlBgPath = new Path();
    //     lvlBgPath.addRoundedRect(new Rect(0, 0, barWidth, this.FPW.sizeMap[wSize].barGauge.h), 3, 2);
    //     context.addPath(lvlBgPath);
    //     context.setFillColor(Color.lightGray());
    //     context.fillPath();

    //     // Bar Level Background
    //     const lvlBarPath = new Path();
    //     lvlBarPath.addRoundedRect(new Rect(0, 0, (barWidth * fillLevel) / 100, this.FPW.sizeMap[wSize].barGauge.h), 3, 2);
    //     context.addPath(lvlBarPath);
    //     let barColor = isEV ? '#94ef4a' : '#619ded';
    //     if (percent >= 0 && percent <= 10) {
    //         barColor = '#FF6700';
    //     } else if (percent > 10 && percent <= 20) {
    //         barColor = '#FFCD00';
    //     }
    //     context.setFillColor(new Color(barColor));
    //     context.fillPath();

    //     let xPos = barWidth / 2 - 20;
    //     context.setFont(Font.mediumSystemFont(this.FPW.sizeMap[wSize].barGauge.fs));
    //     context.setTextColor(Color.black());

    //     // if (fillLevel > 75) {
    //     //     context.setTextColor(Color.white());
    //     // }
    //     const icon = isEV ? String.fromCodePoint('0x1F50B') : '\u26FD';
    //     const lvlStr = fillLevel < 0 || fillLevel > 100 ? '--' : `${fillLevel}%`;
    //     context.drawTextInRect(`${icon} ${lvlStr}`, new Rect(xPos, this.FPW.sizeMap[wSize].barGauge.h / this.FPW.sizeMap[wSize].barGauge.fs, this.FPW.sizeMap[wSize].barGauge.w, this.FPW.sizeMap[wSize].barGauge.h));
    //     context.setTextAlignedCenter();
    //     return await context.getImage();
    // }

    // async createVehicleImageElement(srcField, vData, width, height, angle = 4) {
    //     let logoRow = await this.WidgetHelpers.createRow(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
    //     if (vData.info !== undefined && vData.info.vehicle !== undefined) {
    //         await this.WidgetHelpers.createImage(logoRow, await this.FPW.Files.getVehicleImage(vData.info.vehicle.modelYear, false, angle), { imageSize: new Size(width, height), '*centerAlignImage': null, resizable: true });
    //         srcField.addSpacer(3);
    //     }
    // }

    // async getRangeData(data) {
    //     const isEV = data.evVehicle === true;
    //     const dtePostfix = isEV ? 'Range' : 'to E';
    //     const distanceMultiplier = (await this.FPW.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
    //     const distanceUnit = (await this.FPW.useMetricUnits()) ? 'km' : 'mi'; // unit of length
    //     const dteValueRaw = !isEV ? (data.distanceToEmpty ? data.distanceToEmpty : undefined) : data.evDistanceToEmpty ? data.evDistanceToEmpty : undefined;
    //     return {
    //         isEV: isEV,
    //         lvlValue: !isEV ? (data.fuelLevel ? data.fuelLevel : 0) : data.evBatteryLevel ? data.evBatteryLevel : 0,
    //         dteValue: dteValueRaw ? Math.round(dteValueRaw * distanceMultiplier) : undefined,
    //         odometerVal: data.odometer ? `${Math.round(data.odometer * distanceMultiplier)} ${distanceUnit}` : this.textMap.errorMessages.noData,
    //         dtePostfix: dtePostfix,
    //         // distanceMultiplier: distanceMultiplier, // distance multiplier
    //         distanceUnit: distanceUnit, // unit of length
    //         dteInfo: dteValueRaw ? `${Math.round(dteValueRaw * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.textMap.errorMessages.noData,
    //     };
    // }

    // getTirePressureStyle(pressure, unit, wSize = 'medium') {
    //     const styles = {
    //         normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText },
    //         statLow: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.orangeColor },
    //         statCrit: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.redColor },
    //         offset: 10,
    //     };
    //     let p = parseFloat(pressure);
    //     if (p) {
    //         let low = this.widgetConfig.tirePressureThresholds.low;
    //         let crit = this.widgetConfig.tirePressureThresholds.critical;
    //         switch (unit) {
    //             case 'kPa':
    //                 low = this.widgetConfig.tirePressureThresholds.low / 0.145377;
    //                 crit = this.widgetConfig.tirePressureThresholds.critical / 0.145377;
    //                 break;
    //             case 'bar':
    //                 low = this.widgetConfig.tirePressureThresholds.low / 14.5377;
    //                 crit = this.widgetConfig.tirePressureThresholds.critical / 14.5377;
    //                 break;
    //         }
    //         if (p >= 0 && p > crit && p < low) {
    //             // console.log(`Tire Pressure Low(${low}) | Pressure ${p} | Func: (${p >= 0 && p > crit && p < low})`);
    //             return styles.statLow;
    //         } else if (p >= 0 && p < crit) {
    //             // console.log(`Tire Pressure Critical(${crit}) | Pressure ${p} | Func: (${p < crit && p >= 0})`);
    //             return styles.statCrit;
    //         } else {
    //             // console.log(`Tire Pressure | Pressure ${p}`);
    //             return styles.normTxt;
    //         }
    //     }
    //     // console.log(`Tire Pressure | Pressure ${p}`);
    //     return styles.normTxt;
    // }

    // async createTimeStampElement(srcRow, vData, position = 'center', fontSize = undefined) {
    //     try {
    //         let refreshTime = this.FPW.getLastRefreshElapsedString(vData) || this.textMap.UIValues.unknown;
    //         if (position === 'center' || position === 'right') {
    //             srcRow.addSpacer();
    //         }
    //         await this.WidgetHelpers.createText(srcRow, 'Updated: ' + refreshTime, { font: Font.mediumSystemFont(fontSize || this.FPW.sizeMap[wSize].fontSizeSmall), textColor: this.colorMap.normalText, textOpacity: 0.6, lineLimit: 1 });
    //         if (position === 'center' || position === 'left') {
    //             srcRow.addSpacer();
    //         }
    //     } catch (e) {
    //         this.FPW.logger(`createTimeStampElement() Error: ${e}`, true);
    //     }
    // }

    // async imgBtnRowBuilder(srcRow, elemWidth, widthPerc, elemHeight, icon) {
    //     const btnCol = await this.WidgetHelpers.createColumn(srcRow, { '*setPadding': [5, 0, 5, 0], size: new Size(Math.round(elemWidth * widthPerc), elemHeight), cornerRadius: 8, borderWidth: 2, borderColor: Color.darkGray() });
    //     btnCol.addSpacer(); // Pushes Button column down to help center in middle

    //     const btnImgRow = await this.WidgetHelpers.createRow(btnCol, { '*setPadding': [0, 0, 0, 0] });
    //     btnImgRow.addSpacer();
    //     await this.WidgetHelpers.createImage(btnImgRow, icon.image, icon.opts);
    //     btnImgRow.addSpacer();
    //     btnCol.addSpacer(); // Pushes Button column up to help center in middle
    // }

    // async createWidgetButtonRow(srcRow, vData, rowWidth, rowHeight = 40, btnSize = 24) {
    //     const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
    //     const buttonRow = await this.WidgetHelpers.createRow(srcRow, { '*setPadding': [0, 0, 0, Math.round(rowWidth * 0.05)], spacing: 10 });

    //     const buttons = [{
    //             show: caps && caps.includes('DOOR_LOCK_UNLOCK'),
    //             icon: {
    //                 image: await this.FPW.Files.getImage(this.FPW.darkMode ? 'lock_btn_dark.png' : 'lock_btn_light.png'),
    //                 opts: { url: await this.FPW.buildCallbackUrl({ command: 'lock_command' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
    //             },
    //         },
    //         {
    //             show: caps && caps.includes('REMOTE_START'),
    //             icon: {
    //                 image: await this.FPW.Files.getImage(this.FPW.darkMode ? 'ignition_dark.png' : 'ignition_light.png'),
    //                 opts: { resizable: true, url: await this.FPW.buildCallbackUrl({ command: 'start_command' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
    //             },
    //         },
    //         {
    //             show: caps && caps.includes('REMOTE_PANIC_ALARM'),
    //             icon: {
    //                 image: await this.FPW.Files.getImage(this.FPW.darkMode ? 'horn_lights_dark.png' : 'horn_lights_light.png'),
    //                 opts: { resizable: true, url: await this.FPW.buildCallbackUrl({ command: 'horn_and_lights' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
    //             },
    //         },
    //         {
    //             show: true,
    //             icon: {
    //                 image: await this.FPW.Files.getImage(this.FPW.darkMode ? 'menu_btn_dark.png' : 'menu_btn_light.png'),
    //                 opts: { resizable: true, url: await this.FPW.buildCallbackUrl({ command: 'show_menu' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
    //             },
    //         },
    //         {
    //             show: false,
    //             icon: {
    //                 image: await this.FPW.Files.getImage('FP_Logo.png'),
    //                 opts: { resizable: true, url: await this.FPW.buildCallbackUrl({ command: 'open_fp_app' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
    //             },
    //         },
    //     ];

    //     let buttonsToShow = buttons.filter((btn) => btn.show === true);
    //     buttonRow.size = new Size(Math.round(rowWidth * (0.2 * buttonsToShow.length)), rowHeight);
    //     for (const [i, btn] of buttonsToShow.entries()) {
    //         await this.imgBtnRowBuilder(buttonRow, Math.round(rowWidth * 0.2), Math.round(buttonsToShow.length / 100), rowHeight, btn.icon);
    //     }
    // }

    // async hasStatusMsg(vData) {
    //     return vData.error || (!vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') || vData.deepSleepMode || vData.firmwareUpdating || this.FPW.getStateVal('updateAvailable') === true; //|| (!vData.evVehicle && vData.oilLow)
    // }

    // async createStatusElement(stk, vData, maxMsgs = 2, wSize = 'medium') {
    //     try {
    //         let cnt = 0;
    //         const hasStatusMsg = await this.WidgetHelpers.hasStatusMsg(vData);
    //         // Creates Elements to display any errors in red at the bottom of the widget
    //         if (vData.error) {
    //             // stk.addSpacer(5);
    //             await this.WidgetHelpers.createText(stk, vData.error ? 'Error: ' + vData.error : '', { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.red() });
    //         } else {
    //             if (cnt < maxMsgs && !vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') {
    //                 stk.addSpacer(cnt > 0 ? 5 : 0);
    //                 await this.WidgetHelpers.createText(stk, `\u2022 12V Battery Low`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.red(), lineLimit: 1 });
    //                 cnt++;
    //             }
    //             // if (cnt < maxMsgs && !vData.evVehicle && vData.oilLow) {
    //             //     stk.addSpacer(cnt > 0 ? 5 : 0);
    //             //     await createText(stk, `\u2022 Oil Reporting Low`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.red(), lineLimit: 1 });
    //             //     cnt++;
    //             // }
    //             if (cnt < maxMsgs && vData.deepSleepMode) {
    //                 stk.addSpacer(cnt > 0 ? 5 : 0);
    //                 await this.WidgetHelpers.createText(stk, `\u2022 Deep Sleep Mode`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.orange(), lineLimit: 1 });
    //                 cnt++;
    //             }
    //             if (cnt < maxMsgs && vData.firmwareUpdating) {
    //                 stk.addSpacer(cnt > 0 ? 5 : 0);
    //                 await this.WidgetHelpers.createText(stk, `\u2022 Firmware Updating`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.green(), lineLimit: 1 });
    //                 cnt++;
    //             }
    //             if (cnt < maxMsgs && this.FPW.getStateVal('updateAvailable') === true) {
    //                 stk.addSpacer(cnt > 0 ? 5 : 0);
    //                 await this.WidgetHelpers.createText(stk, `\u2022 Script Update: v${this.FPW.getStateVal('LATEST_VERSION')}`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.orange(), lineLimit: 1 });
    //                 cnt++;
    //             }
    //         }
    //         if (!hasStatusMsg) {
    //             // await this.WidgetHelpers.createText(stk, `     `, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText, lineLimit: 1 });
    //         }
    //         return stk;
    //     } catch (e) {
    //         this.FPW.logger(`createStatusElement() Error: ${e}`, true);
    //     }
    // }
};
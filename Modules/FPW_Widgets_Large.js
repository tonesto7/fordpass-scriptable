const fm = FileManager.iCloud();
const FPW_WidgetHelpers = importModule(fm.joinPath(fm.documentsDirectory(), 'FPWModules') + '/FPW_Widgets_Helpers.js');

module.exports = class FPW_Widgets_Large {
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
            // case 'simple':
            //     return await this.simpleWidget(vData);
            default: return await this.detailedWidget(vData);
        }
    }

    async detailedWidget(vData) {
        const wSize = 'large';
        // Defines the Widget Object
        const widget = new ListWidget();
        widget.backgroundGradient = this.FPW.getBgGradient();
        try {
            const { width, height } = this.widgetSize[wSize];
            let paddingTop = Math.round(height * 0.05);
            let paddingLeft = Math.round(width * 0.05);
            console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            widget.setPadding(0, 0, 0, 0);

            const isEV = vData.evVehicle === true;
            let dtePostfix = isEV ? 'Range' : 'to E';
            let distanceMultiplier = (await this.FPW.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
            let distanceUnit = (await this.FPW.useMetricUnits()) ? 'km' : 'mi'; // unit of length

            // vData.deepSleepMode = true;
            // vData.firmwareUpdating = true;
            const hasStatusMsg = await this.WidgetHelpers.hasStatusMsg(vData);
            const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;

            //*****************
            //* TOP ROW
            //*****************
            const topRowContainer = await this.WidgetHelpers.createRow(widget, { '*setPadding': [paddingTop, paddingLeft, 0, 0], size: new Size(Math.round(width * 1), Math.round(height * 0.35)) });

            //*****************
            //* TOP LEFT COLUMN
            //*****************

            let topRowLeftCol = await this.WidgetHelpers.createColumn(topRowContainer, { '*setPadding': [0, 0, 0, 0], '*bottomAlignContent': null });

            // Vehicle Title
            const vehicleNameContainer = await this.WidgetHelpers.createRow(topRowLeftCol, { '*setPadding': [0, 0, 0, 0] });
            let vehicleNameStr = vData.info.vehicle.vehicleType || '';

            let vehicleNameSize = 24;
            if (vehicleNameStr.length >= 10) {
                vehicleNameSize = vehicleNameSize - Math.round(vehicleNameStr.length / 4);
            }
            await this.WidgetHelpers.createText(vehicleNameContainer, vehicleNameStr, { font: Font.semiboldSystemFont(vehicleNameSize), textColor: this.colorMap.normalText });
            vehicleNameContainer.addSpacer(); // Pushes the vehicle name to the left

            topRowLeftCol.addSpacer();
            const topRowInfoContainer = await this.WidgetHelpers.createRow(topRowLeftCol, { '*setPadding': [0, paddingLeft, 0, 0], '*bottomAlignContent': null });
            topRowInfoContainer.addSpacer();
            // Creates Battery Level Elements
            await this.createBatteryElement(topRowLeftCol, vData, wSize, 'left');

            // Creates Oil Life Elements
            if (!vData.evVehicle) {
                await this.createOilElement(topRowLeftCol, vData, wSize, 'left');
            } else {
                // Creates EV Plug Elements
                await this.createEvChargeElement(topRowLeftCol, vData, wSize, 'left');
            }
            topRowLeftCol.addSpacer();

            //*********************
            //* TOP RIGHT COLUMN
            //*********************

            let topRowRightCol = await this.WidgetHelpers.createColumn(topRowContainer, { '*setPadding': [0, 0, 0, 0] });
            topRowRightCol.addSpacer(); // Pushes Content to the middle to help center

            // Vehicle Image Container
            let imgWidth = Math.round(width * 0.4);
            let imgHeight = Math.round(height * 0.25);
            const carImageContainer = await this.WidgetHelpers.createRow(topRowRightCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            carImageContainer.addSpacer();
            await this.WidgetHelpers.createImage(carImageContainer, await this.FPW.Files.getVehicleImage(vData.info.vehicle.modelYear, false, 1), { '*rightAlignImage': null, resizable: true });
            carImageContainer.addSpacer();
            topRowRightCol.addSpacer(); // Pushes Content to the middle to help center

            //*******************************
            //* FUEL/BATTERY BAR CONTAINER
            //*******************************
            // Creates the Fuel/Battery Info Elements
            const fuelBattRow = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, paddingLeft, 0, paddingLeft] });

            // Fuel/Battery Section
            const fuelBattCol = await this.WidgetHelpers.createColumn(fuelBattRow, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null, size: new Size(Math.round(width * 1), Math.round(height * 0.14)) });

            // Fuel/Battery Level BAR
            const barRow = await this.WidgetHelpers.createRow(fuelBattCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
            let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;
            barRow.addSpacer();
            await this.WidgetHelpers.createImage(barRow, await this.WidgetHelpers.createProgressBar(lvlValue ? lvlValue : 50, vData, wSize), { '*centerAlignImage': null, imageSize: new Size(this.FPW.sizeMap[wSize].barGauge.w, this.FPW.sizeMap[wSize].barGauge.h + 3) });
            barRow.addSpacer();

            // Distance/Range to Empty
            const dteRow = await this.WidgetHelpers.createRow(fuelBattCol, { '*topAlignContent': null });
            let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.textMap.errorMessages.noData;
            dteRow.addSpacer();
            await this.WidgetHelpers.createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.systemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText, lineLimit: 1 });
            dteRow.addSpacer();
            fuelBattRow.addSpacer();
            fuelBattCol.addSpacer();

            //*****************
            //* Row 3 Container
            //*****************
            const row3Container = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, 0, 0, 0] });

            row3Container.addSpacer();
            const row3LeftCol = await this.WidgetHelpers.createColumn(row3Container, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(width * 0.333), Math.round(height * 0.3)) });
            // Creates the Lock Status Elements
            await this.createLockStatusElement(row3LeftCol, vData, wSize);
            row3LeftCol.addSpacer(); // Pushes Row 3 Left content to top
            // Creates the Door Status Elements
            await this.WidgetHelpers.createDoorElement(row3LeftCol, vData, wSize);

            row3LeftCol.addSpacer(); // Pushes Row 3 Left content to top

            const row3CenterCol = await this.WidgetHelpers.createColumn(row3Container, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(width * 0.333), Math.round(height * 0.3)) });
            row3CenterCol.addSpacer(); // Pushes Row 3 Left content to top
            // Create Tire Pressure Elements
            await this.WidgetHelpers.createTireElement(row3CenterCol, vData, wSize);
            row3CenterCol.addSpacer(); // Pushes Row 3 Left content to top
            row3CenterCol.addSpacer(); // Pushes Row 3 Left content to top

            const row3RightCol = await this.WidgetHelpers.createColumn(row3Container, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(width * 0.333), Math.round(height * 0.3)) });
            // Creates the Ignition Status Elements
            await this.createIgnitionStatusElement(row3RightCol, vData, wSize);
            row3RightCol.addSpacer(); // Pushes Row 3 Right content to top
            // Creates the Window Status Elements
            await this.WidgetHelpers.createWindowElement(row3RightCol, vData, wSize);
            row3RightCol.addSpacer(); // Pushes Row 3 Right content to top

            row3Container.addSpacer();

            const row5Container = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, 0, 0, 0] });
            const row5CenterCol = await this.WidgetHelpers.createColumn(row5Container, { '*setPadding': [0, 0, 0, 0] });
            // Creates the Vehicle Location Element
            await this.createPositionElement(row5CenterCol, vData, wSize, 'center');

            widget.addSpacer(); // Pushes all content to the top

            // //*****************************
            // //* COMMAND BUTTONS CONTAINER
            // //*****************************
            const controlsContainer = await this.WidgetHelpers.createRow(widget, { '*setPadding': [10, paddingLeft, 10, paddingLeft] });
            controlsContainer.addSpacer();
            await this.WidgetHelpers.createWidgetButtonRow(controlsContainer, vData, width, 40, 24);
            controlsContainer.addSpacer();

            // //**********************
            // //* Status Row
            // //*********************

            // if (hasStatusMsg) {
            //     let statusRow = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, paddingLeft, 3, 0], '*bottomAlignContent': null, size: new Size(Math.round(width * 1), Math.round(height * 0.075)) });
            //     await this.WidgetHelper.createStatusElement(statusRow, vData, 3, wSize);
            //     statusRow.addSpacer();
            // }

            // Displays the Last Vehicle Checkin Time Elapsed...
            let timestampRow = await this.WidgetHelpers.createRow(widget, { '*setPadding': [3, 0, 3, 0] });
            await this.WidgetHelpers.createTimeStampElement(timestampRow, vData, 'center', 8);
        } catch (e) {
            this.FPW.logger(`detailedWidget(large) Error: ${e}`, true);
        }
        return widget;
    }

    async createBatteryElement(srcStack, vData, wSize = 'medium', position = 'center') {
        try {
            const styles = {
                normal: { font: Font.systemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.colorMap.normalText, lineLimit: 1 },
                warning: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.colorMap.orangeColor, lineLimit: 1 },
                critical: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.colorMap.redColor, lineLimit: 1 },
            };
            const titleRow = await this.WidgetHelpers.createRow(srcStack, { '*setPadding': [0, 0, 3, 0] });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.WidgetHelpers.createTitle(titleRow, 'batteryStatus', wSize);
            titleRow.addSpacer(3);
            let txtStyle = styles.normal;
            let value = vData.batteryLevel ? `${vData.batteryLevel}V` : 'N/A';
            // console.log(`batteryLevel: ${value}`);
            let lowBattery = vData.batteryStatus === 'STATUS_LOW' ? true : false;
            if (lowBattery) {
                txtStyle = styles.critical;
            }
            await this.WidgetHelpers.createText(titleRow, value, txtStyle);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }
        } catch (e) {
            this.FPW.logger(`createBatteryElement() Error: ${e}`, true);
        }
    }

    async createOilElement(srcStack, vData, wSize = 'medium', position = 'center') {
        try {
            const styles = {
                normal: { font: Font.systemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.colorMap.normalText, lineLimit: 1 },
                warning: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.colorMap.orangeColor, lineLimit: 1 },
                critical: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.colorMap.redColor, lineLimit: 1 },
            };
            const titleRow = await this.WidgetHelpers.createRow(srcStack, { '*setPadding': [0, 0, 3, 0] });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.WidgetHelpers.createTitle(titleRow, 'oil', wSize);
            titleRow.addSpacer(3);
            let txtStyle = styles.normal;
            if (vData.oilLife && vData.oilLife >= 0 && vData.oilLife <= 25) {
                txtStyle = styles.warning;
            }
            // console.log(`oilLife: ${vData.oilLife}`);
            let text = vData.oilLife ? `${vData.oilLife}%` : this.textMap.errorMessages.noData;
            await this.WidgetHelpers.createText(titleRow, text, txtStyle);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }
        } catch (e) {
            this.FPW.logger(`createOilElement() Error: ${e}`, true);
        }
    }

    async createEvChargeElement(srcStack, vData, wSize = 'medium', position = 'center') {
        try {
            const txtStyle = { font: Font.systemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.colorMap.normalText, lineLimit: 1 };
            const titleRow = await this.WidgetHelpers.createRow(srcStack, { '*setPadding': [0, 0, 3, 0] });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.WidgetHelpers.createTitle(titleRow, 'evChargeStatus', wSize);
            titleRow.addSpacer(2);
            let value = vData.evChargeStatus ? `${vData.evChargeStatus}` : this.textMap.errorMessages.noData;
            // console.log(`battery charge: ${value}`);
            await this.WidgetHelpers.createText(titleRow, value, txtStyle);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }
        } catch (e) {
            this.FPW.logger(`createEvChargeElement() Error: ${e}`, true);
        }
    }

    async createPositionElement(srcStack, vData, wSize = 'medium', position = 'center') {
        try {
            const titleRow = await this.WidgetHelpers.createRow(srcStack);
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.WidgetHelpers.createTitle(titleRow, 'position', wSize, false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            const valueRow = await this.WidgetHelpers.createRow(srcStack, { '*centerAlignContent': null });
            let url = (await this.FPW.getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vData.latitude},${vData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vData.info.vehicle.nickName)}&ll=${vData.latitude},${vData.longitude}`;
            let value = vData.position ? (this.widgetConfig.screenShotMode ? '1234 Someplace Drive, Somewhere' : `${vData.position}`) : this.textMap.errorMessages.noData;
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            await this.WidgetHelpers.createText(valueRow, value, { url: url, font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText, lineLimit: 2, minimumScaleFactor: 0.9 });
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
        } catch (e) {
            this.FPW.logger(`createPositionElement() Error: ${e}`, true);
        }
    }

    async createLockStatusElement(srcStack, vData, wSize = 'medium', position = 'center') {
        try {
            const styles = {
                unlocked: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 1 },
                locked: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 1 },
            };
            let titleRow = await this.WidgetHelpers.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.WidgetHelpers.createTitle(titleRow, 'lockStatus', wSize, false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            let valueRow = await this.WidgetHelpers.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
            let value = vData.lockStatus ? vData.lockStatus.toLowerCase().charAt(0).toUpperCase() + vData.lockStatus.toLowerCase().slice(1) : this.textMap.errorMessages.noData;
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            await this.WidgetHelpers.createText(valueRow, value, vData.lockStatus !== undefined && vData.lockStatus === 'LOCKED' ? styles.locked : styles.unlocked);
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
        } catch (e) {
            this.FPW.logger(`createLockStatusElement() Error: ${e}`, true);
        }
    }

    async createIgnitionStatusElement(srcStack, vData, wSize = 'medium', position = 'center') {
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
            let titleRow = await this.WidgetHelpers.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.WidgetHelpers.createTitle(titleRow, 'ignitionStatus', wSize, false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            let valueRow = await this.WidgetHelpers.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            await this.WidgetHelpers.createText(valueRow, status, vData.ignitionStatus !== undefined && (vData.ignitionStatus === 'On' || vData.ignitionStatus === 'Run' || remStartOn) ? styles.on : styles.off);
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
        } catch (e) {
            this.FPW.logger(`createIgnitionStatusElement() Error: ${e}`, true);
        }
    }
};
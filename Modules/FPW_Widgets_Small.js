// const fm = FileManager.iCloud();
// const FPW_WidgetHelpers = importModule(fm.joinPath(fm.documentsDirectory(), 'FPWModules') + '/FPW_Widgets_Helpers.js');

module.exports = class FPW_Widgets_Small {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.wSize = 'small';
        this.widgetConfig = FPW.widgetConfig;
        this.sizeMap = FPW.sizeMap;
        this.textMap = FPW.textMap();
        this.iconMap = FPW.iconMap;
        this.colorMap = FPW.colorMap;
        this.colorMode = 'system';
    }

    async createWidget(vData, style = undefined, background = undefined, colorMode = 'system') {
        const wStyle = await this.FPW.getWidgetStyle();
        style = style || wStyle;
        background = background || 'system';
        this.colorMode = colorMode;
        switch (style) {
            case 'simple':
                return await this.simpleWidget(vData, background);
            case 'detailed':
                return await this.detailedWidget(vData, background);
        }
    }

    async simpleWidget(vData, bgType = undefined) {
        // Defines the Widget Object
        const widget = new ListWidget();
        widget.setPadding(0, 0, 0, 0);
        this.FPW.setWidgetBackground(widget, bgType);
        try {
            const widgetSizes = await this.FPW.getViewPortSizes(this.wSize);
            console.log(`widgetSizes: ${JSON.stringify(widgetSizes)}`);
            const { width, height } = widgetSizes;
            let paddingTop = Math.round(height * 0.09);
            // let paddingLeft = Math.round(width * 0.07);
            let paddingLeft = 8;
            // console.log(`padding | Left: ${paddingLeft}`);
            //************************
            //* TOP LEFT BOX CONTAINER
            //************************
            const topBox = await this.createRow(widget, { '*setPadding': [paddingTop, paddingLeft, 0, 0] });

            // ---Top left part---
            const topLeftContainer = await this.createRow(topBox, {});

            // Vehicle Title
            const vehicleNameContainer = await this.createRow(topLeftContainer, { '*setPadding': [0, 0, 0, 0] });

            let vehicleNameStr = vData.info.vehicle.vehicleType || '';
            // get dynamic size
            let vehicleNameSize = Math.round(width * 0.12);
            if (vehicleNameStr.length >= 10) {
                vehicleNameSize = vehicleNameSize - Math.round(vehicleNameStr.length / 4);
            }
            await this.createText(vehicleNameContainer, vehicleNameStr, { font: Font.semiboldSystemFont(vehicleNameSize), textColor: this.colorMap.text[this.colorMode], '*leftAlignText': null });
            // ---The top left part is finished---
            topBox.addSpacer();

            //************************
            //* TOP Right BOX CONTAINER
            //************************

            // ---The top right part is finished---
            //***********************************
            //* MIDDLE ROW CONTAINER
            //***********************************
            const carInfoContainer = await this.createColumn(widget, { '*setPadding': [8, paddingLeft, 0, 0] });

            // ****************************************
            // * LEFT BODY COLUMN CONTAINER
            // ****************************************

            // Range and Odometer
            const miContainer = await this.createRow(carInfoContainer, { '*bottomAlignContent': null });

            try {
                const { isEV, lvlValue, dteValue, odometerVal, dtePostfix, distanceMultiplier, distanceUnit, dteInfo } = await this.getRangeData(vData);

                // DTE Text
                await this.createText(miContainer, `${dteInfo}`, { font: Font.systemFont(16), textColor: this.colorMap.text[this.colorMode], textOpacity: 0.7 });

                let levelContainer = await this.createRow(miContainer, {});
                // DTE + Level Separator
                await this.createText(levelContainer, ' / ', { font: Font.systemFont(14), textColor: this.colorMap.text[this.colorMode], textOpacity: 0.6 });
                // Level Text
                await this.createText(levelContainer, `${lvlValue}%`, { font: Font.systemFont(16), textColor: this.colorMap.text[this.colorMode], textOpacity: 0.6 });

                // Odometer Text
                let mileageContainer = await this.createRow(carInfoContainer, { '*bottomAlignContent': null });
                await this.createText(mileageContainer, `Odometer: ${odometerVal}`, { font: Font.systemFont(9), textColor: this.colorMap.text[this.colorMode], textOpacity: 0.7 });
            } catch (e) {
                console.error(e.message);
                miContainer.addText('Error Getting Range Data');
            }

            // Car Status box
            const carStatusContainer = await this.createColumn(carInfoContainer, { '*setPadding': [4, 0, 4, 0] });
            const carStatusBox = await this.createRow(carStatusContainer, { '*setPadding': [3, 3, 3, 3], '*centerAlignContent': null, cornerRadius: 4, backgroundColor: Color.dynamic(new Color('#f5f5f8', 0.45), new Color('#fff', 0.2)), size: new Size(Math.round(width * 0.55), Math.round(height * 0.12)) });
            try {
                const doorsLocked = vData.lockStatus === 'LOCKED';
                const carStatusRow = await this.createRow(carStatusBox, { '*setPadding': [0, 0, 0, 0] });
                carStatusRow.addSpacer();
                await this.createText(carStatusRow, `${doorsLocked ? 'Locked' : 'Unlocked'}`, {
                    '*centerAlignText': null,
                    font: doorsLocked ? Font.systemFont(10) : Font.heavySystemFont(this.sizeMap[this.wSize].fontSizeMedium),
                    textColor: doorsLocked ? this.colorMap.text[this.colorMode] : this.colorMap.openColor,
                    textOpacity: 0.7,
                    '*centerAlignText': null,
                });
                carStatusRow.addSpacer();
            } catch (e) {
                console.error(e.message);
                carStatusRow.addText(`Lock Status Failed`);
            }
            carStatusBox.addSpacer();

            // Vehicle Image Container
            const carImageContainer = await this.createRow(widget, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            carImageContainer.addSpacer();
            let canvasWidth = Math.round(width * 0.85);
            let canvasHeight = Math.round(width * 0.35);

            // let image = await this.getCarCanvasImage(data, canvasWidth, canvasHeight, 0.95);
            await this.createImage(carImageContainer, await this.FPW.Files.getVehicleImage(vData.info.vehicle.modelYear, false, 1), { imageSize: new Size(canvasWidth, canvasHeight), resizable: true, '*rightAlignImage': null });

            // Creates the Door/Window Status Message

            //**************************
            //* BOTTOM ROW CONTAINER
            //**************************
            widget.addSpacer(); // Pushes Timestamp to the bottom

            // Displays the Last Vehicle Checkin Time Elapsed...
            const timestampRow = await this.createRow(widget, { '*setPadding': [5, 0, 5, 0] });
            await this.createTimeStampElement(timestampRow, vData, 'center', 8);

            // ***************** RIGHT BODY CONTAINER END *****************
        } catch (e) {
            await this.FPW.logger(`simpleWidget(small) Error: ${e}`, true);
        }
        return widget;
    }

    async createDoorWindowText(srcElem, vData) {
        try {
            const styles = {
                open: { font: Font.semiboldSystemFont(10), textColor: new Color('#FF5733'), lineLimit: 1 },
                closed: { font: Font.systemFont(10), textColor: this.colorMap.lighterText, textOpacity: 0.5, lineLimit: 1 },
            };
            let container = await this.createRow(srcElem, { '*setPadding': [6, 0, 12, 0] });
            container.addSpacer();
            let doorsOpen = await this.FPW.getOpenItems(vData.statusDoors); //['LF', 'RR', 'HD'];
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

            let windowsOpen = await this.FPW.getOpenItems(vData.statusWindows);
            let openStatus = 'All Doors and Windows Closed';
            if (Object.keys(doorsOpen).length > 0 || Object.keys(windowsOpen).length > 0) {
                openStatus = doorsOpen.length ? `${doorsOpen.length} Doors Open` : 'All Doors Closed, ';
                openStatus += hoodOpen ? `Hood Open, ${tailgateOpen ? '' : 'and '}` : '';
                openStatus += tailgateOpen ? `Tailgate Open, and ` : '';
                openStatus += windowsOpen.length ? `${windowsOpen.length} Windows Open` : 'All Windows Closed';
            }
            console.log(`openStatus: ${openStatus}`);
            const alertStatus = Object.keys(doorsOpen).length > 0 || Object.keys(windowsOpen).length > 0 || hoodOpen || tailgateOpen;
            await this.createText(container, openStatus, alertStatus ? styles.open : styles.closed);
            container.addSpacer();
        } catch (err) {
            await this.FPW.logError(`createDoorWindowText(medium) ${err}`);
        }
        return srcElem;
    }

    async detailedWidget(vData, bgType = undefined) {
        // Defines the Widget Object
        const widget = new ListWidget();
        this.FPW.setWidgetBackground(widget, bgType);
        try {
            const widgetSizes = await this.FPW.getViewPortSizes(this.wSize);
            console.log(`widgetSizes: ${JSON.stringify(widgetSizes)}`);
            const { width, height } = widgetSizes;
            let paddingTop = Math.round(height * 0.08);
            let paddingLeft = Math.round(width * 0.04);
            console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            // vData.deepSleepMode = true;
            // vData.firmwareUpdating = true;
            const hasStatusMsg = await this.hasStatusMsg(vData);

            let bodyContainer = await this.createRow(widget, { '*setPadding': [0, 0, 0, 0] });

            //*****************
            //* First column
            //*****************
            let mainCol1 = await this.createColumn(bodyContainer, { '*setPadding': [paddingTop, paddingLeft, 0, 0], size: new Size(Math.round(width * 0.5), Math.round(height * 0.85)) });

            // Vehicle Logo
            await this.createVehicleImageElement(mainCol1, vData, this.sizeMap[this.wSize].logoSize.w, this.sizeMap[this.wSize].logoSize.h);

            // Creates the Vehicle Logo, Odometer, Fuel/Battery and Distance Info Elements
            await this.createFuelRangeElements(mainCol1, vData);

            // Creates Low-Voltage Battery Voltage Elements
            await this.createBatteryElement(mainCol1, vData);

            // Creates Oil Life Elements
            if (!vData.evVehicle) {
                await this.createOilElement(mainCol1, vData);
            } else {
                // Creates EV Plug Elements
                await this.createEvChargeElement(mainCol1, vData);
            }
            mainCol1.addSpacer();
            // bodyContainer.addSpacer();

            //************************
            //* Second column
            //************************
            let mainCol2 = await this.createColumn(bodyContainer, { '*setPadding': [paddingTop, 0, 0, 0], size: new Size(Math.round(width * 0.5), Math.round(height * 0.85)) });

            // Creates the Lock Status Elements
            await this.createLockStatusElement(mainCol2, vData, 'left');

            // Creates the Ignition Status Elements
            await this.createIgnitionStatusElement(mainCol2, vData, 'left');

            // Creates the Door Status Elements
            await this.createDoorElement(mainCol2, vData, 'left');

            // Creates the Door Status Elements
            await this.createWindowElement(mainCol2, vData, 'left');

            mainCol2.addSpacer();

            // bodyContainer.addSpacer();

            //**********************
            //* Refresh and error
            //*********************
            if (hasStatusMsg) {
                let statusRow = await this.createRow(widget, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
                await this.createStatusElement(statusRow, vData, 1);
            } else {
                widget.addSpacer();
            }
            // Displays the Last Vehicle Checkin Time Elapsed...
            let timestampRow = await this.createRow(widget, { '*setPadding': [3, 0, 5, paddingLeft], '*bottomAlignContent': null });
            await this.createTimeStampElement(timestampRow, vData, 'center', 8);
        } catch (e) {
            await this.FPW.logger(`detailedWidget(small) Error: ${e}`, true);
        }
        return widget;
    }

    async createRangeElements(srcElem, vData) {
        try {
            const isEV = vData.evVehicle === true;
            let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
            let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;
            let dtePostfix = isEV ? 'Range' : 'to E';
            let distanceMultiplier = (await this.FPW.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
            let distanceUnit = (await this.FPW.useMetricUnits()) ? 'km' : 'mi'; // unit of length

            // Fuel/Battery Section
            let elemCol = await this.createColumn(srcElem, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

            // Fuel/Battery Level BAR
            let barRow = await this.createRow(elemCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            await this.createImage(barRow, await this.createProgressBar(lvlValue ? lvlValue : 50, vData), { '*centerAlignImage': null, imageSize: new Size(this.sizeMap[this.wSize].barGauge.w, this.sizeMap[this.wSize].barGauge.h + 3) });

            // Distance/Range to Empty
            let dteRow = await this.createRow(elemCol, { '*centerAlignContent': null, '*topAlignContent': null });
            let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.textMap.errorMessages.noData;
            await this.createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.regularSystemFont(this.sizeMap[this.wSize].fontSizeSmall), textColor: this.colorMap.text[this.colorMode], lineLimit: 1 });
            srcElem.addSpacer(3);
        } catch (e) {
            await this.FPW.logger(`createFuelRangeElements() Error: ${e}`, true);
        }
    }

    async createFuelRangeElements(srcElem, vData) {
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
            let elemCol = await this.createColumn(srcElem, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

            // Fuel/Battery Level BAR
            let barRow = await this.createRow(elemCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            await this.createImage(barRow, await this.createProgressBar(lvlValue ? lvlValue : 50, vData), { '*centerAlignImage': null, imageSize: new Size(this.sizeMap[this.wSize].barGauge.w, this.sizeMap[this.wSize].barGauge.h + 3) });

            // Distance to Empty
            let dteRow = await this.createRow(elemCol, { '*centerAlignContent': null, '*topAlignContent': null });
            let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.textMap.errorMessages.noData;
            await this.createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.regularSystemFont(this.sizeMap[this.wSize].fontSizeSmall), textColor: this.colorMap.text[this.colorMode], lineLimit: 1 });
            srcElem.addSpacer(3);
        } catch (e) {
            await this.FPW.logger(`createFuelRangeElements() Error: ${e}`, true);
        }
    }

    async createBatteryElement(srcElem, vData) {
        try {
            let elem = await this.createRow(srcElem, { '*layoutHorizontally': null, '*bottomAlignContent': null });
            await this.createTitle(elem, 'batteryStatus', true, this.FPW.isSmallDisplay || this.wSize === 'small');
            elem.addSpacer(2);
            let value = vData.batteryLevel ? `${vData.batteryLevel}V` : 'N/A';
            // console.log(`batteryLevel: ${value}`);
            let lowBattery = vData.batteryStatus === 'STATUS_LOW' ? true : false;
            await this.createText(elem, value, { font: Font.regularSystemFont(this.sizeMap[this.wSize].fontSizeSmall), textColor: lowBattery ? Color.red() : this.FPW.colorMap.text[this.colorMode], lineLimit: 1 });
            srcElem.addSpacer(3);
        } catch (e) {
            await this.FPW.logger(`createBatteryElement() Error: ${e}`, true);
        }
    }

    async createOilElement(srcElem, vData) {
        try {
            const styles = {
                normal: { font: Font.regularSystemFont(this.sizeMap[this.wSize].fontSizeSmall), textColor: this.colorMap.text[this.colorMode], lineLimit: 1 },
                warning: { font: Font.regularSystemFont(this.sizeMap[this.wSize].fontSizeSmall), textColor: new Color('#FF6700'), lineLimit: 1 },
                critical: { font: Font.regularSystemFont(this.sizeMap[this.wSize].fontSizeSmall), textColor: new Color('#DE1738'), lineLimit: 1 },
            };
            let elem = await this.createRow(srcElem, { '*layoutHorizontally': null, '*bottomAlignContent': null });
            await this.createTitle(elem, 'oil', true, this.FPW.isSmallDisplay || this.wSize === 'small');
            elem.addSpacer(2);
            let txtStyle = styles.normal;
            if (vData.oilLife && vData.oilLife >= 0 && vData.oilLife <= 25) {
                txtStyle = styles.warning;
            }
            // console.log(`oilLife: ${vData.oilLife}`);
            let text = vData.oilLife ? `${vData.oilLife}%` : this.textMap.errorMessages.noData;
            await this.createText(elem, text, txtStyle);
            srcElem.addSpacer(3);
        } catch (e) {
            await this.FPW.logger(`createOilElement() Error: ${e}`, true);
        }
    }

    async createEvChargeElement(srcElem, vData) {
        try {
            let elem = await this.createRow(srcElem, { '*layoutHorizontally': null });
            await this.createTitle(elem, 'evChargeStatus', true, this.FPW.isSmallDisplay || this.wSize === 'small');
            elem.addSpacer(2);
            let value = vData.evChargeStatus ? `${vData.evChargeStatus}` : this.textMap.errorMessages.noData;
            // console.log(`battery charge: ${value}`);
            await this.createText(elem, value, { font: Font.regularSystemFont(this.sizeMap[this.wSize].fontSizeSmall), textColor: this.colorMap.text[this.colorMode], lineLimit: 1 });
            srcElem.addSpacer(3);
        } catch (e) {
            await this.FPW.logger(`createEvChargeElement() Error: ${e}`, true);
        }
    }

    // ********************************
    // |.  HELPER FUNCTIONS
    // ********************************

    async createColumn(srcElem, styles = {}) {
        try {
            let col = srcElem.addStack();
            col.layoutVertically();
            if (styles && Object.keys(styles).length > 0) {
                this.FPW._mapMethodsAndCall(col, styles);
            }
            return col;
        } catch (e) {
            await this.FPW.logError(`createColumn Error: ${e}`);
        }
    }

    async createRow(srcElem, styles = {}) {
        try {
            let row = srcElem.addStack();
            row.layoutHorizontally();
            if (styles && Object.keys(styles).length > 0) {
                this.FPW._mapMethodsAndCall(row, styles);
            }
            return row;
        } catch (e) {
            await this.FPW.logError(`createRow Error: ${e}`);
            return null;
        }
    }

    async createText(srcElem, text, styles = {}) {
        let txt = srcElem.addText(text);
        if (styles && Object.keys(styles).length > 0) {
            this.FPW._mapMethodsAndCall(txt, styles);
        }
        return txt;
    }

    async createImage(srcElem, image, styles = {}) {
        let _img = srcElem.addImage(image);
        if (styles && Object.keys(styles).length > 0) {
            this.FPW._mapMethodsAndCall(_img, styles);
        }
        return _img;
    }

    async createTitle(srcElem, titleText, colon = true, hideTitleForSmall = false) {
        let titleParams = titleText.split('||');
        let icon = this.FPW.iconMap[titleParams[0]];
        let titleStack = await this.createRow(srcElem, { '*centerAlignContent': null });
        if (icon !== undefined) {
            let imgFile = await this.FPW.Files.getImage(icon.toString());
            await this.createImage(titleStack, imgFile, { imageSize: new Size(this.sizeMap[this.wSize].iconSize.w, this.sizeMap[this.wSize].iconSize.h), resizable: true });
        }
        // console.log(`titleParams(${titleText}): ${titleParams}`);
        if (titleText && titleText.length && !hideTitleForSmall) {
            titleStack.addSpacer(2);
            let title = titleParams.length > 1 ? this.FPW.textMap(titleParams[1]).elemHeaders[titleParams[0]] : this.FPW.textMap().elemHeaders[titleParams[0]];
            await this.createText(titleStack, `${title}${colon ? ':' : ''}`, { font: Font.boldSystemFont(this.sizeMap[this.wSize].titleFontSize), textColor: this.FPW.colorMap.text[this.colorMode], lineLimit: 1 });
        }
    }

    async createProgressBar(percent, vData) {
        // percent = 12;
        const isEV = vData.evVehicle === true;
        let fillLevel = percent > 100 ? 100 : percent;
        const barWidth = this.sizeMap[this.wSize].barGauge.w;
        const context = new DrawContext();
        context.size = new Size(barWidth, this.sizeMap[this.wSize].barGauge.h + 3);
        context.opaque = false;
        context.respectScreenScale = true;

        // Bar Background Gradient
        const lvlBgPath = new Path();
        lvlBgPath.addRoundedRect(new Rect(0, 0, barWidth, this.sizeMap[this.wSize].barGauge.h), 3, 2);
        context.addPath(lvlBgPath);
        context.setFillColor(Color.lightGray());
        context.fillPath();

        // Bar Level Background
        const lvlBarPath = new Path();
        lvlBarPath.addRoundedRect(new Rect(0, 0, (barWidth * fillLevel) / 100, this.sizeMap[this.wSize].barGauge.h), 3, 2);
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
        context.setFont(Font.mediumSystemFont(this.sizeMap[this.wSize].barGauge.fs));
        context.setTextColor(Color.black());

        // if (fillLevel > 75) {
        //     context.setTextColor(Color.white());
        // }
        const icon = isEV ? String.fromCodePoint('0x1F50B') : '\u26FD';
        const lvlStr = fillLevel < 0 || fillLevel > 100 ? '--' : `${fillLevel}%`;
        context.drawTextInRect(`${icon} ${lvlStr}`, new Rect(xPos, this.sizeMap[this.wSize].barGauge.h / this.sizeMap[this.wSize].barGauge.fs, this.sizeMap[this.wSize].barGauge.w, this.sizeMap[this.wSize].barGauge.h));
        context.setTextAlignedCenter();
        return await context.getImage();
    }

    async createVehicleImageElement(srcElem, vData, width, height, angle = 4) {
        let logoRow = await this.createRow(srcElem, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        if (vData.info !== undefined && vData.info.vehicle !== undefined) {
            await this.createImage(logoRow, await this.FPW.Files.getVehicleImage(vData.info.vehicle.modelYear, false, angle), { imageSize: new Size(width, height), '*centerAlignImage': null, resizable: true });
            srcElem.addSpacer(3);
        }
    }

    async getRangeData(data) {
        const isEV = data.evVehicle === true;
        const dtePostfix = isEV ? 'Range' : 'to E';
        const distanceMultiplier = (await this.FPW.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
        const distanceUnit = (await this.FPW.useMetricUnits()) ? 'km' : 'mi'; // unit of length
        const dteValueRaw = !isEV ? (data.distanceToEmpty ? data.distanceToEmpty : undefined) : data.evDistanceToEmpty ? data.evDistanceToEmpty : undefined;
        return {
            isEV: isEV,
            lvlValue: !isEV ? (data.fuelLevel ? data.fuelLevel : 0) : data.evBatteryLevel ? data.evBatteryLevel : 0,
            dteValue: dteValueRaw ? Math.round(dteValueRaw * distanceMultiplier) : undefined,
            odometerVal: data.odometer ? `${Math.round(data.odometer * distanceMultiplier)} ${distanceUnit}` : this.FPW.textMap().errorMessages.noData,
            dtePostfix: dtePostfix,
            // distanceMultiplier: distanceMultiplier, // distance multiplier
            distanceUnit: distanceUnit, // unit of length
            dteInfo: dteValueRaw ? `${Math.round(dteValueRaw * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.FPW.textMap().errorMessages.noData,
        };
    }

    async createPositionElement(srcStack, vData, position = 'center') {
        try {
            const titleRow = await this.createRow(srcStack);
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'position', false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            const valueRow = await this.createRow(srcStack, { '*centerAlignContent': null });
            let url = (await this.FPW.getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vData.latitude},${vData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vData.info.vehicle.nickName)}&ll=${vData.latitude},${vData.longitude}`;
            let value = vData.position ? (this.widgetConfig.screenShotMode ? '1234 Someplace Drive, Somewhere' : `${vData.position}`) : this.textMap.errorMessages.noData;
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            await this.createText(valueRow, value, { url: url, font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.text[this.colorMode], lineLimit: 2, minimumScaleFactor: 0.9 });
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
        } catch (e) {
            await this.FPW.logger(`createPositionElement() Error: ${e}`, true);
        }
    }

    async createLockStatusElement(srcStack, vData, position = 'center', postSpace = false) {
        try {
            const styles = {
                unlocked: { font: Font.heavySystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 1 },
                locked: { font: Font.heavySystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 1 },
            };
            let titleRow = await this.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'lockStatus', false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            let valueRow = await this.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
            let value = vData.lockStatus ? vData.lockStatus.toLowerCase().charAt(0).toUpperCase() + vData.lockStatus.toLowerCase().slice(1) : this.textMap.errorMessages.noData;
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            await this.createText(valueRow, value, vData.lockStatus !== undefined && vData.lockStatus === 'LOCKED' ? styles.locked : styles.unlocked);
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
            if (postSpace) {
                srcStack.addSpacer();
            }
        } catch (e) {
            await this.FPW.logger(`createLockStatusElement() Error: ${e}`, true);
        }
    }

    async createIgnitionStatusElement(srcStack, vData, position = 'center', postSpace = false) {
        try {
            const styles = {
                on: { font: Font.heavySystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 1, minimumScaleFactor: 0.6 },
                off: { font: Font.heavySystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.closedColor },
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
            let titleRow = await this.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'ignitionStatus', false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            let valueRow = await this.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            await this.createText(valueRow, status, vData.ignitionStatus !== undefined && (vData.ignitionStatus === 'On' || vData.ignitionStatus === 'Run' || remStartOn) ? styles.on : styles.off);
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
            if (postSpace) {
                srcStack.addSpacer();
            }
        } catch (e) {
            await this.FPW.logger(`createIgnitionStatusElement() Error: ${e}`, true);
        }
    }

    async createDoorElement(srcStack, vData, position = 'center', postSpace = false) {
        try {
            const styles = {
                normTxt: { font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.text[this.colorMode], lineLimit: 2 },
                open: { font: Font.heavySystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 2 },
                closed: { font: Font.heavySystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 2 },
                offset: 5,
            };

            let titleRow = await this.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'doors', false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }
            let valueRow = await this.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
            const openDoors = await this.FPW.getOpenItems('createDoorElement2', vData.statusDoors); //['LF', 'RR', 'HD'];
            let value = openDoors.length ? openDoors.join(', ') : 'All Closed';
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            await this.createText(valueRow, value, openDoors.length > 0 ? styles.open : styles.closed);
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
            if (postSpace) {
                srcStack.addSpacer();
            }
        } catch (e) {
            await this.FPW.logger(`createDoorElement() Error: ${e}`, true);
        }
    }

    async createWindowElement(srcStack, vData, position = 'center', postSpace = false) {
        try {
            const styles = {
                normTxt: { font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.text[this.colorMode], lineLimit: 2 },
                open: { font: Font.heavySystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 2 },
                closed: { font: Font.heavySystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 2 },
                offset: 5,
            };

            let titleRow = await this.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'windows', false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }
            let valueRow = await this.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
            const openWindows = await this.FPW.getOpenItems('createWindowElement2', vData.statusDoors); //['LF', 'RR', 'HD'];
            let value = openWindows.length ? openWindows.join(', ') : 'All Closed';
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            await this.createText(valueRow, value, openWindows.length > 0 ? styles.open : styles.closed);
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
            if (postSpace) {
                srcStack.addSpacer();
            }
        } catch (e) {
            await this.FPW.logger(`createWindowElement() Error: ${e}`, true);
        }
    }

    async createTireElement(srcStack, vData, position = 'center') {
        try {
            const styles = {
                normTxt: { font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.text[this.colorMode] },
            };
            let titleRow = await this.createRow(srcStack);
            let pressureUnits = await this.FPW.getSettingVal('fpPressureUnits');
            let unitTxt = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, `tirePressure||${unitTxt}`, false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            let valueRow = await this.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            // Row 1 - Tire Pressure Left Front amd Right Front
            let col1 = await this.createColumn(valueRow, { '*setPadding': [0, 0, 0, 0] });
            let col1row1 = await this.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col1row1, vData.tirePressure.leftFront, this.getTirePressureStyle(vData.tirePressure.leftFront, unitTxt));
            let col2 = await this.createColumn(valueRow, { '*setPadding': [0, 3, 0, 3] });
            let col2row1 = await this.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col2row1, '|', styles.normTxt);
            let col3 = await this.createColumn(valueRow, { '*setPadding': [0, 0, 0, 0] });
            let col3row1 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col3row1, vData.tirePressure.rightFront, this.getTirePressureStyle(vData.tirePressure.rightFront, unitTxt));

            // Row 2 - Tire Pressure Left Rear amd Right Rear
            let col1row2 = await this.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col1row2, vData.tirePressure.leftRear, this.getTirePressureStyle(vData.tirePressure.leftRear, unitTxt));
            let col2row2 = await this.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col2row2, '|', styles.normTxt);
            let col3row2 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col3row2, vData.tirePressure.rightRear, this.getTirePressureStyle(vData.tirePressure.rightRear, unitTxt));

            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
        } catch (e) {
            await this.FPW.logger(`createTireElement() Error: ${e}`, true);
        }
    }

    /**
     * @description
     * @param  {any} pressure
     * @param  {any} unit
     * @return
     * @memberof Widget
     */
    getTirePressureStyle(pressure, unit) {
        const styles = {
            normTxt: { font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.FPW.colorMap.text[this.colorMode] },
            statLow: { font: Font.heavySystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.FPW.colorMap.orangeColor },
            statCrit: { font: Font.heavySystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.FPW.colorMap.redColor },
            offset: 10,
        };
        let p = parseFloat(pressure);
        if (p) {
            let low = this.widgetConfig.tirePressureThresholds.low;
            let crit = this.widgetConfig.tirePressureThresholds.critical;
            switch (unit) {
                case 'kPa':
                    low = this.widgetConfig.tirePressureThresholds.low / 0.145377;
                    crit = this.widgetConfig.tirePressureThresholds.critical / 0.145377;
                    break;
                case 'bar':
                    low = this.widgetConfig.tirePressureThresholds.low / 14.5377;
                    crit = this.widgetConfig.tirePressureThresholds.critical / 14.5377;
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

    async createTimeStampElement(srcRow, vData, position = 'center', fontSize = undefined) {
        try {
            let refreshTime = (await this.FPW.getLastRefreshElapsedString(vData)) || this.textMap.UIValues.unknown;
            console.log(`createTimeStampElement() | refreshTime: ${JSON.stringify(refreshTime)}`);
            if (position === 'center' || position === 'right') {
                srcRow.addSpacer();
            }
            await this.createText(srcRow, 'Updated: ' + refreshTime, { font: Font.mediumSystemFont(fontSize || this.sizeMap[this.wSize].fontSizeSmall), textColor: this.FPW.colorMap.text[this.colorMode], textOpacity: 0.6, lineLimit: 1 });
            if (position === 'center' || position === 'left') {
                srcRow.addSpacer();
            }
        } catch (e) {
            await this.FPW.logger(`createTimeStampElement() Error: ${e}`, true);
        }
    }

    async imgBtnRowBuilder(srcRow, elemWidth, widthPerc, elemHeight, icon) {
        const btnCol = await this.createColumn(srcRow, { '*setPadding': [5, 0, 5, 0], size: new Size(Math.round(elemWidth * widthPerc), elemHeight), cornerRadius: 8, borderWidth: 2, borderColor: this.colorMap.text[this.colorMode] });
        btnCol.addSpacer(); // Pushes Button column down to help center in middle

        const btnImgRow = await this.createRow(btnCol, { '*setPadding': [0, 0, 0, 0] });
        btnImgRow.addSpacer();
        await this.createImage(btnImgRow, icon.image, icon.opts);
        btnImgRow.addSpacer();
        btnCol.addSpacer(); // Pushes Button column up to help center in middle
    }

    async createWidgetButtonRow(srcRow, vData, paddingLeft, rowWidth, rowHeight = 40, btnSize = 24) {
        const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
        const buttonRow = await this.createRow(srcRow, { '*setPadding': [0, paddingLeft || 0, 0, Math.round(rowWidth * 0.05)], spacing: 10 });
        const buttons = [{
                show: caps && caps.includes('DOOR_LOCK_UNLOCK'),
                icon: {
                    image: await this.FPW.Files.getImage(this.FPW.darkMode ? 'lock_btn_dark.png' : 'lock_btn_light.png'),
                    opts: { url: await this.FPW.buildCallbackUrl({ command: 'lock_command' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
                },
            },
            {
                show: caps && caps.includes('REMOTE_START'),
                icon: {
                    image: await this.FPW.Files.getImage(this.FPW.darkMode ? 'ignition_dark.png' : 'ignition_light.png'),
                    opts: { resizable: true, url: await this.FPW.buildCallbackUrl({ command: 'start_command' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
                },
            },
            {
                show: caps && caps.includes('REMOTE_PANIC_ALARM'),
                icon: {
                    image: await this.FPW.Files.getImage(this.FPW.darkMode ? 'horn_lights_dark.png' : 'horn_lights_light.png'),
                    opts: { resizable: true, url: await this.FPW.buildCallbackUrl({ command: 'horn_and_lights' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
                },
            },
            {
                show: true,
                icon: {
                    image: await this.FPW.Files.getImage(this.FPW.darkMode ? 'menu_btn_dark.png' : 'menu_btn_light.png'),
                    opts: { resizable: true, url: await this.FPW.buildCallbackUrl({ command: 'show_menu' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
                },
            },
            {
                show: false,
                icon: {
                    image: await this.FPW.Files.getImage('FP_Logo.png'),
                    opts: { resizable: true, url: await this.FPW.buildCallbackUrl({ command: 'open_fp_app' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
                },
            },
        ];

        let buttonsToShow = buttons.filter((btn) => btn.show === true);
        buttonRow.size = new Size(Math.round(rowWidth * (0.2 * buttonsToShow.length)), rowHeight);
        for (const [i, btn] of buttonsToShow.entries()) {
            await this.imgBtnRowBuilder(buttonRow, Math.round(rowWidth * 0.2), Math.round(buttonsToShow.length / 100), rowHeight, btn.icon);
        }
    }

    async hasStatusMsg(vData) {
        return vData.error || (!vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') || vData.deepSleepMode || vData.firmwareUpdating || this.FPW.getStateVal('updateAvailable') === true; //|| (!vData.evVehicle && vData.oilLow)
    }

    async createStatusElement(stk, vData, maxMsgs = 2) {
        try {
            let cnt = 0;
            const hasStatusMsg = await this.hasStatusMsg(vData);
            // Creates Elements to display any errors in red at the bottom of the widget
            if (vData.error) {
                // stk.addSpacer(5);
                await this.createText(stk, vData.error ? 'Error: ' + vData.error : '', { font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: Color.red() });
            } else {
                if (cnt < maxMsgs && !vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.createText(stk, `\u2022 12V Battery Low`, { font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: Color.red(), lineLimit: 1 });
                    cnt++;
                }
                // if (cnt < maxMsgs && !vData.evVehicle && vData.oilLow) {
                //     stk.addSpacer(cnt > 0 ? 5 : 0);
                //     await createText(stk, `\u2022 Oil Reporting Low`, { font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: Color.red(), lineLimit: 1 });
                //     cnt++;
                // }
                if (cnt < maxMsgs && vData.deepSleepMode) {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.createText(stk, `\u2022 Deep Sleep Mode`, { font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: Color.orange(), lineLimit: 1 });
                    cnt++;
                }
                if (cnt < maxMsgs && vData.firmwareUpdating) {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.createText(stk, `\u2022 Firmware Updating`, { font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: Color.green(), lineLimit: 1 });
                    cnt++;
                }
                if (cnt < maxMsgs && this.FPW.getStateVal('updateAvailable') === true) {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.createText(stk, `\u2022 Script Update: v${this.FPW.getStateVal('LATEST_VERSION')}`, { font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: Color.orange(), lineLimit: 1 });
                    cnt++;
                }
            }
            if (!hasStatusMsg) {
                // await this.createText(stk, `     `, { font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.FPW.colorMap.text[this.colorMode], lineLimit: 1 });
            }
            return stk;
        } catch (e) {
            await this.FPW.logger(`createStatusElement() Error: ${e}`, true);
        }
    }
};
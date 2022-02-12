module.exports = class FPW_Widgets_Medium {
    constructor(FPW) {
        this.FPW = FPW;
        this.wSize = 'medium';
        this.colorMode = undefined;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
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
            default:
                return await this.detailedWidget(vData, background);
        }
    }

    async simpleWidget(vData, bgType = undefined) {
        console.log(`simpleWidget(medium) called...`);
        // Defines the Widget Object
        const widget = new ListWidget();
        this.FPW.setWidgetBackground(widget, bgType);
        try {
            const widgetSizes = await this.FPW.getViewPortSizes(this.wSize);
            console.log(`widgetSizes: ${JSON.stringify(widgetSizes)}`);
            const { width, height } = widgetSizes;
            let paddingTop = Math.round(height * 0.04);
            let paddingLeft = Math.round(width * 0.03);
            // console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            widget.setPadding(paddingTop, paddingLeft, 0, 0);

            //************************
            //* TOP ROW CONTAINER
            //************************

            let bodyContainer = await this.createRow(widget, { '*setPadding': [0, 0, 0, 0], '*topAlignContent': null });
            // ****************************************
            // * LEFT BODY COLUMN CONTAINER
            // ****************************************
            let leftContainer = await this.createColumn(bodyContainer, { '*setPadding': [0, 0, 0, 0] });
            leftContainer.addSpacer();
            // Vehicle Title
            const vehicleNameContainer = await this.createRow(leftContainer, { '*setPadding': [paddingTop, paddingLeft, 0, 0] });
            let vehicleNameStr = vData.info.vehicle.vehicleType || '';

            let vehicleNameSize = 24;
            if (vehicleNameStr.length >= 10) {
                vehicleNameSize = vehicleNameSize - Math.round(vehicleNameStr.length / 4);
            }
            await this.createText(vehicleNameContainer, vehicleNameStr, { font: Font.semiboldSystemFont(vehicleNameSize), textColor: this.colorMap.text[this.colorMode], '*rightAlignText': null });
            vehicleNameContainer.addSpacer();
            // Range and Odometer
            let miContainer = await this.createRow(leftContainer, { '*setPadding': [0, paddingLeft, 0, 0], '*bottomAlignContent': null });

            try {
                const { isEV, lvlValue, dteValue, odometerVal, dtePostfix, distanceMultiplier, distanceUnit, dteInfo } = await this.getRangeData(vData);
                const fs = this.FPW.isSmallDisplay ? 14 : 16;
                // DTE Text
                await this.createText(miContainer, `${dteInfo}`, { font: Font.systemFont(fs), textColor: this.colorMap.text[this.colorMode], textOpacity: 0.7 });

                let levelContainer = await this.createRow(miContainer, {});
                // DTE + Level Separator
                await this.createText(levelContainer, ' / ', { font: Font.systemFont(fs - 2), textColor: this.colorMap.text[this.colorMode], textOpacity: 0.6 });
                // Level Text
                await this.createText(levelContainer, lvlValue < 0 ? '--' : `${lvlValue}%`, { font: Font.systemFont(fs), textColor: this.colorMap.text[this.colorMode], textOpacity: 0.6 });

                // leftContainer.addSpacer();
                let mileageContainer = await this.createRow(leftContainer, { '*setPadding': [0, paddingLeft, 0, 0] });

                // Odometer Text
                await this.createText(mileageContainer, `Odometer: ${odometerVal}`, { font: Font.systemFont(10), textColor: this.colorMap.text[this.colorMode], textOpacity: 0.7 });
            } catch (e) {
                console.error(e.message);
                miContainer.addText('Error Getting Range Data');
            }

            // Vehicle Location Row
            const locationContainer = await this.createRow(leftContainer, { '*setPadding': [5, paddingLeft, 0, 0], '*topAlignContent': null });
            let url = (await this.FPW.getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vData.latitude},${vData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vData.info.vehicle.nickName)}&ll=${vData.latitude},${vData.longitude}`;
            let locationStr = vData.position ? (this.widgetConfig.screenShotMode ? '1234 Someplace Drive, Somewhere' : `${vData.position}`) : this.textMap.errorMessages.noData;
            await this.createText(locationContainer, locationStr, { url: url, font: Font.body(), textColor: this.colorMap.text[this.colorMode], lineLimit: 2, minimumScaleFactor: 0.6, textOpacity: 0.7 });

            leftContainer.addSpacer();

            //***********************************
            //* RIGHT BODY CONTAINER
            //***********************************

            const rightContainer = await this.createColumn(bodyContainer, { '*setPadding': [0, 0, 0, 0] });
            rightContainer.addSpacer();

            // Vehicle Image Container
            let imgWidth = Math.round(width * 0.5);
            let imgHeight = Math.round(height * 0.4);
            const carImageContainer = await this.createRow(rightContainer, { '*setPadding': [paddingTop, 0, 0, 0], '*centerAlignContent': null });
            carImageContainer.addSpacer();
            await this.createImage(carImageContainer, await this.FPW.Files.getVehicleImage(vData.info.vehicle.modelYear, false, 1), { imageSize: new Size(imgWidth, imgHeight), '*rightAlignImage': null, resizable: true });
            carImageContainer.addSpacer();
            const doorWindStatusContainer = await this.createRow(rightContainer, { '*setPadding': [0, 0, 0, 0] });
            doorWindStatusContainer.addSpacer();
            await this.createDoorWindowText(doorWindStatusContainer, vData);
            doorWindStatusContainer.addSpacer();

            rightContainer.addSpacer();

            //*****************************
            //* COMMAND BUTTONS CONTAINER
            //*****************************
            const controlsContainer = await this.createRow(widget, { '*setPadding': [7, 0, 5, 0] });
            controlsContainer.addSpacer();
            // vData.deepSleepMode = true;
            // vData.firmwareUpdating = true;
            await this.createWidgetButtonRow(controlsContainer, vData, paddingLeft, width, 35, 24);
            controlsContainer.addSpacer();

            //**************************
            //* BOTTOM ROW CONTAINER
            //**************************
            // if (hasStatusMsg) {
            //     let statusRow = await this.createRow(widget, { '*setPadding': [3, 0, 3, 0], '*centerAlignContent': null, size: new Size(Math.round(width * 1), Math.round(height * 0.1)) });
            //     await this.createStatusElement(statusRow, vData, 2, this.widgetSize);
            //     statusRow.addSpacer();
            // }

            // Displays the Last Vehicle Checkin Time Elapsed...
            let timestampRow = await this.createRow(widget, { '*setPadding': [3, 0, 5, paddingLeft], '*bottomAlignContent': null });
            await this.createTimeStampElement(timestampRow, vData, 'center', 8);

            // ***************** RIGHT BODY CONTAINER END *****************
        } catch (e) {
            await this.FPW.logger(`simpleWidget(medium) Error: ${e}`, true);
        }
        return widget;
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
            // console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            // vData.deepSleepMode = true;
            // vData.firmwareUpdating = true;
            const hasStatusMsg = await this.hasStatusMsg(vData);
            //_______________________________
            //|         |         |         |
            //|         |         |         |
            //|         |         |         |
            //|_________|_________|_________|
            //|                             |
            //-------------------------------

            const wContent = await this.createColumn(widget, { '*setPadding': [paddingTop, paddingLeft, paddingTop, paddingLeft] });

            let bodyContainer = await this.createRow(wContent, { '*setPadding': [paddingTop, 0, 0, 0] });
            //*****************
            //* First column
            //*****************
            let mainCol1 = await this.createColumn(bodyContainer, { '*setPadding': [0, 0, 0, 0] });

            // Vehicle Image Container
            let imgWidth = Math.round(width * 0.33);
            let imgHeight = Math.round(height * 0.3);
            await this.createVehicleImageElement(mainCol1, vData, this.sizeMap[this.wSize].logoSize.w, this.sizeMap[this.wSize].logoSize.h + 10);

            // Creates the Odometer, Fuel/Battery and Distance Info Elements
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

            //************************
            //* Second column
            //************************
            let mainCol2 = await this.createColumn(bodyContainer, { '*setPadding': [0, 0, 0, 0] });
            mainCol2.addSpacer();

            // Creates the Lock Status Elements
            await this.createLockStatusElement(mainCol2, vData, 'center', true);

            // Creates the Door Status Elements
            await this.createDoorElement(mainCol2, vData, 'center', true);

            // Create Tire Pressure Elements
            await this.createTireElement(mainCol2, vData, 'center');
            // mainCol2.addSpacer();

            //****************
            //* Third column
            //****************
            let mainCol3 = await this.createColumn(bodyContainer, { '*setPadding': [0, 0, 0, 0] });
            mainCol3.addSpacer();

            // Creates the Ignition Status Elements
            await this.createIgnitionStatusElement(mainCol3, vData, 'center', true);

            // Creates the Door Status Elements
            await this.createWindowElement(mainCol3, vData, 'center', true);

            // Creates the Vehicle Location Element
            await this.createPositionElement(mainCol3, vData, 'center');
            // mainCol3.addSpacer();

            //**********************
            //* Refresh and error
            //*********************

            if (hasStatusMsg) {
                let statusRow = await this.createRow(wContent, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
                await this.createStatusElement(statusRow, vData, 2);
                statusRow.addSpacer(); // Pushes Status Message to the left
            }
            // else if (!this.FPW.isSmallDisplay) {
            // wContent.addSpacer(this.FPW.isSmallDisplay ? 4 : null);
            // }

            // Displays the Last Vehicle Checkin Time Elapsed...
            const timestampRow = await this.createRow(wContent, { '*setPadding': [5, 0, 0, 0] });
            await this.createTimeStampElement(timestampRow, vData, 'center', 8);
            wContent.addSpacer();
        } catch (e) {
            await this.FPW.logger(`detailedWidget(medium) Error: ${e}`, true);
        }
        return widget;
    }

    async createDoorWindowText(srcElem, vData) {
        try {
            const styles = {
                open: { font: Font.semiboldSystemFont(10), textColor: this.colorMap.openColor, lineLimit: 2, minimumScaleFactor: 0.9 },
                closed: { font: Font.systemFont(10), textColor: this.colorMap.text[this.colorMode], textOpacity: 0.7, lineLimit: 2, minimumScaleFactor: 0.9 },
            };
            const statusCol = await this.createColumn(srcElem, { '*setPadding': [0, 0, 0, 0] });
            let doorsOpen = await this.FPW.getOpenItems('createDoorWindowText', vData.statusDoors); //['LF', 'RR', 'HD'];
            let windowsOpen = await this.FPW.getOpenItems('createDoorWindowText', vData.statusWindows);

            console.log(`doorsOpen: ${doorsOpen.join(', ')}`);
            console.log(`windowsOpen: ${windowsOpen.join(', ')}`);

            if (Object.keys(doorsOpen).length > 0 || Object.keys(windowsOpen).length > 0) {
                const dRow = await this.createRow(statusCol, { '*setPadding': [0, 0, 0, 0] });
                dRow.addSpacer();
                const ds = doorsOpen.length ? `Door${doorsOpen.length > 1 ? 's' : ''}: ${doorsOpen.join(', ')} Open` : 'All Doors Closed';
                await this.createText(dRow, ds, doorsOpen.length > 0 ? styles.open : styles.closed);
                dRow.addSpacer();

                const wRow = await this.createRow(statusCol, { '*setPadding': [0, 0, 0, 0] });
                wRow.addSpacer();
                const ws = windowsOpen.length ? `Window${windowsOpen.length > 1 ? 's' : ''}: ${windowsOpen.join(', ')} Open` : 'All Windows Closed';
                await this.createText(wRow, ws, windowsOpen.length > 0 ? styles.open : styles.closed);
                wRow.addSpacer();
            } else {
                const os = 'All Doors and Windows Closed';
                const sRow = await this.createRow(statusCol, { '*setPadding': [0, 0, 0, 0] });
                sRow.addSpacer();
                await this.createText(sRow, os, styles.closed);
                sRow.addSpacer();
            }
        } catch (err) {
            await this.FPW.logError(`createDoorWindowText(medium) ${err}`);
        }
        return srcElem;
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
            await this.FPW.logger(`createRangeElements() Error: ${e}`, true);
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
            await this.createText(elem, value, { font: Font.regularSystemFont(this.sizeMap[this.wSize].fontSizeSmall), textColor: lowBattery ? Color.red() : this.colorMap.text[this.colorMode], lineLimit: 1 });
            srcElem.addSpacer(3);
        } catch (e) {
            await this.FPW.logger(`createBatteryElement() Error: ${e}`, true);
        }
    }

    async createOilElement(srcElem, vData) {
        try {
            const styles = {
                normal: { font: Font.regularSystemFont(this.sizeMap[this.wSize].fontSizeSmall), textColor: this.colorMap.text[this.colorMode], lineLimit: 1 },
                warning: { font: Font.regularSystemFont(this.sizeMap[this.wSize].fontSizeSmall), textColor: this.colorMap.orangeColor, lineLimit: 1 },
                critical: { font: Font.regularSystemFont(this.sizeMap[this.wSize].fontSizeSmall), textColor: this.colorMap.redColor, lineLimit: 1 },
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
            await this.createText(valueRow, value, { url: url, font: Font.mediumSystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.text[this.colorMode], lineLimit: 2 });
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
                off: { font: Font.heavySystemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 1 },
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
            const openWindows = await this.FPW.getOpenItems('createWindowElement2', vData.statusWindows); //['LF', 'RR', 'HD'];
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

    async createWidgetButtonRow(srcRow, vData, padding, rowWidth, rowHeight = 40, btnSize = 24) {
        const darkMode = this.colorMode === 'dark';
        const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
        const hasStatusMsg = await this.hasStatusMsg(vData);
        const remStartOn = vData.remoteStartStatus && vData.remoteStartStatus.running ? true : false;
        const lockBtnIcon = vData.lockStatus === 'LOCKED' ? (darkMode ? 'lock_btn_dark.png' : 'lock_btn_light.png') : darkMode ? 'unlock_btn_dark.png' : 'unlock_btn_light.png';
        const startBtnIcon = vData.ignitionStatus !== undefined && (vData.ignitionStatus === 'On' || vData.ignitionStatus === 'Run' || remStartOn) ? 'ignition_red.png' : darkMode ? 'ignition_dark.png' : 'ignition_light.png';
        const menuBtnIcon = hasStatusMsg ? 'menu_btn_red.png' : darkMode ? 'menu_btn_dark.png' : 'menu_btn_light.png';

        const buttonRow = await this.createRow(srcRow, { '*setPadding': [0, padding || 0, 0, padding || 0], spacing: 10 });

        const buttons = [{
                show: caps && caps.includes('DOOR_LOCK_UNLOCK'),
                icon: {
                    image: await this.FPW.Files.getImage(lockBtnIcon),
                    opts: { url: await this.FPW.buildCallbackUrl({ command: 'lock_command' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
                },
            },
            {
                show: caps && caps.includes('REMOTE_START'),
                icon: {
                    image: await this.FPW.Files.getImage(startBtnIcon),
                    opts: { resizable: true, url: await this.FPW.buildCallbackUrl({ command: 'start_command' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
                },
            },
            {
                show: caps && caps.includes('REMOTE_PANIC_ALARM'),
                icon: {
                    image: await this.FPW.Files.getImage(darkMode ? 'horn_lights_dark.png' : 'horn_lights_light.png'),
                    opts: { resizable: true, url: await this.FPW.buildCallbackUrl({ command: 'horn_and_lights' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
                },
            },
            {
                show: true,
                icon: {
                    image: await this.FPW.Files.getImage(darkMode ? 'refresh_btn_dark.png' : 'refresh_btn_light.png'),
                    opts: { resizable: true, url: await this.FPW.buildCallbackUrl({ command: 'request_refresh' }), '*centerAlignImage': null, imageSize: new Size(btnSize, btnSize) },
                },
            },
            {
                show: true,
                icon: {
                    image: await this.FPW.Files.getImage(menuBtnIcon),
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
        buttonRow.size = new Size(Math.round(rowWidth * (0.17 * buttonsToShow.length)), rowHeight);
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
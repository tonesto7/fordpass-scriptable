// const fm = FileManager.iCloud();
// const FPW_WidgetHelpers = importModule(fm.joinPath(fm.documentsDirectory(), 'FPWModules') + '/FPW_Widgets_Helpers.js');

module.exports = class FPW_Widgets_Large {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.wSize = 'large';
        this.widgetConfig = FPW.widgetConfig;
        this.sizeMap = FPW.sizeMap;
        this.textMap = FPW.textMap();
        this.iconMap = FPW.iconMap;
        this.colorMap = FPW.colorMap;
        this.colorMode = 'system';
        // this.widgetSize = this.FPW.widgetSizes()['phones'][`${this.FPW.screenSize.width / this.FPW.deviceScale}x${this.FPW.screenSize.height / this.FPW.screenScale}`] || this.FPW.widgetSizes()['phones']['375x812'];
    }

    async createWidget(vData, style = undefined, background = undefined, colorMode = 'system') {
        const wStyle = await this.FPW.getWidgetStyle();
        style = style || wStyle;
        background = background || 'system';
        this.colorMode = colorMode;
        switch (style) {
            case 'simple':
                return await this.detailedWidget(vData, background);
            default:
                return await this.detailedWidget(vData, background);
        }
    }

    async detailedWidget(vData, bgType = undefined) {
        // Defines the Widget Object
        const widget = new ListWidget();
        this.FPW.setWidgetBackground(widget, bgType);
        try {
            const widgetSizes = await this.FPW.getViewPortSizes(this.wSize);
            console.log(`widgetSizes: ${JSON.stringify(widgetSizes)}`);
            const { width, height } = widgetSizes;

            let paddingTop = Math.round(height * 0.05);
            let paddingLeft = Math.round(width * 0.05);
            console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            widget.setPadding(0, 0, 0, 0);

            const isEV = vData.evVehicle === true;
            let dtePostfix = isEV ? 'Range' : 'to E';
            let distanceMultiplier = (await this.FPW.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
            let distanceUnit = (await this.FPW.useMetricUnits()) ? 'km' : 'mi'; // unit of length

            const hasStatusMsg = await this.hasStatusMsg(vData);
            const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;

            //*****************
            //* TOP ROW
            //*****************
            const topRowContainer = await this.createRow(widget, { '*setPadding': [paddingTop, paddingLeft, 0, 0], size: new Size(Math.round(width * 1), Math.round(height * 0.35)) });

            //*****************
            //* TOP LEFT COLUMN
            //*****************

            let topRowLeftCol = await this.createColumn(topRowContainer, { '*setPadding': [paddingTop, paddingLeft, 0, 0], '*bottomAlignContent': null });

            // Vehicle Title
            const vehicleNameContainer = await this.createRow(topRowLeftCol, { '*setPadding': [0, 0, 0, 0] });
            let vehicleNameStr = vData.info.vehicle.vehicleType || '';

            let vehicleNameSize = 24;
            if (vehicleNameStr.length >= 10) {
                vehicleNameSize = vehicleNameSize - Math.round(vehicleNameStr.length / 4);
            }
            await this.createText(vehicleNameContainer, vehicleNameStr, { font: Font.semiboldSystemFont(vehicleNameSize), textColor: this.colorMap.text[this.colorMode] });
            vehicleNameContainer.addSpacer(); // Pushes the vehicle name to the left

            topRowLeftCol.addSpacer();
            const topRowInfoContainer = await this.createRow(topRowLeftCol, { '*setPadding': [0, paddingLeft, 0, 0], '*bottomAlignContent': null });
            topRowInfoContainer.addSpacer();
            // Creates Battery Level Elements
            await this.createBatteryElement(topRowLeftCol, vData, 'left');

            // Creates Oil Life Elements
            if (!vData.evVehicle) {
                await this.createOilElement(topRowLeftCol, vData, 'left');
            } else {
                // Creates EV Plug Elements
                await this.createEvChargeElement(topRowLeftCol, vData, 'left');
            }
            topRowLeftCol.addSpacer();

            //*********************
            //* TOP RIGHT COLUMN
            //*********************

            let topRowRightCol = await this.createColumn(topRowContainer, { '*setPadding': [0, 0, 0, 0] });
            topRowRightCol.addSpacer(); // Pushes Content to the middle to help center

            // Vehicle Image Container
            let imgWidth = Math.round(width * 0.4);
            let imgHeight = Math.round(height * 0.25);
            const carImageContainer = await this.createRow(topRowRightCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            carImageContainer.addSpacer();
            await this.createImage(carImageContainer, await this.FPW.Files.getVehicleImage(vData.info.vehicle.modelYear, false, 1), { '*rightAlignImage': null, resizable: true });
            carImageContainer.addSpacer();
            topRowRightCol.addSpacer(); // Pushes Content to the middle to help center

            //*******************************
            //* FUEL/BATTERY BAR CONTAINER
            //*******************************
            // Creates the Fuel/Battery Info Elements
            const fuelBattRow = await this.createRow(widget, { '*setPadding': [0, paddingLeft, 0, paddingLeft] });

            // Fuel/Battery Section
            const fuelBattCol = await this.createColumn(fuelBattRow, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null, size: new Size(Math.round(width * 1), Math.round(height * 0.14)) });

            // Fuel/Battery Level BAR
            const barRow = await this.createRow(fuelBattCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
            let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;
            barRow.addSpacer();
            await this.createImage(barRow, await this.createProgressBar(lvlValue ? lvlValue : 50, vData), { '*centerAlignImage': null, imageSize: new Size(this.sizeMap[this.wSize].barGauge.w, this.sizeMap[this.wSize].barGauge.h + 3) });
            barRow.addSpacer();

            // Distance/Range to Empty
            const dteRow = await this.createRow(fuelBattCol, { '*topAlignContent': null });
            let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.textMap.errorMessages.noData;
            dteRow.addSpacer();
            await this.createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.systemFont(this.sizeMap[this.wSize].fontSizeMedium), textColor: this.colorMap.text[this.colorMode], lineLimit: 1 });
            dteRow.addSpacer();
            fuelBattRow.addSpacer();
            fuelBattCol.addSpacer();

            //*****************
            //* Row 3 Container
            //*****************
            const row3Container = await this.createRow(widget, { '*setPadding': [0, 0, 0, 0] });

            row3Container.addSpacer();
            const row3LeftCol = await this.createColumn(row3Container, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(width * 0.333), Math.round(height * 0.3)) });
            // Creates the Lock Status Elements
            await this.createLockStatusElement(row3LeftCol, vData);
            row3LeftCol.addSpacer(); // Pushes Row 3 Left content to top
            // Creates the Door Status Elements
            await this.createDoorElement(row3LeftCol, vData);

            row3LeftCol.addSpacer(); // Pushes Row 3 Left content to top

            const row3CenterCol = await this.createColumn(row3Container, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(width * 0.333), Math.round(height * 0.3)) });
            row3CenterCol.addSpacer(); // Pushes Row 3 Left content to top
            // Create Tire Pressure Elements
            await this.createTireElement(row3CenterCol, vData);
            row3CenterCol.addSpacer(); // Pushes Row 3 Left content to top
            row3CenterCol.addSpacer(); // Pushes Row 3 Left content to top

            const row3RightCol = await this.createColumn(row3Container, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(width * 0.333), Math.round(height * 0.3)) });
            // Creates the Ignition Status Elements
            await this.createIgnitionStatusElement(row3RightCol, vData);
            row3RightCol.addSpacer(); // Pushes Row 3 Right content to top
            // Creates the Window Status Elements
            await this.createWindowElement(row3RightCol, vData);
            row3RightCol.addSpacer(); // Pushes Row 3 Right content to top

            row3Container.addSpacer();

            const row5Container = await this.createRow(widget, { '*setPadding': [0, 0, 0, 0] });
            const row5CenterCol = await this.createColumn(row5Container, { '*setPadding': [0, 0, 0, 0] });
            // Creates the Vehicle Location Element
            await this.createPositionElement(row5CenterCol, vData, 'center');

            widget.addSpacer(); // Pushes all content to the top

            // //*****************************
            // //* COMMAND BUTTONS CONTAINER
            // //*****************************
            const controlsContainer = await this.createRow(widget, { '*setPadding': [10, 0, 5, 0] });
            controlsContainer.addSpacer();
            // vData.deepSleepMode = true;
            // vData.firmwareUpdating = true;
            await this.createWidgetButtonRow(controlsContainer, vData, paddingLeft, width, 35, 24);
            controlsContainer.addSpacer();

            // //**********************
            // //* Status Row
            // //*********************

            // if (hasStatusMsg) {
            //     let statusRow = await this.createRow(widget, { '*setPadding': [0, paddingLeft, 3, 0], '*bottomAlignContent': null, size: new Size(Math.round(width * 1), Math.round(height * 0.075)) });
            //     await this.WidgetHelper.createStatusElement(statusRow, vData, 3);
            //     statusRow.addSpacer();
            // } else {
            //     widget.addSpacer();
            // }

            // Displays the Last Vehicle Checkin Time Elapsed...
            let timestampRow = await this.createRow(widget, { '*setPadding': [3, 0, 3, 0] });
            await this.createTimeStampElement(timestampRow, vData, 'center', 8);
        } catch (e) {
            await this.FPW.logger(`detailedWidget(large) Error: ${e}`, true);
        }
        return widget;
    }

    async createBatteryElement(srcStack, vData, position = 'center') {
        try {
            const styles = {
                normal: { font: Font.systemFont(this.sizeMap[this.wSize].titleFontSize), textColor: this.colorMap.text[this.colorMode], lineLimit: 1 },
                warning: { font: Font.mediumSystemFont(this.sizeMap[this.wSize].titleFontSize), textColor: this.colorMap.orangeColor, lineLimit: 1 },
                critical: { font: Font.mediumSystemFont(this.sizeMap[this.wSize].titleFontSize), textColor: this.colorMap.redColor, lineLimit: 1 },
            };
            const titleRow = await this.createRow(srcStack, { '*setPadding': [0, 0, 3, 0] });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'batteryStatus');
            titleRow.addSpacer(3);
            let txtStyle = styles.normal;
            let value = vData.batteryLevel ? `${vData.batteryLevel}V` : 'N/A';
            // console.log(`batteryLevel: ${value}`);
            let lowBattery = vData.batteryStatus === 'STATUS_LOW' ? true : false;
            if (lowBattery) {
                txtStyle = styles.critical;
            }
            await this.createText(titleRow, value, txtStyle);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }
        } catch (e) {
            await this.FPW.logger(`createBatteryElement() Error: ${e}`, true);
        }
    }

    async createOilElement(srcStack, vData, position = 'center') {
        try {
            const styles = {
                normal: { font: Font.systemFont(this.sizeMap[this.wSize].titleFontSize), textColor: this.colorMap.text[this.colorMode], lineLimit: 1 },
                warning: { font: Font.mediumSystemFont(this.sizeMap[this.wSize].titleFontSize), textColor: this.colorMap.orangeColor, lineLimit: 1 },
                critical: { font: Font.mediumSystemFont(this.sizeMap[this.wSize].titleFontSize), textColor: this.colorMap.redColor, lineLimit: 1 },
            };
            const titleRow = await this.createRow(srcStack, { '*setPadding': [0, 0, 3, 0] });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'oil');
            titleRow.addSpacer(3);
            let txtStyle = styles.normal;
            if (vData.oilLife && vData.oilLife >= 0 && vData.oilLife <= 25) {
                txtStyle = styles.warning;
            }
            // console.log(`oilLife: ${vData.oilLife}`);
            let text = vData.oilLife ? `${vData.oilLife}%` : this.textMap.errorMessages.noData;
            await this.createText(titleRow, text, txtStyle);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }
        } catch (e) {
            await this.FPW.logger(`createOilElement() Error: ${e}`, true);
        }
    }

    async createEvChargeElement(srcStack, vData, position = 'center') {
        try {
            const txtStyle = { font: Font.systemFont(this.sizeMap[this.wSize].titleFontSize), textColor: this.colorMap.text[this.colorMode], lineLimit: 1 };
            const titleRow = await this.createRow(srcStack, { '*setPadding': [0, 0, 3, 0] });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'evChargeStatus');
            titleRow.addSpacer(2);
            let value = vData.evChargeStatus ? `${vData.evChargeStatus}` : this.textMap.errorMessages.noData;
            // console.log(`battery charge: ${value}`);
            await this.createText(titleRow, value, txtStyle);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }
        } catch (e) {
            await this.FPW.logger(`createEvChargeElement() Error: ${e}`, true);
        }
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

    async createDoorElement(srcStack, vData, position = 'center', postSpace = false) {
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
    }

    async createWindowElement(srcStack, vData, position = 'center', postSpace = false) {
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
        const darkMode = this.colorMode === 'dark';
        const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
        const hasStatusMsg = await this.hasStatusMsg(vData);
        const remStartOn = vData.remoteStartStatus && vData.remoteStartStatus.running ? true : false;
        const lockBtnIcon = vData.lockStatus === 'LOCKED' ? (darkMode ? 'lock_btn_dark.png' : 'lock_btn_light.png') : darkMode ? 'unlock_btn_dark.png' : 'unlock_btn_light.png';
        const startBtnIcon = vData.ignitionStatus !== undefined && (vData.ignitionStatus === 'On' || vData.ignitionStatus === 'Run' || remStartOn) ? 'ignition_red.png' : darkMode ? 'ignition_dark.png' : 'ignition_light.png';
        const menuBtnIcon = hasStatusMsg ? 'menu_btn_red.png' : darkMode ? 'menu_btn_dark.png' : 'menu_btn_light.png';

        const buttonRow = await this.createRow(srcRow, { '*setPadding': [0, paddingLeft || 0, 0, Math.round(rowWidth * 0.05)], spacing: 10 });

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
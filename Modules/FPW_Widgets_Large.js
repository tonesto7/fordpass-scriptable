const fm = FileManager.iCloud();
const FPW_WidgetHelpers = importModule(fm.joinPath(fm.documentsDirectory(), 'FPWModules') + '/FPW_Widgets_Helpers.js');

module.exports = class FPW_Widgets_Large {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.WidgetHelpers = new FPW_WidgetHelpers(FPW);
        this.widgetSize = this.WidgetHelpers.DeviceSize[`${this.FPW.screenSize.width / this.FPW.deviceScale}x${this.FPW.screenSize.height / this.FPW.deviceScale}`] || this.WidgetHelpers.DeviceSize['375x812'];
    }

    async createWidget(vData, style = undefined) {
        const wStyle = await this.FPW.getWidgetStyle();
        style = style || wStyle;
        switch (style) {
            // case 'simple':
            //     return await this.simpleWidget(vData);
            default:
                return await this.detailedWidget(vData);
        }
    }

    async detailedWidget(vData) {
        const wSize = 'large';
        // Defines the Widget Object
        const widget = new ListWidget();

        widget.backgroundGradient = this.FPW.getBgGradient();
        try {
            const isEV = vData.evVehicle === true;
            let dtePostfix = isEV ? 'Range' : 'to E';
            let distanceMultiplier = (await this.FPW.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
            let distanceUnit = (await this.FPW.useMetricUnits()) ? 'km' : 'mi'; // unit of length
            const { width, height } = this.widgetSize[wSize];
            let paddingTop = Math.round(height * 0.05);
            let paddingLeft = Math.round(width * 0.05);
            console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            widget.setPadding(0, 0, 0, 0);
            vData.deepSleepMode = true;
            vData.firmwareUpdating = true;
            const hasStatusMsg = await this.hasStatusMsg(vData);
            const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;

            //*****************
            //* TOP ROW
            //*****************
            const topRowContainer = await this.WidgetHelpers.createRow(widget, { '*setPadding': [paddingTop, paddingLeft, 0, 0], size: new Size(Math.round(width * 1), Math.round(height * 0.3)) });

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
            await this.WidgetHelpers.createText(vehicleNameContainer, vehicleNameStr, { font: Font.semiboldSystemFont(vehicleNameSize), textColor: this.FPW.colorMap.normalText });
            vehicleNameContainer.addSpacer(); // Pushes the vehicle name to the left

            topRowLeftCol.addSpacer();
            const topRowInfoContainer = await this.WidgetHelpers.createRow(topRowLeftCol, { '*setPadding': [0, 0, 0, 0], '*bottomAlignContent': null });
            topRowInfoContainer.addSpacer();
            // Creates Battery Level Elements
            await this.createBatteryElement(topRowLeftCol, vData, wSize);

            // Creates Oil Life Elements
            if (!vData.evVehicle) {
                await this.createOilElement(topRowLeftCol, vData, wSize);
            } else {
                // Creates EV Plug Elements
                await this.createEvChargeElement(topRowLeftCol, vData, wSize);
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
            await this.WidgetHelpers.createImage(carImageContainer, await this.FPW.Files.getVehicleImage(vData.info.vehicle.modelYear, false, 1), { /*imageSize: new Size(imgWidth, imgHeight),*/ '*rightAlignImage': null, resizable: true });
            carImageContainer.addSpacer();
            topRowRightCol.addSpacer(); // Pushes Content to the middle to help center

            //*******************************
            //* FUEL/BATTERY BAR CONTAINER
            //*******************************
            // Creates the Fuel/Battery Info Elements
            const fuelBattRow = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, paddingLeft, 0, 0] });

            // Fuel/Battery Section
            const fuelBattCol = await this.WidgetHelpers.createColumn(fuelBattRow, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null, size: new Size(Math.round(width * 1), Math.round(height * 0.13)) });

            // Fuel/Battery Level BAR
            const barRow = await this.WidgetHelpers.createRow(fuelBattCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
            let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;
            barRow.addSpacer();
            await this.WidgetHelpers.createImage(barRow, await this.WidgetHelpers.createProgressBar(lvlValue ? lvlValue : 50, vData, wSize), { '*centerAlignImage': null, imageSize: new Size(this.FPW.sizeMap[wSize].barGauge.w, this.FPW.sizeMap[wSize].barGauge.h + 3) });
            barRow.addSpacer();

            // Distance/Range to Empty
            const dteRow = await this.WidgetHelpers.createRow(fuelBattCol, { '*topAlignContent': null });
            let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.FPW.textMap().errorMessages.noData;
            dteRow.addSpacer();
            await this.WidgetHelpers.createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.systemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText, lineLimit: 1 });
            dteRow.addSpacer();
            fuelBattRow.addSpacer();
            fuelBattCol.addSpacer();

            //*****************
            //* Row 3 Container
            //*****************
            const row3Container = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, 0, 0, 0] });

            row3Container.addSpacer();
            const row3LeftCol = await this.WidgetHelpers.createColumn(row3Container, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(width * 0.5), Math.round(height * 0.15)) });
            // Creates the Lock Status Elements
            await this.createLockStatusElement(row3LeftCol, vData, wSize);
            row3LeftCol.addSpacer(); // Pushes Row 3 Left content to top

            const row3RightCol = await this.WidgetHelpers.createColumn(row3Container, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(width * 0.5), Math.round(height * 0.15)) });
            // Creates the Ignition Status Elements
            await this.createIgnitionStatusElement(row3RightCol, vData, wSize);
            row3RightCol.addSpacer(); // Pushes Row 3 Right content to top

            row3Container.addSpacer();

            const row4Container = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, 0, 0, 0] });
            row4Container.addSpacer();
            let has3rdDoorRow = vData.statusDoors.tailgate !== undefined || vData.statusDoors.hood !== undefined;
            const row4LeftCol = await this.WidgetHelpers.createColumn(row4Container, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(width * 0.333), Math.round(height * 0.2)) });
            // Creates the Door Status Elements
            await this.createDoorElement(row4LeftCol, vData, false, wSize);
            row4LeftCol.addSpacer();

            const row4CenterCol = await this.WidgetHelpers.createColumn(row4Container, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(width * 0.333), Math.round(height * 0.2)) });
            // Creates the Window Status Elements
            await this.createWindowElement(row4CenterCol, vData, false, wSize);
            row4CenterCol.addSpacer();

            const row4RightCol = await this.WidgetHelpers.createColumn(row4Container, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(width * 0.333), Math.round(height * 0.2)) });
            // Create Tire Pressure Elements
            await this.createTireElement(row4RightCol, vData, wSize);
            row4RightCol.addSpacer();
            row4Container.addSpacer();

            const row5Container = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, 0, 0, 0] });
            const row5CenterCol = await this.WidgetHelpers.createColumn(row5Container, { '*setPadding': [0, 0, 0, 0] });
            // Creates the Vehicle Location Element
            await this.createPositionElement(row5CenterCol, vData, wSize, 'center');
            // row5CenterCol.addSpacer();

            widget.addSpacer(); // Pushes all content to the top
            // //*****************************
            // //* COMMAND BUTTONS CONTAINER
            // //*****************************
            const controlsContainer = await this.WidgetHelpers.createRow(widget, { '*setPadding': [10, 0, 10, 0] });
            controlsContainer.addSpacer();
            await this.WidgetHelpers.createWidgetButtonRow(controlsContainer, vData, width, 40, 24);
            controlsContainer.addSpacer();

            // //**********************
            // //* Status Row
            // //*********************

            // if (hasStatusMsg) {
            //     let statusRow = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, paddingLeft, 3, 0], '*bottomAlignContent': null, size: new Size(Math.round(width * 1), Math.round(height * 0.075)) });
            //     await this.createStatusElement(statusRow, vData, 3, wSize);
            //     statusRow.addSpacer();
            // }

            // Displays the Last Vehicle Checkin Time Elapsed...
            let timestampRow = await this.WidgetHelpers.createRow(widget, { '*setPadding': [1, 0, 0, 0] });
            await this.WidgetHelpers.createTimeStampElement(timestampRow, vData, 'center', 8);
        } catch (e) {
            this.FPW.logger(`detailedWidget(large) Error: ${e}`, true);
        }
        return widget;
    }

    async createTitle(headerField, titleText, wSize = 'medium', colon = true, hideTitleForSmall = false) {
        let titleParams = titleText.split('||');
        let icon = this.FPW.iconMap[titleParams[0]];
        let titleStack = await this.WidgetHelpers.createRow(headerField, { '*centerAlignContent': null });
        if (icon !== undefined) {
            let imgFile = await this.FPW.Files.getImage(icon.toString());
            await this.WidgetHelpers.createImage(titleStack, imgFile, { imageSize: new Size(this.FPW.sizeMap[wSize].iconSize.w, this.FPW.sizeMap[wSize].iconSize.h), resizable: true });
        }
        // console.log(`titleParams(${titleText}): ${titleParams}`);
        if (titleText && titleText.length && !hideTitleForSmall) {
            titleStack.addSpacer(2);
            let title = titleParams.length > 1 ? this.FPW.textMap(titleParams[1]).elemHeaders[titleParams[0]] : this.FPW.textMap().elemHeaders[titleParams[0]];
            await this.WidgetHelpers.createText(titleStack, `${title}${colon ? ':' : ''}`, { font: Font.boldSystemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.FPW.colorMap.normalText, lineLimit: 1 });
        }
    }

    async createBatteryElement(srcStack, vData, wSize = 'medium') {
        try {
            let elem = await this.WidgetHelpers.createRow(srcStack, { '*setPadding': [0, 0, 3, 0], '*bottomAlignContent': null });
            await this.createTitle(elem, 'batteryStatus', wSize);
            elem.addSpacer(3);
            let value = vData.batteryLevel ? `${vData.batteryLevel}V` : 'N/A';
            // console.log(`batteryLevel: ${value}`);
            let lowBattery = vData.batteryStatus === 'STATUS_LOW' ? true : false;
            await this.WidgetHelpers.createText(elem, value, { font: Font.systemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: lowBattery ? Color.red() : this.FPW.colorMap.normalText, lineLimit: 1 });
        } catch (e) {
            this.FPW.logger(`createBatteryElement() Error: ${e}`, true);
        }
    }

    async createOilElement(srcStack, vData, wSize = 'medium') {
        try {
            const styles = {
                normal: { font: Font.systemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.FPW.colorMap.normalText, lineLimit: 1 },
                warning: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.FPW.colorMap.orangeColor, lineLimit: 1 },
                critical: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.FPW.colorMap.redColor, lineLimit: 1 },
            };
            let elem = await this.WidgetHelpers.createRow(srcStack, { '*setPadding': [0, 0, 3, 0], '*bottomAlignContent': null });
            await this.createTitle(elem, 'oil', wSize);
            elem.addSpacer(2);
            let txtStyle = styles.normal;
            if (vData.oilLife && vData.oilLife >= 0 && vData.oilLife <= 25) {
                txtStyle = styles.warning;
            }
            // console.log(`oilLife: ${vData.oilLife}`);
            let text = vData.oilLife ? `${vData.oilLife}%` : this.FPW.textMap().errorMessages.noData;
            await this.WidgetHelpers.createText(elem, text, txtStyle);
        } catch (e) {
            this.FPW.logger(`createOilElement() Error: ${e}`, true);
        }
    }

    async createEvChargeElement(srcStack, vData, wSize = 'medium') {
        try {
            let elem = await this.WidgetHelpers.createRow(srcStack, { '*setPadding': [0, 0, 3, 0], '*bottomAlignContent': null });
            await this.createTitle(elem, 'evChargeStatus', wSize);
            elem.addSpacer(2);
            let value = vData.evChargeStatus ? `${vData.evChargeStatus}` : this.FPW.textMap().errorMessages.noData;
            // console.log(`battery charge: ${value}`);
            await this.WidgetHelpers.createText(elem, value, { font: Font.systemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.FPW.colorMap.normalText, lineLimit: 1 });
            // srcStack.addSpacer(3);
        } catch (e) {
            this.FPW.logger(`createEvChargeElement() Error: ${e}`, true);
        }
    }

    async createDoorElement(srcStack, vData, countOnly = false, wSize = 'medium', position = 'center') {
        try {
            const styles = {
                normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText, lineLimit: 1 },
                open: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.openColor, lineLimit: 1 },
                closed: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.closedColor, lineLimit: 1 },
                offset: 5,
            };

            let offset = styles.offset;
            let titleRow = await this.WidgetHelpers.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'doors', wSize, false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            // Creates the first row of status elements for LF and RF
            let valueRow = await this.WidgetHelpers.createRow(srcStack, { '*topAlignContent': null });
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            if (countOnly) {
                let value = this.FPW.textMap().errorMessages.noData;
                // let allDoorsCnt = Object.values(vData.statusDoors).filter((door) => door !== null).length;
                let countOpen;
                if (vData.statusDoors) {
                    countOpen = Object.values(vData.statusDoors).filter((door) => door === true).length;
                    value = countOpen == 0 ? this.FPW.textMap().UIValues.closed : `${countOpen} ${this.FPW.textMap().UIValues.open}`;
                }
                await this.WidgetHelpers.createText(valueRow, value, countOpen > 0 ? styles.open : styles.closed);
            } else {
                let col1 = await this.WidgetHelpers.createColumn(valueRow, { '*setPadding': [0, 0, 0, 0] });
                let col1row1 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
                await this.WidgetHelpers.createText(col1row1, 'LF (', styles.normTxt);
                await this.WidgetHelpers.createText(col1row1, vData.statusDoors.driverFront ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusDoors.driverFront ? styles.open : styles.closed);
                await this.WidgetHelpers.createText(col1row1, ')', styles.normTxt);

                let col2 = await this.WidgetHelpers.createColumn(valueRow, { '*setPadding': [0, 3, 0, 3] });
                let col2row1 = await this.WidgetHelpers.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
                await this.WidgetHelpers.createText(col2row1, '|', styles.normTxt);

                let col3 = await this.WidgetHelpers.createColumn(valueRow, { '*setPadding': [0, 0, 0, 0] });
                let col3row1 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
                await this.WidgetHelpers.createText(col3row1, 'RF (', styles.normTxt);
                await this.WidgetHelpers.createText(col3row1, vData.statusDoors.passFront ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusDoors.passFront ? styles.open : styles.closed);
                await this.WidgetHelpers.createText(col3row1, ')', styles.normTxt);

                // Creates the second row of status elements for LR and RR
                if (vData.statusDoors.leftRear !== null && vData.statusDoors.rightRear !== null) {
                    let col1row2 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
                    await this.WidgetHelpers.createText(col1row2, `LR (`, styles.normTxt);
                    await this.WidgetHelpers.createText(col1row2, vData.statusDoors.leftRear ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusDoors.leftRear ? styles.open : styles.closed);
                    await this.WidgetHelpers.createText(col1row2, ')', styles.normTxt);

                    let col2row2 = await this.WidgetHelpers.createRow(col2, {});
                    await this.WidgetHelpers.createText(col2row2, '|', styles.normTxt);

                    let col3row2 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
                    await this.WidgetHelpers.createText(col3row2, `RR (`, styles.normTxt);
                    await this.WidgetHelpers.createText(col3row2, vData.statusDoors.rightRear ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusDoors.rightRear ? styles.open : styles.closed);
                    await this.WidgetHelpers.createText(col3row2, ')', styles.normTxt);
                }

                let that = this;
                async function getHoodStatusElem(stkElem, data, center = false) {
                    try {
                        await that.WidgetHelpers.createText(stkElem, `${center ? '       ' : ''}HD (`, styles.normTxt);
                        await that.WidgetHelpers.createText(stkElem, data.statusDoors.hood ? that.FPW.textMap().symbols.open : that.FPW.textMap().symbols.closed, vData.statusDoors.hood ? styles.open : styles.closed);
                        await that.WidgetHelpers.createText(stkElem, ')', styles.normTxt);
                    } catch (e) {
                        that.FPW.logger(`getHoodStatusElem() Error: ${e}`, true);
                    }
                }
                async function getTailgateStatusElem(stkElem, data, center = false) {
                    try {
                        await that.WidgetHelpers.createText(stkElem, `${center ? '       ' : ''}TG (`, styles.normTxt);
                        await that.WidgetHelpers.createText(stkElem, data.statusDoors.tailgate ? that.FPW.textMap().symbols.open : that.FPW.textMap().symbols.closed, vData.statusDoors.tailgate ? styles.open : styles.closed);
                        await that.WidgetHelpers.createText(stkElem, ')', styles.normTxt);
                    } catch (e) {
                        that.FPW.logger(`getTailgateStatusElem() Error: ${e}`, true);
                    }
                }

                // Creates the third row of status elements for the tailgate and/or hood (if equipped)
                let hasHood = vData.statusDoors.hood !== null;
                let hasTailgate = vData.statusDoors.tailgate !== null;
                if (hasHood || hasTailgate) {
                    if (hasHood && hasTailgate) {
                        let col1row3 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
                        await getHoodStatusElem(col1row3, vData);

                        let col2row3 = await this.WidgetHelpers.createRow(col2, {});
                        await this.WidgetHelpers.createText(col2row3, '|', styles.normTxt);

                        let col3row3 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
                        await getTailgateStatusElem(col3row3, vData);
                    } else {
                        if (hasHood && !hasTailgate) {
                            let dataRow3Fld = await this.WidgetHelpers.createRow(srcStack);
                            await getHoodStatusElem(dataRow3Fld, vData, true);
                        } else if (hasTailgate && !hasHood) {
                            let dataRow3Fld = await this.WidgetHelpers.createRow(srcStack, {});
                            await getTailgateStatusElem(dataRow3Fld, vData, true);
                        }
                    }
                    // offset = offset + 10;
                }
            }
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
        } catch (err) {
            this.FPW.logger(`createStatusDoors() Error: ${err}`, true);
        }
    }

    async createWindowElement(srcStack, vData, countOnly = false, wSize = 'medium', position = 'center') {
        try {
            const styles = {
                normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText },
                open: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.openColor },
                closed: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.closedColor },
                offset: 10,
            };

            // let offset = styles.offset;
            let titleRow = await this.WidgetHelpers.createRow(srcStack);
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'windows', wSize, false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            // Creates the first row of status elements for LF and RF
            let valueRow = await this.WidgetHelpers.createRow(srcStack, {});
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            if (countOnly) {
                let value = this.FPW.textMap().errorMessages.noData;
                let countOpen;
                if (vData.statusWindows) {
                    countOpen = Object.values(vData.statusWindows).filter((window) => window === true).length;
                    value = countOpen == 0 ? this.FPW.textMap().UIValues.closed : `${countOpenWindows} ${this.FPW.textMap().UIValues.open}`;
                }
                await this.WidgetHelpers.createText(valueRow, value, countOpen > 0 ? styles.open : styles.closed);
            } else {
                let col1 = await this.WidgetHelpers.createColumn(valueRow, { '*setPadding': [0, 0, 0, 0] });
                let col1row1 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
                await this.WidgetHelpers.createText(col1row1, 'LF (', styles.normTxt);
                await this.WidgetHelpers.createText(col1row1, vData.statusWindows.driverFront ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusWindows['driverFront'] ? styles.open : styles.closed);
                await this.WidgetHelpers.createText(col1row1, ')', styles.normTxt);

                let col2 = await this.WidgetHelpers.createColumn(valueRow, { '*setPadding': [0, 3, 0, 3] });
                let col2row1 = await this.WidgetHelpers.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
                await this.WidgetHelpers.createText(col2row1, '|', styles.normTxt);

                let col3 = await this.WidgetHelpers.createColumn(valueRow, { '*setPadding': [0, 0, 0, 0] });
                let col3row1 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
                await this.WidgetHelpers.createText(col3row1, 'RF (', styles.normTxt);
                await this.WidgetHelpers.createText(col3row1, vData.statusWindows['passFront'] ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusWindows['passFront'] ? styles.open : styles.closed);
                await this.WidgetHelpers.createText(col3row1, ')', styles.normTxt);

                // Creates the second row of status elements for LR and RR
                if (vData.statusWindows.driverRear !== null && vData.statusWindows.passRear !== null) {
                    let col1row2 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
                    await this.WidgetHelpers.createText(col1row2, `LR (`, styles.normTxt);
                    await this.WidgetHelpers.createText(col1row2, vData.statusWindows.driverRear ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusWindows.driverRear ? styles.open : styles.closed);
                    await this.WidgetHelpers.createText(col1row2, ')', styles.normTxt);

                    let col2row2 = await this.WidgetHelpers.createRow(col2, {});
                    await this.WidgetHelpers.createText(col2row2, '|', styles.normTxt);

                    let col3row2 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
                    await this.WidgetHelpers.createText(col3row2, `RR (`, styles.normTxt);
                    await this.WidgetHelpers.createText(col3row2, vData.statusWindows.passRear ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusWindows.passRear ? styles.open : styles.closed);
                    await this.WidgetHelpers.createText(col3row2, ')', styles.normTxt);
                }

                // if (vData.statusDoors['tailgate'] !== undefined || vData.statusDoors['hood'] !== undefined) {
                //     offset = offset + 10;
                // }
            }
            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
        } catch (e) {
            this.FPW.logger(`createWindowElement() Error: ${e}`, true);
        }
    }

    async createTireElement(srcStack, vData, wSize = 'medium', position = 'center') {
        try {
            const styles = {
                normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText },
            };
            let titleRow = await this.WidgetHelpers.createRow(srcStack);
            let pressureUnits = await this.FPW.getSettingVal('fpPressureUnits');
            let unitTxt = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, `tirePressure||${unitTxt}`, wSize, false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            let valueRow = await this.WidgetHelpers.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            // Row 1 - Tire Pressure Left Front amd Right Front
            let col1 = await this.WidgetHelpers.createColumn(valueRow, { '*setPadding': [0, 0, 0, 0] });
            let col1row1 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await this.WidgetHelpers.createText(col1row1, vData.tirePressure.leftFront, this.WidgetHelpers.getTirePressureStyle(vData.tirePressure.leftFront, unitTxt, wSize));
            let col2 = await this.WidgetHelpers.createColumn(valueRow, { '*setPadding': [0, 3, 0, 3] });
            let col2row1 = await this.WidgetHelpers.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
            await this.WidgetHelpers.createText(col2row1, '|', styles.normTxt);
            let col3 = await this.WidgetHelpers.createColumn(valueRow, { '*setPadding': [0, 0, 0, 0] });
            let col3row1 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await this.WidgetHelpers.createText(col3row1, vData.tirePressure.rightFront, this.WidgetHelpers.getTirePressureStyle(vData.tirePressure.rightFront, unitTxt, wSize));

            // Row 2 - Tire Pressure Left Rear amd Right Rear
            let col1row2 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await this.WidgetHelpers.createText(col1row2, vData.tirePressure.leftRear, this.WidgetHelpers.getTirePressureStyle(vData.tirePressure.leftRear, unitTxt, wSize));
            let col2row2 = await this.WidgetHelpers.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
            await this.WidgetHelpers.createText(col2row2, '|', styles.normTxt);
            let col3row2 = await this.WidgetHelpers.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await this.WidgetHelpers.createText(col3row2, vData.tirePressure.rightRear, this.WidgetHelpers.getTirePressureStyle(vData.tirePressure.rightRear, unitTxt, wSize));

            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
        } catch (e) {
            this.FPW.logger(`createTireElement() Error: ${e}`, true);
        }
    }

    async createPositionElement(srcStack, vData, wSize = 'medium', position = 'center') {
        try {
            const titleRow = await this.WidgetHelpers.createRow(srcStack);
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'position', wSize, false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            const valueRow = await this.WidgetHelpers.createRow(srcStack, { '*centerAlignContent': null });
            let url = (await this.FPW.getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vData.latitude},${vData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vData.info.vehicle.nickName)}&ll=${vData.latitude},${vData.longitude}`;
            let value = vData.position ? (this.widgetConfig.screenShotMode ? '1234 Someplace Drive, Somewhere' : `${vData.position}`) : this.FPW.textMap().errorMessages.noData;
            if (position == 'center' || position == 'right') {
                valueRow.addSpacer();
            }
            await this.WidgetHelpers.createText(valueRow, value, { url: url, font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText, lineLimit: 2, minimumScaleFactor: 0.9 });
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
                unlocked: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.openColor, lineLimit: 1 },
                locked: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.closedColor, lineLimit: 1 },
            };
            let titleRow = await this.WidgetHelpers.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'lockStatus', wSize, false);
            if (position == 'center' || position == 'left') {
                titleRow.addSpacer();
            }

            let valueRow = await this.WidgetHelpers.createRow(srcStack, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
            let value = vData.lockStatus ? vData.lockStatus.toLowerCase().charAt(0).toUpperCase() + vData.lockStatus.toLowerCase().slice(1) : this.FPW.textMap().errorMessages.noData;
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
                on: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.openColor },
                off: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.closedColor },
            };
            let remStartOn = vData.remoteStartStatus && vData.remoteStartStatus.running ? true : false;
            let status = '';
            if (remStartOn) {
                status = `Remote Start (ON)`;
            } else if (vData.ignitionStatus !== undefined) {
                status = vData.ignitionStatus.charAt(0).toUpperCase() + vData.ignitionStatus.slice(1); //vData.ignitionStatus.toUpperCase();
            } else {
                this.FPW.textMap().errorMessages.noData;
            }
            let titleRow = await this.WidgetHelpers.createRow(srcStack, { '*centerAlignContent': null });
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, 'ignitionStatus', wSize, false);
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

    async hasStatusMsg(vData) {
        return vData.error || (!vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') || vData.deepSleepMode || vData.firmwareUpdating || this.FPW.getStateVal('updateAvailable') === true; //|| (!vData.evVehicle && vData.oilLow)
    }

    async createStatusElement(stk, vData, maxMsgs = 2, wSize = 'medium') {
        try {
            let cnt = 0;
            // Creates Elements to display any errors in red at the bottom of the widget
            if (vData.error) {
                // stk.addSpacer(5);
                await this.WidgetHelpers.createText(stk, vData.error ? 'Error: ' + vData.error : '', { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.red() });
            } else {
                if (cnt < maxMsgs && !vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.WidgetHelpers.createText(stk, `\u2022 12V Battery Low`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.red(), lineLimit: 1 });
                    cnt++;
                }
                // if (cnt < maxMsgs && !vData.evVehicle && vData.oilLow) {
                //     stk.addSpacer(cnt > 0 ? 5 : 0);
                //     await createText(stk, `\u2022 Oil Reporting Low`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.red(), lineLimit: 1 });
                //     cnt++;
                // }
                if (cnt < maxMsgs && vData.deepSleepMode) {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.WidgetHelpers.createText(stk, `\u2022 Deep Sleep Mode`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.orange(), lineLimit: 1 });
                    cnt++;
                }
                if (cnt < maxMsgs && vData.firmwareUpdating) {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.WidgetHelpers.createText(stk, `\u2022 Firmware Updating`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.green(), lineLimit: 1 });
                    cnt++;
                }
                if (cnt < maxMsgs && this.FPW.getStateVal('updateAvailable') === true) {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.WidgetHelpers.createText(stk, `\u2022 Script Update: v${this.FPW.getStateVal('LATEST_VERSION')}`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.orange(), lineLimit: 1 });
                    cnt++;
                }
            }
            if (!this.hasStatusMsg()) {
                await this.WidgetHelpers.createText(stk, `     `, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText, lineLimit: 1 });
            }
            return stk;
        } catch (e) {
            this.FPW.logger(`createStatusElement() Error: ${e}`, true);
        }
    }
};

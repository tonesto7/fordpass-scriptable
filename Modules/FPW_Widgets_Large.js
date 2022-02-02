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
            default: return await this.detailedWidget(vData);
        }
    }

    async detailedWidget(vData) {
        const wSize = 'large';
        // Defines the Widget Object
        const widget = new ListWidget();
        widget.setPadding(0, 0, 0, 0);
        widget.backgroundGradient = this.FPW.getBgGradient();
        try {
            const isEV = vData.evVehicle === true;
            let dtePostfix = isEV ? 'Range' : 'to E';
            let distanceMultiplier = (await this.FPW.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
            let distanceUnit = (await this.FPW.useMetricUnits()) ? 'km' : 'mi'; // unit of length
            const { width, height } = this.widgetSize[wSize];
            let paddingTop = Math.round(height * 0.03);
            // let paddingTop = 5;
            let paddingLeft = Math.round(width * 0.03);
            // let paddingLeft = 4;
            console.log(`padding | Top: ${paddingTop} | Left: ${paddingLeft}`);
            vData.deepSleepMode = true;
            vData.firmwareUpdating = true;
            const hasStatusMsg = await this.hasStatusMsg(vData);

            //*****************
            //* Top ROW
            //*****************
            let topRow = await this.WidgetHelpers.createRow(widget, { '*setPadding': [paddingTop, paddingLeft, paddingTop, 0] });

            // Vehicle Title
            const vehicleNameRow = await this.WidgetHelpers.createRow(topRow, { '*setPadding': [paddingTop, paddingLeft, 0, 0] });
            let vehicleNameStr = vData.info.vehicle.vehicleType || '';
            let vehicleNameSize = 24;
            if (vehicleNameStr.length >= 10) {
                vehicleNameSize = vehicleNameSize - Math.round(vehicleNameStr.length / 4);
            }
            await this.WidgetHelpers.createText(vehicleNameRow, vehicleNameStr, { font: Font.semiboldSystemFont(vehicleNameSize), textColor: this.FPW.colorMap.normalText, '*leftAlignText': null });
            vehicleNameRow.addSpacer();

            //*****************
            //* Top Left Row
            //*****************

            //*****************
            //* Top Left Row
            //*****************
            const secondRow = await this.WidgetHelpers.createRow(widget, {});

            let row2LeftCol = await this.WidgetHelpers.createColumn(secondRow, { '*setPadding': [0, 0, 0, 0], size: new Size(Math.round(width * 0.5), Math.round(height * 0.2)), '*bottomAlignContent': null });

            // Vehicle Image Container
            let imgWidth = Math.round(width * 0.4);
            let imgHeight = Math.round(height * 0.25);
            const carImageRow = await this.WidgetHelpers.createRow(row2LeftCol, { '*setPadding': [0, paddingLeft, 0, paddingLeft], '*bottomAlignContent': null });
            carImageRow.addSpacer();
            await this.WidgetHelpers.createImage(carImageRow, await this.FPW.Files.getVehicleImage(vData.info.vehicle.modelYear, false, 1), { imageSize: new Size(imgWidth, imgHeight), resizable: true });
            carImageRow.addSpacer();

            //*****************
            //* Top Right Row
            //*****************

            let row2RightCol = await this.WidgetHelpers.createColumn(secondRow, { '*setPadding': [0, paddingLeft, 0, 0], size: new Size(Math.round(width * 0.5), Math.round(height * 0.2)), '*bottomAlignContent': null });

            // Creates Battery Level Elements
            await this.createBatteryElement(row2RightCol, vData, wSize);

            // Creates Oil Life Elements
            if (!vData.evVehicle) {
                await this.createOilElement(row2RightCol, vData, wSize);
            } else {
                // Creates EV Plug Elements
                await this.createEvChargeElement(row2RightCol, vData, wSize);
            }

            //**********************
            //* Fuel/Battery Bar Row
            //*********************
            // Creates the Fuel/Battery Info Elements
            let fuelBattRow = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
            let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;

            // Fuel/Battery Section
            let fuelBattCol = await this.WidgetHelpers.createColumn(fuelBattRow, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

            // Fuel/Battery Level BAR
            let barRow = await this.WidgetHelpers.createRow(fuelBattCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            barRow.useDefaultPadding();
            barRow.addSpacer();
            await this.WidgetHelpers.createImage(barRow, await this.WidgetHelpers.createProgressBar(lvlValue ? lvlValue : 50, vData, wSize), { '*centerAlignImage': null, imageSize: new Size(this.FPW.sizeMap[wSize].barGauge.w, this.FPW.sizeMap[wSize].barGauge.h + 3) });
            barRow.addSpacer();

            // Distance/Range to Empty
            let dteRow = await this.WidgetHelpers.createRow(fuelBattCol, { '*topAlignContent': null });
            let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.FPW.textMap().errorMessages.noData;
            dteRow.addSpacer();
            await this.WidgetHelpers.createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.systemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText, lineLimit: 1 });
            dteRow.addSpacer();
            fuelBattCol.addSpacer(4);
            // fuelBattCol.addSpacer();

            //*****************
            //* Row 3 Container
            //*****************

            let row3 = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, paddingLeft, 0, paddingLeft], bottomAlignContent: null });

            let row3Left = await this.WidgetHelpers.createColumn(row3, { '*setPadding': [0, paddingLeft, 0, paddingLeft], size: new Size(Math.round(width * 0.5), Math.round(height * 0.5)), '*topAlignContent': null });
            // Creates the Lock Status Elements
            await this.createLockStatusElement(row3Left, vData, wSize);
            // Creates the Door Status Elements
            await this.createDoorElement(row3Left, vData, false, wSize);
            // Create Tire Pressure Elements
            await this.createTireElement(row3Left, vData, wSize);

            let row3Right = await this.WidgetHelpers.createColumn(row3, { '*setPadding': [0, paddingLeft, 0, paddingLeft], size: new Size(Math.round(width * 0.5), Math.round(height * 0.5)), '*topAlignContent': null });
            // Creates the Ignition Status Elements
            await this.createIgnitionStatusElement(row3Right, vData, wSize);
            // Creates the Window Status Elements
            await this.createWindowElement(row3Right, vData, false, wSize);
            // Creates the Vehicle Location Element
            await this.createPositionElement(row3Right, vData, wSize);

            //**********************
            //* Status Row
            //*********************

            if (hasStatusMsg) {
                let statusRow = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, paddingLeft, 3, 0], '*bottomAlignContent': null, size: new Size(Math.round(width * 1), Math.round(height * 0.075)) });
                await this.createStatusElement(statusRow, vData, 3, wSize);
                statusRow.addSpacer();
            }

            // Displays the Last Vehicle Checkin Time Elapsed...
            let timestampRow = await this.WidgetHelpers.createRow(widget, { '*setPadding': [0, 0, 5, 0], '*bottomAlignContent': null, size: new Size(Math.round(width * 1), Math.round(height * hasStatusMsg ? 0.075 : 0.15)) });
            timestampRow.addSpacer();
            await this.createTimeStampElement(timestampRow, vData, wSize);
            timestampRow.addSpacer();
        } catch (e) {
            this.FPW.logger(`detailedWidget(large) Error: ${e}`, true);
        }
        return widget;
    }

    async createTitle(headerField, titleText, wSize = 'medium', hideTitleForSmall = false) {
        let titleParams = titleText.split('||');
        let icon = this.FPW.iconMap[titleParams[0]];
        let titleStack = await this.WidgetHelpers.createRow(headerField, { '*centerAlignContent': null });
        if (icon !== undefined) {
            // titleStack.layoutHorizontally();
            let imgFile = await this.FPW.Files.getImage(icon.toString());
            await this.WidgetHelpers.createImage(titleStack, imgFile, { imageSize: new Size(this.FPW.sizeMap[wSize].iconSize.w, this.FPW.sizeMap[wSize].iconSize.h), resizable: true });
        }
        // console.log(`titleParams(${titleText}): ${titleParams}`);
        if (titleText && titleText.length && !hideTitleForSmall) {
            titleStack.addSpacer(2);
            let title = titleParams.length > 1 ? this.FPW.textMap(titleParams[1]).elemHeaders[titleParams[0]] : this.FPW.textMap().elemHeaders[titleParams[0]];
            await this.WidgetHelpers.createText(titleStack, title + ':', { font: Font.boldSystemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.FPW.colorMap.normalText, lineLimit: 1 });
        }
    }

    async createBatteryElement(srcField, vData, wSize = 'medium') {
        try {
            let elem = await this.WidgetHelpers.createRow(srcField, { '*setPadding': [3, 0, 3, 0], '*centerAlignContent': null });
            elem.addSpacer();
            await this.createTitle(elem, 'batteryStatus', wSize, this.FPW.isSmallDisplay || wSize === 'small');
            elem.addSpacer(2);
            let value = vData.batteryLevel ? `${vData.batteryLevel}V` : 'N/A';
            // console.log(`batteryLevel: ${value}`);
            let lowBattery = vData.batteryStatus === 'STATUS_LOW' ? true : false;
            await this.WidgetHelpers.createText(elem, value, { font: Font.systemFont(this.FPW.sizeMap[wSize].fontSizeMedium + 2), textColor: lowBattery ? Color.red() : this.FPW.colorMap.normalText, lineLimit: 1 });
        } catch (e) {
            this.FPW.logger(`createBatteryElement() Error: ${e}`, true);
        }
    }

    async createOilElement(srcField, vData, wSize = 'medium') {
        try {
            const styles = {
                normal: { font: Font.systemFont(this.FPW.sizeMap[wSize].fontSizeMedium + 2), textColor: this.FPW.colorMap.normalText, lineLimit: 1 },
                warning: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium + 2), textColor: this.FPW.colorMap.orangeColor, lineLimit: 1 },
                critical: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium + 2), textColor: this.FPW.colorMap.redColor, lineLimit: 1 },
            };
            let elem = await this.WidgetHelpers.createRow(srcField, { '*setPadding': [3, 0, 3, 0], '*centerAlignContent': null });
            elem.addSpacer();
            await this.createTitle(elem, 'oil', wSize, this.FPW.isSmallDisplay || wSize === 'small');
            elem.addSpacer(2);
            let txtStyle = styles.normal;
            if (vData.oilLife && vData.oilLife >= 0 && vData.oilLife <= 25) {
                txtStyle = styles.warning;
            }
            // console.log(`oilLife: ${vData.oilLife}`);
            let text = vData.oilLife ? `${vData.oilLife}%` : this.FPW.textMap().errorMessages.noData;
            await this.WidgetHelpers.createText(elem, text, txtStyle);
            // srcField.addSpacer(3);
        } catch (e) {
            this.FPW.logger(`createOilElement() Error: ${e}`, true);
        }
    }

    async createEvChargeElement(srcField, vData, wSize = 'medium') {
        try {
            let elem = await this.WidgetHelpers.createRow(srcField, { '*setPadding': [3, 0, 3, 0], '*centerAlignContent': null });
            elem.addSpacer();
            await this.createTitle(elem, 'evChargeStatus', wSize, this.FPW.isSmallDisplay || wSize === 'small');
            elem.addSpacer(2);
            let value = vData.evChargeStatus ? `${vData.evChargeStatus}` : this.FPW.textMap().errorMessages.noData;
            // console.log(`battery charge: ${value}`);
            await this.WidgetHelpers.createText(elem, value, { font: Font.systemFont(this.FPW.sizeMap[wSize].fontSizeMedium + 2), textColor: this.FPW.colorMap.normalText, lineLimit: 1 });
            // srcField.addSpacer(3);
        } catch (e) {
            this.FPW.logger(`createEvChargeElement() Error: ${e}`, true);
        }
    }

    async createDoorElement(srcField, vData, countOnly = false, wSize = 'medium') {
        try {
            const styles = {
                normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText, lineLimit: 1 },
                open: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.openColor, lineLimit: 1 },
                closed: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.closedColor, lineLimit: 1 },
                offset: 5,
            };

            let offset = styles.offset;
            let titleFld = await this.WidgetHelpers.createRow(srcField, { '*centerAlignContent': null });
            await this.createTitle(titleFld, 'doors', wSize);

            // Creates the first row of status elements for LF and RF
            let dataRow1Fld = await this.WidgetHelpers.createRow(srcField, { '*topAlignContent': null });

            if (countOnly) {
                let value = this.FPW.textMap().errorMessages.noData;
                // let allDoorsCnt = Object.values(vData.statusDoors).filter((door) => door !== null).length;
                let countOpen;
                if (vData.statusDoors) {
                    countOpen = Object.values(vData.statusDoors).filter((door) => door === true).length;
                    value = countOpen == 0 ? this.FPW.textMap().UIValues.closed : `${countOpen} ${this.FPW.textMap().UIValues.open}`;
                }
                await this.WidgetHelpers.createText(dataRow1Fld, value, countOpen > 0 ? styles.open : styles.closed);
            } else {
                let col1 = await this.WidgetHelpers.createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
                let col1row1 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
                await this.WidgetHelpers.createText(col1row1, 'LF (', styles.normTxt);
                await this.WidgetHelpers.createText(col1row1, vData.statusDoors.driverFront ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusDoors.driverFront ? styles.open : styles.closed);
                await this.WidgetHelpers.createText(col1row1, ')', styles.normTxt);

                let col2 = await this.WidgetHelpers.createColumn(dataRow1Fld, { '*setPadding': [0, 3, 0, 3] });
                let col2row1 = await this.WidgetHelpers.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
                await this.WidgetHelpers.createText(col2row1, '|', styles.normTxt);

                let col3 = await this.WidgetHelpers.createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
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
                            let dataRow3Fld = await this.WidgetHelpers.createRow(srcField);
                            await getHoodStatusElem(dataRow3Fld, vData, true);
                        } else if (hasTailgate && !hasHood) {
                            let dataRow3Fld = await this.WidgetHelpers.createRow(srcField, {});
                            await getTailgateStatusElem(dataRow3Fld, vData, true);
                        }
                    }
                    // offset = offset + 10;
                }
            }
            srcField.addSpacer(offset);
        } catch (err) {
            this.FPW.logger(`createStatusDoors() Error: ${err}`, true);
        }
    }

    async createWindowElement(srcField, vData, countOnly = false, wSize = 'medium') {
        try {
            const styles = {
                normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText },
                open: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.openColor },
                closed: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.closedColor },
                offset: 10,
            };

            let offset = styles.offset;
            let titleFld = await this.WidgetHelpers.createRow(srcField);
            await this.createTitle(titleFld, 'windows', wSize);

            // Creates the first row of status elements for LF and RF
            let dataRow1Fld = await this.WidgetHelpers.createRow(srcField, { '*topAlignContent': null });
            if (countOnly) {
                let value = this.FPW.textMap().errorMessages.noData;
                let countOpen;
                if (vData.statusWindows) {
                    countOpen = Object.values(vData.statusWindows).filter((window) => window === true).length;
                    value = countOpen == 0 ? this.FPW.textMap().UIValues.closed : `${countOpenWindows} ${this.FPW.textMap().UIValues.open}`;
                }
                await this.WidgetHelpers.createText(dataRow1Fld, value, countOpen > 0 ? styles.open : styles.closed);
            } else {
                let col1 = await this.WidgetHelpers.createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
                let col1row1 = await this.WidgetHelpers.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
                await this.WidgetHelpers.createText(col1row1, 'LF (', styles.normTxt);
                await this.WidgetHelpers.createText(col1row1, vData.statusWindows.driverFront ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusWindows['driverFront'] ? styles.open : styles.closed);
                await this.WidgetHelpers.createText(col1row1, ')', styles.normTxt);

                let col2 = await this.WidgetHelpers.createColumn(dataRow1Fld, { '*setPadding': [0, 3, 0, 3] });
                let col2row1 = await this.WidgetHelpers.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
                await this.WidgetHelpers.createText(col2row1, '|', styles.normTxt);

                let col3 = await this.WidgetHelpers.createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
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

                if (vData.statusDoors['tailgate'] !== undefined || vData.statusDoors['hood'] !== undefined) {
                    offset = offset + 10;
                }
            }
            srcField.addSpacer(offset);
        } catch (e) {
            this.FPW.logger(`createWindowElement() Error: ${e}`, true);
        }
    }

    async createTireElement(srcField, vData, wSize = 'medium') {
        try {
            const styles = {
                normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText },
            };
            let offset = 0;
            let titleFld = await this.WidgetHelpers.createRow(srcField);
            let pressureUnits = await this.FPW.getSettingVal('fpPressureUnits');
            let unitTxt = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
            await this.createTitle(titleFld, `tirePressure||${unitTxt}`, wSize);

            let dataFld = await this.WidgetHelpers.createRow(srcField, { '*centerAlignContent': null });
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
            let titleFld = await this.WidgetHelpers.createRow(srcField);
            await this.createTitle(titleFld, 'position', wSize);

            let dataFld = await this.WidgetHelpers.createRow(srcField);
            let url = (await this.FPW.getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vData.latitude},${vData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vData.info.vehicle.nickName)}&ll=${vData.latitude},${vData.longitude}`;
            let value = vData.position ? (this.widgetConfig.screenShotMode ? '1234 Someplace Drive, Somewhere' : `${vData.position}`) : this.FPW.textMap().errorMessages.noData;
            await this.WidgetHelpers.createText(dataFld, value, { url: url, font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText, lineLimit: 2, minimumScaleFactor: 0.9 });
            srcField.addSpacer();
        } catch (e) {
            this.FPW.logger(`createPositionElement() Error: ${e}`, true);
        }
    }

    async createLockStatusElement(srcField, vData, wSize = 'medium') {
        try {
            const styles = {
                unlocked: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.openColor, lineLimit: 1 },
                locked: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.closedColor, lineLimit: 1 },
            };
            let titleFld = await this.WidgetHelpers.createRow(srcField, { '*centerAlignContent': null });
            await this.createTitle(titleFld, 'lockStatus', wSize);
            titleFld.addSpacer(2);
            let dataFld = await this.WidgetHelpers.createRow(srcField, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });

            let value = vData.lockStatus ? vData.lockStatus.toLowerCase().charAt(0).toUpperCase() + vData.lockStatus.toLowerCase().slice(1) : this.FPW.textMap().errorMessages.noData;
            await this.WidgetHelpers.createText(dataFld, value, vData.lockStatus !== undefined && vData.lockStatus === 'LOCKED' ? styles.locked : styles.unlocked);
            srcField.addSpacer();
        } catch (e) {
            this.FPW.logger(`createLockStatusElement() Error: ${e}`, true);
        }
    }

    async createIgnitionStatusElement(srcField, vData, wSize = 'medium') {
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
            let titleFld = await this.WidgetHelpers.createRow(srcField, { '*centerAlignContent': null });
            await this.createTitle(titleFld, 'ignitionStatus', wSize);
            titleFld.addSpacer(2);
            let dataFld = await this.WidgetHelpers.createRow(srcField, { '*setPadding': [3, 0, 0, 0], '*centerAlignContent': null });
            await this.WidgetHelpers.createText(dataFld, status, vData.ignitionStatus !== undefined && (vData.ignitionStatus === 'On' || vData.ignitionStatus === 'Run' || remStartOn) ? styles.on : styles.off);
            srcField.addSpacer();
        } catch (e) {
            this.FPW.logger(`createIgnitionStatusElement() Error: ${e}`, true);
        }
    }

    async createTimeStampElement(stk, vData, wSize = 'medium') {
        try {
            // Creates the Refresh Label to show when the data was last updated from Ford
            let refreshTime = vData.lastRefreshElapsed ? vData.lastRefreshElapsed : this.FPW.textMap().UIValues.unknown;
            await this.WidgetHelpers.createText(stk, 'Updated: ' + refreshTime, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: this.FPW.colorMap.normalText, textOpacity: 0.6, lineLimit: 1 });
            return stk;
        } catch (e) {
            this.FPW.logger(`createTimeStampElement() Error: ${e}`, true);
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
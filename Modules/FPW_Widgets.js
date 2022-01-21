const FPW_Widgets_Small = importModule('/FPWModules/FPW_Widgets_Small.js'),
    FPW_Widgets_Medium = importModule('/FPWModules/FPW_Widgets_Medium.js'),
    FPW_Widgets_Large = importModule('/FPWModules/FPW_Widgets_Large.js'),
    FPW_Widgets_ExtraLarge = importModule('/FPWModules/FPW_Widgets_ExtraLarge.js');

module.exports = class FPW_Widgets {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.Kc = FPW.Kc;
        this.Files = FPW.Files;
        this.FordRequests = FPW.FordRequests;
        this.Alerts = FPW.Alerts;
        this.Timers = FPW.Timers;
        this.Utils = FPW.Utils;
        this.SmallWidget = new FPW_Widgets_Small(this);
        this.MediumWidget = new FPW_Widgets_Medium(this);
        this.LargeWidget = new FPW_Widgets_Large(this);
        this.ExtraLargeWidget = new FPW_Widgets_ExtraLarge(this);
    }

    async createColumn(srcField, styles = {}) {
        let col = srcField.addStack();
        col.layoutVertically();
        if (styles && Object.keys(styles).length > 0) {
            this.Utils._mapMethodsAndCall(col, styles);
        }

        return col;
    }

    async createRow(srcField, styles = {}) {
        let row = srcField.addStack();
        row.layoutHorizontally();
        if (styles && Object.keys(styles).length > 0) {
            this.Utils._mapMethodsAndCall(row, styles);
        }

        return row;
    }

    async createText(srcField, text, styles = {}) {
        let txt = srcField.addText(text);
        if (styles && Object.keys(styles).length > 0) {
            this.Utils._mapMethodsAndCall(txt, styles);
        }
        return txt;
    }

    async createImage(srcField, image, styles = {}) {
        let _img = srcField.addImage(image);
        if (styles && Object.keys(styles).length > 0) {
            this.Utils._mapMethodsAndCall(_img, styles);
        }
        return _img;
    }

    async createTitle(headerField, titleText, wSize = 'medium', hideTitleForSmall = false) {
        let titleParams = titleText.split('||');
        let icon = this.FPW.iconMap[titleParams[0]];
        let titleStack = await headerField.addStack({ '*centerAlignContent': null });
        if (icon !== undefined) {
            titleStack.layoutHorizontally();
            let imgFile = await this.Files.getImage(icon.toString());
            await this.createImage(titleStack, imgFile, { imageSize: new Size(this.FPW.sizeMap[wSize].iconSize.w, this.FPW.sizeMap[wSize].iconSize.h) });
        }
        // console.log(`titleParams(${titleText}): ${titleParams}`);
        if (titleText && titleText.length && !hideTitleForSmall) {
            titleStack.addSpacer(2);
            let title = titleParams.length > 1 ? this.FPW.textMap(titleParams[1]).elemHeaders[titleParams[0]] : this.FPW.textMap().elemHeaders[titleParams[0]];
            await this.createText(titleStack, title + ':', { font: Font.boldSystemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: new Color(this.FPW.colorMap.textColor1), lineLimit: 1 });
        }
    }

    async createProgressBar(percent, vData, wSize = 'medium') {
        // percent = 12;
        const isEV = vData.evVehicle === true;
        let fillLevel = percent > 100 ? 100 : percent;
        const barWidth = this.FPW.sizeMap[wSize].barGauge.w;
        const context = new DrawContext();
        context.size = new Size(barWidth, this.FPW.sizeMap[wSize].barGauge.h + 3);
        context.opaque = false;
        context.respectScreenScale = true;

        // Bar Background Gradient
        const lvlBgPath = new Path();
        lvlBgPath.addRoundedRect(new Rect(0, 0, barWidth, this.FPW.sizeMap[wSize].barGauge.h), 3, 2);
        context.addPath(lvlBgPath);
        context.setFillColor(Color.lightGray());
        context.fillPath();

        // Bar Level Background
        const lvlBarPath = new Path();
        lvlBarPath.addRoundedRect(new Rect(0, 0, (barWidth * fillLevel) / 100, this.FPW.sizeMap[wSize].barGauge.h), 3, 2);
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
        context.setFont(Font.mediumSystemFont(this.FPW.sizeMap[wSize].barGauge.fs));
        context.setTextColor(Color.black());

        // if (fillLevel > 75) {
        //     context.setTextColor(Color.white());
        // }
        const icon = isEV ? String.fromCodePoint('0x1F50B') : '\u26FD';
        const lvlStr = fillLevel < 0 || fillLevel > 100 ? '--' : `${fillLevel}%`;
        context.drawTextInRect(`${icon} ${lvlStr}`, new Rect(xPos, this.FPW.sizeMap[wSize].barGauge.h / this.FPW.sizeMap[wSize].barGauge.fs, this.FPW.sizeMap[wSize].barGauge.w, this.FPW.sizeMap[wSize].barGauge.h));
        context.setTextAlignedCenter();
        return await context.getImage();
    }

    async createVehicleImageElement(srcField, vData, width, height) {
        let logoRow = await this.createRow(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        if (vData.info !== undefined && vData.info.vehicle !== undefined) {
            await this.createImage(logoRow, await this.Files.getVehicleImage(vData.info.vehicle.modelYear), { imageSize: new Size(width, height), '*centerAlignImage': null });
            srcField.addSpacer(3);
        }
        // return srcField;
    }

    async createRangeElements(srcField, vehicleData, wSize = 'medium') {
        try {
            const isEV = vehicleData.evVehicle === true;
            let lvlValue = !isEV ? (vehicleData.fuelLevel ? vehicleData.fuelLevel : 0) : vehicleData.evBatteryLevel ? vehicleData.evBatteryLevel : 0;
            let dteValue = !isEV ? (vehicleData.distanceToEmpty ? vehicleData.distanceToEmpty : null) : vehicleData.evDistanceToEmpty ? vehicleData.evDistanceToEmpty : null;
            let dtePostfix = isEV ? 'Range' : 'to E';
            let distanceMultiplier = (await this.Kc.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
            let distanceUnit = (await this.Kc.useMetricUnits()) ? 'km' : 'mi'; // unit of length

            // Fuel/Battery Section
            let elemCol = await this.createColumn(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

            // Fuel/Battery Level BAR
            let barRow = await this.createRow(elemCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            await this.createImage(barRow, await this.createProgressBar(lvlValue ? lvlValue : 50, vehicleData, wSize), { '*centerAlignImage': null, imageSize: new Size(this.FPW.sizeMap[wSize].barGauge.w, this.FPW.sizeMap[wSize].barGauge.h + 3) });

            // Distance/Range to Empty
            let dteRow = await this.createRow(elemCol, { '*centerAlignContent': null, '*topAlignContent': null });
            let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.FPW.textMap().errorMessages.noData;
            await this.createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: new Color(this.FPW.colorMap.textColor2), lineLimit: 1 });
            srcField.addSpacer(3);
        } catch (e) {
            console.error(`createFuelRangeElements() Error: ${e}`);
            this.Files.appendToLogFile(`createFuelRangeElements() Error: ${e}`);
        }
    }

    async createFuelRangeElements(srcField, vehicleData, wSize = 'medium') {
        try {
            const isEV = vehicleData.evVehicle === true;
            let lvlValue = !isEV ? (vehicleData.fuelLevel ? vehicleData.fuelLevel : 0) : vehicleData.evBatteryLevel ? vehicleData.evBatteryLevel : 0;
            let dteValue = !isEV ? (vehicleData.distanceToEmpty ? vehicleData.distanceToEmpty : null) : vehicleData.evDistanceToEmpty ? vehicleData.evDistanceToEmpty : null;
            let dtePostfix = isEV ? 'Range' : 'to E';
            let distanceMultiplier = (await this.Kc.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
            let distanceUnit = (await this.Kc.useMetricUnits()) ? 'km' : 'mi'; // unit of length
            // console.log('isEV: ' + isEV);
            // console.log(`fuelLevel: ${vehicleData.fuelLevel}`);
            // console.log(`distanceToEmpty: ${vehicleData.distanceToEmpty}`);
            // console.log(`evBatteryLevel: ${vehicleData.evBatteryLevel}`);
            // console.log('evDistanceToEmpty: ' + vehicleData.evDistanceToEmpty);
            // console.log(`lvlValue: ${lvlValue}`);
            // console.log(`dteValue: ${dteValue}`);

            // Fuel/Battery Section
            let elemCol = await this.createColumn(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

            // // Vehicle Logo
            // await createVehicleImageElement(elemCol, vehicleData, this.FPW.sizeMap[wSize].logoSize.w, this.FPW.sizeMap[wSize].logoSize.h);

            // Fuel/Battery Level BAR
            let barRow = await this.createRow(elemCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            await this.createImage(barRow, await this.createProgressBar(lvlValue ? lvlValue : 50, vehicleData, wSize), { '*centerAlignImage': null, imageSize: new Size(this.FPW.sizeMap[wSize].barGauge.w, this.FPW.sizeMap[wSize].barGauge.h + 3) });

            // Distance to Empty
            let dteRow = await this.createRow(elemCol, { '*centerAlignContent': null, '*topAlignContent': null });
            let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : this.FPW.textMap().errorMessages.noData;
            await this.createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: new Color(this.FPW.colorMap.textColor2), lineLimit: 1 });
            srcField.addSpacer(3);
        } catch (e) {
            console.error(`createFuelRangeElements() Error: ${e}`);
            this.Files.appendToLogFile(`createFuelRangeElements() Error: ${e}`);
        }
    }

    async createBatteryElement(srcField, vehicleData, wSize = 'medium') {
        try {
            let elem = await this.createRow(srcField, { '*layoutHorizontally': null, '*bottomAlignContent': null });
            await this.createTitle(elem, 'batteryStatus', wSize, this.FPW.isSmallDisplay || wSize === 'small');
            elem.addSpacer(2);
            let value = vehicleData.batteryLevel ? `${vehicleData.batteryLevel}V` : 'N/A';
            // console.log(`batteryLevel: ${value}`);
            let lowBattery = vehicleData.batteryStatus === 'STATUS_LOW' ? true : false;
            await this.Widgets.createText(elem, value, { font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: lowBattery ? Color.red() : new Color(this.FPW.colorMap.textColor2), lineLimit: 1 });
            srcField.addSpacer(3);
        } catch (e) {
            console.error(`createBatteryElement() Error: ${e}`);
            this.Files.appendToLogFile(`createBatteryElement() Error: ${e}`);
        }
    }

    async createOilElement(srcField, vData, wSize = 'medium') {
        const styles = {
            normal: { font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: new Color(this.FPW.colorMap.textColor2), lineLimit: 1 },
            warning: { font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: new Color('#FF6700'), lineLimit: 1 },
            critical: { font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: new Color('#DE1738'), lineLimit: 1 },
        };
        let elem = await this.createRow(srcField, { '*layoutHorizontally': null, '*bottomAlignContent': null });
        await this.createTitle(elem, 'oil', wSize, this.FPW.isSmallDisplay || wSize === 'small');
        elem.addSpacer(2);
        let txtStyle = styles.normal;
        if (vData.oilLife && vData.oilLife >= 0 && vData.oilLife <= 25) {
            txtStyle = styles.warning;
        }
        // console.log(`oilLife: ${vData.oilLife}`);
        let text = vData.oilLife ? `${vData.oilLife}%` : this.FPW.textMap().errorMessages.noData;
        await this.createText(elem, text, txtStyle);
        srcField.addSpacer(3);
    }

    async createEvChargeElement(srcField, vehicleData, wSize = 'medium') {
        let elem = await createRow(srcField, { '*layoutHorizontally': null });
        await this.createTitle(elem, 'evChargeStatus', wSize, this.FPW.isSmallDisplay || wSize === 'small');
        elem.addSpacer(2);
        let value = vehicleData.evChargeStatus ? `${vehicleData.evChargeStatus}` : this.FPW.textMap().errorMessages.noData;
        // console.log(`battery charge: ${value}`);
        await this.createText(elem, value, { font: Font.regularSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: new Color(this.FPW.colorMap.textColor2), lineLimit: 1 });
        srcField.addSpacer(3);
    }

    async createDoorElement(srcField, vData, countOnly = false, wSize = 'medium') {
        const styles = {
            normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: new Color(this.FPW.colorMap.textColor2), lineLimit: 1 },
            statOpen: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF5733'), lineLimit: 1 },
            statClosed: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: new Color('#5A65C0'), lineLimit: 1 },
            offset: 5,
        };

        let offset = styles.offset;
        let titleFld = await createRow(srcField);
        await this.createTitle(titleFld, 'doors', wSize);

        // Creates the first row of status elements for LF and RF
        let dataRow1Fld = await this.createRow(srcField);

        if (countOnly) {
            let value = this.FPW.textMap().errorMessages.noData;
            // let allDoorsCnt = Object.values(vData.statusDoors).filter((door) => door !== null).length;
            let countOpen;
            if (vData.statusDoors) {
                countOpen = Object.values(vData.statusDoors).filter((door) => door === true).length;
                value = countOpen == 0 ? this.FPW.textMap().UIValues.closed : `${countOpen} ${this.FPW.textMap().UIValues.open}`;
            }
            await this.createText(dataRow1Fld, value, countOpen > 0 ? styles.statOpen : styles.statClosed);
        } else {
            let col1 = await this.createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
            let col1row1 = await this.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col1row1, 'LF (', styles.normTxt);
            await this.createText(col1row1, vData.statusDoors.driverFront ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusDoors.driverFront ? styles.statOpen : styles.statClosed);
            await this.createText(col1row1, ')', styles.normTxt);

            let col2 = await this.createColumn(dataRow1Fld, { '*setPadding': [0, 3, 0, 3] });
            let col2row1 = await this.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col2row1, '|', styles.normTxt);

            let col3 = await this.createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
            let col3row1 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col3row1, 'RF (', styles.normTxt);
            await this.createText(col3row1, vData.statusDoors.passFront ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusDoors.passFront ? styles.statOpen : styles.statClosed);
            await this.createText(col3row1, ')', styles.normTxt);

            // Creates the second row of status elements for LR and RR
            if (vData.statusDoors.leftRear !== null && vData.statusDoors.rightRear !== null) {
                let col1row2 = await this.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
                await this.createText(col1row2, `LR (`, styles.normTxt);
                await this.createText(col1row2, vData.statusDoors.leftRear ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusDoors.leftRear ? styles.statOpen : styles.statClosed);
                await this.createText(col1row2, ')', styles.normTxt);

                let col2row2 = await this.createRow(col2, {});
                await this.createText(col2row2, '|', styles.normTxt);

                let col3row2 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
                await this.createText(col3row2, `RR (`, styles.normTxt);
                await this.createText(col3row2, vData.statusDoors.rightRear ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusDoors.rightRear ? styles.statOpen : styles.statClosed);
                await this.createText(col3row2, ')', styles.normTxt);
            }

            async function getHoodStatusElem(stkElem, data, center = false) {
                await this.createText(stkElem, `${center ? '       ' : ''}HD (`, styles.normTxt);
                await this.createText(stkElem, data.statusDoors.hood ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusDoors.hood ? styles.statOpen : styles.statClosed);
                await this.createText(stkElem, ')', styles.normTxt);
            }
            async function getTailgateStatusElem(stkElem, data, center = false) {
                await this.createText(stkElem, `${center ? '       ' : ''}TG (`, styles.normTxt);
                await this.createText(stkElem, data.statusDoors.tailgate ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusDoors.tailgate ? styles.statOpen : styles.statClosed);
                await this.createText(stkElem, ')', styles.normTxt);
            }

            // Creates the third row of status elements for the tailgate and/or hood (if equipped)
            let hasHood = vData.statusDoors.hood !== null;
            let hasTailgate = vData.statusDoors.tailgate !== null;
            if (hasHood || hasTailgate) {
                if (hasHood && hasTailgate) {
                    let col1row3 = await this.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
                    await getHoodStatusElem(col1row3, vData);

                    let col2row3 = await this.createRow(col2, {});
                    await this.createText(col2row3, '|', styles.normTxt);

                    let col3row3 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
                    await getTailgateStatusElem(col3row3, vData);
                } else {
                    if (hasHood && !hasTailgate) {
                        let dataRow3Fld = await this.createRow(srcField);
                        await getHoodStatusElem(dataRow3Fld, vData, true);
                    } else if (hasTailgate && !hasHood) {
                        let dataRow3Fld = await this.createRow(srcField, {});
                        await getTailgateStatusElem(dataRow3Fld, vData, true);
                    }
                }
            }
        }
        srcField.addSpacer(offset);
    }

    getOpenItems(items) {
        let openItems = [];
        if (items && items.length) {
            Object.entries(doors)
                .filter(([_, v]) => v)
                .map(([k, _]) => k)
                .forEach((k) => {
                    switch (k) {
                        case 'driverFront':
                            openItems.push('DF');
                            break;
                        case 'passFront':
                            openItems.push('PF');
                            break;
                        case 'leftRear':
                            openItems.push('LR');
                            break;
                        case 'rightRear':
                            openItems.push('RR');
                            break;
                        case 'hood':
                            openItems.push('HD');
                            break;
                        case 'tailgate':
                            openItems.push('TG');
                            break;
                        case 'innerTailgate':
                            openItems.push('ITG');
                            break;
                    }
                });
        }
        return openItems;
    }

    async createWindowElement(srcField, vData, countOnly = false, wSize = 'medium') {
        const styles = {
            normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: new Color(this.FPW.colorMap.textColor2) },
            statOpen: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF5733') },
            statClosed: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: new Color('#5A65C0') },
            offset: 10,
        };

        let offset = styles.offset;
        let titleFld = await this.createRow(srcField);
        await this.createTitle(titleFld, 'windows', wSize);

        // Creates the first row of status elements for LF and RF
        let dataRow1Fld = await this.createRow(srcField);
        if (countOnly) {
            let value = this.FPW.textMap().errorMessages.noData;
            let countOpen;
            if (vData.statusWindows) {
                countOpen = Object.values(vData.statusWindows).filter((window) => window === true).length;
                value = countOpen == 0 ? this.FPW.textMap().UIValues.closed : `${countOpenWindows} ${this.FPW.textMap().UIValues.open}`;
            }
            await this.createText(dataRow1Fld, value, countOpen > 0 ? styles.statOpen : styles.statClosed);
        } else {
            let col1 = await this.createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
            let col1row1 = await this.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col1row1, 'LF (', styles.normTxt);
            await this.createText(col1row1, vData.statusWindows.driverFront ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusWindows['driverFront'] ? styles.statOpen : styles.statClosed);
            await this.createText(col1row1, ')', styles.normTxt);

            let col2 = await this.createColumn(dataRow1Fld, { '*setPadding': [0, 3, 0, 3] });
            let col2row1 = await this.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col2row1, '|', styles.normTxt);

            let col3 = await this.createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
            let col3row1 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col3row1, 'RF (', styles.normTxt);
            await this.createText(col3row1, vData.statusWindows['passFront'] ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusWindows['passFront'] ? styles.statOpen : styles.statClosed);
            await this.createText(col3row1, ')', styles.normTxt);

            // Creates the second row of status elements for LR and RR
            if (vData.statusWindows.driverRear !== null && vData.statusWindows.passRear !== null) {
                let col1row2 = await this.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
                await this.createText(col1row2, `LR (`, styles.normTxt);
                await this.createText(col1row2, vData.statusWindows.driverRear ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusWindows.driverRear ? styles.statOpen : styles.statClosed);
                await this.createText(col1row2, ')', styles.normTxt);

                let col2row2 = await this.createRow(col2, {});
                await this.createText(col2row2, '|', styles.normTxt);

                let col3row2 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
                await this.createText(col3row2, `RR (`, styles.normTxt);
                await this.createText(col3row2, vData.statusWindows.passRear ? this.FPW.textMap().symbols.open : this.FPW.textMap().symbols.closed, vData.statusWindows.passRear ? styles.statOpen : styles.statClosed);
                await this.createText(col3row2, ')', styles.normTxt);
            }

            if (vData.statusDoors['tailgate'] !== undefined || vData.statusDoors['hood'] !== undefined) {
                offset = offset + 10;
            }
        }
        srcField.addSpacer(offset);
    }

    async createTireElement(srcField, vData, wSize = 'medium') {
        const styles = {
            normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: new Color(this.FPW.colorMap.textColor2) },
        };
        let offset = 0;
        let titleFld = await this.createRow(srcField);
        let pressureUnits = await this.Kc.getSettingVal('fpPressureUnits');
        let unitTxt = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
        await createTitle(titleFld, `tirePressure||${unitTxt}`, wSize);

        let dataFld = await this.createRow(srcField);
        // Row 1 - Tire Pressure Left Front amd Right Front
        let col1 = await this.createColumn(dataFld, { '*setPadding': [0, 0, 0, 0] });
        let col1row1 = await this.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
        await this.createText(col1row1, vData.tirePressure.leftFront, this.Utils.getTirePressureStyle(vData.tirePressure.leftFront, unitTxt));
        let col2 = await this.createColumn(dataFld, { '*setPadding': [0, 3, 0, 3] });
        let col2row1 = await this.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
        await this.createText(col2row1, '|', styles.normTxt);
        let col3 = await this.createColumn(dataFld, { '*setPadding': [0, 0, 0, 0] });
        let col3row1 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
        await this.createText(col3row1, vData.tirePressure.rightFront, this.Utils.getTirePressureStyle(vData.tirePressure.rightFront, unitTxt));

        // Row 2 - Tire Pressure Left Rear amd Right Rear
        let col1row2 = await this.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
        await this.createText(col1row2, vData.tirePressure.leftRear, this.Utils.getTirePressureStyle(vData.tirePressure.leftRear, unitTxt));
        let col2row2 = await this.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
        await this.createText(col2row2, '|', styles.normTxt);
        let col3row2 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
        await this.createText(col3row2, vData.tirePressure.rightRear, this.Utils.getTirePressureStyle(vData.tirePressure.rightRear, unitTxt));

        srcField.addSpacer(offset);
    }

    async createPositionElement(srcField, vehicleData, wSize = 'medium') {
        let offset = 0;
        let titleFld = await this.createRow(srcField);
        await this.createTitle(titleFld, 'position', wSize);

        let dataFld = await this.createRow(srcField);
        let url = (await this.Kc.getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vehicleData.latitude},${vehicleData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vehicleData.info.vehicle.nickName)}&ll=${vehicleData.latitude},${vehicleData.longitude}`;
        let value = vehicleData.position ? (widgetConfig.screenShotMode ? '1234 Someplace Drive, Somewhere' : `${vehicleData.position}`) : this.FPW.textMap().errorMessages.noData;
        await this.createText(dataFld, value, { url: url, font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: new Color(this.FPW.colorMap.textColor2), lineLimit: 2, minimumScaleFactor: 0.7 });
        srcField.addSpacer(offset);
    }

    async createLockStatusElement(srcField, vehicleData, wSize = 'medium') {
        const styles = {
            unlocked: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF5733'), lineLimit: 1 },
            locked: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: new Color('#5A65C0'), lineLimit: 1 },
        };
        let offset = 2;
        let titleFld = await this.createRow(srcField);
        await this.createTitle(titleFld, 'lockStatus', wSize);
        titleFld.addSpacer(2);
        let dataFld = await this.createRow(srcField);
        let value = vehicleData.lockStatus ? vehicleData.lockStatus.toLowerCase().charAt(0).toUpperCase() + vehicleData.lockStatus.toLowerCase().slice(1) : this.FPW.textMap().errorMessages.noData;
        await this.createText(dataFld, value, vehicleData.lockStatus !== undefined && vehicleData.lockStatus === 'LOCKED' ? styles.locked : styles.unlocked);
        srcField.addSpacer(offset);
    }

    async createIgnitionStatusElement(srcField, vehicleData, wSize = 'medium') {
        const styles = {
            on: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF5733') },
            off: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: new Color('#5A65C0') },
        };
        let remStartOn = vehicleData.remoteStartStatus && vehicleData.remoteStartStatus.running ? true : false;
        let status = '';
        if (remStartOn) {
            status = `Remote Start (ON)`;
        } else if (vehicleData.ignitionStatus !== undefined) {
            status = vehicleData.ignitionStatus.charAt(0).toUpperCase() + vehicleData.ignitionStatus.slice(1); //vehicleData.ignitionStatus.toUpperCase();
        } else {
            this.FPW.textMap().errorMessages.noData;
        }
        let offset = 2;
        let titleFld = await this.createRow(srcField);
        await this.createTitle(titleFld, 'ignitionStatus', wSize);
        titleFld.addSpacer(2);
        let dataFld = await this.createRow(srcField);
        await this.createText(dataFld, status, vehicleData.ignitionStatus !== undefined && (vehicleData.ignitionStatus === 'On' || vehicleData.ignitionStatus === 'Run' || remStartOn) ? styles.on : styles.off);
        srcField.addSpacer(offset);
    }

    async createTimeStampElement(stk, vehicleData, wSize = 'medium') {
        // stk.setPadding(topOffset, leftOffset, bottomOffset, rightOffset);
        // Creates the Refresh Label to show when the data was last updated from Ford
        let refreshTime = vehicleData.lastRefreshElapsed ? vehicleData.lastRefreshElapsed : this.FPW.textMap().UIValues.unknown;
        await this.createText(stk, 'Updated: ' + refreshTime, { font: Font.mediumSystemFont(8), textColor: Color.lightGray(), lineLimit: 1 });
        return stk;
    }

    async hasStatusMsg(vData) {
        return vData.error || (!vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') || vData.deepSleepMode || vData.firmwareUpdating || updateAvailable; //|| (!vData.evVehicle && vData.oilLow)
    }

    async createStatusElement(stk, vData, maxMsgs = 2, wSize = 'medium') {
        let cnt = 0;
        // Creates Elements to display any errors in red at the bottom of the widget
        if (vData.error) {
            // stk.addSpacer(5);
            await this.createText(stk, vData.error ? 'Error: ' + vData.error : '', { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: Color.red() });
        } else {
            if (cnt < maxMsgs && !vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') {
                stk.addSpacer(cnt > 0 ? 5 : 0);
                await this.createText(stk, `\u2022 12V Battery Low`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: Color.red(), lineLimit: 1 });
                cnt++;
            }
            // if (cnt < maxMsgs && !vData.evVehicle && vData.oilLow) {
            //     stk.addSpacer(cnt > 0 ? 5 : 0);
            //     await createText(stk, `\u2022 Oil Reporting Low`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: Color.red(), lineLimit: 1 });
            //     cnt++;
            // }
            if (cnt < maxMsgs && vData.deepSleepMode) {
                stk.addSpacer(cnt > 0 ? 5 : 0);
                await this.createText(stk, `\u2022 Deep Sleep Mode`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: Color.orange(), lineLimit: 1 });
                cnt++;
            }
            if (cnt < maxMsgs && vData.firmwareUpdating) {
                stk.addSpacer(cnt > 0 ? 5 : 0);
                await this.createText(stk, `\u2022 Firmware Updating`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: Color.green(), lineLimit: 1 });
                cnt++;
            }
            if (cnt < maxMsgs && updateAvailable) {
                stk.addSpacer(cnt > 0 ? 5 : 0);
                await this.createText(stk, `\u2022 Script Update: v${this.LATEST_VERSION}`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: Color.orange(), lineLimit: 1 });
                cnt++;
            }
        }
        if (!hasStatusMsg()) {
            await this.createText(stk, `     `, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeSmall), textColor: new Color(this.FPW.colorMap.textColor2), lineLimit: 1 });
        }
        return stk;
    }
};
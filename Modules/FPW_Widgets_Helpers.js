module.exports = class FPW_Widgets_Helpers {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.textMap = FPW.textMap();
        this.iconMap = FPW.iconMap;
        this.colorMap = FPW.colorMap;
    }

    async createColumn(srcField, styles = {}) {
        try {
            let col = srcField.addStack();
            col.layoutVertically();
            if (styles && Object.keys(styles).length > 0) {
                this.FPW._mapMethodsAndCall(col, styles);
            }
            return col;
        } catch (e) {
            this.FPW.logError(`createColumn Error: ${e}`);
        }
    }

    async createRow(srcField, styles = {}) {
        try {
            let row = srcField.addStack();
            row.layoutHorizontally();
            if (styles && Object.keys(styles).length > 0) {
                this.FPW._mapMethodsAndCall(row, styles);
            }
            return row;
        } catch (e) {
            this.FPW.logError(`createRow Error: ${e}`);
            return null;
        }
    }

    async createText(srcField, text, styles = {}) {
        let txt = srcField.addText(text);
        if (styles && Object.keys(styles).length > 0) {
            this.FPW._mapMethodsAndCall(txt, styles);
        }
        return txt;
    }

    async createImage(srcField, image, styles = {}) {
        let _img = srcField.addImage(image);
        if (styles && Object.keys(styles).length > 0) {
            this.FPW._mapMethodsAndCall(_img, styles);
        }
        return _img;
    }

    async createTitle(srcElem, titleText, wSize = 'medium', colon = true, hideTitleForSmall = false) {
        let titleParams = titleText.split('||');
        let icon = this.FPW.iconMap[titleParams[0]];
        let titleStack = await this.createRow(srcElem, { '*centerAlignContent': null });
        if (icon !== undefined) {
            let imgFile = await this.FPW.Files.getImage(icon.toString());
            await this.createImage(titleStack, imgFile, { imageSize: new Size(this.FPW.sizeMap[wSize].iconSize.w, this.FPW.sizeMap[wSize].iconSize.h), resizable: true });
        }
        // console.log(`titleParams(${titleText}): ${titleParams}`);
        if (titleText && titleText.length && !hideTitleForSmall) {
            titleStack.addSpacer(2);
            let title = titleParams.length > 1 ? this.FPW.textMap(titleParams[1]).elemHeaders[titleParams[0]] : this.FPW.textMap().elemHeaders[titleParams[0]];
            await this.createText(titleStack, `${title}${colon ? ':' : ''}`, { font: Font.boldSystemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.FPW.colorMap.normalText, lineLimit: 1 });
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

    async createVehicleImageElement(srcField, vData, width, height, angle = 4) {
        let logoRow = await this.createRow(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        if (vData.info !== undefined && vData.info.vehicle !== undefined) {
            await this.createImage(logoRow, await this.FPW.Files.getVehicleImage(vData.info.vehicle.modelYear, false, angle), { imageSize: new Size(width, height), '*centerAlignImage': null, resizable: true });
            srcField.addSpacer(3);
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

    async createDoorElement(srcStack, vData, wSize = 'medium', position = 'center') {
        const styles = {
            normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText, lineLimit: 2 },
            open: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 2 },
            closed: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 2 },
            offset: 5,
        };

        let titleRow = await this.createRow(srcStack, { '*centerAlignContent': null });
        if (position == 'center' || position == 'right') {
            titleRow.addSpacer();
        }
        await this.createTitle(titleRow, 'doors', wSize, false);
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
    }

    async createWindowElement(srcStack, vData, wSize = 'medium', position = 'center') {
        const styles = {
            normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText, lineLimit: 2 },
            open: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.openColor, lineLimit: 2 },
            closed: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.closedColor, lineLimit: 2 },
            offset: 5,
        };

        let titleRow = await this.createRow(srcStack, { '*centerAlignContent': null });
        if (position == 'center' || position == 'right') {
            titleRow.addSpacer();
        }
        await this.createTitle(titleRow, 'windows', wSize, false);
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
    }

    async createTireElement(srcStack, vData, wSize = 'medium', position = 'center') {
        try {
            const styles = {
                normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.colorMap.normalText },
            };
            let titleRow = await this.createRow(srcStack);
            let pressureUnits = await this.FPW.getSettingVal('fpPressureUnits');
            let unitTxt = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
            if (position == 'center' || position == 'right') {
                titleRow.addSpacer();
            }
            await this.createTitle(titleRow, `tirePressure||${unitTxt}`, wSize, false);
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
            await this.createText(col1row1, vData.tirePressure.leftFront, this.getTirePressureStyle(vData.tirePressure.leftFront, unitTxt, wSize));
            let col2 = await this.createColumn(valueRow, { '*setPadding': [0, 3, 0, 3] });
            let col2row1 = await this.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col2row1, '|', styles.normTxt);
            let col3 = await this.createColumn(valueRow, { '*setPadding': [0, 0, 0, 0] });
            let col3row1 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col3row1, vData.tirePressure.rightFront, this.getTirePressureStyle(vData.tirePressure.rightFront, unitTxt, wSize));

            // Row 2 - Tire Pressure Left Rear amd Right Rear
            let col1row2 = await this.createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col1row2, vData.tirePressure.leftRear, this.getTirePressureStyle(vData.tirePressure.leftRear, unitTxt, wSize));
            let col2row2 = await this.createRow(col2, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col2row2, '|', styles.normTxt);
            let col3row2 = await this.createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await this.createText(col3row2, vData.tirePressure.rightRear, this.getTirePressureStyle(vData.tirePressure.rightRear, unitTxt, wSize));

            if (position == 'center' || position == 'left') {
                valueRow.addSpacer();
            }
        } catch (e) {
            this.FPW.logger(`createTireElement() Error: ${e}`, true);
        }
    }

    /**
     * @description
     * @param  {any} pressure
     * @param  {any} unit
     * @param  {string} [wSize='medium']
     * @return
     * @memberof Widget
     */
    getTirePressureStyle(pressure, unit, wSize = 'medium') {
        const styles = {
            normTxt: { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText },
            statLow: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.orangeColor },
            statCrit: { font: Font.heavySystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.redColor },
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
            await this.createText(srcRow, 'Updated: ' + refreshTime, { font: Font.mediumSystemFont(fontSize || this.FPW.sizeMap[wSize].fontSizeSmall), textColor: this.FPW.colorMap.normalText, textOpacity: 0.6, lineLimit: 1 });
            if (position === 'center' || position === 'left') {
                srcRow.addSpacer();
            }
        } catch (e) {
            this.FPW.logger(`createTimeStampElement() Error: ${e}`, true);
        }
    }

    async imgBtnRowBuilder(srcRow, elemWidth, widthPerc, elemHeight, icon) {
        const btnCol = await this.createColumn(srcRow, { '*setPadding': [5, 0, 5, 0], size: new Size(Math.round(elemWidth * widthPerc), elemHeight), cornerRadius: 8, borderWidth: 2, borderColor: Color.darkGray() });
        btnCol.addSpacer(); // Pushes Button column down to help center in middle

        const btnImgRow = await this.createRow(btnCol, { '*setPadding': [0, 0, 0, 0] });
        btnImgRow.addSpacer();
        await this.createImage(btnImgRow, icon.image, icon.opts);
        btnImgRow.addSpacer();
        btnCol.addSpacer(); // Pushes Button column up to help center in middle
    }

    async createWidgetButtonRow(srcRow, vData, rowWidth, rowHeight = 40, btnSize = 24) {
        const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
        const buttonRow = await this.createRow(srcRow, { '*setPadding': [0, 0, 0, Math.round(rowWidth * 0.05)], spacing: 10 });

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

    async createStatusElement(stk, vData, maxMsgs = 2, wSize = 'medium') {
        try {
            let cnt = 0;
            const hasStatusMsg = await this.hasStatusMsg(vData);
            // Creates Elements to display any errors in red at the bottom of the widget
            if (vData.error) {
                // stk.addSpacer(5);
                await this.createText(stk, vData.error ? 'Error: ' + vData.error : '', { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.red() });
            } else {
                if (cnt < maxMsgs && !vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.createText(stk, `\u2022 12V Battery Low`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.red(), lineLimit: 1 });
                    cnt++;
                }
                // if (cnt < maxMsgs && !vData.evVehicle && vData.oilLow) {
                //     stk.addSpacer(cnt > 0 ? 5 : 0);
                //     await createText(stk, `\u2022 Oil Reporting Low`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.red(), lineLimit: 1 });
                //     cnt++;
                // }
                if (cnt < maxMsgs && vData.deepSleepMode) {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.createText(stk, `\u2022 Deep Sleep Mode`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.orange(), lineLimit: 1 });
                    cnt++;
                }
                if (cnt < maxMsgs && vData.firmwareUpdating) {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.createText(stk, `\u2022 Firmware Updating`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.green(), lineLimit: 1 });
                    cnt++;
                }
                if (cnt < maxMsgs && this.FPW.getStateVal('updateAvailable') === true) {
                    stk.addSpacer(cnt > 0 ? 5 : 0);
                    await this.createText(stk, `\u2022 Script Update: v${this.FPW.getStateVal('LATEST_VERSION')}`, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: Color.orange(), lineLimit: 1 });
                    cnt++;
                }
            }
            if (!hasStatusMsg) {
                // await this.createText(stk, `     `, { font: Font.mediumSystemFont(this.FPW.sizeMap[wSize].fontSizeMedium), textColor: this.FPW.colorMap.normalText, lineLimit: 1 });
            }
            return stk;
        } catch (e) {
            this.FPW.logger(`createStatusElement() Error: ${e}`, true);
        }
    }
};
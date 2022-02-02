module.exports = class FPW_Widgets_Helpers {
    DeviceSize = {
        '428x926': {
            small: { width: 176, height: 176 },
            medium: { width: 374, height: 176 },
            large: { width: 374, height: 391 },
        },
        '390x844': {
            small: { width: 161, height: 161 },
            medium: { width: 342, height: 161 },
            large: { width: 342, height: 359 },
        },
        '414x896': {
            small: { width: 169, height: 169 },
            medium: { width: 360, height: 169 },
            large: { width: 360, height: 376 },
        },
        '375x812': {
            small: { width: 155, height: 155 },
            medium: { width: 329, height: 155 },
            large: { width: 329, height: 345 },
        },
        '414x736': {
            small: { width: 159, height: 159 },
            medium: { width: 348, height: 159 },
            large: { width: 348, height: 357 },
        },
        '375x667': {
            small: { width: 148, height: 148 },
            medium: { width: 322, height: 148 },
            large: { width: 322, height: 324 },
        },
        '320x568': {
            small: { width: 141, height: 141 },
            medium: { width: 291, height: 141 },
            large: { width: 291, height: 299 },
        },
    };

    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
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

    async createTitle(headerField, titleText, wSize = 'medium', hideTitleForSmall = false) {
        let titleParams = titleText.split('||');
        let icon = this.FPW.iconMap[titleParams[0]];
        let titleStack = await headerField.addStack({ '*bottomAlignContent': null });
        if (icon !== undefined) {
            titleStack.layoutHorizontally();
            let imgFile = await this.FPW.Files.getImage(icon.toString());
            await this.createImage(titleStack, imgFile, { imageSize: new Size(this.FPW.sizeMap[wSize].iconSize.w, this.FPW.sizeMap[wSize].iconSize.h) });
        }
        // console.log(`titleParams(${titleText}): ${titleParams}`);
        if (titleText && titleText.length && !hideTitleForSmall) {
            titleStack.addSpacer(2);
            let title = titleParams.length > 1 ? this.FPW.textMap(titleParams[1]).elemHeaders[titleParams[0]] : this.FPW.textMap().elemHeaders[titleParams[0]];
            await this.createText(titleStack, title + ':', { font: Font.boldSystemFont(this.FPW.sizeMap[wSize].titleFontSize), textColor: this.FPW.colorMap.normalText, lineLimit: 1 });
        }
    }

    getFont(fontName, fontSize) {
        if (fontName == 'SF UI Display') {
            return Font.systemFont(fontSize);
        }

        if (fontName == 'SF UI Display Bold') {
            return Font.semiboldSystemFont(fontSize);
        }
        return new Font(fontName, fontSize);
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
};
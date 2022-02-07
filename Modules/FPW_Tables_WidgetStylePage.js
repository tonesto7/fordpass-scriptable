module.exports = class FPW_Tables_WidgetStylePage {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
    }

    async createWidgetStylePage() {
        try {
            let widgetStyle = await this.FPW.getWidgetStyle();
            // console.log(`(Widget Style Selector) Current widget style: ${widgetStyle} | Size: ${size}`);
            let tableRows = [];
            let systemMode = this.FPW.darkMode ? 'Dark' : 'Light';
            tableRows.push(
                await this.FPW.Tables.createTableRow(
                    [
                        await this.FPW.Tables.createTextCell(`Widget Styles`, `This page shows an example of the different sizes, types and colors\nTap on type to set it.`, {
                            align: 'center',
                            widthWeight: 1,
                            dismissOnTap: false,
                            titleColor: this.FPW.colorMap.normalText,
                            titleFont: Font.title1(),
                            subtitleColor: Color.lightGray(),
                            subtitleFont: Font.mediumSystemFont(11),
                        }),
                    ], {
                        height: 70,
                        dismissOnSelect: false,
                    },
                ),
            );
            for (const [i, size] of['small', 'medium', 'large'].entries()) {
                tableRows.push(
                    await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell(`${this.FPW.capitalizeStr(size)}`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.title3() })], {
                        height: 30,
                        isHeader: true,
                        dismissOnSelect: false,
                    }),
                );
                for (const [i, style] of['simple', 'detailed'].entries()) {
                    // console.log(`Style: ${style} | Image: ${size}_${style}.png`);
                    for (const [i, color] of['system', 'dark', 'light'].entries()) {
                        let c = color === 'system' ? systemMode : color;
                        if (!(size === 'large' && style === 'simple')) {
                            tableRows.push(
                                await this.FPW.Tables.createTableRow(
                                    [
                                        await this.FPW.Tables.createTextCell(`${this.FPW.capitalizeStr(style)}\n(${this.FPW.capitalizeStr(color)})`, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.subheadline() }),
                                        await this.FPW.Tables.createImageCell(await this.FPW.Files.getImage(`${size}${this.FPW.capitalizeStr(style)}${this.FPW.capitalizeStr(c)}.png`), { align: 'center', widthWeight: 60 }),
                                        await this.FPW.Tables.createTextCell(``, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false }),
                                    ], {
                                        height: 150,
                                        dismissOnSelect: true,
                                        backgroundColor: widgetStyle === style ? Color.lightGray() : undefined,
                                        onSelect: async() => {
                                            console.log(`Setting WidgetStyle to ${style}`);
                                            await this.FPW.setWidgetStyle(style);
                                            this.widgetStyleSelector(size);
                                        },
                                    },
                                ),
                            );
                        }
                    }
                }
                tableRows.push(
                    await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell(``, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false })], {
                        height: 30,
                        dismissOnSelect: false,
                    }),
                );
            }

            await this.FPW.Tables.generateTableMenu('widgetStyles', tableRows, false, false);
        } catch (error) {
            console.error(`createWidgetStylePage() Error: ${error}`);
        }
    }
};
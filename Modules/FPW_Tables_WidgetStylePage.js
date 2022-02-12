module.exports = class FPW_Tables_WidgetStylePage {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
    }

    async createWidgetStylePage() {
        const fontSizes = {
            medium: 10,
            title1: 24,
            title2: 22,
            title3: 20,
            body: 10,
            body2: 11,
            body3: 13,
            footnote: 14,
            headline: 15,
            headline2: 17,
            subheadline: 13,
        };
        try {
            let widgetStyle = await this.FPW.getWidgetStyle();
            // console.log(`(Widget Style Selector) Current widget style: ${widgetStyle} | Size: ${size}`);
            let tableRows = [];
            let systemMode = this.FPW.darkMode ? 'Dark' : 'Light';
            tableRows.push(
                await this.FPW.Tables.createTableRow(
                    [
                        await this.FPW.Tables.createTextCell(`Default Widget Style`, `This page shows an example of the different sizes, types and colors\nTap on type to set it as the default for any widgets used. \nYou can manually set each widget using the edit widget from the homescreen and defining the necessary parameter.`, {
                            align: 'center',
                            widthWeight: 1,
                            dismissOnTap: false,
                            titleColor: this.FPW.colorMap.normalText,
                            titleFont: Font.regularRoundedSystemFont(fontSizes.title1),
                            subtitleColor: Color.lightGray(),
                            subtitleFont: Font.mediumSystemFont(fontSizes.body2),
                        }),
                    ], {
                        height: 100,
                        dismissOnSelect: false,
                    },
                ),
            );
            for (const [i, size] of['small', 'medium', 'large'].entries()) {
                tableRows.push(
                    await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell(`${this.FPW.capitalizeStr(size)}`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title3) })], {
                        height: 30,
                        isHeader: true,
                        dismissOnSelect: false,
                    }),
                );
                for (const [i, style] of['simple', 'detailed'].entries()) {
                    if (!(size === 'large' && style === 'simple')) {
                        let h = 150;
                        switch (size) {
                            case 'small':
                                h = 150;
                                break;
                            case 'medium':
                                h = 150;
                                break;
                            case 'large':
                                h = 300;
                                break;
                        }
                        tableRows.push(
                            await this.FPW.Tables.createTableRow(
                                [
                                    await this.FPW.Tables.createTextCell(`${this.FPW.capitalizeStr(style)}`, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.mediumSystemFont(fontSizes.headline2) }),
                                    await this.FPW.Tables.createImageCell(await this.FPW.Files.getImage(`${size}${this.FPW.capitalizeStr(style)}Light.png`), { align: 'center', widthWeight: 60 }),
                                    await this.FPW.Tables.createTextCell(``, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false }),
                                ], {
                                    height: h,
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
                    // }
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
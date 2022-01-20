module.exports = class FPW_Tables_WidgetStylePage {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.Kc = FPW.Kc;
        this.FordRequests = FPW.FordRequests;
        this.Alerts = FPW.Alerts;
        this.Utils = FPW.Utils;
        this.Timers = FPW.Timers;
        this.Tables = FPW.Tables;
    }

    async createWidgetStylePage() {
        try {
            let widgetStyle = await this.Kc.getWidgetStyle();
            // console.log(`(Widget Style Selector) Current widget style: ${widgetStyle} | Size: ${size}`);
            let tableRows = [];
            tableRows.push(
                await this.Tables.createTableRow(
                    [
                        await this.Tables.createTextCell(`Widget Styles`, `This page will show an example of each widget size and type\nTap on type to set it.`, {
                            align: 'center',
                            widthWeight: 1,
                            dismissOnTap: false,
                            titleColor: new Color(this.FPW.colorMap.textColor1),
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
            for (const [i, size] of['small', 'medium'].entries()) {
                tableRows.push(
                    await this.Tables.createTableRow([await this.Tables.createTextCell(`${this.Utils.capitalizeStr(size)}`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.title3() })], {
                        height: 30,
                        isHeader: true,
                        dismissOnSelect: false,
                    }),
                );
                for (const [i, style] of['simple', 'detailed'].entries()) {
                    // console.log(`Style: ${style} | Image: ${size}_${style}.png`);
                    tableRows.push(
                        await this.Tables.createTableRow(
                            [
                                await this.Tables.createTextCell(`(${this.Utils.capitalizeStr(style)})`, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.subheadline() }),
                                await this.Tables.createImageCell(await this.Files.getImage(`${size}_${style}.png`), { align: 'center', widthWeight: 60 }),
                                await ththis.Tabless.createTextCell(``, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false }),
                            ], {
                                height: 150,
                                dismissOnSelect: true,
                                backgroundColor: widgetStyle === style ? Color.lightGray() : undefined,
                                onSelect: async() => {
                                    console.log(`Setting WidgetStyle to ${style}`);
                                    await this.Kc.setWidgetStyle(style);
                                    this.widgetStyleSelector(size);
                                },
                            },
                        ),
                    );
                }
                tableRows.push(
                    await this.Tables.createTableRow([await this.Tables.createTextCell(``, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false })], {
                        height: 30,
                        dismissOnSelect: false,
                    }),
                );
            }

            await this.Tables.generateTableMenu('widgetStyles', tableRows, false, false);
        } catch (error) {
            console.error(`createWidgetStylePage() Error: ${error}`);
        }
    }
};
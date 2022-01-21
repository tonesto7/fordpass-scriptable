module.exports = class FPW_Tables_ChangePage {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_VERSION = FPW.SCRIPT_VERSION;
        this.SCRIPT_TS = FPW.SCRIPT_TS;
        this.widgetConfig = FPW.widgetConfig;
    }

    async createRecentChangesPage() {
        try {
            let changes = changelog[this.SCRIPT_VERSION];
            let tableRows = [];
            if (changes && (changes.updated.length || changes.added.length || changes.removed.length || changes.fixed.length)) {
                let verTs = new Date(Date.parse(this.SCRIPT_TS));
                tableRows.push(
                    await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell(`${this.SCRIPT_VERSION} Changes`, undefined, { align: 'center', widthWeight: 100, dismissOnTap: false, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.title1() })], {
                        height: 50,
                        isHeader: true,
                        dismissOnSelect: false,
                    }),
                );
                for (const [i, type] of['added', 'fixed', 'updated', 'removed'].entries()) {
                    if (changes[type].length) {
                        // console.log(`(RecentChanges Table) ${type} changes: ${changes[type].length}`);
                        let { name, color } = this.FPW.Tables.getChangeLabelColorAndNameByType(type);
                        tableRows.push(
                            await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell(`${name}`, undefined, { align: 'left', widthWeight: 100, titleColor: color, titleFont: Font.title2() })], {
                                height: 30,
                                dismissOnSelect: false,
                            }),
                        );
                        for (const [index, change] of changes[type].entries()) {
                            // console.log(`(RecentChanges Table) ${type} change: ${change}`);
                            let rowH = Math.ceil(change.length / 70) * (65 / 2);
                            tableRows.push(
                                await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell(`\u2022 ${change}`, undefined, { align: 'left', widthWeight: 100, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.body() })], {
                                    height: rowH < 40 ? 40 : rowH,
                                    dismissOnSelect: false,
                                }),
                            );
                        }
                    }
                }
            } else {
                tableRows.push(await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell('No Change info found for the current version...', undefined, { align: 'left', widthWeight: 1, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.title3() })], { height: 44, dismissOnSelect: false }));
            }

            await this.FPW.Tables.generateTableMenu('recentChanges', tableRows, false, false);
        } catch (error) {
            console.error(`(RecentChanges Table) ${error}`);
        }
    }
};
const darkMode = Device.isUsingDarkAppearance();
module.exports = class FPW_Tables_AlertPage {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
    }

    async createAlertsPage(vData) {
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
            let vhaAlerts = vData.alerts && vData.alerts.vha && vData.alerts.vha.length ? vData.alerts.vha : [];
            let otaAlerts = vData.alerts && vData.alerts.mmota && vData.alerts.mmota.length ? vData.alerts.mmota : [];

            let tableRows = [];
            if (vhaAlerts.length > 0) {
                tableRows.push(
                    await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell(`Vehicle Health Alert(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title3) })], {
                        height: 20,
                        isHeader: true,
                        dismissOnSelect: false,
                    }),
                );
                for (const [i, alert] of vhaAlerts.entries()) {
                    let dtTS = alert.eventTimeStamp ? this.FPW.convertFordDtToLocal(alert.eventTimeStamp) : undefined;
                    tableRows.push(
                        await this.FPW.Tables.createTableRow(
                            [
                                await this.FPW.Tables.createImageCell(await this.FPW.Files.getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 7 }),
                                await this.FPW.Tables.createTextCell(alert.activeAlertBody.headline || this.FPW.textMap().errorMessages.noData, dtTS ? this.FPW.timeDifference(dtTS) : '', {
                                    align: 'left',
                                    widthWeight: 93,
                                    titleColor: new Color(this.FPW.Tables.getAlertColorByCode(alert.colorCode)),
                                    titleFont: Font.mediumSystemFont(fontSizes.headline),
                                    subtitleColor: Color.darkGray(),
                                    subtitleFont: Font.regularSystemFont(fontSizes.body2),
                                }),
                            ], { height: 40, dismissOnSelect: false },
                        ),
                    );
                }
            }

            if (otaAlerts.length > 0) {
                tableRows.push(await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell('', undefined, { align: 'center', widthWeight: 100 })], { height: 20, dismissOnSelect: false }));
                tableRows.push(
                    await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell(`OTA Update Alerts`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularRoundedSystemFont(fontSizes.title3) })], { height: 20, isHeader: true, dismissOnSelect: false }),
                );
                for (const [i, alert] of otaAlerts.entries()) {
                    let dtTS = alert.vehicleDate && alert.vehicleTime ? this.FPW.convertFordDtToLocal(`${alert.vehicleDate} ${alert.vehicleTime}`) : undefined;
                    let timeDiff = dtTS ? this.FPW.timeDifference(dtTS) : '';
                    let title = alert.alertIdentifier ? alert.alertIdentifier.replace('MMOTA_', '').split('_').join(' ') : undefined;

                    let releaseNotes;
                    if (alert.releaseNotesUrl) {
                        let locale = (await this.FPW.getSettingVal('fpLanguage')) || Device.locale().replace('_', '-');
                        releaseNotes = await this.FPW.getReleaseNotes(alert.releaseNotesUrl, locale);
                    }
                    tableRows.push(
                        await this.FPW.Tables.createTableRow(
                            [
                                await this.FPW.Tables.createImageCell(await this.FPW.Files.getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 7 }),
                                await this.FPW.Tables.createTextCell(title, timeDiff, { align: 'left', widthWeight: 93, titleColor: new Color(this.FPW.Tables.getAlertColorByCode(alert.colorCode)), titleFont: Font.mediumSystemFont(fontSizes.headline), subtitleColor: Color.darkGray(), subtitleFont: Font.regularSystemFont(fontSizes.body2) }),
                            ], { height: 44, dismissOnSelect: false },
                        ),
                    );

                    tableRows.push(
                        await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell(releaseNotes, undefined, { align: 'left', widthWeight: 100, titleColor: this.FPW.colorMap.normalText, titleFont: Font.regularSystemFont(fontSizes.body3) })], {
                            height: this.FPW.Tables.getRowHeightByTxtLength(releaseNotes) + 20,
                            dismissOnSelect: false,
                        }),
                    );
                }
            }

            await this.FPW.Tables.generateTableMenu('alerts', tableRows, false, false);
        } catch (e) {
            this.FPW.logger(`createAlertsPage() Error: ${e}`, true);
        }
    }
};
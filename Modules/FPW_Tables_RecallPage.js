const darkMode = Device.isUsingDarkAppearance();
module.exports = class FPW_Tables_RecallPage {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
    }

    async createRecallPage(vData) {
        try {
            let recalls = vData.recallInfo && vData.recallInfo.length && vData.recallInfo[0].recalls && vData.recallInfo[0].recalls.length > 0 ? vData.recallInfo[0].recalls : [];
            let tableRows = [];

            if (recalls.length > 0) {
                tableRows.push(await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell(`Vehicle Recall(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.title2() })], { height: 40, isHeader: true, dismissOnSelect: false }));
                for (const [i, recall] of recalls.entries()) {
                    let dtTS = recall.nhtsaInfo && recall.nhtsaInfo.recallDate ? new Date(Date.parse(recall.nhtsaInfo.recallDate)) : undefined;
                    let dateStr = dtTS ? dtTS.toLocaleDateString() : undefined;
                    let timeDiff = dtTS ? this.FPW.timeDifference(dtTS) : '';
                    let timestamp = `${dateStr ? ' - ' + dateStr : ''}${timeDiff ? ' (' + timeDiff + ')' : ''}`;
                    let recallType = recall.type ? `${recall.type}` : '';
                    let recallId = recall.id ? `${recallType.length ? '\n' : ''}Recall ID: ${recall.id}` : '';
                    let titleSub = `${recallType}${recallId}${timestamp}`;

                    // Creates Recall Header Rows
                    tableRows.push(await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell('', undefined, { align: 'center', widthWeight: 1 })], { backgroundColor: new Color('#E96C00'), height: 10, dismissOnSelect: false }));
                    tableRows.push(
                        await this.FPW.Tables.createTableRow(
                            [
                                await this.FPW.Tables.createImageCell(await this.FPW.Files.getFPImage(`ic_recall_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 6 }),

                                await this.FPW.Tables.createTextCell(recall.title, titleSub, {
                                    align: 'left',
                                    widthWeight: 94,
                                    titleColor: this.FPW.colorMap.normalText,
                                    titleFont: Font.headline(),
                                    subtitleColor: this.FPW.colorMap.normalText,
                                    subtitleFont: Font.regularSystemFont(10),
                                }),
                            ], { height: 50, dismissOnSelect: false },
                        ),
                    );

                    // Creates Recall Safety Description Row
                    if (recall.nhtsaInfo && recall.nhtsaInfo.safetyDescription) {
                        tableRows.push(
                            await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell('Safety Description', recall.nhtsaInfo.safetyDescription, { align: 'left', widthWeight: 100, titleColor: this.FPW.colorMap.normalText, titleFont: Font.title3(), subtitleColor: Color.lightGray(), subtitleFont: Font.mediumSystemFont(11) })], {
                                height: this.FPW.Tables.getRowHeightByTxtLength(recall.nhtsaInfo.safetyDescription),
                                dismissOnSelect: false,
                            }),
                        );
                    }
                    // Creates Recall Remedy Program Row
                    if (recall.nhtsaInfo && recall.nhtsaInfo.remedyProgram) {
                        tableRows.push(
                            await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell('Remedy Program', recall.nhtsaInfo.remedyProgram, { align: 'left', widthWeight: 100, titleColor: this.FPW.colorMap.normalText, titleFont: Font.title3(), subtitleColor: Color.lightGray(), subtitleFont: Font.mediumSystemFont(11) })], {
                                height: this.FPW.Tables.getRowHeightByTxtLength(recall.nhtsaInfo.remedyProgram),
                                dismissOnSelect: false,
                            }),
                        );
                    }
                    // Creates Recall Manufacturer Notes Row
                    if (recall.nhtsaInfo && recall.nhtsaInfo.manufacturerNotes) {
                        tableRows.push(
                            await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell('Manufacturer Notes', recall.nhtsaInfo.manufacturerNotes, { align: 'left', widthWeight: 100, titleColor: this.FPW.colorMap.normalText, titleFont: Font.title3(), subtitleColor: Color.lightGray(), subtitleFont: Font.mediumSystemFont(11) })], {
                                height: this.FPW.Tables.getRowHeightByTxtLength(recall.nhtsaInfo.manufacturerNotes),
                                dismissOnSelect: false,
                            }),
                        );
                    }
                    // Creates a blank row
                    tableRows.push(await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell('', undefined, { align: 'left', widthWeight: 30 })]));
                }
            } else {
                tableRows.push(
                    await this.FPW.Tables.createTableRow(
                        [
                            await this.FPW.Tables.createTextCell('', undefined, { align: 'left', widthWeight: 20 }),
                            await this.FPW.Tables.createTextCell(`${recalls.length} Recalls(s)`, undefined, { align: 'center', widthWeight: 60, dismissOnTap: false, titleColor: this.FPW.colorMap.normalText, titleFont: Font.title2() }),
                            await this.FPW.Tables.createTextCell('', undefined, { align: 'right', widthWeight: 20 }),
                        ], { height: 44, dismissOnSelect: false },
                    ),
                );

                tableRows.push(await this.FPW.Tables.createTableRow([await this.FPW.Tables.createTextCell(this.FPW.textMap().errorMessages.noMessages, undefined, { align: 'left', widthWeight: 1, titleColor: this.FPW.colorMap.normalText, titleFont: Font.body() })], { height: 44, dismissOnSelect: false }));
            }

            await this.FPW.Tables.generateTableMenu('recalls', tableRows, false, false);
        } catch (err) {
            this.FPW.logger(`createRecallPage() Error: ${err}`, true);
        }
    }
};
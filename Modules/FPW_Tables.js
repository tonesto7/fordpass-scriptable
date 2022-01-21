const FPW_Tables_AlertPage = importModule('/FPW_Tables_AlertPage.js'),
    FPW_Tables_ChangesPage = importModule('/FPW_Tables_ChangesPage.js'),
    FPW_Tables_MainPage = importModule('/FPW_Tables_MainPage.js'),
    FPW_Tables_MessagePage = importModule('/FPW_Tables_MessagePage.js'),
    FPW_Tables_RecallPage = importModule('/FPW_Tables_RecallPage.js');
FPW_Tables_WidgetStylePage = importModule('/FPW_Tables_WidgetStylePage.js');
const darkMode = Device.isUsingDarkAppearance();

module.exports = class FPW_Tables {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.MainPage = new FPW_Tables_MainPage(FPW);
        this.AlertPage = new FPW_Tables_AlertPage(FPW);
        this.ChangesPage = new FPW_Tables_ChangesPage(FPW);
        this.MessagePage = new FPW_Tables_MessagePage(FPW);
        this.RecallPage = new FPW_Tables_RecallPage(FPW);
        this.WidgetStylePage = new FPW_Tables_WidgetStylePage(FPW);
        this.tableMap = {};
    }

    async getTable(tableName) {
        if (await this.tableExists(tableName)) {
            return this.tableMap[tableName];
        }
        this.tableMap[tableName] = new UITable();
        return this.tableMap[tableName];
    }

    async removeTable(tableName) {
        if (await this.tableExists(tableName)) {
            delete this.tableMap[tableName];
        }
        return;
    }

    async tableExists(tableName) {
        return this.tableMap[tableName] !== undefined && this.tableMap[tableName] instanceof Object;
    }

    async generateTableMenu(tableName, rows, showSeparators = false, fullscreen = false, update = false) {
        // console.log(`generateTableMenu() called for ${tableName} | ${rows.length} rows | ${showSeparators} | ${fullscreen} | ${update}`);
        try {
            const exists = await this.tableExists(tableName);
            let table = await this.getTable(tableName);
            if (exists) {
                await table.removeAllRows();
            }
            // console.log(`${exists ? 'Updating' : 'Creating'} ${tableName} Table and ${update ? 'Reloading' : 'Presenting'}`);
            table.showSeparators = showSeparators;
            rows.forEach(async(row) => {
                await table.addRow(row);
            });
            if (update) {
                await table.reload();
            } else {
                await table.present(fullscreen);
            }
        } catch (e) {
            console.error(`generateTableMenu() error: ${e}`);
            this.FPW.Files.appendToLogFile(`generateTableMenu() error: ${e}`);
        }
    }

    async reloadTable(tableName) {
        let table = await this.getTable(tableName);
        await table.reload();
    }

    async showTable(tableName, fullscreen = false) {
        let table = await this.getTable(tableName);
        await table.present(fullscreen);
    }

    async clearTable() {
        let table = await this.getTable(tableName);
        await table.removeAllRows();
    }

    async createTableRow(cells, options) {
        let row = new UITableRow();
        try {
            cells.forEach((cell) => {
                if (cell) {
                    row.addCell(cell);
                }
            });
            row = await this.applyTableOptions(row, options);
        } catch (err) {
            console.error(`createTableRow() error: ${err}`);
            this.FPW.Files.appendToLogFile(`createTableRow() error: ${err}`);
        }
        return row;
    }

    async createTextCell(title, subtitle, options) {
        try {
            let cell = UITableCell.text(title || '', subtitle || '');
            if (options) {
                cell = await this.applyTableOptions(cell, options);
            }
            return cell;
        } catch (err) {
            console.error(`Error creating text cell: ${err}`);
            this.FPW.Files.appendToLogFile(`Error creating text cell: ${err}`);
        }
    }

    async createImageCell(image, options) {
        try {
            let cell = UITableCell.image(image);
            if (options) {
                cell = await this.applyTableOptions(cell, options);
            }
            return cell;
        } catch (err) {
            console.error(`Error creating image cell: ${err}`);
            this.FPW.Files.appendToLogFile(`Error creating image cell: ${err}`);
        }
    }

    async createButtonCell(title, options) {
        try {
            let cell = UITableCell.button(title || '');
            if (options) {
                cell = await this.applyTableOptions(cell, options);
            }
            return cell;
        } catch (err) {
            console.error(`Error creating button cell: ${err}`);
            this.FPW.Files.appendToLogFile(`Error creating button cell: ${err}`);
        }
    }

    applyTableOptions(src, options) {
        try {
            if (options) {
                for (const [key, value] of Object.entries(options)) {
                    // console.log(key, value);
                    if (value !== undefined) {
                        if (key === 'align') {
                            src[`${value}Aligned`]();
                        } else {
                            src[key] = value;
                        }
                    }
                }
            }
        } catch (err) {
            console.error(`Error applying options: ${err}`);
            this.FPW.Files.appendToLogFile(`Error applying options: ${err}`);
        }
        return src;
    }

    getAlertColorByCode(code) {
        switch (code) {
            case 'A':
                return '#E96C00';
            case 'G':
                return '#008200';
            case 'R':
                return '#FF0000';
            default:
                return this.FPW.colorMap.textColor1;
        }
    }

    getChangeLabelColorAndNameByType(type) {
        switch (type) {
            case 'added':
                return { name: 'Added', color: new Color('#008200') };
            case 'updated':
                return { name: 'Updated', color: new Color('#FF6700') };
            case 'removed':
                return { name: 'Removed', color: new Color('#FF0000') };
            case 'fixed':
                return { name: 'Fixed', color: new Color('#b605fc') };
            default:
                return { name: '', color: new Color(this.FPW.colorMap.textColor1) };
        }
    }

    getAlertDescByType(type) {
        switch (type) {
            case 'VHA':
                return 'Vehicle Health';
            case 'MMOTA':
                return 'OTA Update';
            default:
                return '';
        }
    }

    getMessageDescByType(type) {
        switch (type) {
            case 'GENERAL':
                return 'General';
            case 'EXTERNALNOTIFICATIONREQUEST':
                return 'External';
            default:
                return '';
        }
    }

    // async  getRowHeightByTxtLength(txt, lineLength = 75, lineHeight = 35, minHeight = 44) {
    //     let result = txt && txt.length ? (txt.length / lineLength).toFixed(0) * lineHeight : 0;
    //     result = result < minHeight ? minHeight : result;
    //     // console.log(`${txt} | Length: ${txt.length} | Desired Height: ${result}`);
    //     return result;
    // }

    getRowHeightByTxtLength(txt) {
        let result = txt && txt.length ? (txt.length / 75).toFixed(0) * 35 : 0;
        // console.log(`txt length: ${txt.length} - result: ${result}`);
        return result < 44 ? 44 : result;
    }

    async showDataWebView(title, heading, data, type = undefined) {
        // console.log(`showDataWebView(${title}, ${heading})`); //, ${JSON.stringify(data)})`);
        let otaHTML = '';
        try {
            data = this.FPW.Utils.scrubPersonalData(data);
            if (type === 'OTA') {
                if (data.fuseResponse && data.fuseResponse.fuseResponseList && data.fuseResponse.fuseResponseList.length) {
                    otaHTML += `<h3>OTA Details</h3>`;

                    data.fuseResponse.fuseResponseList.forEach((fuse, ind) => {
                        otaHTML += `<ul>`;
                        otaHTML += `<li>CorrelationID: ${fuse.oemCorrelationId || this.FPW.textMap().errorMessages.noData}</li>`;
                        otaHTML += `<li>Created: ${fuse.deploymentCreationDate || this.FPW.textMap().errorMessages.noData}</li>`;
                        otaHTML += `<li>Expiration: ${fuse.deploymentExpirationTime || this.FPW.textMap().errorMessages.noData}</li>`;
                        otaHTML += `<li>Priority: ${fuse.communicationPriority || this.FPW.textMap().errorMessages.noData}</li>`;
                        otaHTML += `<li>Type: ${fuse.type || this.FPW.textMap().errorMessages.noData}</li>`;
                        otaHTML += `<li>Trigger: ${fuse.triggerType || this.FPW.textMap().errorMessages.noData}</li>`;
                        otaHTML += `<li>Inhibit Required: ${fuse.inhibitRequired}</li>`;
                        otaHTML += `<li>Environment: ${fuse.tmcEnvironment || this.FPW.textMap().errorMessages.noData}</li>`;
                        if (fuse.latestStatus) {
                            otaHTML += `<li>Latest Status:`;
                            otaHTML += `    <ul>`;
                            otaHTML += `        <li>Status: ${fuse.latestStatus.aggregateStatus || this.FPW.textMap().errorMessages.noData}</li>`;
                            otaHTML += `        <li>Details: ${fuse.latestStatus.detailedStatus || this.FPW.textMap().errorMessages.noData}</li>`;
                            otaHTML += `        <li>DateTime: ${fuse.latestStatus.dateTimestamp || this.FPW.textMap().errorMessages.noData}</li>`;
                            otaHTML += `    </ul>`;
                            otaHTML += `</li>`;
                        }
                        if (fuse.packageUpdateDetails) {
                            otaHTML += `<li>Package Details:`;
                            otaHTML += `    <ul>`;
                            otaHTML += `        <li>WiFi Required: ${fuse.packageUpdateDetails.wifiRequired}</li>`;
                            otaHTML += `        <li>Priority: ${fuse.packageUpdateDetails.packagePriority || this.FPW.textMap().errorMessages.noData}</li>`;
                            otaHTML += `        <li>FailedResponse: ${fuse.packageUpdateDetails.failedOnResponse || this.FPW.textMap().errorMessages.noData}</li>`;
                            otaHTML += `        <li>DisplayTime: ${fuse.packageUpdateDetails.updateDisplayTime || this.FPW.textMap().errorMessages.noData}</li>`;
                            otaHTML += `        <li>ReleaseNotes:`;
                            otaHTML += `            <ul>`;
                            otaHTML += `                 <li>${data.fuseResponse.languageText.Text || this.FPW.textMap().errorMessages.noData}</li>`;
                            otaHTML += `            </ul>`;
                            otaHTML += `        </li>`;
                            otaHTML += `    </ul>`;
                            otaHTML += `</li>`;
                        }
                        otaHTML += `</ul>`;
                        otaHTML += `<hr>`;
                    });
                }
            }

            // console.log('showDataWebView() | DarkMode: ' + Device.isUsingDarkAppearance());
            const bgColor = darkMode ? '#242424' : 'white';
            const fontColor = darkMode ? '#ffffff' : '#242425';
            const wv = new WebView();
            let html = `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;"/>
                    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css" rel="stylesheet" />
                    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" rel="stylesheet" />
                    <link href="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/3.10.1/mdb.min.css" rel="stylesheet"/>
                    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/default.min.css">
                    
                    <title>${title}</title>
                    <style>
                        body { font-family: -apple-system; background-color: ${bgColor}; color: ${fontColor}; font-size: 0.8rem;}
                    </style>
                    
                </head>
                
                <body>
                    <div class="mx-2">
                        ${otaHTML}
                    </div>
                    <div class="mx-2">
                        <h3>${heading}</h3>
                        <p style="color: orange;">(Personal Data Removed)</p>
                    </div>
                    <div class="ml-3" id="wrapper">
                        <pre>${JSON.stringify(data, null, 4)}</pre>
                    </div>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/3.10.1/mdb.min.js"></script>
                </body>
                
                </html>  
            `;
            await wv.loadHTML(html);
            await wv.waitForLoad();
            // let result = await wv.evaluateJavaScript(`hljs.highlightAll();`, true);
            await wv.present(true);
        } catch (e) {
            console.log(`showDataWebView() | Error: ${e}`);
            this.FPW.Files.appendToLogFile(`showDataWebView() | Error: ${e}`);
        }
    }
};
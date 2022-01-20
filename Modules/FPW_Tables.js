let tableMap = {};

module.exports = class FPW_Tables {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.Kc = FPW.Kc;
        this.Statics = FPW.Statics;
        this.FordRequests = FPW.FordRequests;
        this.Alerts = FPW.Alerts;
        this.Utils = FPW.Utils;
        this.Timers = FPW.Timers;
    }

    async getTable(tableName) {
        if (await this.tableExists(tableName)) {
            return tableMap[tableName];
        }
        tableMap[tableName] = new UITable();
        return tableMap[tableName];
    }

    async removeTable(tableName) {
        if (await this.tableExists(tableName)) {
            delete tableMap[tableName];
        }
        return;
    }

    async tableExists(tableName) {
        return tableMap[tableName] !== undefined && tableMap[tableName] instanceof Object;
    }

    async generateTableMenu(tableName, rows, showSeparators = false, fullscreen = false, update = false) {
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
        cells.forEach((cell) => {
            if (cell) {
                row.addCell(cell);
            }
        });
        row = await this.applyTableOptions(row, options);
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
                return this.Statics.colorMap.textColor1;
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
                return { name: '', color: new Color(this.Statics.colorMap.textColor1) };
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
            data = this.utils.scrubPersonalData(data);
            if (type === 'OTA') {
                if (data.fuseResponse && data.fuseResponse.fuseResponseList && data.fuseResponse.fuseResponseList.length) {
                    otaHTML += `<h3>OTA Details</h3>`;

                    data.fuseResponse.fuseResponseList.forEach((fuse, ind) => {
                        otaHTML += `<ul>`;
                        otaHTML += `<li>CorrelationID: ${fuse.oemCorrelationId || this.Statics.textMap().errorMessages.noData}</li>`;
                        otaHTML += `<li>Created: ${fuse.deploymentCreationDate || this.Statics.textMap().errorMessages.noData}</li>`;
                        otaHTML += `<li>Expiration: ${fuse.deploymentExpirationTime || this.Statics.textMap().errorMessages.noData}</li>`;
                        otaHTML += `<li>Priority: ${fuse.communicationPriority || this.Statics.textMap().errorMessages.noData}</li>`;
                        otaHTML += `<li>Type: ${fuse.type || this.Statics.textMap().errorMessages.noData}</li>`;
                        otaHTML += `<li>Trigger: ${fuse.triggerType || this.Statics.textMap().errorMessages.noData}</li>`;
                        otaHTML += `<li>Inhibit Required: ${fuse.inhibitRequired}</li>`;
                        otaHTML += `<li>Environment: ${fuse.tmcEnvironment || this.Statics.textMap().errorMessages.noData}</li>`;
                        if (fuse.latestStatus) {
                            otaHTML += `<li>Latest Status:`;
                            otaHTML += `    <ul>`;
                            otaHTML += `        <li>Status: ${fuse.latestStatus.aggregateStatus || this.Statics.textMap().errorMessages.noData}</li>`;
                            otaHTML += `        <li>Details: ${fuse.latestStatus.detailedStatus || this.Statics.textMap().errorMessages.noData}</li>`;
                            otaHTML += `        <li>DateTime: ${fuse.latestStatus.dateTimestamp || this.Statics.textMap().errorMessages.noData}</li>`;
                            otaHTML += `    </ul>`;
                            otaHTML += `</li>`;
                        }
                        if (fuse.packageUpdateDetails) {
                            otaHTML += `<li>Package Details:`;
                            otaHTML += `    <ul>`;
                            otaHTML += `        <li>WiFi Required: ${fuse.packageUpdateDetails.wifiRequired}</li>`;
                            otaHTML += `        <li>Priority: ${fuse.packageUpdateDetails.packagePriority || this.Statics.textMap().errorMessages.noData}</li>`;
                            otaHTML += `        <li>FailedResponse: ${fuse.packageUpdateDetails.failedOnResponse || this.Statics.textMap().errorMessages.noData}</li>`;
                            otaHTML += `        <li>DisplayTime: ${fuse.packageUpdateDetails.updateDisplayTime || this.Statics.textMap().errorMessages.noData}</li>`;
                            otaHTML += `        <li>ReleaseNotes:`;
                            otaHTML += `            <ul>`;
                            otaHTML += `                 <li>${data.fuseResponse.languageText.Text || this.Statics.textMap().errorMessages.noData}</li>`;
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
            const bgColor = this.darkMode ? '#242424' : 'white';
            const fontColor = this.darkMode ? '#ffffff' : '#242425';
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
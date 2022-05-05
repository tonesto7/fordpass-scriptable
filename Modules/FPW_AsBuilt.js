module.exports = class FPW_AsBuilt {
    nodeDesc = {
        8033: 'IMAGE',
        8060: 'APPLICATION',
        8061: 'APPLICATION',
        8068: 'BOOT_IMAGE',
        '806A': 'APPLICATION',
        '806B': 'APPLICATION',
        '806C': 'APPLICATION',
        '806D': 'APPLICATION',
        D027: 'BOOT_IMAGE',
        DO3E: 'OTHER',
        DO3F: 'OTHER',
        D704: 'ECU_CHECKSUM_1',
        D705: 'ECU_CHECKSUM_2',
        DA01: 'ASSEMBLY',
        DE00: 'CONFIGURATION',
        DE02: 'CONFIGURATION',
        DE8F: 'CONFIGURATION',
        DEFA: 'CONFIGURATION',
        EEFA: 'OTHER',
        EEFB: 'OTHER',
        EEFE: 'OTHER',
        EEFF: 'OTHER',
        F0E8: 'STRATEGY',
        F0E9: 'STRATEGY',
        F0EA: 'STRATEGY',
        F089: 'STRATEGY',
        FD12: 'OTHER',
        FD13: 'OTHER',
        F106: 'OTHER',
        F109: 'OTHER',
        F10A: 'ECU_CONFIGURATION',
        F10C: 'OTHER',
        F10E: 'ECU_CONFIGURATION',
        F110: 'PART_II_SPECIFICATION (ASSEMBLY)',
        F111: 'CORE_ASSEMBLY_PART',
        F113: 'ASSEMBLY',
        F120: 'STRATEGY',
        F121: 'STRATEGY',
        F122: 'STRAGEGY',
        F123: 'STRATEGY',
        F124: 'CALIBRATION',
        F125: 'CALIBRATION',
        F127: 'CALIBRATION',
        F129: 'OTHER',
        F12A: 'OTHER',
        F12B: 'OTHER',
        F12C: 'OTHER',
        F12D: 'OTHER',
        F12E: 'OTHER',
        F141: 'SERIAL_NUMBER',
        F142: 'SERIAL_NUMBER',
        F143: 'SERIAL_NUMBER',
        F144: 'SERIAL_NUMBER',
        F145: 'SERIAL_NUMBER',
        F146: 'SERIAL_NUMBER',
        F14B: 'SERIAL_NUMBER',
        F14D: 'SERIAL_NUMBER',
        F14E: 'SERIAL_NUMBER',
        F14F: 'SERIAL_NUMBER',
        F150: 'SERIAL_NUMBER',
        F159: 'OTHER',
        F15B: 'OTHER',
        F15C: 'OTHER',
        F15E: 'OTHER',
        F15F: 'OTHER',
        F160: 'OTHER',
        F161: 'OTHER',
        F162: 'ECU_PROGRAMMING_SPEC',
        F163: 'ECU_DIAGNOSTIC_SPEC',
        F166: 'OTHER',
        F167: 'OTHER',
        F169: 'OTHER',
        F16B: 'ECU_CONFIGURATION',
        F16C: 'ECU_CONFIGURATION',
        F16D: 'ECU_CONFIGURATION',
        F16E: 'ECU_CONFIGURATION',
        F17C: 'OTHER',
        F17D: 'ECU_CONFIGURATION',
        F17F: 'SERIAL_NUMBER',
        F180: 'PRIMARY_BOOTLOADER',
        F181: 'OTHER',
        F182: 'OTHER',
        F188: 'STRATEGY (SW VERSION)',
        F18C: 'SERIAL_NUMBER',
        F190: 'VIN',
        F1D1: 'ECU_MAC_ADDRESS_2',
        F1DC: 'CALIBRATION',
        F1E0: 'OTHER',
        F1F3: 'OTHER',
        FD14: 'OTHER',
        FD15: 'OTHER',
    };

    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.tableMap = {};
    }

    getModuleVer() {
        return '2022.05.05.0';
    }

    moduleInfo(addr) {
        const info = {
            760: { acronym: 'ABS', desc: 'Anti-Lock Brake System', group: 'Parking Brake and Actuation', moidref: 'G1425100', updatable: true },
            '7C7': { acronym: 'ACCM', desc: 'Air Conditioning Control Module', group: 'Climate Control System', moidref: 'G1585805', updatable: false },
            727: { acronym: 'ACM', desc: 'Audio Front Control Module', group: 'Information and Entertainment Systems', moidref: 'G1490329', updatable: true },
            '6E0': { acronym: 'ACCMB', desc: 'Air Conditioning Compressor Control Module B', group: 'Electrified Drivetrain Cooling - High Voltage Battery Refrigerant Cooling', moidref: 'G2303114', updatable: false },
            '7D0': { acronym: 'APIM', desc: 'SYNC Module', group: 'Information and Entertainment Systems', moidref: 'G1490336', updatable: true },
            792: { acronym: 'ATCM', desc: 'All Terrain Control Module', group: 'Four-Wheel Drive Systems', moidref: 'G1614115', updatable: true },
            726: { acronym: 'BCM', desc: 'Body Control Module', group: 'Multifunction Modules', moidref: 'G1376668', updatable: true },
            '6F0': { acronym: 'BCMC', desc: 'Body Control Module C [battery junction box]', group: 'Multifunction Modules', moidref: 'G2044439', updatable: true },
            764: { acronym: 'CCM', desc: 'Cruise Control Module', group: 'Cruise Control', moidref: 'G1420074', updatable: true },
            '7C1': { acronym: 'CMR', desc: 'Camera Module - Rear [Driver Status Camera Module]', group: 'Interior Camera System', moidref: 'G2164559', updatable: true },
            '6F1': { acronym: 'DCACA', desc: 'Direct Current/Alternating Current Converter Module A', group: 'Voltage Converter/Inverter', moidref: 'G2160771', updatable: true },
            746: { acronym: 'DCDC', desc: 'Direct Current/Direct Current Converter Control Module', group: 'Voltage Converter/Inverter', moidref: 'G1585827', updatable: false },
            740: { acronym: 'DDM', desc: 'Driver Door Module', group: 'Multifunction Modules', moidref: 'G1268121', updatable: true },
            744: { acronym: 'DSM/RBM', desc: 'Driver Front Seat Module / Running Board Control Module', group: 'Front Seats', moidref: 'G1593640', updatable: true },
            783: { acronym: 'DSP', desc: 'Audio Digital Signal Processing Module', group: 'Information and Entertainment Systems', moidref: 'G1490339', updatable: true },
            '6E3': { acronym: 'FHCM', desc: 'Front Hatch Control Module', group: 'Body Closures', moidref: 'G2303138', updatable: true },
            '7A1': { acronym: 'GFM', desc: 'Generic Function Module', group: 'High Voltage Battery Charging System', moidref: 'G1585818', updatable: false },
            '7D2': { acronym: 'GFM2', desc: 'Generic Function Module 2', group: 'Fuel System', moidref: 'G1817236', updatable: false },
            707: { acronym: 'GFM3', desc: 'Generic Function Module 3', group: 'Multifunction Modules', moidref: 'G2102578', updatable: false },
            732: { acronym: 'GSM', desc: 'Gear Shift Module', group: 'Automatic Transmission', moidref: 'G1892092', updatable: false },
            716: { acronym: 'GWM', desc: 'Gateway Module A', group: 'Module Communications Network', moidref: 'G1523364', updatable: true },
            734: { acronym: 'HCM', desc: 'Headlamp Control Module', group: 'Exterior Lighting', moidref: 'G1298819', updatable: true },
            733: { acronym: 'HVAC', desc: 'Heating, Ventillation and Air Conditioning Module', group: 'Climate Control System', moidref: 'G1489699', updatable: true },
            720: { acronym: 'IPC', desc: 'Instrument Panel Cluster', group: 'Instrumentation and Warning Systems', moidref: 'G1523442', updatable: true },
            706: { acronym: 'IPMA', desc: 'Image Processing Module A', group: 'Lane Keeping System', moidref: 'G1477138', updatable: true },
            '6F6': { acronym: 'LDCMA', desc: 'Lighting Driver Control Module A', group: 'Exterior Lighting', moidref: 'G2274992', updatable: false },
            '6F7': { acronym: 'LDCMB', desc: 'Lighting Driver Control Module B', group: 'Exterior Lighting', moidref: 'G2274993', updatable: false },
            '6F5': { acronym: 'OBCC', desc: 'Off-Board Charger Controller', group: 'High Voltage Battery Charging System', moidref: 'G2164538', updatable: true },
            765: { acronym: 'OCSM', desc: 'Occupant Classification System Module', group: 'Supplemental Restraint System', moidref: 'G1476397', updatable: false },
            750: { acronym: 'PACM', desc: 'Pedestrian Alert Control Module', group: 'Pedestrian Alert System', moidref: 'G2044345', updatable: false },
            741: { acronym: 'PDM', desc: 'Passenger Door Module', group: 'Multifunction Modules', moidref: 'G1268128', updatable: true },
            730: { acronym: 'PSCM', desc: 'Power Steering Control Module', group: 'Power Steering', moidref: 'G1268441', updatable: true },
            737: { acronym: 'RCM', desc: 'Restraints Control Module', group: 'Supplemental Restraint System', moidref: 'G1265343', updatable: true },
            731: { acronym: 'RFA', desc: 'Remote Function Actuator Module', group: 'Multifunction Modules', moidref: 'G1523438', updatable: false },
            775: { acronym: 'RGTM', desc: 'Rear Gate Trunk Module', group: 'Body Closures', moidref: 'G1357598', updatable: false },
            751: { acronym: 'RTM', desc: 'Radio Transceiver Module', group: 'Multifunction Modules', moidref: 'G1696268', updatable: true },
            797: { acronym: 'SASM', desc: 'Steering Angle Sensor Module', group: 'Steering Wheel and Column Electrical Components', moidref: 'G1523972', updatable: true },
            724: { acronym: 'SCCM', desc: 'Steering Column Control Module', group: 'Steering Wheel and Column Electrical Components', moidref: 'G1469330', updatable: true },
            712: { acronym: 'SCMG', desc: 'Driver Multi-Contour Seat Module', group: 'Front Seats', moidref: 'G1675455', updatable: true },
            713: { acronym: 'SCMH', desc: 'Passenger Multi-Contour Seat Module', group: 'Front Seats', moidref: 'G1675459', updatable: true },
            '7C5': { acronym: 'SECM', desc: 'Steering Effort Control Module', group: 'Power Steering', moidref: 'G1795675', updatable: true },
            '6F2': { acronym: 'SODCMC', desc: 'Side Obstacle Detection Control Module C', group: 'Side and Rear Vision', moidref: 'G2164515', updatable: true },
            '6F3': { acronym: 'SODCMD', desc: 'Side Obstacle Detection Control Module D', group: 'Side and Rear Vision', moidref: 'G2164526', updatable: true },
            '7C4': { acronym: 'SODL', desc: 'Side Obstacle Detection Control Module LH', group: 'Side and Rear Vision', moidref: 'G1478298', updatable: true },
            '7C6': { acronym: 'SODR', desc: 'Side Obstacle Detection Control Module RH', group: 'Side and Rear Vision', moidref: 'G1478301', updatable: true },
            757: { acronym: 'TBM', desc: 'Trailer Brake Control Module', group: 'Auxiliary Brake System', moidref: 'G1525563', updatable: true },
            761: { acronym: 'TCCM', desc: 'Transfer Case Control Module', group: 'Four-Wheel Drive Systems', moidref: 'G1268451', updatable: false },
            754: { acronym: 'TCU', desc: 'Telematics Control Unit Module', group: 'Information and Entertainment Systems', moidref: 'G1629014', updatable: true },
            791: { acronym: 'TRM', desc: 'Trailer Module', group: 'Exterior Lighting', moidref: 'G1312635', updatable: true },
            721: { acronym: 'VDM', desc: 'Vehicle Dynamics Control Module', group: 'Vehicle Dynamic Suspension', moidref: 'G1576230', updatable: true },
            725: { acronym: 'WACM', desc: 'Wireless Accessory Charging Module', group: 'Information and Entertainment Systems', moidref: 'G1926890', updatable: true },
        };
        if (['7E0', '7E1', '7E2', '7E4', '7E7', '7E6', '7E9'].includes(addr.toString())) {
            switch (addr.toString()) {
                case '7E0':
                    return { acronym: 'PCM', desc: 'Powertrain Control Module', group: 'Electronic Engine Controls', moidref: 'G1265309', updatable: true };
                case '7E1':
                    return { acronym: 'TCM', desc: 'Transmission Control Module', Group: 'Automatic Transmission', updatable: true };
                case '7E2':
                    return { acronym: 'SOBDMA', desc: 'Secondary On-Board Diagnostic Control Module A', group: 'High Voltage Battery Charging System', moidref: 'G1585822', updatable: true };
                case '7E4':
                    return { acronym: 'BECM', desc: 'Battery Energy Control Module', group: 'Battery and Charging System', moidref: 'G1585813', updatable: false };
                case '7E7':
                    return { acronym: 'SOBDMB', desc: 'Secondary On-Board Diagnostic Control Module B', group: 'Rear Electric Drive Assembly', moidref: 'G2160706', updatable: true };
                case '7E6':
                    return { acronym: 'SOBDMC', desc: 'Secondary On-Board Diagnostic Control Module C', group: 'Electronic Engine Controls', moidref: 'G2106204', updatable: true };
                case '7E9':
                    return { acronym: 'TCM', desc: 'Transmission Control Module', group: 'Automatic Transmission', moidref: 'G1268446', updatable: true };
            }
        } else {
            return info[isNaN(addr) ? addr.toString() : parseInt(addr)] || { desc: 'Unknown Module', updatable: false };
        }
    }

    async getAsBuiltFile(vin, cnt = 0) {
        const wv = new WebView();
        if (cnt > 3) {
            return;
        }
        await wv.loadURL('https://www.motorcraftservice.com/asbuilt');
        // await wv.loadRequest(request);
        let html = await wv.getHTML();

        if (html.includes('<div><b>Please select Country</b></div>')) {
            console.log('needs country');
            const data = await wv.evaluateJavaScript(`
            function setHomeCountry() {
                let tokenElem = document.querySelector("input[name='__RequestVerificationToken']")
                const token = tokenElem.value.toString();
                console.log('token: ' + token);
                document.querySelector('#selectedCountry').value = 153;
                console.log(document.querySelector('#selectedCountry').value);
                var event = document.createEvent('HTMLEvents');
                event.initEvent('change', false, true); // onchange event
                document.querySelector('#selectedCountry').dispatchEvent(event);
                document.querySelector('#selectedLanguage').value = 'EN-US';
                console.log(document.querySelector('#selectedLanguage').value);
                document.forms[0].submit();   
            }
             setHomeCountry()
        `);
            await wv.waitForLoad();
            // wv.present();
        }

        // console.log(html);
        let imgData = await wv.evaluateJavaScript(`
            function getBase64Image(img) {
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                var dataURL = canvas.toDataURL("image/png");
                return dataURL.split(';base64,')[1];
            }
            getBase64Image(document.getElementById("CaptchaImage"));
        `);

        // await wv.waitForLoad();
        // console.log(`imageData: ${imgData}`);
        if (imgData && imgData.length > 0) {
            // console.log('imageDataLen: ' + imgData.length);
            let id = Data.fromBase64String(imgData);
            // console.log(id);
            let captchaImg = await Image.fromData(id);
            // console.log(captchaImg);
            if (captchaImg) {
                // captchaImg.saveAs(`${vin}.gif`);
                await this.FPW.App.createCaptchaPage(captchaImg);
                const code = await this.FPW.Alerts.showCaptchaPrompt();
                console.log(`Captcha Code Entered: ${code}`);
                if (code) {
                    this.FPW.Alerts.showAlert('Please wait...', 'This process may take many seconds.  You will receive another prompt when the data is downloaded and saved.');
                    let js3 = await wv.evaluateJavaScript(`
                        function setVinAndCaptcha() {
                            document.querySelector('#VIN').value = '${vin}';
                            console.log(document.querySelector('#VIN').value);
                            document.querySelector('#CaptchaInputText').value = '${code}';
                            console.log(document.querySelector('#CaptchaInputText').value);
                            document.forms[0].submit();
                        }
                         setVinAndCaptcha();
                    `);
                    // console.log(js3);
                    await wv.waitForLoad();
                    let html2 = await wv.getHTML();
                    // console.log(html2);
                    if (html2.includes('/AsBuilt/Download') && html2.includes('asbuiltJson')) {
                        // console.log('found download page');
                        let js4 = await wv.evaluateJavaScript(`
                            function getAsbuilt() {
                                let asbJsonElem = document.querySelector("input[name='asbuiltJson']")
                                const asbJson = asbJsonElem.value.toString();
                                // console.log('asbJson: ' + asbJson.length);
                                // document.forms[0].submit();
                                return asbJson.toString();
                                
                            }
                            getAsbuilt();
                        `);
                        // console.log(js4);
                        if (js4 && js4.length > 0) {
                            await this.FPW.Files.saveJsonFile('AsBuilt Data', JSON.parse(js4.toString()), `${vin}`, true);
                            this.FPW.Alerts.showAlert('AsBuilt Data', `AsBuilt data for ${vin} has been saved.`);
                        }
                    } else {
                        this.FPW.Alerts.showAlert('Download Issue', 'Something went wrong with the download. Please try the process again...');
                    }
                }
            }
        }
        // await wv.present();
    }
};
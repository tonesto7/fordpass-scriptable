module.exports = class FPW_AsBuilt {
    didDescs = {
        8033: 'Embedded Consumer OS Part Number',
        8060: 'Embedded Consumer Apps Part Numbers 1',
        8061: 'Embedded Consumer Apps Part Numbers 2',
        8068: 'Embedded Consumer Boot Software Part Number',
        9140: 'Connected Blue Zone Map Data',
        '404C': 'Odometer Store - High Resolution',
        '602F': 'User Based Insurance (UBI) Feature Configs 1',
        '806A': 'Embedded Consumer Apps Part Number 3',
        '806B': 'Embedded Consumer Apps Part Number 4',
        '806C': 'Embedded Consumer Apps Part Number 5',
        '806D': 'Embedded Consumer Apps Part Number 6',
        A010: 'WiFi Chipset Config 4',
        A011: 'Fleet Feature Configs 1',
        A012: 'WiFi Chipset Config 5',
        A014: 'Driver Safety Control Configs',
        A015: 'WiFi Chipset Config 3',
        A016: 'Pursuit Mode Configs Details',
        A017: 'Vehicle Health Alerts Config Details',
        A018: 'WiFi Chipset Config 1',
        A01A: 'Network Registration Status',
        D027: 'Embedded Consumer Boot Software Part Number 2',
        D029: 'OTA Over OVTP Support Level',
        D034: 'In-Use OTA Command Signing Public Key Hash',
        D03C: 'Last 4 OTA Update Events Received',
        D03D: 'Security Package ID',
        D03E: 'In-Use OTA Command Signing Public Key Hash',
        D03F: 'In-Use App Signing Public Key Hash',
        D040: 'Enabled Debug tokens',
        D117: 'ECU Internal Temperature',
        EEF1: 'VMCU Recover Partition Image',
        EEFA: 'ECU Consumer Electronics Processor Hardware ID',
        EEFB: 'CAN Controller HW ID',
        EEFE: 'APIM VMCU Recover Partition Image',
        EEFF: 'APIM CCPU Recover Partition Image',
        F0E8: 'Private Sub Node #1 Software Number',
        F0E9: 'Private Sub Node #2 Software Number',
        F106: 'Vehicle Config Parameters',
        F108: 'ECU Network Signal Calibration Number',
        F109: 'Boot Software Version',
        F10A: 'ECU Cal-Config Part Number',
        F10C: 'Software Download Status',
        F10E: 'ECU Cal-Config #7 Part Number',
        F110: 'Subsystem Specific Diagnostic Specification Part Number',
        F111: 'ECU Core Assembly Number',
        F113: 'ECU Delivery Assembly Number',
        F120: 'ECU Software #2 Part Number',
        F121: 'ECU Software #3 Part Number',
        F122: 'ECU Software #4 Part Number',
        F123: 'ECU Software #5 Part Number',
        F124: 'ECU Calibration Data #1 Number',
        F125: 'ECU Calibration Data #2 Number',
        F126: 'ECU Calibration Data #3 Number',
        F127: 'ECU Calibration Data #4 Number',
        F128: 'ECU Calibration Data #5 Number',
        F129: 'Private Sub Node #1 Part Number',
        F12A: 'Private Sub Node #2 Part Number',
        F12B: 'Private Sub Node #3 Part Number',
        F12C: 'Private Sub Node #4 Part Number',
        F12D: 'Private Sub Node #5 Part Number',
        F12E: 'Private Sub Node #6 Part Number',
        F131: 'Private Sub Node #9 Part Number',
        F132: 'Private Sub Node #10 Part Number',
        F133: 'Private Sub Node #11 Part Number',
        F134: 'Private Sub Node #12 Part Number',
        F136: 'Private Sub Node #14 Part Number',
        F137: 'Private Sub Node #15 Part Number',
        F138: 'Private Sub Node #16 Part Number',
        F139: 'Private Sub Node #17 Part Number',
        F141: 'Private Sub Node #1 Serial Number',
        F142: 'Private Sub Node #2 Serial Number',
        F143: 'Private Sub Node #3 Serial Number',
        F144: 'Private Sub Node #4 Serial Number',
        F145: 'Private Sub Node #5 Serial Number',
        F146: 'Private Sub Node #6 Serial Number',
        F14B: 'Private Sub Node #11 Serial Number',
        F14D: 'Private Sub Node #13 Serial Number',
        F14E: 'Private Sub Node #14 Serial Number',
        F14F: 'Private Sub Node #15 Serial Number',
        F150: 'Private Sub Node #16 Serial Number',
        F159: 'NOS CAN Driver Version',
        F15A: 'NOS OSEK Network Management Version',
        F15B: 'NOS Network Management Junior Version',
        F15C: 'NOS Interaction Layer Version',
        F15E: 'NOS Network/Transport Layer Version',
        F15F: 'NOS Generation Tool Version',
        F160: 'NOS Diagnostic Version',
        F161: 'NOS CAN Communication Layer Version',
        F162: 'Software Download Specification Version',
        F163: 'Diagnostic Specification Version',
        F166: 'NOS Message Database #1 Version',
        F167: 'NOS Message Database #2 Version',
        F169: 'Combined ECU And External Hardware Part Number',
        F16B: 'ECU Cal-Config #2 Part Number',
        F16C: 'ECU Cal-Config #3 Part Number',
        F16D: 'ECU Cal-Config #4 Part Number',
        F16E: 'ECU Cal-Config #5 Part Number',
        F170: 'NOS Bootloader Package Version',
        F171: 'NOS Bootloader Main Version',
        F172: 'NOS Bootloader Diagnostic Version',
        F173: 'NOS Bootloader Network/Transport Layer Version',
        F174: 'NOS Bootloader Flash Routines Version',
        F175: 'NOS Bootloader Hardware File Version',
        F176: 'NOS Bootloader API Version',
        F177: 'NOS Bootloader Security Algorithm Version',
        F178: 'NOS Bootloader Flash I/O Version',
        F17B: 'NOS Bootloader Memory I/O Version',
        F17C: 'NOS Bootloader Generation Tool Version',
        F17D: 'ECU Cal-Config #6 Part Number',
        F17F: 'Ford Electronic Serial Number',
        F180: 'Boot Software Identification',
        F181: 'App Software Version',
        F182: 'Calibration Software Version',
        F187: 'Vehicle Manufacturer Spare Part Number',
        F188: 'Vehicle Manufacturer ECU Software Number',
        F18C: 'ECU Serial Number',
        F190: 'Vehicle Identification Number',
        F1D0: 'ECU MAC Address 1',
        F1D1: 'ECU MAC Address 2',
        F1DB: 'ECU Calibration Data #6 Number',
        F1DC: 'ECU Calibration Data #7 Number',
        F1E0: 'PARSED Data eXchange (PDX) Part Number',
        F1F3: 'ECU software number',
        FD02: 'SYNC Software Version',
        FD12: 'CCPU Software Version',
        FD13: 'CCPU Bootloader Version',
        FD14: 'VMCU Software Version',
        FD15: 'VMCU Bootloader Version',
        FEB6: 'CCPU Recover Partition Image',
    };

    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.tableMap = {};
    }

    getModuleVer() {
        return '2022.10.13.0';
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
            '7E4': { acronym: 'BECM', desc: 'Battery Energy Control Module', group: 'Battery and Charging System', updatable: false },
            723: { acronym: 'BECMB', desc: 'Battery Energy Control Module B', group: 'Electrified Drivetrain - High Voltage Battery', updatable: true },
            764: { acronym: 'CCM', desc: 'Cruise Control Module', group: 'Cruise Control', moidref: 'G1420074', updatable: true },
            710: { acronym: 'CHCM', desc: 'Chasis Control Module', group: 'Multifunction Modules', updatable: true },
            '7C1': { acronym: 'CMR', desc: 'Camera Module - Rear [Driver Status Camera Module]', group: 'Interior Camera System', moidref: 'G2164559', updatable: true },
            '7D5': { acronym: 'DACMC', desc: 'Digital Audio Control Module C', group: 'Information and Entertainment Systems', updatable: true },
            '6F1': { acronym: 'DCACA', desc: 'Direct Current/Alternating Current Converter Module A', group: 'Voltage Converter/Inverter', moidref: 'G2160771', updatable: true },
            746: { acronym: 'DCDC', desc: 'Direct Current/Direct Current Converter Control Module', group: 'Voltage Converter/Inverter', moidref: 'G1585827', updatable: false },
            '7A2': { acronym: 'DCME', desc: 'Door Control Module E', group: 'Multifunction Modules', updatable: true },
            762: { acronym: 'DCMF', desc: 'Door Control Module F', group: 'Multifunction Modules', updatable: true },
            '7B3': { acronym: 'DCMG', desc: 'Door Control Module G', group: 'Multifunction Modules', updatable: true },
            '7B4': { acronym: 'DCMH', desc: 'Door Control Module H', group: 'Multifunction Modules', updatable: true },
            795: { acronym: 'DCMR', desc: 'Differential Control Module Rear', group: 'Four-Wheel Drive Systems', updatable: true },
            740: { acronym: 'DDM', desc: 'Driver Door Module', group: 'Multifunction Modules', moidref: 'G1268121', updatable: true },
            744: { acronym: 'DSM/RBM', desc: 'Driver Front Seat Module / Running Board Control Module', group: 'Front Seats', moidref: 'G1593640', updatable: true },
            783: { acronym: 'DSP', desc: 'Audio Digital Signal Processing Module', group: 'Information and Entertainment Systems', moidref: 'G1490339', updatable: true },
            '7A7': { acronym: 'FCIM', desc: 'Front Control Interface Module', group: 'Heating, Ventillation and Air Conditioning Module', updatable: true },
            '7A0': { acronym: 'FCIMB', desc: 'Front Control Interface Module B', group: 'Heating, Ventillation and Air Conditioning Module', updatable: true },
            '6E3': { acronym: 'FHCM', desc: 'Front Hatch Control Module', group: 'Body Closures', moidref: 'G2303138', updatable: true },
            '7A1': { acronym: 'GFM', desc: 'Generic Function Module', group: 'High Voltage Battery Charging System', moidref: 'G1585818', updatable: false },
            '7D2': { acronym: 'GFM2', desc: 'Generic Function Module 2', group: 'Fuel System', moidref: 'G1817236', updatable: false },
            707: { acronym: 'GFM3', desc: 'Generic Function Module 3', group: 'Multifunction Modules', moidref: 'G2102578', updatable: false },
            732: { acronym: 'GSM', desc: 'Gear Shift Module', group: 'Automatic Transmission', moidref: 'G1892092', updatable: false },
            716: { acronym: 'GWM', desc: 'Gateway Module A', group: 'Module Communications Network', moidref: 'G1523364', updatable: true },
            734: { acronym: 'HCM', desc: 'Headlamp Control Module', group: 'Exterior Lighting', moidref: 'G1298819', updatable: true },
            714: { acronym: 'HSWM', desc: 'Heated Steering Wheel Module', group: 'Steering Wheel and Column Electrical Components', updatable: true },
            733: { acronym: 'HVAC', desc: 'Heating, Ventillation and Air Conditioning Module', group: 'Climate Control System', moidref: 'G1489699', updatable: true },
            '7B2': { acronym: 'HUD', desc: 'Heads Up Display Module', group: 'Information and Entertainment Systems', updatable: true },
            784: { acronym: 'ICM', desc: 'Information Center Module', group: 'Instrument and Entertainment System', updatable: true },
            720: { acronym: 'IPC', desc: 'Instrument Panel Cluster', group: 'Instrumentation and Warning Systems', moidref: 'G1523442', updatable: true },
            706: { acronym: 'IPMA', desc: 'Image Processing Module A', group: 'Lane Keeping System', moidref: 'G1477138', updatable: true },
            '7B1': { acronym: 'IPMB', desc: 'Image Processing Module B', group: 'Camera Vision System', updatable: true },
            '6F6': { acronym: 'LDCMA', desc: 'Lighting Driver Control Module A', group: 'Exterior Lighting', moidref: 'G2274992', updatable: false },
            '6F7': { acronym: 'LDCMB', desc: 'Lighting Driver Control Module B', group: 'Exterior Lighting', moidref: 'G2274993', updatable: false },
            790: { acronym: 'MRCMA', desc: 'Movable Roof Control Module A', group: 'Multifunction Modules', updatable: true },
            '7B0': { acronym: 'MRCMB', desc: 'Movable Roof Control Module B', group: 'Multifunction Modules', updatable: true },
            '6F5': { acronym: 'OBCC', desc: 'Off-Board Charger Controller', group: 'High Voltage Battery Charging System', moidref: 'G2164538', updatable: true },
            765: { acronym: 'OCSM', desc: 'Occupant Classification System Module', group: 'Supplemental Restraint System', moidref: 'G1476397', updatable: false },
            750: { acronym: 'PACM', desc: 'Pedestrian Alert Control Module', group: 'Pedestrian Alert System', moidref: 'G2044345', updatable: false },
            736: { acronym: 'PAM', desc: 'Parking Assist Control Module', group: 'Parking Assistance System', updatable: true },
            741: { acronym: 'PDM', desc: 'Passenger Door Module', group: 'Multifunction Modules', moidref: 'G1268128', updatable: true },
            730: { acronym: 'PSCM', desc: 'Power Steering Control Module', group: 'Power Steering', updatable: true },
            774: { acronym: 'RACM', desc: 'Rear Audio Control Module', group: 'Information and Entertainment Systems', updatable: true },
            766: { acronym: 'RBM', desc: 'Running Board Control Module', group: 'Running Board', updatable: true },
            737: { acronym: 'RCM', desc: 'Restraints Control Module', group: 'Supplemental Restraint System', moidref: 'G1265343', updatable: true },
            731: { acronym: 'RFA', desc: 'Remote Function Actuator Module', group: 'Multifunction Modules', moidref: 'G1523438', updatable: false },
            775: { acronym: 'RGTM', desc: 'Rear Gate Trunk Module', group: 'Body Closures', moidref: 'G1357598', updatable: false },
            785: { acronym: 'RHVAC', desc: 'Rear Heating, Ventillation and Air Conditioning Module', group: 'Climate Control System', updatable: true },
            751: { acronym: 'RTM', desc: 'Radio Transceiver Module', group: 'Multifunction Modules', moidref: 'G1696268', updatable: true },
            797: { acronym: 'SASM', desc: 'Steering Angle Sensor Module', group: 'Steering Wheel and Column Electrical Components', moidref: 'G1523972', updatable: true },
            724: { acronym: 'SCCM', desc: 'Steering Column Control Module', group: 'Steering Wheel and Column Electrical Components', moidref: 'G1469330', updatable: true },
            '7A3': { acronym: 'SCMB', desc: 'Passenger Front Seat Module', group: 'Front Seats', updatable: true },
            702: { acronym: 'SCMC', desc: 'Rear LH Multi-Contour Seat Module', group: 'Rear Seats', updatable: true },
            763: { acronym: 'SCMD', desc: 'Rear RH Multi-Contour Seat Module', group: 'Rear Seats', updatable: true },
            776: { acronym: 'SCME', desc: 'Front Seat Climate Control Module', group: 'Front Seats', updatable: true },
            777: { acronym: 'SCMF', desc: 'Rear Seat Climate Control Module', group: 'Rear Seats', updatable: true },
            712: { acronym: 'SCMG', desc: 'Driver Multi-Contour Seat Module', group: 'Front Seats', updatable: true },
            713: { acronym: 'SCMH', desc: 'Passenger Multi-Contour Seat Module', group: 'Front Seats', updatable: true },
            787: { acronym: 'SCMJ', desc: 'Power Fold Seat Module', group: 'Rear Seats', updatable: true },
            '7C5': { acronym: 'SECM', desc: 'Steering Effort Control Module', group: 'Power Steering', updatable: true },
            770: { acronym: 'SIMA', desc: 'Switch Input Module A', group: 'Multifunction Modules', updatable: true },
            '7C5': { acronym: 'SECM', desc: 'Steering Effort Control Module', group: 'Power Steering', moidref: 'G1795675', updatable: true },
            '7E2': { acronym: 'SOBDMA', desc: 'Secondary On-Board Diagnostic Control Module A', group: 'High Voltage Battery Charging System', updatable: true },
            '7E7': { acronym: 'SOBDMB', desc: 'Secondary On-Board Diagnostic Control Module B', group: 'Rear Electric Drive Assembly', updatable: true },
            '7E6': { acronym: 'SOBDMC', desc: 'Secondary On-Board Diagnostic Control Module C', group: 'Electronic Engine Controls', updatable: true },
            '6F2': { acronym: 'SODCMC', desc: 'Side Obstacle Detection Control Module C', group: 'Side and Rear Vision', moidref: 'G2164515', updatable: true },
            '6F3': { acronym: 'SODCMD', desc: 'Side Obstacle Detection Control Module D', group: 'Side and Rear Vision', moidref: 'G2164526', updatable: true },
            '7C4': { acronym: 'SODL', desc: 'Side Obstacle Detection Control Module LH', group: 'Side and Rear Vision', moidref: 'G1478298', updatable: true },
            '7C6': { acronym: 'SODR', desc: 'Side Obstacle Detection Control Module RH', group: 'Side and Rear Vision', moidref: 'G1478301', updatable: true },
            '7D3': { acronym: 'SUMA', desc: 'Suspension Control Module A', group: 'Suspension Control System', updatable: true },
            757: { acronym: 'TBM', desc: 'Trailer Brake Control Module', group: 'Auxiliary Brake System', moidref: 'G1525563', updatable: true },
            761: { acronym: 'TCCM', desc: 'Transfer Case Control Module', group: 'Four-Wheel Drive Systems', moidref: 'G1268451', updatable: false },
            '7E1': { acronym: 'TCM', desc: 'Transmission Control Module', group: 'Automatic Transmission', updatable: true },
            '7E9': { acronym: 'TCM', desc: 'Transmission Control Module', group: 'Automatic Transmission', updatable: true },
            754: { acronym: 'TCU', desc: 'Telematics Control Unit Module', group: 'Information and Entertainment Systems', moidref: 'G1629014', updatable: true },
            791: { acronym: 'TRM', desc: 'Trailer Module', group: 'Exterior Lighting', moidref: 'G1312635', updatable: true },
            721: { acronym: 'VDM', desc: 'Vehicle Dynamics Control Module', group: 'Vehicle Dynamic Suspension', moidref: 'G1576230', updatable: true },
            725: { acronym: 'WACM', desc: 'Wireless Accessory Charging Module', group: 'Information and Entertainment Systems', moidref: 'G1926890', updatable: true },
        };
        if (['6E0', '6E3', '7E0', '7E1', '7E2', '7E4', '7E6', '7E7', '7E9'].includes(addr.toString())) {
            switch (addr.toString()) {
                case '6E0':
                    return { acronym: 'ACCMB', desc: 'Air Conditioning Compressor Control Module B', group: 'Electrified Drivetrain Cooling - High Voltage Battery Refrigerant Cooling', moidref: 'G2303114', updatable: false };
                case '6E3':
                    return { acronym: 'FHCM', desc: 'Front Hatch Control Module', group: 'Body Closures', updatable: true };
                case '7E0':
                    return { acronym: 'PCM', desc: 'Powertrain Control Module', group: 'Electronic Engine Controls', moidref: 'G1265309', updatable: true };
                case '7E1':
                    return { acronym: 'TCM', desc: 'Transmission Control Module', group: 'Automatic Transmission', updatable: true };
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
                    await wv.evaluateJavaScript(`
                        function setVinAndCaptcha() {
                            document.querySelector("input[name='VIN']").value = '${vin}';
                            // console.log('VIN: ' + document.querySelector("input[name='VIN']").value);
                            document.querySelector("input[name='CaptchaInputText']").value = '${code}';
                            // console.log('Code: ' + document.querySelector("input[name='CaptchaInputText']").value);
                            document.forms[1].submit();
                        }
                         setVinAndCaptcha();
                    `);
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

module.exports = class FPW_Files {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
    }

    getModuleVer() {
        return '2022.04.27.0';
    }

    async loadImage(imgUrl) {
        try {
            const req = new Request(imgUrl);
            return await req.loadImage();
        } catch (e) {
            this.FPW.logError(`loadImage Error: Could Not Load Image from ${imgUrl}.`);
            return undefined;
        }
    }

    async saveJsonFile(type, data, filename = 'fp_vehicleData', frcCld = false) {
        console.log(`FileManager: Saving (${type}) Data to Local Storage...`);
        try {
            let fm = frcCld || this.widgetConfig.saveFilesToIcloud ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `${filename}_${this.SCRIPT_ID}.json` : `${filename}.json`;
            let path = fm.joinPath(dir, fileName);
            if (await fm.fileExists(path)) {
                await fm.remove(path);
            } //clean old data
            await fm.writeString(path, JSON.stringify(data));
        } catch (e) {
            this.FPW.logError(`saveJsonFile Error: ${e}`);
        }
    }

    async readJsonFile(type, filename = 'fp_vehicleData', frcCld = false) {
        // console.log(`FileManager: Retrieving (${type}) from Local Cache...`);
        try {
            let fm = frcCld || this.widgetConfig.saveFilesToIcloud ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `${filename}_${this.SCRIPT_ID}.json` : `${filename}.json`;
            let path = fm.joinPath(dir, fileName);
            if (await fm.fileExists(path)) {
                if (frcCld || (this.widgetConfig.saveFilesToIcloud && fm.isFileStoredIniCloud(path))) {
                    fm.downloadFileFromiCloud(path);
                }
                let localData = await fm.readString(path);
                return JSON.parse(localData);
            }
        } catch (e) {
            this.FPW.logError(`readJsonFile Error: ${e}`);
        }
        return null;
    }

    async getFileInfo(file, frcCld = false) {
        let fm = frcCld || this.widgetConfig.saveFilesToIcloud ? FileManager.iCloud() : FileManager.local();
        let dir = fm.documentsDirectory();
        let path = fm.joinPath(dir, file);
        if (await fm.fileExists(path)) {
            if (frcCld || (this.widgetConfig.saveFilesToIcloud && fm.isFileStoredIniCloud(path))) {
                fm.downloadFileFromiCloud(path);
            }
            return {
                name: file,
                size: await fm.fileSize(path),
                created: await fm.creationDate(path),
                modified: await fm.modificationDate(path),
            };
        } else {
            return undefined;
        }
    }

    async removeFile(filename, frcCld = false) {
        try {
            let fm = frcCld || this.widgetConfig.saveFilesToIcloud ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            let path = fm.joinPath(dir, filename);
            if (await fm.fileExists(path)) {
                await fm.remove(path);
            }
        } catch (e) {
            this.FPW.logError(`removeFile Error: ${e}`);
        }
    }

    async loadLocalDevCredentials() {
        // This is used when i need to make a video it preloads my credentials so you don't see me enter them in the video.
        try {
            let fm = FileManager.iCloud();
            let dir = fm.documentsDirectory();
            let path = fm.joinPath(dir, 'fp_credentials.json');
            if (await fm.fileExists(path)) {
                let data = await fm.readString(path);
                return JSON.parse(data);
            } else {
                return undefined;
            }
        } catch (e) {
            this.FPW.logError(`loadLocalDevCredentials Error: ${e}`);
        }
    }

    async isLocalDataFreshEnough() {
        let localData = await this.readLocalData();
        if (localData && Date.now() - localData.fetchTime < 60000 * this.widgetConfig.refreshInterval) {
            return true;
        } else {
            return false;
        }
    }

    async clearImageCache() {
        console.log('FileManager: Clearing All Image Files from Local Cache...');
        try {
            let fm = this.widgetConfig.saveFilesToIcloud ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            fm.listContents(dir).forEach(async(file) => {
                const fp = fm.joinPath(dir, file);
                if ((await fm.fileExtension(fp)) === 'png') {
                    console.log(`FileManager: Removing Image File: ${file}`);
                    await fm.remove(fp);
                }
            });
        } catch (e) {
            this.FPW.logError(`clearImageCache Error: ${e}`);
        }
    }

    async clearFileManager() {
        console.log('FileManager: Clearing All Files from Local Cache...');
        try {
            let fm = this.widgetConfig.saveFilesToIcloud ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            fm.listContents(dir).forEach(async(file) => {
                await this.removeFile(file);
            });
        } catch (e) {
            this.FPW.logError(`clearFileManager Error: ${e}`);
        }
    }

    async clearModuleCache() {
        console.log('FileManager: Clearing All Module Files from Local Cache...');
        try {
            const fm = FileManager.local();
            const dir = fm.joinPath(fm.documentsDirectory(), 'FPWModules');
            fm.listContents(dir).forEach(async(file) => {
                const fp = fm.joinPath(dir, file);
                if ((await fm.fileExtension(fp)) === 'js') {
                    console.log(`FileManager: Removing Module File: ${file}`);
                    await fm.remove(fp);
                }
            });
        } catch (e) {
            this.FPW.logError(`clearModuleCache Error: ${e}`);
        }
    }

    async hashCode(input) {
        return Array.from(input).reduce((accumulator, currentChar) => (accumulator << 5) - accumulator + currentChar.charCodeAt(0), 0);
        // return Array.from(input).reduce((accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0), 0);
    }

    async exportModuleHashes() {
        try {
            const localFm = FileManager.local();
            const localDocs = localFm.documentsDirectory();
            const icloudFm = FileManager.iCloud();
            const icloudDocs = icloudFm.documentsDirectory();
            const localModsFolder = localFm.joinPath(localDocs, 'FPWModules');
            const localMods = localFm
                .listContents(localModsFolder)
                .filter((item) => item.endsWith('.js'))
                .sort();
            const icloudModsFolder = icloudFm.joinPath(icloudDocs, 'FPWModules');
            const icloudMods = icloudFm
                .listContents(icloudModsFolder)
                .filter((item) => item.endsWith('.js'))
                .sort();

            let modulesOut = { iCloud: [], Local: [] };
            // console.log(JSON.stringify(modules));
            if (localMods.length > 0) {
                console.log(`Info: Processing Local Modules: ${localMods.length}`);
                for (const [i, module] of localMods.entries()) {
                    let code = localFm.readString(localFm.joinPath(localModsFolder, module));
                    let hash = await this.hashCode(code);
                    // console.log(`Info: Module ${module} hash: ${hash}`);
                    modulesOut.Local.push(`${module}||${hash}`);
                }
            }

            if (icloudMods.length > 0) {
                console.log(`Info: Processing iCloud Modules: ${icloudMods.length}`);
                for (const [i, module] of icloudMods.entries()) {
                    let code = icloudFm.readString(icloudFm.joinPath(icloudModsFolder, module));
                    let hash = await this.hashCode(code);
                    // console.log(`Info: Module ${module} hash: ${hash}`);
                    modulesOut.iCloud.push(`${module}||${hash}`);
                }
            }
            let filePath = icloudFm.joinPath(icloudDocs, 'modules_config.json');
            let data = Data.fromString(`${JSON.stringify(modulesOut)}`);
            icloudFm.write(filePath, data);
            console.log(JSON.stringify(modulesOut));
        } catch (e) {
            console.error(`proceModulesFolder | Error: ${e}`);
        }
    }

    //************************************************** END FILE MANAGEMENT FUNCTIONS************************************************
    //********************************************************************************************************************************

    async getFPImage(image, asData = false) {
        return await this.getImage(image, 'FP_Icons', asData);
    }

    async getWidgetExampleImage(image) {
        return await this.getImage(image, '', false, false);
    }

    // get images from local filestore or download them once
    async getImage(image, subPath = '', asData = false, save = true) {
        try {
            const fm = this.widgetConfig.saveFilesToIcloud ? FileManager.iCloud() : FileManager.local();
            const dir = fm.documentsDirectory();
            const path = fm.joinPath(dir, image);
            const imageUrl = `https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/icons/${subPath.length ? subPath + '/' : ''}${image}`;
            if (await fm.fileExists(path)) {
                if (asData) {
                    return await fm.read(path);
                } else {
                    return await fm.readImage(path);
                }
            } else {
                // download image and save to local device
                switch (image) {
                    case 'gas-station_light.png':
                        imageUrl = 'https://i.imgur.com/gfGcVmg.png';
                        break;
                    case 'gas-station_dark.png':
                        imageUrl = 'https://i.imgur.com/hgYWYC0.png';
                        break;
                }
                const imgName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                console.log('Downloading Image: ' + imgName);
                let iconImage = await this.loadImage(imageUrl);
                if (save) {
                    await fm.writeImage(path, iconImage);
                }
                return iconImage;
            }
        } catch (e) {
            this.FPW.logError(`getImage(${image}) Error: ${e}`);
            return null;
        }
    }

    async downloadAllVehicleImagesToIcloud(vData) {
        await this.getVehicleImage(vData.info.vehicle.modelYear, true, 1);
        await this.getVehicleImage(vData.info.vehicle.modelYear, true, 2);
        await this.getVehicleImage(vData.info.vehicle.modelYear, true, 3);
        await this.getVehicleImage(vData.info.vehicle.modelYear, true, 4);
        await this.getVehicleImage(vData.info.vehicle.modelYear, true, 5);
        return;
    }

    async getUserDefinedImage() {
        const fm = FileManager.iCloud();
        const dir = fm.documentsDirectory();
        const vin = await this.FPW.getSettingVal('fpVin');
        const widgetSize = this.FPW.widgetSize;
        const images = [`${vin}.png`, `${vin}_${widgetSize}.png`];
        for (const i in images) {
            const image = images[i];
            const path = fm.joinPath(dir, image);
            if (fm.fileExists(path)) {
                // console.log(path);
                await fm.downloadFileFromiCloud(path);
                return await fm.readImage(path);
            }
        }
        return undefined;
    }

    async getVehicleImage(modelYear, cloudStore = false, angle = 4, asData = false, secondAttempt = false, ignError = false) {
        const fm = cloudStore || this.widgetConfig.saveFilesToIcloud ? FileManager.iCloud() : FileManager.local();
        const dir = fm.documentsDirectory();
        let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `vehicle_${angle}_${this.SCRIPT_ID}.png` : `vehicle_${angle}.png`;
        let path = fm.joinPath(dir, fileName);
        let userDefinedImage = await this.getUserDefinedImage();
        if (userDefinedImage) {
            return userDefinedImage;
        }
        if (await fm.fileExists(path)) {
            if (asData) {
                return await fm.read(path);
            } else {
                return await fm.readImage(path);
            }
        } else {
            const vin = await this.FPW.getSettingVal('fpVin');
            const token = await this.FPW.getSettingVal('fpToken2');
            const country = await this.FPW.getSettingVal('fpCountry');
            console.log(`vehicleImage | VIN: ${vin} | country: ${country}`);
            let req = new Request(`https://www.digitalservices.ford.com/fs/api/v2/vehicles/image/full?vin=${vin}&year=${modelYear}&countryCode=${country}&angle=${angle}`);
            req.headers = {
                'Content-Type': 'application/json',
                Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'FordPass/5 CFNetwork/1327.0.4 Darwin/21.2.0',
                'Accept-Encoding': 'gzip, deflate, br',
                'auth-token': `${token}`,
                Origin: 'https://www.ford.com',
                Referer: 'https://www.ford.com',
            };
            req.method = 'GET';
            req.timeoutInterval = 15;
            try {
                let img = await req.loadImage();
                let resp = req.response;
                console.log(`vehicleImage Resp: ${resp.statusCode}`);
                if (resp.statusCode === 200) {
                    await fm.writeImage(path, img);
                    return img;
                } else {
                    return await this.getImage('placeholder.png');
                }
            } catch (e) {
                console.log(e.message);
                if (!ignError && e.message === 'Cannot parse response to an image.' && !secondAttempt) {
                    secondAttempt = true;
                    return await this.getVehicleImage(modelYear, cloudStore, 4, asData, secondAttempt);
                } else {
                    this.FPW.logError(`getVehicleImage Error: Could Not Load Vehicle Image. ${e}`);
                    return await this.getImage('placeholder.png');
                }
            }
        }
    }
};
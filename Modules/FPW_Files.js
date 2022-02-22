module.exports = class FPW_Files {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
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

    async saveDataToLocal(data, removeFirst = false) {
        console.log('FileManager: Saving Vehicle Data to Local Storage...');
        try {
            let fm = this.widgetConfig.saveFilesToIcloud ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `$fp_vehicleData_${this.SCRIPT_ID}.json` : 'fp_vehicleData.json';
            let path = fm.joinPath(dir, fileName);
            if (await fm.fileExists(path)) {
                await fm.remove(path);
            } //clean old data
            await fm.writeString(path, JSON.stringify(data));
        } catch (e) {
            this.FPW.logError(`saveDataToLocal Error: ${e}`);
        }
    }

    async readLocalData() {
        // console.log('FileManager: Retrieving Vehicle Data from Local Cache...');
        try {
            let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `$fp_vehicleData_${this.SCRIPT_ID}.json` : 'fp_vehicleData.json';
            let fm = this.widgetConfig.saveFilesToIcloud ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            let path = fm.joinPath(dir, fileName);
            if (await fm.fileExists(path)) {
                let localData = await fm.readString(path);
                return JSON.parse(localData);
            }
        } catch (e) {
            this.FPW.logError(`readLocalData Error: ${e}`);
        }
        return null;
    }

    async removeLocalData(filename) {
        try {
            let fm = this.widgetConfig.saveFilesToIcloud ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            let path = fm.joinPath(dir, filename);
            if (await fm.fileExists(path)) {
                await fm.remove(path);
            }
        } catch (e) {
            this.FPW.logError(`removeLocalData Error: ${e}`);
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
                await this.removeLocalData(file);
            });
        } catch (e) {
            this.FPW.logError(`clearFileManager Error: ${e}`);
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

    async getVehicleImage(modelYear, cloudStore = false, angle = 4, asData = false, secondAttempt = false, ignError = false) {
        const fm = cloudStore || this.widgetConfig.saveFilesToIcloud ? FileManager.iCloud() : FileManager.local();
        const dir = fm.documentsDirectory();
        let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `vehicle_${angle}_${this.SCRIPT_ID}.png` : `vehicle_${angle}.png`;
        let path = fm.joinPath(dir, fileName);
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
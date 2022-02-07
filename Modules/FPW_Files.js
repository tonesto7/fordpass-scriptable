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
            this.FPW.logger(`loadImage Error: Could Not Load Image from ${imgUrl}.`, true);
            return undefined;
        }
    }

    async saveDataToLocal(data) {
        console.log('FileManager: Saving Vehicle Data to Local Storage...');
        try {
            let fm = this.FPW.widgetConfig.iCloudFiles ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `$fp_vehicleData_${this.SCRIPT_ID}.json` : 'fp_vehicleData.json';
            let path = fm.joinPath(dir, fileName);
            if (await fm.fileExists(path)) {
                await fm.remove(path);
            } //clean old data
            await fm.writeString(path, JSON.stringify(data));
        } catch (e) {
            this.FPW.logger(`saveDataToLocal Error: ${e}`, true);
        }
    }

    async readLocalData() {
        // console.log('FileManager: Retrieving Vehicle Data from Local Cache...');
        try {
            let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `$fp_vehicleData_${this.SCRIPT_ID}.json` : 'fp_vehicleData.json';
            let fm = this.FPW.widgetConfig.iCloudFiles ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            let path = fm.joinPath(dir, fileName);
            if (await fm.fileExists(path)) {
                let localData = await fm.readString(path);
                return JSON.parse(localData);
            }
        } catch (e) {
            this.FPW.logger(`readLocalData Error: ${e}`, true);
        }
        return null;
    }

    async removeLocalData(filename) {
        try {
            let fm = this.FPW.widgetConfig.iCloudFiles ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            let path = fm.joinPath(dir, filename);
            if (await fm.fileExists(path)) {
                await fm.remove(path);
            }
        } catch (e) {
            this.FPW.logger(`removeLocalData Error: ${e}`, true);
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

    async clearFileManager() {
        console.log('FileManager: Clearing All Files from Local Cache...');
        try {
            let fm = this.FPW.widgetConfig.iCloudFiles ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            fm.listContents(dir).forEach(async(file) => {
                await this.removeLocalData(file);
            });
        } catch (e) {
            this.FPW.logger(`clearFileManager Error: ${e}`, true);
        }
    }

    //************************************************** END FILE MANAGEMENT FUNCTIONS************************************************
    //********************************************************************************************************************************

    async getFPImage(image, asData = false) {
        return await this.getImage(image, 'FP_Icons', asData);
    }

    // get images from local filestore or download them once
    async getImage(image, subPath = '', asData = false) {
        try {
            let fm = this.FPW.widgetConfig.iCloudFiles ? FileManager.iCloud() : FileManager.local();
            let dir = fm.documentsDirectory();
            let path = fm.joinPath(dir, image);
            let imageUrl = `https://raw.githubusercontent.com/tonesto7/fordpass-scriptable/main/icons/${subPath.length ? subPath + '/' : ''}${image}`;
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
                await fm.writeImage(path, iconImage);
                return iconImage;
            }
        } catch (e) {
            this.FPW.logger(`getImage(${image}) Error: ${e}`, true);
            return null;
        }
    }

    async getVehicleImage(modelYear, cloudStore = false, angle = 4, asData = false) {
        let fm = cloudStore ? FileManager.iCloud() : FileManager.local();
        let dir = fm.documentsDirectory();
        let fileName = this.SCRIPT_ID !== null && this.SCRIPT_ID !== undefined && this.SCRIPT_ID > 0 ? `vehicle_${angle}_${this.SCRIPT_ID}.png` : `vehicle_${angle}.png`;
        let path = fm.joinPath(dir, fileName);
        if (await fm.fileExists(path)) {
            if (asData) {
                return await fm.read(path);
            } else {
                return await fm.readImage(path);
            }
        } else {
            let vin = await this.FPW.getSettingVal('fpVin');
            let token = await this.FPW.getSettingVal('fpToken2');
            let country = await this.FPW.getSettingVal('fpCountry');
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
            req.timeoutInterval = 10;
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
                this.FPW.logger(`getVehicleImage Error: Could Not Load Vehicle Image. ${e}`, true);
                return await this.getImage('placeholder.png');
            }
        }
    }
};
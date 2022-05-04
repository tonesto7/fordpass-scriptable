module.exports = class FPW_Alerts {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
    }

    getModuleVer() {
        return '2022.05.04.1';
    }

    async showAlert(title, message) {
        let alert = new Alert();
        alert.title = title;
        alert.message = message;
        alert.addAction('OK');
        const respInd = await alert.presentAlert();
        // console.log(`showAlert Response: ${respInd}`);
        switch (respInd) {
            case 0:
                // console.log(`${title} alert was cleared...`);
                return true;
        }
    }

    async showPrompt(alertTitle, AlertMsg, okTitle, okRed = false) {
        let prompt = new Alert();
        prompt.title = alertTitle;
        prompt.message = AlertMsg;
        if (okRed) {
            prompt.addDestructiveAction(okTitle);
        } else {
            prompt.addAction(okTitle);
        }
        prompt.addAction('Cancel');
        const respInd = await prompt.presentAlert();
        // console.log(`showAlert Response: ${respInd}`);
        switch (respInd) {
            case 0:
                return true;
            case 1:
                return false;
        }
    }

    async showYesNoPrompt(title = undefined, msg = undefined) {
        let prompt = new Alert();
        prompt.title = title;
        prompt.message = msg;
        prompt.addDestructiveAction('Yes');
        prompt.addAction('No');
        const respInd = await prompt.presentAlert();
        switch (respInd) {
            case 0:
                return true;
            case 1:
                return false;
        }
    }

    async showCaptchaPrompt() {
        let prompt = new Alert();
        prompt.title = 'AsBuilt Captcha Code';
        prompt.message = 'Please enter the captcha code below';
        prompt.addTextField('Captcha Code', '');
        prompt.addAction('Submit');
        prompt.addCancelAction('Cancel');
        const respInd = await prompt.presentAlert();
        switch (respInd) {
            case 0:
                return prompt.textFieldValue(0).trim().toUpperCase();
            case 1:
                return undefined;
        }
    }

    async showActionPrompt(title = undefined, msg = undefined, menuItems, showCancel = false, cancelFunc = undefined) {
        let prompt = new Alert();
        prompt.title = title;
        prompt.message = msg;
        menuItems.forEach((item, ind) => {
            if (item.destructive) {
                prompt.addDestructiveAction(item.title);
            } else {
                prompt.addAction(item.title);
            }
        });
        if (showCancel) {
            prompt.addAction('Cancel');
        }

        const respInd = await prompt.presentAlert();
        // console.log(`showAlert Response: ${respInd}`);
        if (respInd !== null) {
            const menuItem = menuItems[respInd];
            if (respInd > menuItems.length - 1) {
                console.log('Cancelled');
                if (cancelFunc) {
                    await cancelFunc();
                }
            } else {
                if (menuItem.action) {
                    await menuItem.action();
                }
            }
        }
    }
};
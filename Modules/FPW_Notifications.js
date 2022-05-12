module.exports = class FPW_Notifications {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
    }

    getModuleVer() {
        return '2022.05.12.0';
    }

    async createNotification(title, subtitle, body, options = {}) {
        let notif = new Notification();
        notif.title = title;
        notif.subtitle = subtitle;
        notif.body = body;
        if (options && Object.keys(options).length > 0) {
            // Options:
            // - identifier: string
            // - threadIdentifier: string // Identifier for grouping the notification.
            // - sound: 'default', 'accept', 'alert', 'complete', 'event', 'failure', 'piano_error', 'piano_success', 'popup'
            // - openUrl: 'url'
            // - badge: 'number'
            // - userInfo: {string: any} // Store any custom information for the notification. This can be accessed from the Notification.opened property
            // - nextTriggerDate: Date // Returns The date and time when the notification will be triggered.
            // - scriptName: string // The name of the script to be executed when the notification is tapped.
            // - actions: [{title: string, url: string}] // An array of actions for the notification.
            // - addAction(title: string, url: string, destructive: bool) // Add an action button to the notification. (max 10 actions)
            // - current() // Notification a script is running in.
            // - setTriggerDate(date: Date) // Set the date and time when the notification will be triggered.
            // - setDailyTrigger(hour: number, minute: number, repeats: bool) // Set the time of day when the notification will be triggered.
            // - setWeeklyTrigger(weekday: number, hour: number, minute: number, repeats: bool) // Set the day of the week and time of day when the notification will be triggered.
            for (const [key, value] of Object.entries(options)) {
                // console.log(key, value);
                if (value !== undefined) {
                    switch (key) {
                        case 'actions':
                            if (value.length > 0) {
                                for (const [i, action] of value.entries()) {
                                    if (i < 10) {
                                        notif.addAction(action.title, action.url);
                                    }
                                }
                            }
                            break;
                        case 'addAction':
                            if (value && value.title && value.url) {
                                notif.addAction(value.title, value.url);
                            }
                            break;
                        case 'setTriggerDate':
                            if (value instanceof Date) {
                                notif.setTriggerDate(value);
                            }
                            break;
                        case 'setDailyTrigger':
                            if (value && value.hour && value.minute) {
                                notif.setDailyTrigger(value.hour, value.minute, value.repeats === true);
                            }
                            break;
                        case 'setWeeklyTrigger':
                            if (value && value.weekday && value.hour && value.minute) {
                                notif.setWeeklyTrigger(value.weekday, value.hour, value.minute, value.repeats === true);
                            }
                            break;
                        default:
                            notif[key] = value;
                            break;
                    }
                }
            }
        }
        await notif.schedule();
    }

    async getPendingNotification() {
        return Notification.allPending();
    }

    async getDeliveredNotification() {
        return Notification.allDelivered();
    }

    async removePendingNotification(identifier) {
        return await Notification.removePending(identifier);
    }

    async removeAllPendingNotification() {
        return await Notification.removeAllPending();
    }

    async removeAllDeliveredNotification() {
        return await Notification.removeAllDelivered();
    }

    async processNotification(nType, vals = undefined) {
        // console.log('processNotification', nType, vals);
        switch (nType) {
            case 'scriptUpdate':
                if ((await this.FPW.getShowNotificationType(nType)) && (await this.FPW.getLastNotifElapsedOkByType(nType))) {
                    await this.FPW.storeLastNotificationDtByType(nType);
                    await this.createNotification(`Ford Widget Notice`, `New Version Available`, `A new version of the Ford Widget is available.\n(v${this.FPW.SCRIPT_VERSION}) > (v${this.FPW.getStateVal('LATEST_VERSION')})\n\nHold down on this Notification and select Update to launch the Updater...`, {
                        actions: [{
                            title: 'Update Widget',
                            url: await this.FPW.buildCallbackUrl({ command: 'open_updater' }),
                        }, ],
                        identifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        threadIdentifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        scriptName: Script.name(),
                        openUrl: await this.FPW.buildCallbackUrl({ command: 'open_updater' }),
                        sound: 'complete',
                    });
                }
                return;

            case 'otaUpdate':
                if ((await this.FPW.getShowNotificationType(nType)) && (await this.FPW.getLastNotifElapsedOkByType(nType))) {
                    await this.FPW.storeLastNotificationDtByType(nType);
                    await this.createNotification('Vehicle Alert', `Over-Air-Update in Progress`, `Your vehicle has indicated that there is a OTA upgrade in progress.`, {
                        identifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        threadIdentifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        scriptName: Script.name(),
                    });
                }
                return;

            case 'deepSleep':
                if ((await this.FPW.getShowNotificationType(nType)) && (await this.FPW.getLastNotifElapsedOkByType(nType))) {
                    await this.FPW.storeLastNotificationDtByType(nType);
                    await this.createNotification('Vehicle Alert', `Vehicle in Deep Sleep Mode`, `Your vehicle has indicated that it is in Deep Sleep Mode to conserve battery.`, {
                        identifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        threadIdentifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        scriptName: Script.name(),
                    });
                }
                return;

            case 'oilLow':
                if ((await this.FPW.getShowNotificationType(nType)) && (await this.FPW.getLastNotifElapsedOkByType(nType))) {
                    await this.FPW.storeLastNotificationDtByType(nType);
                    await this.createNotification('Vehicle Alert', `Oil Level Low`, `Your vehicle has indicated that your Oil is reporting low.`, {
                        identifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        threadIdentifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        scriptName: Script.name(),
                    });
                }
                return;

            case 'tireLow':
                if ((await this.FPW.getShowNotificationType(nType)) && (await this.FPW.getLastNotifElapsedOkByType(nType))) {
                    await this.FPW.storeLastNotificationDtByType(nType);
                    await this.createNotification('Vehicle Alert', `Low Tire Alert`, `Your vehicle has indicated that the following tires are ${vals} are reporting low pressure.`, {
                        identifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        threadIdentifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        scriptName: Script.name(),
                    });
                }
                return;

            case 'evChargingPaused':
                if ((await this.FPW.getShowNotificationType(nType)) && (await this.FPW.getLastNotifElapsedOkByType(nType))) {
                    await this.FPW.storeLastNotificationDtByType(nType);
                    await this.createNotification('Vehicle Alert', `Vehicle Charging Paused`, `Your Smart Charger has reported that charging is currently paused for your vehicle.`, {
                        identifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        threadIdentifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        scriptName: Script.name(),
                    });
                }
                return;

            case 'lvBatteryLow':
                if ((await this.FPW.getShowNotificationType(nType)) && (await this.FPW.getLastNotifElapsedOkByType(nType))) {
                    await this.FPW.storeLastNotificationDtByType(nType);
                    await this.createNotification('Vehicle Alert', `12V Battery is Low`, `Your vehicle has indicated that your 12V battery is low.`, {
                        identifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        threadIdentifier: `FPW_${this.FPW.SCRIPT_ID}_${nType}`,
                        scriptName: Script.name(),
                    });
                }
                return;
        }
    }
};
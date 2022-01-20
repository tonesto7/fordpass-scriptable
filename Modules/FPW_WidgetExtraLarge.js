module.exports = class FPW_WidgetExtraLarge {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.Kc = FPW.Kc;
        this.Files = FPW.Files;
        this.FordRequests = FPW.FordRequests;
        this.Alerts = FPW.Alerts;
        this.Timers = FPW.Timers;
        this.Utils = FPW.Utils;
        this.Widgets = FPW.Widgets;
    }

    async createExtraLargeWidget(vData) {
        let vehicleData = vData;
        const wSize = 'extraLarge';
        // Defines the Widget Object
        const widget = new ListWidget();
        widget.backgroundGradient = this.FPW.getBgGradient();
        try {
            let mainStack = widget.addStack();
            mainStack.layoutVertically();
            mainStack.setPadding(0, 0, 0, 0);

            let contentStack = mainStack.addStack();
            contentStack.layoutHorizontally();

            //*****************
            //* First column
            //*****************
            let mainCol1 = await this.Widgets.createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

            // Vehicle Logo
            await this.Widgets.createVehicleImageElement(mainCol1, vehicleData, this.FPW.sizeMap[wSize].logoSize.w, this.FPW.sizeMap[wSize].logoSize.h);

            // Creates the Odometer, Fuel/Battery and Distance Info Elements
            await this.Widgets.createFuelRangeElements(mainCol1, vehicleData, wSize);

            // Creates Low-Voltage Battery Voltage Elements
            await this.Widgets.createBatteryElement(mainCol1, vehicleData, wSize);

            // Creates Oil Life Elements
            if (!vehicleData.evVehicle) {
                await this.Widgets.createOilElement(mainCol1, vehicleData, wSize);
            } else {
                // Creates EV Plug Elements
                await this.Widgets.createEvChargeElement(mainCol1, vehicleData, wSize);
            }

            contentStack.addSpacer();

            //************************
            //* Second column
            //************************
            let mainCol2 = await this.Widgets.createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

            // Creates the Lock Status Elements
            await this.Widgets.createLockStatusElement(mainCol2, vehicleData, wSize);

            // Creates the Door Status Elements
            await this.Widgets.createDoorElement(mainCol2, vehicleData, false, wSize);

            // Create Tire Pressure Elements
            await this.Widgets.createTireElement(mainCol2, vehicleData, wSize);

            // mainCol2.addSpacer(0);

            contentStack.addSpacer();

            //****************
            //* Third column
            //****************
            let mainCol3 = await this.Widgets.createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

            // Creates the Ignition Status Elements
            await this.Widgets.createIgnitionStatusElement(mainCol3, vehicleData, wSize);

            // Creates the Door Status Elements
            await this.Widgets.createWindowElement(mainCol3, vehicleData, false, wSize);

            // Creates the Vehicle Location Element
            await this.Widgets.createPositionElement(mainCol3, vehicleData, wSize);

            // mainCol3.addSpacer();

            contentStack.addSpacer();

            //**********************
            //* Refresh and error
            //*********************

            let statusRow = await this.Widgets.createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
            await this.Widgets.createStatusElement(statusRow, vehicleData, wSize);

            // This is the row displaying the time elapsed since last vehicle checkin.
            let timestampRow = await this.Widgets.createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            await this.Widgets.createTimeStampElement(timestampRow, vehicleData, wSize);
        } catch (e) {
            console.error(`createExtraLargeWidget() Error: ${e}`);
            this.Files.appendToLogFile(`createExtraLargeWidget() Error: ${e}`);
        }
        return widget;
    }
};
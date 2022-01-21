module.exports = class FPW_Widgets_Small {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
    }

    async createWidget(vData) {
        let vehicleData = vData;
        const wSize = 'small';
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
            let mainCol1 = await this.FPW.Widgets.createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

            // Vehicle Logo
            await this.FPW.Widgets.createVehicleImageElement(mainCol1, vehicleData, this.FPW.sizeMap[wSize].logoSize.w, this.FPW.sizeMap[wSize].logoSize.h);

            // Creates the Vehicle Logo, Odometer, Fuel/Battery and Distance Info Elements
            await this.FPW.Widgets.createFuelRangeElements(mainCol1, vehicleData, wSize);

            // Creates Low-Voltage Battery Voltage Elements
            await this.FPW.Widgets.createBatteryElement(mainCol1, vehicleData, wSize);

            // Creates Oil Life Elements
            if (!vehicleData.evVehicle) {
                await this.FPW.Widgets.createOilElement(mainCol1, vehicleData, wSize);
            } else {
                // Creates EV Plug Elements
                await this.FPW.Widgets.createEvChargeElement(mainCol1, vehicleData, wSize);
            }

            contentStack.addSpacer();

            //************************
            //* Second column
            //************************
            let mainCol2 = await this.FPW.Widgets.createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

            // Creates the Lock Status Elements
            await this.FPW.Widgets.createLockStatusElement(mainCol2, vehicleData, wSize);

            // Creates the Ignition Status Elements
            await this.FPW.Widgets.createIgnitionStatusElement(mainCol2, vehicleData, wSize);

            // Creates the Door Status Elements
            await this.FPW.Widgets.createDoorElement(mainCol2, vehicleData, true, wSize);

            // Creates the Door Status Elements
            await this.FPW.Widgets.createWindowElement(mainCol2, vehicleData, true, wSize);

            // mainCol2.addSpacer(0);

            contentStack.addSpacer();

            //**********************
            //* Refresh and error
            //*********************
            let statusRow = await this.FPW.Widgets.createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
            await this.FPW.Widgets.createStatusElement(statusRow, vehicleData, wSize);

            // This is the row displaying the time elapsed since last vehicle checkin.
            let timestampRow = await this.FPW.Widgets.createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
            await this.FPW.Widgets.createTimeStampElement(timestampRow, vehicleData, wSize);
        } catch (e) {
            console.error(`createWidget(small) Error ${e}`);
            this.FPW.Files.appendToLogFile(`createWidget(small) Error: ${e}`);
        }
        return widget;
    }
};
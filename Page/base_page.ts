const { expect } = require('@playwright/test')

GoToInterface = class GoToInterface {
    constructor(page) {
        this.page = page;
    }
}
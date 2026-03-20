const { expect } = require('@playwright/test')

exports.GoToInterface = class GoToInterface {
    constructor(page) {
        this.page = page;
    }
}
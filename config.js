"use strict";
/* eslint-disable @typescript-eslint/no-inferrable-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initConfig = exports.TestConfig = void 0;
const tslib_1 = require("tslib");
// Using https://github.com/bpatrik/typeconfig for configuration
const SubConfigClass_1 = require("typeconfig/src/decorators/class/SubConfigClass");
const ConfigPropoerty_1 = require("typeconfig/src/decorators/property/ConfigPropoerty");
/**
 * config.ts should not import any custom package (i.e.: that is not used by the main app)
 * */
let TestConfig = class TestConfig {
    constructor() {
        this.myFavouriteNumber = 42;
    }
};
exports.TestConfig = TestConfig;
tslib_1.__decorate([
    (0, ConfigPropoerty_1.ConfigProperty)({
        tags: {
            name: `Test config value`,
        },
        description: `This is just a description`,
    }),
    tslib_1.__metadata("design:type", Number)
], TestConfig.prototype, "myFavouriteNumber", void 0);
exports.TestConfig = TestConfig = tslib_1.__decorate([
    (0, SubConfigClass_1.SubConfigClass)({ softReadonly: true })
], TestConfig);
/**
 * (Optional) Setting the configuration template.
 * This function can be called any time. Only use it for setting config template.
 */
const initConfig = (extension) => {
    extension.setConfigTemplate(TestConfig);
};
exports.initConfig = initConfig;
//# sourceMappingURL=config.js.map
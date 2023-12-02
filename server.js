"use strict";
/* eslint-disable @typescript-eslint/no-inferrable-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUp = exports.init = exports.TestConfig = void 0;
const tslib_1 = require("tslib");
const UserDTO_1 = require("./node_modules/pigallery2-extension-kit/lib/common/entities/UserDTO");
// Including prod extension packages. You need to prefix them with ./node_modules
// lodash does not have types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const _ = require("./node_modules/lodash");
// Importing packages that are available in the main app (listed in the packages.json in pigallery2)
const typeorm_1 = require("typeorm");
const SubConfigClass_1 = require("typeconfig/src/decorators/class/SubConfigClass");
const ConfigPropoerty_1 = require("typeconfig/src/decorators/property/ConfigPropoerty");
// Using typeorm for ORM
let TestLoggerEntity = class TestLoggerEntity {
};
tslib_1.__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.PrimaryGeneratedColumn)({ unsigned: true }),
    tslib_1.__metadata("design:type", Number)
], TestLoggerEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], TestLoggerEntity.prototype, "text", void 0);
TestLoggerEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)()
], TestLoggerEntity);
// Using https://github.com/bpatrik/typeconfig for configuration
let TestConfig = class TestConfig {
    constructor() {
        this.myFavouriteNumber = 42;
    }
};
tslib_1.__decorate([
    (0, ConfigPropoerty_1.ConfigProperty)({
        tags: {
            name: `Test config value`,
        },
        description: `This is just a description`,
    }),
    tslib_1.__metadata("design:type", Number)
], TestConfig.prototype, "myFavouriteNumber", void 0);
TestConfig = tslib_1.__decorate([
    (0, SubConfigClass_1.SubConfigClass)({ softReadonly: true })
], TestConfig);
exports.TestConfig = TestConfig;
const init = async (extension) => {
    extension.Logger.debug(`My extension is setting up. name: ${extension.extensionName}, id: ${extension.extensionId}`);
    /**
     * (Optional) Setting the configuration template
     */
    extension.config.setTemplate(TestConfig);
    /**
     * (Optional) Adding custom SQL table
     */
    await extension.db.setExtensionTables([TestLoggerEntity]);
    /**
     * (Optional) Using prod package
     */
    extension.Logger.silly('lodash prod package works: ', _.defaults({ 'a': 1 }, { 'a': 3, 'b': 2 }));
    /**
     * (Optional) Implementing lifecycles events with MetadataLoader example
     * */
    extension.events.gallery.MetadataLoader
        .loadPhotoMetadata.before(async (input, event) => {
        extension.Logger.silly('onBefore: processing: ', JSON.stringify(input));
        // The return value of this function will be piped to the next before handler
        // or if no other handler then returned to the app
        return input;
        /*
        * (Optional) It is possible to prevent default run and return with the expected out output of the MetadataLoader.loadPhotoMetadata
        NOTE: if event.stopPropagation = true, MetadataLoader.loadPhotoMetadata.after won't be called.
        event.stopPropagation = true;
        return {
          size: {width: 1, height: 1},
          fileSize: 1,
          creationDate: 0
        } as PhotoMetadata;
        */
    });
    extension.events.gallery.MetadataLoader
        .loadPhotoMetadata.after(async (data) => {
        // Overrides the caption on all photos
        // NOTE: this needs db reset as MetadataLoader only runs during indexing time
        data.output.caption = extension.config.getConfig().myFavouriteNumber + '|PG2 sample extension:' + data.output.caption;
        // The return value of this function will be piped to the next after handler
        // or if no other handler then returned to the app
        return data.output;
    });
    /**
     * (Optional) Adding a REST api endpoint for logged-in users
     */
    extension.RESTApi.get.jsonResponse(['/sample'], UserDTO_1.UserRoles.User, async () => {
        // Inserting into our extension table and returning with the result
        const conn = await extension.db.getSQLConnection();
        conn.getRepository(TestLoggerEntity).save({ text: 'called /sample at: ' + Date.now() });
        return await conn.getRepository(TestLoggerEntity).find();
    });
    /**
     * (Optional) Creating a messenger. You can use it with TopPickJob to send photos
     */
    extension.messengers.addMessenger('SampleMessenger', 
    /**
     * (Optional) Creating messenger config (these values will be requested in the TopPickJob)
     * Note: Jobs cant use typeconfig yet, so it uses a different way for configuration
     */
    [{
            id: 'text',
            type: 'string',
            name: 'just a text',
            description: 'nothing to mention here',
            defaultValue: 'I hand picked these photos just for you:',
        }], {
        sendMedia: async (c, m) => {
            console.log('config got:', c.text);
            // we are not sending the photos anywhere, just logging them on the console.
            console.log(m);
        }
    });
};
exports.init = init;
const cleanUp = async (extension) => {
    extension.Logger.debug('Cleaning up');
    /*
    * No need to clean up changed through extension.db,  extension.RESTApi or extension.events
    * */
};
exports.cleanUp = cleanUp;
//# sourceMappingURL=server.js.map
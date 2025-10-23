"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUp = exports.init = void 0;
const tslib_1 = require("tslib");
const UserDTO_1 = require("./node_modules/pigallery2-extension-kit/lib/common/entities/UserDTO");
// Including prod extension packages. You need to prefix them with ./node_modules
// lodash does not have types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const _ = require("./node_modules/lodash");
// Importing packages that are available in the main app (listed in the packages.json in pigallery2)
const typeorm_1 = require("typeorm");
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
const init = async (extension) => {
    extension.Logger.debug(`My extension is setting up. name: ${extension.extensionName}, id: ${extension.extensionId}`);
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
     * (Optional) Adding a (non-clickable) button to all photos with 4+ stars
     */
    extension.ui.addMediaButton({
        name: 'Great Photo',
        svgIcon: {
            viewBox: '0 0 640 640',
            items: '<path d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"/></svg>'
        },
        metadataFilter: [{ field: 'rating', comparator: '>=', value: 4 }],
        alwaysVisible: true
    });
    /**
     * (Optional) Adding a button to all media elements to be able to delete them
     */
    extension.ui.addMediaButton({
        name: 'delete',
        svgIcon: {
            viewBox: '0 0 448 512',
            items: '<path d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z"/></svg>'
        },
        apiPath: 'delete',
        reloadContent: true,
        minUserRole: UserDTO_1.UserRoles.User,
        popup: {
            header: 'Deleting from DB',
            body: 'Are you sure?</b>This will delete the photo from the DB only. Next indexing will readd this photo.',
            buttonString: 'Delete',
            customFields: [
                {
                    id: 'confirm',
                    label: 'confirm deletion',
                    type: 'boolean',
                    defaultValue: false,
                    required: true
                }
            ]
        }
    }, async (params, body, user, media, repository) => {
        await repository.delete(media.id);
    });
    /**
     * (Optional) Adding a button to all media elements to be able to edit them
     */
    extension.ui.addMediaButton({
        name: 'edit',
        svgIcon: {
            viewBox: '0 0 512 512',
            items: '<path d="M352.9 21.2L308 66.1 445.9 204 490.8 159.1C504.4 145.6 512 127.2 512 108s-7.6-37.6-21.2-51.1L455.1 21.2C441.6 7.6 423.2 0 404 0s-37.6 7.6-51.1 21.2zM274.1 100L58.9 315.1c-10.7 10.7-18.5 24.1-22.6 38.7L.9 481.6c-2.3 8.3 0 17.3 6.2 23.4s15.1 8.5 23.4 6.2l127.8-35.5c14.6-4.1 27.9-11.8 38.7-22.6L412 237.9 274.1 100z"/></svg>'
        },
        apiPath: 'edit',
        reloadContent: true,
        skipVideos: true,
        popup: {
            header: 'Editing',
            body: 'Are you sure?',
            buttonString: 'Save',
            fields: [
                'title', 'caption', 'cameraData', 'positionData',
                'faces', 'size', 'creationDate', 'creationDateOffset', 'fileSize'
            ]
        }
    }, async (params, body, user, media, repository) => {
        // Update media entity with data from the body
        if (body.data) {
            // Update fields that are present in the body data
            if (body.data.title !== undefined) {
                media.metadata.title = body.data.title;
            }
            if (body.data.caption !== undefined) {
                media.metadata.caption = body.data.caption;
            }
            if (body.data.cameraData !== undefined) {
                media.metadata.cameraData = JSON.parse(body.data.cameraData);
            }
            if (body.data.positionData !== undefined) {
                media.metadata.positionData = JSON.parse(body.data.positionData);
            }
            if (body.data.faces !== undefined) {
                media.metadata.faces = JSON.parse(body.data.faces);
            }
            if (body.data.size !== undefined) {
                media.metadata.size = JSON.parse(body.data.size);
            }
            if (body.data.creationDate !== undefined) {
                media.metadata.creationDate = body.data.creationDate;
            }
            if (body.data.creationDateOffset !== undefined) {
                media.metadata.creationDateOffset = body.data.creationDateOffset;
            }
            if (body.data.fileSize !== undefined) {
                media.metadata.fileSize = body.data.fileSize;
            }
            // Save the updated media entity
            await repository.save(media);
            console.log('Media entity updated successfully');
        }
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
            id: 'text', // same as the keys in the function template above
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
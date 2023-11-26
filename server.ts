/* eslint-disable @typescript-eslint/no-inferrable-types */

// Including dev-kit interfaces. It is not necessary, only helps development with types.
// You need to prefix them with ./node_modules
import {IExtensionObject} from './node_modules/pigallery2-extension-kit';
import {PhotoMetadata} from './node_modules/pigallery2-extension-kit/lib/common/entities/PhotoDTO';
import {UserRoles} from './node_modules/pigallery2-extension-kit/lib/common/entities/UserDTO';

// Including prod extension packages. You need to prefix them with ./node_modules
// lodash does not have types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as _ from './node_modules/lodash';

// Importing packages that are available in the main app (listed in the packages.json in pigallery2)
import {Column, Entity, Index, PrimaryGeneratedColumn} from 'typeorm';
import {SubConfigClass} from 'typeconfig/src/decorators/class/SubConfigClass';
import {ConfigProperty} from 'typeconfig/src/decorators/property/ConfigPropoerty';

// Using typeorm for ORM
@Entity()
class TestLoggerEntity {
  @Index()
  @PrimaryGeneratedColumn({unsigned: true})
  id: number;

  @Column()
  text: string;
}


// Using https://github.com/bpatrik/typeconfig for configuration
@SubConfigClass({softReadonly: true})
export class TestConfig {
  @ConfigProperty({
    tags: {
      name: `Test config value`,
    },
    description: `This is just a description`,
  })
  myFavouriteNumber: number = 42;
}

export const init = async (extension: IExtensionObject<TestConfig>): Promise<void> => {

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
  extension.Logger.silly('lodash prod package works: ', _.defaults({'a': 1}, {'a': 3, 'b': 2}));

  /**
   * (Optional) Implementing lifecycles events with MetadataLoader example
   * */
  extension.events.gallery.MetadataLoader
    .loadPhotoMetadata.before(async (input, event) => {
    extension.Logger.silly('onBefore: processing: ', JSON.stringify(input));
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
    .loadPhotoMetadata.after(async (output: PhotoMetadata) => {
    // Overrides the caption on all photos
    // NOTE: this needs db reset as MetadataLoader only runs during indexing time
    output.caption = extension.config.getConfig().myFavouriteNumber + '|PG2 sample extension:' + output.caption;
    return output;
  });

  /**
   * (Optional) Adding a REST api endpoint for logged-in users
   */

  extension.RESTApi.get.jsonResponse(['/sample'], UserRoles.User, async () => {
    // Inserting into our extension table and returning with the result
    const conn = await extension.db.getSQLConnection();
    conn.getRepository(TestLoggerEntity).save({text: 'called /sample at: ' + Date.now()});
    return await conn.getRepository(TestLoggerEntity).find();
  });

  /**
   * (Optional) Creating a messenger. You can use it with TopPickJob to send photos
   */
  extension.messengers.addMessenger<{
    text: string // same as the Ids below in the config array
  }>('SampleMessenger',
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
    }],
    {
      sendMedia: async (c, m) => {
        console.log('config got:', c.text);
        // we are not sending the photos anywhere, just logging them on the console.
        console.log(m);
      }
    });
};

export const cleanUp = async (extension: IExtensionObject<TestConfig>): Promise<void> => {
  extension.Logger.debug('Cleaning up');
  /*
  * No need to clean up changed through extension.db,  extension.RESTApi or extension.events
  * */
};

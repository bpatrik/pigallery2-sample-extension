/* eslint-disable @typescript-eslint/no-inferrable-types */

// Using https://github.com/bpatrik/typeconfig for configuration
import {SubConfigClass} from 'typeconfig/src/decorators/class/SubConfigClass';
import {ConfigProperty} from 'typeconfig/src/decorators/property/ConfigPropoerty';

/**
 * config.ts should not import any custom package (i.e.: that is not used by the main app)
 * */


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

/**
 * (Optional) Setting the configuration template.
 * This function can be called any time. Only use it for setting config template.
 */
export const initConfig = (extension: { setConfigTemplate: (cfg: typeof TestConfig) => void }) => {
  extension.setConfigTemplate(TestConfig);
};

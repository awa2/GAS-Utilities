import AutoFoldering from './src/AutoFoldering';
import { process, EventStore } from './src/Process';
import { SubmitEvent } from './src/SubmitEvent';
import EventObject from './src/types/EventObject';
import ConfigTemplate from './src/Config';
import { md5sum, sha1sum, sha256sum, sha384sum, sha512sum } from './src/Hash';

export { AutoFoldering }
export { EventStore }
export { SubmitEvent }
export { EventObject }
export { process }
export { ConfigTemplate }
export { md5sum, sha1sum, sha256sum, sha384sum, sha512sum }
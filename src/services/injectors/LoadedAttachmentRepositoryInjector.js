'use strict';

import LoadedAttachmentRepository from '../../repositories/LoadedAttachmentRepository';
import Injector from './Injector';

class LoadedAttachmentRepositoryInjector extends Injector {
    inject(){
        return new LoadedAttachmentRepository();
    }
}

export default LoadedAttachmentRepositoryInjector;

'use strict';

import MessageCommitCheckpointRepository from '../../repositories/MessageCommitCheckpointRepository';
import Injector from './Injector';

class MessageCommitCheckpointRepositoryInjector extends Injector {
    inject(){
        return new MessageCommitCheckpointRepository();
    }
}

export default MessageCommitCheckpointRepositoryInjector;

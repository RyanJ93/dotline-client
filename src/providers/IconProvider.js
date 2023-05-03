'use strict';

import { faComment, faKey, faLock, faUsers, faCheck, faPaperPlane, faChevronDown, faPen, faTrash, faXmark, faChevronLeft, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import Provider from './Provider';

class IconProvider extends Provider {
    async run(){
        library.add(fas, faComment, faKey, faLock, faUsers, faCheck, faPaperPlane, faChevronDown, faPen, faTrash, faXmark, faChevronLeft, faEllipsisVertical);
    }
}

export default IconProvider;

'use strict';

import { faComment, faComments, faKey, faLock, faUsers, faCheck, faPaperPlane, faChevronDown, faPen, faTrash, faXmark, faChevronLeft, faEllipsisVertical, faMagnifyingGlass, faGear, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import Provider from './Provider';

class IconProvider extends Provider {
    async run(){
        library.add(fas, faComment, faComments, faKey, faLock, faUsers, faCheck, faPaperPlane, faChevronDown, faPen, faTrash, faXmark, faChevronLeft, faEllipsisVertical, faMagnifyingGlass, faGear, faRotateRight);
    }
}

export default IconProvider;

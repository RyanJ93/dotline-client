'use strict';

import { faComment, faComments, faKey, faLock, faUsers, faCheck, faPaperPlane, faChevronDown, faPen, faTrash, faXmark, faChevronLeft, faEllipsisVertical, faMagnifyingGlass, faGear, faRotateRight, faChevronCircleDown, faChevronCircleLeft, faChevronCircleRight, faPaperclip, faImage, faVideo, faHeadphones, faFile, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import Provider from './Provider';

class IconProvider extends Provider {
    async run(){
        library.add(fas, faComment, faComments, faKey, faLock, faUsers, faCheck, faPaperPlane, faChevronDown, faPen, faTrash, faXmark, faChevronLeft, faEllipsisVertical, faMagnifyingGlass, faGear, faRotateRight, faChevronCircleDown, faPaperclip, faImage, faVideo, faHeadphones, faFile, faLocationDot, faChevronCircleLeft, faChevronCircleRight);
    }
}

export default IconProvider;

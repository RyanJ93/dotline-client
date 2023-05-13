'use strict';

class DOMUtils {
    static scrollTop(element, offset){
        if ( typeof element.scrollTo === 'function' ){
            element.scrollTo({ top: offset, behavior: 'smooth' });
        }else{
            element.scrollTop = offset;
        }
    }
}

export default DOMUtils;

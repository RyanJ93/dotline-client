'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';

class DOMUtils {
    /**
     * Vertically scrolls the given HTML element to the given offset.
     *
     * @param {HTMLElement} element
     * @param {number} offset
     *
     * @throws {IllegalArgumentException} If an invalid HTML element is given.
     * @throws {IllegalArgumentException} If an invalid offset is given.
     */
    static scrollTop(element, offset){
        if ( !( element instanceof HTMLElement ) ){
            throw new IllegalArgumentException('Invalid HTML element.');
        }
        if ( offset === null || isNaN(offset) ){
            throw new IllegalArgumentException('Invalid offset.');
        }
        if ( typeof element.scrollTo === 'function' ){
            element.scrollTo({ top: offset, behavior: 'smooth' });
        }else{
            element.scrollTop = offset;
        }
    }

    /**
     * Returns current scroll offset from the given element's top side.
     *
     * @param {HTMLElement} element
     * @param {boolean} [toElementBottomSide=false]
     *
     * @throws {IllegalArgumentException} If an invalid HTML element is given.
     */
    static getScrollTop(element, toElementBottomSide = false){
        if ( !( element instanceof HTMLElement ) ){
            throw new IllegalArgumentException('Invalid HTML element.');
        }
        let scrollTop = isNaN(element.scrollTop) ? 0 : element.scrollTop;
        if ( toElementBottomSide === true ){
            scrollTop += parseInt(window.getComputedStyle(element).height);
        }
        return scrollTop;
    }

    /**
     * Scrolls the given element to its bottom.
     *
     * @param {HTMLElement} element
     *
     * @throws {IllegalArgumentException} If an invalid HTML element is given.
     */
    static scrollToBottom(element){
        if ( !( element instanceof HTMLElement ) ){
            throw new IllegalArgumentException('Invalid HTML element.');
        }
        const scrollTop = parseInt(window.getComputedStyle(element).height) + element.scrollHeight;
        return DOMUtils.scrollTop(element, scrollTop);
    }

    /**
     * Checks if the given element has been scrolled to its end.
     *
     * @param {HTMLElement} element
     * @param {number} delta
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid HTML element is given.
     * @throws {IllegalArgumentException} If an invalid delta is given.
     */
    static isScrolledToBottom(element, delta){
        if ( !( element instanceof HTMLElement ) ){
            throw new IllegalArgumentException('Invalid HTML element.');
        }
        if ( delta === null || isNaN(delta) ){
            throw new IllegalArgumentException('Invalid delta.');
        }
        const size = element.scrollHeight - element.offsetHeight;
        return element.scrollTop >= ( size - delta );
    }
}

export default DOMUtils;

'use strict';

class SearchResultEntry {
    #resultType;
    #entity;

    constructor(properties){
        this.#resultType = properties.resultType;
        this.#entity = properties.entity;
    }

    getResultType(){
        return this.#resultType;
    }

    getEntity(){
        return this.#entity;
    }
}

export default SearchResultEntry;

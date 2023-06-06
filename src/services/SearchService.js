'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import SearchResultEntryType from '../enum/SearchResultEntryType';
import SearchResultEntry from '../DTOs/SearchResultEntry';
import MessageService from './MessageService';
import UserService from './UserService';
import Service from './Service';

class SearchService extends Service {
    /**
     * Searches among all the stored messages and users for a given query.
     *
     * @param {string} query
     * @param {number} [userLimit=50]
     * @param {number} [messageLimit=50]
     *
     * @returns {Promise<SearchResultEntry[]>}
     *
     * @throws {IllegalArgumentException} If an invalid message limit is given.
     * @throws {IllegalArgumentException} If an invalid search query is given.
     * @throws {IllegalArgumentException} If an invalid user limit is given.
     */
    async search(query, userLimit = 10, messageLimit = 50){
        if ( messageLimit === null || isNaN(messageLimit) || messageLimit <= 0 ){
            throw new IllegalArgumentException('Invalid message limit.');
        }
        if ( userLimit === null || isNaN(userLimit) || userLimit <= 0 ){
            throw new IllegalArgumentException('Invalid user limit.');
        }
        if ( query === '' || typeof query !== 'string' ){
            throw new IllegalArgumentException('Invalid search query.');
        }
        const [ messageList, userList ] = await Promise.all([
            new MessageService().search(query, null, messageLimit),
            new UserService().searchByUsername(query, userLimit)
        ]), searchResultList = [];
        userList.forEach((user) => {
            searchResultList.push(new SearchResultEntry({ resultType: SearchResultEntryType.USER, entity: user }));
        });
        messageList.forEach((message) => {
            searchResultList.push(new SearchResultEntry({ resultType: SearchResultEntryType.MESSAGE, entity: message }));
        });
        return searchResultList;
    }
}

export default SearchService;

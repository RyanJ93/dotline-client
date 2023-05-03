'use strict';

import SearchResultEntryType from '../enum/SearchResultEntryType';
import SearchResultEntry from '../DTOs/SearchResultEntry';
import UserService from './UserService';
import Service from './Service';

class SearchService extends Service {
    async search(query){
        const userService = new UserService(), searchResultList = [];
        const userList = await userService.searchByUsername(query);
        userList.forEach((user) => {
            searchResultList.push(new SearchResultEntry({
                resultType: SearchResultEntryType.USER,
                entity: user
            }));
        });
        return searchResultList;
    }
}

export default SearchService;

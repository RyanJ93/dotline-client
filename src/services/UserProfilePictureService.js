'use strict';

import Request from '../facades/Request';
import Service from './Service';
import APIEndpoints from '../enum/APIEndpoints';
import IllegalArgumentException from '../exceptions/IllegalArgumentException';

class UserProfilePictureService extends Service {
    async changeProfilePicture(picture){
        if ( !( picture instanceof File ) ){
            throw new IllegalArgumentException('Invalid picture file.');
        }
        const response = await Request.put(APIEndpoints.USER_PROFILE_PICTURE_CHANGE, {
            picture: picture
        });

        console.log(response);
    }
}

export default UserProfilePictureService;

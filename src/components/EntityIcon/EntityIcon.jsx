'use strict';

import UserProfilePictureService from '../../services/UserProfilePictureService';
import { default as UserDTO } from '../../DTOs/User';
import StringUtils from '../../utils/StringUtils';
import styles from './EntityIcon.scss';
import User from '../../models/User';
import React from 'react';

class EntityIcon extends React.Component {
    #renderUserProfilePicture(){
        const PFPName = StringUtils.makePFPName(this.state.user.getComputedName());
        let renderedUserProfilePicture = <p className={styles.content}>{PFPName}</p>;
        if ( typeof this.state.userProfilePicture === 'string' ){
            const property = 'url(' + this.state.userProfilePicture + ')';
            renderedUserProfilePicture = <div className={styles.profilePicture} style={{ backgroundImage: property }}/>;
        }
        return renderedUserProfilePicture;
    }

    async #fetchUserProfilePicture(){
        let userProfilePicture = null;
        if ( this.state.user instanceof User ){
            userProfilePicture = await new UserProfilePictureService().getUserProfilePicture(this.state.user);
        }else if ( this.state.user instanceof UserDTO ){
            userProfilePicture = await new UserProfilePictureService().getProfilePictureFromUserDTO(this.state.user);
        }
        if ( userProfilePicture !== null ){
            this.setState((prev) => ({ ...prev, userProfilePicture: userProfilePicture }));
        }
    }

    constructor(props){
        super(props);

        this.state = {
            userProfilePicture: null,
            user: this.props.user,
            text: this.props.text
        };
    }

    componentDidMount(){
        this.#fetchUserProfilePicture().catch((ex) => console.error(ex));
    }

    render(){
        return (
            <div className={styles.entityIcon + ' bg-accent text-white'}>
                { typeof this.state.text === 'string' && <p className={styles.content}>{StringUtils.makePFPName(this.state.text)}</p> }
                { ( this.state.user instanceof User || this.state.user instanceof UserDTO ) && this.#renderUserProfilePicture() }
            </div>
        );
    }
}

export default EntityIcon;

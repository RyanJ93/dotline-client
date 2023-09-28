'use strict';

import MessageLocation from '../../../DTOs/MessageLocation';
import styles from './LocationMessageContent.scss';
import MessageContent from '../MessageContent';
import Maps from '../../../facades/Maps';
import React from 'react';

class LocationMessageContent extends MessageContent {
    #mapContainerRef = React.createRef();
    #coords = null;

    constructor(props){
        super(props);

        const messageLocation = MessageLocation.makeFromSerializedLocation(this.props.message.getContent());
        this.#coords = [messageLocation.getLatitude(), messageLocation.getLongitude()];
        this.#mapContainerRef.current.innerHTML = '';
    }

    async fetchAttachments(){
        Maps.generate(this.#mapContainerRef.current, this.#coords, 15, true);
    }

    render(){
        return (
            <div className={styles.mapContainer} ref={this.#mapContainerRef} />
        );
    }
}

export default LocationMessageContent;

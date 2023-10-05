'use strict';

import MessageLocation from '../../../DTOs/MessageLocation';
import styles from './LocationMessageContent.scss';
import MessageContent from '../MessageContent';
import Maps from '../../../facades/Maps';
import React from 'react';

class LocationMessageContent extends MessageContent {
    #mapContainerRef = React.createRef();

    async fetchAttachments(){
        this.#mapContainerRef.current.innerHTML = '';
        const messageLocation = MessageLocation.makeFromSerializedLocation(this.props.message.getContent());
        const coords = [messageLocation.getLatitude(), messageLocation.getLongitude()];
        Maps.generate(this.#mapContainerRef.current, coords, 15, true);
    }

    render(){
        return <div className={styles.mapContainer} ref={this.#mapContainerRef} />;
    }
}

export default LocationMessageContent;

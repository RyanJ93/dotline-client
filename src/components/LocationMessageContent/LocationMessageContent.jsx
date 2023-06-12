'use strict';

import MessageLocation from '../../DTOs/MessageLocation';
import styles from './LocationMessageContent.scss';
import Maps from '../../facades/Maps';
import React from 'react';

class LocationMessageContent extends React.Component {
    #mapContainerRef = React.createRef();

    componentDidMount(){
        const messageLocation = MessageLocation.makeFromSerializedLocation(this.props.message.getContent());
        const coords = [messageLocation.getLatitude(), messageLocation.getLongitude()];
        this.#mapContainerRef.current.innerHTML = '';
        Maps.generate(this.#mapContainerRef.current, coords, 15, true);
    }

    render(){
        return (
            <div className={styles.mapContainer} ref={this.#mapContainerRef} />
        );
    }
}

export default LocationMessageContent;
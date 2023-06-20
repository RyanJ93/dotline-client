'use strict';

import StickerPackService from '../../services/StickerPackService';
import StickerService from '../../services/StickerService';
import styles from './StickerPicker.scss';
import React from 'react';

class StickerPicker extends React.Component {
    #renderStickerPackList(){
        const renderedStickerPackList = this.state.stickerPackList.map((stickerPack) => {
            const backgroundImage = 'url(' + stickerPack.getCoverPictureURL() + ')';
            return (
                <li key={stickerPack.getID()} onClick={this._handleStickerPackClick} data-sticker-pack-id={stickerPack.getID()}>
                    <div className={styles.stickerPackCoverPicture} style={{ backgroundImage: backgroundImage }} />
                    <p className={styles.stickerPackName}>{stickerPack.getName()}</p>
                </li>
            );
        });
        return <ul className={styles.stickerPackList}>{renderedStickerPackList}</ul>;
    }

    #renderStickerList(){
        const renderedStickerList = [];
        for ( const stickerID in this.state.stickers ){
            let contentURL = this.state.stickers[stickerID].getContentURL(), content;
            if ( this.state.stickers[stickerID].getAnimated() ){
                content = <video className={styles.stickerContent} autoPlay={true} controls={false} loop={true} src={contentURL} />
            }else{
                content = <div className={styles.stickerContent} style={{ backgroundImage: 'url(' + contentURL + ')' }} />
            }
            renderedStickerList.push(
                <li key={stickerID} onClick={this._handleStickerClick} data-sticker-id={stickerID}>
                    <p className={styles.emoji}>{this.state.stickers[stickerID].getEmoji()}</p>
                    {content}
                </li>
            );
        }
        return <ul className={styles.stickerList}>{renderedStickerList}</ul>;
    }

    #getActiveViewName(){
        let activeViewName = 'sticker-pack-picker';
        if ( this.state.stickerPackID !== null ){
            activeViewName = this.state.stickers === null ? 'loader' : 'sticker-picker';
        }
        return activeViewName;
    }

    _handleStickerPackClick(event){
        const stickerPackID = event.target.closest('li[data-sticker-pack-id]').getAttribute('data-sticker-pack-id');
        this.setState((prev) => ({ ...prev, stickerPackID: stickerPackID, stickers: null }), () => {
            this.loadStickerPack();
        });
    }

    _handleStickerClick(event){
        const stickerID = event.target.closest('li[data-sticker-id]').getAttribute('data-sticker-id');
        if ( typeof this.props.onStickerSelect === 'function' ){
            this.props.onStickerSelect(this.state.stickers[stickerID]);
        }
    }

    _handleCloseStickerPack(){
        this.setState((prev) => ({ ...prev, stickerPackID: null, stickers: null }));
    }

    _handleStickerPackReload(){
        this.loadStickerPack(true);
    }

    constructor(props){
        super(props);

        this.state = { stickerPackList: [], stickerPackID: null, stickers: null };
        this._handleStickerPackReload = this._handleStickerPackReload.bind(this);
        this._handleStickerPackClick = this._handleStickerPackClick.bind(this);
        this._handleCloseStickerPack = this._handleCloseStickerPack.bind(this);
        this._handleStickerClick = this._handleStickerClick.bind(this);
    }

    componentDidMount(){
        const stickerPackList = new StickerPackService().getStickerPackList() ?? [];
        this.setState((prev) => ({ ...prev, stickerPackList: stickerPackList }));
    }

    async loadStickerPack(force = false){
        if ( this.state.stickerPackID !== null ){
            let stickerService = new StickerService(), stickers = Object.create(null), stickerList;
            if ( force === true ){
                this.setState((prev) => ({ ...prev, stickers: null }));
                stickerList = await stickerService.fetchStickerPack(this.state.stickerPackID);
            }else{
                stickerList = await stickerService.getStickers(this.state.stickerPackID);
            }
            stickerList.forEach((sticker) => stickers[sticker.getID()] = sticker);
            this.setState((prev) => ({ ...prev, stickers: stickers }));
        }
    }

    reset(){
        this.setState((prev) => ({ ...prev, stickerPackID: null, stickers: null }));
        return this;
    }

    render(){
        const activeViewName = this.#getActiveViewName();
        return (
            <div className={styles.stickerPicker}>
                <div className={styles.views}>
                    <div className={styles.view} data-active={activeViewName === 'sticker-pack-picker'}>
                        {this.#renderStickerPackList()}
                    </div>
                    <div className={styles.view} data-active={activeViewName === 'sticker-picker'}>
                        <div className={styles.controls}>
                            <div className={styles.controlWrapper}>
                                <a onClick={this._handleCloseStickerPack}>Close pack</a>
                            </div>
                            <div className={styles.controlWrapper}>
                                <a onClick={this._handleStickerPackReload}>Reload pack</a>
                            </div>
                        </div>
                        {this.#renderStickerList()}
                    </div>
                    <div className={styles.view} data-active={activeViewName === 'loader'}>
                        <div className={styles.controls}>
                            <div className={styles.controlWrapper}>
                                <a onClick={this._handleCloseStickerPack}>Close pack</a>
                            </div>
                        </div>
                        <div className={styles.loader} />
                        <p className={styles.label}>Loading sticker pack...</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default StickerPicker;

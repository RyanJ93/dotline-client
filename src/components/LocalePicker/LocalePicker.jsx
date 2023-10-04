'use strict';

import Locale from '../../facades/Locale';
import styles from './LocalePicker.scss';
import React from 'react';

class LocalePicker extends React.Component {
    #renderLocaleList(){
        const localeList = Locale.getSupportedLocales().map((localeProperties) => {
            return <li data-code={localeProperties.code} key={localeProperties.code} onClick={this._handleLocaleSelection}>{localeProperties.label}</li>;
        });
        return <ul>{localeList}</ul>;
    }

    _handleLocaleSelection(event){
        this.setState((prev) => ({ ...prev, pickerVisible: false }));
        const code = event.target.getAttribute('data-code');
        Locale.changeLanguage(code);
    }

    _handlePickerShow(){
        this.setState((prev) => ({ ...prev, pickerVisible: true }));
    }

    _handlePickerHide(){
        this.setState((prev) => ({ ...prev, pickerVisible: false }));
    }

    constructor(props){
        super(props);

        this._handleLocaleSelection = this._handleLocaleSelection.bind(this);
        this._handlePickerShow = this._handlePickerShow.bind(this);
        this._handlePickerHide = this._handlePickerHide.bind(this);
        this.state = { pickerVisible: false };
    }

    render(){
        const currentLocaleProperties = Locale.getCurrentLocaleProperties();
        const url = 'url(' + currentLocaleProperties?.icon + ')';
        return currentLocaleProperties === null ? null : (
            <div className={styles.localePicker}>
                <div className={styles.icon + ' icon'} style={{ backgroundImage: url }} onClick={this._handlePickerShow}></div>
                <div className={styles.picker + ' bg-black'} data-show={this.state.pickerVisible}>{this.#renderLocaleList()}</div>
                <div className={styles.overlay} data-show={this.state.pickerVisible} onClick={this._handlePickerHide}></div>
            </div>
        );
    }
}

export default LocalePicker;

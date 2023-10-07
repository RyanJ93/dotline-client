'use strict';

import UserSettingsService from '../../../services/UserSettingsService';
import SubmitButton from '../../SubmitButton/SubmitButton';
import styles from './UserSettingsSection.scss';
import { withTranslation } from 'react-i18next';
import Locale from '../../../facades/Locale';
import Event from '../../../facades/Event';
import React from 'react';

class UserSettingsSection extends React.Component {
    #submitButtonRef = React.createRef();
    #localeSelectRef = React.createRef();
    #themeSelectRef = React.createRef();

    async #submit(){
        const locale = this.#localeSelectRef.current.value, { t } = this.props;
        const successMessage = t('userSettingsSection.label.settingsSaved');
        const saveLabel = t('userSettingsSection.label.save');
        const theme = this.#themeSelectRef.current.value;
        this.#submitButtonRef.current.setStatus('loading');
        try{
            const userSettingsService = new UserSettingsService();
            await userSettingsService.update(locale, theme);
            userSettingsService.applyLocalSettings();
            this.#submitButtonRef.current.setTemporaryStatus('completed', successMessage, saveLabel);
        }catch(ex){
            this.#submitButtonRef.current.setTemporaryStatus('error', saveLabel, saveLabel);
            throw ex;
        }
    }

    #renderLocaleSelect(){
        const optionList = Locale.getSupportedLocales().map((localeProperties) => {
            return <option value={localeProperties.code} key={localeProperties.code}>{localeProperties.label}</option>;
        });
        return <select ref={this.#localeSelectRef}>{optionList}</select>;
    }

    _handleSubmit(event){
        event.preventDefault();
        event.stopPropagation();
        this.#submit();
    }

    constructor(props){
        super(props);

        this._handleSubmit = this._handleSubmit.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('userSettingsLoaded', (userSettings) => {
            this.#localeSelectRef.current.value = userSettings.getLocale();
            this.#themeSelectRef.current.value = userSettings.getTheme();
        });
    }

    render(){
        const { t } = this.props;
        return (
            <div className={styles.section}>
                <form className={styles.content} onSubmit={this._handleSubmit}>
                    <p className={styles.sectionTitle + ' text-primary'}>{t('userSettingsSection.title')}</p>
                    <div className={styles.field}>{this.#renderLocaleSelect()}</div>
                    <div className={styles.field}>
                        <select ref={this.#themeSelectRef}>
                            <option value={'auto'}>{t('userSettingsSection.theme.auto')}</option>
                            <option value={'dark'}>{t('userSettingsSection.theme.dark')}</option>
                            <option value={'light'}>{t('userSettingsSection.theme.light')}</option>
                        </select>
                    </div>
                    <div className={styles.submit}>
                        <SubmitButton value={t('userSettingsSection.label.save')} ref={this.#submitButtonRef} />
                    </div>
                </form>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(UserSettingsSection);

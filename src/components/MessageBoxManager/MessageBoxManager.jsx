'use strict';

import MessageBox from '../MessageBox/MessageBox';
import React from 'react';

class MessageBoxManager extends React.Component {
    #renderMessageBoxes(){
        const renderedMessageBoxes = [];
        for ( const [ messageBoxID, properties ] of this.state.messageBoxes ){
            const { title, text, type, onClose } = properties;
            renderedMessageBoxes.push(
                <MessageBox key={messageBoxID} id={messageBoxID} onClose={onClose} onCanBeDisposed={this._handleCanBeDisposed} text={text} title={title} type={type}></MessageBox>
            );
        }
        return <React.Fragment>{renderedMessageBoxes}</React.Fragment>;
    }

    _handleCanBeDisposed(id){
        this.state.messageBoxes.delete(id);
        this.forceUpdate();
    }

    constructor(props){
        super(props);

        this._handleCanBeDisposed = this._handleCanBeDisposed.bind(this);
        this.state = { messageBoxes: new Map() };
    }

    componentDidMount(){
        window.showMessageBox = (text, title, type = 'info') => this.show(text, title, type);
    }

    show(text, title = null, type = 'info'){
        return new Promise((resolve) => {
            this.state.messageBoxes.set(+new Date(), {
                onClose: (result) => resolve(result),
                title: title,
                text: text,
                type: type
            });
            this.forceUpdate();
        });
    }

    render(){
        return (
            <div>
                {this.#renderMessageBoxes()}
            </div>
        );
    }
}

export default MessageBoxManager;

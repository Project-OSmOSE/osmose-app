import React from "react";
import {v4 as uuidv4} from 'uuid';

type FlashMessages = {
    flashMessages: Array
}

const FlashMessage = (props : FlashMessages) => {

    let result = [];
    if (props.flashMessages.length > 0) {
        console.log(props);
        props.flashMessages.forEach(element => {
            result.push(< div className = "alert alert-danger" key = {
                uuidv4()
            }
            role = "alert" > <p> {
                element.message
        } < /p> </div >);
    });
    return <div> {
        result
    } < /div>;
    } else {        return null
    }
}
export default FlashMessage;

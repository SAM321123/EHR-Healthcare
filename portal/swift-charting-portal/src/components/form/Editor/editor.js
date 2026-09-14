import React from 'react'
import EditorPreview from './editorPreview';
import MainEditor from './index';
const Editor = (props) => {
    const {preview} = props || {};
    if(preview){
       return <EditorPreview {...props}/>
    }
    return <MainEditor {...props}/>

}

export default React.memo(Editor)
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable no-mixed-spaces-and-tabs */
/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class ErrorPlugin extends Plugin {
    static pluginName = 'ErrorPlugin';

     hasError = false;

     showErrorOnChange = false;

     tempData = '';

    constructor( editor ) {
    	super( editor );
    	this.showErrorOnChange = editor.config.get( 'showErrorOnChange' ) || false;
    }

 init() {
    	const {editor} = this;
    	const handleEditorError = () => {
            this.tempData=editor.getData()
    		if ( this.showErrorOnChange ) {
    			this.setErrorClass( editor.getData().trim() === '' );
    		} else if ( this.hasError && editor.getData().trim() === '' ) {
    				this.setErrorClass( true );
    			} else {
    				this.setErrorClass( false );
    			}
    	};

    	editor.model.document.on( 'change:data', handleEditorError );
    	editor.editing.view.document.on( 'blur', handleEditorError );
    	editor.editing.view.document.on( 'focus', handleEditorError );
    }

    // Renamed to setErrorClass and changed the parameter to a boolean value
     setErrorClass( hasError ) {
    	const {view} = this.editor.editing;
    	const editableElement = view.domRoots.get( 'main' );
        setTimeout(()=>{
            if ( editableElement ) {
                if ( hasError ) {
                    this.hasError = true;
                    editableElement.classList.add( 'ck-my-error' );
                } else {
                    this.hasError = false;
                    editableElement.classList.remove( 'ck-my-error' );
                }
            }
        },0)
    
    }
}

/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { createDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { ViewCollection } from '@ckeditor/ckeditor5-ui';

export default class CustomDropdownPlugin extends Plugin {
	 options;

	 dropdownView;

	 static pluginName = 'DropDownPlugin';

	constructor( editor ) {
		super( editor );
		this.options = editor.config.get( 'customDropdown.options' ) || [];
	}

	 init() {
		const {editor} = this;
		try{
			this.options=JSON.parse(this.options);
			if ( this.options && this.options.length > 0 ) {
				// Define the options for the custom dropdown
					const dropdownOptions = this.createDropdownOptions( this.options );
		
					// Create a new ViewCollection<View<HTMLElement>> and add ButtonViews from dropdownOptions
					const viewCollection = new ViewCollection();
					for ( const buttonView of dropdownOptions ) {
						viewCollection.add( buttonView );
					}
					// Create the custom dropdown
					 this.dropdownView = createDropdown( editor.locale );
					addToolbarToDropdown( this.dropdownView, viewCollection );
		
					// Set the dropdown properties
					this.dropdownView.buttonView.set( {
						label: 'Add Field',
						tooltip: true,
						withText: true
					} );
		
					// Set the panel positioning
					this.dropdownView.panelPosition = 'se';
		
					// Add a custom class to the dropdown
					this.dropdownView.extendTemplate( {
						attributes: {
							class: 'custom-horizontal-dropdown'
						}
					} );
		
					// Add the custom dropdown to the toolbar
					editor.ui.componentFactory.add( 'customDropdown', () => {
						const view = this.dropdownView;
						return view;
					} );
					this.dropdownView.isOpen = true;
					this.dropdownView.isOpen = false;
				}
		}catch(e){
			console.log("@error",e)
		}	
	
	}

	 createDropdownOptions( options ){
		const dropdownOptions = new Collection();

		options.forEach( ( option ) => {
			const button = new ButtonView( this.editor.locale );
			button.set( {
				label: option.label,
				withText: true,
				tooltip: true
			} );
			button.on( 'execute', () => {
				let {token} = option;
				token=`[${token}]`
				this.handleConcatenation( token );
			} );
			dropdownOptions.add( button );
		} );

		return dropdownOptions;
	}

	updateDropDownOptions(options) {
		try{
		options=JSON.parse(options || '[]');
		const {editor} = this;
	
		if (options && options.length > 0) {
			// Create new dropdown options
			const dropdownOptions = this.createDropdownOptions(options);
	
			if (this?.dropdownView?.panelView) {
				// Get the list view from the dropdown panel.
				const listView = this.dropdownView.panelView.children.first;
	
				// Remove all old options
				listView.items.clear();
	
				// Add new options
				for (const buttonView of dropdownOptions) {
					listView.items.add(buttonView);
				}
	
				// Force the UI to update
				editor.ui.update();
			} else {
				console.error('Dropdown view is not initialized');
			}
		}
		}catch(e){
			// @Todo: Piyush need some clearification on error handling
			console.log("error",e)
		}
		
	}

	 handleConcatenation( textToInsert ) {
		const {editor} = this;
		const {model} = editor;
		const {selection} = model.document;
		const range = selection.getFirstRange();

		if ( range ) {
			const startNode = range.end;
			if ( startNode ) {
				const insertPosition = model.createPositionAt( startNode, startNode.offset );

				model.change( writer => {
					writer.insertText( textToInsert, insertPosition );
				} );
			}
		}
	}
}

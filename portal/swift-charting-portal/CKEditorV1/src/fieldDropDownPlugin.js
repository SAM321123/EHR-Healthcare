/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-restricted-syntax */
/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import {
  createDropdown,
  addToolbarToDropdown,
} from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { ViewCollection } from '@ckeditor/ckeditor5-ui';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import {toWidget} from "@ckeditor/ckeditor5-widget/src/utils";

export default class FieldDropDownPlugin extends Plugin {
  options;

  showInputField;

  dropdownView;

  static pluginName = 'FieldDropDownPlugin';

  constructor(editor) {
    super(editor);
    this.options =
      '[{"label":"Check Box","token":"checkbox"},{"label":"Text Box","token":"input"}]';
    this.showInputField = editor.config.get('showInputField');
  }

  init() {
    const { editor } = this;

    editor.model.schema.register('span', {
      allowAttributes: ['class'],
      isInline: true,
      isObject: true,
      allowIn: '$block',
      allowContent: false,
    });
    if (this.showInputField) {
      editor.conversion.for('upcast').elementToElement({
        view: 'span',
        model: (viewElement, { writer }) =>
          writer.createElement('span', viewElement.getAttributes()),
      });

      editor.conversion.for('dataDowncast').elementToElement({
        model: 'span',
        view: (modelElement, { writer }) =>
          writer.createEmptyElement('span', modelElement.getAttributes()),
      });

      editor.conversion.for('editingDowncast').elementToElement({
        model: 'span',
        view: (modelElement, { writer }) => {
            const widgetElement = writer.createContainerElement('span', modelElement.getAttributes());
            return toWidget(widgetElement, writer);
        }
    });
    }
    // Upcast conversion
    editor.conversion.for('upcast').elementToElement({
      model: 'span',
      view: {
        name: 'span',
        classes: ['consent-checkbox-container', 'consent-input-container'],
      },
    });

    // Downcast conversion
    editor.conversion.for('downcast').elementToElement({
      model: 'span',
      view: (modelElement, { writer }) => {
        const className = modelElement.getAttribute('class');
        return writer.createContainerElement('span', {
          class: className,
        });
      },
    });

    try {
      this.options = JSON.parse(this.options);
      if (this.options && this.options.length > 0 && this.showInputField) {
        // Define the options for the custom dropdown
        const dropdownOptions = this.createDropdownOptions(this.options);

        // Create a new ViewCollection<View<HTMLElement>> and add ButtonViews from dropdownOptions
        const viewCollection = new ViewCollection();
        for (const buttonView of dropdownOptions) {
          viewCollection.add(buttonView);
        }
        // Create the custom dropdown
        this.dropdownView = createDropdown(editor.locale);
        addToolbarToDropdown(this.dropdownView, viewCollection);

        // Set the dropdown properties
        this.dropdownView.buttonView.set({
          label: 'Add Field',
          tooltip: true,
          withText: true,
        });

        // Set the panel positioning
        this.dropdownView.panelPosition = 'se';

        // Add a custom class to the dropdown
        this.dropdownView.extendTemplate({
          attributes: {
            class: 'custom-horizontal-dropdown',
          },
        });

        // Add the custom dropdown to the toolbar
        editor.ui.componentFactory.add('fieldDropDown', () => {
          const view = this.dropdownView;
          return view;
        });
        this.dropdownView.isOpen = true;
        this.dropdownView.isOpen = false;
      }
    } catch (e) {
      // @Todo:Piyush
    }
  }

  createDropdownOptions(options) {
    const dropdownOptions = new Collection();

    options.forEach((option) => {
      const button = new ButtonView(this.editor.locale);
      button.set({
        label: option.label,
        withText: true,
        tooltip: true,
      });
      button.on('execute', () => {
        const { token } = option;
        this.handleConcatenation(token);
      });
      dropdownOptions.add(button);
    });

    return dropdownOptions;
  }

  updateDropDownOptions(options) {
    try {
      options = JSON.parse(options);
      const { editor } = this;

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
    } catch (e) {
      // @Todo: Piyush need some clearification on error handling
    }
  }

  // Function to create a button.
  createButton(label, className, onClick) {
    const button = new ButtonView(this.editor.locale);
    button.set({ label, withText: true, class: className });
    button.on('execute', onClick);
    return button;
  }

  createBalloon(contents) {
    const balloon = new BalloonPanelView(this.editor.locale);
    contents.forEach((content) => balloon.content.add(content));
    return balloon;
  }

  handleConcatenation(textToInsert) {
    const { editor } = this;

    let insertPosition;
    editor.model.change((writer) => {
      const fieldElement = writer.createElement('span', {
        class: `consent-${textToInsert}-container`,
      });
  
      // Add space before and after the span element
      const spaceBefore = writer.createText(' ');
      const spaceAfter = writer.createText(' ');
  
      // Get the current range and create an insertion position at the end.
      const range = editor.model.document.selection.getFirstRange();
      insertPosition = editor.model.createPositionAt(range.end, 'after');
  
      // Insert spaces and then the span at the current cursor position.
      writer.insert(spaceBefore, insertPosition);
      writer.insert(fieldElement, insertPosition);
      writer.insert(spaceAfter, insertPosition);
    });
  }
}


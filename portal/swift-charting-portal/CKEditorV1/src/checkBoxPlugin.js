/* eslint-disable import/no-extraneous-dependencies */
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class CheckboxPlugin extends Plugin {
    init() {
        const {editor} = this;

        // Schema registration
editor.model.schema.register('span', {
    allowWhere: '$text',
    allowContentOf: '$block',
    allowAttributes: ['class'],
    isObject: true,
    isBlock: false
});

        // Upcast conversion
        editor.conversion.for('upcast').elementToElement({
            model: 'span',
            view: {
                name: 'span',
                classes: 'consent-checkbox-container'
            }
        });

        // Downcast conversion
        editor.conversion.for('downcast').elementToElement({
            model: 'span',
            view: {
                name: 'span',
                classes: 'consent-checkbox-container'
            }
        });

        editor.ui.componentFactory.add('checkbox', locale => {
            const view = new ButtonView(locale);

            view.set({
                label: 'Insert Checkbox',
                // icon: checkboxIcon,
                tooltip: true
            });

            // Callback executed once the image is clicked.
            view.on('execute', () => {
                editor.model.change(writer => {
                    const checkbox = writer.createElement('span', {
                        'class': 'consent-checkbox-container'
                    });
            
                    // Get the current range and create an insertion position at the end.
                    const range = editor.model.document.selection.getFirstRange();
                    const insertPosition = editor.model.createPositionAt(range.end, 'after');
            
                    // Insert the checkbox at the current cursor position.
                    writer.insert(checkbox, insertPosition);
                });
            });
            return view;
        });
    }
}
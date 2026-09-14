import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class InsertKeywordsPlugin extends Plugin {
    static get pluginName() {
        return 'InsertKeywordsPlugin';
    }

    init() {
        const editor = this.editor;

        editor.insertHeading = (headingText) => {
            const { model } = editor;

            model.change(writer => {
                // Insert a new paragraph for the heading
                const headingElement = writer.createElement('paragraph');
                const boldText = writer.createText(headingText, { bold: true });
                writer.append(boldText, headingElement);
                writer.append(headingElement, model.document.getRoot(), 'end');
                const insertPosition = writer.createPositionAfter(headingElement,'end');
                writer.setSelection(insertPosition);
                writer.removeSelectionAttribute('bold');
            });
        };

        editor.insertContent = (contentText) => {
            const { model } = editor;

            model.change(writer => {
                // Get the current selection
                const currentPosition = model.document.selection.getFirstPosition();

                // Insert content at the current cursor position
                writer.insertText(contentText, currentPosition);
            });
        };
    }
}

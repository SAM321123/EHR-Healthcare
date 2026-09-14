/* eslint-disable import/extensions */
/* eslint-disable import/no-extraneous-dependencies */
/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage.js';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink.js';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';
import HtmlComment from '@ckeditor/ckeditor5-html-support/src/htmlcomment.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog.js';
import { SimpleUploadAdapter } from '@ckeditor/ckeditor5-upload';
import ErrorPlugin from './errorPlugin';
import CustomDropdownPlugin from './dropDownPlugin';
import FieldDropDownPlugin from './fieldDropDownPlugin';
import InsertKeywordsPlugin from './keywordPlugin';

class Editor extends ClassicEditor {}

// Plugins to include in the build.
Editor.builtinPlugins = [
	Alignment,
	AutoImage,
	AutoLink,
	Autosave,
	BlockQuote,
	Bold,
	CloudServices,
	Essentials,
	FindAndReplace,
	FontColor,
	FontFamily,
	FontSize,
	GeneralHtmlSupport,
	Heading,
	Highlight,
	HtmlComment,
	Image,
	ImageInsert,
	ImageResize,
	ImageStyle,
	ImageUpload,
	Indent,
	Italic,
	Link,
	LinkImage,
	List,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	TextTransformation,
	Underline,
	ErrorPlugin,
	CustomDropdownPlugin,
	SimpleUploadAdapter,
	FieldDropDownPlugin,
	InsertKeywordsPlugin,

];

// Editor configuration.
Editor.defaultConfig = {
	toolbar: {
		items: [
			'undo',
			'redo',
			'heading',
			'fontSize',
			'fontColor',
			'fontFamily',
			'|',
			'bold',
			'italic',
			'link',
			'underline',
			'alignment',
			'|',
			'bulletedList',
			'numberedList',
			'|',
			'findAndReplace',
			'imageInsert',
			// 'insertTable',
			'customDropdown',
			'fieldDropDown'
		]
	},
	language: 'en',
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableCellProperties'
		]
	}
};

export default { Editor, EditorWatchdog };

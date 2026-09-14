/* eslint-disable import/extensions */
/* eslint-disable import/no-extraneous-dependencies */
/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import HtmlComment from '@ckeditor/ckeditor5-html-support/src/htmlcomment';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog';
import { SimpleUploadAdapter } from '@ckeditor/ckeditor5-upload';
import ErrorPlugin from './errorPlugin';
import CustomDropdownPlugin from './dropDownPlugin';

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
	SimpleUploadAdapter

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
			'|',
			'bulletedList',
			'numberedList',
			'|',
			'findAndReplace',
			'imageInsert',
			'insertTable',
			'customDropdown',
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

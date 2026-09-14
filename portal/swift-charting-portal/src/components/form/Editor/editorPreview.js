import React from 'react';
import Box from 'src/components/Box';
import { decodeHtml } from 'src/lib/utils';
import { v4 } from 'uuid';

const handleRenderOutput = (data) => {
  // Convert the HTML string to a DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = data;

  // Find and replace instances of the specific span elements
  const spanElements = tempDiv.querySelectorAll(
    '.consent-checkbox-container, .consent-input-container'
  );
  spanElements.forEach((spanElement) => {
    const inputElement = document.createElement('input');
    const spanClass = spanElement.classList.contains('consent-checkbox-container')
      ? 'checkbox'
      : 'text';
    inputElement.type = spanClass;
    spanElement.classList.forEach((cls) => {
      inputElement.classList.add(cls);
    });
    spanElement.parentNode.replaceChild(inputElement, spanElement);
  });

  // Return the modified HTML content
  return tempDiv.innerHTML;
};

const EditorPreview = (props) => {
  const data = decodeHtml(props.editorValue ||''); // Replace this with the actual HTML string you need to render
  const preview = handleRenderOutput(data);

  return (
    <div style={{display:'flex',flex:1}}  key={v4()}>{data && <div
    key={v4()}
      style={{ display:'flex',flexDirection:'column',flex:1 }}
      dangerouslySetInnerHTML={{ __html: preview }}
    />}
    </div>
  );
};

export default React.memo(EditorPreview,()=>true);

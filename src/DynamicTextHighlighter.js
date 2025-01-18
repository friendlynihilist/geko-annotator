import React, { useState } from 'react';

const DynamicTextHighlighter = ({ text, nerResults }) => {
    const [highlights, setHighlights] = useState([]); // Store user-generated highlights
    const [activeHighlight, setActiveHighlight] = useState(null); // Currently clicked highlight
  
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
  
      if (selectedText) {
        const range = selection.getRangeAt(0);
        const startOffset = range.startOffset;
        const endOffset = range.endOffset;
  
        // Avoid adding duplicate highlights
        if (!highlights.some((h) => h.text === selectedText)) {
          setHighlights([
            ...highlights,
            {
              id: `highlight-${highlights.length + 1}`,
              text: selectedText,
              startOffset,
              endOffset,
            },
          ]);
        }
  
        // Clear the selection
        selection.removeAllRanges();
      }
    };
  
    const handleClickHighlight = (highlight) => {
      setActiveHighlight(highlight);
    };
  
    // Highlight the loaded text with NER results and user-generated highlights
    const highlightedText = () => {
      let highlighted = text;
  
      // Apply NER highlights
      nerResults.forEach((result) => {
        const regex = new RegExp(`(${result.text})`, 'gi');
        highlighted = highlighted.replace(
          regex,
          `<span style="
            background-color: lightyellow;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 2px 4px;
            margin: 0 2px;
            display: inline-block;"
          >
            ${result.text}
          </span>`
        );
      });
  
      // Apply user-generated highlights
      highlights.forEach((highlight) => {
        const regex = new RegExp(`(${highlight.text})`, 'gi');
        highlighted = highlighted.replace(
          regex,
          `<span style="
            background-color: lightblue;
            border: 1px solid #007bff;
            border-radius: 4px;
            padding: 2px 4px;
            margin: 0 2px;
            display: inline-block;
            cursor: pointer;"
            onClick={() => setActiveHighlight(${highlight.id})}
          >
            ${highlight.text}
          </span>`
        );
      });
  
      return highlighted;
    };
  
    return (
      <div
        onMouseUp={handleTextSelection}
        style={{
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6',
          padding: '10px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
        }}
        dangerouslySetInnerHTML={{ __html: highlightedText() }}
      >
      </div>
    );
  };
  

export default DynamicTextHighlighter;
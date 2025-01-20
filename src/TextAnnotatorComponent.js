import React, { useState, useRef } from "react";

const TextAnnotatorComponent = () => {
  const [annotations, setAnnotations] = useState([]); // Store annotation details
  const [popupData, setPopupData] = useState(null); // Store popup data for editing
  const containerRef = useRef(null); // Reference to the main container

  const config = {
    dropdowns: [
      {
        label: "Category",
        options: ["Person", "Place", "Event", "Organization"],
      },
      {
        label: "Relevance",
        options: ["High", "Medium", "Low"],
      },
    ],
  };

  const content = [
    {
      id: 1,
      text: "This is a sample text. Highlight parts of this text to begin annotating.",
    },
    {
      id: 2,
      text: "You can select different sections of the text, and later we'll add the functionality to annotate them with metadata and comments.",
    },
  ];

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text) {
      const range = selection.getRangeAt(0);
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;
      const paragraphElement = range.startContainer.parentNode;

      // Ensure paragraphElement exists
      if (!paragraphElement) {
        selection.removeAllRanges();
        return;
      }

      const paragraphIndex = Array.from(containerRef.current.children).findIndex(
        (p) => p === paragraphElement
      );

      if (paragraphIndex !== -1) {
        const newAnnotation = {
          id: Math.random(),
          text,
          paragraphIndex,
          startOffset,
          endOffset,
          metadata: {
            freeText: "",
            dropdowns: {}, // Initialize as an empty object
          },
        };

        setAnnotations((prev) => [...prev, newAnnotation]);
        setPopupData({
          annotation: newAnnotation,
          top: range.getBoundingClientRect().top + window.scrollY,
          left: range.getBoundingClientRect().left + window.scrollX,
        });
      }

      selection.removeAllRanges(); // Clear selection
    }
  };

  const handleSave = (id, metadata) => {
    setAnnotations((prev) =>
      prev.map((annotation) =>
        annotation.id === id ? { ...annotation, metadata } : annotation
      )
    );
    setPopupData(null); // Close popup
  };

  const handleDelete = (id) => {
    setAnnotations((prev) => prev.filter((annotation) => annotation.id !== id));
    setPopupData(null); // Close popup
  };

  const handleEdit = (annotation) => {
    setPopupData((prev) => ({
      ...prev,
      annotation,
    }));
  };

  const renderTextWithAnnotations = (paragraph, paragraphIndex) => {
    const annotationsInParagraph = annotations.filter(
      (a) => a.paragraphIndex === paragraphIndex
    );

    let currentIndex = 0;
    const parts = [];

    annotationsInParagraph.forEach((annotation) => {
      const { startOffset, endOffset, id, text } = annotation;

      if (startOffset > currentIndex) {
        parts.push(paragraph.text.slice(currentIndex, startOffset));
      }

      parts.push(
        <span
          key={id}
          style={{
            backgroundColor: "lightyellow",
            borderBottom: "2px dotted orange",
            cursor: "pointer",
          }}
          onClick={() => handleEdit(annotation)}
        >
          {text}
        </span>
      );

      currentIndex = endOffset;
    });

    if (currentIndex < paragraph.text.length) {
      parts.push(paragraph.text.slice(currentIndex));
    }

    return parts;
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      style={{
        padding: "20px",
        lineHeight: "1.8",
        backgroundColor: "#f4f4f4",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      {content.map((paragraph, index) => (
        <p key={paragraph.id}>
          {renderTextWithAnnotations(paragraph, index)}
        </p>
      ))}

      {popupData?.annotation && (
        <div
          style={{
            position: "absolute",
            top: popupData.top + 20,
            left: popupData.left,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Dropdowns */}
          {config.dropdowns.map((dropdown, idx) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              <label>
                {dropdown.label}:
                <select
                  value={
                    popupData.annotation.metadata.dropdowns[dropdown.label] || ""
                  }
                  onChange={(e) =>
                    setPopupData((prev) => ({
                      ...prev,
                      annotation: {
                        ...prev.annotation,
                        metadata: {
                          ...prev.annotation.metadata,
                          dropdowns: {
                            ...prev.annotation.metadata.dropdowns,
                            [dropdown.label]: e.target.value,
                          },
                        },
                      },
                    }))
                  }
                  style={{
                    marginLeft: "5px",
                    padding: "5px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="">Select...</option>
                  {dropdown.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}

          {/* Free text box */}
          <textarea
            placeholder="Add metadata or comments"
            value={popupData.annotation.metadata.freeText || ""}
            onChange={(e) =>
              setPopupData((prev) => ({
                ...prev,
                annotation: {
                  ...prev.annotation,
                  metadata: {
                    ...prev.annotation.metadata,
                    freeText: e.target.value,
                  },
                },
              }))
            }
            style={{
              width: "200px",
              height: "80px",
              marginBottom: "10px",
            }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() =>
                handleSave(
                  popupData.annotation.id,
                  popupData.annotation?.metadata
                )
              }
              style={{
                backgroundColor: "green",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={() => handleDelete(popupData.annotation.id)}
              style={{
                backgroundColor: "red",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setPopupData(null)}
              style={{
                backgroundColor: "gray",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextAnnotatorComponent;
